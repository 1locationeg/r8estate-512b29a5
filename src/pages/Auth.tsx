import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, User, ArrowLeft, Loader2, Building2, UserCircle } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';
import { Footer } from '@/components/Footer';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

type AccountType = 'buyer' | 'business';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, signIn, signUp, signInWithGoogle, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const initialType = searchParams.get('type') === 'business' ? 'business' : 'buyer';
  const initialMode = searchParams.get('mode') === 'signin' ? 'signin' : 'signup';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>(initialType);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Sync parameters if query params change
  useEffect(() => {
    const type = searchParams.get('type');
    const qMode = searchParams.get('mode');
    if (type === 'business') setAccountType('business');
    if (qMode === 'signin') setMode('signin');
    if (qMode === 'signup') setMode('signup');
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'developer') navigate('/developer');
      else navigate('/buyer');
    }
  }, [user, role, authLoading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Sign in failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else if (error.message.includes('Email not confirmed')) {
            toast({
              title: 'Email not verified',
              description: 'Please check your email and verify your account before signing in.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign in failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        // Role-based redirect will happen via useEffect
      } else {
        const { error } = await signUp(email, password, fullName, accountType === 'business' ? 'developer' : 'buyer');
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'An account with this email already exists. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        // If business account, assign developer role after signup
        if (accountType === 'business') {
          // The role will be assigned by a trigger or we update it here
          // We need to wait for the user to be created first
          // For now, show a message that admin will verify
          toast({
            title: 'Business account requested!',
            description: 'Please check your email to verify your account. Your business account will be activated shortly.',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Please check your email to verify your account.',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: 'Google sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
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
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </button>

        {/* Auth card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-3 mb-8 mx-auto hover:opacity-80 transition-opacity"
            aria-label="Return to home"
          >
            <img src={logoIcon} alt="R8ESTATE" className="h-14 w-auto object-contain" />
            <span className="text-3xl font-bold">
              <span className="text-brand-red">R8</span>
              <span className="text-foreground">ESTATE</span>
            </span>
          </button>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {mode === 'signin' 
                ? (accountType === 'business' ? 'Business Sign In' : 'Welcome back')
                : (accountType === 'business' ? 'Register your business' : 'Create your account')}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'signin' 
                ? (accountType === 'business' 
                    ? 'Sign in to manage your business profile' 
                    : 'Sign in to access your account')
                : accountType === 'business'
                  ? 'List your projects and manage reviews'
                  : 'Sign up to start exploring trusted developers'}
            </p>
          </div>

          {/* Account type toggle - shown on both signin and signup */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('buyer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                accountType === 'buyer' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <UserCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">Buyer / Reviewer</span>
              <span className="text-xs text-muted-foreground">Browse & review projects</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                accountType === 'business' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-sm font-semibold">Business Account</span>
              <span className="text-xs text-muted-foreground">List projects & manage</span>
            </button>
          </div>

          {/* Account type toggle - only on signup */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setAccountType('buyer')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  accountType === 'buyer' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <UserCircle className="w-6 h-6" />
                <span className="text-sm font-semibold">Buyer / Reviewer</span>
                <span className="text-xs text-muted-foreground">Browse & review projects</span>
              </button>
              <button
                type="button"
                onClick={() => setAccountType('business')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  accountType === 'business' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="text-sm font-semibold">Business Account</span>
                <span className="text-xs text-muted-foreground">List projects & manage</span>
              </button>
            </div>
          )}

          {/* Social login buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base gap-3"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="ps-10"
                    />
                  </div>
                </div>

                {accountType === 'business' && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company / Developer Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Your company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="ps-10"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`ps-10 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`ps-10 ${errors.password ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setErrors({});
              }}
              className="text-primary font-semibold hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-center text-muted-foreground">
            By continuing, you agree to R8ESTATE's{' '}
            <a href="#" className="underline hover:text-foreground transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
