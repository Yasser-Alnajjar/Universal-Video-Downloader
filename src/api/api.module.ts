import { Module } from '@nestjs/common';
import { ExtractController } from './extract.controller';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [ExtractController],
})
export class ApiModule {}
