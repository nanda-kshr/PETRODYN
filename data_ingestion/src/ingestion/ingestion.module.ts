import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { DataQualityService } from './quality/data-quality.service';
import { Telemetry, TelemetrySchema } from './schemas/telemetry.schema';

import { IngestionGateway } from './ingestion.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Telemetry.name, schema: TelemetrySchema },
    ]),
  ],
  controllers: [IngestionController],
  providers: [IngestionService, DataQualityService, IngestionGateway],
  exports: [IngestionService, DataQualityService, IngestionGateway],
})
export class IngestionModule {}
