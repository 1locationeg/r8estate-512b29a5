import { useNavigate } from 'react-router-dom';
import { Star, Users, Building2, MessageSquare, ArrowRight, LogIn, Clock } from 'lucide-react';
import { useGuestTimer } from '@/contexts/GuestTimerContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const STATS = [
  { icon: MessageSquare, value: '50K+', label: 'Verified Reviews' },
  { icon: Building2, value: '1,200+', label: 'Companies Rated' },
  { icon: Users, value: '100K+', label: 'Active Users' },
  { icon: Star, value: '4.8★', label: 'Platform Trust Score' },
];

export function GuestTimerExpiredModal() {
  const { expiredModalOpen, dismissExpiredModal, isGuest } = useGuestTimer();
  const navigate = useNavigate();

  if (!isGuest) return null;

  const handleSignUp = () => {
    dismissExpiredModal();
    navigate('/auth');
  };

  const handleLogin = () => {
    dismissExpiredModal();
    navigate('/auth?mode=signin');
  };

  return (
    <Dialog open={expiredModalOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-full p-0 overflow-hidden border-0 shadow-2xl [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 px-6 pt-8 pb-10 text-white text-center relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,white,transparent)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 mx-auto">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2 leading-tight">
              Your Free Preview Has Ended
            </h2>
            <p className="text-white/85 text-sm leading-relaxed max-w-xs mx-auto">
              You've explored the platform! Create a free account to continue browsing with unlimited access.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px bg-border mx-0">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-background flex flex-col items-center justify-center py-4 px-3">
              <Icon className="w-4 h-4 text-primary mb-1" />
              <span className="text-xl font-extrabold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="p-5 flex flex-col gap-3 bg-background">
          <button
            onClick={handleSignUp}
            className="
              w-full flex items-center justify-center gap-2
              bg-gradient-to-r from-orange-500 to-red-500
              hover:from-orange-600 hover:to-red-600
              text-white font-bold py-3.5 rounded-xl
              shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40
              transition-all duration-200 active:scale-[0.98]
              text-sm
            "
          >
            <span>Sign Up Free — Continue Exploring</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogin}
            className="
              w-full flex items-center justify-center gap-2
              border border-border hover:border-primary/40
              text-foreground hover:text-primary
              font-semibold py-3 rounded-xl
              transition-all duration-200 active:scale-[0.98]
              text-sm bg-muted/40 hover:bg-muted/60
            "
          >
            <LogIn className="w-4 h-4" />
            Already have an account? Log In
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Free forever · No credit card required
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
