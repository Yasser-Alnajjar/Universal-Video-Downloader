"use client";

import { Downloader } from "@/components/downloader";
import { PlatformSelector } from "@/components/platform-selector";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 max-w-150 max-h-150 h-full w-full bg-red-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl font-exbold tracking-tight lg:text-7xl text-slate-900 dark:text-slate-50">
          {t("title")}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>
      <PlatformSelector />
      <Downloader platformName="Pinterest" />
    </div>
  );
}
