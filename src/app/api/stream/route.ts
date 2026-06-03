import { NextResponse } from "next/server";

function getGoogleVideoUrl(req: Request): URL | null {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const isGoogleVideo =
      url.protocol === "https:" &&
      (url.hostname === "googlevideo.com" ||
        url.hostname.endsWith(".googlevideo.com"));

    return isGoogleVideo ? url : null;
  } catch {
    return null;
  }
}

function copyHeader(source: Headers, target: Headers, name: string) {
  const value = source.get(name);

  if (value) target.set(name, value);
}

export async function GET(req: Request) {
  const url = getGoogleVideoUrl(req);

  if (!url) {
    return NextResponse.json(
      { error: "Missing or invalid googlevideo url" },
      { status: 400 },
    );
  }

  const range = req.headers.get("range");
  const upstreamHeaders = new Headers({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Referer: "https://www.youtube.com/",
  });

  if (range) upstreamHeaders.set("Range", range);

  const upstream = await fetch(url, {
    headers: upstreamHeaders,
    cache: "no-store",
  });

  if (!upstream.body) {
    return NextResponse.json(
      { error: "No upstream response body" },
      { status: 502 },
    );
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
  });

  copyHeader(upstream.headers, headers, "content-type");
  copyHeader(upstream.headers, headers, "content-length");
  copyHeader(upstream.headers, headers, "content-range");
  copyHeader(upstream.headers, headers, "accept-ranges");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
