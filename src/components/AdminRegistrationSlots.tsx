import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Users, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRegistrationSlots() {
  const [enabled, setEnabled] = useState(false);
  const [total, setTotal] = useState(100);
  const [registered, setRegistered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [enabledRes, totalRes, countRes] = await Promise.all([
        supabase.from('platform_settings').select('value').eq('key', 'registration_slots_enabled').maybeSingle(),
        supabase.from('platform_settings').select('value').eq('key', 'registration_slots_total').maybeSingle(),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      setEnabled(enabledRes.data?.value === 'true');
      setTotal(totalRes.data?.value ? Number(totalRes.data.value) : 100);
      setRegistered(countRes.count ?? 0);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        supabase.from('platform_settings').upsert({ key: 'registration_slots_enabled', value: String(enabled) }, { onConflict: 'key' }),
        supabase.from('platform_settings').upsert({ key: 'registration_slots_total', value: String(total) }, { onConflict: 'key' }),
      ]);
      toast.success('Registration slots settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const pct = total > 0 ? Math.min((registered / total) * 100, 100) : 0;
  const remaining = Math.max(total - registered, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Registration Slots</h2>
        <p className="text-muted-foreground text-sm mt-1">Control a visible slot counter shown to visitors during stress tests or limited-access campaigns.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Enable Slot Counter</CardTitle>
              <CardDescription>Show a registration progress bar on the sign-up page</CardDescription>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Slots</CardTitle>
          <CardDescription>How many registration slots to offer (10–1000)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider value={[total]} onValueChange={([v]) => setTotal(v)} min={10} max={1000} step={10} className="flex-1" />
            <Input type="number" value={total} onChange={e => setTotal(Math.max(10, Math.min(1000, Number(e.target.value) || 10)))} className="w-24" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" /> Live Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={pct} className="h-5" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{registered} registered</span>
            <span className="font-bold text-foreground">{remaining} slots remaining</span>
          </div>
          <p className="text-xs text-muted-foreground">Counts actual rows in the profiles table — only completed registrations.</p>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </Button>
    </div>
  );
}
