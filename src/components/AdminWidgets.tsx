// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Copy, Eye, Trash2, Code, ExternalLink } from "lucide-react";
import { MicroBadge } from "@/components/widgets/MicroBadge";
import { EntityProfileWidget } from "@/components/widgets/EntityProfileWidget";
import { ProjectJourneyWidget } from "@/components/widgets/ProjectJourneyWidget";
import { ComparisonStrip } from "@/components/widgets/ComparisonStrip";
import { ReviewUsWidget } from "@/components/widgets/ReviewUsWidget";

const WIDGET_TYPES = [
  { value: "micro_badge", label: "Micro Badge", width: 360, height: 100 },
  { value: "entity_profile", label: "Entity Profile", width: 420, height: 400 },
  { value: "project_journey", label: "Project Journey", width: 440, height: 280 },
  { value: "comparison_strip", label: "Comparison Strip", width: 580, height: 140 },
  { value: "review_us", label: "Review Us CTA", width: 340, height: 260 },
];

const ENTITY_TYPES = [
  { value: "developer", label: "Developer" },
  { value: "project", label: "Project" },
  { value: "agent", label: "Agent" },
  { value: "agency", label: "Agency" },
];

const AdminWidgets = () => {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [embedCodeToken, setEmbedCodeToken] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState("micro_badge");
  const [formEntityType, setFormEntityType] = useState("developer");
  const [formEntityId, setFormEntityId] = useState("");
  const [formTheme, setFormTheme] = useState<"dark" | "light">("dark");
  const [formLanguage, setFormLanguage] = useState("en");
  const [formShowVerified, setFormShowVerified] = useState(true);
  const [formCtaUrl, setFormCtaUrl] = useState("");
  const [formMaxReviews, setFormMaxReviews] = useState(2);
  const [saving, setSaving] = useState(false);

  const fetchWidgets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("widget_configs")
      .select("*")
      .order("created_at", { ascending: false });
    setWidgets(data || []);
    setLoading(false);
  };

  const fetchBusinesses = async () => {
    const { data } = await supabase
      .from("business_profiles")
      .select("id, company_name")
      .order("company_name");
    setBusinesses(data || []);
  };

  useEffect(() => {
    fetchWidgets();
    fetchBusinesses();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    // Generate token
    const { data: tokenData } = await supabase.rpc("generate_embed_token");
    const token = tokenData || Math.random().toString(36).substring(2, 14);

    const { error } = await supabase.from("widget_configs").insert({
      type: formType,
      entity_type: formEntityType,
      entity_id: formEntityId,
      settings: {
        theme: formTheme,
        language: formLanguage,
        show_verified: formShowVerified,
        cta_url: formCtaUrl || null,
        max_reviews: formMaxReviews,
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
    toast.success("Embed code copied to clipboard!");
  };

  const getEntityName = (entityId: string) => {
    return businesses.find((b) => b.id === entityId)?.company_name || entityId;
  };

  const renderPreview = (type: string, theme: string) => {
    const props = { entityName: "Demo Entity", score: 4.3, reviewCount: 28, theme: theme as "dark" | "light", ctaUrl: "#" };
    switch (type) {
      case "micro_badge": return <MicroBadge {...props} />;
      case "entity_profile": return <EntityProfileWidget {...props} entityType="Developer" recentReviews={[{ authorName: "Ahmed M.", rating: 5, comment: "Excellent experience, very professional and transparent." }]} />;
      case "project_journey": return <ProjectJourneyWidget projectName="Demo Project" developerName="Demo Developer" score={props.score} reviewCount={props.reviewCount} theme={props.theme} />;
      case "comparison_strip": return <ComparisonStrip {...props} />;
      case "review_us": return <ReviewUsWidget entityName={props.entityName} theme={props.theme} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Embeddable Widgets</h2>
          <p className="text-sm text-muted-foreground">Create and manage trust widgets for external sites</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus size={16} /> Create Widget
        </Button>
      </div>

      {/* Widget list table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Entity</th>
              <th className="text-left px-4 py-3 font-medium">Entity Type</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Created</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : widgets.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No widgets yet. Create your first one!</td></tr>
            ) : (
              widgets.map((w) => (
                <tr key={w.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className="inline-block text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {WIDGET_TYPES.find((t) => t.value === w.type)?.label || w.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{getEntityName(w.entity_id)}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{w.entity_type}</td>
                  <td className="px-4 py-3">
                    <Switch checked={w.is_active} onCheckedChange={() => toggleActive(w.id, w.is_active)} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(w.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewToken(w.embed_token)} title="Preview">
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEmbedCodeToken(w.embed_token)} title="Embed Code">
                        <Code size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyEmbed(w.embed_token)} title="Copy Embed">
                        <Copy size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteWidget(w.id)} title="Delete">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Widget Dialog */}
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
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Entity Type</Label>
              <Select value={formEntityType} onValueChange={setFormEntityType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Entity (Business)</Label>
              <Select value={formEntityId} onValueChange={setFormEntityId}>
                <SelectTrigger><SelectValue placeholder="Select entity..." /></SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.company_name || b.id}</SelectItem>
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
              <Label>CTA URL (optional)</Label>
              <Input value={formCtaUrl} onChange={(e) => setFormCtaUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div>
              <Label>Max Reviews Shown</Label>
              <Input type="number" value={formMaxReviews} onChange={(e) => setFormMaxReviews(Number(e.target.value))} min={1} max={5} />
            </div>

            {/* Live preview */}
            <div>
              <Label className="mb-2 block">Preview</Label>
              <div className="rounded-xl bg-muted/50 p-4 flex items-center justify-center">
                {renderPreview(formType, formTheme)}
              </div>
            </div>

            <Button onClick={handleCreate} disabled={saving || !formEntityId} className="w-full">
              {saving ? "Creating..." : "Create Widget"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewToken} onOpenChange={() => setPreviewToken(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Widget Preview</DialogTitle>
          </DialogHeader>
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
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => window.open(`/embed/widget/${previewToken}`, "_blank")} className="gap-2">
              <ExternalLink size={14} /> Open Full View
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Embed Code Modal */}
      <Dialog open={!!embedCodeToken} onOpenChange={() => setEmbedCodeToken(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Embed Code</DialogTitle>
          </DialogHeader>
          {embedCodeToken && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Copy this HTML snippet into your website:</Label>
                <div className="relative">
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {getEmbedCode(embedCodeToken)}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 gap-1"
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

export default AdminWidgets;
