"use client";

import { Downloader } from "@/components/downloader";
import { PlatformSelector } from "@/components/platform-selector";
export const metadata = {
  title: "Instagram",
};
export default function InstagramPage() {
  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl text-slate-900 dark:text-slate-50">
          Download <span className="text-pink-600">Instagram</span> Videos
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Save Instagram Reels and Videos effortlessly. High quality MP4
          download.
        </p>
      </div>
      <PlatformSelector />
      <Downloader platformName="Instagram" />
    </div>
  );
}
