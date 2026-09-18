import { IsString, IsNumber, IsOptional } from 'class-validator';

export class IngestTelemetryDto {
  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsString()
  well_id: string;

  @IsNumber()
  vfd_frequency_hz: number;

  @IsNumber()
  stroke_length_m: number;

  @IsNumber()
  spm: number;

  @IsNumber()
  rod_position_m: number;

  @IsNumber()
  rod_load_kn: number;

  @IsNumber()
  motor_current_a: number;

  @IsNumber()
  tubing_pressure_bar: number;

  @IsNumber()
  fluid_level_m: number;

  @IsNumber()
  production_bopd: number;

  @IsNumber()
  temperature_c: number;

  @IsNumber()
  viscosity_cp: number;
}
