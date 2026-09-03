"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoResult } from "@/components/video-result";
import { VideoMetadata, ApiResponse } from "@/types";
import { Loader2, AlertCircle, Link, Download, Clipboard, X } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { validateMediaUrl } from "@/lib/validation";

interface DownloaderProps {
  platformName?: string;
  placeholder?: string;
  submitLabel?: string;
}

export function Downloader({
  platformName = "All",
  placeholder,
  submitLabel,
}: DownloaderProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoMetadata | null>(null);

  const tc = useTranslations("common");
  const tp = useTranslations("platforms");

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Client-side validation is a UX shortcut only — the server re-validates
    // and normalizes the URL regardless (never trusted alone).
    try {
      validateMediaUrl(url);
    } catch (validationError: any) {
      setLoading(false);
      setError(
        validationError?.message === "UNSUPPORTED_PLATFORM"
          ? tc("unsupportedPlatform")
          : tc("invalidUrl"),
      );
      return;
    }

    try {
      const endpoint = "/api/extract";

      const response = await axios.post<ApiResponse>(endpoint, {
        url,
        platform: platformName.toLowerCase(),
      });

      if (response?.data?.success && response?.data?.data) {
        setResult(response.data.data);
      } else {
        setError(response?.data?.error?.message || tc("failedExtract"));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error?.message || tc("somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

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
    setResult(null);
  };

  const defaultPlaceholder =
    platformName === "All"
      ? tc("placeholder_all")
      : tc("placeholder_platform", {
          platform: tp(platformName.toLowerCase()),
        });

  return (
    <div className="w-full flex flex-col items-center">
      <Card className="w-full max-w-4xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 transition-all">
        <CardContent className="pt-6">
          <form
            onSubmit={handleExtract}
            className="flex flex-col sm:flex-row w-full gap-3"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <Link className="h-5 w-5 text-primary" />
              </div>
              <Input
                type="url"
                placeholder={placeholder || defaultPlaceholder}
                aria-label={tc("urlInputLabel")}
                aria-invalid={!!error}
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                  "ps-10 pe-20 h-14 text-lg bg-white transition-all",
                )}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
              />
              <div className="absolute inset-y-0 end-2 flex items-center gap-1">
                {url ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={tc("clear")}
                    onClick={handleClear}
                    disabled={loading}
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
                    disabled={loading}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="cursor-pointer h-14 px-8 text-base bg-primary hover:bg-primary/80 text-white transition-all"
              disabled={loading || !url}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {tc("extracting")}
                </>
              ) : (
                <>
                  {submitLabel || tc("download")}
                  <Download className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Area */}
      <div className="w-full max-w-2xl mt-8 z-10 min-h-25">
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-2 border-red-200 bg-red-50 dark:bg-red-900/10 dark:text-red-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{tc("extractionError")}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !result && !error && (
          <div className="space-y-4 animate-pulse">
            <Skeleton className="h-87.5 w-full rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[40%]" />
            </div>
          </div>
        )}

        {result && <VideoResult data={result} />}
      </div>
    </div>
  );
}
