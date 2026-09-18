import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Telemetry, TelemetryDocument } from './schemas/telemetry.schema';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { DataQualityService } from './quality/data-quality.service';

import { IngestionGateway } from './ingestion.gateway';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectModel(Telemetry.name)
    private readonly telemetryModel: Model<TelemetryDocument>,
    private readonly dataQualityService: DataQualityService,
    private readonly gateway: IngestionGateway,
  ) {}

  async ingest(dto: IngestTelemetryDto): Promise<{ success: boolean; id?: string; anomalies?: string[] }> {
    const quality = this.dataQualityService.validate(dto);

    if (!quality.is_valid) {
      this.logger.warn(
        `Data quality issues on well ${dto.well_id}: ${quality.anomalies.join('; ')}`,
      );
    }

    const timestamp = dto.timestamp ? new Date(dto.timestamp) : new Date();

    const record = new this.telemetryModel({
      ...dto,
      timestamp,
      quality,
    });

    const saved = await record.save();
    this.logger.debug(
      `Saved telemetry for ${dto.well_id} @ ${timestamp.toISOString()} [ID: ${saved._id}]`,
    );

    // Broadcast over WebSocket to dashboard in real-time
    try {
      this.gateway.broadcastTelemetry(saved.toObject ? saved.toObject() : saved);
    } catch (err) {
      this.logger.error(`Failed to broadcast telemetry via WebSocket: ${err.message}`);
    }

    return {
      success: true,
      id: saved._id.toString(),
      anomalies: quality.anomalies,
    };
  }

  async getLatest(wellId?: string): Promise<TelemetryDocument | null> {
    const filter = wellId ? { well_id: wellId } : {};
    return this.telemetryModel.findOne(filter).sort({ timestamp: -1 }).exec();
  }

  async getHistory(wellId: string, limit = 50): Promise<TelemetryDocument[]> {
    const clampedLimit = Math.min(500, Math.max(1, limit));
    return this.telemetryModel
      .find({ well_id: wellId })
      .sort({ timestamp: -1 })
      .limit(clampedLimit)
      .exec();
  }

  async getStats(): Promise<{ total_records: number; wells: string[]; latest_timestamp?: Date }> {
    const [total_records, wells, latestRecord] = await Promise.all([
      this.telemetryModel.countDocuments().exec(),
      this.telemetryModel.distinct('well_id').exec(),
      this.telemetryModel.findOne().sort({ timestamp: -1 }).select('timestamp').exec(),
    ]);

    return {
      total_records,
      wells,
      latest_timestamp: latestRecord?.timestamp,
    };
  }
}
