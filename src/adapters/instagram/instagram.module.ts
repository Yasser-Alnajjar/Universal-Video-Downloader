import { Module, OnModuleInit } from '@nestjs/common';
import { InstagramAdapter } from './instagram.adapter';
import { CoreModule } from '../../core/core.module';
import { AdapterRegistry } from '../../core/adapter.registry';

@Module({
  imports: [CoreModule],
  providers: [InstagramAdapter],
  exports: [InstagramAdapter],
})
export class InstagramModule implements OnModuleInit {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly adapter: InstagramAdapter,
  ) {}

  onModuleInit() {
    this.registry.register(this.adapter);
  }
}
