import { Module, OnModuleInit } from '@nestjs/common';
import { FacebookAdapter } from './facebook.adapter';
import { CoreModule } from '../../core/core.module';
import { AdapterRegistry } from '../../core/adapter.registry';

@Module({
  imports: [CoreModule],
  providers: [FacebookAdapter],
  exports: [FacebookAdapter],
})
export class FacebookModule implements OnModuleInit {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly adapter: FacebookAdapter,
  ) {}

  onModuleInit() {
    this.registry.register(this.adapter);
  }
}
