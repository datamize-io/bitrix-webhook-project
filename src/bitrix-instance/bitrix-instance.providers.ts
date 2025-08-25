// src/bitrix-instance/bitrix-instance.providers.ts
import { Provider } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { BitrixInstance } from '@datamize-io/bitrix-lib-node';

// ✅ Token com nome diferente da classe
export const BITRIX_INSTANCE = Symbol('BITRIX_INSTANCE');

async function fetchSecret(client: SecretManagerServiceClient, name: string): Promise<string> {
  const [version] = await client.accessSecretVersion({ name });
  const payload = version?.payload?.data?.toString('utf8');
  if (!payload) throw new Error(`Secret ${name} vazio/ausente no Secret Manager`);
  return payload;
}

export const BitrixProviders: Provider[] = [
  // Disponibiliza o SecretManager para DI (útil na factory)
  SecretManagerServiceClient,

  // Provider principal da instância
  {
    provide: BITRIX_INSTANCE,
    useFactory: async (sm: SecretManagerServiceClient): Promise<BitrixInstance> => {
      // ---- Validação de envs obrigatórias
      const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
      const userIdStr = process.env.BITRIX_WEBHOOK_USER_ID;
      const projectId = process.env.GOOGLE_CLOUD_PROJECT;
      const logInstance = Boolean(process.env.LOG_BITRIX_LIB) || false;

      if (!webhookUrl) {
        throw new Error(
          '[Config] BITRIX_WEBHOOK_URL ausente (defina em app.yaml -> env_variables)',
        );
      }
      if (!userIdStr || Number.isNaN(parseInt(userIdStr, 10))) {
        throw new Error('[Config] BITRIX_WEBHOOK_USER_ID ausente/ inválido');
      }

      // ---- Token: Secret Manager (com fallback DEV)
      let token: string | undefined;
      if (projectId) {
        const name = `projects/${projectId}/secrets/BITRIX_TOKEN/versions/latest`;
        token = await fetchSecret(sm, name);
      } else {
        token = process.env.BITRIX_TOKEN; // somente DEV
        if (!token) {
          throw new Error('[Config] Em dev local, defina BITRIX_TOKEN no .env');
        }
      }

      const instance = new BitrixInstance({
        b24Url: webhookUrl,
        userId: parseInt(userIdStr!, 10),
        secret: token!,
      });

      return instance.setLog(logInstance);
    },
    inject: [SecretManagerServiceClient],
  },
];
