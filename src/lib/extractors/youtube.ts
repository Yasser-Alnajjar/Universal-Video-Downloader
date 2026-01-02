import * as ytdl from "@distube/ytdl-core";
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
