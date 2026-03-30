"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export function PlatformSelector() {
  const pathname = usePathname();
  const t = useTranslations("platforms");
  const locale = useLocale();
  const platforms = [
    {
      name: t("pinterest"),
      path: `/${locale}`,
      color: "text-primary",
    },
    {
      name: t("twitter"),
      path: `/${locale}/twitter`,
      color: "text-blue-600",
    },
    {
      name: t("instagram"),
      path: `/${locale}/instagram`,
      color: "text-red-600",
    },
    {
      name: t("facebook"),
      path: `/${locale}/facebook`,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900/50 p-1 rounded-sm sm:rounded-full mb-6 relative overflow-x-auto max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 no-scrollbar">
      {platforms.map((platform) => {
        const isActive = pathname === platform.path;
        return (
          <Link
            key={platform.path}
            href={platform.path}
            className={cn(
              "flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap text-center",
              isActive
                ? `${platform.color} bg-white dark:bg-slate-800 shadow-sm`
                : "text-slate-500",
            )}
          >
            {platform.name}
          </Link>
        );
      })}
    </div>
  );
}
