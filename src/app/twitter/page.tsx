import { Downloader } from "@/components/downloader";
import { PlatformSelector } from "@/components/platform-selector";

export const metadata = {
  title: "Twitter",
};
export default function TwitterPage() {
  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 max-w-150 max-h-150 h-full w-full bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="text-center space-y-6 max-w-3xl mx-auto mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl text-slate-900 dark:text-slate-50">
          Download <span className="text-blue-400">Twitter / X</span> Videos
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Save Twitter videos and GIFs instantly. No login required.
        </p>
      </div>

      <PlatformSelector />
      <Downloader platformName="Twitter" />
    </div>
  );
}
