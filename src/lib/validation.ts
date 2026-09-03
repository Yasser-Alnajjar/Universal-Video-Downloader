export type ProviderId =
  | "pinterest"
  | "twitter"
  | "instagram"
  | "facebook"
  | "youtube";

interface ProviderMatcher {
  id: ProviderId;
  hosts: RegExp;
}

const PROVIDER_MATCHERS: ProviderMatcher[] = [
  { id: "youtube", hosts: /^(www\.|m\.)?(youtube\.com|youtu\.be)$/ },
  { id: "facebook", hosts: /^(www\.|m\.|web\.)?(facebook\.com|fb\.watch)$/ },
  { id: "instagram", hosts: /^(www\.)?(instagram\.com|instagr\.am)$/ },
  { id: "twitter", hosts: /^(www\.|mobile\.)?(twitter\.com|x\.com)$/ },
  { id: "pinterest", hosts: /^([a-z]{2}\.)?(pinterest\.[a-z.]+|pin\.it)$/ },
];

const TRACKING_PARAMS = [
  "si",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "igshid",
  "fbclid",
  "gclid",
  "ref",
  "ref_src",
];

function parseHttpUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("INVALID_URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("INVALID_URL");
  }
  return url;
}

export function detectProvider(rawUrl: string): ProviderId | null {
  let url: URL;
  try {
    url = parseHttpUrl(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  return PROVIDER_MATCHERS.find((p) => p.hosts.test(host))?.id ?? null;
}

/** Strips tracking params and canonicalizes platform-specific short/alt URL forms. */
export function normalizeMediaUrl(rawUrl: string): string {
  const url = parseHttpUrl(rawUrl);
  const host = url.hostname.toLowerCase();

  TRACKING_PARAMS.forEach((p) => url.searchParams.delete(p));

  if (host === "youtu.be" || host.endsWith(".youtu.be")) {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (id) return `https://www.youtube.com/watch?v=${id}`;
  }

  if (/(^|\.)youtube\.com$/.test(host) && url.pathname.startsWith("/shorts/")) {
    const id = url.pathname.split("/").filter(Boolean)[1];
    if (id) return `https://www.youtube.com/watch?v=${id}`;
  }

  return url.toString();
}

/**
 * Single entry point for both client-side (UX) and server-side (source of truth)
 * URL validation: normalizes the URL and resolves which provider handles it.
 */
export function validateMediaUrl(rawUrl: string): {
  url: string;
  provider: ProviderId;
} {
  const normalized = normalizeMediaUrl(rawUrl);
  const provider = detectProvider(normalized);
  if (!provider) throw new Error("UNSUPPORTED_PLATFORM");
  return { url: normalized, provider };
}

// ---- SSRF-safe outbound URL checks (used by /api/download, which fetches
// an arbitrary media URL server-side) ----

export function isBlockedIPv4(hostname: string): boolean {
  const m = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function isBlockedIPv6(address: string): boolean {
  const addr = address.toLowerCase();
  if (addr === "::1") return true;
  if (addr.startsWith("fe80:")) return true; // link-local
  if (addr.startsWith("fc") || addr.startsWith("fd")) return true; // unique local fc00::/7
  return false;
}

const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1", "[::1]"]);

/** Cheap, synchronous check on the literal URL — DNS-based re-check happens separately. */
export function isSafeExternalUrl(rawUrl: string): boolean {
  try {
    const url = parseHttpUrl(rawUrl);
    const hostname = url.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.has(hostname)) return false;
    if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
    if (isBlockedIPv4(hostname)) return false;
    if (isBlockedIPv6(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}
