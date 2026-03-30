import type { Metadata } from "next";
import "./globals.css";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: {
      template: `%s | ${t("veluxa")}`,
      default: t("veluxa"),
    },
    description:
      "Download videos from YouTube, Twitter, Instagram, Facebook, and Pinterest for free. High quality MP4 downloads, fast and unlimited.",
    keywords: [
      "video downloader",
      "youtube downloader",
      "twitter downloader",
      "instagram downloader",
      "facebook downloader",
      "pinterest downloader",
      "download video mp4",
    ],
    authors: [{ name: "Yasser AlNajjar" }],
    openGraph: {
      title: t("veluxa"),
      description:
        "Modern and fast video downloader for all your favorite platforms.",
      type: "website",
      url: "https://veluxa-downloader.vercel.app",
      siteName: t("veluxa"),
    },
    twitter: {
      card: "summary_large_image",
      title: t("veluxa"),
      description: "Multi-platform video downloader. Fast, free, and easy.",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
