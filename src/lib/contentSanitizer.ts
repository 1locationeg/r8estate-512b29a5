/**
 * Content Sanitizer — masks profanity, insults, and harmful words
 * in displayed text with censored symbols (e.g. "***").
 * Uses the same word lists as contentGuard.ts.
 */

const AR_PROFANITY = [
  "كسم", "كسمك", "ابن الكلب", "ابن كلب", "يابن الكلب",
  "حمار", "يا حمار", "عرص", "معرص", "شرموط", "شرموطة",
  "متناك", "متناكة", "نيك", "كس", "طيز", "زبي", "زب",
  "خول", "خنيث", "لبوة", "قحبة", "ملعون", "واطي",
  "حرامي", "نصاب", "يانصاب", "ياحرامي", "يا نصاب", "يا حرامي",
  "ابن الشرموطة", "يابن الشرموطة", "وسخ", "قذر",
  "اوسخ", "منيك", "عرصة", "لعنة", "ابوك", "يلعن",
  "كلب", "يا كلب", "حيوان", "يا حيوان", "غبي", "يا غبي",
  "اهبل", "يا اهبل", "تافه", "يا تافه", "زبالة",
];

const EN_PROFANITY = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick",
  "cunt", "motherfucker", "wtf", "stfu", "scammer",
  "thief", "fraud", "con artist", "piece of shit",
  "dumbass", "idiot", "moron", "retard", "slut", "whore",
  "damn", "bullshit", "crap",
];

// Sort by length descending so longer phrases are matched first
const ALL_WORDS = [...AR_PROFANITY, ...EN_PROFANITY].sort(
  (a, b) => b.length - a.length
);

function buildMask(word: string): string {
  // For single-char words use *
  if (word.length <= 1) return "*";
  // Keep first char, mask the rest
  const firstChar = word[0];
  const masked = "•".repeat(Math.min(word.length - 1, 6));
  return `${firstChar}${masked}`;
}

// Build replacement regex — case insensitive
const combinedPattern = new RegExp(
  ALL_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "gi"
);

/**
 * Sanitize text by masking profanity with censored symbols.
 * Returns the cleaned text safe for display.
 */
export function sanitizeDisplayText(text: string): string {
  if (!text) return text;
  return text.replace(combinedPattern, (match) => buildMask(match));
}

/**
 * Check if text contains any profanity that would be masked.
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return combinedPattern.test(text);
}
