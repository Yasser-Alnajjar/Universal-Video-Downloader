import { VideoMetadata } from "@/types";

const DESKTOP_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

const MOBILE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

interface FbVideoData {
  title: string;
  thumbnail: string;
  sd?: string;
  hd?: string;
  duration?: number;
  id?: string;
}

// ─── URL Helpers ──────────────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
  // Convert fb.watch → full URL (redirect will follow automatically)
  // Normalize /reel/ and /watch/ paths to a consistent form
  return url.replace(/\?.*$/, ""); // strip query params for cleaner fetch
}

function toMobileUrl(url: string): string {
  return url.replace(
    /https?:\/\/(www\.)?facebook\.com/,
    "https://m.facebook.com",
  );
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /\/videos\/(\d+)/,
    /[?&]v=(\d+)/,
    /\/reel\/(\d+)/,
    /\/watch\/\?.*v=(\d+)/,
    /fb\.watch\/([a-zA-Z0-9_-]+)/, // short URL ID (not numeric, but useful)
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ─── Strategy 1: GraphQL / internal API ──────────────────────────────────────

async function fetchViaGraphQL(videoId: string): Promise<FbVideoData | null> {
  try {
    const params = new URLSearchParams({
      fields:
        "title,description,thumbnails,video_full_res_url,video_preview_image_url,length,sd_src,hd_src,dash_manifest",
      id: videoId,
      access_token: "6628568379|c1e620fa708a1d5696fb991c1bde5662", // public app token (no auth required for public videos)
    });

    const res = await fetch(
      `https://graph.facebook.com/v18.0/${videoId}?${params}`,
      {
        headers: { "User-Agent": DESKTOP_HEADERS["User-Agent"] },
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    if (json.error || !json.id) return null;

    return {
      title: json.title ?? "Facebook Video",
      thumbnail:
        json.video_preview_image_url ?? json.thumbnails?.data?.[0]?.uri ?? "",
      sd: json.sd_src ?? undefined,
      hd: json.hd_src ?? json.video_full_res_url ?? undefined,
      duration: json.length ? Number(json.length) : undefined,
      id: json.id,
    };
  } catch {
    return null;
  }
}

// ─── Strategy 2: Parse desktop HTML ──────────────────────────────────────────

function extractFromDesktopHtml(html: string): FbVideoData | null {
  // Pattern A: ScheduledServerJS blobs (older but still present on some pages)
  const scheduledBlobs = [
    ...html.matchAll(/\("ScheduledServerJS","handle",(\{.+?\})\)/gs),
    ...html.matchAll(/bigPipe\.onPageletArrive\((\{.+?"jsmods".+?\})\)/gs),
  ];

  for (const match of scheduledBlobs) {
    const result = tryParseVideoJson(match[1]);
    if (result) return result;
  }

  // Pattern B: __data / relay store blobs
  const dataBlobs = html.matchAll(/"__bbox":\{(.+?)\}(?=,"__mx")/gs);
  for (const match of dataBlobs) {
    const result = tryParseVideoJson(`{${match[1]}}`);
    if (result) return result;
  }

  // Pattern C: inline require / define blobs
  const requireBlobs = html.matchAll(
    /\["VideoPlayerShakaPlayer[^"]*",[^\[]*\[([^\]]+)\]/gs,
  );
  for (const match of requireBlobs) {
    const result = tryParseVideoJson(match[1]);
    if (result) return result;
  }

  // Pattern D: direct property extraction (legacy + current fallback)
  return extractViaRegex(html);
}

function tryParseVideoJson(raw: string): FbVideoData | null {
  try {
    const str = JSON.stringify(JSON.parse(raw));
    return extractViaRegex(str);
  } catch {
    // JSON.parse failed — try raw string directly
    return extractViaRegex(raw);
  }
}

function extractViaRegex(str: string): FbVideoData | null {
  const sd =
    str.match(/"browser_native_sd_url":"([^"]+)"/)?.[1]?.replace(/\\/g, "") ??
    str
      .match(/"sd_src(?:_no_ratelimit)?":"([^"]+)"/)?.[1]
      ?.replace(/\\/g, "") ??
    str.match(/"sd_src":"([^"]+)"/)?.[1]?.replace(/\\/g, "");

  const hd =
    str.match(/"browser_native_hd_url":"([^"]+)"/)?.[1]?.replace(/\\/g, "") ??
    str
      .match(/"hd_src(?:_no_ratelimit)?":"([^"]+)"/)?.[1]
      ?.replace(/\\/g, "") ??
    str.match(/"hd_src":"([^"]+)"/)?.[1]?.replace(/\\/g, "");

  if (!sd && !hd) return null;

  const title =
    str.match(/"title":\{"text":"([^"]+)"/)?.[1] ??
    str.match(/"og:title" content="([^"]+)"/)?.[1] ??
    str.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() ??
    "Facebook Video";

  const thumbnail =
    str
      .match(/"preferredThumbnail".*?"uri":"([^"]+)"/s)?.[1]
      ?.replace(/\\/g, "") ??
    str.match(/"thumbnailImage".*?"uri":"([^"]+)"/s)?.[1]?.replace(/\\/g, "") ??
    str.match(/"thumbnailUrl":"([^"]+)"/)?.[1]?.replace(/\\/g, "") ??
    "";

  const duration = str.match(/"playable_duration_in_ms":(\d+)/)?.[1];
  const id =
    str.match(/"videoId":"(\d+)"/)?.[1] ?? str.match(/"video_id":"(\d+)"/)?.[1];

  return {
    title: title.replace(/\\u0026/g, "&").replace(/\\"/g, '"'),
    thumbnail,
    sd,
    hd,
    duration: duration ? Math.floor(Number(duration) / 1000) : undefined,
    id,
  };
}

