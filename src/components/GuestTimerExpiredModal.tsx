import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, MessageSquare, Building2, Users, ArrowRight, LogIn,
  Clock, Send, Loader2, Shield, Search, AlertTriangle, Bell, Lock, CheckCircle2
} from 'lucide-react';
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

/* ── Feedback sub-component ── */
function FeedbackPanel({
  isAr, rating, hoverRating, setRating, setHoverRating,
  feedbackText, setFeedbackText, feedbackType, setFeedbackType,
  submitting, onSubmit,
}: {
  isAr: boolean; rating: number; hoverRating: number;
  setRating: (n: number) => void; setHoverRating: (n: number) => void;
  feedbackText: string; setFeedbackText: (s: string) => void;
  feedbackType: string; setFeedbackType: (s: string) => void;
  submitting: boolean; onSubmit: () => void;
}) {
  const FEEDBACK_TYPES = [
    { value: 'value_found', label: isAr ? 'محتوى مفيد' : 'Valuable' },
    { value: 'advice', label: isAr ? 'اقتراحات' : 'Suggestions' },
    { value: 'general', label: isAr ? 'عام' : 'General' },
  ];

  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl p-3 space-y-2.5"
      style={{ background: 'hsla(203,81%,12%,0.06)', border: '1px solid hsla(203,81%,12%,0.1)' }}>
      <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
        <Star className="w-3 h-3 text-[hsl(45,96%,54%)]" />
        {isAr ? 'قيّم تجربتك واحصل على دقيقتين إضافيتين' : 'Rate & get 2 bonus minutes'}
      </p>

      {/* Stars */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button"
            onMouseEnter={() => setHoverRating(s)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(s)}
            className="transition-transform hover:scale-110 active:scale-95">
            <Star className={`w-6 h-6 ${
              s <= (hoverRating || rating)
                ? 'fill-[hsl(45,96%,54%)] text-[hsl(45,96%,54%)]'
                : 'text-muted-foreground/25'
            }`} />
          </button>
        ))}
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-1">
        {FEEDBACK_TYPES.map((ft) => (
          <button key={ft.value} onClick={() => setFeedbackType(ft.value)}
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
              feedbackType === ft.value
                ? 'text-white border-transparent'
                : 'bg-background text-muted-foreground border-border hover:border-primary/40'
            }`}
            style={feedbackType === ft.value
              ? { background: 'linear-gradient(135deg, hsl(203,81%,18%), hsl(203,55%,28%))' }
              : undefined}>
            {ft.label}
          </button>
        ))}
      </div>

      <Textarea
        placeholder={isAr ? 'أخبرنا عن تجربتك...' : 'Tell us about your experience...'}
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        className="min-h-[44px] text-xs resize-none bg-background"
        maxLength={500}
      />

      <button onClick={onSubmit} disabled={submitting}
        className="w-full flex items-center justify-center gap-2 font-bold py-2 rounded-lg shadow-md transition-all duration-200 active:scale-[0.98] text-xs disabled:opacity-50 text-white"
        style={{ background: 'linear-gradient(135deg, hsl(45,96%,54%) 0%, hsl(40,90%,48%) 100%)', color: 'hsl(203,81%,12%)' }}>
        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
          <>
            <Send className="w-3 h-3" />
            {isAr ? 'أرسل واحصل على وقت إضافي' : 'Submit for bonus time'}
          </>
        )}
      </button>
    </div>
  );
}

/* ── Main modal ── */
export function GuestTimerExpiredModal() {
  const { i18n } = useTranslation();
  const isAr = i18n.language?.startsWith('ar') ?? false;
  const { expiredModalOpen, dismissExpiredModal, isGuest, grantBonusTime, hasBonusBeenUsed } = useGuestTimer();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  if (!isGuest) return null;

  const handleSignUp = () => { dismissExpiredModal(); navigate('/auth'); };
  const handleLogin = () => { dismissExpiredModal(); navigate('/auth?mode=signin'); };

  const handleSubmitFeedback = async () => {
    if (rating === 0) { toast.error(isAr ? 'يرجى اختيار تقييم' : 'Please select a rating'); return; }
    if (feedbackText.trim().length < 5) { toast.error(isAr ? 'اكتب على الأقل 5 أحرف' : 'Please write at least 5 characters'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('guest_feedback').insert({
      rating, feedback: feedbackText.trim(), feedback_type: feedbackType, session_id: getOrCreateSessionId(),
    });
    setSubmitting(false);
    if (error) { toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, try again'); return; }
    toast.success(isAr ? '🎉 شكراً! تم إضافة دقيقتين' : '🎉 Thanks! 2 bonus minutes added');
    grantBonusTime();
  };

  const STATS = [
    { icon: MessageSquare, value: '50K+', label: isAr ? 'تقييم' : 'Reviews' },
    { icon: Building2, value: '1,200+', label: isAr ? 'شركة' : 'Companies' },
    { icon: Users, value: '100K+', label: isAr ? 'مستخدم' : 'Users' },
    { icon: Star, value: '4.8★', label: isAr ? 'متوسط الثقة' : 'Trust Avg' },
  ];

  const BENEFITS = [
    { icon: Search, text: isAr ? 'قارن +1,200 مطور ومشروع' : 'Compare 1,200+ developers & projects' },
    { icon: AlertTriangle, text: isAr ? 'اكتشف العلامات الحمراء قبل التوقيع' : 'Spot red flags before you sign' },
    { icon: Shield, text: isAr ? '+50K تقييم موثق من مشترين حقيقيين' : '50K+ verified buyer reviews' },
    { icon: Bell, text: isAr ? 'تنبيهات فورية على المشاريع المحفوظة' : 'Instant alerts on saved projects' },
  ];

  const PILLS = [
    { icon: Shield, text: isAr ? 'مجاني للأبد' : 'Free forever' },
    { icon: CheckCircle2, text: isAr ? 'تقييمات موثقة' : 'Verified reviews' },
    { icon: Users, text: isAr ? '+100 ألف مشتري' : '100K+ buyers' },
  ];

  return (
    <Dialog open={expiredModalOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[380px] w-[calc(100vw-2rem)] max-h-[100dvh] overflow-y-auto p-0 border-0 shadow-2xl [&>button]:hidden rounded-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* ── Hero: Deep navy gradient ── */}
        <div className="relative px-5 pt-6 pb-5 text-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, hsl(203,81%,12%) 0%, hsl(203,81%,21%) 40%, hsl(203,55%,28%) 100%)' }}>
          {/* Radial glow */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, hsla(45,96%,54%,0.1) 0%, transparent 70%)' }} />
          {/* Dot texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          <div className="relative z-10 flex flex-col items-center">
            {/* Lock icon with glow ring */}
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'hsla(45,96%,54%,0.15)', border: '1px solid hsla(45,96%,54%,0.3)', boxShadow: '0 0 24px hsla(45,96%,54%,0.15)' }}>
              <Lock className="h-6 w-6" style={{ color: 'hsl(45,96%,54%)' }} />
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">
              {isAr ? 'انتهت المعاينة المجانية' : 'Preview Ended'}
            </h2>
            <p className="text-white/60 text-xs leading-relaxed max-w-[260px] mx-auto mb-4">
              {isAr
                ? 'سجّل مجاناً لحماية استثمارك ومقارنة المطورين والمشاريع'
                : 'Sign up free to protect your investment — compare developers, projects & reviews.'}
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {PILLS.map((pill, i) => (
                <div key={i} className="flex items-center gap-1 rounded-full px-2.5 py-1"
                  style={{ background: 'hsla(0,0%,100%,0.08)', border: '1px solid hsla(0,0%,100%,0.12)' }}>
                  <pill.icon className="h-3 w-3" style={{ color: 'hsl(45,96%,54%)' }} />
                  <span className="text-[10px] font-semibold text-white/80 whitespace-nowrap">{pill.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-4 divide-x rtl:divide-x-reverse divide-border"
          style={{ background: 'hsl(203,81%,12%)', borderTop: '1px solid hsla(0,0%,100%,0.06)' }}>
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center py-3 px-1">
              <Icon className="w-3 h-3 mb-0.5" style={{ color: 'hsl(45,96%,54%)' }} />
              <span className="text-sm font-extrabold text-white leading-none">{value}</span>
              <span className="text-[8px] text-white/45 text-center leading-tight mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Benefits: What you unlock ── */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap">
              {isAr ? 'ماذا تفتح — مجاناً' : 'What you unlock — Free'}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'hsla(203,81%,12%,0.08)' }}>
                  <b.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-medium text-foreground leading-snug">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feedback panel (if bonus not used) ── */}
        {!hasBonusBeenUsed && (
          <FeedbackPanel
            isAr={isAr} rating={rating} hoverRating={hoverRating}
            setRating={setRating} setHoverRating={setHoverRating}
            feedbackText={feedbackText} setFeedbackText={setFeedbackText}
            feedbackType={feedbackType} setFeedbackType={setFeedbackType}
            submitting={submitting} onSubmit={handleSubmitFeedback}
          />
        )}

        {/* ── CTA buttons ── */}
        <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
          <button onClick={handleSignUp}
            className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] text-sm"
            style={{ background: 'linear-gradient(135deg, hsl(45,96%,54%) 0%, hsl(40,90%,48%) 100%)', color: 'hsl(203,81%,12%)', boxShadow: '0 4px 20px hsla(45,96%,54%,0.3)' }}>
            <span>{isAr ? 'سجّل مجاناً وابدأ' : 'Sign up free & start exploring'}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>

          <button onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary/40 text-foreground hover:text-primary font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-xs bg-muted/40">
            <LogIn className="w-3.5 h-3.5" />
            {isAr ? 'عندك حساب؟ سجّل دخول' : 'Already have an account?'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
