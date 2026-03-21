export const locales = ["en-GB", "nb-NO"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en-GB";
export const LOCALE_COOKIE = "NEXT_LOCALE";
