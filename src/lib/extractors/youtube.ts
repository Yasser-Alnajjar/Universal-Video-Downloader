import ytdl from "@distube/ytdl-core";
import { VideoMetadata, VideoQuality } from "@/types";

const PLAYER_CLIENTS: NonNullable<ytdl.getInfoOptions["playerClients"]> = [
  "WEB",
  "WEB_EMBEDDED",
  "IOS",
  "ANDROID",
  "TV",
];

function extractVideoId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );

  if (!match?.[1]) throw new Error("Invalid YouTube URL");

  return match[1];
}

function getContainer(format: ytdl.videoFormat): VideoQuality["format"] {
  const mimeContainer = format.mimeType?.match(/(?:video|audio)\/([^;]+)/)?.[1];
  const container: string = format.container || mimeContainer || "mp4";

  if (
    container === "mp4" ||
    container === "webm" ||
    container === "m3u8" ||
    container === "gif" ||
    container === "flv" ||
    container === "3gp" ||
    container === "ts"
  ) {
    return container;
  }

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

export async function extractYoutube(url: string): Promise<VideoMetadata> {
  const videoId = extractVideoId(url);

  const info = await getYoutubeInfo(videoId);

  const formats = info.formats ?? [];

  const downloads = getDownloads(formats);

  const infoDetails = info.videoDetails;

  const thumbnail =
    infoDetails.thumbnails?.at(-1)?.url ||
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  if (downloads.length === 0) {
    throw new Error(
      "No playable YouTube formats found. The video may be restricted, private, live-only, or temporarily blocked by YouTube.",
    );
  }

  return {
    id: videoId,
    platform: "YouTube",
    title: infoDetails.title ?? "Unknown",
    description: infoDetails.description ?? "",
    thumbnailUrl: thumbnail,
    author: {
      id: infoDetails.channelId ?? "",
      username: infoDetails.author?.name ?? "",
      name: infoDetails.author?.name ?? "",
    },
    duration: Number(infoDetails.lengthSeconds ?? 0),

    downloads,
  };
}
