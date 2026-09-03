import { Cairo, Open_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const cairo = Cairo({
  variable: "--font-geist-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  subsets: ["latin"],
});

const open_Sans = Open_Sans({
  variable: "--font-geist-mono",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});
type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout(props: Props) {
  const { params, children } = props;
  const locale = (await params).locale;
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(error);
  }
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  if (!messages) notFound();
  const t = await getTranslations({ locale, namespace: "common" });

  const layoutDir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html
      lang={locale}
      dir={layoutDir}
      data-layout-dir={layoutDir}
      suppressHydrationWarning
    >
      <body
        dir={layoutDir}
        className={`${layoutDir ? cairo.className : open_Sans.className} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader brandName={t("veluxa")} />
            <main className="bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
              {/* Hero Section */}
              <div className="flex-1 w-full flex flex-col items-center pt-20 pb-16 px-4 relative overflow-hidden">
                {children}
              </div>
              <SiteFooter />
            </main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
