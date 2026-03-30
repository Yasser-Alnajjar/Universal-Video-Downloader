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
  matcher: [
    "/((?!api|_next|_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|images|icons|manifest.*\\..*).*)",
  ],
};
