import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TelemetryRecord } from '../simulator/models/telemetry-record.model';

@Injectable()
export class IngestionClientService {
  private readonly logger = new Logger(IngestionClientService.name);
  private ingestionUrl: string;
  private simulateFailure: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.ingestionUrl = this.configService.get<string>(
      'INGESTION_API_URL',
      'http://localhost:3001/api/v1/ingest',
    );
    this.simulateFailure =
      this.configService.get<string>('SIMULATE_TRANSMISSION_FAILURE', 'false') ===
      'true';
  }

  setIngestionUrl(url: string) {
    this.ingestionUrl = url;
    this.logger.log(`Ingestion URL updated to: ${url}`);
  }

  getIngestionUrl(): string {
    return this.ingestionUrl;
  }

  setSimulateFailure(fail: boolean) {
    this.simulateFailure = fail;
    this.logger.log(`Simulate transmission failure set to: ${fail}`);
  }

  isSimulatingFailure(): boolean {
    return this.simulateFailure;
  }

  async send(record: TelemetryRecord): Promise<boolean> {
    this.logger.debug(
      `Attempting ingestion transmission to ${this.ingestionUrl} for ${record.well_id}...`,
    );

    if (this.simulateFailure) {
      this.logger.warn(
        `[SIMULATED FAILURE] Ingestion transmission deliberately blocked to ${this.ingestionUrl}`,
      );
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.ingestionUrl, record, {
          timeout: 2000,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      if (response.status >= 200 && response.status < 300) {
        this.logger.debug(`Ingestion transmitted successfully.`);
        return true;
      } else {
        this.logger.warn(
          `Ingestion received non-200 status code: ${response.status}`,
        );
        return false;
      }
    } catch (err) {
      this.logger.error(
        `Ingestion transmission failure to ${this.ingestionUrl}: ${err.message}`,
      );
      return false;
    }
  }
}
