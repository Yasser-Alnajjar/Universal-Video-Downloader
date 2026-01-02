import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AdapterRegistry } from './adapter.registry';
import { VideoMetadata } from './adapter.interface';

@Injectable()
export class ExtractionService {
  constructor(private readonly registry: AdapterRegistry) {}

  async extract(url: string, platform?: string): Promise<VideoMetadata> {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    let adapter;
    if (platform) {
        adapter = this.registry.getAdapterByName(platform);
        if (!adapter) {
             throw new NotFoundException(`Platform '${platform}' is not supported`);
        }
        // Verify mismatch
        if (!adapter.matches(url)) {
            // Optional: throw error or just warn. Let's warn but proceed (maybe URL pattern is new)
            // But strict is better.
            // throw new BadRequestException(`URL does not match expected platform ${platform}`);
             console.warn(`[ExtractionService] Warning: URL ${url} does not match regex for ${platform}`);
        }
    } else {
        adapter = this.registry.getAdapter(url);
    }

    if (!adapter) {
      throw new NotFoundException(`No supported adapter found for URL: ${url}`);
    }

    try {
      console.log(`[ExtractionService] Extracting using ${adapter.platformName} adapter...`);
      return await adapter.extract(url);
    } catch (error) {
      console.error(`[ExtractionService] Error extracting from ${url}:`, error);
      throw error;
    }
  }
  
  getSupportedPlatforms(): string[] {
    return this.registry.getAllAdapters();
  }
}
