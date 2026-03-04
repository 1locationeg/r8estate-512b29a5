import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
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

export const LandingNav = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile, role, signOut, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardRoute = () => {
    if (role === 'admin') return '/admin';
    if (role === 'developer') return '/developer';
    return '/buyer';
  };

  const links = [
    { label: "Developers", href: "/directory" },
    { label: "Projects", href: "/directory" },
    { label: "Brokers", href: "/directory" },
    { label: "Reviews", href: "/directory" },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img src={logoIcon} alt="R8ESTATE" className="h-8 w-auto" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-extrabold">
              <span className="text-brand-red">R8</span>
              <span className="text-white">ESTATE</span>
            </span>
            <span className="text-[8px] font-semibold text-white/40 uppercase tracking-[0.15em]">Zero Risk. Total Confidence.</span>
          </div>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button key={l.label} onClick={() => navigate(l.href)} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              {l.label}
            </button>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.full_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardRoute())} className="cursor-pointer">
                  <LayoutDashboard className="w-4 h-4 me-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 me-2" /> {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <button onClick={() => navigate("/auth")} className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/15 rounded-lg transition-colors">
                Sign In
              </button>
              <button onClick={() => navigate("/auth")} className="px-4 py-2 text-sm font-semibold bg-accent text-accent-foreground rounded-lg hover:brightness-110 transition-all">
                Write a Review
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary/95 backdrop-blur-lg border-t border-white/10 px-4 py-4 space-y-3">
          {links.map((l) => (
            <button key={l.label} onClick={() => { navigate(l.href); setMobileOpen(false); }} className="block w-full text-left text-sm font-medium text-white/70 py-2">
              {l.label}
            </button>
          ))}
          {!user && (
            <button onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="w-full py-2.5 bg-accent text-accent-foreground rounded-lg font-semibold text-sm mt-2">
              Sign In / Write a Review
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
