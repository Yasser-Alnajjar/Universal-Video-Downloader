import * as fbLib from "fb-downloader-scrapper";
import { VideoMetadata } from "@/types";

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
