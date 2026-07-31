import type { Language, LocalizedText } from "./types";

export function localize(
  value: LocalizedText,
  language: Language,
): string {
  const primary = value[language].trim();
  if (primary) return primary;
  return value[language === "en" ? "th" : "en"].trim();
}

