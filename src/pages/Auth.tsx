import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, ArrowLeft, Loader2, Building2, Shield, Eye, EyeOff, Star, CheckCircle, UserCheck, BarChart3 } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { RegistrationSlotsBanner } from '@/components/RegistrationSlotsBanner';
import { DisclaimerCheckbox } from '@/components/DisclaimerCheckbox';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AccountType = 'buyer' | 'business';
type Step = 'social' | 'password';

const Auth = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, signIn, signUp, signInWithGoogle, signInWithApple, refreshProfile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const isBusinessMode = searchParams.get('type') === 'business';
  const [accountType, setAccountType] = useState<AccountType>(isBusinessMode ? 'business' : 'buyer');
  const [step, setStep] = useState<Step>('social');
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingBusinessRole, setIsSyncingBusinessRole] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);

  const oauthAccountType = localStorage.getItem('oauth_account_type');
  const isBusinessGoogleCallback = Boolean(oauthAccountType === 'business' && user);
  const requiresBusinessRoleSync = Boolean(
    isBusinessGoogleCallback && role !== 'business' && role !== 'admin'
  );

  useEffect(() => {
    if (searchParams.get('type') === 'business') setAccountType('business');
  }, [searchParams]);

  useEffect(() => {
    supabase.from('platform_settings').select('value').eq('key', 'whatsapp_number').maybeSingle()
      .then(({ data }) => { if (data?.value) setWhatsappNumber(data.value); });
  }, []);

  const promoteToBusinessRole = async () => {
    if (role && role !== 'business' && role !== 'admin') {
      toast({ title: 'Business upgrade requires approval', description: 'Please submit a business upgrade request from your dashboard.' });
      return;
    }
    await refreshProfile();
  };

  useEffect(() => {
    if (authLoading || !requiresBusinessRoleSync) return;
    let isMounted = true;
    const syncBusinessRole = async () => {
      setIsSyncingBusinessRole(true);
      try {
        await promoteToBusinessRole();
        localStorage.removeItem('oauth_account_type');
      } catch {
        toast({ title: 'Business upgrade requires approval', description: 'Please submit a business upgrade request from your dashboard.' });
        localStorage.removeItem('oauth_account_type');
      } finally {
        if (isMounted) setIsSyncingBusinessRole(false);
      }
    };
    void syncBusinessRole();
    return () => { isMounted = false; };
  }, [authLoading, requiresBusinessRoleSync]);

  useEffect(() => {
    if (!authLoading && !isSyncingBusinessRole && user && !requiresBusinessRoleSync) {
      localStorage.removeItem('oauth_account_type');
      if (role === 'admin') navigate('/admin');
      else if (role === 'business') navigate('/business');
      else navigate('/buyer');
    }
  }, [user, role, authLoading, isSyncingBusinessRole, requiresBusinessRoleSync, navigate]);

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrors({ email: result.error.errors[0].message });
      return;
    }
    setErrors({});
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwResult = passwordSchema.safeParse(password);
    if (!pwResult.success) {
      setErrors({ password: pwResult.error.errors[0].message });
      return;
    }
    setErrors({});

    const shouldSyncBusiness = !isNewUser && accountType === 'business';
    setIsLoading(true);
    if (shouldSyncBusiness) setIsSyncingBusinessRole(true);

    try {
      if (isNewUser) {
        const { error } = await signUp(email, password, fullName, accountType === 'business' ? 'business' : 'buyer');
        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: 'Account exists', description: 'An account with this email already exists. Try signing in.', variant: 'destructive' });
            setIsNewUser(false);
          } else {
            toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
          }
          return;
        }
        toast({ title: accountType === 'business' ? 'Business account created!' : 'Account created!', description: 'Please check your email to verify your account.' });
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({ title: 'Sign in failed', description: 'Invalid email or password. New here? Create an account.', variant: 'destructive' });
          } else if (error.message.includes('Email not confirmed')) {
            toast({ title: 'Email not verified', description: 'Please check your email and verify your account.', variant: 'destructive' });
          } else {
            toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
          }
          return;
        }
        if (shouldSyncBusiness) {
          toast({ title: 'Business upgrade requires approval', description: 'Submit a business upgrade request from your dashboard.' });
          localStorage.removeItem('oauth_account_type');
        }
        toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
      }
    } finally {
      if (shouldSyncBusiness) setIsSyncingBusinessRole(false);
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle(accountType);
      if (error) toast({ title: 'Google sign in failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithApple(accountType);
      if (error) toast({ title: 'Apple sign in failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const valueProps = isBusinessMode
    ? [
        { icon: BarChart3, title: isAr ? 'تحليلات قوية' : 'Powerful Analytics', desc: isAr ? 'تتبع سمعتك وتفاعل العملاء في الوقت الفعلي' : 'Track your reputation and customer engagement in real-time' },
        { icon: CheckCircle, title: isAr ? 'ملف تعريف موثق' : 'Verified Profile', desc: isAr ? 'ابرز عن المنافسين بملف تعريف موثق ومعتمد' : 'Stand out from competitors with a verified, trusted profile' },
        { icon: UserCheck, title: isAr ? 'إدارة التقييمات' : 'Review Management', desc: isAr ? 'رد على التقييمات وابنِ ثقة المشترين' : 'Respond to reviews and build buyer confidence' },
      ]
    : [
        { icon: Shield, title: isAr ? '50,000+ تقييم موثق' : '50K+ verified reviews', desc: isAr ? 'اقرأ تقييمات حقيقية من مشترين مصريين حقيقيين' : 'Read 50,000+ verified reviews from real Egyptian buyers' },
        { icon: BarChart3, title: isAr ? 'متتبع البناء' : 'Construction Tracker', desc: isAr ? 'تتبع مواعيد التسليم مقابل وعود المطور — قبل التوقيع' : 'Track delivery dates vs. developer promises — before you sign' },
        { icon: UserCheck, title: isAr ? 'مجهول بالكامل' : 'Fully anonymous', desc: isAr ? 'هويتك تبقى مجهولة. نحن نحمي خصوصيتك' : 'Your identity stays anonymous. We protect your privacy.' },
      ];

  const testimonial = {
    stars: 5,
    text: isAr
      ? '"وجدت 39 شكوى عن المطور قبل التوقيع. ابتعدت عن صفقة 3.2 مليون جنيه. R8ESTATE أنقذتني."'
      : '"Found 39 complaints about my developer before signing. Walked away from a 3.2M EGP deal. R8ESTATE saved me."',
    author: isAr ? 'أحمد ك.' : 'Ahmed K.',
    location: isAr ? 'القاهرة الجديدة' : 'New Cairo',
    badge: isAr ? 'مشتري موثق' : 'Verified Buyer',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top announcement bar */}
      <div className="bg-primary text-primary-foreground py-2.5 px-4 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <span>{isAr ? 'تقييمات عقارية موثقة · منصة مصر الأولى للثقة' : "Verified real estate reviews · Egypt's #1 trust platform"}</span>
        </div>
        <button
          onClick={() => navigate('/auth')}
          className="hidden sm:inline-flex items-center gap-1 bg-primary-foreground text-primary px-3 py-1 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          {isAr ? 'سجّل مجاناً →' : 'Sign up free →'}
        </button>
      </div>

      {/* Back to home */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-4">
        <button
          onClick={() => step === 'password' ? setStep('social') : navigate('/')}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 'password' ? t('auth.changeEmail', 'Change email') : t('auth.backToHome', 'Back to home')}</span>
        </button>
      </div>

      {/* Main content — split layout */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT — Value proposition */}
          <div className={`hidden lg:block ${isAr ? 'order-2' : 'order-1'}`}>
            <div className="mb-6">
              <BrandLogo size="hero" />
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-foreground leading-tight mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isBusinessMode
                ? (isAr ? 'اعرض مصداقيتك.\nقبل أن يسأل أي مشتري.' : 'Showcase your credibility.\nBefore any buyer asks.')
                : (isAr ? 'احمِ استثمارك.\nقبل أن توقّع أي شيء.' : 'Protect your investment.\nBefore you sign anything.')}
            </h1>

            <p className="text-muted-foreground text-base mb-8 max-w-md leading-relaxed">
              {isBusinessMode
                ? (isAr ? 'انضم لأكثر من 200 شركة عقارية تدير سمعتها على R8ESTATE' : 'Join 200+ real estate companies managing their reputation on R8ESTATE')
                : (isAr ? 'انضم لأكثر من 1,247 مشتري مصري يتحققون من R8ESTATE قبل دفع الملايين' : 'Join 1,247+ Egyptian buyers who check R8ESTATE before committing millions.')}
            </p>

            {/* Value props */}
            <div className="space-y-5 mb-8">
              {valueProps.map((vp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <vp.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{vp.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{vp.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial card */}
            <div className="bg-secondary/60 border border-border rounded-xl p-4 max-w-md">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-sm font-semibold text-foreground italic leading-relaxed mb-2">
                {testimonial.text}
              </p>
              <p className="text-xs text-muted-foreground">
                — {testimonial.author}, {testimonial.location} · <span className="text-accent font-semibold">{testimonial.badge}</span>
              </p>
            </div>

            {/* Bottom trust line */}
            <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-accent" /> {isAr ? 'مجاني للأبد' : 'Free forever'}</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-accent" /> {isAr ? 'بدون بطاقة ائتمان' : 'No credit card'}</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-accent" /> {isAr ? 'إلغاء في أي وقت' : 'Cancel anytime'}</span>
            </div>
          </div>

          {/* RIGHT — Auth form card */}
          <div className={`w-full max-w-[420px] mx-auto ${isAr ? 'order-1' : 'order-2'}`}>
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center mx-auto mb-5 hover:opacity-80 transition-opacity"
                aria-label="Return to home"
              >
                <BrandLogo size="hero" />
              </button>

              {/* ===== STEP 1: Social + Email ===== */}
              {step === 'social' && (
                <div className="animate-in fade-in duration-200">
                  <h2 className="text-xl font-bold text-foreground text-center mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {isBusinessMode
                      ? t('auth.registerBusiness', 'Register your business')
                      : t('auth.createOrSign', 'Create an account')}
                  </h2>

                  <p className="text-sm text-muted-foreground text-center mb-6">
                    {t('auth.hasAccount', 'Already have an account?')}{' '}
                    <button type="button" onClick={() => { setStep('password'); setIsNewUser(false); }} className="text-primary font-bold hover:underline">
                      {t('auth.logIn', 'Log In')}
                    </button>
                  </p>

                  {isBusinessMode && (
                    <div className="mb-5 p-3 rounded-xl bg-[hsl(105,50%,95%)] border border-[hsl(105,50%,80%)] flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[hsl(105,50%,30%)] shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-foreground">{t('auth.businessAccount', 'Business Account')}</p>
                        <p className="text-[11px] text-muted-foreground">{t('auth.businessDesc', 'Manage projects & developer profile')}</p>
                      </div>
                    </div>
                  )}

                  {/* Social buttons */}
                  <div className="space-y-3 mb-5">
                    <Button type="button" variant="outline" className="w-full h-12 text-sm gap-3 font-semibold rounded-xl border-border hover:bg-secondary/80" onClick={handleGoogleAuth} disabled={isLoading}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>

                    <Button type="button" variant="outline" className="w-full h-12 text-sm gap-3 font-semibold rounded-xl border-border hover:bg-secondary/80" onClick={handleAppleAuth} disabled={isLoading}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                      Apple
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-4 text-xs text-muted-foreground">{t('auth.orContinueWith', 'or continue with')}</span>
                    </div>
                  </div>

                  {/* Email input */}
                  <form onSubmit={handleEmailContinue}>
                    <div className="relative mb-3">
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder={t('auth.emailPlaceholder', 'name@email.com')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`ps-10 h-12 rounded-xl ${errors.email ? 'border-destructive' : ''}`}
                        autoFocus
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive mb-2">{errors.email}</p>}

                    <Button type="submit" className="w-full h-12 text-sm font-bold rounded-xl mb-4">
                      {t('auth.continueEmail', 'Continue')}
                    </Button>
                  </form>

                  {!isBusinessMode && (
                    <p className="text-sm text-center text-muted-foreground">
                      {t('auth.areYouBusiness', 'Are you a business?')}{' '}
                      <button type="button" onClick={() => navigate('/auth?type=business')} className="text-primary font-bold hover:underline">
                        {t('auth.registerBusinessLink', 'Register your business →')}
                      </button>
                    </p>
                  )}
                  {isBusinessMode && (
                    <p className="text-sm text-center">
                      <button type="button" onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground transition-colors">
                        ← {t('auth.backToBuyer', 'Sign in as a buyer instead')}
                      </button>
                    </p>
                  )}
                </div>
              )}

              {/* ===== STEP 2: Password ===== */}
              {step === 'password' && (
                <div className="animate-in fade-in slide-in-from-end-4 duration-200">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border mb-5">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate">{email}</span>
                    <button type="button" onClick={() => setStep('social')} className="ms-auto text-xs text-primary font-semibold hover:underline shrink-0">
                      {t('auth.change', 'Change')}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1 mb-5">
                    <button
                      type="button"
                      onClick={() => setIsNewUser(false)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${!isNewUser ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                      {t('auth.signIn', 'Sign In')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewUser(true)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${isNewUser ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
                    >
                      {t('auth.createAccount', 'Create Account')}
                    </button>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-3">
                    {isNewUser && (
                      <>
                        <div className="relative">
                          <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="text" placeholder={t('auth.fullName', 'Full Name')} value={fullName} onChange={(e) => setFullName(e.target.value)} className="ps-10 h-11 rounded-xl" />
                        </div>
                        {isBusinessMode && (
                          <div className="relative">
                            <Building2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input type="text" placeholder={t('auth.companyName', 'Company Name')} value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="ps-10 h-11 rounded-xl" />
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <div className="relative">
                        <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`ps-10 pe-10 h-11 rounded-xl ${errors.password ? 'border-destructive' : ''}`}
                          autoFocus
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                      {!isNewUser && (
                        <Link to="/forgot-password" className="block text-xs text-primary hover:underline mt-1.5 text-end font-medium">
                          {t('auth.forgotPassword', 'Forgot password?')}
                        </Link>
                      )}
                    </div>

                    {isNewUser && (
                      <DisclaimerCheckbox checked={disclaimerAgreed} onCheckedChange={setDisclaimerAgreed} />
                    )}

                    <Button type="submit" className="w-full h-12 text-sm font-bold rounded-xl" disabled={isLoading || (isNewUser && !disclaimerAgreed)}>
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 me-2 animate-spin" />{isNewUser ? t('auth.creating', 'Creating...') : t('auth.signingIn', 'Signing in...')}</>
                      ) : (
                        isNewUser ? t('auth.createAccount', 'Create Account') : t('auth.signIn', 'Sign In')
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* Trust Signals */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-border">
                <div className="flex flex-col items-center gap-1.5">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="text-[10px] text-muted-foreground font-medium">{t('trustSignals.short.protected', 'Protected')}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Lock className="w-5 h-5 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-medium">{t('trustSignals.short.encrypted', 'Encrypted')}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Mail className="w-5 h-5 text-accent" />
                  <span className="text-[10px] text-muted-foreground font-medium">{t('trustSignals.short.noSpam', 'No spam')}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">{t('trustSignals.short.anonymous', 'Anonymous')}</span>
                </div>
              </div>

              {/* Terms */}
              <p className="mt-4 text-[10px] text-center text-muted-foreground leading-relaxed">
                {t('auth.termsPrefix', "By continuing, you agree to R8ESTATE's")}{' '}
                <a href="#" className="text-primary underline font-medium">{t('auth.terms', 'Terms of Service')}</a>
                {' '}{t('auth.and', 'and')}{' '}
                <a href="#" className="text-primary underline font-medium">{t('auth.privacy', 'Privacy Policy')}</a>
              </p>

              {/* WhatsApp Support */}
              {whatsappNumber && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-[11px] text-muted-foreground">{t('auth.needAssistance', 'Need assistance?')}</span>
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#25D366] hover:underline"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {t('auth.contactSupport', 'Contact support')}
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom branding strip */}
      <div className="border-t border-border py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} R8ESTATE. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
