import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SimulatorStateService } from '../state/simulator-state.service';
import { SimulatorLoopService } from '../simulator-loop.service';
import { IngestionClientService } from '../../ingestion/ingestion-client.service';
import { SetParameterDto } from '../models/set-parameter.dto';

@Controller('api/v1/simulator')
export class SimulatorController {
  constructor(
    private readonly stateService: SimulatorStateService,
    private readonly loopService: SimulatorLoopService,
    private readonly ingestionClient: IngestionClientService,
  ) {}

  /**
   * Reads current simulator state
   */
  @Get('state')
  getState() {
    const state = this.stateService.getState();
    return {
      vfd_frequency_hz: state.vfd_frequency_hz,
      stroke_length_m: state.stroke_length_m,
      spm: state.spm,
      rod_position_m: state.rod_position_m,
      rod_load_kn: state.rod_load_kn,
      motor_current_a: state.motor_current_a,
      tubing_pressure_bar: state.tubing_pressure_bar,
      fluid_level_m: state.fluid_level_m,
      production_bopd: state.production_bopd,
      temperature_c: state.temperature_c,
      viscosity_cp: state.viscosity_cp,
    };
  }

  /**
   * Sets any simulator parameter at runtime with validation
   */
  @Post('set')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  setParameter(@Body() dto: SetParameterDto) {
    const updatedState = this.stateService.setParameter(
      dto.parameter,
      dto.value,
    );
    return {
      success: true,
      message: `Parameter '${dto.parameter}' successfully updated to ${dto.value}`,
      state: {
        vfd_frequency_hz: updatedState.vfd_frequency_hz,
        stroke_length_m: updatedState.stroke_length_m,
        spm: updatedState.spm,
        rod_position_m: updatedState.rod_position_m,
        rod_load_kn: updatedState.rod_load_kn,
        motor_current_a: updatedState.motor_current_a,
        tubing_pressure_bar: updatedState.tubing_pressure_bar,
        fluid_level_m: updatedState.fluid_level_m,
        production_bopd: updatedState.production_bopd,
        temperature_c: updatedState.temperature_c,
        viscosity_cp: updatedState.viscosity_cp,
      },
    };
  }

  /**
   * Starts simulation loop
   */
  @Post('start')
  @HttpCode(HttpStatus.OK)
  startSimulation() {
    const started = this.loopService.start();
    return {
      success: true,
      running: this.loopService.isRunning(),
      message: started
        ? 'Simulator loop started'
        : 'Simulator loop was already running',
    };
  }

  /**
   * Stops simulation loop
   */
  @Post('stop')
  @HttpCode(HttpStatus.OK)
  stopSimulation() {
    const stopped = this.loopService.stop();
    return {
      success: true,
      running: this.loopService.isRunning(),
      message: stopped
        ? 'Simulator loop stopped'
        : 'Simulator loop was already stopped',
    };
  }

  /**
   * Returns simulation loop running status
   */
  @Get('status')
  getStatus() {
    return {
      running: this.loopService.isRunning(),
      interval_ms: this.loopService.getIntervalMs(),
      ingestion_url: this.ingestionClient.getIngestionUrl(),
      simulating_failure: this.ingestionClient.isSimulatingFailure(),
    };
  }

  /**
   * Configures simulated transmission failure for testing
   */
  @Post('simulate-failure')
  @HttpCode(HttpStatus.OK)
  simulateFailure(@Body('enabled') enabled: boolean) {
    this.ingestionClient.setSimulateFailure(Boolean(enabled));
    return {
      success: true,
      simulating_failure: this.ingestionClient.isSimulatingFailure(),
    };
  }
}
