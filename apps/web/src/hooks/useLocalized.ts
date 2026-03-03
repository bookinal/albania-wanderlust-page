import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { TranslatedField } from "@/types/destination.types";

/**
 * Supported locales for dynamic content translations.
 * Keep in sync with i18n configuration.
 */
export const SUPPORTED_LOCALES = ["en", "sq", "it", "fr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  sq: "Shqip",
  it: "Italiano",
  fr: "Français",
};

/**
 * Resolves a translated field to the best available string for the given locale.
 * Falls back to English, then to the first available value, then to "".
 */
export function resolveTranslation(
  field: TranslatedField | string | undefined | null,
  locale: string,
): string {
  // Backwards-compat: if it's already a plain string, return it
  if (typeof field === "string") return field;
  if (!field || typeof field !== "object") return "";

  return field[locale] || field["en"] || Object.values(field)[0] || "";
}

/**
 * React hook that returns a resolver bound to the current i18n language.
 *
 * Usage:
 * ```tsx
 * const { localize } = useLocalized();
 * <p>{localize(destination.name)}</p>
 * ```
 */
export function useLocalized() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;

  const localize = useCallback(
    (field: TranslatedField | string | undefined | null): string => {
      return resolveTranslation(field, currentLocale);
    },
    [currentLocale],
  );

  return { localize, currentLocale };
}
