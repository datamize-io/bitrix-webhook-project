#!/usr/bin/env bash
set -euo pipefail

# =========================
# CONFIG
# =========================
export $(grep -v '^#' .env | xargs)
PROJECT_ID=$GOOGLE_CLOUD_PROJECT

# Região do App Engine (se precisar criar)
APP_ENGINE_REGION="$(gcloud app describe --project "$PROJECT_ID" --format='value(locationId)' 2>/dev/null || echo southamerica-east1)"

# Quem executa o deploy?
# Deixe vazio para usar a Cloud Build SA como "deployer".
# Use "user:seu_email@dominio" se você dispara localmente.
DEPLOYER_PRINCIPAL=""

# =========================
# DERIVADOS
# =========================
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
APPSPOT_SA="${PROJECT_ID}@appspot.gserviceaccount.com"
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
STAGING_BUCKET="staging.${PROJECT_ID}.appspot.com"

echo "Project:        $PROJECT_ID ($PROJECT_NUMBER)"
echo "Appspot SA:     $APPSPOT_SA"
echo "Cloud Build SA: $CB_SA"
echo "Staging bucket: gs://$STAGING_BUCKET"
echo

# =========================
# 0) Habilitar APIs (idempotente)
# =========================
echo "Habilitando APIs necessárias..."
gcloud services enable \
  appengine.googleapis.com \
  cloudbuild.googleapis.com \
  storage.googleapis.com \
  logging.googleapis.com \
  artifactregistry.googleapis.com \
  --project "$PROJECT_ID"

# =========================
# 1) Garantir App Engine app
# =========================
if ! gcloud app describe --project "$PROJECT_ID" >/dev/null 2>&1; then
  echo "Criando App Engine em $APP_ENGINE_REGION..."
  gcloud app create --project "$PROJECT_ID" --region="$APP_ENGINE_REGION"
else
  echo "App Engine já existe."
fi

# =========================
# 2) Garantir bucket de STAGING
#    (gcloud usa 'staging.<project>.appspot.com')
# =========================
if ! gsutil ls -b "gs://${STAGING_BUCKET}" >/dev/null 2>&1; then
  AE_LOC="$(gcloud app describe --project "$PROJECT_ID" --format='value(locationId)')"
  case "$AE_LOC" in
    us-central)           BUCKET_LOC="us-central1" ;;
    europe-west)          BUCKET_LOC="europe-west1" ;;
    asia-northeast)       BUCKET_LOC="asia-northeast1" ;;
    southamerica-east1)   BUCKET_LOC="southamerica-east1" ;;
    *)                    BUCKET_LOC="$AE_LOC" ;;
  esac
  echo "Criando bucket de staging em $BUCKET_LOC..."
  gsutil mb -p "$PROJECT_ID" -l "$BUCKET_LOC" -b on "gs://${STAGING_BUCKET}"
else
  echo "Bucket de staging já existe."
fi

# =========================
# 3) Papéis mínimos no PROJETO
#    - Cloud Build SA: criar builds
#    - Deployer: criar versões do App Engine
#    - Deployer: atuar como a Appspot SA (actAs)
# =========================

echo "Concedendo papéis mínimos no projeto..."

# (3.1) Cloud Build SA pode criar builds
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/cloudbuild.builds.editor" \
  >/dev/null

# (3.2) Quem é o deployer?
DEPLOYER="serviceAccount:${CB_SA}"
if [[ -n "${DEPLOYER_PRINCIPAL}" ]]; then
  DEPLOYER="${DEPLOYER_PRINCIPAL}"
fi

# (3.3) Deployer = App Engine Deployer
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="$DEPLOYER" \
  --role="roles/appengine.deployer" \
  >/dev/null

# (3.4) Deployer pode atuar como a Appspot SA
gcloud iam service-accounts add-iam-policy-binding "$APPSPOT_SA" \
  --member="$DEPLOYER" \
  --role="roles/iam.serviceAccountUser" \
  --project "$PROJECT_ID" \
  >/dev/null

# (3.5) Garantir SAs ativas
gcloud iam service-accounts enable "$APPSPOT_SA" --project "$PROJECT_ID" || true

# =========================
# 4) Permissões no BUCKET DE STAGING (apenas o necessário)
# =========================
echo "Ajustando IAM do bucket de staging..."
gsutil iam ch "serviceAccount:${CB_SA}:roles/storage.objectAdmin"   "gs://${STAGING_BUCKET}"
gsutil iam ch "serviceAccount:${APPSPOT_SA}:roles/storage.objectAdmin" "gs://${STAGING_BUCKET}"

# =========================
# 5) Cloud Logging (quem escreve logs)
# =========================
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${APPSPOT_SA}" \
  --role="roles/logging.logWriter" >/dev/null

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/logging.logWriter" >/dev/null

# =========================
# 6) Artifact Registry (cache do buildpack em us.gcr.io)
#    Necessário: upload + download (writer) para quem roda o build.
# =========================
# Writer para Appspot SA (alguns pipelines de AE rodam como ela)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${APPSPOT_SA}" \
  --role="roles/artifactregistry.writer" >/dev/null

# Writer para Cloud Build SA (cobre o caso do build rodando por ela)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" \
  --role="roles/artifactregistry.writer" >/dev/null

# (Opcional) Listar repositórios na região US (o cache padrão usa us.gcr.io)
gcloud artifacts repositories list --location=us --project "$PROJECT_ID" >/dev/null 2>&1 || true

gcloud secrets add-iam-policy-binding BITRIX_TOKEN \
  --project "$PROJECT_ID" \
  --member="serviceAccount:${APPSPOT_SA}" \
  --role="roles/secretmanager.secretAccessor"

echo
echo "✅ Pronto. Permissões iniciais aplicadas:"
echo "- Cloud Build SA: cloudbuild.builds.editor + logging.logWriter + artifactregistry.writer (projeto)"
echo "- Deployer: appengine.deployer (projeto) + iam.serviceAccountUser sobre ${APPSPOT_SA}"
echo "- Appspot SA: storage.objectAdmin (staging bucket) + logging.logWriter + artifactregistry.writer"
echo "- Bucket de staging criado/ajustado em região compatível com o App Engine"
echo
echo "Agora rode: gcloud app deploy --project ${PROJECT_ID} --verbosity=debug"
read -p "Tecle ENTER para fechar."
