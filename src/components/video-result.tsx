import { VideoMetadata } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Clock, User, PlayCircle } from "lucide-react";
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaPinterest,
  FaYoutube,
} from "react-icons/fa";

interface VideoResultProps {
  data: VideoMetadata;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case "twitter":
      return <FaTwitter className="text-blue-400" />;
    case "instagram":
      return <FaInstagram className="text-pink-500" />;
    case "facebook":
      return <FaFacebook className="text-blue-600" />;
    case "pinterest":
      return <FaPinterest className="text-red-600" />;
    case "youtube":
      return <FaYoutube className="text-red-500" />;
    default:
      return <PlayCircle className="text-slate-500" />;
  }
};

export function VideoResult({ data }: VideoResultProps) {
  return (
    <Card className="w-full overflow-hidden border-0  mb-2 bg-white dark:bg-slate-800 rounded-2xl animate-in fade-in zoom-in-95 duration-500 pt-0">
      <div className="relative group bg-black">
        <video
          className="w-full h-128 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
          controls
          autoPlay
          muted
          loop
          playsInline
          aria-label={`Video preview: ${data.title}`}
        >
          {data.downloads.length > 0 &&
            data.downloads.map((download, index) => (
              <source
                key={index}
                src={download.url}
                type={`video/${download.format}`}
              />
            ))}
        </video>
        <div className="absolute top-3 start-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 text-white text-xs font-medium">
          <PlatformIcon platform={data.platform} />
          <span>{data.platform}</span>
        </div>
        {data.duration && (
          <div className="absolute bottom-3 end-3 bg-black/80 px-2 py-1 rounded text-xs text-white font-mono flex items-center">
            <Clock className="w-3 h-3 me-1" />
            {Math.floor(data.duration)}s
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col justify-between">
        <div>
          <div className="flex mb-2 items-center text-sm text-slate-500 dark:text-slate-400">
            <User className="w-3 h-3 mr-1" />
            <span className="truncate max-w-37.5">@{data.author.username}</span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 truncate max-w-75 dark:text-white line-clamp-2 mb-4 leading-snug">
            {data.title}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Download Options
            </h4>
            <div className="space-y-2">
              {data.downloads.map((quality, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 dark:bg-blue-800/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    >
                      {quality.format.toUpperCase()}
                    </Badge>
                    <span className="font-medium text-sm text-slate-700 dark:text-slate-400">
                      {quality.resolution}
                    </span>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <a
                      href={`/api/download?url=${encodeURIComponent(
                        quality.url,
                      )}&filename=${encodeURIComponent(
                        `${data.title}.${quality.format}`,
                      )}`}
                    >
                      <Download className="mr-2 h-3.5 w-3.5" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
