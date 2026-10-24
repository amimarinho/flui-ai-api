import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  const config = new DocumentBuilder()
    .setTitle('Flui AI API')
    .setDescription(
      'Looks up electric-car charging, coffee, and gas stations. POST /ask classifies a question with Gemini, then returns the matching places. GET /places skips classification and takes the category directly. Results stay within 2 km. Coordinates more than 2 km from ARCA in São Paulo (−23.5358, −46.7454) are searched from that point instead.',
    )
    .setVersion('0.0.1')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config), {
    customSiteTitle: 'Flui AI API',
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
