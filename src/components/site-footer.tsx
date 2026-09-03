import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";

const PLATFORM_LINKS = [
  { id: "pinterest", path: "/pinterest" },
  { id: "twitter", path: "/twitter" },
  { id: "instagram", path: "/instagram" },
  { id: "facebook", path: "/facebook" },
  { id: "youtube", path: "/youtube" },
] as const;

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tp = await getTranslations("platforms");
  const tc = await getTranslations("common");

  return (
    <footer className="bg-white dark:bg-slate-950 border-t py-12 text-sm">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {t("product")}
          </h3>
          <ul className="space-y-2 text-slate-500">
            <li>
              <Link href="/" className="hover:text-primary">
                {tc("veluxa")}
              </Link>
            </li>
            <li>
              <Link href="/video-to-audio" className="hover:text-primary">
                {t("tools")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {t("platforms")}
          </h3>
          <ul className="space-y-2 text-slate-500">
            {PLATFORM_LINKS.map(({ id, path }) => (
              <li key={id}>
                <Link href={path} className="hover:text-primary">
                  {tp(id)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {t("legal")}
          </h3>
          <ul className="space-y-2 text-slate-500">
            <li>
              <Link href="/privacy" className="hover:text-primary">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary">
                {t("terms")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary">
                {t("contact")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-10 pt-6 border-t text-center text-slate-500">
        <p>{tc("copyright", { year: new Date().getFullYear() })}</p>
        <p>{tc("createdBy", { author: "Yasser AlNajjar" })}</p>
      </div>
    </footer>
  );
}
