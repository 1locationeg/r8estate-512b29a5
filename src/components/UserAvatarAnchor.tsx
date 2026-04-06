import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserCircle, LayoutDashboard, Mail, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserAvatarAnchorProps {
  size?: "sm" | "md";
  showDropdown?: boolean;
  getDashboardRoute?: () => string;
  onSignOut?: () => void;
}

export const UserAvatarAnchor = ({
  size = "sm",
  showDropdown = false,
  getDashboardRoute,
  onSignOut,
}: UserAvatarAnchorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, role, isLoading: authLoading } = useAuth();

  const sizeClass = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";

  const dashRoute = getDashboardRoute?.() || (
    role === "admin" ? "/admin" :
    role === "business" ? "/business" :
    "/buyer"
  );

  const initials = profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U";

  // Auth still loading
  if (authLoading) {
    return (
      <div className={`${sizeClass} rounded-full flex items-center justify-center bg-muted`}>
        <Loader2 className={`${iconSize} text-muted-foreground animate-spin`} />
      </div>
    );
  }

  // Guest state
  if (!user) {
    return (
      <button
        onClick={() => navigate("/auth")}
        className={`${sizeClass} rounded-full flex items-center justify-center ring-2 ring-primary/30 animate-pulse bg-muted hover:ring-primary/50 transition-all`}
        aria-label={t("common.signIn", "Sign In")}
      >
        <UserCircle className={`${iconSize} text-muted-foreground`} />
      </button>
    );
  }

  // Logged-in avatar element
  const avatarEl = (
    <Avatar className={`${sizeClass} cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all`}>
      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  // Mobile: simple tap → dashboard
  if (!showDropdown) {
    return (
      <button onClick={() => navigate(dashRoute)} aria-label={t("nav.dashboard", "Dashboard")}>
        {avatarEl}
      </button>
    );
  }

  // Desktop: always show full dropdown with Dashboard + Messages + Sign Out
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        {avatarEl}
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
        <DropdownMenuItem onClick={() => navigate(dashRoute)} className="cursor-pointer">
          <LayoutDashboard className="w-4 h-4 me-2" />
          {t("nav.dashboard", "Dashboard")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/messages")} className="cursor-pointer">
          <Mail className="w-4 h-4 me-2" />
          {t("nav.messages", "Messages")}
        </DropdownMenuItem>
        {onSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 me-2" />
              {t("common.signOut", "Sign Out")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
