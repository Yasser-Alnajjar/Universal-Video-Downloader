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
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua":
          '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
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
