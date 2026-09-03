import { NextResponse } from "next/server";
import dns from "node:dns/promises";
import { isBlockedIPv4, isBlockedIPv6, isSafeExternalUrl } from "@/lib/validation";

export const runtime = "nodejs";

// Defends against DNS-rebinding: the literal-hostname check above can be
// bypassed by a public hostname that resolves to a private/internal IP.
async function isSafeResolvedHost(hostname: string): Promise<boolean> {
  try {
    const records = await dns.lookup(hostname, { all: true });
    if (records.length === 0) return false;
    return records.every((record) =>
      record.family === 4 ? !isBlockedIPv4(record.address) : !isBlockedIPv6(record.address),
    );
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl || !isSafeExternalUrl(rawUrl)) {
    return NextResponse.json({ error: "Invalid or unsupported URL" }, { status: 400 });
  }

  const target = new URL(rawUrl);
  if (!(await isSafeResolvedHost(target.hostname))) {
    return NextResponse.json({ error: "Invalid or unsupported URL" }, { status: 400 });
  }

  const headers = new Headers({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  // googlevideo.com (YouTube's CDN) rejects requests without a matching Referer.
  if (target.hostname === "googlevideo.com" || target.hostname.endsWith(".googlevideo.com")) {
    headers.set("Referer", "https://www.youtube.com/");
  }

  let res: Response | null = null;
  // CDN-signed URLs (notably YouTube's googlevideo) can transiently reject a
  // fetch depending on which edge server handles it — one retry recovers a
  // meaningful fraction of these without materially adding latency.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetch(target.toString(), { headers, redirect: "follow" });
    } catch {
      res = null;
    }
    if (res?.ok) break;
  }

  if (!res || !res.ok || !res.body) {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 502 });
  }

  const filename = (searchParams.get("filename") || "video.mp4").replace(/[\r\n"]/g, "");

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}
