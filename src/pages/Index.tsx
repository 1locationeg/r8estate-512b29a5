import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeroSearchBar, HeroCategoryLinks } from "@/components/HeroSearchBar";
import { HeroCategoryItems } from "@/components/HeroCategoryItems";
import { DeveloperDetailCard } from "@/components/DeveloperDetailCard";
import { ItemDetailSection } from "@/components/ItemDetailSection";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { developers } from "@/data/mockData";
import { LogOut, LayoutDashboard } from "lucide-react";
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
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'bestOf' | 'trending' | 'newLaunches' | null>(null);
  const [specialViewItem, setSpecialViewItem] = useState<any>(null);
  const [externalCategory, setExternalCategory] = useState<string | null>(null);
  const { user, profile, role, signOut, isLoading } = useAuth();
  const { toast } = useToast();

  const selectedDeveloper = useMemo(() => {
    if (!selectedDeveloperId) return null;
    return developers.find((d) => d.id === selectedDeveloperId) || null;
  }, [selectedDeveloperId]);

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
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col safe-x overflow-x-hidden w-full max-w-[100vw] pb-14">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 safe-top">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo - hidden on this page since we show it in hero */}
          <div className="w-10" />

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
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
              </DropdownMenu>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                disabled={isLoading}
                className="px-4 lg:px-6 py-2.5 min-h-[44px] bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading ? t("common.signingIn") : t("common.signIn")}
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <MobileNav onSignOut={handleSignOut} getDashboardRoute={getDashboardRoute} />
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-8 sm:py-16 md:py-20">
           {/* Brand Title */}
           <div className="text-center mb-6 md:mb-8">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 md:gap-3 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-2 hover:opacity-80 transition-opacity"
                aria-label="Return to home"
              >
               <img
                 src={logoIcon}
                 alt="R8ESTATE"
                 className="h-[1.4em] w-auto object-contain"
               />
               <span className="inline-flex">
                 <span className="text-brand-red">R8</span>
                 <span className="text-primary">ESTATE</span>
               </span>
             </button>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent">
              {t("hero.trustMeter")}
            </p>

            {/* Hero Trust Meter Gauge */}
            <div className="relative w-36 h-20 md:w-44 md:h-24 mt-3">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                <defs>
                  <linearGradient id="heroGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(0, 72%, 51%)" />
                    <stop offset="20%" stopColor="hsl(20, 80%, 50%)" />
                    <stop offset="40%" stopColor="hsl(40, 90%, 50%)" />
                    <stop offset="60%" stopColor="hsl(48, 96%, 53%)" />
                    <stop offset="80%" stopColor="hsl(80, 60%, 45%)" />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" />
                  </linearGradient>
                </defs>
                {/* Grey background arc */}
                <path d="M 10 100 A 90 90 0 0 1 190 100" stroke="hsl(var(--border))" strokeWidth="14" fill="none" strokeLinecap="round" />
                {/* Gradient arc - filled to ~75% to show a healthy score */}
                <path 
                  d="M 10 100 A 90 90 0 0 1 190 100" 
                  stroke="url(#heroGaugeGradient)" 
                  strokeWidth="14" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray={`${0.75 * Math.PI * 90} ${Math.PI * 90}`} 
                />
                {/* Arrow marker at 75% position */}
                {(() => {
                  const angle = Math.PI + (0.75) * Math.PI;
                  const mx = 100 + 90 * Math.cos(angle);
                  const my = 100 + 90 * Math.sin(angle);
                  const rotDeg = (0.75) * 180 - 90;
                  return (
                    <>
                      <circle cx={mx} cy={my} r="8" fill="hsl(var(--background))" stroke="hsl(142, 71%, 45%)" strokeWidth="2.5" />
                      <polygon points="-4,5 4,5 0,-6" fill="hsl(142, 71%, 45%)" transform={`translate(${mx},${my}) rotate(${rotDeg})`} />
                    </>
                  );
                })()}
                {/* Score labels */}
                <text x="15" y="108" fontSize="10" fill="hsl(0, 72%, 51%)" fontWeight="bold">0</text>
                <text x="175" y="108" fontSize="10" fill="hsl(142, 71%, 45%)" fontWeight="bold">100</text>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
                <span className="text-2xl md:text-3xl font-black text-foreground">75</span>
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Trust Score</span>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center mb-4 md:mb-6 max-w-3xl">
            <p className="text-base sm:text-lg md:text-xl text-foreground">
              {t("hero.tagline")}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-accent font-semibold mt-1">
              {t("hero.taglineHighlight")}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-muted-foreground text-center max-w-2xl mb-8 md:mb-10 px-4">
            {t("hero.description")}
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-3xl px-4 mb-6 md:mb-8">
            <HeroSearchBar onSelectDeveloper={setSelectedDeveloperId} />
          </div>

          {/* Category Links + Special View Grid */}
          <HeroCategoryLinks 
            activeView={activeView}
            onViewSelect={(view) => {
              setActiveView(prev => prev === view ? null : view);
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
              // Reset after triggering so it can be re-selected
              setTimeout(() => setExternalCategory(null), 100);
            }}
          />

          {/* Special View Item Detail */}
          {specialViewItem && (
            <div className="w-full max-w-5xl px-4 mt-8">
              <ItemDetailSection
                item={specialViewItem}
                onClose={() => setSpecialViewItem(null)}
              />
            </div>
          )}

          {/* Developer Detail Card (appears when developer is selected) */}
          {selectedDeveloper && !specialViewItem && (
            <div className="w-full max-w-3xl px-4 mt-8">
              <DeveloperDetailCard
                developer={selectedDeveloper}
                onClose={() => setSelectedDeveloperId(null)}
              />
            </div>
          )}
        </div>

        {/* Floating Category Bar */}
        <HeroCategoryItems onInteraction={() => { setSelectedDeveloperId(null); setSpecialViewItem(null); setActiveView(null); }} externalCategory={externalCategory} />
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6 md:py-8 safe-bottom">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl font-bold inline-flex items-center gap-2">
                <img src={logoIcon} alt="R8ESTATE" className="h-[1.4em] w-auto object-contain transition-transform duration-200 hover:scale-110" />
                <span className="text-brand-red">R8</span>
                <span className="text-primary">ESTATE</span>
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
};

export default Index;