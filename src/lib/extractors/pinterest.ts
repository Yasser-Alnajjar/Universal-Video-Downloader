import axios from "axios";
import * as cheerio from "cheerio";
import { VideoMetadata } from "@/types";

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
