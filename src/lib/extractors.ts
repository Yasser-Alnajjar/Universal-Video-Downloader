import * as ytdl from "@distube/ytdl-core";
import * as fbLib from "fb-downloader-scrapper";
import * as instagramGetUrl from "instagram-url-direct";
import axios from "axios";
import * as cheerio from "cheerio";
import { VideoMetadata, VideoQuality } from "@/types";

export async function extractYoutube(url: string): Promise<VideoMetadata> {
  if (!ytdl.validateURL(url)) {
    throw new Error("Invalid YouTube URL");
  }

  const info = await ytdl.getInfo(url, {
    requestOptions: {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": "2.20230531.02.00",
      },
    },
  });

  const videoDetails = info.videoDetails;
  const downloads: VideoQuality[] = info.formats
    .filter((format) => format.container === "mp4" && format.hasAudio)
    .map((format) => ({
      resolution: format.qualityLabel || "Unknown",
      url: format.url,
      format: "mp4" as const,
      size: format.contentLength ? parseInt(format.contentLength) : undefined,
    }));

  downloads.sort((a, b) => {
    const resA = parseInt(a.resolution) || 0;
    const resB = parseInt(b.resolution) || 0;
    return resB - resA;
  });

  const thumbnail =
    videoDetails.thumbnails.length > 0
      ? videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url
      : "";

  return {
    id: videoDetails.videoId,
    platform: "YouTube",
    title: videoDetails.title,
    description: videoDetails.description || "",
    thumbnailUrl: thumbnail || "",
    author: {
      id: videoDetails.author.id,
      username: videoDetails.author.user || videoDetails.author.name,
      name: videoDetails.author.name,
    },
    duration: parseInt(videoDetails.lengthSeconds),
    downloads: downloads.length > 0 ? downloads : [],
  };
}

export async function extractFacebook(url: string): Promise<VideoMetadata> {
  const getInfo =
    (fbLib as any).getFbVideoInfo || (fbLib as any).default?.getFbVideoInfo;

  if (typeof getInfo !== "function") {
    throw new Error("Facebook downloader library failed to load");
  }

  const response = await getInfo(url);
  if (!response || (!response.sd && !response.hd)) {
    throw new Error("No video found on Facebook");
  }

  const videoUrl = response.hd || response.sd;
  const title = response.title || "Facebook Video";
  const image = response.thumbnail || "";

  return {
    id: "fb-video",
    platform: "Facebook",
    title: title,
    description: "",
    thumbnailUrl: image,
    author: {
      id: "unknown",
      username: "facebook_user",
      name: "Facebook User",
    },
    downloads: [
      {
        resolution: response.hd ? "High (HD)" : "Standard (SD)",
        url: videoUrl,
        format: "mp4" as const,
        size: undefined,
      },
    ],
  };
}

export async function extractInstagram(url: string): Promise<VideoMetadata> {
  const getUrl =
    (instagramGetUrl as any).instagramGetUrl ||
    (instagramGetUrl as any).default?.instagramGetUrl ||
    (instagramGetUrl as any).default;

  if (typeof getUrl !== "function") {
    throw new Error("Instagram downloader library failed to load");
  }

  const response = await getUrl(url);
  if (!response || !response.url_list || response.url_list.length === 0) {
    throw new Error("No video found on Instagram");
  }

  const videoUrl = response.url_list[0];
  const match = url.match(/\/(p|reel|tv)\/([\w-]+)/);
  const id = match ? match[2] : "unknown";

  return {
    id,
    platform: "Instagram",
    title: "Instagram Video",
    description: "",
    thumbnailUrl: "",
    author: {
      id: "unknown",
      username: "instagram_user",
      name: "Instagram User",
    },
    downloads: [
      {
        resolution: "Original",
        url: videoUrl,
        format: "mp4" as const,
        size: undefined,
      },
    ],
  };
}

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

export async function extractPinterest(url: string): Promise<VideoMetadata> {
  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    maxRedirects: 5,
  });

  const finalUrl = response.request.res.responseUrl || url;
  const htmlContent = response.data;
  const $ = cheerio.load(htmlContent);

  let videoUrl = $('meta[property="og:video"]').attr("content");
  if (!videoUrl) {
    const scripts = $("script")
      .map((i, el) => $(el).html())
      .get();
    for (const script of scripts) {
      if (
        script &&
        (script.includes("videoList720P") ||
          script.includes("expMp4") ||
          script.includes("v720P"))
      ) {
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
  }

  if (!videoUrl) {
    throw new Error("No video found on Pinterest");
  }

  const title =
    $('meta[property="og:title"]').attr("content") || "Pinterest Video";
  const image = $('meta[property="og:image"]').attr("content") || "";
  const description = $('meta[property="og:description"]').attr("content");
  const match = finalUrl.match(/\/pin\/(\d+)/);
  const id = match ? match[1] : "unknown";

  return {
    id,
    platform: "Pinterest",
    title: title.trim(),
    description: description?.trim(),
    thumbnailUrl: image,
    author: {
      id: "unknown",
      username: "pinterest_user",
      name: "Pinterest User",
    },
    downloads: [
      {
        resolution: "Original",
        url: videoUrl,
        format: "mp4" as const,
        size: undefined,
      },
    ],
  };
}

export async function extractVideo(
  url: string,
  platform?: string
): Promise<VideoMetadata> {
  const normalizedUrl = url.toLowerCase();

  if (
    platform === "YouTube" ||
    normalizedUrl.includes("youtube.com") ||
    normalizedUrl.includes("youtu.be")
  ) {
    return extractYoutube(url);
  } else if (
    platform === "Facebook" ||
    normalizedUrl.includes("facebook.com") ||
    normalizedUrl.includes("fb.watch")
  ) {
    return extractFacebook(url);
  } else if (
    platform === "Instagram" ||
    normalizedUrl.includes("instagram.com") ||
    normalizedUrl.includes("instagr.am")
  ) {
    return extractInstagram(url);
  } else if (
    platform === "Twitter" ||
    normalizedUrl.includes("twitter.com") ||
    normalizedUrl.includes("x.com")
  ) {
    return extractTwitter(url);
  } else if (
    platform === "Pinterest" ||
    normalizedUrl.includes("pinterest.com") ||
    normalizedUrl.includes("pin.it")
  ) {
    return extractPinterest(url);
  }

  throw new Error("Unsupported platform or invalid URL");
}
