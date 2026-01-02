import { Module, OnModuleInit } from '@nestjs/common';
import { YoutubeAdapter } from './youtube.adapter';
import { AdapterRegistry } from '../../core/adapter.registry';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [CoreModule],
  providers: [YoutubeAdapter],
  exports: [YoutubeAdapter],
})
export class YoutubeModule implements OnModuleInit {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly adapter: YoutubeAdapter,
  ) {}

  onModuleInit() {
    this.registry.register(this.adapter);
  }
}
