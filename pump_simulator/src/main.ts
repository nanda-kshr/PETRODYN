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

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`SRP Pump Simulator running on http://localhost:${port}`);
  logger.log(`State Endpoint:     GET  http://localhost:${port}/api/v1/simulator/state`);
  logger.log(`Set Parameter API:  POST http://localhost:${port}/api/v1/simulator/set`);
  logger.log(`Ingestion Endpoint: POST http://localhost:${port}/api/v1/ingest`);
}
bootstrap();
