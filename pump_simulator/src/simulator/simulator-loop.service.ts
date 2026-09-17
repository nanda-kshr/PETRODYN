import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelemetryGeneratorService } from './generators/telemetry-generator.service';
import { IngestionClientService } from '../ingestion/ingestion-client.service';
import { TelemetryRecord } from './models/telemetry-record.model';

@Injectable()
export class SimulatorLoopService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SimulatorLoopService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private intervalMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly generator: TelemetryGeneratorService,
    private readonly ingestionClient: IngestionClientService,
  ) {
    this.intervalMs = parseInt(
      this.configService.get<string>('SIMULATION_INTERVAL_MS', '250'),
      10,
    );
  }

  onModuleInit() {
    this.start();
  }

  onModuleDestroy() {
    this.stop();
  }

  start(): boolean {
    if (this.running) {
      this.logger.warn('Simulator loop is already running.');
      return false;
    }
    this.running = true;
    this.logger.log(
      `Starting SRP Simulator loop with interval ${this.intervalMs} ms...`,
    );
    this.timer = setInterval(() => this.step(), this.intervalMs);
    return true;
  }

  stop(): boolean {
    if (!this.running) {
      this.logger.warn('Simulator loop is already stopped.');
      return false;
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    this.logger.log('Stopped SRP Simulator loop.');
    return true;
  }

  isRunning(): boolean {
    return this.running;
  }

  getIntervalMs(): number {
    return this.intervalMs;
  }

  setIntervalMs(ms: number) {
    this.intervalMs = ms;
    if (this.running) {
      this.stop();
      this.start();
    }
  }

  /**
   * Executes a single simulation step
   */
  async step(): Promise<TelemetryRecord> {
    const record = this.generator.generateRecord();
    this.logger.debug(
      `Generated: ${record.well_id} | SPM=${record.spm} | Pos=${record.rod_position_m}m | Load=${record.rod_load_kn}kN | Curr=${record.motor_current_a}A | BOPD=${record.production_bopd}`,
    );

    // Transmit to Ingestion API
    await this.ingestionClient.send(record);
    return record;
  }
}
