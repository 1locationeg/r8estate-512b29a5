import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, ArrowLeft, Loader2, Building2, Shield, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Footer } from '@/components/Footer';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AccountType = 'buyer' | 'business';
type Step = 'social' | 'password';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, signIn, signUp, signInWithGoogle, signInWithApple, refreshProfile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const isBusinessMode = searchParams.get('type') === 'business';
  const [accountType, setAccountType] = useState<AccountType>(isBusinessMode ? 'business' : 'buyer');
  const [step, setStep] = useState<Step>('social');
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
    const { error } = await supabase.rpc('set_my_account_type', { _account_type: 'business' });
    if (error) throw error;
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
        toast({ title: 'Business activation failed', description: 'Signed in, but could not switch to Business.', variant: 'destructive' });
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
          try {
            await promoteToBusinessRole();
          } catch {
            toast({ title: 'Business activation failed', description: 'Signed in, but could not switch to Business.', variant: 'destructive' });
            return;
          }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Back button */}
          <button
            onClick={() => step === 'password' ? setStep('social') : navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 'password' ? t('auth.changeEmail', 'Change email') : t('auth.backToHome', 'Back to home')}</span>
          </button>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center mx-auto mb-4 hover:opacity-80 transition-opacity"
              aria-label="Return to home"
            >
              <BrandLogo size="md" />
            </button>

            {/* ===== STEP 1: Social + Email ===== */}
            {step === 'social' && (
              <div className="animate-in fade-in duration-200">
                <h1 className="text-lg font-bold text-foreground text-center mb-1">
                  {isBusinessMode
                    ? t('auth.registerBusiness', 'Register your business')
                    : t('auth.createOrSign', 'Create an account')}
                </h1>

                <p className="text-sm text-muted-foreground text-center mb-5">
                  {t('auth.hasAccount', 'Already have an account?')}{' '}
                  <button type="button" onClick={() => { setStep('password'); setIsNewUser(false); }} className="text-primary font-semibold hover:underline">
                    {t('auth.logIn', 'Log In')}
                  </button>
                </p>

                {isBusinessMode && (
                  <div className="mb-4 p-2.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{t('auth.businessAccount', 'Business Account')}</p>
                      <p className="text-[10px] text-muted-foreground">{t('auth.businessDesc', 'Manage projects & developer profile')}</p>
                    </div>
                  </div>
                )}

                {/* Social buttons */}
                <div className="space-y-2.5 mb-4">
                  <Button type="button" variant="outline" className="w-full h-11 text-sm gap-2.5 font-medium" onClick={handleGoogleAuth} disabled={isLoading}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>

                  <Button type="button" variant="outline" className="w-full h-11 text-sm gap-2.5 font-medium" onClick={handleAppleAuth} disabled={isLoading}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Apple
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">{t('auth.orContinueWith', 'or continue with')}</span>
                  </div>
                </div>

                {/* Email input */}
                <form onSubmit={handleEmailContinue}>
                  <div className="relative mb-3">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t('auth.emailPlaceholder', 'name@email.com')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`ps-10 h-11 ${errors.email ? 'border-destructive' : ''}`}
                      autoFocus
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mb-2">{errors.email}</p>}

                  <Button type="submit" className="w-full h-11 text-sm font-semibold mb-3">
                    {t('auth.continueEmail', 'Continue')}
                  </Button>
                </form>

                {!isBusinessMode && (
                  <p className="text-xs text-center text-muted-foreground">
                    {t('auth.areYouBusiness', 'Are you a business?')}{' '}
                    <button type="button" onClick={() => navigate('/auth?type=business')} className="text-primary font-semibold hover:underline">
                      {t('auth.registerBusinessLink', 'Register →')}
                    </button>
                  </p>
                )}
                {isBusinessMode && (
                  <p className="text-xs text-center">
                    <button type="button" onClick={() => navigate('/auth')} className="text-muted-foreground hover:text-foreground transition-colors">
                      ← {t('auth.backToBuyer', 'Sign in as a buyer instead')}
                    </button>
                  </p>
                )}
              </div>
            )}

            {/* ===== STEP 2: Password ===== */}
            {step === 'password' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border mb-4">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{email}</span>
                  <button type="button" onClick={() => setStep('social')} className="ms-auto text-xs text-primary hover:underline shrink-0">
                    {t('auth.change', 'Change')}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1 mb-4">
                  <button
                    type="button"
                    onClick={() => setIsNewUser(false)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!isNewUser ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    {t('auth.signIn', 'Sign In')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewUser(true)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isNewUser ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    {t('auth.createAccount', 'Create Account')}
                  </button>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  {isNewUser && (
                    <>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="text" placeholder={t('auth.fullName', 'Full Name')} value={fullName} onChange={(e) => setFullName(e.target.value)} className="ps-10 h-10" />
                      </div>
                      {isBusinessMode && (
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="text" placeholder={t('auth.companyName', 'Company Name')} value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="ps-10 h-10" />
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`ps-10 pe-10 h-10 ${errors.password ? 'border-destructive' : ''}`}
                        autoFocus
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                    {!isNewUser && (
                      <Link to="/forgot-password" className="block text-xs text-primary hover:underline mt-1 text-end">
                        {t('auth.forgotPassword', 'Forgot password?')}
                      </Link>
                    )}
                  </div>

                  <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 me-2 animate-spin" />{isNewUser ? t('auth.creating', 'Creating...') : t('auth.signingIn', 'Signing in...')}</>
                    ) : (
                      isNewUser ? t('auth.createAccount', 'Create Account') : t('auth.signIn', 'Sign In')
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Trust Signals — big icons, tiny text */}
            <div className="flex items-center justify-center gap-5 mt-5 pt-4 border-t border-border">
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-5 h-5 text-verified" />
                <span className="text-[9px] text-muted-foreground leading-tight text-center">{t('trustSignals.short.protected', 'Protected')}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Lock className="w-5 h-5 text-primary" />
                <span className="text-[9px] text-muted-foreground leading-tight text-center">{t('trustSignals.short.encrypted', 'Encrypted')}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-[9px] text-muted-foreground leading-tight text-center">{t('trustSignals.short.noSpam', 'No Spam')}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Eye className="w-5 h-5 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground leading-tight text-center">{t('trustSignals.short.anonymous', 'Anonymous')}</span>
              </div>
            </div>

            {/* Terms */}
            <p className="mt-3 text-[10px] text-center text-muted-foreground leading-tight">
              {t('auth.termsPrefix', "By proceeding, you agree to our")}{' '}
              <a href="#" className="text-primary underline">{t('auth.terms', 'Terms of Use')}</a>
              {' '}{t('auth.and', 'and')}{' '}
              <a href="#" className="text-primary underline">{t('auth.privacy', 'Privacy Policy')}</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