// ─── Strategy 3: Mobile HTML ─────────────────────────────────────────────────

async function fetchMobileHtml(url: string): Promise<FbVideoData | null> {
  try {
    const mobileUrl = toMobileUrl(url);
    const res = await fetch(mobileUrl, {
      headers: MOBILE_HEADERS,
      redirect: "follow",
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Mobile page often exposes sd_src / hd_src more plainly
    return extractViaRegex(html);
  } catch {
    return null;
  }
}

// ─── Main Extractor ───────────────────────────────────────────────────────────

export async function extractFacebook(url: string): Promise<VideoMetadata> {
  const normalized = normalizeUrl(url);
  const videoId = extractVideoId(url); // use original URL for ID extraction

  // Run strategies in priority order, short-circuit on first hit
  let data: FbVideoData | null = null;

  // 1. GraphQL (fastest, most reliable for public videos)
  if (videoId && /^\d+$/.test(videoId)) {
    data = await fetchViaGraphQL(videoId);
  }

  // 2. Desktop HTML parse
  if (!data?.sd && !data?.hd) {
    try {
      const res = await fetch(normalized, {
        headers: DESKTOP_HEADERS,
        redirect: "follow",
      });
      if (res.ok) {
        const html = await res.text();
        data = extractFromDesktopHtml(html);
      }
    } catch {
      // continue to next strategy
    }
  }

  // 3. Mobile HTML parse
  if (!data?.sd && !data?.hd) {
    data = await fetchMobileHtml(normalized);
  }

  if (!data || (!data.sd && !data.hd)) {
    throw new Error(
      "No video found. The video may be private, require login, or Facebook's structure has changed.",
    );
  }

  const downloads = [
    data.hd && { resolution: "HD", url: data.hd, format: "mp4" as const },
    data.sd && { resolution: "SD", url: data.sd, format: "mp4" as const },
  ].filter(Boolean) as { resolution: string; url: string; format: "mp4" }[];

  return {
    id: data.id ?? videoId ?? `fb-${Date.now()}`,
    platform: "Facebook",
    title: data.title,
    description: "",
    thumbnailUrl: data.thumbnail,
    author: {
      id: "unknown",
      username: "facebook_user",
      name: "Facebook User",
    },
    duration: data.duration ?? 0,
    downloads,
  };
}
