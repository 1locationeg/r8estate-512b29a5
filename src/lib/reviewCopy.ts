import type { TFunction } from "i18next";

interface LocalizeReviewValueOptions {
  fallbackKey?: string;
  fallbackText?: string;
}

const toReadableLabel = (value: string) =>
  value
    .replace(/^form\./, "")
    .replace(/^exp_/, "")
    .replace(/^unit_/, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const localizeStoredReviewValue = (
  value: string | null | undefined,
  t: TFunction,
  options?: LocalizeReviewValueOptions,
) => {
  const fallbackKey = options?.fallbackKey ?? "reviews.general";
  const fallbackText = options?.fallbackText ?? "General";

  if (!value?.trim() || value.trim().toLowerCase() === "general") {
    return t(fallbackKey, fallbackText);
  }

  const trimmed = value.trim();
  const translationKey = trimmed.startsWith("form.")
    ? trimmed
    : trimmed.startsWith("exp_") || trimmed.startsWith("unit_")
      ? `form.${trimmed}`
      : null;

  if (!translationKey) {
    return trimmed;
  }

  const fallback = toReadableLabel(trimmed);
  const translated = t(translationKey, fallback);

  return translated === translationKey ? fallback : translated;
};