import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Loader2, RotateCcw, ScanSearch, Eye } from "lucide-react";
import { TruthCheckHero } from "@/components/TruthCheckHero";
import {
  TRUTH_CHECK_DEFAULTS,
  fireTruthCheckSettingsUpdate,
  useTruthCheckSettings,
} from "@/hooks/useTruthCheckSettings";

const SETTING_KEYS = {
  enabled: "truth_check_enabled",
  showOnHomepage: "truth_check_show_on_homepage",
  pageEnabled: "truth_check_page_enabled",
  showCompareLink: "truth_check_show_compare_link",
  pageTitle: "truth_check_page_title",
  pageSubtitle: "truth_check_page_subtitle",
  cardEyebrow: "truth_check_card_eyebrow",
  exampleClaims: "truth_check_example_claims",
  throttleSeconds: "truth_check_throttle_seconds",
  minClaimChars: "truth_check_min_claim_chars",
  requireAuth: "truth_check_require_auth",
} as const;

const AdminTruthCheck = () => {
  const { settings, loading, refetch } = useTruthCheckSettings();
  const [saving, setSaving] = useState(false);

  // local form state mirrors hook
  const [enabled, setEnabled] = useState(settings.enabled);
  const [showOnHomepage, setShowOnHomepage] = useState(settings.showOnHomepage);
  const [pageEnabled, setPageEnabled] = useState(settings.pageEnabled);
  const [showCompareLink, setShowCompareLink] = useState(settings.showCompareLink);
  const [pageTitle, setPageTitle] = useState(settings.pageTitle);
  const [pageSubtitle, setPageSubtitle] = useState(settings.pageSubtitle);
  const [cardEyebrow, setCardEyebrow] = useState(settings.cardEyebrow);
  const [exampleClaimsText, setExampleClaimsText] = useState(
    settings.exampleClaims.join("\n"),
  );
  const [throttleSeconds, setThrottleSeconds] = useState(settings.throttleSeconds);
  const [minClaimChars, setMinClaimChars] = useState(settings.minClaimChars);
  const [requireAuth, setRequireAuth] = useState(settings.requireAuth);

  useEffect(() => {
    if (loading) return;
    setEnabled(settings.enabled);
    setShowOnHomepage(settings.showOnHomepage);
    setPageEnabled(settings.pageEnabled);
    setShowCompareLink(settings.showCompareLink);
    setPageTitle(settings.pageTitle);
    setPageSubtitle(settings.pageSubtitle);
    setCardEyebrow(settings.cardEyebrow);
    setExampleClaimsText(settings.exampleClaims.join("\n"));
    setThrottleSeconds(settings.throttleSeconds);
    setMinClaimChars(settings.minClaimChars);
    setRequireAuth(settings.requireAuth);
  }, [loading, settings]);

  const save = async () => {
    setSaving(true);
    try {
      const rows = [
        { key: SETTING_KEYS.enabled, value: String(enabled) },
        { key: SETTING_KEYS.showOnHomepage, value: String(showOnHomepage) },
        { key: SETTING_KEYS.pageEnabled, value: String(pageEnabled) },
        { key: SETTING_KEYS.showCompareLink, value: String(showCompareLink) },
        { key: SETTING_KEYS.pageTitle, value: pageTitle.trim() || TRUTH_CHECK_DEFAULTS.pageTitle },
        {
          key: SETTING_KEYS.pageSubtitle,
          value: pageSubtitle.trim() || TRUTH_CHECK_DEFAULTS.pageSubtitle,
        },
        {
          key: SETTING_KEYS.cardEyebrow,
          value: cardEyebrow.trim() || TRUTH_CHECK_DEFAULTS.cardEyebrow,
        },
        {
          key: SETTING_KEYS.exampleClaims,
          value: exampleClaimsText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .slice(0, 6)
            .join("\n"),
        },
        {
          key: SETTING_KEYS.throttleSeconds,
          value: String(Math.max(0, Math.min(120, throttleSeconds))),
        },
        {
          key: SETTING_KEYS.minClaimChars,
          value: String(Math.max(1, Math.min(200, minClaimChars))),
        },
        { key: SETTING_KEYS.requireAuth, value: String(requireAuth) },
      ];

      const { error } = await supabase
        .from("platform_settings")
        .upsert(rows, { onConflict: "key" });

      if (error) throw error;

      fireTruthCheckSettingsUpdate();
      await refetch();
      toast.success("Truth-Check settings saved");
    } catch (err: any) {
      console.error("AdminTruthCheck save failed", err);
      toast.error(err?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setEnabled(TRUTH_CHECK_DEFAULTS.enabled);
    setShowOnHomepage(TRUTH_CHECK_DEFAULTS.showOnHomepage);
    setPageEnabled(TRUTH_CHECK_DEFAULTS.pageEnabled);
    setShowCompareLink(TRUTH_CHECK_DEFAULTS.showCompareLink);
    setPageTitle(TRUTH_CHECK_DEFAULTS.pageTitle);
    setPageSubtitle(TRUTH_CHECK_DEFAULTS.pageSubtitle);
    setCardEyebrow(TRUTH_CHECK_DEFAULTS.cardEyebrow);
    setExampleClaimsText(TRUTH_CHECK_DEFAULTS.exampleClaims.join("\n"));
    setThrottleSeconds(TRUTH_CHECK_DEFAULTS.throttleSeconds);
    setMinClaimChars(TRUTH_CHECK_DEFAULTS.minClaimChars);
    setRequireAuth(TRUTH_CHECK_DEFAULTS.requireAuth);
    toast.info("Reset to defaults (not saved yet)");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScanSearch className="w-6 h-6 text-primary" />
            Truth-Check Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the Truth-Check feature site-wide. Show or hide it, edit copy and
            example claims, and tune limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetToDefaults} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </Button>
        </div>
      </div>

      {/* Master switch */}
      <Card className={enabled ? "" : "border-destructive/40"}>
        <CardHeader>
          <CardTitle>Master switch</CardTitle>
          <CardDescription>
            Turn the entire Truth-Check feature on or off. When off, the homepage card
            is hidden and the dedicated page redirects users to home.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-muted/30">
            <div>
              <Label htmlFor="tc-enabled" className="text-base font-semibold">
                Truth-Check is {enabled ? "ENABLED" : "DISABLED"}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Affects homepage card, dedicated /truth-check page, and the edge
                function.
              </p>
            </div>
            <Switch id="tc-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Placement */}
      <Card className={enabled ? "" : "opacity-60 pointer-events-none"}>
        <CardHeader>
          <CardTitle>Placement</CardTitle>
          <CardDescription>Choose where Truth-Check appears.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
            <div>
              <Label htmlFor="tc-home">Show card on Homepage</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                The Truth-Check card between Reviewer Spotlight and Hero Next Steps.
              </p>
            </div>
            <Switch id="tc-home" checked={showOnHomepage} onCheckedChange={setShowOnHomepage} />
          </div>
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
            <div>
              <Label htmlFor="tc-page">Enable /truth-check page</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                The dedicated landing page (used by smart-links and shareable URLs).
              </p>
            </div>
            <Switch id="tc-page" checked={pageEnabled} onCheckedChange={setPageEnabled} />
          </div>
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
            <div>
              <Label htmlFor="tc-compare">Show "Truth-Check" link in Compare modal</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Adds a quick entry point from the Compare engine.
              </p>
            </div>
            <Switch
              id="tc-compare"
              checked={showCompareLink}
              onCheckedChange={setShowCompareLink}
            />
          </div>
        </CardContent>
      </Card>

      {/* Copy & content */}
      <Card className={enabled ? "" : "opacity-60 pointer-events-none"}>
        <CardHeader>
          <CardTitle>Copy & content</CardTitle>
          <CardDescription>
            Customise the headline, subtitle, badge text and example chips users see.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Page title</Label>
            <Input
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              dir="auto"
              maxLength={140}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Page subtitle</Label>
            <Textarea
              value={pageSubtitle}
              onChange={(e) => setPageSubtitle(e.target.value)}
              rows={2}
              dir="auto"
              maxLength={300}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Card eyebrow / badge</Label>
            <Input
              value={cardEyebrow}
              onChange={(e) => setCardEyebrow(e.target.value)}
              dir="auto"
              maxLength={40}
            />
          </div>
          <Separator />
          <div>
            <Label className="mb-1.5 block">Example claims (one per line, max 6)</Label>
            <Textarea
              value={exampleClaimsText}
              onChange={(e) => setExampleClaimsText(e.target.value)}
              rows={5}
              dir="auto"
              className="font-mono text-sm"
              placeholder={"Delivery in 2026, 100% on schedule\nThe biggest developer in New Cairo"}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              These appear as one-tap suggestion chips under the input. Empty lines are
              ignored.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Behaviour */}
      <Card className={enabled ? "" : "opacity-60 pointer-events-none"}>
        <CardHeader>
          <CardTitle>Behaviour & safety</CardTitle>
          <CardDescription>
            Throttle, minimum claim length, and authentication requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Per-IP throttle (seconds)</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={throttleSeconds}
                onChange={(e) =>
                  setThrottleSeconds(parseInt(e.target.value || "0", 10))
                }
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Minimum gap between two checks from the same IP. Default 10.
              </p>
            </div>
            <div>
              <Label className="mb-1.5 block">Minimum claim length (chars)</Label>
              <Input
                type="number"
                min={1}
                max={200}
                value={minClaimChars}
                onChange={(e) =>
                  setMinClaimChars(parseInt(e.target.value || "1", 10))
                }
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Reject claims shorter than this. Default 8.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
            <div>
              <Label htmlFor="tc-auth">Require sign-in to use Truth-Check</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                When on, guests see a sign-in CTA instead of the input, and the edge
                function rejects anonymous calls.
              </p>
            </div>
            <Switch id="tc-auth" checked={requireAuth} onCheckedChange={setRequireAuth} />
          </div>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" /> Live preview
          </CardTitle>
          <CardDescription>
            What users currently see (reflects the saved settings — save first to
            preview new copy).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.enabled ? (
            <TruthCheckHero variant="compact" />
          ) : (
            <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
              Truth-Check is currently disabled — nothing is shown to users.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky bottom save */}
      <div className="flex items-center justify-end gap-2 sticky bottom-4 bg-background/80 backdrop-blur p-3 rounded-lg border shadow-sm">
        <Button variant="outline" onClick={resetToDefaults} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
};

export default AdminTruthCheck;
