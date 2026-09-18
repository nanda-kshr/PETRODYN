import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  SimulatorState,
  DEFAULT_SIMULATOR_STATE,
} from '../models/simulator-state.model';
import {
  SettableParameter,
  PARAMETER_BOUNDS,
} from '../models/set-parameter.dto';
import { PhysicsEngineService } from '../physics/physics-engine.service';

@Injectable()
export class SimulatorStateService {
  private readonly logger = new Logger(SimulatorStateService.name);
  private state: SimulatorState = { ...DEFAULT_SIMULATOR_STATE };

  constructor(private readonly physicsEngine: PhysicsEngineService) {}

  getState(): Readonly<SimulatorState> {
    return { ...this.state };
  }

  setParameter(parameter: SettableParameter, value: number): SimulatorState {
    const bounds = PARAMETER_BOUNDS[parameter];
    if (value < bounds.min || value > bounds.max) {
      throw new BadRequestException(
        `Value for '${parameter}' must be between ${bounds.min} and ${bounds.max}`,
      );
    }

    const previousValue = this.state[parameter];
    this.logger.log(
      `Parameter change: ${parameter} = ${value} (was ${previousValue})`,
    );

    switch (parameter) {
      case 'vfd_frequency_hz':
        this.state.vfd_frequency_hz = value;
        // If SPM is not manually pinned, calculate SPM from new VFD frequency
        if (!this.state.manualSpmOverride) {
          const oldSpm = this.state.spm;
          this.state.spm = value <= 0.05 ? 0.0 : this.physicsEngine.calculateSpmFromVfd(value);
          this.state.pump_running = this.state.spm > 0.05;
          this.logger.log(
            `VFD changed -> auto-updated spm to ${this.state.spm} (was ${oldSpm})`,
          );
        }
        break;

      case 'spm':
        this.state.spm = value;
        this.state.manualSpmOverride = true;
        this.state.pump_running = value > 0.05;
        if (value > 0.05 && this.state.operating_stage !== 'PRODUCTION') {
          this.state.operating_stage = 'PRODUCTION';
        }
        break;

      case 'temperature_c':
        this.state.temperature_c = value;
        // If viscosity is not manually pinned, recalculate from temperature
        if (!this.state.manualViscosityOverride) {
          const oldVisc = this.state.viscosity_cp;
          this.state.viscosity_cp =
            this.physicsEngine.calculateViscosityFromTemperature(value);
          this.logger.log(
            `Temperature changed -> auto-updated viscosity_cp to ${this.state.viscosity_cp} (was ${oldVisc})`,
          );
        }
        break;

      case 'viscosity_cp':
        this.state.viscosity_cp = value;
        this.state.manualViscosityOverride = true;
        break;

      case 'stroke_length_m':
        this.state.stroke_length_m = value;
        break;

      case 'tubing_pressure_bar':
        this.state.tubing_pressure_bar = value;
        break;

      case 'fluid_level_m':
        this.state.fluid_level_m = value;
        break;
    }

    return this.getState();
  }

  updateDynamicState(
    rodPositionM: number,
    rodLoadKn: number,
    motorCurrentA: number,
    productionBopd: number,
  ) {
    this.state.rod_position_m = rodPositionM;
    this.state.rod_load_kn = rodLoadKn;
    this.state.motor_current_a = motorCurrentA;
    this.state.production_bopd = productionBopd;
  }

  /**
   * Applies a Cyclic Steam Stimulation (CSS) stage:
   * - STEAM (Huff): Pump STOPPED (0 SPM), superheated steam downhole (280°C, 125 bar), viscosity collapses (~20 cP), BOPD = 0
   * - SOAK: Pump STOPPED (0 SPM), shut-in soaking into formation (160°C, 45 bar), BOPD = 0
   * - PRODUCTION (Puff): Pump RUNNING (5.5 SPM, 40 Hz), hot flush production (85°C, 18.5 bar, ~48.5 BOPD)
   */
  applyCssStage(stage: string): SimulatorState {
    const s = stage.toUpperCase();
    switch (s) {
      case 'STEAM':
      case 'INJECT':
      case 'HUFF':
        this.state.operating_stage = 'STEAM';
        this.state.pump_running = false;
        this.state.spm = 0.0;
        this.state.vfd_frequency_hz = 0.0;
        this.state.manualSpmOverride = true;
        this.state.temperature_c = 280.0;
        this.state.tubing_pressure_bar = 125.0;
        this.state.viscosity_cp = this.physicsEngine.calculateViscosityFromTemperature(280.0);
        this.state.manualViscosityOverride = false;
        this.logger.log(`CSS Stage applied: STEAM (Huff) - Pump stopped, 280°C, 125 bar, ${this.state.viscosity_cp} cP`);
        break;

      case 'SOAK':
        this.state.operating_stage = 'SOAK';
        this.state.pump_running = false;
        this.state.spm = 0.0;
        this.state.vfd_frequency_hz = 0.0;
        this.state.manualSpmOverride = true;
        this.state.temperature_c = 160.0;
        this.state.tubing_pressure_bar = 45.0;
        this.state.viscosity_cp = this.physicsEngine.calculateViscosityFromTemperature(160.0);
        this.state.manualViscosityOverride = false;
        this.logger.log(`CSS Stage applied: SOAK - Pump stopped, 160°C, 45 bar, ${this.state.viscosity_cp} cP`);
        break;

      case 'PRODUCTION':
      case 'PRODUCE':
      case 'PUFF':
        this.state.operating_stage = 'PRODUCTION';
        this.state.pump_running = true;
        this.state.spm = 5.5;
        this.state.vfd_frequency_hz = 40.0;
        this.state.manualSpmOverride = false;
        this.state.temperature_c = 85.0;
        this.state.tubing_pressure_bar = 18.5;
        this.state.viscosity_cp = this.physicsEngine.calculateViscosityFromTemperature(85.0);
        this.state.manualViscosityOverride = false;
        this.logger.log(`CSS Stage applied: PRODUCTION (Puff) - Pump restarted 5.5 SPM, 85°C, 18.5 bar, ${this.state.viscosity_cp} cP`);
        break;

      default:
        throw new BadRequestException(`Unknown CSS stage: '${stage}'. Allowed: STEAM, SOAK, PRODUCTION`);
    }

    return this.getState();
  }
}
