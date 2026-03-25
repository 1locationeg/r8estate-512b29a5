import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Save, Loader2, GripVertical, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface SearchPhrase {
  en: string;
  ar: string;
}

const DEFAULT_PHRASES: SearchPhrase[] = [
  { en: "Search for the real estate trusted story", ar: "ابحث عن القصة الموثوقة في العقارات" },
  { en: "Find AI-verified developers you can trust ✦", ar: "اعثر على مطورين موثوقين بالذكاء الاصطناعي ✦" },
  { en: "Every review is real — zero fake ratings", ar: "كل تقييم حقيقي — صفر تقييمات مزيفة" },
  { en: "Compare developers side by side instantly", ar: "قارن المطورين جنبًا إلى جنب فورًا" },
  { en: "Your trusted gateway to Egypt's real estate", ar: "بوابتك الموثوقة لعقارات مصر" },
  { en: "Discover top-rated projects backed by data", ar: "اكتشف مشاريع مميزة مدعومة بالبيانات" },
];

const SETTINGS_KEY = 'search_phrases';

const AdminSearchPhrases = () => {
  const [phrases, setPhrases] = useState<SearchPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const parsed = JSON.parse(data.value);
        setPhrases(Array.isArray(parsed) ? parsed : DEFAULT_PHRASES);
      } else {
        setPhrases(DEFAULT_PHRASES);
      }
    } catch (err) {
      console.error('Error fetching phrases:', err);
      setPhrases(DEFAULT_PHRASES);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const validPhrases = phrases.filter(p => p.en.trim() || p.ar.trim());
    if (validPhrases.length === 0) {
      toast.error('Add at least one phrase');
      return;
    }

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();

      const value = JSON.stringify(validPhrases);

      if (existing) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', SETTINGS_KEY);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_settings')
          .insert({ key: SETTINGS_KEY, value });
        if (error) throw error;
      }

      toast.success('Search phrases saved successfully');
    } catch (err) {
      console.error('Error saving phrases:', err);
      toast.error('Failed to save phrases');
    } finally {
      setSaving(false);
    }
  };

  const addPhrase = () => {
    setPhrases([...phrases, { en: '', ar: '' }]);
  };

  const removePhrase = (index: number) => {
    setPhrases(phrases.filter((_, i) => i !== index));
  };

  const updatePhrase = (index: number, lang: 'en' | 'ar', value: string) => {
    const updated = [...phrases];
    updated[index] = { ...updated[index], [lang]: value };
    setPhrases(updated);
  };

  const resetToDefaults = () => {
    setPhrases([...DEFAULT_PHRASES]);
    toast.info('Reset to defaults — click Save to apply');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Search Bar Phrases
              </CardTitle>
              <CardDescription>
                Manage the rotating placeholder phrases in the hero search bar. Each phrase needs both English and Arabic text.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                Reset Defaults
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <Save className="w-4 h-4 me-1" />}
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {phrases.map((phrase, index) => (
            <div key={index} className="flex gap-3 items-start p-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center pt-2 text-muted-foreground">
                <GripVertical className="w-4 h-4" />
                <span className="text-xs font-mono ms-1 w-4">{index + 1}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">English</Label>
                  <Input
                    value={phrase.en}
                    onChange={(e) => updatePhrase(index, 'en', e.target.value)}
                    placeholder="English phrase..."
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">العربية</Label>
                  <Input
                    value={phrase.ar}
                    onChange={(e) => updatePhrase(index, 'ar', e.target.value)}
                    placeholder="...العبارة بالعربية"
                    dir="rtl"
                    className="text-sm"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive mt-2"
                onClick={() => removePhrase(index)}
                disabled={phrases.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addPhrase}>
            <Plus className="w-4 h-4 me-1" />
            Add Phrase
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSearchPhrases;
