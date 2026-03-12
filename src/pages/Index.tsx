import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroTrustGauge } from "@/components/HeroTrustGauge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { LogOut, LayoutDashboard, Search, BarChart3, Shield, TrendingUp, Star, ArrowRight, Building2 } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, signOut, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: t("common.signedOut"),
      description: t("common.signedOutSuccess"),
    });
  };

  const getDashboardRoute = () => {
    if (role === 'admin') return '/admin';
    if (role === 'developer') return '/developer';
    return '/buyer';
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col safe-x overflow-x-hidden w-full max-w-full" style={{ paddingTop: 'max(50px, env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="container mx-auto px-3 py-0.5 flex items-center justify-between">
          {/* Logo + Brand in header */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-0.5 hover:opacity-80 transition-opacity"
            aria-label="Return to home"
          >
            <img src={logoIcon} alt="R8ESTATE" className="h-7 w-7 md:h-10 md:w-10 object-contain" />
            <span className="inline-flex text-lg md:text-xl font-extrabold leading-none">
              <span className="text-brand-red">R8</span>
              <span className="text-primary">ESTATE</span>
            </span>
          </button>

          {/* Business Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            <Building2 className="w-4 h-4" />
            <span>Business</span>
          </div>

          {/* Mobile compact actions */}
          <div className="flex md:hidden items-center gap-1">
            <LanguageSwitcher />
            <NotificationBell />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <NotificationBell />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{profile?.full_name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      <span className="text-xs text-primary mt-1 capitalize">{role || 'Business'}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardRoute())} className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 me-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 me-2" />
                    {t("common.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button 
                onClick={() => navigate('/auth?type=business')}
                disabled={isLoading}
                className="px-4 lg:px-6 py-2.5 min-h-[44px] bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading ? t("common.signingIn") : t("common.signIn")}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Business Only */}
      <section className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-0 pb-0 sm:pt-2 sm:pb-2 md:py-6">
          {/* Trust Meter Title + Gauge */}
          <div className="text-center">
            <p className="text-lg sm:text-2xl md:text-4xl font-bold text-accent leading-none mb-0">
              {t("hero.trustMeter")}
            </p>
            <div className="mt-0">
              <HeroTrustGauge />
            </div>
          </div>

          {/* Business Tagline */}
          <div className="text-center mb-0 max-w-3xl">
            <p className="text-sm sm:text-lg md:text-xl text-foreground leading-tight">
              {t("hero.industryTitle1")}
            </p>
            <p className="text-sm sm:text-lg md:text-xl text-accent font-semibold leading-tight">
              {t("hero.industryTitle2")}
            </p>
          </div>

          {/* Business Description */}
          <p className="text-xs md:text-base text-muted-foreground text-center max-w-2xl mb-2 md:mb-4 px-4 leading-snug">
            {t("hero.industryDescription")}
          </p>

          {/* Business Feature Cards */}
          <div className="w-full max-w-3xl px-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Reputation Analytics</h3>
                <p className="text-xs text-muted-foreground leading-snug">Track your trust score, review trends, and buyer sentiment in real time.</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border text-center">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Verified Profile</h3>
                <p className="text-xs text-muted-foreground leading-snug">Claim and verify your business identity to build buyer confidence.</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Lead Generation</h3>
                <p className="text-xs text-muted-foreground leading-snug">Convert trust into sales — high-intent buyers discover you organically.</p>
              </div>
            </div>

            {/* Business Stats */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-black text-primary">2,500+</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Buyers</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-black text-accent">92%</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trust Conversion</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-black text-primary">4.8</p>
                <div className="flex items-center justify-center gap-0.5">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Rating</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/auth?type=business')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                Claim Your Business Profile
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/directory')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors text-sm"
              >
                Browse Developer Directory
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav onSignOut={handleSignOut} getDashboardRoute={getDashboardRoute} />
    </div>
  );
};

export default Index;