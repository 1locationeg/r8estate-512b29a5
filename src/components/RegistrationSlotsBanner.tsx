import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, X, Flame, Clock, Zap } from 'lucide-react';

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

  // 4-tier urgency system
  const tier = remainPct <= 10 ? 'critical' : remainPct <= 30 ? 'high' : remainPct <= 60 ? 'moderate' : 'calm';

  const bgGradient = {
    critical: 'from-red-600/95 via-red-500/95 to-orange-500/95',
    high: 'from-orange-600/95 via-orange-500/95 to-amber-400/95',
    moderate: 'from-amber-500/95 via-yellow-400/95 to-lime-400/95',
    calm: 'from-emerald-600/95 via-green-500/95 to-teal-400/95',
  }[tier];

  const barBg = {
    critical: 'bg-white/90',
    high: 'bg-white/90',
    moderate: 'bg-white/80',
    calm: 'bg-white/70',
  }[tier];

  const barFill = {
    critical: 'bg-red-300',
    high: 'bg-orange-300',
    moderate: 'bg-amber-300',
    calm: 'bg-emerald-300',
  }[tier];

  const pulseClass = tier === 'critical' ? 'animate-pulse' : '';

  const urgencyText = {
    critical: '🔥 Almost gone! Claim yours NOW',
    high: '⚡ Filling up fast — don\'t miss out',
    moderate: '⏳ Spots are going — secure yours',
    calm: '✅ Spots available — join now',
  }[tier];

  const urgencyIcon = {
    critical: <Flame className="w-4 h-4 text-yellow-200 animate-bounce" />,
    high: <Zap className="w-4 h-4 text-yellow-100" />,
    moderate: <Clock className="w-4 h-4 text-white/80" />,
    calm: <Users className="w-4 h-4 text-white/80" />,
  }[tier];

  return (
    <div className={`
      w-full bg-gradient-to-r ${bgGradient}
      backdrop-blur-sm shadow-lg
      px-4 py-3
      ${pulseClass}
      transition-all duration-700
    `}>
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Top row: urgency message + close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {urgencyIcon}
            <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
              {isFull ? '🚫 All slots claimed!' : urgencyText}
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>

        {!isFull && (
          <>
            {/* Progress bar */}
            <div className={`relative h-3 w-full overflow-hidden rounded-full ${barBg}`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${barFill}`}
                style={{ width: `${pct}%` }}
              />
              {/* Animated shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] rounded-full" />
            </div>

            {/* Bottom row: counts */}
            <div className="flex items-center justify-between text-white">
              <span className="text-[11px] sm:text-xs font-medium opacity-90">
                <span className="font-extrabold text-sm sm:text-base">{registered}</span>
                <span className="opacity-70"> / {total} joined</span>
              </span>
              <span className={`text-xs sm:text-sm font-extrabold ${tier === 'critical' ? 'text-yellow-200' : 'text-white'} ${pulseClass}`}>
                Only {remaining} left!
              </span>
            </div>
          </>
        )}

        {isFull && (
          <p className="text-white/80 text-xs text-center">
            You can still join the waitlist below
          </p>
        )}
      </div>
    </div>
  );
}
