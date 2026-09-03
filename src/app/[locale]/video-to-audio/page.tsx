import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { VideoToAudioView } from "@/components/media/video-to-audio-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "videoToAudio" });

  return {
    title: { absolute: "Video to Audio Converter | Veluxa" },
    description: t("seoDescription"),
    alternates: {
      canonical: `/${locale}/video-to-audio`,
    },
    openGraph: {
      title: "Video to Audio Converter | Veluxa",
      description: t("seoDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Video to Audio Converter | Veluxa",
      description: t("seoDescription"),
    },
  };
}

export default function VideoToAudioPage() {
  return <VideoToAudioView />;
}
