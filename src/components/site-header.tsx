"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Menu, ChevronDown, Music } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaPinterest, FaYoutube } from "react-icons/fa";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToggleTheme } from "@/components/ui/toggle-theme";

const PLATFORM_LINKS = [
  { id: "pinterest", path: "/pinterest", Icon: FaPinterest },
  { id: "twitter", path: "/twitter", Icon: FaTwitter },
  { id: "instagram", path: "/instagram", Icon: FaInstagram },
  { id: "facebook", path: "/facebook", Icon: FaFacebook },
  { id: "youtube", path: "/youtube", Icon: FaYoutube },
] as const;

interface SiteHeaderProps {
  brandName: string;
}

export function SiteHeader({ brandName }: SiteHeaderProps) {
  const t = useTranslations("navigation");
  const tp = useTranslations("platforms");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" aria-label={`${brandName} Home`}>
          <div className="bg-primary p-1.5 rounded-full">
            <Download className="h-5 w-5 text-white" strokeWidth={3} />
          </div>
          <span className="font-bold text-lg tracking-tight">{brandName}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Button asChild variant="ghost">
            <Link href="/">{t("home")}</Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {t("platforms")}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {PLATFORM_LINKS.map(({ id, path, Icon }) => (
                <DropdownMenuItem key={id} asChild>
                  <Link href={path}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tp(id)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                {t("tools")}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/video-to-audio">
                  <Music className="h-4 w-4" aria-hidden="true" />
                  {t("videoToAudio")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSwitcher />
            <ToggleTheme />
          </div>

          {/* Mobile nav */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t("openMenu")}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="end">
              <SheetHeader>
                <SheetTitle>{brandName}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  {t("home")}
                </Link>

                <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {t("platforms")}
                </p>
                {PLATFORM_LINKS.map(({ id, path, Icon }) => (
                  <Link
                    key={id}
                    href={path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tp(id)}
                  </Link>
                ))}

                <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase text-muted-foreground">
                  {t("tools")}
                </p>
                <Link
                  href="/video-to-audio"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Music className="h-4 w-4" aria-hidden="true" />
                  {t("videoToAudio")}
                </Link>

                <div className="flex items-center gap-2 px-3 pt-6">
                  <LanguageSwitcher />
                  <ToggleTheme />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
