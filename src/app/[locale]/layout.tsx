import { Cairo, Open_Sans } from "next/font/google";
import { Download } from "lucide-react";

import Link from "next/link";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";

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
            <nav className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center space-x-2"
                  aria-label={`${t("veluxa")} Home`}
                >
                  <div className="bg-primary p-1.5 rounded-full">
                    <Download className="h-5 w-5 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-bold text-lg tracking-tight">
                    {t("veluxa")}
                  </span>
                </Link>
                <div className="flex items-center space-x-4">
                  <LanguageSwitcher />
                  <ToggleTheme />
                </div>
              </div>
            </nav>
            <main className="bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
              {/* Hero Section */}
              <div className="flex-1 w-full flex flex-col items-center pt-20 pb-16 px-4 relative overflow-hidden">
                {children}
              </div>
              {/* Footer */}
              <footer className="bg-white dark:bg-slate-950 border-t py-8 text-center text-slate-500 text-sm">
                <p>{t("copyright", { year: new Date().getFullYear() })}</p>
                <p>{t("createdBy", { author: "Yasser AlNajjar" })}</p>
              </footer>
            </main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
