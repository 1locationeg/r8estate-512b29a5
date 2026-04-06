import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, X, Flame, Clock, Zap, Sparkles } from 'lucide-react';

// Multi-stop gradient bar: green → yellow → orange → red based on fill %
function getBarGradient(pct: number) {
  // The bar itself shows a gradient from green (0%) through yellow/orange to red (100%)
  // This visually communicates urgency as slots fill
  return `linear-gradient(90deg, 
    hsl(142, 76%, 46%) 0%, 
    hsl(80, 80%, 50%) 25%, 
    hsl(48, 96%, 53%) 50%, 
    hsl(25, 95%, 53%) 75%, 
    hsl(0, 84%, 52%) 100%)`;
}

// Glow color based on remaining percentage
function getGlowColor(remainPct: number) {
  if (remainPct <= 10) return 'rgba(239, 68, 68, 0.6)';
  if (remainPct <= 30) return 'rgba(245, 158, 11, 0.5)';
  if (remainPct <= 60) return 'rgba(234, 179, 8, 0.4)';
  return 'rgba(16, 185, 129, 0.4)';
}

function getTierText(remainPct: number, isAr: boolean) {
  if (remainPct <= 10) return isAr ? '🔥 الأماكن على وشك النفاد! سجّل الآن' : '🔥 Almost gone! Claim yours NOW';
  if (remainPct <= 30) return isAr ? '⚡ الأماكن تمتلئ بسرعة — لا تفوّت الفرصة' : '⚡ Filling up fast — don\'t miss out';
  if (remainPct <= 60) return isAr ? '⏳ الأماكن تنفد — احجز مكانك' : '⏳ Spots are going — secure yours';
  return isAr ? '✨ أماكن محدودة — انضم الآن' : '✨ Limited spots — join now';
}

function getTierIcon(remainPct: number) {
  if (remainPct <= 10) return <Flame className="w-4 h-4 text-red-300 animate-bounce" />;
  if (remainPct <= 30) return <Zap className="w-4 h-4 text-amber-300 animate-pulse" />;
  if (remainPct <= 60) return <Clock className="w-4 h-4 text-yellow-200" />;
  return <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />;
}

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
        supabase.rpc('get_profiles_count'),
      ]);
      setEnabled(enabledRes.data?.value === 'true');
      setTotal(totalRes.data?.value ? Number(totalRes.data.value) : 100);
      setRegistered(countRes.data ?? 0);
      setLoaded(true);
    };
    load();
  }, []);

  if (!loaded || !enabled || dismissed) return null;

  const remaining = Math.max(total - registered, 0);
  const pct = total > 0 ? Math.min((registered / total) * 100, 100) : 0;
  const remainPct = total > 0 ? (remaining / total) * 100 : 100;
  const isFull = remaining <= 0;
  const isAr = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';

  const pulseClass = remainPct <= 10 ? 'animate-pulse' : '';
  const glowColor = getGlowColor(remainPct);

  return (
    <div
      className="w-full relative overflow-hidden transition-all duration-700"
      style={{
        background: 'linear-gradient(135deg, hsl(210, 80%, 8%) 0%, hsl(220, 60%, 14%) 40%, hsl(215, 50%, 18%) 100%)',
        boxShadow: `0 4px 30px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Animated glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl animate-pulse"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%)', animationDelay: '1s' }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTierIcon(remainPct)}
              <span className={`text-xs sm:text-sm font-bold tracking-wide ${pulseClass}`}
                style={{ 
                  background: 'linear-gradient(90deg, #fff, #a5f3fc, #fff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
                }}>
                {isFull ? '🚫 All slots claimed!' : getTierText(remainPct, isAr)}
              </span>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/10"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-white/50" />
            </button>
          </div>

          {!isFull && (
            <>
              {/* Multi-color progress bar */}
              <div className="relative h-3.5 w-full overflow-hidden rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{
                    width: `${pct}%`,
                    background: getBarGradient(pct),
                    boxShadow: `0 0 12px ${glowColor}, 0 0 4px rgba(255,255,255,0.3)`,
                  }}
                >
                  {/* Shimmer overlay on bar */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] rounded-full" />
                </div>
              </div>

              {/* Bottom row: counts */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-medium">
                  <span className="font-extrabold text-sm sm:text-base text-cyan-300"
                    style={{ textShadow: '0 0 8px rgba(6,182,212,0.4)' }}>
                    {registered}
                  </span>
                  <span className="text-white/50"> / {total} {isAr ? 'انضم' : 'joined'}</span>
                </span>
                <span className={`text-xs sm:text-sm font-extrabold ${pulseClass}`}
                  style={{
                    background: remainPct <= 30
                      ? 'linear-gradient(90deg, #fbbf24, #ef4444)'
                      : 'linear-gradient(90deg, #34d399, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: `0 0 12px ${glowColor}`,
                  }}>
                  {isAr ? `${remaining} متبقي فقط!` : `Only ${remaining} left!`}
                </span>
              </div>
            </>
          )}

          {isFull && (
            <p className="text-cyan-200/60 text-xs text-center">
              {isAr ? 'يمكنك الانضمام لقائمة الانتظار أدناه' : 'You can still join the waitlist below'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
