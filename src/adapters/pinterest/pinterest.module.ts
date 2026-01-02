import { Module, OnModuleInit } from '@nestjs/common';
import { PinterestAdapter } from './pinterest.adapter';
import { CoreModule } from '../../core/core.module';
import { AdapterRegistry } from '../../core/adapter.registry';

@Module({
  imports: [CoreModule],
  providers: [PinterestAdapter],
  exports: [PinterestAdapter],
})
export class PinterestModule implements OnModuleInit {
  constructor(
    private readonly registry: AdapterRegistry,
    private readonly adapter: PinterestAdapter,
  ) {}

  onModuleInit() {
    this.registry.register(this.adapter);
  }
}
