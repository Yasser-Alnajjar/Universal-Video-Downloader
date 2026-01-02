import * as instagramGetUrl from "instagram-url-direct";
import { VideoMetadata } from "@/types";

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
