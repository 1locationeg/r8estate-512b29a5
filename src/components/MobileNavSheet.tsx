import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandLogo } from "@/components/BrandLogo";

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
