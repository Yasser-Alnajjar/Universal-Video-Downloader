import { VideoMetadata } from "@/types";
import { extractYoutube } from "./youtube";
import { extractFacebook } from "./facebook";
import { extractInstagram } from "./instagram";
import { extractTwitter } from "./twitter";
import { extractPinterest } from "./pinterest";
import { detectProvider, normalizeMediaUrl, ProviderId } from "@/lib/validation";

export {
  extractYoutube,
  extractFacebook,
  extractInstagram,
  extractTwitter,
  extractPinterest,
};

// One-line registration point for future providers.
const PROVIDER_REGISTRY: Record<ProviderId, (url: string) => Promise<VideoMetadata>> = {
  youtube: extractYoutube,
  facebook: extractFacebook,
  instagram: extractInstagram,
  twitter: extractTwitter,
  pinterest: extractPinterest,
};

export async function extractVideo(
  url: string,
  platform?: string,
): Promise<VideoMetadata> {
  const normalized = normalizeMediaUrl(url);

  const requested = platform?.toLowerCase() as ProviderId | undefined;
  const detected = detectProvider(normalized);
  const provider = detected ?? (requested && requested in PROVIDER_REGISTRY ? requested : null);

  if (!provider) throw new Error("UNSUPPORTED_PLATFORM");

  return PROVIDER_REGISTRY[provider](normalized);
}
