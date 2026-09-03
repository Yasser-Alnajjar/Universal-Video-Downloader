"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import {
  Music,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Clipboard,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConversionProgress } from "@/components/media/conversion-progress";
import {
  AUDIO_FORMATS,
  AudioFormat,
  MAX_SOURCE_SIZE_BYTES,
  convertToAudio,
} from "@/lib/conversion/video-to-audio";
import { validateMediaUrl } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { ApiResponse } from "@/types";

type Status = "idle" | "working" | "done" | "error";
type Phase = "extracting" | "fetching" | "converting";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function VideoToAudioView() {
  const t = useTranslations("videoToAudio");
  const tc = useTranslations("common");

  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const [status, setStatus] = useState<Status>("idle");
  const [phase, setPhase] = useState<Phase>("extracting");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceTitle, setSourceTitle] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);

  const convertingRef = useRef(false);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    resultUrlRef.current = resultUrl;
  }, [resultUrl]);

  // Revoke any pending object URL on unmount to avoid leaking memory.
  useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      setError(tc("pasteFailed"));
    }
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setUrl("");
    setResultUrl(null);
    setResultSize(0);
    setSourceTitle(null);
    setError(null);
    setProgress(null);
    setStatus("idle");
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guard against duplicate conversion requests while one is already running.
    if (!url || convertingRef.current) return;

    try {
      validateMediaUrl(url);
    } catch (validationError: any) {
      setError(
        validationError?.message === "UNSUPPORTED_PLATFORM"
          ? tc("unsupportedPlatform")
          : tc("invalidUrl"),
      );
      return;
    }

    convertingRef.current = true;
    setStatus("working");
    setError(null);
    setResultUrl(null);
    setSourceTitle(null);
    setProgress(null);

    try {
      setPhase("extracting");
      const extractRes = await axios.post<ApiResponse>("/api/extract", { url });
      if (!extractRes.data?.success || !extractRes.data.data) {
        throw new Error(extractRes.data?.error?.message || t("errors.extractionFailed"));
      }

      const media = extractRes.data.data;
      const best = media.downloads[0];
      if (!best) throw new Error(t("errors.extractionFailed"));

      setSourceTitle(media.title || null);

      setPhase("fetching");
      const videoRes = await fetch(`/api/download?url=${encodeURIComponent(best.url)}`);
      if (!videoRes.ok) throw new Error(t("errors.videoFetchFailed"));

      const contentLength = Number(videoRes.headers.get("content-length") || 0);
      if (contentLength > MAX_SOURCE_SIZE_BYTES) {
        throw new Error(t("errors.fileTooLarge", { max: formatBytes(MAX_SOURCE_SIZE_BYTES) }));
      }

      const videoBlob = await videoRes.blob();
      if (videoBlob.size > MAX_SOURCE_SIZE_BYTES) {
        throw new Error(t("errors.fileTooLarge", { max: formatBytes(MAX_SOURCE_SIZE_BYTES) }));
      }

      setPhase("converting");
      const audioBlob = await convertToAudio(videoBlob, best.format, format, {
        onProgress: setProgress,
      });

      const objectUrl = URL.createObjectURL(audioBlob);
      setResultUrl(objectUrl);
      setResultSize(audioBlob.size);
      setStatus("done");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t("errors.conversionFailed"));
      setStatus("error");
    } finally {
      convertingRef.current = false;
    }
  };

  const isWorking = status === "working";

  const phaseLabel =
    phase === "extracting"
      ? t("phaseExtracting")
      : phase === "fetching"
        ? t("phaseFetching")
        : t("phaseConverting");

  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 max-w-150 max-h-150 h-full w-full bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl text-slate-900 dark:text-slate-50">
          {t("title")}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      <Card className="w-full max-w-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
        <CardContent className="space-y-6">
          <form onSubmit={handleConvert} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <Input
                type="url"
                placeholder={t("urlPlaceholder")}
                aria-label={tc("urlInputLabel")}
                aria-invalid={!!error}
                className={cn(
                  "border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                  "ps-10 pe-20 h-14 text-lg bg-white transition-all",
                )}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isWorking}
              />
              <div className="absolute inset-y-0 end-2 flex items-center gap-1">
                {url ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={tc("clear")}
                    onClick={handleClear}
                    disabled={isWorking}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={tc("paste")}
                    onClick={handlePaste}
                    disabled={isWorking}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="flex flex-1 items-center gap-3" htmlFor="audio-format">
                <span className="text-sm font-medium whitespace-nowrap">
                  {t("outputFormat")}
                </span>
                <Select
                  value={format}
                  onValueChange={(value) => setFormat(value as AudioFormat)}
                  disabled={isWorking}
                >
                  <SelectTrigger id="audio-format" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIO_FORMATS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <Button
                type="submit"
                disabled={isWorking || !url}
                className="bg-primary hover:bg-primary/80 text-white"
              >
                <Music className="h-4 w-4" />
                {t("convert")}
              </Button>
            </div>
          </form>

          {isWorking && <ConversionProgress label={phaseLabel} progress={phase === "converting" ? progress : null} />}

          {status === "done" && resultUrl && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>{t("success")}</AlertTitle>
                <AlertDescription>
                  {sourceTitle ? `${sourceTitle} · ` : ""}
                  {format.toUpperCase()} · {formatBytes(resultSize)}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1 bg-primary hover:bg-primary/80 text-white">
                  <a
                    href={resultUrl}
                    download={`${(sourceTitle || "audio").replace(/[\\/:*?"<>|]/g, "").slice(0, 80)}.${format}`}
                  >
                    <Download className="h-4 w-4" />
                    {t("download")}
                  </a>
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                  {t("reset")}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("errors.title")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
