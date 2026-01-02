import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { TwitterModule } from './adapters/twitter/twitter.module';
import { InstagramModule } from './adapters/instagram/instagram.module';
import { FacebookModule } from './adapters/facebook/facebook.module';
import { PinterestModule } from './adapters/pinterest/pinterest.module';
import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { YoutubeModule } from './adapters/youtube/youtube.module';

@Module({
  imports: [
    CoreModule,
    TwitterModule,
    InstagramModule,
    FacebookModule,
    PinterestModule,
    YoutubeModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
