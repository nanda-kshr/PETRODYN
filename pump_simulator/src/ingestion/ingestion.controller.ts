import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get } from '@nestjs/common';
import { IngestionStoreService } from './ingestion-store.service';
import { TelemetryRecord } from '../simulator/models/telemetry-record.model';

@Controller('api/v1/ingest')
export class IngestionController {
  private readonly logger = new Logger(IngestionController.name);

  constructor(private readonly storeService: IngestionStoreService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  ingest(@Body() record: TelemetryRecord) {
    this.logger.debug(
      `Received telemetry for ${record.well_id || 'unknown'} @ ${record.timestamp}: SPM=${record.spm}, Load=${record.rod_load_kn}kN, BOPD=${record.production_bopd}`,
    );
    this.storeService.store(record);
    return {
      success: true,
    };
  }

  @Get('records')
  getRecentRecords() {
    return {
      count: this.storeService.getCount(),
      recent: this.storeService.getRecent(),
    };
  }
}
