import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const locales = ["ar", "en"] as const;
export type LocaleTypes = (typeof locales)[number];
export const localePrefix = "always";
export const defaultLocale = "ar";
export const defaultLanguageCode = "ar-EG";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
});

export const getLanguageCode = (locale: string): { code: string } =>
  new Map([
    ["en", { code: "en-US" }],
    ["en-US", { code: "en-US" }],
    ["ar", { code: "ar-EG" }],
    ["ar-EG", { code: "ar-EG" }],
  ]).get(locale) ?? getLanguageCode(defaultLanguageCode);

export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
  createNavigation(routing);
