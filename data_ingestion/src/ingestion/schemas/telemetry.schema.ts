import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TelemetryDocument = Telemetry & Document;

@Schema({ _id: false })
export class DataQualityMetadata {
  @Prop({ default: true })
  is_valid: boolean;

  @Prop({ type: [String], default: [] })
  anomalies: string[];

  @Prop({ default: 100 })
  sensor_health_score: number;
}

@Schema({
  collection: 'telemetry_records',
  timestamps: { createdAt: 'received_at', updatedAt: false },
})
export class Telemetry {
  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ required: true, index: true })
  well_id: string;

  @Prop({ required: true })
  vfd_frequency_hz: number;

  @Prop({ required: true })
  stroke_length_m: number;

  @Prop({ required: true })
  spm: number;

  @Prop({ required: true })
  rod_position_m: number;

  @Prop({ required: true })
  rod_load_kn: number;

  @Prop({ required: true })
  motor_current_a: number;

  @Prop({ required: true })
  tubing_pressure_bar: number;

  @Prop({ required: true })
  fluid_level_m: number;

  @Prop({ required: true })
  production_bopd: number;

  @Prop({ required: true })
  temperature_c: number;

  @Prop({ required: true })
  viscosity_cp: number;

  @Prop({ type: DataQualityMetadata, default: () => ({}) })
  quality: DataQualityMetadata;
}

export const TelemetrySchema = SchemaFactory.createForClass(Telemetry);

// Compound index for efficient time-series queries per well
TelemetrySchema.index({ well_id: 1, timestamp: -1 });
