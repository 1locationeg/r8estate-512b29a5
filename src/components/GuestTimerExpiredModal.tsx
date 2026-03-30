import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, MessageSquare, Building2, Users, ArrowRight, LogIn,
  Send, Loader2, Shield, Search, AlertTriangle, Bell, Lock, CheckCircle2
} from 'lucide-react';
import { useGuestTimer } from '@/contexts/GuestTimerContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import reviewerAhmed from '@/assets/reviewer-ahmed.jpg';
import reviewerSara from '@/assets/reviewer-sara.jpg';
import reviewerOmar from '@/assets/reviewer-omar.jpg';

function getOrCreateSessionId(): string {
  const key = 'r8estate_guest_session';
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return { value, ref };
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
  const TYPES = [
    { value: 'value_found', label: isAr ? 'محتوى مفيد' : 'Valuable' },
    { value: 'advice', label: isAr ? 'اقتراحات' : 'Suggestions' },
    { value: 'general', label: isAr ? 'عام' : 'General' },
  ];

  return (
    <div className="mx-4 mt-2 mb-1 rounded-xl p-3 space-y-2"
      style={{ background: 'hsla(203,81%,12%,0.06)', border: '1px solid hsla(203,81%,12%,0.1)' }}>
      <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
        <Star className="w-3 h-3" style={{ color: 'hsl(45,96%,54%)' }} />
        {isAr ? 'قيّم تجربتك واحصل على دقيقتين إضافيتين' : 'Rate & get 2 bonus minutes'}
      </p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button"
            onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(s)}
            className="transition-transform hover:scale-110 active:scale-95">
            <Star className={`w-5 h-5 ${s <= (hoverRating || rating) ? 'fill-[hsl(45,96%,54%)] text-[hsl(45,96%,54%)]' : 'text-muted-foreground/25'}`} />
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {TYPES.map((ft) => (
          <button key={ft.value} onClick={() => setFeedbackType(ft.value)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${feedbackType === ft.value ? 'text-white border-transparent' : 'bg-background text-muted-foreground border-border hover:border-primary/40'}`}
            style={feedbackType === ft.value ? { background: 'linear-gradient(135deg, hsl(203,81%,18%), hsl(203,55%,28%))' } : undefined}>
            {ft.label}
          </button>
        ))}
      </div>
      <Textarea placeholder={isAr ? 'أخبرنا عن تجربتك...' : 'Tell us about your experience...'}
        value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
        className="min-h-[40px] text-xs resize-none bg-background" maxLength={500} />
      <button onClick={onSubmit} disabled={submitting}
        className="w-full flex items-center justify-center gap-2 font-bold py-2 rounded-lg transition-all active:scale-[0.98] text-xs disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, hsl(45,96%,54%) 0%, hsl(40,90%,48%) 100%)', color: 'hsl(203,81%,12%)' }}>
        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3 h-3" />{isAr ? 'أرسل واحصل على وقت إضافي' : 'Submit for bonus time'}</>}
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

  const reviews = useCountUp(50000, 1600);
  const companies = useCountUp(1200, 1400);
  const users = useCountUp(100000, 1800);
  const trust = useCountUp(48, 1200);

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

  const formatNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+` : `${n}+`;

  const STATS = [
    { icon: MessageSquare, value: formatNum(reviews.value), label: isAr ? 'تقييم' : 'Reviews' },
    { icon: Building2, value: formatNum(companies.value), label: isAr ? 'شركة' : 'Companies' },
    { icon: Users, value: formatNum(users.value), label: isAr ? 'مستخدم' : 'Users' },
    { icon: Star, value: `${(trust.value / 10).toFixed(1)}★`, label: isAr ? 'متوسط الثقة' : 'Trust Avg' },
  ];

  const TESTIMONIALS = [
    {
      name: isAr ? 'أحمد محمد' : 'Ahmed M.',
      role: isAr ? 'مشتري عقار' : 'Property Buyer',
      text: isAr ? 'وفرت لي المنصة من خسارة ١.٢ مليون جنيه — اكتشفت مشاكل المطور قبل التوقيع' : 'R8ESTATE saved me from a 1.2M EGP loss — I found developer issues before signing',
      img: reviewerAhmed, stars: 5,
    },
    {
      name: isAr ? 'سارة أحمد' : 'Sara A.',
      role: isAr ? 'مستثمرة' : 'Investor',
      text: isAr ? 'أفضل أداة للمقارنة بين المطورين — قررت بثقة' : 'Best tool to compare developers — I decided with confidence',
      img: reviewerSara, stars: 5,
    },
    {
      name: isAr ? 'عمر حسن' : 'Omar H.',
      role: isAr ? 'مشتري لأول مرة' : 'First-time Buyer',
      text: isAr ? 'التقييمات الموثقة ساعدتني أختار الشركة الصح' : 'Verified reviews helped me pick the right company',
      img: reviewerOmar, stars: 5,
    },
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
        className="max-w-[400px] w-[calc(100vw-2rem)] max-h-[100dvh] overflow-y-auto p-0 border-0 shadow-2xl [&>button]:hidden rounded-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* ── Hero ── */}
        <div className="relative px-5 pt-5 pb-4 text-center overflow-hidden"
          style={{ background: 'linear-gradient(160deg, hsl(203,81%,12%) 0%, hsl(203,81%,21%) 40%, hsl(203,55%,28%) 100%)' }}>
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 20%, hsla(45,96%,54%,0.1) 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'hsla(45,96%,54%,0.15)', border: '1px solid hsla(45,96%,54%,0.3)', boxShadow: '0 0 24px hsla(45,96%,54%,0.15)' }}>
              <Lock className="h-5 w-5" style={{ color: 'hsl(45,96%,54%)' }} />
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight mb-0.5 whitespace-pre-line">
              {isAr ? "احمِ استثمارك العقاري\n" : "Protect Your Investment\n"}
            </h2>
            <p className="text-white/60 text-[11px] leading-relaxed max-w-[260px] mx-auto mb-3">
              {isAr ? 'سجّل مجاناً لحماية استثمارك ومقارنة المطورين' : 'Sign up free to protect your investment — compare developers & reviews.'}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {PILLS.map((pill, i) => (
                <div key={i} className="flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{ background: 'hsla(0,0%,100%,0.08)', border: '1px solid hsla(0,0%,100%,0.12)' }}>
                  <pill.icon className="h-2.5 w-2.5" style={{ color: 'hsl(45,96%,54%)' }} />
                  <span className="text-[9px] font-semibold text-white/80 whitespace-nowrap">{pill.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* ── Testimonials Carousel ── */}
        {(() => {
          const [tIdx, setTIdx] = useState(0);
          useEffect(() => {
            const iv = setInterval(() => setTIdx(p => (p + 1) % TESTIMONIALS.length), 2000);
            return () => clearInterval(iv);
          }, [TESTIMONIALS.length]);
          const t = TESTIMONIALS[tIdx];
          return (
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground whitespace-nowrap">
                  {isAr ? 'ماذا يقول المشترون' : 'What buyers say'}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex items-start gap-2.5 rounded-xl p-2.5 border border-border bg-muted/30 transition-opacity duration-300">
                <img src={t.img} alt={t.name} className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-border" loading="lazy" width={36} height={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-foreground truncate">{t.name}</span>
                    <span className="text-[9px] text-muted-foreground">·</span>
                    <span className="text-[9px] text-muted-foreground truncate">{t.role}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-2.5 h-2.5 fill-[hsl(45,96%,54%)] text-[hsl(45,96%,54%)]" />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">"{t.text}"</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Benefits ── */}
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground whitespace-nowrap">
              {isAr ? 'ماذا تفتح — مجاناً' : 'What you unlock — Free'}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-col gap-1.5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: 'hsla(203,81%,12%,0.08)' }}>
                  <b.icon className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[11px] font-medium text-foreground leading-snug">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feedback ── */}
        {!hasBonusBeenUsed && (
          <FeedbackPanel isAr={isAr} rating={rating} hoverRating={hoverRating}
            setRating={setRating} setHoverRating={setHoverRating}
            feedbackText={feedbackText} setFeedbackText={setFeedbackText}
            feedbackType={feedbackType} setFeedbackType={setFeedbackType}
            submitting={submitting} onSubmit={handleSubmitFeedback} />
        )}

        {/* ── CTAs ── */}
        <div className="px-4 pt-2 pb-4 flex flex-col gap-2">
          <button onClick={handleSignUp}
            className="w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl shadow-lg transition-all active:scale-[0.98] text-sm"
            style={{ background: 'linear-gradient(135deg, hsl(45,96%,54%) 0%, hsl(40,90%,48%) 100%)', color: 'hsl(203,81%,12%)', boxShadow: '0 4px 20px hsla(45,96%,54%,0.3)' }}>
            <span>{isAr ? 'سجّل مجاناً وابدأ' : 'Sign up free & start exploring'}</span>
            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 border border-border hover:border-primary/40 text-foreground hover:text-primary font-semibold py-2 rounded-xl transition-all active:scale-[0.98] text-xs bg-muted/40">
            <LogIn className="w-3.5 h-3.5" />
            {isAr ? 'عندك حساب؟ سجّل دخول' : 'Already have an account?'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
