import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PhysicsEngineService } from '../physics/physics-engine.service';
import { SimulatorStateService } from '../state/simulator-state.service';
import { TelemetryRecord } from '../models/telemetry-record.model';

@Injectable()
export class TelemetryGeneratorService {
  private readonly wellId: string;
  private readonly noiseEnabled: boolean;
  private startTime: number = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly physicsEngine: PhysicsEngineService,
    private readonly stateService: SimulatorStateService,
  ) {
    this.wellId = this.configService.get<string>('WELL_ID', 'BW-001');
    this.noiseEnabled =
      this.configService.get<string>('NOISE_ENABLED', 'true') !== 'false';
  }

  generateRecord(): TelemetryRecord {
    const state = this.stateService.getState();
    const elapsedSeconds = (Date.now() - this.startTime) / 1000.0;

    // 1. Kinematics
    const kinematics = this.physicsEngine.calculateRodKinematics(
      state.stroke_length_m,
      state.spm,
      elapsedSeconds,
    );

    // 2. Rod load
    const baseRodLoadKn = this.physicsEngine.calculateRodLoad(
      kinematics.rodPositionM,
      kinematics.rodVelocityMps,
      kinematics.rodAccelerationMps2,
      state.stroke_length_m,
      state.tubing_pressure_bar,
      state.fluid_level_m,
      state.viscosity_cp,
      state.spm,
    );

    // 3. Motor current
    const baseMotorCurrentA = this.physicsEngine.calculateMotorCurrent(
      baseRodLoadKn,
      state.spm,
    );

    // 4. Production
    const baseProductionBopd = this.physicsEngine.calculateProductionBopd(
      state.spm,
      state.stroke_length_m,
      state.fluid_level_m,
      state.tubing_pressure_bar,
      state.viscosity_cp,
    );

    // Apply realistic micro-sensor noise if enabled (bounded to +/- 0.5% - 1%)
    const rodLoadKn = this.applyNoise(baseRodLoadKn, 0.005);
    const motorCurrentA = this.applyNoise(baseMotorCurrentA, 0.008);
    const tubingPressureBar = this.applyNoise(state.tubing_pressure_bar, 0.004);
    const productionBopd = this.applyNoise(baseProductionBopd, 0.01);

    // Update dynamic state in the state service
    this.stateService.updateDynamicState(
      this.round(kinematics.rodPositionM, 2),
      this.round(rodLoadKn, 1),
      this.round(motorCurrentA, 1),
      this.round(productionBopd, 1),
    );

    return {
      timestamp: new Date().toISOString(),
      well_id: this.wellId,
      operating_stage: state.operating_stage,
      pump_running: state.pump_running,
      vfd_frequency_hz: this.round(state.vfd_frequency_hz, 1),
      stroke_length_m: this.round(state.stroke_length_m, 2),
      spm: this.round(state.spm, 1),
      rod_position_m: this.round(kinematics.rodPositionM, 2),
      rod_load_kn: this.round(rodLoadKn, 1),
      motor_current_a: this.round(motorCurrentA, 1),
      tubing_pressure_bar: this.round(tubingPressureBar, 1),
      fluid_level_m: this.round(state.fluid_level_m, 1),
      production_bopd: this.round(productionBopd, 1),
      temperature_c: this.round(state.temperature_c, 1),
      viscosity_cp: Math.round(state.viscosity_cp),
    };
  }

  private applyNoise(value: number, percentage: number): number {
    if (!this.noiseEnabled) return value;
    const jitter = (Math.random() * 2 - 1) * percentage * value;
    return value + jitter;
  }

  private round(val: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }
}
