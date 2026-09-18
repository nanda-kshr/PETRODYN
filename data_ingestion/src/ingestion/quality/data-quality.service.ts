import { Injectable } from '@nestjs/common';
import { IngestTelemetryDto } from '../dto/ingest-telemetry.dto';
import { DataQualityMetadata } from '../schemas/telemetry.schema';

@Injectable()
export class DataQualityService {
  validate(dto: IngestTelemetryDto): DataQualityMetadata {
    const anomalies: string[] = [];

    // 1. Boundary & Plausibility Checks
    if (dto.vfd_frequency_hz < 0 || dto.vfd_frequency_hz > 100) {
      anomalies.push(`vfd_frequency_hz out of range [0, 100]: ${dto.vfd_frequency_hz}`);
    }
    if (dto.stroke_length_m <= 0 || dto.stroke_length_m > 10) {
      anomalies.push(`stroke_length_m out of range (0, 10]: ${dto.stroke_length_m}`);
    }
    if (dto.spm < 0 || dto.spm > 30) {
      anomalies.push(`spm out of range [0, 30]: ${dto.spm}`);
    }
    if (dto.rod_load_kn < 0 || dto.rod_load_kn > 300) {
      anomalies.push(`rod_load_kn out of range [0, 300]: ${dto.rod_load_kn}`);
    }
    if (dto.motor_current_a < 0 || dto.motor_current_a > 250) {
      anomalies.push(`motor_current_a out of range [0, 250]: ${dto.motor_current_a}`);
    }
    if (dto.tubing_pressure_bar < 0 || dto.tubing_pressure_bar > 200) {
      anomalies.push(`tubing_pressure_bar out of range [0, 200]: ${dto.tubing_pressure_bar}`);
    }
    if (dto.fluid_level_m < 0 || dto.fluid_level_m > 1500) {
      anomalies.push(`fluid_level_m out of range [0, 1500]: ${dto.fluid_level_m}`);
    }
    if (dto.production_bopd < 0) {
      anomalies.push(`production_bopd cannot be negative: ${dto.production_bopd}`);
    }
    if (dto.temperature_c < 0 || dto.temperature_c > 400) {
      anomalies.push(`temperature_c out of range [0, 400]: ${dto.temperature_c}`);
    }
    if (dto.viscosity_cp <= 0) {
      anomalies.push(`viscosity_cp must be positive: ${dto.viscosity_cp}`);
    }

    const isValid = anomalies.length === 0;
    const penaltyPerAnomaly = 25;
    const sensorHealthScore = Math.max(0, 100 - anomalies.length * penaltyPerAnomaly);

    return {
      is_valid: isValid,
      anomalies,
      sensor_health_score: sensorHealthScore,
    };
  }
}
