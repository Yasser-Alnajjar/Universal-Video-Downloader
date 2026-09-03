import { NextResponse } from "next/server";
import { z } from "zod";
import { extractVideo } from "@/lib/extractors";
import { validateMediaUrl } from "@/lib/validation";
import { getUserErrorMessage } from "@/lib/errors";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  url: z.string().min(1, "URL is required"),
  platform: z.string().optional(),
});

export async function POST(req: Request) {
  if (!checkRateLimit(getClientKey(req))) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Too many requests. Please wait a moment and try again." },
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Invalid request body." } },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { message: "URL is required." } },
      { status: 400 },
    );
  }

  let url: string;
  try {
    ({ url } = validateMediaUrl(parsed.data.url));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: getUserErrorMessage(error) } },
      { status: 400 },
    );
  }

  try {
    const data = await extractVideo(url, parsed.data.platform);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { success: false, error: { message: getUserErrorMessage(error) } },
      { status: 500 },
    );
  }
}
