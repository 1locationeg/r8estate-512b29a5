import { useNavigate } from 'react-router-dom';
import { Clock, X, Zap } from 'lucide-react';
import { useGuestTimer } from '@/contexts/GuestTimerContext';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function GuestTimerBanner() {
  const { secondsLeft, isGuest, isExpired } = useGuestTimer();
  const navigate = useNavigate();

  if (!isGuest || isExpired) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 60; // last minute = red
  const isCritical = secondsLeft <= 20; // last 20s = pulsing

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-4 pb-2.5
        pt-[max(0.625rem,env(safe-area-inset-top))] safe-x
        transition-all duration-700
        ${isUrgent
          ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500'
          : 'bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400'
        }
        ${isCritical ? 'animate-pulse' : ''}
      `}
    >
      {/* Left: icon + label */}
      <div className="flex items-center gap-2 text-white">
        <Clock className="w-4 h-4 shrink-0" />
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
          Free Preview
        </span>
      </div>

      {/* Center: countdown */}
      <div className="flex items-center gap-3">
        <span
          className={`
            text-white font-mono font-extrabold text-lg sm:text-xl tracking-widest
            drop-shadow-md
            ${isCritical ? 'text-yellow-200' : ''}
          `}
        >
          {pad(minutes)}:{pad(seconds)}
        </span>
        <button
          onClick={() => navigate('/auth')}
          className="
            flex items-center gap-1.5 px-3 sm:px-4 py-1.5
            bg-white text-orange-600 hover:bg-orange-50
            rounded-full font-bold text-xs sm:text-sm
            shadow-md hover:shadow-lg
            transition-all duration-200 active:scale-95
            whitespace-nowrap
          "
        >
          <Zap className="w-3.5 h-3.5 fill-orange-500" />
          Sign Up Free
        </button>
      </div>

      {/* Right: remaining label */}
      <div className="hidden sm:block text-white/80 text-xs font-medium text-right">
        {isUrgent ? '⚡ Almost expired!' : 'remaining'}
      </div>
    </div>
  );
}
