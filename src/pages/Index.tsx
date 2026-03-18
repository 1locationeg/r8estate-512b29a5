import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroSearchBar, HeroCategoryLinks } from "@/components/HeroSearchBar";
import { FeaturedIdentitySpotlight } from "@/components/FeaturedIdentitySpotlight";
import { TrustInsightsModal } from "@/components/TrustInsightsModal";
import { CompareModal } from "@/components/CompareModal";

import { HeroTrustShowcase } from "@/components/HeroTrustShowcase";
import { HeroCategoryItems } from "@/components/HeroCategoryItems";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";
import { DeveloperDetailCard } from "@/components/DeveloperDetailCard";
import { ItemDetailSection } from "@/components/ItemDetailSection";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { ViewToggle } from "@/components/ViewToggle";
import { Footer } from "@/components/Footer";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { CommunityHighlights } from "@/components/CommunityHighlights";
import { MarketPulseWidget } from "@/components/MarketPulseWidget";
import { developers } from "@/data/mockData";
import { LogOut, LayoutDashboard, Search, BarChart3, Shield, TrendingUp, Star, ArrowRight, ShieldCheck, Database, Ban, GitCompare, Award, Scale, LineChart, CheckCircle, Building2, User } from "lucide-react";
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
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userMode, setUserMode] = useState<"buyers" | "industry">("buyers");
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'bestOf' | 'trending' | 'newLaunches' | null>(null);
  const [specialViewItem, setSpecialViewItem] = useState<any>(null);
  const [externalCategory, setExternalCategory] = useState<string | null>(null);
  const [showIndustryCategories, setShowIndustryCategories] = useState(false);
  const [togglePulse, setTogglePulse] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const { user, profile, role, signOut, isLoading, isReturningDevice, returningDeviceEmail } = useAuth();
  const { toast } = useToast();

  const selectedDeveloper = useMemo(() => {
    if (!selectedDeveloperId) return null;
    return developers.find((d) => d.id === selectedDeveloperId) || null;
  }, [selectedDeveloperId]);

  // Auto-scroll to detail section when item is selected
  useEffect(() => {
    if (specialViewItem || selectedDeveloper) {
      setTimeout(() => {
        document.getElementById('item-detail-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [specialViewItem, selectedDeveloper]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: t("common.signedOut"),
      description: t("common.signedOutSuccess")
    });
  };

  const getDashboardRoute = () => {
    if (role === 'admin') return '/admin';
    if (role === 'business') return '/business';
    return '/buyer';
  };

  const switchToBusinessView = () => {
    setUserMode("industry");
    setSelectedDeveloperId(null);
    setSpecialViewItem(null);
    setActiveView(null);
    setShowIndustryCategories(false);
    setTogglePulse(true);
    setTimeout(() => setTogglePulse(false), 2000);
  };

  const switchToBuyerView = () => {
    setUserMode("buyers");
    setSelectedDeveloperId(null);
    setSpecialViewItem(null);
    setActiveView(null);
    setShowIndustryCategories(false);
    setTogglePulse(true);
    setTimeout(() => setTogglePulse(false), 2000);
  };

  const handleQuickAction = (actionKey: string) => {
    switch (actionKey) {
      case 'compare':
        setShowCompareModal(true);
        break;
      case 'topRated':
        setActiveView((prev) => prev === 'bestOf' ? null : 'bestOf');
        setSelectedDeveloperId(null);
        setSpecialViewItem(null);
        break;
      case 'legal':
        setExternalCategory('categories.lawFirms');
        setTimeout(() => setExternalCategory(null), 100);
        break;
      case 'insights':
        if (user) {
          navigate('/insights');
        } else {
          navigate('/auth');
        }
        break;
    }
  };

  const quickActions = [
  { key: 'compare', icon: GitCompare, title: t("hero.qaCompare"), desc: t("hero.qaCompareDesc"), color: "text-primary" },
  { key: 'topRated', icon: Award, title: t("hero.qaTopRated"), desc: t("hero.qaTopRatedDesc"), color: "text-accent" },
  { key: 'legal', icon: Scale, title: t("hero.qaLegal"), desc: t("hero.qaLegalDesc"), color: "text-brand-red" }];



  const verifiedBadges = [
  { label: t("hero.badgeVerifiedDev"), icon: ShieldCheck },
  { label: t("hero.badgeTrustedBroker"), icon: Shield },
  { label: t("hero.badgeVerifiedBuyer"), icon: CheckCircle }];


  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-x-hidden w-full max-w-full">
      {/* Header */}
      <header className="bg-background shadow-sm border-b border-border">
        <div className="container mx-auto px-3 py-0.5 flex items-center justify-between gap-2">
          {/* Logo + Brand in header */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-0 hover:opacity-80 transition-opacity"
            aria-label="Return to home">
            <img src={logoIcon} alt="R8ESTATE" className="h-14 w-14 md:h-20 md:w-20 object-contain -mr-2 md:-mr-3" />
            <div className="flex flex-col leading-none gap-0">
              <span className="inline-flex text-lg md:text-xl font-extrabold leading-none">
                <span className="text-brand-red">R8</span>
                <span className="text-primary">ESTATE</span>
              </span>
              <span className="text-[8px] md:text-[10px] text-muted-foreground tracking-wide whitespace-nowrap -mt-0.5">
                Real Reviews · Real Estate
              </span>
            </div>
          </button>

          {/* Desktop view toggle */}
          <div className="hidden md:block shrink-0">
            {userMode === "buyers" ?
            <button
              onClick={switchToBusinessView}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-primary/30 bg-secondary text-foreground font-semibold text-sm transition-all hover:border-primary/60 hover:bg-primary/10 hover:shadow-md">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>Business</span>
              </button> :

            <button
              onClick={switchToBuyerView}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-primary bg-primary text-primary-foreground shadow-lg font-semibold text-sm transition-all hover:shadow-xl hover:scale-105 ${togglePulse ? 'animate-[pulse_0.6s_ease-in-out_3]' : ''}`}>
                <User className="w-3.5 h-3.5" />
                <span>Buyer</span>
              </button>
            }
          </div>

          {/* Mobile compact actions */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            {userMode === "buyers" ?
            <button
              onClick={switchToBusinessView}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-2 border-primary/30 bg-secondary text-foreground font-semibold text-sm transition-all hover:border-primary/60 hover:bg-primary/10"
              aria-label="Switch to business view">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>Business</span>
              </button> :

            <button
              onClick={switchToBuyerView}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-2 border-primary bg-primary text-primary-foreground shadow-lg font-semibold text-sm transition-all ${togglePulse ? 'animate-[pulse_0.6s_ease-in-out_3]' : ''}`}
              aria-label="Switch to buyer view">
                <User className="w-3.5 h-3.5" />
                <span>Buyer</span>
              </button>
            }
            <button
              onClick={() => {
                const searchInput = document.querySelector<HTMLInputElement>('[data-hero-search]');
                if (searchInput) {searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });searchInput.focus();}
              }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Search">
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
            <LanguageSwitcher />
            <NotificationBell />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <NotificationBell />
            {user ?
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
                      <span className="text-xs text-primary mt-1 capitalize">{role || 'Buyer'}</span>
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
              </DropdownMenu> :

            <div className="flex items-center gap-2">
              {isLoading ?
              <div className="h-10 w-24 rounded-lg bg-muted animate-pulse" /> :
              isReturningDevice ?
              <button
                onClick={() => navigate('/auth')}
                className="px-4 lg:px-5 py-2.5 min-h-[44px] bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {returningDeviceEmail ? `Continue as ${returningDeviceEmail.split('@')[0]}` : 'Continue to Account'}
                </button> :

              <>
                  <button
                  onClick={() => navigate('/auth?type=business')}
                  className="px-4 lg:px-5 py-2.5 min-h-[44px] border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors text-sm">
                    Business Login
                  </button>
                  <button
                  onClick={() => navigate('/auth')}
                  className="px-4 lg:px-5 py-2.5 min-h-[44px] bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                    {t("common.signIn")}
                  </button>
                </>
              }
            </div>
            }
          </div>


        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col bg-background">
       <div className="flex-1 flex flex-col items-center justify-center px-4 pt-0 pb-0 sm:pt-2 sm:pb-2 md:py-6">
             {/* Hero Card with dot-grid background */}
             <div className="relative w-full max-w-3xl rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.03] to-transparent backdrop-blur-sm p-4 md:p-6 mt-2 md:mt-4 overflow-hidden my-[6px] py-[6px]">
               {/* Dot-grid SVG texture */}
               <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
               
                <div className="relative text-center">
                    {/* Platform descriptor */}
                     <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-semibold tracking-[0.2em] uppercase mb-2 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
                       <span className="pb-1 border-b-2 border-accent/60 font-semibold border-0 border-none">{t('hero.platformDescriptor')}</span>
                     </p>

                  {/* Hero Tagline — Claim ABOVE the gauge */}
                  <div className="mb-3 max-w-3xl mx-auto">
                    {userMode === "buyers" ?
                 <>
                    <p className="text-xl sm:text-2xl md:text-3xl leading-tight font-black tracking-tight bg-gradient-to-r from-primary via-brand-red to-accent bg-clip-text text-transparent">
                          {t("hero.tagline")}
                         </p>
                         <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-1.5">
                            <button onClick={() => document.getElementById('trust-showcase')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-verified/30 border-s-2 border-s-verified bg-verified/5 text-xs sm:text-sm font-semibold text-verified-foreground cursor-pointer hover:bg-verified/10 transition-colors">
                              <Shield className="w-3.5 h-3.5 text-verified" />
                              {t("hero.benefit_zero_risk")}
                            </button>
                            <button onClick={() => document.getElementById('trust-showcase')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/30 border-s-2 border-s-accent bg-accent/5 text-xs sm:text-sm font-semibold text-accent-foreground cursor-pointer hover:bg-accent/10 transition-colors">
                              <CheckCircle className="w-3.5 h-3.5 text-accent" />
                              {t("hero.benefit_confident")}
                            </button>
                         </div>
                      </> :
                 <>
                        <p className="text-sm sm:text-lg md:text-xl text-foreground leading-tight">
                          {t("hero.industryTitle1")}
                        </p>
                        <p className="text-sm sm:text-lg md:text-xl text-accent font-semibold leading-tight">
                          {t("hero.industryTitle2")}
                        </p>
                      </>
                 }
                  </div>

                    {/* Interactive Trust Showcase — Gauge as Proof */}
                    <div id="trust-showcase"><HeroTrustShowcase /></div>
               </div>
             </div>

          {/* Mode-specific Description */}
          <p className="text-xs md:text-base text-muted-foreground text-center max-w-2xl mb-2 md:mb-4 px-4 leading-snug mt-3">
            {userMode === "buyers" ? t("hero.description") : t("hero.industryDescription")}
          </p>

          {userMode === "buyers" ?
          <>
              {/* Search Bar */}
              <div className="w-full max-w-3xl px-4 mb-2 md:mb-4">
                <HeroSearchBar onSelectDeveloper={setSelectedDeveloperId} />
              </div>

              {/* AI Trust Strip */}
              <div className="w-full max-w-3xl px-4 mb-3">
                <div className="flex items-center justify-center gap-3 md:gap-6 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground overflow-x-auto scrollbar-hide">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                    <span className="text-[10px] md:text-xs font-semibold">{t("hero.aiVerifiedReviews")}</span>
                  </div>
                  <div className="w-px h-4 bg-primary-foreground/20 flex-shrink-0" />
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Database className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                    <span className="text-[10px] md:text-xs font-semibold">{t("hero.realBuyerData")}</span>
                  </div>
                  <div className="w-px h-4 bg-primary-foreground/20 flex-shrink-0" />
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Ban className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                    <span className="text-[10px] md:text-xs font-semibold">{t("hero.zeroFakeReviews")}</span>
                  </div>
                </div>
              </div>

              {/* Category Links + Special View Grid */}
              <HeroCategoryLinks
              activeView={activeView}
              onViewSelect={(view) => {
                setActiveView((prev) => prev === view ? null : view);
                setSelectedDeveloperId(null);
                setSpecialViewItem(null);
              }}
              onSelectItem={(item) => {
                setSpecialViewItem(item);
                setActiveView(null);
                setSelectedDeveloperId(null);
              }}
              onCategorySelect={(catKey) => {
                setExternalCategory(catKey);
                setActiveView(null);
                setSelectedDeveloperId(null);
                setSpecialViewItem(null);
                setTimeout(() => setExternalCategory(null), 100);
              }} />
            
              {/* Verified Badge Row */}
              <div className="w-full max-w-3xl px-4 mt-3 mb-2">
                <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide">
                  {verifiedBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <span key={badge.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/15 bg-primary/[0.04] text-[10px] md:text-xs font-semibold text-primary whitespace-nowrap">
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>);

                })}
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="w-full max-w-3xl px-4 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.title}
                      onClick={() => handleQuickAction(action.key)}
                      className="flex flex-col items-start gap-1.5 p-3 md:p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-start group">
                      
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Icon className={`w-4 h-4 ${action.color}`} />
                        </div>
                        <span className="text-xs font-bold text-foreground leading-tight">{action.title}</span>
                        <span className="text-[10px] text-muted-foreground leading-snug">{action.desc}</span>
                      </button>);

                })}
                  <MarketPulseWidget onClick={() => handleQuickAction('insights')} />
                </div>
              </div>

              {/* Special View Item Detail */}
              {specialViewItem &&
            <div className="w-full max-w-5xl px-4 mt-8 scroll-mt-24" id="item-detail-section">
                  <ItemDetailSection
                item={specialViewItem}
                onClose={() => setSpecialViewItem(null)} />
              
                </div>
            }

              {/* Developer Detail Card */}
              {selectedDeveloper && !specialViewItem &&
            <div className="w-full max-w-3xl px-4 mt-8 scroll-mt-24" id="item-detail-section">
                  <DeveloperDetailCard
                developer={selectedDeveloper}
                onClose={() => setSelectedDeveloperId(null)} />
              
                </div>
            }

              {/* Featured Identity Spotlight */}
              {!specialViewItem && !selectedDeveloper &&
            <>
              <FeaturedIdentitySpotlight />
              <div className="w-full max-w-3xl px-4">
                <SmartRecommendations onSelectDeveloper={setSelectedDeveloperId} />
              </div>
              <div className="w-full max-w-3xl px-4 mt-4">
                <CommunityHighlights />
              </div>
            </>
            }

              {/* Category Bar */}
              <HeroCategoryItems
              onInteraction={() => {setSelectedDeveloperId(null);setSpecialViewItem(null);setActiveView(null);}}
              externalCategory={externalCategory}
              onSelectItem={(item) => {
                setSpecialViewItem(item);
                setActiveView(null);
                setSelectedDeveloperId(null);
              }} />
            
            </> :

          <>
          {/* ── Business / Industry View ── */}
          {/* Back to Buyer View banner for non-business users */}
          {role !== 'business' && role !== 'admin' &&
            <button
              onClick={switchToBuyerView}
              className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors">
              
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              Not a business? Switch to Buyer View
            </button>
            }
          <div className="w-full max-w-3xl px-4 mb-4">
              {/* Business Feature Cards */}
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
                  onClick={() => navigate(role === 'business' || role === 'admin' ? role === 'admin' ? '/admin' : '/business' : '/auth?type=business')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                   {role === 'business' || role === 'admin' ? 'Go to Dashboard' : 'Claim Your Business Profile'}
                   <ArrowRight className="w-4 h-4" />
                 </button>
                <button
                  onClick={() => {
                    setShowIndustryCategories((prev) => !prev);
                    setTimeout(() => {
                      document.getElementById('industry-categories-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors text-sm">
                
                  Browse Categories   
                </button>
              </div>
            </div>

            {showIndustryCategories &&
            <div id="industry-categories-section" className="w-full scroll-mt-24">
                <BrowseCategoriesGrid
                onSelectCategory={(index) => {
                  setShowIndustryCategories(false);
                  setExternalCategory?.(undefined);
                  setTimeout(() => {
                    setShowIndustryCategories(false);
                  }, 0);
                }}
                onSelectItem={(item) => {
                  setSpecialViewItem(item as any);
                  setTimeout(() => {
                    document.getElementById('item-detail-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }} />
              
              </div>
            }

            {specialViewItem && showIndustryCategories &&
            <div className="w-full max-w-5xl px-4 mt-8 scroll-mt-24" id="item-detail-section">
                <ItemDetailSection
                item={specialViewItem}
                onClose={() => setSpecialViewItem(null)} />
              </div>
            }
          </>
          }
        </div>
      </section>

      {/* Quick Action Modals */}
      <TrustInsightsModal open={showInsightsModal} onOpenChange={setShowInsightsModal} />
      <CompareModal item={null} open={showCompareModal} onClose={() => setShowCompareModal(false)} />

      <Footer />

    </div>);

};

export default Index;