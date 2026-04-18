// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Copy, Eye, Trash2, Code, ExternalLink, BarChart3, Sparkles } from "lucide-react";
import { MicroBadge } from "@/components/widgets/MicroBadge";
import { EntityProfileWidget } from "@/components/widgets/EntityProfileWidget";
import { ProjectJourneyWidget } from "@/components/widgets/ProjectJourneyWidget";
import { ComparisonStrip } from "@/components/widgets/ComparisonStrip";
import { ReviewUsWidget } from "@/components/widgets/ReviewUsWidget";

const WIDGET_TYPES = [
  { value: "micro_badge", label: "Micro Badge", desc: "Compact trust score badge", width: 360, height: 100 },
  { value: "entity_profile", label: "Entity Profile", desc: "Full profile card with reviews", width: 420, height: 400 },
  { value: "project_journey", label: "Project Journey", desc: "Project status timeline", width: 440, height: 280 },
  { value: "comparison_strip", label: "Comparison Strip", desc: "Score vs market average", width: 580, height: 140 },
  { value: "review_us", label: "Review Us CTA", desc: "Invite customers to review", width: 340, height: 260 },
];

const BusinessWidgets = () => {
  const { profile: businessProfile } = useBusinessProfile();
  const [widgets, setWidgets] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, { impressions: number; clicks: number }>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [embedCodeToken, setEmbedCodeToken] = useState<string | null>(null);

  const [formType, setFormType] = useState("micro_badge");
  const [formTheme, setFormTheme] = useState<"dark" | "light">("dark");
  const [formLanguage, setFormLanguage] = useState("en");
  const [formShowVerified, setFormShowVerified] = useState(true);
  const [formCtaUrl, setFormCtaUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchWidgets = async () => {
    if (!businessProfile?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("widget_configs")
      .select("*")
      .eq("entity_id", businessProfile.id)
      .order("created_at", { ascending: false });
    setWidgets(data || []);
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    if (!businessProfile?.id) return;
    const { data } = await supabase
      .from("widget_analytics")
      .select("embed_token, event_type");
    if (!data) return;
    const map: Record<string, { impressions: number; clicks: number }> = {};
    data.forEach((row: any) => {
      if (!map[row.embed_token]) map[row.embed_token] = { impressions: 0, clicks: 0 };
      if (row.event_type === "impression") map[row.embed_token].impressions++;
      else if (row.event_type === "click") map[row.embed_token].clicks++;
    });
    setAnalytics(map);
  };

  useEffect(() => {
    fetchWidgets();
    fetchAnalytics();
  }, [businessProfile?.id]);

  const handleCreate = async () => {
    if (!businessProfile?.id) {
      toast.error("Complete your business profile first.");
      return;
    }
    setSaving(true);
    const { data: tokenData } = await supabase.rpc("generate_embed_token");
    const token = tokenData || Math.random().toString(36).substring(2, 14);

    const { error } = await supabase.from("widget_configs").insert({
      type: formType,
      entity_type: "developer",
      entity_id: businessProfile.id,
      settings: {
        theme: formTheme,
        language: formLanguage,
        show_verified: formShowVerified,
        cta_url: formCtaUrl || null,
        max_reviews: 2,
      },
      embed_token: token,
      is_active: true,
    });

    setSaving(false);
    if (error) {
      toast.error("Failed to create widget: " + error.message);
      return;
    }
    toast.success("Widget created!");
    setShowCreate(false);
    setEmbedCodeToken(token);
    fetchWidgets();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("widget_configs").update({ is_active: !current }).eq("id", id);
    fetchWidgets();
  };

  const deleteWidget = async (id: string) => {
    if (!confirm("Delete this widget? Existing embeds will stop working.")) return;
    await supabase.from("widget_configs").delete().eq("id", id);
    toast.success("Widget deleted");
    fetchWidgets();
  };

  const getEmbedCode = (token: string) => {
    const wt = widgets.find((w) => w.embed_token === token);
    const dims = WIDGET_TYPES.find((t) => t.value === wt?.type);
    const w = dims?.width || 400;
    const h = dims?.height || 300;
    return `<iframe src="${window.location.origin}/embed/widget/${token}" width="${w}" height="${h}" frameborder="0" scrolling="no" style="border:none;overflow:hidden;border-radius:16px;"></iframe>`;
  };

  const copyEmbed = (token: string) => {
    navigator.clipboard.writeText(getEmbedCode(token));
    toast.success("Embed code copied!");
  };

  const renderPreview = (type: string, theme: string) => {
    const props = {
      entityName: businessProfile?.company_name || "Your Business",
      score: 4.3,
      reviewCount: 28,
      theme: theme as "dark" | "light",
      ctaUrl: "#",
    };
    switch (type) {
      case "micro_badge": return <MicroBadge {...props} />;
      case "entity_profile":
        return (
          <EntityProfileWidget
            {...props}
            entityType="Developer"
            recentReviews={[{ authorName: "Ahmed M.", rating: 5, comment: "Excellent experience, very professional." }]}
          />
        );
      case "project_journey":
        return <ProjectJourneyWidget projectName={props.entityName} developerName={props.entityName} score={props.score} reviewCount={props.reviewCount} theme={props.theme} />;
      case "comparison_strip": return <ComparisonStrip {...props} />;
      case "review_us": return <ReviewUsWidget entityName={props.entityName} theme={props.theme} />;
      default: return null;
    }
  };

  if (!businessProfile?.id) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <Sparkles className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold text-foreground mb-1">Set up your business profile first</h3>
        <p className="text-sm text-muted-foreground">
          Complete your business profile to start generating embeddable trust widgets for your website.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Trust Widgets</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Embed your R8ESTATE trust score and reviews on your own website. Drives credibility and traffic.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={16} /> Create Widget
        </Button>
      </div>

      {/* Widget cards */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading widgets...</div>
      ) : widgets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <Code className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No widgets yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first embeddable widget in under a minute.
          </p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus size={16} /> Create Your First Widget
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgets.map((w) => {
            const meta = WIDGET_TYPES.find((t) => t.value === w.type);
            const stats = analytics[w.embed_token] || { impressions: 0, clicks: 0 };
            return (
              <div key={w.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="inline-block text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-1">
                      {meta?.label || w.type}
                    </div>
                    <p className="text-xs text-muted-foreground">{meta?.desc}</p>
                  </div>
                  <Switch checked={w.is_active} onCheckedChange={() => toggleActive(w.id, w.is_active)} />
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground border-y border-border py-2">
                  <span className="flex items-center gap-1">
                    <BarChart3 size={12} /> {stats.impressions.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ExternalLink size={12} /> {stats.clicks.toLocaleString()} clicks
                  </span>
                  <span className="ms-auto">{new Date(w.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setPreviewToken(w.embed_token)} className="gap-1 text-xs">
                    <Eye size={12} /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEmbedCodeToken(w.embed_token)} className="gap-1 text-xs">
                    <Code size={12} /> Embed
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyEmbed(w.embed_token)} className="gap-1 text-xs">
                    <Copy size={12} /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteWidget(w.id)} className="gap-1 text-xs text-destructive ms-auto">
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Widget Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WIDGET_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Theme</Label>
                <Select value={formTheme} onValueChange={(v) => setFormTheme(v as "dark" | "light")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Language</Label>
                <Select value={formLanguage} onValueChange={setFormLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Verified Badge</Label>
              <Switch checked={formShowVerified} onCheckedChange={setFormShowVerified} />
            </div>

            <div>
              <Label>Custom CTA URL (optional)</Label>
              <Input value={formCtaUrl} onChange={(e) => setFormCtaUrl(e.target.value)} placeholder="https://yoursite.com/reviews" />
              <p className="text-[11px] text-muted-foreground mt-1">Leave empty to link to your R8ESTATE profile.</p>
            </div>

            <div>
              <Label className="mb-2 block">Live Preview</Label>
              <div className="rounded-xl bg-muted/50 p-4 flex items-center justify-center">
                {renderPreview(formType, formTheme)}
              </div>
            </div>

            <Button onClick={handleCreate} disabled={saving} className="w-full">
              {saving ? "Creating..." : "Create Widget"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={!!previewToken} onOpenChange={() => setPreviewToken(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Widget Preview</DialogTitle></DialogHeader>
          {previewToken && (
            <div className="flex items-center justify-center p-4">
              <iframe
                src={`${window.location.origin}/embed/widget/${previewToken}`}
                className="rounded-2xl"
                style={{
                  width: WIDGET_TYPES.find((t) => t.value === widgets.find((w) => w.embed_token === previewToken)?.type)?.width || 400,
                  height: WIDGET_TYPES.find((t) => t.value === widgets.find((w) => w.embed_token === previewToken)?.type)?.height || 300,
                  border: "none",
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Embed code modal */}
      <Dialog open={!!embedCodeToken} onOpenChange={() => setEmbedCodeToken(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Embed Code</DialogTitle></DialogHeader>
          {embedCodeToken && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Paste this HTML into your website:</Label>
                <div className="relative">
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {getEmbedCode(embedCodeToken)}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 end-2 gap-1"
                    onClick={() => copyEmbed(embedCodeToken)}
                  >
                    <Copy size={12} /> Copy
                  </Button>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Live Preview:</Label>
                <div className="rounded-xl bg-muted/50 p-4 flex items-center justify-center">
                  <iframe
                    src={`${window.location.origin}/embed/widget/${embedCodeToken}`}
                    className="rounded-2xl"
                    style={{
                      width: WIDGET_TYPES.find((t) => t.value === widgets.find((w) => w.embed_token === embedCodeToken)?.type)?.width || 400,
                      height: WIDGET_TYPES.find((t) => t.value === widgets.find((w) => w.embed_token === embedCodeToken)?.type)?.height || 300,
                      border: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessWidgets;
