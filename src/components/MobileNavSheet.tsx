import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Globe, ChevronDown, Building2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSignOut: () => void;
  getDashboardRoute: () => string;
}

export const MobileNavSheet = ({
  open,
  onOpenChange,
  onSignOut,
  getDashboardRoute,
}: MobileNavSheetProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, isLoading, isReturningDevice, returningDeviceEmail } = useAuth();
  const isAr = i18n.language === "ar";

  const guestNavLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.categories"), href: "/directory" },
    { label: t("nav.businesses"), href: "/directory" },
    { label: t("nav.blog"), href: "/community" },
  ];

  const userNavLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.categories"), href: "/directory" },
    { label: t("nav.developers"), href: "#" },
    { label: t("nav.projects"), href: "/reviews" },
    { label: t("nav.businesses"), href: "/directory" },
  ];

  const navLinks = user ? userNavLinks : guestNavLinks;

  const handleLangSwitch = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 safe-top safe-bottom">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { navigate("/"); onOpenChange(false); }}
                className="inline-flex items-center gap-0 hover:opacity-80 transition-opacity"
              >
                <BrandLogo size="hero" />
              </button>
            </div>
          </div>

          {/* User profile section (logged in only) */}
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

          {/* Navigation links */}
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

            {/* Language selector */}
            <div className="mt-4 px-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Globe className="w-4 h-4" />
                    <span>{isAr ? "العربية" : "English"}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="start">
                  <button
                    onClick={() => handleLangSwitch("en")}
                    className={`block w-full text-start px-3 py-2 rounded text-sm transition-colors ${!isAr ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleLangSwitch("ar")}
                    className={`block w-full text-start px-3 py-2 rounded text-sm transition-colors ${isAr ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'}`}
                  >
                    العربية
                  </button>
                </PopoverContent>
              </Popover>
            </div>

            {/* For Businesses CTA */}
            {role !== 'business' && role !== 'admin' && (
              <div className="mt-3 px-4">
                <button
                  onClick={() => { navigate("/auth?type=business"); onOpenChange(false); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-business-border bg-business text-business-foreground font-bold text-xs transition-all hover:bg-business/80"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>For Businesses</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </nav>

          {/* Bottom actions */}
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
              <>
                <Button variant="outline" className="w-full" onClick={() => { navigate("/auth"); onOpenChange(false); }}>
                  {returningDeviceEmail ? t("nav.continue_as", { name: returningDeviceEmail.split('@')[0] }) : t("nav.continue_to_account")}
                </Button>
                <Button className="w-full" onClick={() => { navigate("/auth"); onOpenChange(false); }}>
                  {t("nav.signUp")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-business-border text-business-foreground bg-business hover:bg-business/80 font-semibold"
                  onClick={() => { navigate("/auth"); onOpenChange(false); }}
                >
                  <Building2 className="w-4 h-4 text-business-border" />
                  {t("nav.forBusinesses")} →
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="w-full" onClick={() => { navigate("/auth"); onOpenChange(false); }}>
                  {t("common.signIn")}
                </Button>
                <Button className="w-full" onClick={() => { navigate("/auth"); onOpenChange(false); }}>
                  {t("nav.signUp")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-business-border text-business-foreground bg-business hover:bg-business/80 font-semibold"
                  onClick={() => { navigate("/auth"); onOpenChange(false); }}
                >
                  <Building2 className="w-4 h-4 text-business-border" />
                  {t("nav.forBusinesses")} →
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
