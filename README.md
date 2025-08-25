1. Clone o projeto
2. Crie um projeto no Google Cloud
3. Habilite o faturamento do projeto
4. Configure .env e app.yaml
5. Rode o script .\gcloud\appengine-permissions.sh para configurar e habilitar todas permissões necessárias
6. Crie o token via Google Cli com: printf "<tokenId>" | gcloud secrets versions add BITRIX_TOKEN --project "<projectId>" --data-file=-
7. Rode no CLI npm install
8. Faça o deploy com "gcloud app deploy"
