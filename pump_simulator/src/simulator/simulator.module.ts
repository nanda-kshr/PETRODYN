import { Module } from '@nestjs/common';
import { PhysicsEngineService } from './physics/physics-engine.service';
import { SimulatorStateService } from './state/simulator-state.service';
import { TelemetryGeneratorService } from './generators/telemetry-generator.service';
import { SimulatorLoopService } from './simulator-loop.service';
import { SimulatorController } from './api/simulator.controller';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
  controllers: [SimulatorController],
  providers: [
    PhysicsEngineService,
    SimulatorStateService,
    TelemetryGeneratorService,
    SimulatorLoopService,
  ],
  exports: [SimulatorStateService, SimulatorLoopService],
})
export class SimulatorModule {}
