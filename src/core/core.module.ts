import { Module } from '@nestjs/common';
import { AdapterRegistry } from './adapter.registry';
import { ExtractionService } from './extraction.service';

@Module({
  providers: [AdapterRegistry, ExtractionService],
  exports: [ExtractionService, AdapterRegistry],
})
export class CoreModule {}
