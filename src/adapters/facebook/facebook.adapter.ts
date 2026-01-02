import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fbLib from 'fb-downloader-scrapper';
import { PlatformAdapter, VideoMetadata } from '../../core/adapter.interface';

@Injectable()
export class FacebookAdapter extends PlatformAdapter {
  private readonly logger = new Logger(FacebookAdapter.name);
  readonly platformName = 'Facebook';
  readonly domains = ['facebook.com', 'fb.watch', 'web.facebook.com'];
  readonly regexPatterns = [
    /https?:\/\/(www\.|web\.)?facebook\.com\/.+\/videos\/\d+/,
    /https?:\/\/fb\.watch\/.+/,
    /https?:\/\/(www\.|web\.)?facebook\.com\/share\/v\/.+/
  ];

  async extract(url: string): Promise<VideoMetadata> {
    this.logger.log(`Extracting Facebook URL: ${url}`);
    
    try {
      // Fix import
      // Use any cast to avoid type checks hindering runtime exploration if types are wrong
      const getInfo = fbLib.getFbVideoInfo || (fbLib as any).default?.getFbVideoInfo || (fbLib as any).getFbVideoInfo;
       if (typeof getInfo !== 'function') {
         throw new Error(`Library import failed: getFbVideoInfo is ${typeof getInfo}`);
      }

      const response = await getInfo(url);
      
      if (!response || (!response.sd && !response.hd)) {
          throw new Error('No video found via fb-downloader-scrapper.');
      }

      // Prioritize HD
      const videoUrl = response.hd || response.sd;
      const title = response.title || 'Facebook Video';
      const image = response.thumbnail || '';

      return {
        id: 'fb-video', 
        platform: 'Facebook',
        title: title,
        description: '',
        thumbnailUrl: image,
        author: {
           id: 'unknown',
           username: 'facebook_user',
           name: 'Facebook User'
        },
        downloads: [
          {
            resolution: response.hd ? 'High (HD)' : 'Standard (SD)',
            url: videoUrl,
            format: 'mp4',
            size: undefined
          }
        ]
      };

    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Facebook extraction failed: ${msg}`);
      throw new BadRequestException(`Failed to extract Facebook video: ${msg}`);
    }
  }
}
