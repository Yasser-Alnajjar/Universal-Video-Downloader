import { getTranslations } from "next-intl/server";
import { Link2, SlidersHorizontal, DownloadCloud } from "lucide-react";

const STEPS = [
  { key: 1, Icon: Link2 },
  { key: 2, Icon: SlidersHorizontal },
  { key: 3, Icon: DownloadCloud },
] as const;

export async function HowItWorks() {
  const t = await getTranslations("home");

  return (
    <section className="w-full max-w-5xl mx-auto px-4 pb-20">
      <h2 className="text-3xl font-bold tracking-tight text-center mb-10 text-slate-900 dark:text-slate-50">
        {t("howItWorksTitle")}
      </h2>

      <ol className="grid gap-8 sm:grid-cols-3">
        {STEPS.map(({ key, Icon }) => (
          <li key={key} className="flex flex-col items-center text-center gap-3">
            <div className="relative flex items-center justify-center rounded-full bg-primary/10 h-16 w-16">
              <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
              <span className="absolute -top-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {key}
              </span>
            </div>
            <h3 className="font-semibold text-lg">{t(`step${key}Title`)}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              {t(`step${key}Description`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
