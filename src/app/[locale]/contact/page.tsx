import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contactPage" });
  return { title: t("metaTitle") };
}

export default function ContactPage() {
  const t = useTranslations("contactPage");

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-slate-50">
        {t("title")}
      </h1>
      <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p>{t("intro")}</p>
        <p>
          {t("reachOutAt")}{" "}
          <a
            href="mailto:yasseralnajjar72@gmail.com"
            className="text-primary hover:underline"
          >
            yasseralnajjar72@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
