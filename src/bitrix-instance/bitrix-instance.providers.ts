// ESM: mantenha os .js em imports relativos
import { Provider } from '@nestjs/common';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { BitrixInstance } from '@datamize-io/bitrix-lib-node';

export const BITRIX_INSTANCE = Symbol('BITRIX_INSTANCE');

async function fetchSecret(client: SecretManagerServiceClient, name: string): Promise<string> {
  const [version] = await client.accessSecretVersion({ name });
  const payload = version?.payload?.data?.toString('utf8');
  if (!payload) throw new Error(`Secret ${name} vazio/ausente no Secret Manager`);
  return payload;
}

export const BitrixProviders: Provider[] = [
  SecretManagerServiceClient,
  {
    provide: BITRIX_INSTANCE,
    useFactory: async (sm: SecretManagerServiceClient): Promise<BitrixInstance> => {
      console.log('[BitrixProviders] factory iniciada');

      // envs obrigatórias
      const webhookUrl = process.env.BITRIX_WEBHOOK_URL;
      const userIdStr = process.env.BITRIX_WEBHOOK_USER_ID;
      const logInstance = process.env.LOG_BITRIX_LIB?.toLowerCase() == 'true' || false;

      if (!webhookUrl) throw new Error('[Config] BITRIX_WEBHOOK_URL ausente');
      const userId = parseInt(userIdStr ?? '', 10);
      if (Number.isNaN(userId))
        throw new Error('[Config] BITRIX_WEBHOOK_USER_ID ausente/ inválido');

      // resolve o projectId de forma confiável (env -> ADC)
      const envPid = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
      const projectId = envPid || (await sm.getProjectId());
      console.log('[BitrixProviders] projectId resolvido:', projectId);

      // busca token (Secret Manager com fallback para env local)
      let token: string | undefined;
      try {
        const name = `projects/${projectId}/secrets/BITRIX_TOKEN/versions/latest`;
        console.log('[BitrixProviders] buscando segredo + token:', name);
        token = await fetchSecret(sm, name);
      } catch (e) {
        console.warn(
          '[BitrixProviders] falha no Secret Manager, tentando env BITRIX_TOKEN:',
          (e as Error).message,
        );
        token = process.env.BITRIX_TOKEN;
        if (!token) throw new Error('BITRIX_TOKEN indisponível (nem Secret Manager, nem env).');
      }

      if (!token) throw Error('Não foi possível carregar o token da instância Bitrix.');

      const instance = new BitrixInstance({
        b24Url: webhookUrl,
        userId,
        secret: token,
      }).setLog(logInstance);

      console.log(`[BitrixProviders] instância criada, Log = ${logInstance}`);
      return instance;
    },
    inject: [SecretManagerServiceClient],
  },
];
