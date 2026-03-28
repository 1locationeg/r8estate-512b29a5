/**
 * Content Guard — Client-side pre-filter for profanity, insults, and attacks.
 * Layer 1 of the Content Guard system.
 */

// Arabic/Egyptian profanity and slurs (common variations)
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

// English profanity and slurs
const EN_PROFANITY = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick",
  "cunt", "motherfucker", "wtf", "stfu", "scammer",
  "thief", "fraud", "con artist", "piece of shit",
  "dumbass", "idiot", "moron", "retard", "slut", "whore",
  "damn", "bullshit", "crap",
];

// Build regex patterns (word boundary aware)
function buildPatterns(words: string[]): RegExp[] {
  return words.map((word) => {
    // For Arabic, no word boundary — use lookahead/behind for spaces or start/end
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "i");
  });
}

const arPatterns = buildPatterns(AR_PROFANITY);
const enPatterns = buildPatterns(EN_PROFANITY);

export interface ContentCheckResult {
  blocked: boolean;
  reason?: string;
  detectedWords?: string[];
}

/**
 * Check text locally for obvious profanity and slurs.
 * Returns immediately — no network call.
 */
export function checkContentLocally(text: string): ContentCheckResult {
  if (!text || text.trim().length < 2) {
    return { blocked: false };
  }

  const normalizedText = text.toLowerCase().trim();
  const detectedWords: string[] = [];

  // Check Arabic patterns
  for (let i = 0; i < arPatterns.length; i++) {
    if (arPatterns[i].test(normalizedText)) {
      detectedWords.push(AR_PROFANITY[i]);
    }
  }

  // Check English patterns
  for (let i = 0; i < enPatterns.length; i++) {
    if (enPatterns[i].test(normalizedText)) {
      detectedWords.push(EN_PROFANITY[i]);
    }
  }

  if (detectedWords.length > 0) {
    return {
      blocked: true,
      reason: "profanity",
      detectedWords,
    };
  }

  return { blocked: false };
}

/**
 * AI-powered deep content check via edge function.
 * Returns moderation result with violation type and severity.
 */
export interface AIModerationResult {
  suspicion_score: number;
  flags: string[];
  suggestion: string;
  violation_type?: string;
  severity?: string;
}

export async function checkContentWithAI(
  text: string,
  contentType: "review" | "post" | "reply",
  rating?: number,
  supabaseInvoke?: (name: string, opts: any) => Promise<any>
): Promise<AIModerationResult | null> {
  if (!text || text.trim().length < 10 || !supabaseInvoke) return null;

  try {
    const { data, error } = await supabaseInvoke("review-integrity-check", {
      body: { review_text: text, rating, content_type: contentType },
    });
    if (error) return null; // fail-open
    return data as AIModerationResult;
  } catch {
    return null; // fail-open
  }
}
