import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, X } from 'lucide-react';

export function RegistrationSlotsBanner() {
  const [enabled, setEnabled] = useState(false);
  const [total, setTotal] = useState(100);
  const [registered, setRegistered] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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

  if (!loaded || !enabled || dismissed) return null;

  const remaining = Math.max(total - registered, 0);
  const pct = total > 0 ? Math.min((registered / total) * 100, 100) : 0;
  const remainPct = total > 0 ? (remaining / total) * 100 : 100;
  const isFull = remaining <= 0;

  const barColor =
    remainPct <= 10 ? 'bg-destructive'
    : remainPct <= 30 ? 'bg-[hsl(30,90%,50%)]'
    : remainPct <= 60 ? 'bg-[hsl(45,90%,50%)]'
    : 'bg-primary';

  const labelColor =
    remainPct <= 10 ? 'text-destructive'
    : remainPct <= 30 ? 'text-[hsl(30,90%,50%)]'
    : remainPct <= 60 ? 'text-[hsl(45,90%,50%)]'
    : 'text-primary';

  const borderColor =
    remainPct <= 10 ? 'border-destructive/40'
    : remainPct <= 30 ? 'border-[hsl(30,90%,50%)]/40'
    : remainPct <= 60 ? 'border-[hsl(45,90%,50%)]/40'
    : 'border-primary/30';

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-72 rounded-xl border ${borderColor} bg-card shadow-xl p-4 space-y-2.5 animate-[slideUp_0.4s_ease-out]`}
      style={{ animationFillMode: 'both' }}
    >
      {/* Close button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {isFull ? (
        <div className="text-center py-1">
          <p className="text-sm font-bold text-destructive">🚫 All {total} slots claimed!</p>
          <p className="text-xs text-muted-foreground mt-1">You can still sign up for the waitlist</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between pr-4">
            <div className="flex items-center gap-2">
              <Users className={`w-4 h-4 ${labelColor}`} />
              <span className="text-sm font-bold text-foreground">
                {registered} / {total} slots
              </span>
            </div>
            <span className={`text-xs font-semibold ${labelColor}`}>
              {remaining} left
            </span>
          </div>

          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {remainPct <= 10 && (
            <p className="text-xs text-destructive font-medium text-center animate-pulse">
              ⚠️ Almost full — hurry!
            </p>
          )}
        </>
      )}
    </div>
  );
}
