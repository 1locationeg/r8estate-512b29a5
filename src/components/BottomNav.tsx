import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare, LayoutGrid, Menu, Users, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MobileNav } from "./MobileNav";
import logoIcon from "@/assets/logo-icon.png";

export const BottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const getDashboardRoute = () => {
    if (role === "admin") return "/admin";
    if (role === "business") return "/business";
    return "/buyer";
  };

  const isReviews = location.pathname === "/reviews";
  const isDirectory = location.pathname === "/directory";
  const isInsights = location.pathname === "/insights";
  const isCommunity = location.pathname === "/community";
  const isDashboard = location.pathname.startsWith("/buyer") || location.pathname.startsWith("/developer") || location.pathname.startsWith("/admin");

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed nav */}
      <div className="h-12 md:hidden" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-12 px-2 max-w-md mx-auto">
          {/* Reviews */}
          <button
            onClick={() => navigate("/reviews")}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-colors ${
              isReviews ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-5 w-5" strokeWidth={isReviews ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t("nav.reviews", "Reviews")}</span>
          </button>

          {/* Categories / Directory */}
          <button
            onClick={() => navigate("/directory")}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-colors ${
              isDirectory ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-5 w-5" strokeWidth={isDirectory ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t("nav.categories", "Categories")}</span>
          </button>

          {/* Center Brand Button */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate("/");
            }}
            className="flex items-center justify-center -mt-4 relative"
          >
            <div className="h-11 w-11 rounded-full bg-white shadow-lg flex items-center justify-center ring-3 ring-background overflow-hidden">
              <img src={logoIcon} alt="R8ESTATE" className="h-10 w-10 object-contain scale-125" />
            </div>
          </button>

          {/* Insights */}
          <button
            onClick={() => {
              if (user) {
                navigate("/insights");
              } else {
                navigate("/auth");
              }
            }}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-colors ${
              isInsights ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Sparkles className="h-5 w-5" strokeWidth={isInsights ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t("nav.insights", "Insights")}</span>
          </button>

          {/* Community */}
          <button
            onClick={() => navigate("/community")}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-colors ${
              isCommunity ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Users className="h-5 w-5" strokeWidth={isCommunity ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{t("nav.community", "Community")}</span>
          </button>

          {/* More / Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 text-muted-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t("nav.more", "More")}</span>
          </button>
        </div>
      </nav>

      {/* Reuse MobileNav sheet for "More" menu */}
      {menuOpen && (
        <MobileNavSheet
          open={menuOpen}
          onOpenChange={setMenuOpen}
          onSignOut={signOut}
          getDashboardRoute={getDashboardRoute}
        />
      )}
    </>
  );
};

// Thin wrapper to control MobileNav's Sheet externally
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";

const MobileNavSheet = ({
  open,
  onOpenChange,
  onSignOut,
  getDashboardRoute,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSignOut: () => void;
  getDashboardRoute: () => string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, isLoading, isReturningDevice, returningDeviceEmail } = useAuth();

  const navLinks = [
    { label: t("nav.developers"), href: "/directory" },
    { label: t("nav.projects"), href: "#" },
    { label: t("nav.reviews"), href: "#" },
    { label: t("nav.about"), href: "#" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 safe-top safe-bottom">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { navigate("/"); onOpenChange(false); }}
                className="inline-flex items-center gap-0 hover:opacity-80 transition-opacity"
              >
                <BrandLogo size="sm" />
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          {user && (
            <div className="p-4 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{profile?.full_name || t("nav.user_fallback")}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <p className="text-xs text-primary capitalize">{role || t("nav.role_buyer")}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => { navigate(link.href); onOpenChange(false); }}
                    className="block w-full text-start px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-border space-y-3">
            {user ? (
              <>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { navigate(getDashboardRoute()); onOpenChange(false); }}>
                  <LayoutDashboard className="w-4 h-4" />
                   {t("nav.dashboard")}
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={() => { onSignOut(); onOpenChange(false); }}>
                  <LogOut className="w-4 h-4" />
                  {t("common.signOut")}
                </Button>
              </>
            ) : isLoading ? (
              <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
            ) : isReturningDevice ? (
               <Button className="w-full" onClick={() => { navigate("/auth"); onOpenChange(false); }}>
                 {returningDeviceEmail ? t("nav.continue_as", { name: returningDeviceEmail.split('@')[0] }) : t("nav.continue_to_account")}
               </Button>
            ) : (
              <Button className="w-full" onClick={() => { navigate("/auth"); onOpenChange(false); }}>
                {t("common.signIn")}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
