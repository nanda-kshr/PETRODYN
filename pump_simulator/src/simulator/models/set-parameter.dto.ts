import { IsIn, IsNumber } from 'class-validator';

export const ALLOWED_PARAMETERS = [
  'vfd_frequency_hz',
  'stroke_length_m',
  'spm',
  'tubing_pressure_bar',
  'fluid_level_m',
  'temperature_c',
  'viscosity_cp',
] as const;

export type SettableParameter = (typeof ALLOWED_PARAMETERS)[number];

export const PARAMETER_BOUNDS: Record<SettableParameter, { min: number; max: number }> = {
  vfd_frequency_hz: { min: 0.0, max: 75.0 },
  stroke_length_m: { min: 0.5, max: 6.0 },
  spm: { min: 0.0, max: 20.0 },
  tubing_pressure_bar: { min: 0.0, max: 180.0 },
  fluid_level_m: { min: 0.0, max: 1150.0 },
  temperature_c: { min: 10.0, max: 350.0 },
  viscosity_cp: { min: 1.0, max: 100000.0 },
};

export class SetParameterDto {
  @IsIn(ALLOWED_PARAMETERS, {
    message: `parameter must be one of: ${ALLOWED_PARAMETERS.join(', ')}`,
  })
  parameter: SettableParameter;

  @IsNumber({}, { message: 'value must be a valid number' })
  value: number;
}
