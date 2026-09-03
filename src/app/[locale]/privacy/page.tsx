import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacyPage" });
  return { title: t("metaTitle") };
}

export default function PrivacyPage() {
  const t = useTranslations("privacyPage");

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-slate-50">
        {t("title")}
      </h1>
      <p className="text-muted-foreground mb-6">{t("disclaimer")}</p>
      <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>{t("paragraph1")}</p>
        <p>{t("paragraph2")}</p>
        <p>{t("paragraph3")}</p>
      </div>
    </div>
  );
}
