export interface VideoQuality {
  resolution: string;
  url: string;
  format: 'mp4' | 'm3u8' | 'gif';
  size?: number;
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

export interface ApiResponse {
  success: boolean;
  data?: VideoMetadata;
  error?: {
    message: string;
  };
}
