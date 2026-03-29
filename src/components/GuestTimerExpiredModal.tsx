import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Building2, Users, ArrowRight, LogIn, Clock, Send, Loader2 } from 'lucide-react';
import { useGuestTimer } from '@/contexts/GuestTimerContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

function getOrCreateSessionId(): string {
  const key = 'r8estate_guest_session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function GuestTimerExpiredModal() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar');
  const { expiredModalOpen, dismissExpiredModal, isGuest, grantBonusTime, hasBonusBeenUsed } = useGuestTimer();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  if (!isGuest) return null;

  const STATS = [
    { icon: MessageSquare, value: '50K+', label: isAr ? 'تقييمات' : 'Reviews' },
    { icon: Building2, value: '1,200+', label: isAr ? 'شركة' : 'Companies' },
    { icon: Users, value: '100K+', label: isAr ? 'مستخدم' : 'Users' },
    { icon: Star, value: '4.8★', label: isAr ? 'متوسط التقييم' : 'Trust Score Avg' },
  ];

  const FEEDBACK_TYPES = [
    { value: 'value_found', label: isAr ? 'محتوى مفيد' : 'Your feedback is valuable' },
    { value: 'advice', label: isAr ? 'اقتراحات' : 'Suggestions' },
    { value: 'general', label: isAr ? 'عام' : 'General' },
  ];

  const handleSignUp = () => {
    dismissExpiredModal();
    navigate('/auth');
  };

  const handleLogin = () => {
    dismissExpiredModal();
    navigate('/auth?mode=signin');
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error(isAr ? 'يرجى اختيار تقييم' : 'Please select a rating');
      return;
    }
    if (feedbackText.trim().length < 5) {
      toast.error(isAr ? 'اكتب على الأقل 5 أحرف' : 'Please write at least 5 characters');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('guest_feedback').insert({
      rating,
      feedback: feedbackText.trim(),
      feedback_type: feedbackType,
      session_id: getOrCreateSessionId(),
    });

    setSubmitting(false);

    if (error) {
      toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, try again');
      return;
    }

    toast.success(isAr ? '🎉 شكراً! تم إضافة دقيقتين' : '🎉 Thanks! 2 bonus minutes added');
    grantBonusTime();
  };

  return (
    <Dialog open={expiredModalOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm w-[calc(100vw-2rem)] max-h-[100dvh] overflow-y-auto p-0 border-0 shadow-2xl [&>button]:hidden rounded-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Hero header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-accent px-5 pt-5 pb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,white,transparent)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-2 mx-auto">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-white mb-1">
              {isAr ? 'انتهت المعاينة' : 'Preview ended'}
            </h2>
            <p className="text-white/80 text-xs leading-relaxed max-w-[240px] mx-auto">
              {isAr
                ? 'انتهت المعاينة المجانية. سجّل للمتابعة'
                : 'Your free preview has ended. Sign up to continue exploring.'}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-px bg-border">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-background flex flex-col items-center justify-center py-2.5 px-1">
              <Icon className="w-3.5 h-3.5 text-muted-foreground mb-0.5" />
              <span className="text-sm font-extrabold text-foreground leading-none">{value}</span>
              <span className="text-[9px] text-muted-foreground text-center leading-tight mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Inline feedback — always visible if bonus not used */}
        {!hasBonusBeenUsed && (
          <div className="px-4 pt-3 pb-1">
            <div className="bg-muted/30 rounded-xl p-3 border border-border space-y-2.5">
              <p className="text-xs font-semibold text-foreground">
                {isAr ? 'قيّم تجربتك' : 'Rate your experience'}
              </p>

              {/* Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= (hoverRating || rating)
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback type chips */}
              <div className="flex flex-wrap gap-1">
                {FEEDBACK_TYPES.map((ft) => (
                  <button
                    key={ft.value}
                    onClick={() => setFeedbackType(ft.value)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      feedbackType === ft.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                    }`}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>

              {/* Text area */}
              <Textarea
                placeholder={isAr ? 'أخبرنا عن تجربتك...' : 'Tell us about your experience...'}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[50px] text-xs resize-none bg-background"
                maxLength={500}
              />

              {/* Submit */}
              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-2.5 rounded-lg shadow-md transition-all duration-200 active:scale-[0.98] text-xs disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {isAr ? 'أرسل واحصل على وقت إضافي' : 'Submit for bonus time'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
          <button
            onClick={handleSignUp}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98] text-sm"
          >
            <span>{isAr ? 'سجّل للمتابعة' : 'Sign up to continue'}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary/40 text-foreground hover:text-primary font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-xs bg-muted/40"
          >
            <LogIn className="w-3.5 h-3.5" />
            {isAr ? 'عندك حساب؟ سجّل دخول' : 'Already have an account?'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
