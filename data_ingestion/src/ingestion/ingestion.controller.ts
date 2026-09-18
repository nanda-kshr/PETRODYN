import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';

@Controller('api/v1')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async ingest(@Body() dto: IngestTelemetryDto) {
    const result = await this.ingestionService.ingest(dto);
    return {
      success: true,
      id: result.id,
      anomalies: result.anomalies,
    };
  }

  @Get('telemetry/latest')
  async getLatest(@Query('well_id') wellId?: string) {
    const record = await this.ingestionService.getLatest(wellId);
    return {
      success: true,
      data: record,
    };
  }

  @Get('telemetry/history')
  async getHistory(
    @Query('well_id') wellId: string,
    @Query('limit') limit?: number,
  ) {
    const parsedLimit = limit ? Number(limit) : 50;
    const records = await this.ingestionService.getHistory(wellId, parsedLimit);
    return {
      success: true,
      count: records.length,
      data: records,
    };
  }

  @Get('telemetry/stats')
  async getStats() {
    const stats = await this.ingestionService.getStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'data_ingestion',
      timestamp: new Date().toISOString(),
    };
  }
}
