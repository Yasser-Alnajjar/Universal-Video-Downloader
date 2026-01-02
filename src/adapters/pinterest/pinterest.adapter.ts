import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { PlatformAdapter, VideoMetadata } from '../../core/adapter.interface';

@Injectable()
export class PinterestAdapter extends PlatformAdapter {
  private readonly logger = new Logger(PinterestAdapter.name);
  readonly platformName = 'Pinterest';
  readonly domains = ['pinterest.com', 'pin.it'];
  readonly regexPatterns = [
    /https?:\/\/(www\.)?pinterest\.com\/pin\/\d+\/?/,
    /https?:\/\/pin\.it\/\w+/,
  ];

  async extract(url: string): Promise<VideoMetadata> {
    this.logger.log(`Extracting Pinterest URL: ${url}`);

    // Handle short links (pin.it) by following redirects via GET
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        maxRedirects: 5,
      });

      const finalUrl = response.request.res.responseUrl || url;
      const htmlContent = response.data;
      const $ = cheerio.load(htmlContent);

      let videoUrl = $('meta[property="og:video"]').attr('content');

      if (!videoUrl) {
        // Fallback: Check for Relay API data (newer Pinterest structure)
        const scripts = $('script')
          .map((i, el) => $(el).html())
          .get();

        for (const script of scripts) {
          if (
            script.includes('videoList720P') ||
            script.includes('expMp4') ||
            script.includes('v720P')
          ) {
            // Try to find 720p or expMp4 URLs specifically
            const mp4Match =
              script.match(/"url":"(https?:\/\/[^"]+v720P[^"]+\.mp4)"/) ||
              script.match(/"url":"(https?:\/\/[^"]+expMp4[^"]+\.mp4)"/) ||
              script.match(/"url":"(https?:\/\/[^"]+720p[^"]+\.mp4)"/);

            if (mp4Match) {
              videoUrl = mp4Match[1];
              break;
            }
          }
        }

        // Fallback: Old __PWS_DATA__ check or generic MP4 search
        if (!videoUrl) {
          const scriptContent = $('script[id="__PWS_DATA__"]').html();
          if (scriptContent) {
            const data = JSON.parse(scriptContent);
            const jsonString = JSON.stringify(data);
            const mp4Match = jsonString.match(/https?:\/\/[^"]+\.mp4/);
            if (mp4Match) {
              videoUrl = mp4Match[0];
            }
          }
        }

        // Ultimate Fallback: Scrape anything that looks like a high-res MP4 link from the source
        if (!videoUrl) {
          const resMatches = htmlContent.match(
            /https?:\/\/v1\.pinimg\.com\/videos\/[^\"]+\/720p\/[^\"]+\.mp4/g,
          );
          if (resMatches && resMatches.length > 0) {
            videoUrl = resMatches[0];
          } else {
            const anyMp4 = htmlContent.match(
              /https?:\/\/v1\.pinimg\.com\/videos\/[^\"]+\.mp4/g,
            );
            if (anyMp4 && anyMp4.length > 0) {
              videoUrl = anyMp4[0];
            }
          }
        }
      }

      if (!videoUrl) {
        throw new Error('No video found on this Pin.');
      }

      const title =
        $('meta[property="og:title"]').attr('content') || 'Pinterest Video';
      const image = $('meta[property="og:image"]').attr('content') || '';
      const description = $('meta[property="og:description"]').attr('content');

      return {
        id: this.extractId(finalUrl),
        platform: 'Pinterest',
        title: title.trim(),
        description: description?.trim(),
        thumbnailUrl: image,
        author: {
          id: 'unknown',
          username: 'pinterest_user',
          name: 'Pinterest User',
        },
        downloads: [
          {
            resolution: 'Original',
            url: videoUrl,
            format: 'mp4',
            size: undefined,
          },
        ],
      };
    } catch (e) {
      this.logger.error(`Pinterest extraction failed: ${e.message}`);
      throw new Error('Failed to extract Pinterest video.');
    }
  }

  private extractId(url: string): string {
    const match = url.match(/\/pin\/(\d+)/);
    return match ? match[1] : 'unknown';
  }
}
