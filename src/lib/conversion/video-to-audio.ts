import type { FFmpeg } from "@ffmpeg/ffmpeg";

// ffmpeg.wasm's core is loaded lazily, client-side only, and only on the
// /video-to-audio route — never bundled into pages that don't need it.
// The single-threaded core (no COEP/COOP cross-origin-isolation requirement)
// keeps this deployable on plain serverless hosting without extra headers.
const CORE_VERSION = "0.12.6";
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

export type AudioFormat = "mp3" | "wav" | "m4a";

export const AUDIO_FORMATS: AudioFormat[] = ["mp3", "wav", "m4a"];

// ~300MB is a practical ceiling for transcoding a file entirely in-browser
// without exhausting tab memory.
export const MAX_SOURCE_SIZE_BYTES = 300 * 1024 * 1024;

const CODEC_ARGS: Record<AudioFormat, string[]> = {
  mp3: ["-vn", "-acodec", "libmp3lame", "-q:a", "2"],
  wav: ["-vn", "-acodec", "pcm_s16le"],
  m4a: ["-vn", "-acodec", "aac", "-b:a", "192k"],
};

const MIME_TYPES: Record<AudioFormat, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
};

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

async function loadFfmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  try {
    return await loadPromise;
  } catch (error) {
    loadPromise = null;
    throw error;
  }
}

export interface ConvertCallbacks {
  onPhaseChange?: (phase: "loading" | "converting") => void;
  onProgress?: (ratio: number) => void;
}

/**
 * @param source The source video's raw bytes (fetched from a remote URL via
 * our own same-origin proxy, or a local File — both are Blobs).
 * @param sourceExt Container extension of the source (e.g. "mp4", "webm"),
 * used only to hint ffmpeg's demuxer.
 */
export async function convertToAudio(
  source: Blob,
  sourceExt: string,
  format: AudioFormat,
  callbacks: ConvertCallbacks = {},
): Promise<Blob> {
  callbacks.onPhaseChange?.("loading");
  const ffmpeg = await loadFfmpeg();
  const { fetchFile } = await import("@ffmpeg/util");

  const progressHandler = ({ progress }: { progress: number }) => {
    if (Number.isFinite(progress)) {
      callbacks.onProgress?.(Math.min(Math.max(progress, 0), 1));
    }
  };
  ffmpeg.on("progress", progressHandler);

  const uid = Date.now();
  const inputName = `input-${uid}.${sourceExt || "mp4"}`;
  const outputName = `output-${uid}.${format}`;

  try {
    callbacks.onPhaseChange?.("converting");
    await ffmpeg.writeFile(inputName, await fetchFile(source));
    await ffmpeg.exec(["-i", inputName, ...CODEC_ARGS[format], outputName]);
    const data = await ffmpeg.readFile(outputName);
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
    // Copy into a plain (non-shared) ArrayBuffer-backed Uint8Array — Blob's
    // type doesn't accept ffmpeg.wasm's SharedArrayBuffer-capable typing.
    return new Blob([Uint8Array.from(bytes)], { type: MIME_TYPES[format] });
  } finally {
    ffmpeg.off("progress", progressHandler);
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
  }
}
