import { Module, OnModuleInit } from '@nestjs/common';
import { TwitterAdapter } from './twitter.adapter';
import { CoreModule } from '../../core/core.module';
import { AdapterRegistry } from '../../core/adapter.registry';

@Module({
  imports: [CoreModule],
  providers: [TwitterAdapter],
  exports: [TwitterAdapter],
})
export class TwitterModule implements OnModuleInit {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly adapter: TwitterAdapter,
  ) {}

  onModuleInit() {
    this.registry.register(this.adapter);
  }
}
