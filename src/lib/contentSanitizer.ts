/**
 * Content Sanitizer — masks profanity, insults, and harmful words
 * in displayed text with a uniform block character (█) so it's
 * obvious the word was censored, not just missing letters.
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

// Build replacement regex — case insensitive
const combinedPattern = new RegExp(
  ALL_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "gi"
);

/**
 * Sanitize text by replacing profanity with solid block characters (█████).
 * The block bar is visually obvious — readers instantly understand it's censored.
 */
export function sanitizeDisplayText(text: string): string {
  if (!text) return text;
  return text.replace(combinedPattern, (match) => "█".repeat(match.length));
}

/**
 * Check if text contains any profanity that would be masked.
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return combinedPattern.test(text);
}
