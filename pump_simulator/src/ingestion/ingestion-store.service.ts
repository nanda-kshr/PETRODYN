import { Injectable, Logger } from '@nestjs/common';
import { TelemetryRecord } from '../simulator/models/telemetry-record.model';

@Injectable()
export class IngestionStoreService {
  private readonly logger = new Logger(IngestionStoreService.name);
  private readonly MAX_STORED = 200;
  private readonly records: TelemetryRecord[] = [];

  store(record: TelemetryRecord) {
    if (this.records.length >= this.MAX_STORED) {
      this.records.shift();
    }
    this.records.push(record);
  }

  getRecent(limit = 20): TelemetryRecord[] {
    return this.records.slice(-limit);
  }

  getCount(): number {
    return this.records.length;
  }
}
