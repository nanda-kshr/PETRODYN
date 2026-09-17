import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IngestionController } from './ingestion.controller';
import { IngestionStoreService } from './ingestion-store.service';
import { IngestionClientService } from './ingestion-client.service';

@Module({
  imports: [HttpModule],
  controllers: [IngestionController],
  providers: [IngestionStoreService, IngestionClientService],
  exports: [IngestionClientService, IngestionStoreService],
})
export class IngestionModule {}
