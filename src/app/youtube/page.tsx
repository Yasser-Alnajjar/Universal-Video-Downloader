"use client";

import { Downloader } from "@/components/downloader";
import { PlatformSelector } from "@/components/platform-selector";

export const metadata = {
  title: "YouTube",
};

export default function YouTubePage() {
  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl text-slate-900 dark:text-slate-50">
          Download <span className="text-red-600">YouTube</span> Videos
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Save YouTube videos and Shorts in high quality (MP4). Fast, free, and
          unlimited.
        </p>
      </div>

      <PlatformSelector />
      <Downloader platformName="YouTube" />
    </div>
  );
}
