export const locales = ["en-GB", "nb-NO", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en-GB";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Display metadata for each locale, used by the language switcher UI. */
export const LOCALE_META: Record<Locale, { flag: string; label: string; title: string }> = {
  "en-GB": { flag: "🇬🇧", label: "English", title: "Switch to English" },
  "nb-NO": { flag: "🇳🇴", label: "Norsk", title: "Bytt til norsk" },
  es: { flag: "🇪🇸", label: "Español", title: "Cambiar a español" },
};
