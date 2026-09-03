import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { Downloader } from "@/components/downloader";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

export async function Hero() {
  const t = await getTranslations("home");

  return (
    <div className="flex-1 flex flex-col items-center relative overflow-hidden w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 max-w-150 max-h-150 h-full w-full bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="text-center space-y-6 max-w-3xl mx-auto mb-10">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl text-slate-900 dark:text-slate-50">
          {t("heroTitle")}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t("heroSubtitle")}
        </p>
      </div>

      <Downloader placeholder={t("heroPlaceholder")} submitLabel={t("heroCta")} />

      <Button asChild variant="outline" size="lg" className="mt-4">
        <Link href="/video-to-audio">
          <Music className="h-4 w-4" />
          {t("heroSecondaryCta")}
        </Link>
      </Button>
    </div>
  );
}
