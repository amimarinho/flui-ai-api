import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

try {
  process.loadEnvFile();
} catch {
  // The process environment is enough when .env is absent.
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin(
      requestOrigin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      if (
        !requestOrigin ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
