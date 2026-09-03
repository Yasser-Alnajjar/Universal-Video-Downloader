import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { Card } from "@/components/ui/card";
import { FaTwitter, FaInstagram, FaFacebook, FaPinterest, FaYoutube } from "react-icons/fa";

const PLATFORMS = [
  { id: "pinterest", path: "/pinterest", Icon: FaPinterest, color: "text-red-600" },
  { id: "twitter", path: "/twitter", Icon: FaTwitter, color: "text-blue-400" },
  { id: "instagram", path: "/instagram", Icon: FaInstagram, color: "text-pink-500" },
  { id: "facebook", path: "/facebook", Icon: FaFacebook, color: "text-blue-600" },
  { id: "youtube", path: "/youtube", Icon: FaYoutube, color: "text-red-500" },
] as const;

export async function PlatformGrid() {
  const t = await getTranslations("platforms");
  const tHome = await getTranslations("home");

  return (
    <section className="w-full max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {tHome("platformsTitle")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">{tHome("platformsSubtitle")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {PLATFORMS.map(({ id, path, Icon, color }) => (
          <Link key={id} href={path}>
            <Card className="items-center justify-center gap-3 py-8 text-center transition-all hover:border-primary/50 hover:shadow-md">
              <Icon className={`h-8 w-8 ${color}`} aria-hidden="true" />
              <span className="font-medium text-sm">{t(id)}</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
