import { Hero } from "@/components/home/hero";
import { PlatformGrid } from "@/components/home/platform-grid";
import { VideoToAudioPromo } from "@/components/home/video-to-audio-promo";
import { HowItWorks } from "@/components/home/how-it-works";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center w-full">
      <Hero />
      <PlatformGrid />
      <VideoToAudioPromo />
      <HowItWorks />
    </div>
  );
}
