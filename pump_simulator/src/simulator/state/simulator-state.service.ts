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
          this.state.spm = this.physicsEngine.calculateSpmFromVfd(value);
          this.logger.log(
            `VFD changed -> auto-updated spm to ${this.state.spm} (was ${oldSpm})`,
          );
        }
        break;

      case 'spm':
        this.state.spm = value;
        this.state.manualSpmOverride = true;
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
}
