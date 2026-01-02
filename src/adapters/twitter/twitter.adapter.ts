import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { PlatformAdapter, VideoMetadata, VideoQuality } from '../../core/adapter.interface';

@Injectable()
export class TwitterAdapter extends PlatformAdapter {
  private readonly logger = new Logger(TwitterAdapter.name);
  readonly platformName = 'Twitter';
  readonly domains = ['twitter.com', 'x.com'];
  readonly regexPatterns = [/https?:\/\/(www\.)?(twitter|x)\.com\/\w+\/status\/\d+/];

  private readonly BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

  async extract(url: string): Promise<VideoMetadata> {
    try {
        const tweetId = this.extractId(url);
        this.logger.log(`Extracting Tweet ID: ${tweetId}`);

        // 1. Get Guest Token
        const guestToken = await this.getGuestToken();
        this.logger.debug(`Guest Token: ${guestToken}`);

        // 2. Fetch Tweet Data
        const tweetData = await this.fetchTweetDetails(tweetId, guestToken);

        // 3. Normalize
        return this.normalize(tweetData, tweetId, url);
    } catch (e) {
        const msg = e.response?.data?.errors?.[0]?.message || e.message;
        this.logger.error(`Twitter extraction failed: ${msg}`, e.stack);
        throw new BadRequestException(`Twitter extraction failed: ${msg}`);
    }
  }

  private extractId(url: string): string {
    const match = url.match(/\/status\/(\d+)/);
    if (!match) throw new Error('Invalid Twitter URL');
    return match[1];
  }

  private async getGuestToken(): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.twitter.com/1.1/guest/activate.json',
        {},
        {
          headers: {
            Authorization: `Bearer ${this.BEARER_TOKEN}`,
          },
        },
      );
      return response.data.guest_token;
    } catch (e) {
      this.logger.error('Failed to get guest token', e);
      throw new Error('Could not authenticate with Twitter');
    }
  }

  private async fetchTweetDetails(tweetId: string, guestToken: string): Promise<any> {
    const graphqlUrl = 'https://twitter.com/i/api/graphql/0hWvDhmW8YQ-S_ib3azIrw/TweetResultByRestId';
    // Note: features and fieldToggles often change. These are common ones.
    const variables = {
      tweetId: tweetId,
      withCommunity: false,
      includePromotedContent: false,
      withVoice: false,
    };
    const features = {
      creator_subscriptions_tweet_preview_api_enabled: true,
      tweetypie_unmention_optimization_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: false,
      tweet_awards_web_tipping_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      responsive_web_media_download_video_enabled: false,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_enhance_cards_enabled: false,
    };

    try {
      const response = await axios.get(graphqlUrl, {
        headers: {
          Authorization: `Bearer ${this.BEARER_TOKEN}`,
          'x-guest-token': guestToken,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        params: {
          variables: JSON.stringify(variables),
          features: JSON.stringify(features),
        },
      });
      
      const result = response.data?.data?.tweetResult?.result;
      if (!result) throw new Error('Tweet not found');
      return result;
    } catch (e) {
      this.logger.error(`Failed to fetch tweet details for ${tweetId}`, e);
      throw new Error('Failed to fetch tweet content');
    }
  }

  private normalize(data: any, id: string, originalUrl: string): VideoMetadata {
    const legacy = data.legacy || data.tweet?.legacy;
    const core = data.core || data.tweet?.core;
    
    if (!legacy) throw new Error('Invalid tweet data structure');

    // Handle Media
    const media = legacy.extended_entities?.media?.[0];
    if (!media || media.type !== 'video') {
       // Check if it's a GIF
       if (media?.type === 'animated_gif') {
           // processed same as video usually
       } else {
           throw new Error('No video or GIF found in this tweet');
       }
    }

    const videoInfo = media.video_info;
    const variants = videoInfo?.variants || [];
    
    // Convert variants to VideoQuality
    const downloads: VideoQuality[] = variants
      .filter((v: any) => v.content_type === 'video/mp4') // Filter out m3u8 if we just want mp4 for now
      .map((v: any) => ({
        resolution: this.extractResolution(v.url),
        url: v.url,
        format: 'mp4',
      }));

    // Sort by resolution (best first) - crude logic or by bitrate
    downloads.sort((a, b) => {
        // Simple heuristic: higher bitrate usually implies better quality, 
        // but here we just have URL. Let's try to grab bitrate if available in raw data.
        // Re-map to include bitrate for sorting
        return 0; 
    });
    
    // Sort logic fix: loop variants again
    const sorted = variants
        .filter((v: any) => v.content_type === 'video/mp4')
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))
        .map((v: any) => ({
             resolution: `${v.bitrate ? Math.round(v.bitrate / 1000) + 'kbps' : 'Unknown'}`,
             url: v.url,
             format: 'mp4',
        }));


    return {
      id: id,
      platform: 'Twitter',
      title: legacy.full_text?.substring(0, 50) + '...' || 'Twitter Video',
      description: legacy.full_text,
      thumbnailUrl: media.media_url_https,
      duration: videoInfo?.duration_millis ? videoInfo.duration_millis / 1000 : undefined,
      author: {
        id: core.user_results?.result?.rest_id || '',
        username: core.user_results?.result?.legacy?.screen_name || '',
        name: core.user_results?.result?.legacy?.name || '',
      },
      downloads: sorted,
    };
  }

  private extractResolution(url: string): string {
    // vid/1280x720/mp4/...
    const match = url.match(/\/(\d+x\d+)\//);
    return match ? match[1] : 'Original';
  }
}
