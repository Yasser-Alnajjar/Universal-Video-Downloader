import { execFile } from "child_process";
import { promisify } from "util";
import ytdl from "@distube/ytdl-core";
import { VideoMetadata, VideoQuality } from "@/types";

const execFileAsync = promisify(execFile);

const PLAYER_CLIENTS: NonNullable<ytdl.getInfoOptions["playerClients"]> = [
  "WEB",
  "ANDROID",
  "IOS",
  "TV",
];

const YT_DLP_COOKIES_PATH =
  process.env.YT_DLP_COOKIES_PATH || "/app/cookies.txt";

interface YtDlpFormat {
  url?: string;
  ext?: string;
  protocol?: string;
  vcodec?: string;
  acodec?: string;
  height?: number;
  format_note?: string;
  resolution?: string;
  filesize?: number;
  filesize_approx?: number;
}

interface YtDlpInfo {
  id: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  uploader_id?: string;
  uploader?: string;
  channel_id?: string;
  channel?: string;
  formats?: YtDlpFormat[];
}

function extractVideoId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );

  if (!match?.[1]) throw new Error("Invalid YouTube URL");

  return match[1];
}

function isSupportedFormat(format: string): format is VideoQuality["format"] {
  return (
    format === "mp4" ||
    format === "webm" ||
    format === "m3u8" ||
    format === "gif" ||
    format === "flv" ||
    format === "3gp" ||
    format === "ts"
  );
}

function getContainer(format: ytdl.videoFormat): VideoQuality["format"] {
  const mimeContainer = format.mimeType?.match(/(?:video|audio)\/([^;]+)/)?.[1];
  const container: string = format.container || mimeContainer || "mp4";

  if (isSupportedFormat(container)) return container;

  return "mp4";
}

function getResolution(format: ytdl.videoFormat): string {
  if (format.qualityLabel) return format.qualityLabel;
  if (format.height) return `${format.height}p`;
  if (format.hasAudio && !format.hasVideo) return "Audio";

  return "auto";
}

function mapFormat(format: ytdl.videoFormat): VideoQuality | null {
  if (!format.url) return null;

  return {
    resolution: getResolution(format),
    url: format.url,
    format: getContainer(format),
    size: format.contentLength ? Number(format.contentLength) : undefined,
  };
}

function sortDownloads(downloads: VideoQuality[]): VideoQuality[] {
  return downloads.sort((a, b) => {
    const aRes = parseInt(a.resolution.replace(/\D/g, "")) || 0;
    const bRes = parseInt(b.resolution.replace(/\D/g, "")) || 0;
    return bRes - aRes;
  });
}

async function getYoutubeInfo(videoId: string): Promise<ytdl.videoInfo> {
  try {
    return await ytdl.getInfo(videoId, {
      playerClients: PLAYER_CLIENTS,
    });
  } catch (error) {
    const basicInfo = await ytdl.getBasicInfo(videoId, {
      playerClients: ["WEB"],
    });

    const streamingData = basicInfo.player_response?.streamingData;
    const rawFormats = [
      ...(streamingData?.formats ?? []),
      ...(streamingData?.adaptiveFormats ?? []),
    ] as ytdl.videoFormat[];

    if (rawFormats.some((format) => format.url)) {
      return {
        ...basicInfo,
        formats: rawFormats,
      };
    }

    throw error;
  }
}

function getDownloads(formats: ytdl.videoFormat[]): VideoQuality[] {
  return sortDownloads(
    formats
      .map(mapFormat)
      .filter((format): format is VideoQuality => format !== null),
  );
}

function mapYtDlpFormat(format: YtDlpFormat): VideoQuality | null {
  if (
    !format.url ||
    !format.ext ||
    !isSupportedFormat(format.ext) ||
    format.protocol !== "https" ||
    format.vcodec === "none" ||
    format.acodec === "none"
  ) {
    return null;
  }

  return {
    resolution:
      format.format_note ||
      format.resolution ||
      (format.height ? `${format.height}p` : "auto"),
    url: format.url,
    format: format.ext,
    size: format.filesize ?? format.filesize_approx,
  };
}

function getYtDlpDownloads(formats: YtDlpFormat[] = []): VideoQuality[] {
  return sortDownloads(
    formats
      .map(mapYtDlpFormat)
      .filter((format): format is VideoQuality => format !== null),
  );
}

async function extractWithYtDlp(url: string, videoId: string) {
  const { stdout } = await execFileAsync(
    "yt-dlp",
    [
      "--dump-single-json",
      "--no-playlist",
      "--no-warnings",
      "--cookies",
      YT_DLP_COOKIES_PATH,

      // resilience layer
      "--retries",
      "5",
      "--retry-sleep",
      "1",
      "--sleep-interval",
      "1",

      // improve bypass success rate
      "--extractor-args",
      "youtube:player_client=android",

      "--format",
      "best[ext=mp4]/best",
      url,
    ],
    {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 45_000,
    },
  );

  const info = JSON.parse(stdout) as YtDlpInfo;

  const downloads = getYtDlpDownloads(info.formats);

  if (!downloads.length) {
    throw new Error("No playable formats from yt-dlp");
  }

  return {
    id: info.id || videoId,
    platform: "YouTube",
    title: info.title ?? "Unknown",
    description: info.description ?? "",
    thumbnailUrl:
      info.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    author: {
      id: info.channel_id ?? info.uploader_id ?? "",
      username: info.uploader ?? info.channel ?? "",
      name: info.uploader ?? info.channel ?? "",
    },
    duration: Number(info.duration ?? 0),
    downloads,
  } satisfies VideoMetadata;
}

async function extractWithYtdlCore(videoId: string): Promise<VideoMetadata> {
  const info = await ytdl.getInfo(videoId, {
    playerClients: PLAYER_CLIENTS,
  });

  const formats = info.formats ?? [];
  const downloads = getDownloads(formats);

  if (!downloads.length) {
    throw new Error("No playable formats (ytdl-core fallback failed)");
  }

  const details = info.videoDetails;

  return {
    id: videoId,
    platform: "YouTube",
    title: details.title ?? "Unknown",
    description: details.description ?? "",
    thumbnailUrl:
      details.thumbnails?.at(-1)?.url ||
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    author: {
      id: details.channelId ?? "",
      username: details.author?.name ?? "",
      name: details.author?.name ?? "",
    },
    duration: Number(details.lengthSeconds ?? 0),
    downloads,
  };
}

export async function extractYoutube(url: string): Promise<VideoMetadata> {
  const videoId = extractVideoId(url);

  try {
    return await extractWithYtDlp(url, videoId);
  } catch (err) {
    console.warn("yt-dlp failed → fallback to ytdl-core", err);
  }

  return extractWithYtdlCore(videoId);
}
