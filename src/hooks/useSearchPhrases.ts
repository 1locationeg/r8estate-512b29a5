import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface SearchPhrase {
  en: string;
  ar: string;
}

const SETTINGS_KEY = 'search_phrases';

export const useSearchPhrases = () => {
  const { t, i18n } = useTranslation();
  const [dbPhrases, setDbPhrases] = useState<SearchPhrase[] | null>(null);

  useEffect(() => {
    const fetchPhrases = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', SETTINGS_KEY)
          .maybeSingle();

        if (!error && data?.value) {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDbPhrases(parsed);
          }
        }
      } catch {
        // Fall back to hardcoded phrases
      }
    };
    fetchPhrases();
  }, []);

  const phrases = useMemo(() => {
    const lang = i18n.language === 'ar' ? 'ar' : 'en';

    if (dbPhrases && dbPhrases.length > 0) {
      return dbPhrases
        .map(p => p[lang]?.trim())
        .filter(Boolean) as string[];
    }

    // Fallback to translation file + hardcoded
    return [
      t("hero.searchPlaceholder"),
      lang === 'ar' ? "اعثر على مطورين موثوقين بالذكاء الاصطناعي ✦" : "Find AI-verified developers you can trust ✦",
      lang === 'ar' ? "كل تقييم حقيقي — صفر تقييمات مزيفة" : "Every review is real — zero fake ratings",
      lang === 'ar' ? "قارن المطورين جنبًا إلى جنب فورًا" : "Compare developers side by side instantly",
      lang === 'ar' ? "بوابتك الموثوقة لعقارات مصر" : "Your trusted gateway to Egypt's real estate",
      lang === 'ar' ? "اكتشف مشاريع مميزة مدعومة بالبيانات" : "Discover top-rated projects backed by data",
    ];
  }, [dbPhrases, i18n.language, t]);

  return phrases;
};
