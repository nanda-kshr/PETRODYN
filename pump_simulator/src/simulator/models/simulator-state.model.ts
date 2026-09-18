export type OperatingStage = 'STEAM' | 'SOAK' | 'PRODUCTION';

export interface SimulatorState {
  // CSS Lifecycle & Pump Status
  operating_stage: OperatingStage;
  pump_running: boolean;

  // Operating controls
  vfd_frequency_hz: number;
  stroke_length_m: number;
  spm: number;

  // Well measurements / reservoir conditions
  tubing_pressure_bar: number;
  fluid_level_m: number;
  temperature_c: number;
  viscosity_cp: number;

  // Dynamic calculated state
  rod_position_m: number;
  rod_load_kn: number;
  motor_current_a: number;
  production_bopd: number;

  // Internal flags to track manual overrides vs auto-calculated
  manualSpmOverride: boolean;
  manualViscosityOverride: boolean;
}

export const DEFAULT_SIMULATOR_STATE: SimulatorState = {
  operating_stage: 'PRODUCTION',
  pump_running: true,
  vfd_frequency_hz: 40.0,
  stroke_length_m: 2.5,
  spm: 5.5,
  rod_position_m: 1.25,
  rod_load_kn: 145.2,
  motor_current_a: 72.4,
  tubing_pressure_bar: 18.5,
  fluid_level_m: 850.0,
  production_bopd: 31.4,
  temperature_c: 50.0,
  viscosity_cp: 12000,
  manualSpmOverride: false,
  manualViscosityOverride: false,
};
