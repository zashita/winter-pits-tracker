import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()).filter(Boolean);
  if (allowedOrigins?.length) app.enableCors({ origin: allowedOrigins });
  app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(Number(process.env.PORT || 4000), '0.0.0.0');
}
bootstrap();
