import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Building2, MessageSquare, ArrowRight, LogIn, Clock, Gift, Send, Loader2, Shield, CheckCircle2, Sparkles } from 'lucide-react';
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

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  if (!isGuest) return null;

  const STATS = [
    { icon: MessageSquare, value: '50K+', label: isAr ? 'تقييم موثق' : 'Verified Reviews' },
    { icon: Building2, value: '1,200+', label: isAr ? 'شركة مسجلة' : 'Companies Listed' },
    { icon: Users, value: '100K+', label: isAr ? 'مستخدم نشط' : 'Active Users' },
    { icon: Star, value: '4.8★', label: isAr ? 'تقييم الثقة' : 'Trust Score' },
  ];

  const BENEFITS = [
    { icon: Shield, text: isAr ? 'حماية استثمارك العقاري' : 'Protect your real estate investment' },
    { icon: CheckCircle2, text: isAr ? 'تقييمات موثقة من مشترين حقيقيين' : 'Verified reviews from real buyers' },
    { icon: Sparkles, text: isAr ? 'تحليلات ذكية ومقارنات فورية' : 'AI insights & instant comparisons' },
  ];

  const FEEDBACK_TYPES = [
    { value: 'value_found', label: t("guest.feedback_valuable") },
    { value: 'advice', label: t("guest.feedback_improve") },
    { value: 'general', label: t("guest.feedback_general") },
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
      toast.error(t("form.rating_required_desc"));
      return;
    }
    if (feedbackText.trim().length < 10) {
      toast.error(t("guest.feedback_min_chars"));
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('guest_feedback' as any).insert({
      rating,
      feedback: feedbackText.trim(),
      feedback_type: feedbackType,
      session_id: getOrCreateSessionId(),
    } as any);

    setSubmitting(false);

    if (error) {
      toast.error(t("guest.feedback_error"));
      return;
    }

    toast.success(t("guest.feedback_success"));
    setShowFeedbackForm(false);
    setRating(0);
    setFeedbackText('');
    grantBonusTime();
  };

  return (
    <Dialog open={expiredModalOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto p-0 border-0 shadow-2xl [&>button]:hidden rounded-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Hero gradient header — compact on mobile */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-accent px-5 pt-6 pb-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,white,transparent)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm mb-3 mx-auto">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5 leading-tight">
              {isAr ? 'انتهت المعاينة المجانية' : 'Your Free Preview Has Ended'}
            </h2>
            <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-[280px] mx-auto">
              {isAr
                ? 'سجّل مجاناً واحصل على وصول كامل لكل التقييمات والتحليلات'
                : 'Sign up for free to unlock full access to all reviews, insights & comparisons'}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-px bg-border">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-background flex flex-col items-center justify-center py-3 px-1.5">
              <Icon className="w-3.5 h-3.5 text-primary mb-0.5" />
              <span className="text-base sm:text-lg font-extrabold text-foreground leading-none">{value}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Benefits list */}
        <div className="px-5 pt-4 space-y-2">
          {BENEFITS.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Bonus feedback section */}
        {!hasBonusBeenUsed && (
          <div className="px-5 pt-3">
            {!showFeedbackForm ? (
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-accent/15 hover:bg-accent/25 text-foreground font-semibold py-2.5 rounded-xl transition-all duration-200 text-xs border border-border"
              >
                <Gift className="w-4 h-4 text-accent" />
                {isAr ? '💬 شارك رأيك واحصل على دقيقتين إضافيتين' : '💬 Share feedback & get 2 bonus minutes'}
              </button>
            ) : (
              <div className="space-y-2.5 bg-muted/40 rounded-xl p-3 border border-border">
                <p className="text-xs font-semibold text-foreground">{t("guest.rate_experience")}</p>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= (hoverRating || rating)
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>

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

                <Textarea
                  placeholder={t("guest.feedback_placeholder")}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[60px] text-xs resize-none"
                  maxLength={500}
                />

                <button
                  onClick={handleSubmitFeedback}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 rounded-lg shadow-md transition-all duration-200 active:scale-[0.98] text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {t("guest.submit_bonus")}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* CTA buttons */}
        <div className="p-5 pt-3 flex flex-col gap-2.5">
          <button
            onClick={handleSignUp}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98] text-sm"
          >
            <span>{isAr ? '🚀 سجّل مجاناً — خلال ثوانٍ' : '🚀 Sign Up Free — Takes Seconds'}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary/40 text-foreground hover:text-primary font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-xs bg-muted/40"
          >
            <LogIn className="w-3.5 h-3.5" />
            {isAr ? 'عندك حساب بالفعل؟ سجّل دخول' : 'Already have an account? Sign in'}
          </button>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Shield className="w-3 h-3 text-muted-foreground" />
            <p className="text-center text-[10px] text-muted-foreground">
              {isAr ? 'مجاني للأبد • بياناتك محمية ومشفرة' : 'Free forever • Your data is encrypted & secure'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
