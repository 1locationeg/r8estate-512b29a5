/**
 * Arabic-aware number, date, and review count formatting utilities.
 * Uses Eastern Arabic-Indic numerals (١٢٣) for Arabic locale.
 */

export function formatNumber(n: number, lang: string): string {
  if (lang === 'ar') {
    return new Intl.NumberFormat('ar-EG').format(n);
  }
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatDate(date: Date | string, lang: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateShort(date: Date | string, lang: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatReviewCount(count: number, lang: string): string {
  if (lang === 'ar') {
    const n = new Intl.NumberFormat('ar-EG').format(count);
    if (count === 1) return `${n} تقييم`;
    if (count === 2) return `تقييمان`;
    if (count >= 3 && count <= 10) return `${n} تقييمات`;
    return `${n} تقييم`;
  }
  return `${new Intl.NumberFormat('en-US').format(count)} ${count === 1 ? 'review' : 'reviews'}`;
}

export function formatStatNumber(n: number, suffix: string, lang: string): string {
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-US').format(n);
  return `${formatted}${suffix}`;
}
