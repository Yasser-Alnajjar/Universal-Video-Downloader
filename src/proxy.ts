import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale, localePrefix } from "./navigation";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix,
});

export async function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Excludes /api, all of /_next, and any path with a file extension (static
  // assets — images, favicons, manifest.json, robots.txt, sitemap.xml, ...)
  // from locale routing. The previous pattern only excluded a hardcoded list
  // of filenames and silently 404'd everything else in /public.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
