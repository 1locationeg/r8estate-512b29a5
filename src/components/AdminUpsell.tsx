import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, TrendingUp, Shield, Lock, Save, Loader2, Eye } from "lucide-react";

interface UpsellContent {
  headline: string;
  subtext: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  cta: string;
}

const DEFAULT_EN: UpsellContent = {
  headline: "Want to see the full picture?",
  subtext: "Don't settle for surface-level reviews. Get an expert report analyzing the developer's performance over the last 24 months.",
  bullet1: "Deep-dive into complaint trends and patterns.",
  bullet2: "Predictive risk indicators (Delivery & Quality).",
  bullet3: "Benchmarking against top-tier local competitors.",
  cta: "Unlock Business Insights",
};

const DEFAULT_AR: UpsellContent = {
  headline: "هل تريد رؤية الصورة الكاملة؟",
  subtext: "لا تكتفِ بالتقييمات العامة. احصل على تقرير احترافي يحلل أداء المطور على مدار آخر 24 شهراً.",
  bullet1: "تحليل دقيق لاتجاهات الشكاوى ونوعيتها.",
  bullet2: "مؤشرات استباقية للمخاطر (التسليم والجودة).",
  bullet3: "مقارنة معيارية مع أفضل المطورين في المنطقة.",
  cta: "افتح التقرير الاحترافي الآن",
};

const AdminUpsell = () => {
  const [enabled, setEnabled] = useState(true);
  const [enContent, setEnContent] = useState<UpsellContent>(DEFAULT_EN);
  const [arContent, setArContent] = useState<UpsellContent>(DEFAULT_AR);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewLang, setPreviewLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["upsell_enabled", "upsell_content_en", "upsell_content_ar"]);

      if (data) {
        const e = data.find((r) => r.key === "upsell_enabled");
        if (e) setEnabled(e.value === "true");
        const en = data.find((r) => r.key === "upsell_content_en");
        if (en) try { setEnContent(JSON.parse(en.value)); } catch {}
        const ar = data.find((r) => r.key === "upsell_content_ar");
        if (ar) try { setArContent(JSON.parse(ar.value)); } catch {}
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const upsertSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase
      .from("platform_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      await supabase.from("platform_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
    } else {
      await supabase.from("platform_settings").insert({ key, value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        upsertSetting("upsell_enabled", enabled ? "true" : "false"),
        upsertSetting("upsell_content_en", JSON.stringify(enContent)),
        upsertSetting("upsell_content_ar", JSON.stringify(arContent)),
      ]);
      toast.success("Upsell settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (lang: "en" | "ar", field: keyof UpsellContent, value: string) => {
    if (lang === "en") setEnContent((prev) => ({ ...prev, [field]: value }));
    else setArContent((prev) => ({ ...prev, [field]: value }));
  };

  const ContentFields = ({ lang, content }: { lang: "en" | "ar"; content: UpsellContent }) => (
    <div className="space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Headline</label>
        <Input value={content.headline} onChange={(e) => updateField(lang, "headline", e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Subtext</label>
        <Textarea value={content.subtext} onChange={(e) => updateField(lang, "subtext", e.target.value)} rows={3} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">⚠️ Risk Bullet</label>
        <Input value={content.bullet1} onChange={(e) => updateField(lang, "bullet1", e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">📈 Growth Bullet</label>
        <Input value={content.bullet2} onChange={(e) => updateField(lang, "bullet2", e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">🛡️ Shield Bullet</label>
        <Input value={content.bullet3} onChange={(e) => updateField(lang, "bullet3", e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">CTA Button</label>
        <Input value={content.cta} onChange={(e) => updateField(lang, "cta", e.target.value)} />
      </div>
    </div>
  );

  const previewContent = previewLang === "en" ? enContent : arContent;
  const bullets = [
    { icon: AlertTriangle, text: previewContent.bullet1, color: "text-amber-500" },
    { icon: TrendingUp, text: previewContent.bullet2, color: "text-trust-excellent" },
    { icon: Shield, text: previewContent.bullet3, color: "text-primary" },
  ];

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Upsell Teaser</h2>
          <p className="text-sm text-muted-foreground">Control the business insights upsell shown on developer profiles and buyer dashboard.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
      </div>

      {/* Toggle */}
      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="font-medium text-foreground">Enable Upsell Teaser</p>
            <p className="text-xs text-muted-foreground">Show upsell on developer profiles and buyer dashboard</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="en">
            <TabsList className="mb-4">
              <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
              <TabsTrigger value="ar">🇪🇬 Arabic</TabsTrigger>
            </TabsList>
            <TabsContent value="en">
              <ContentFields lang="en" content={enContent} />
            </TabsContent>
            <TabsContent value="ar">
              <ContentFields lang="ar" content={arContent} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Preview
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant={previewLang === "en" ? "default" : "outline"} onClick={() => setPreviewLang("en")}>EN</Button>
              <Button size="sm" variant={previewLang === "ar" ? "default" : "outline"} onClick={() => setPreviewLang("ar")}>AR</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div dir={previewLang === "ar" ? "rtl" : "ltr"} className="relative overflow-hidden rounded-2xl border border-border">
            <div className="absolute inset-0 opacity-20 blur-sm pointer-events-none">
              <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0,120 C30,100 60,80 100,90 C140,100 160,60 200,50 C240,40 280,70 320,55 C360,40 380,60 400,50" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                <path d="M0,140 C40,130 80,110 120,115 C160,120 200,90 240,85 C280,80 320,100 360,90 C380,85 400,95 400,90" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/95 to-card/70 pointer-events-none" />
            <div className="relative z-10 p-5">
              <div className="space-y-3 mb-5">
                {bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <b.icon className={`w-4 h-4 ${b.color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">{b.text}</p>
                  </div>
                ))}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                {previewContent.headline}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{previewContent.subtext}</p>
              <div className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm text-center flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {previewContent.cta}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUpsell;
