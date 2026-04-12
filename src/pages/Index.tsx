import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroSearchBar, HeroCategoryLinks } from "@/components/HeroSearchBar";
import { MiniJourneyArc } from "@/components/MiniJourneyArc";
import { JourneyScrollSections } from "@/components/JourneyScrollSections";
import { FeaturedIdentitySpotlight } from "@/components/FeaturedIdentitySpotlight";
import { TrustInsightsModal } from "@/components/TrustInsightsModal";
import { CompareModal } from "@/components/CompareModal";

import { HeroTrustShowcase } from "@/components/HeroTrustShowcase";
import { HeroCategoryItems, categories as heroCategoryList } from "@/components/HeroCategoryItems";
import { BrowseCategoriesGrid } from "@/components/BrowseCategoriesGrid";
import { DeveloperDetailCard } from "@/components/DeveloperDetailCard";
import { ItemDetailSection } from "@/components/ItemDetailSection";
import { ViewToggle } from "@/components/ViewToggle";
import { Footer } from "@/components/Footer";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { CommunityHighlights } from "@/components/CommunityHighlights";
import { MarketPulseWidget } from "@/components/MarketPulseWidget";
import { DealWatchWidget } from "@/components/DealWatchWidget";
import StepTimeline from "@/components/StepTimeline";
import CompareEngineShowcase from "@/components/CompareEngineShowcase";
import { AudienceSegmentCards } from "@/components/AudienceSegmentCards";
import { CollectiveBuyerProtection } from "@/components/CollectiveBuyerProtection";
import { LaunchWatchWidget } from "@/components/LaunchWatchWidget";

import { TractionStats } from "@/components/TractionStats";
import { developers } from "@/data/mockData";
import { getSearchIndex } from "@/data/searchIndex";
import { BarChart3, Shield, TrendingUp, Star, ArrowRight, ShieldCheck, Database, Ban, GitCompare, Award, LineChart, CheckCircle, Building2, User, MessageSquarePlus, ScanSearch, Sparkles, Fingerprint, Users } from "lucide-react";
import HowWeWork from "@/components/HowWeWork";
import ContractCheckCard from "@/components/ContractCheckCard";
import ContractUploadModal from "@/components/ContractUploadModal";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { CopilotBriefBanner } from "@/components/CopilotBriefBanner";
import { HeroNextSteps } from "@/components/HeroNextSteps";


