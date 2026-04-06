import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users } from 'lucide-react';

export function RegistrationSlotsBanner() {
  const [enabled, setEnabled] = useState(false);
  const [total, setTotal] = useState(100);
  const [registered, setRegistered] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [enabledRes, totalRes, countRes] = await Promise.all([
        supabase.from('platform_settings').select('value').eq('key', 'registration_slots_enabled').maybeSingle(),
        supabase.from('platform_settings').select('value').eq('key', 'registration_slots_total').maybeSingle(),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      setEnabled(enabledRes.data?.value === 'true');
      setTotal(totalRes.data?.value ? Number(totalRes.data.value) : 100);
      setRegistered(countRes.count ?? 0);
      setLoaded(true);
    };
    load();
  }, []);

  if (!loaded || !enabled) return null;

  const remaining = Math.max(total - registered, 0);
  const pct = total > 0 ? Math.min((registered / total) * 100, 100) : 0;
  const isFull = remaining <= 0;
  const isUrgent = remaining > 0 && remaining <= total * 0.1;

  if (isFull) {
    return (
      <div className="w-full rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center">
        <p className="text-sm font-bold text-destructive">🚫 All {total} slots have been claimed!</p>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-xl border p-4 space-y-2.5 ${isUrgent ? 'border-destructive/40 bg-destructive/5' : 'border-primary/20 bg-primary/5'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${isUrgent ? 'text-destructive' : 'text-primary'}`} />
          <span className="text-sm font-bold text-foreground">
            {registered} of {total} slots claimed
          </span>
        </div>
        <span className={`text-xs font-semibold ${isUrgent ? 'text-destructive' : 'text-primary'}`}>
          {remaining} left{isUrgent ? ' ⚡' : ''}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isUrgent ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isUrgent && (
        <p className="text-xs text-destructive font-medium text-center animate-pulse">
          Hurry — slots are filling up fast!
        </p>
      )}
    </div>
  );
}
