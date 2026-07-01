// Choose Life — supported UI locales.
// UI chrome is translated; user-generated content (vendor names, comments,
// rejection reasons, no-receipt-note descriptions, people's names) is NEVER
// translated. See PROJECT_STATE §9.
export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "cl_locale";
