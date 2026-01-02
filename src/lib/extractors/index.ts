import { VideoMetadata } from "@/types";
import { extractYoutube } from "./youtube";
import { extractFacebook } from "./facebook";
import { extractInstagram } from "./instagram";
import { extractTwitter } from "./twitter";
import { extractPinterest } from "./pinterest";

export {
  extractYoutube,
  extractFacebook,
  extractInstagram,
  extractTwitter,
  extractPinterest,
};

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
