import axios from "axios";
import { VideoMetadata } from "@/types";

const TWITTER_BEARER_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

export async function extractTwitter(url: string): Promise<VideoMetadata> {
  const match = url.match(/\/status\/(\d+)/);
  if (!match) throw new Error("Invalid Twitter URL");
  const tweetId = match[1];

  // 1. Get Guest Token
  const guestTokenResponse = await axios.post(
    "https://api.twitter.com/1.1/guest/activate.json",
    {},
    {
      headers: { Authorization: `Bearer ${TWITTER_BEARER_TOKEN}` },
    }
  );
  const guestToken = guestTokenResponse.data.guest_token;

  // 2. Fetch Tweet Details
  const graphqlUrl =
    "https://twitter.com/i/api/graphql/0hWvDhmW8YQ-S_ib3azIrw/TweetResultByRestId";
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
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
      true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    responsive_web_media_download_video_enabled: false,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_enhance_cards_enabled: false,
  };

  const tweetResponse = await axios.get(graphqlUrl, {
    headers: {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      "x-guest-token": guestToken,
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    params: {
      variables: JSON.stringify(variables),
      features: JSON.stringify(features),
    },
  });

  const result = tweetResponse.data?.data?.tweetResult?.result;
  if (!result) throw new Error("Tweet not found");

  const legacy = result.legacy || result.tweet?.legacy;
  const core = result.core || result.tweet?.core;
  if (!legacy) throw new Error("Invalid tweet data structure");

  const media = legacy.extended_entities?.media?.[0];
  if (!media || (media.type !== "video" && media.type !== "animated_gif")) {
    throw new Error("No video found in this tweet");
  }

  const videoInfo = media.video_info;
  const variants = videoInfo?.variants || [];
  const sortedDownloads = variants
    .filter((v: any) => v.content_type === "video/mp4")
    .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))
    .map((v: any) => ({
      resolution: v.bitrate
        ? Math.round(v.bitrate / 1000) + "kbps"
        : "Original",
      url: v.url,
      format: "mp4" as const,
    }));

  return {
    id: tweetId,
    platform: "Twitter",
    title: legacy.full_text?.substring(0, 50) + "..." || "Twitter Video",
    description: legacy.full_text,
    thumbnailUrl: media.media_url_https,
    duration: videoInfo?.duration_millis
      ? videoInfo.duration_millis / 1000
      : undefined,
    author: {
      id: core.user_results?.result?.rest_id || "",
      username: core.user_results?.result?.legacy?.screen_name || "",
      name: core.user_results?.result?.legacy?.name || "",
    },
    downloads: sortedDownloads,
  };
}
