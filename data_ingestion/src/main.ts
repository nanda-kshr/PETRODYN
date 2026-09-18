import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);

  logger.log(`Data Ingestion Service running on http://localhost:${port}`);
  logger.log(`Ingest Endpoint:  POST http://localhost:${port}/api/v1/ingest`);
  logger.log(`Latest Telemetry: GET  http://localhost:${port}/api/v1/telemetry/latest?well_id=BW-001`);
  logger.log(`Health Check:     GET  http://localhost:${port}/api/v1/health`);
}
bootstrap();
