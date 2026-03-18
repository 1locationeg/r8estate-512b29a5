// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';
import { Footer } from '@/components/Footer';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsValidToken(true);
    } else {
      // Also check if user has an active session from the recovery link
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsValidToken(true);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: t('auth.error', 'Error'), description: t('auth.passwordMin', 'Password must be at least 6 characters'), variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: t('auth.error', 'Error'), description: t('auth.passwordMismatch', 'Passwords do not match'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: t('auth.resetFailed', 'Reset failed'), description: error.message, variant: 'destructive' });
      } else {
        setIsSuccess(true);
        setTimeout(() => navigate('/auth'), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.backToSignIn', 'Back to sign in')}</span>
          </button>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-3 mb-6 mx-auto hover:opacity-80 transition-opacity"
              aria-label="Return to home"
            >
              <img src={logoIcon} alt="R8ESTATE" className="h-12 w-auto object-contain" />
              <span className="text-2xl font-bold">
                <span className="text-brand-red">R8</span>
                <span className="text-foreground">ESTATE</span>
              </span>
            </button>

            {isSuccess ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h1 className="text-xl font-bold text-foreground">
                  {t('auth.passwordUpdated', 'Password updated!')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('auth.redirectingToSignIn', 'Redirecting you to sign in...')}
                </p>
              </div>
            ) : !isValidToken ? (
              <div className="text-center space-y-4">
                <h1 className="text-xl font-bold text-foreground">
                  {t('auth.invalidLink', 'Invalid or expired link')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('auth.invalidLinkDesc', 'This password reset link is invalid or has expired. Please request a new one.')}
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/forgot-password')}>
                  {t('auth.requestNewLink', 'Request new link')}
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-foreground mb-1">
                    {t('auth.setNewPassword', 'Set new password')}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t('auth.setNewPasswordDesc', 'Enter your new password below')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.newPassword', 'New password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="ps-10" required minLength={6} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword', 'Confirm password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="ps-10" required minLength={6} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 me-2 animate-spin" />{t('auth.updating', 'Updating...')}</>
                    ) : (
                      t('auth.updatePassword', 'Update password')
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
