import { validateEnv, ENV } from './config/env';
import { getFirebaseAdminApp } from './config/firebase';
import { createApp } from './app';
import { Logger } from './utils/logger';

async function bootstrap() {
  Logger.info('Server', 'Bootstrapping LMS Enterprise Backend V2.0...');

  // 1. Validate environment configurations
  validateEnv();

  // 2. Instantiate Singleton Firebase Admin App
  getFirebaseAdminApp();

  try {
    // 3. Construct Express application
    const app = await createApp();

    // 4. Bind listeners to target Port and Host
    const PORT = ENV.PORT;
    const HOST = '0.0.0.0';

    app.listen(PORT, HOST, () => {
      Logger.info('Server', `LIVINGSTONEEDU backend running dynamically on http://${HOST}:${PORT}`);
    });
  } catch (error: any) {
    Logger.error('Server', 'Bootstrap process encountered a fatal error', error);
    process.exit(1);
  }
}

bootstrap();
