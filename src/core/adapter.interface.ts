export interface VideoQuality {
  resolution: string; // e.g., "1080p", "720p"
  url: string;        // Direct download link
  format: 'mp4' | 'm3u8' | 'gif' | 'webm' | 'flv' | '3gp';
  size?: number;      // in bytes
}

export interface VideoMetadata {
  id: string;
  platform: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  duration?: number;
  author: {
    id: string;
    username: string;
    name: string;
  };
  downloads: VideoQuality[];
}

export abstract class PlatformAdapter {
  abstract readonly platformName: string;
  abstract readonly domains: string[];
  abstract readonly regexPatterns: RegExp[];

  /**
   * Determines if this adapter handles the given URL
   */
  matches(url: string): boolean {
    return this.regexPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Core logic to fetch video metadata
   */
  abstract extract(url: string): Promise<VideoMetadata>;
}
