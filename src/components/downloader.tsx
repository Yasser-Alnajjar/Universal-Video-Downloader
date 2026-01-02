"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoResult } from "@/components/video-result";
import { VideoMetadata, ApiResponse } from "@/types";
import { Loader2, AlertCircle, Link, Download } from "lucide-react";
import { axios } from "./HttpClient";
import { cn } from "@/lib/utils";

interface DownloaderProps {
  platformName?: string;
  placeholder?: string;
}

export function Downloader({
  platformName = "All",
  placeholder,
}: DownloaderProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VideoMetadata | null>(null);

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const endpoint =
        platformName === "All"
          ? "api/v1/extract"
          : `api/v1/extract/${platformName.toLowerCase()}`;

      const response = await axios.post<ApiResponse>(endpoint, {
        url,
      });

      if (response.data.success && response.data.data) {
        setResult(response.data.data);
      } else {
        setError(
          response.data.error?.message || "Failed to extract video details."
        );
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const defaultPlaceholder =
    platformName === "All"
      ? "Paste URL (YouTube, Twitter, Instagram...)"
      : `Paste ${platformName} URL...`;

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
                className={cn(
                  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                  "pl-10 h-14 text-lg bg-white transition-all"
                )}
                aria-invalid
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="cursor-pointer h-14 px-8 text-base bg-primary hover:bg-primary/80 text-white transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  Download
                  <Download className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Area */}
      <div className="w-full max-w-2xl mt-8 z-10 min-h-[100px]">
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-2 border-red-200 bg-red-50 dark:bg-red-900/10 dark:text-red-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Extraction Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && !result && !error && (
          <div className="space-y-4 animate-pulse">
            <Skeleton className="h-[350px] w-full rounded-2xl" />
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
