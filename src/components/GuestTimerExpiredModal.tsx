import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Building2, MessageSquare, ArrowRight, LogIn, Clock, Gift, Send, Loader2 } from 'lucide-react';
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
  const { t } = useTranslation();
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
    { icon: MessageSquare, value: '50K+', label: t("guest.stat_reviews") },
    { icon: Building2, value: '1,200+', label: t("guest.stat_companies") },
    { icon: Users, value: '100K+', label: t("guest.stat_users") },
    { icon: Star, value: '4.8★', label: t("guest.stat_trust") },
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
        className="max-w-md w-full p-0 overflow-hidden border-0 shadow-2xl [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 px-6 pt-8 pb-10 text-white text-center relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,white,transparent)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 mx-auto">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2 leading-tight">
              {t("guest.preview_ended")}
            </h2>
            <p className="text-white/85 text-sm leading-relaxed max-w-xs mx-auto">
              {t("guest.preview_ended_desc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border mx-0">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-background flex flex-col items-center justify-center py-4 px-3">
              <Icon className="w-4 h-4 text-primary mb-1" />
              <span className="text-xl font-extrabold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {!hasBonusBeenUsed && (
          <div className="px-5 pt-4">
            {!showFeedbackForm ? (
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-accent/60 hover:bg-accent text-accent-foreground font-semibold py-3 rounded-xl transition-all duration-200 text-sm border border-border"
              >
                <Gift className="w-4 h-4 text-primary" />
                {t("guest.share_feedback_bonus")}
              </button>
            ) : (
              <div className="space-y-3 bg-muted/40 rounded-xl p-4 border border-border">
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
                        className={`w-7 h-7 ${
                          s <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TYPES.map((ft) => (
                    <button
                      key={ft.value}
                      onClick={() => setFeedbackType(ft.value)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
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
                  className="min-h-[70px] text-sm resize-none"
                  maxLength={500}
                />

                <button
                  onClick={handleSubmitFeedback}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2.5 rounded-lg shadow-md transition-all duration-200 active:scale-[0.98] text-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t("guest.submit_bonus")}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-5 flex flex-col gap-3 bg-background">
          <button
            onClick={handleSignUp}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 active:scale-[0.98] text-sm"
          >
            <span>{t("guest.signup_continue")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary/40 text-foreground hover:text-primary font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm bg-muted/40 hover:bg-muted/60"
          >
            <LogIn className="w-4 h-4" />
            {t("guest.already_have_account")}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {t("guest.free_forever")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
