import { NextResponse } from "next/server";
import { extractVideo } from "@/lib/extractors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, platform } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: { message: "URL is required" } },
        { status: 400 }
      );
    }
    console.log(url, platform);

    const data = await extractVideo(url, platform);

    console.log(data);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || "An error occurred during extraction",
        },
      },
      { status: 500 }
    );
  }
}