const Index = () => { // hero-phase-v2
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMode, setUserMode] = useState<"buyers" | "industry">("buyers");
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'bestOf' | 'trending' | 'newLaunches' | null>(null);
  const [specialViewItem, setSpecialViewItem] = useState<any>(null);
  const [externalCategory, setExternalCategory] = useState<string | null>(null);
  const [showIndustryCategories, setShowIndustryCategories] = useState(false);
  const [togglePulse, setTogglePulse] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showAgentHint, setShowAgentHint] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [starCount, setStarCount] = useState(0);

  // Cycle: show "Reviews" for 6s, then animate stars 1→5 (600ms each), hold 1s, repeat
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let starInterval: ReturnType<typeof setInterval>;

    const startStarPhase = () => {
      setShowStars(true);
      setStarCount(0);
      let count = 0;
      starInterval = setInterval(() => {
        count++;
        setStarCount(count);
        if (count >= 5) {
          clearInterval(starInterval);
          // Hold 5 stars for 1s, then back to text
          timeout = setTimeout(() => {
            setShowStars(false);
            setStarCount(0);
            // Show text for 6s, then repeat
            timeout = setTimeout(startStarPhase, 6000);
          }, 1000);
        }
      }, 600);
    };

    // Initial: show text for 6s first
    timeout = setTimeout(startStarPhase, 6000);

    return () => {
      clearTimeout(timeout);
      clearInterval(starInterval);
    };
  }, []);
  const { user, profile, role, signOut, isLoading, isReturningDevice, returningDeviceEmail } = useAuth();
  const { toast } = useToast();
  const detailScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedDeveloper = useMemo(() => {
    if (!selectedDeveloperId) return null;
    return developers.find((d) => d.id === selectedDeveloperId) || null;
  }, [selectedDeveloperId]);

  // Post-email-verification: detect fresh login on homepage and offer dashboard redirect
  useEffect(() => {
    if (!user || isLoading || !role) return;
    // Check URL hash for email verification callback (type=signup or type=recovery)
    const hash = window.location.hash;
    if (hash.includes('type=signup') || hash.includes('type=magiclink')) {
      // Clear hash
      window.history.replaceState(null, '', window.location.pathname);
      toast({
        title: t("common.emailVerified", "Email verified! 🎉"),
        description: t("common.welcomeRedirect", "Welcome to R8ESTATE! Redirecting to your dashboard..."),
        duration: 3000
      });
      setTimeout(() => navigate(getDashboardRoute()), 1500);
      return;
    }
  }, [user, isLoading, role]);

  // Handle navigation from /categories page — open item detail or scroll to category
  useEffect(() => {
    const state = location.state as { openItemId?: string; scrollToCategory?: number } | null;
    if (!state) return;

    if (state.openItemId) {
      const searchIndex = getSearchIndex();
      const found = searchIndex.find(si => si.id === state.openItemId);
      if (found) {
        setSpecialViewItem(found);
        setActiveView(null);
        setSelectedDeveloperId(null);
      }
    }

    if (typeof state.scrollToCategory === "number") {
      const cat = heroCategoryList[state.scrollToCategory];
      if (cat) {
        setExternalCategory(cat.labelKey);
        setSpecialViewItem(null);
        setActiveView(null);
        setSelectedDeveloperId(null);
        setTimeout(() => {
          document.querySelector('[data-hero-categories]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state]);


  useEffect(() => {
    if (!specialViewItem && !selectedDeveloper) return;

    const scrollToDetailTop = () => {
      const detailSection = document.getElementById('item-detail-section');
      if (!detailSection) return;

      const navbar = document.querySelector('header');
      const navbarHeight = navbar instanceof HTMLElement ? navbar.offsetHeight : 0;
      const topOffset = Math.max(navbarHeight + 12, 88);
      const detailTop = detailSection.getBoundingClientRect().top + window.scrollY - topOffset;

      window.scrollTo({
        top: Math.max(0, detailTop),
        left: 0,
        behavior: 'smooth',
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToDetailTop);
    });

    if (detailScrollTimeoutRef.current) {
      clearTimeout(detailScrollTimeoutRef.current);
    }

    detailScrollTimeoutRef.current = setTimeout(scrollToDetailTop, 260);

    return () => {
      if (detailScrollTimeoutRef.current) {
        clearTimeout(detailScrollTimeoutRef.current);
        detailScrollTimeoutRef.current = null;
      }
    };
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

  const quickActions: {key: string;icon: typeof GitCompare;title: string;desc: string;color: string;}[] = [];



  const verifiedBadges = [
  { label: t("hero.badgeVerifiedDev"), icon: ShieldCheck },
  { label: t("hero.badgeTrustedBroker"), icon: Shield },
  { label: t("hero.badgeVerifiedBuyer"), icon: CheckCircle }];


  /* ─── Hero content block ─── */
  const heroBlock = (
    <div className="w-full flex flex-col items-center pt-1 px-2 md:px-4 lg:px-6">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col items-center">
        {/* Hero Card */}
        <div className="relative w-full max-w-[1100px] rounded-2xl border border-primary/15 bg-card shadow-sm p-2 md:p-3 mt-0">
          <div className="relative text-center">
             <p className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.18em] uppercase mb-2 rounded-full px-3.5 py-1.5 bg-[#e8f5e9]/70 backdrop-blur-sm text-[#2e7d32]">
              <span className="pb-0 font-bold">TRUST</span>
              <svg viewBox="0 0 20 24" fill="none" className="w-4 h-5 shrink-0" aria-label="Verified">
                <path d="M10 0C10 0 12.5 2.5 16 2.5C16 2.5 17.5 9 16.5 13C15.5 17 10 21.5 10 21.5C10 21.5 4.5 17 3.5 13C2.5 9 4 2.5 4 2.5C7.5 2.5 10 0 10 0Z" fill="#6ab04c" />
                <path d="M6.5 11.5L8.8 13.8L13.5 8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="pb-0 font-bold">PLATFORM</span>
            </p>

            <div className="mb-0 max-w-[1100px] mx-auto py-3 md:py-4">
              {userMode === "buyers" ? (
                <>
                  <p className="text-base sm:text-lg md:text-xl leading-tight font-medium tracking-tight text-muted-foreground">
                    {t("hero.tagline_line1")}
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl leading-tight font-black tracking-tight hero-keys-shimmer mt-1">
                    {showStars ? (
                      <>
                        <span className="inline-flex items-center gap-1 align-middle">
                          {[1,2,3,4,5].map(i => {
                            const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#00b67a'];
                            const isFilled = i <= starCount;
                            const fillColor = isFilled
                              ? (starCount >= 5 ? '#00b67a' : colors[starCount - 1])
                              : undefined;
                            return (
                              <Star
                                key={i}
                                className={`w-7 h-7 md:w-9 md:h-9 transition-all duration-500 ${
                                  isFilled
                                    ? 'scale-110'
                                    : 'scale-90'
                                }`}
                                style={isFilled ? { fill: fillColor, color: fillColor } : { fill: 'none', color: 'hsl(var(--muted-foreground) / 0.35)' }}
                              />
                            );
                          })}
                        </span>
                        {" "}{t("hero.tagline_line2_post")}
                      </>
                    ) : (
                      t("hero.tagline_line2")
                    )}
                  </p>

                  {/* Hero Power CTAs */}
                   <div className="flex flex-row items-center justify-center gap-3 mt-3 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
                      <button
                        onClick={() => navigate("/reviews")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card text-foreground hover:border-primary/40 hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.25)] transition-all duration-300 cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs font-bold whitespace-nowrap">{t("hero.ctaSeeOwners")}</span>
                      </button>
                      <button
                        onClick={() => navigate("/reviews")}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_-4px_hsl(var(--glow-accent)/0.4)] hover:shadow-[0_0_28px_-2px_hsl(var(--glow-accent)/0.5)] transition-all duration-300 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold whitespace-nowrap">{t("hero.ctaProtectMoney")}</span>
                      </button>
                    </div>

                    {/* Subtle AI Agent hint */}
                    <div className="flex justify-center mt-2 animate-[fadeInUp_0.6s_ease-out_0.5s_both]">
                      <button
                        onClick={() => setShowAgentHint(true)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{t("hero.askAgent")}</span>
                        <span>→</span>
                      </button>
                    </div>

                    <TrustInsightsModal open={showAgentHint} onOpenChange={setShowAgentHint} />
                </>
              ) : (
                <>
                  <p className="text-sm sm:text-lg md:text-xl text-foreground leading-tight">{t("hero.industryTitle1")}</p>
                  <p className="text-sm sm:text-lg md:text-xl text-accent font-semibold leading-tight">{t("hero.industryTitle2")}</p>
                </>
              )}
            </div>

            <div id="trust-showcase" className="-mt-2">
              <HeroTrustShowcase />
            </div>

            {/* Traction Stats */}
            <div className={cn("w-full mt-2 mb-0 transition-all duration-300", searchFocused && "opacity-30 pointer-events-none")}>
            <TractionStats />
            </div>

            {/* Next Steps CTAs */}
            <HeroNextSteps />

            {/* Journey Station Arc */}
            <div className={cn("w-full mt-3 mb-0 transition-all duration-300", searchFocused && "opacity-30 pointer-events-none")}>
              <div className="relative rounded-2xl border border-primary/15 bg-gradient-to-br from-background/95 via-background/90 to-primary/5 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2">
                <MiniJourneyArc onStartJourney={() => navigate('/categories')} />
              </div>
            </div>

            {userMode === "buyers" && (
              <>
                {searchFocused && (
                  <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md transition-all duration-300 ease-in-out hidden md:block" onClick={() => setSearchFocused(false)} />
                )}
                <div className={cn("w-full max-w-[700px] mx-auto transition-all duration-300 ease-in-out", searchFocused && "relative z-50")}>
                  <HeroSearchBar
                    onSelectDeveloper={(id) => { setSpecialViewItem(null); setActiveView(null); setSelectedDeveloperId(id); }}
                    onSelectItem={(item) => { setSelectedDeveloperId(null); setActiveView(null); setSpecialViewItem(item); }}
                    onFocusChange={setSearchFocused}
                    showQuickIcons={false}
                  />
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[hsl(210,20%,98%)] flex flex-col overflow-x-hidden w-full max-w-full" style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" as any }}>
      <Navbar
        userMode={userMode}
        onSwitchToBusinessView={switchToBusinessView}
        onSwitchToBuyerView={switchToBuyerView}
        togglePulse={togglePulse}
        onSignOut={handleSignOut}
        getDashboardRoute={getDashboardRoute}
      />

      {userMode === "buyers" ? (
        <>
          {heroBlock}

          {/* Journey Scroll Sections: 1/4, 2/4, 3/4, 4/4 */}
          <JourneyScrollSections />

          {/* ─── Below-the-fold: unified sections ─── */}
          <section className="flex-1 flex flex-col">
            <div className="w-full max-w-[1440px] mx-auto flex-1 flex flex-col items-center px-3 sm:px-4 md:px-8 lg:px-12 pt-0 pb-safe">

              {/* Trust Strip — softened */}
              <div className="w-full max-w-[1100px] py-8 md:py-12">
                <div className="flex items-center justify-between gap-1.5 py-2.5 px-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-1.5 bg-primary/10 rounded-full py-1.5 px-3 border border-primary/15 flex-1 justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[9px] md:text-[11px] font-medium text-foreground whitespace-nowrap">{t("widgets.verifiedReviews")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/10 rounded-full py-1.5 px-3 border border-primary/15 flex-1 justify-center">
                    <Fingerprint className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[9px] md:text-[11px] font-medium text-foreground whitespace-nowrap">{t("widgets.realBuyers")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/10 rounded-full py-1.5 px-3 border border-primary/15 flex-1 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[9px] md:text-[11px] font-medium text-foreground whitespace-nowrap">{t("widgets.realExperts")}</span>
                  </div>
                </div>
              </div>

              <div className="w-16 h-px bg-border mx-auto" />

              {/* HowWeWork */}
              <div className="w-full max-w-[1100px] py-8 md:py-12">
                <HowWeWork />
              </div>

              <div className="w-16 h-px bg-border mx-auto" />

              {/* CollectiveBuyerProtection */}
              <div className="w-full max-w-[1100px] py-8 md:py-12">
                <CollectiveBuyerProtection />
              </div>

              <div className="w-16 h-px bg-border mx-auto" />

              {/* Category Links */}
              <div className="w-full max-w-[1100px] py-8 md:py-12">
                <HeroCategoryLinks
                  activeView={activeView}
                  onViewSelect={(view) => { setActiveView((prev) => prev === view ? null : view); setSelectedDeveloperId(null); setSpecialViewItem(null); }}
                  onSelectItem={(item) => { setSpecialViewItem(item); setActiveView(null); setSelectedDeveloperId(null); }}
                  onCategorySelect={(catKey) => { setExternalCategory(catKey); setActiveView(null); setSelectedDeveloperId(null); setSpecialViewItem(null); setTimeout(() => setExternalCategory(null), 100); }}
                />
              </div>

              <div className="w-16 h-px bg-border mx-auto" />

              {/* Quick Actions + Widgets */}
              <div className="w-full max-w-[1100px] py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button key={action.title} onClick={() => handleQuickAction(action.key)} className="flex flex-col items-start gap-1.5 p-3 md:p-4 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-[0_0_20px_-6px_hsl(var(--primary)/0.15)] transition-all duration-500 text-start group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                          <Icon className={`w-4 h-4 text-primary`} />
                        </div>
                        <span className="text-xs font-bold text-foreground leading-tight">{action.title}</span>
                        <span className="text-[10px] text-muted-foreground leading-snug">{action.desc}</span>
                      </button>
                    );
                  })}
                  <DealWatchWidget />
                  <LaunchWatchWidget />
                  <ContractCheckCard onClick={() => setShowContractModal(true)} />
                  <MarketPulseWidget onClick={() => handleQuickAction('insights')} />
                </div>
              </div>

              {/* Special View Item Detail */}
              {specialViewItem && (
                <div className="w-full max-w-[1100px] mt-8 scroll-mt-32 md:scroll-mt-36" id="item-detail-section">
                  <ItemDetailSection item={specialViewItem} onClose={() => setSpecialViewItem(null)} />
                </div>
              )}

              {/* Developer Detail Card */}
              {selectedDeveloper && !specialViewItem && (
                <div className="w-full max-w-[1100px] mt-8 scroll-mt-32 md:scroll-mt-36" id="item-detail-section">
                  <DeveloperDetailCard developer={selectedDeveloper} onClose={() => setSelectedDeveloperId(null)} />
                </div>
              )}

              <div className="w-16 h-px bg-border mx-auto" />

              {/* StepTimeline */}
              <div className="w-full max-w-[1100px] py-8 md:py-12"><StepTimeline /></div>

              <div className="w-16 h-px bg-border mx-auto" />

              {/* CompareEngineShowcase */}
              <div className="w-full max-w-[1100px] py-8 md:py-12 bg-primary/[0.02] -mx-3 sm:-mx-4 md:-mx-8 lg:-mx-12 px-3 sm:px-4 md:px-8 lg:px-12"><CompareEngineShowcase /></div>

              <div className="w-16 h-px bg-border mx-auto" />

              {/* AudienceSegmentCards */}
              <div className="w-full max-w-[1100px] py-8 md:py-12"><AudienceSegmentCards /></div>

              {!specialViewItem && !selectedDeveloper && (
                <>
                  <div className="w-16 h-px bg-border mx-auto" />

                  {/* FeaturedIdentitySpotlight */}
                  <div className="w-full max-w-[1100px] py-8 md:py-12"><FeaturedIdentitySpotlight /></div>

                  <div className="w-16 h-px bg-border mx-auto" />

                  {/* SmartRecommendations */}
                  <div className="w-full max-w-[1100px] py-8 md:py-12"><SmartRecommendations onSelectDeveloper={setSelectedDeveloperId} /></div>

                  <div className="w-16 h-px bg-border mx-auto" />

                  {/* CommunityHighlights */}
                  <div className="w-full max-w-[1100px] py-8 md:py-12"><CommunityHighlights /></div>
                </>
              )}

            </div>
          </section>
        </>
      ) : (
        <section className="flex-1 flex flex-col business-mode">
          <div className="w-full max-w-[1440px] mx-auto flex-1 flex flex-col items-center px-4 md:px-8 lg:px-12 pt-0 pb-0 sm:pt-1 sm:pb-1 md:py-2">
            {/* Hero Card for business mode */}
            <div className="relative w-full max-w-[1100px] rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.03] to-transparent backdrop-blur-sm p-4 md:p-5 mt-1 md:mt-2 overflow-hidden my-[4px] py-[4px] bg-card shadow-sm ai-grain ai-glow">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              <div className="relative text-center">
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-semibold tracking-[0.2em] uppercase mb-2 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
                  <span className="pb-1 font-semibold">{t('hero.platformDescriptor')}</span>
                </p>
                <div className="mb-1.5 max-w-[1100px] mx-auto">
                  <p className="text-sm sm:text-lg md:text-xl text-foreground leading-tight">{t("hero.industryTitle1")}</p>
                  <p className="text-sm sm:text-lg md:text-xl text-accent font-semibold leading-tight">{t("hero.industryTitle2")}</p>
                </div>
                <div id="trust-showcase"><HeroTrustShowcase /></div>
              </div>
            </div>

            <div className="w-full max-w-[1100px] mt-0 mb-0">
              <div className="relative rounded-2xl border border-primary/15 bg-gradient-to-br from-background/95 via-background/90 to-primary/5 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2">
                <MiniJourneyArc onStartJourney={() => navigate('/categories')} />
              </div>
            </div>
            <div className="w-full max-w-[1100px] mt-3 mb-0"><TractionStats /></div>
            

            {/* Business view */}
            {role !== 'business' && role !== 'admin' && (
              <button onClick={switchToBuyerView} className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-lg border border-business-border/30 bg-business text-business-foreground text-xs font-semibold hover:bg-business/80 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                Not a business? Switch to Buyer View
              </button>
            )}
            <div className="w-full max-w-[1100px] mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-sm font-bold text-foreground">Reputation Analytics</h3>
                  <p className="text-xs text-muted-foreground leading-snug">Track your trust score, review trends, and buyer sentiment in real time.</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border text-center">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Shield className="w-5 h-5 text-accent" /></div>
                  <h3 className="text-sm font-bold text-foreground">Verified Profile</h3>
                  <p className="text-xs text-muted-foreground leading-snug">Claim and verify your business identity to build buyer confidence.</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div>
                  <h3 className="text-sm font-bold text-foreground">Lead Generation</h3>
                  <p className="text-xs text-muted-foreground leading-snug">Convert trust into sales — high-intent buyers discover you organically.</p>
                </div>
              </div>

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

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => navigate(role === 'business' || role === 'admin' ? role === 'admin' ? '/admin' : '/business' : '/auth?type=business')} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                  {role === 'business' || role === 'admin' ? 'Go to Dashboard' : 'Claim Your Business Profile'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => { setShowIndustryCategories((prev) => !prev); setTimeout(() => { document.getElementById('industry-categories-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }} className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors text-sm">
                  Browse Categories
                </button>
              </div>
            </div>

            {showIndustryCategories && (
              <div id="industry-categories-section" className="w-full scroll-mt-24">
                <BrowseCategoriesGrid
                  onSelectCategory={(index) => { setShowIndustryCategories(false); setExternalCategory?.(undefined); }}
                  onSelectItem={(item) => { setSpecialViewItem(item as any); setTimeout(() => { document.getElementById('item-detail-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); }}
                />
              </div>
            )}

            {specialViewItem && showIndustryCategories && (
              <div className="w-full max-w-[1100px] mt-8 scroll-mt-24" id="item-detail-section">
                <ItemDetailSection item={specialViewItem} onClose={() => setSpecialViewItem(null)} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Action Modals */}
      <TrustInsightsModal open={showInsightsModal} onOpenChange={setShowInsightsModal} />
      <CompareModal item={null} open={showCompareModal} onClose={() => setShowCompareModal(false)} />
      <ContractUploadModal open={showContractModal} onOpenChange={setShowContractModal} />

      {/* Trust Badges + Reviews + Footer — wrapped for scroll-snap reachability */}
      <div className="snap-start mt-4">
        <div className={cn("flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4 md:py-6", userMode === "industry" && "business-mode")}>
          <button onClick={() => document.getElementById('trust-showcase')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-verified/30 border-s-2 border-s-verified bg-verified/5 text-xs sm:text-sm font-semibold text-verified-foreground cursor-pointer hover:bg-verified/10 transition-colors">
            <Shield className="w-3.5 h-3.5 text-verified" />
            {t("hero.benefit_zero_risk")}
          </button>
          <button onClick={() => document.getElementById('trust-showcase')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/30 border-s-2 border-s-accent bg-accent/5 text-xs sm:text-sm font-semibold text-accent-foreground cursor-pointer hover:bg-accent/10 transition-colors">
            <CheckCircle className="w-3.5 h-3.5 text-accent" />
            {t("hero.benefit_confident")}
          </button>
        </div>

        <ReviewsCarousel />
        <Footer />
      </div>
    </div>
  );

};

export default Index;