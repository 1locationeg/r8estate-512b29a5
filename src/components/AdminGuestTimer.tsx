import { useEffect, useState } from 'react';
import { Clock, Loader2, Power, Timer } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SETTINGS_KEYS = {
  enabled: 'guest_timer_enabled',
  duration: 'guest_timer_duration_seconds',
  bonus: 'guest_timer_bonus_seconds',
};

export default function AdminGuestTimer() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [durationSeconds, setDurationSeconds] = useState(180); // 3 min default
  const [bonusSeconds, setBonusSeconds] = useState(120); // 2 min default

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', Object.values(SETTINGS_KEYS));

      if (data) {
        data.forEach((row) => {
          if (row.key === SETTINGS_KEYS.enabled) setEnabled(row.value === 'true');
          if (row.key === SETTINGS_KEYS.duration) setDurationSeconds(parseInt(row.value) || 180);
          if (row.key === SETTINGS_KEYS.bonus) setBonusSeconds(parseInt(row.value) || 120);
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const settings = [
      { key: SETTINGS_KEYS.enabled, value: String(enabled) },
      { key: SETTINGS_KEYS.duration, value: String(durationSeconds) },
      { key: SETTINGS_KEYS.bonus, value: String(bonusSeconds) },
    ];

    for (const s of settings) {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', s.key)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('platform_settings')
          .update({ value: s.value, updated_at: new Date().toISOString() })
          .eq('key', s.key);
      } else {
        await supabase
          .from('platform_settings')
          .insert({ key: s.key, value: s.value });
      }
    }

    setSaving(false);
    toast.success('Guest timer settings saved');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s > 0 ? `${s}s` : ''}`.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" />
          Guest Preview Timer
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Control the guest preview timer duration and behavior for unauthenticated visitors.
        </p>
      </div>

      {/* Enable / Disable */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Power className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Guest Timer</p>
              <p className="text-xs text-muted-foreground">
                {enabled ? 'Timer is active — guests get limited preview time' : 'Timer is off — guests browse freely'}
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
      </div>

      {/* Duration Control */}
      <div className={`bg-card border border-border rounded-xl p-5 transition-opacity ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Preview Duration</p>
            <p className="text-xs text-muted-foreground">How long guests can browse before the signup modal appears</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-foreground">{formatTime(durationSeconds)}</span>
            <Input
              type="number"
              min={30}
              max={600}
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Math.max(30, Math.min(600, parseInt(e.target.value) || 30)))}
              className="w-24 text-center text-sm"
            />
          </div>
          <Slider
            value={[durationSeconds]}
            onValueChange={([v]) => setDurationSeconds(v)}
            min={30}
            max={600}
            step={10}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>30s</span>
            <span>1m</span>
            <span>3m</span>
            <span>5m</span>
            <span>10m</span>
          </div>
        </div>
      </div>

      {/* Bonus Time Control */}
      <div className={`bg-card border border-border rounded-xl p-5 transition-opacity ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-coin/15 flex items-center justify-center">
            <Timer className="w-5 h-5 text-coin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Bonus Time Reward</p>
            <p className="text-xs text-muted-foreground">Extra time granted when guest completes the feedback flow</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-foreground">{formatTime(bonusSeconds)}</span>
            <Input
              type="number"
              min={0}
              max={600}
              value={bonusSeconds}
              onChange={(e) => setBonusSeconds(Math.max(0, Math.min(600, parseInt(e.target.value) || 0)))}
              className="w-24 text-center text-sm"
            />
          </div>
          <Slider
            value={[bonusSeconds]}
            onValueChange={([v]) => setBonusSeconds(v)}
            min={0}
            max={600}
            step={10}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0s</span>
            <span>1m</span>
            <span>3m</span>
            <span>5m</span>
            <span>10m</span>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
          {saving && <Loader2 className="w-4 h-4 animate-spin me-2" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
