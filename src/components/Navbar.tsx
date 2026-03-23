import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, LayoutDashboard, Building2, User, Search, Menu, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NotificationBell } from "@/components/NotificationBell";
import { MobileNavSheet } from "@/components/MobileNavSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  userMode: "buyers" | "industry";
  onSwitchToBusinessView: () => void;
  onSwitchToBuyerView: () => void;
  togglePulse: boolean;
  onSignOut: () => void;
  getDashboardRoute: () => string;
}

export const Navbar = ({
  userMode,
  onSwitchToBusinessView,
  onSwitchToBuyerView,
  togglePulse,
  onSignOut,
  getDashboardRoute,
}: NavbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, isLoading, isReturningDevice, returningDeviceEmail } = useAuth();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const guestNavLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.categories"), href: "/directory" },
    { label: t("nav.businesses"), href: "/directory" },
    { label: t("nav.blog"), href: "/community" },
  ];

  const userNavLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.developers"), href: "/directory" },
    { label: t("nav.reviews"), href: "/reviews" },
    { label: t("nav.community"), href: "/community" },
  ];

  const navLinks = user ? userNavLinks : guestNavLinks;

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="container mx-auto px-3 py-1 flex items-center justify-between gap-2">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-0 hover:opacity-80 transition-opacity shrink-0"
          aria-label="Return to home"
        >
          <BrandLogo size="hero" />
        </button>

        {/* ═══════════ DESKTOP NAV (md+) ═══════════ */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.href)}
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Mode toggle */}
          {userMode === "buyers" ? (
            <button
              onClick={onSwitchToBusinessView}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-primary/30 bg-secondary text-foreground font-semibold text-sm transition-all hover:border-primary/60 hover:bg-primary/10"
            >
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Business</span>
            </button>
          ) : (
            <button
              onClick={onSwitchToBuyerView}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-primary bg-primary text-primary-foreground shadow-lg font-semibold text-sm transition-all hover:shadow-xl hover:scale-105 ${togglePulse ? "animate-[pulse_0.6s_ease-in-out_3]" : ""}`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Buyer</span>
            </button>
          )}

          <LanguageSwitcher />
          <NotificationBell />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.full_name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    <span className="text-xs text-primary mt-1 capitalize">{role || "Buyer"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardRoute())} className="cursor-pointer">
                  <LayoutDashboard className="w-4 h-4 me-2" />
                  {t("nav.dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 me-2" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isLoading ? (
            <div className="h-9 w-20 rounded-lg bg-muted animate-pulse" />
          ) : isReturningDevice ? (
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 min-h-[40px] bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {returningDeviceEmail ? t("nav.continue_as", { name: returningDeviceEmail.split("@")[0] }) : t("nav.continue_to_account")}
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] border border-border text-foreground rounded-lg font-semibold hover:bg-secondary transition-colors text-sm"
              >
                <LogIn className="w-4 h-4" />
                {t("common.signIn")}
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" />
                {t("nav.signUp")}
              </button>
              <button
                onClick={() => navigate("/auth?type=business")}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-accent text-accent-foreground rounded-lg font-bold hover:bg-accent/90 transition-colors text-sm"
              >
                <Building2 className="w-4 h-4" />
                {t("nav.forBusinesses")} →
              </button>
            </>
          )}
        </div>

        {/* ═══════════ MOBILE NAV (below md) ═══════════ */}
        <div className="flex md:hidden items-center gap-0.5 shrink-0">
          {userMode === "buyers" ? (
            <button
              onClick={onSwitchToBusinessView}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full border border-primary/30 bg-secondary text-foreground font-semibold text-[11px] transition-all hover:border-primary/60 hover:bg-primary/10"
              aria-label="Switch to business view"
            >
              <Building2 className="w-3 h-3 text-primary" />
              <span className="hidden min-[360px]:inline">Business</span>
            </button>
          ) : (
            <button
              onClick={onSwitchToBuyerView}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-full border border-primary bg-primary text-primary-foreground shadow-md font-semibold text-[11px] transition-all ${togglePulse ? "animate-[pulse_0.6s_ease-in-out_3]" : ""}`}
              aria-label="Switch to buyer view"
            >
              <User className="w-3 h-3" />
              <span className="hidden min-[360px]:inline">Buyer</span>
            </button>
          )}

          <button
            onClick={() => {
              const searchInput = document.querySelector<HTMLInputElement>("[data-hero-search]");
              if (searchInput) {
                searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
                searchInput.focus();
              }
            }}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>

          <LanguageSwitcher />
          <NotificationBell />

          <button
            onClick={() => setMoreMenuOpen(true)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors ms-0.5"
            aria-label="More menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Mobile slide-out sheet */}
      <MobileNavSheet
        open={moreMenuOpen}
        onOpenChange={setMoreMenuOpen}
        onSignOut={onSignOut}
        getDashboardRoute={getDashboardRoute}
      />
    </header>
  );
};
