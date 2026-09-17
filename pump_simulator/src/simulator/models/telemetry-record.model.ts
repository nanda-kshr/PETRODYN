export interface TelemetryRecord {
  timestamp: string;
  well_id: string;
  vfd_frequency_hz: number;
  stroke_length_m: number;
  spm: number;
  rod_position_m: number;
  rod_load_kn: number;
  motor_current_a: number;
  tubing_pressure_bar: number;
  fluid_level_m: number;
  production_bopd: number;
  temperature_c: number;
  viscosity_cp: number;
}
