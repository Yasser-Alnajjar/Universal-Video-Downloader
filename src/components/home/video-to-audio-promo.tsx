import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Music, ArrowRight } from "lucide-react";

export async function VideoToAudioPromo() {
  const t = await getTranslations("home");

  return (
    <section className="w-full max-w-5xl mx-auto px-4 pb-16">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border bg-card p-8 sm:p-10">
        <div className="flex items-center gap-4 text-center sm:text-start">
          <div className="hidden sm:flex rounded-full bg-primary/10 p-4 shrink-0">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {t("videoToAudioTitle")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t("videoToAudioDescription")}
            </p>
          </div>
        </div>
        <Button asChild size="lg" className="shrink-0 bg-primary hover:bg-primary/80 text-white">
          <Link href="/video-to-audio">
            {t("videoToAudioCta")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
