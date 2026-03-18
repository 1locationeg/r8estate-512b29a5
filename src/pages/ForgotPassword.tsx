// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Footer } from '@/components/Footer';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: t('auth.resetFailed', 'Reset failed'), description: error.message, variant: 'destructive' });
      } else {
        setIsSent(true);
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
              <BrandLogo size="md" />
            </button>

            {isSent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h1 className="text-xl font-bold text-foreground">
                  {t('auth.checkEmail', 'Check your email')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('auth.resetEmailSent', "We've sent a password reset link to your email. Please check your inbox and follow the instructions.")}
                </p>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/auth')}>
                  {t('auth.backToSignIn', 'Back to sign in')}
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-foreground mb-1">
                    {t('auth.forgotPasswordTitle', 'Reset your password')}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t('auth.forgotPasswordDesc', "Enter your email and we'll send you a reset link")}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="ps-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 me-2 animate-spin" />{t('auth.sending', 'Sending...')}</>
                    ) : (
                      t('auth.sendResetLink', 'Send reset link')
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

export default ForgotPassword;
