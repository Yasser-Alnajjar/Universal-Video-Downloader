import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as instagramLib from 'instagram-url-direct';
import { PlatformAdapter, VideoMetadata, VideoQuality } from '../../core/adapter.interface';

@Injectable()
export class InstagramAdapter extends PlatformAdapter {
  private readonly logger = new Logger(InstagramAdapter.name);
  readonly platformName = 'Instagram';
  readonly domains = ['instagram.com', 'instagr.am'];
  readonly regexPatterns = [
    /https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv)\/[\w-]+\/?/,
  ];

  async extract(url: string): Promise<VideoMetadata> {
    this.logger.log(`Extracting Instagram URL: ${url}`);
    
    try {
      // Library import fix
      const getUrl = instagramLib.instagramGetUrl || (instagramLib as any).default?.instagramGetUrl || (instagramLib as any).default;
      if (typeof getUrl !== 'function') {
         throw new Error(`Library import failed: instagramGetUrl is ${typeof getUrl}`);
      }
      
      const response = await getUrl(url);
      
      if (!response || !response.url_list || response.url_list.length === 0) {
          throw new Error('No video found via instagram-url-direct.');
      }

      // The library returns an object with `results_number`, `url_list` (array)
      // url_list items usually are just strings (urls)
      const videoUrl = response.url_list[0];

      return {
        id: this.extractId(url),
        platform: 'Instagram',
        title: 'Instagram Video', // Library might not return metadata like title, use default
        description: '',
        thumbnailUrl: '', // Library might not return auth
        author: {
           id: 'unknown',
           username: 'instagram_user',
           name: 'Instagram User' 
        },
        downloads: [
          {
            resolution: 'Original',
            url: videoUrl,
            format: 'mp4',
            size: undefined
          }
        ]
      };

    } catch (e) {
      this.logger.error(`Instagram extraction failed: ${e.message}`);
      throw new BadRequestException(`Failed to extract Instagram video: ${e.message}`);
    }
  }

  private extractId(url: string): string {
    const match = url.match(/\/(p|reel|tv)\/([\w-]+)/);
    return match ? match[2] : 'unknown';
  }
}
