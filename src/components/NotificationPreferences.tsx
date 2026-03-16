import { Bell, Megaphone, FileCheck, TrendingUp, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNotificationPreferences, NotificationPreferences as Prefs } from "@/hooks/useNotificationPreferences";

const PREF_CONFIG: {
  key: keyof Prefs;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: "review_notifications",
    label: "New Reviews",
    description: "Get notified when developers you follow, save, or show interest in receive new reviews.",
    icon: <Bell className="w-5 h-5" />,
    color: "text-primary",
  },
  {
    key: "announcement_notifications",
    label: "Announcements",
    description: "Platform-wide announcements, feature updates, and important news.",
    icon: <Megaphone className="w-5 h-5" />,
    color: "text-amber-500",
  },
  {
    key: "status_notifications",
    label: "Status Updates",
    description: "Receipt verification results, review moderation updates, and account status changes.",
    icon: <FileCheck className="w-5 h-5" />,
    color: "text-emerald-500",
  },
  {
    key: "trust_score_notifications",
    label: "Trust Score Changes",
    description: "Alerts when a developer's trust score changes significantly.",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "text-blue-500",
  },
  {
    key: "interest_notifications",
    label: "Activity-Based Alerts",
    description: "Smart notifications based on your browsing activity — developers you viewed, searched for, or lingered on.",
    icon: <Eye className="w-5 h-5" />,
    color: "text-purple-500",
  },
];

export const NotificationPreferences = () => {
  const { preferences, loading, saving, updatePreference } = useNotificationPreferences();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const enabledCount = Object.values(preferences).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which notifications you'd like to receive.
          </p>
        </div>
        <Badge variant={enabledCount === 5 ? "default" : "secondary"} className="text-xs">
          {enabledCount}/5 active
        </Badge>
      </div>

      <div className="space-y-3">
        {PREF_CONFIG.map(({ key, label, description, icon, color }) => (
          <Card
            key={key}
            className={`transition-all duration-200 ${
              preferences[key]
                ? "border-primary/20 bg-card shadow-sm"
                : "border-border/50 bg-muted/30 opacity-75"
            }`}
          >
            <CardContent className="flex items-center gap-4 py-4 px-5">
              <div className={`shrink-0 ${color}`}>{icon}</div>
              <div className="flex-1 min-w-0">
                <Label htmlFor={key} className="text-sm font-semibold text-foreground cursor-pointer">
                  {label}
                </Label>
                <CardDescription className="text-xs mt-0.5 leading-relaxed">
                  {description}
                </CardDescription>
              </div>
              <Switch
                id={key}
                checked={preferences[key]}
                onCheckedChange={(checked) => updatePreference(key, checked)}
                disabled={saving}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {saving && (
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
        </p>
      )}
    </div>
  );
};
