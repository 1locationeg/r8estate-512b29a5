import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ViewToggle } from "@/components/ViewToggle";
import { SearchBar } from "@/components/SearchBar";
import { DeveloperCard } from "@/components/DeveloperCard";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewFilters, ReviewFilterType } from "@/components/ReviewFilters";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { developers, reviews } from "@/data/mockData";
import { TrendingUp, Shield, Users, Award, LogOut, LayoutDashboard } from "lucide-react";
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
  const [currentView, setCurrentView] = useState<"buyers" | "industry">("buyers");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilterType>("all");
  const { user, profile, role, signOut, isLoading } = useAuth();
  const { toast } = useToast();

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") return reviews.slice(0, 6);
    const ratingFilter = parseInt(reviewFilter);
    return reviews.filter((r) => r.rating === ratingFilter).slice(0, 6);
  }, [reviewFilter]);

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

  const stats = [
    { icon: Users, label: t("stats.verifiedReviews"), value: "4,185+" },
    { icon: Shield, label: t("stats.verifiedDevelopers"), value: "150+" },
    { icon: TrendingUp, label: t("stats.projectsRated"), value: "580+" },
    { icon: Award, label: t("stats.trustScoreAvg"), value: "91.6" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile First */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <img src={logoIcon} alt="R8ESTATE" className="h-10 md:h-14 w-auto object-contain" />
            <span className="text-xl md:text-2xl font-bold">
              <span className="text-brand-red">R8</span>
              <span className="text-primary">ESTATE</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t("nav.developers")}
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t("nav.projects")}
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t("nav.reviews")}
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {t("nav.about")}
            </a>
          </nav>

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
                className="px-4 lg:px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading ? t("common.signingIn") : t("common.signIn")}
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <MobileNav onSignOut={handleSignOut} getDashboardRoute={getDashboardRoute} />
        </div>
      </header>

      {/* Hero Section - Mobile First */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <ViewToggle onViewChange={setCurrentView} />
          </div>

          <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
              {currentView === "buyers" ? (
                <>
                  {t("hero.buyersTitle1")}
                  <br />
                  <span className="text-primary">{t("hero.buyersTitle2")}</span>
                </>
              ) : (
                <>
                  {t("hero.industryTitle1")}
                  <br />
                  <span className="text-primary">{t("hero.industryTitle2")}</span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto px-2">
              {currentView === "buyers"
                ? t("hero.buyersDescription")
                : t("hero.industryDescription")}
            </p>
            <SearchBar />
          </div>

          {/* Stats - Mobile First Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-3 md:p-0">
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl mb-2 md:mb-3">
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="text-xl md:text-2xl font-bold text-foreground mb-0.5 md:mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers Section - Mobile First */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">{t("developers.topRated")}</h2>
              <p className="text-sm md:text-base text-muted-foreground">{t("developers.verifiedByBuyers")}</p>
            </div>
            <button className="text-primary font-semibold hover:underline text-sm md:text-base self-start sm:self-center">
              {t("common.viewAll")}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {developers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Reviews Section - Mobile First */}
      <section className="py-10 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">{t("reviews.recentReviews")}</h2>
              <p className="text-sm md:text-base text-muted-foreground">{t("reviews.realFeedback")}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <ReviewFilters activeFilter={reviewFilter} onFilterChange={setReviewFilter} />
              </div>
              <button className="text-primary font-semibold hover:underline whitespace-nowrap text-sm md:text-base self-start">
                {t("common.viewAll")}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 md:py-12 text-muted-foreground text-sm md:text-base">
                No reviews found for this rating.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer - Mobile First */}
      <footer className="bg-card border-t border-border py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 mb-3 md:mb-4">
                <img src={logoIcon} alt="R8ESTATE" className="h-10 md:h-14 w-auto object-contain" />
                <span className="text-lg md:text-xl font-bold">
                  <span className="text-brand-red">R8</span>
                  <span className="text-primary">ESTATE</span>
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                {t("footer.tagline")}
              </p>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">{t("footer.platform")}</h3>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">{t("nav.developers")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("nav.projects")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("nav.reviews")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("developers.trustScore")}</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">{t("footer.resources")}</h3>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.blog")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.helpCenter")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.apiDocs")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.contact")}</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 md:mb-4 text-sm md:text-base">{t("footer.legal")}</h3>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.guidelines")}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 md:pt-8 border-t border-border text-center text-xs md:text-sm text-muted-foreground">
            {t("footer.copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
