export interface SimulatorConfig {
  port: number;
  wellId: string;
  simulationIntervalMs: number;
  ingestionApiUrl: string;
  simulateTransmissionFailure: boolean;
  noiseEnabled: boolean;
}

export const loadSimulatorConfig = (): SimulatorConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  wellId: process.env.WELL_ID || 'BW-001',
  simulationIntervalMs: parseInt(process.env.SIMULATION_INTERVAL_MS || '250', 10),
  ingestionApiUrl: process.env.INGESTION_API_URL || 'http://localhost:3001/api/v1/ingest',
  simulateTransmissionFailure: process.env.SIMULATE_TRANSMISSION_FAILURE === 'true',
  noiseEnabled: process.env.NOISE_ENABLED !== 'false',
});
