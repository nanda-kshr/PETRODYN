import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadSimulatorConfig } from './config/simulator.config';
import { SimulatorModule } from './simulator/simulator.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadSimulatorConfig],
    }),
    IngestionModule,
    SimulatorModule,
  ],
})
export class AppModule {}
