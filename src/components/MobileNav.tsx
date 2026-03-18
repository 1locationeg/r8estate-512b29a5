import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";

interface MobileNavProps {
  onSignOut: () => void;
  getDashboardRoute: () => string;
}

export const MobileNav = ({ onSignOut, getDashboardRoute }: MobileNavProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, isLoading, isReturningDevice, returningDeviceEmail } = useAuth();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { label: t("nav.developers"), href: "#" },
    { label: t("nav.projects"), href: "#" },
    { label: t("nav.reviews"), href: "#" },
    { label: t("nav.about"), href: "#" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 safe-top safe-bottom">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  navigate('/');
                  setOpen(false);
                }}
                className="inline-flex items-center gap-0 hover:opacity-80 transition-opacity"
                aria-label="Return to home"
              >
                <BrandLogo size="sm" />
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          {/* User Profile Section */}
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
                  <p className="font-medium text-foreground truncate">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <p className="text-xs text-primary capitalize">{role || "Buyer"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="block px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-medium"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border space-y-3">
            {user ? (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    navigate(getDashboardRoute());
                    setOpen(false);
                  }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    onSignOut();
                    setOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  {t("common.signOut")}
                </Button>
              </>
            ) : (
              isLoading ? (
                <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
              ) : isReturningDevice ? (
                <Button
                  className="w-full"
                  onClick={() => { navigate("/auth"); setOpen(false); }}
                >
                  {returningDeviceEmail ? `Continue as ${returningDeviceEmail.split('@')[0]}` : 'Continue to Account'}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => { navigate("/auth"); setOpen(false); }}
                >
                  {t("common.signIn")}
                </Button>
              )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
