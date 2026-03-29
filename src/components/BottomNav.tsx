import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare, LayoutGrid, Users } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { MobileNavSheet } from "@/components/MobileNavSheet";
import { useAuth } from "@/contexts/AuthContext";
import logoIcon from "@/assets/logo-icon.png";

export const BottomNav = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  // Hide BottomNav entirely on messages page (chat has its own nav)
  if (location.pathname === "/messages") {
    return <div className="h-12 md:hidden" />;
  }

  const isReviews = location.pathname === "/reviews";
  const isCommunity = location.pathname === "/community";

  return (
    <>
      <div className="h-12 md:hidden" />

      <nav className="fixed bottom-0 start-0 end-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
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
            onClick={() => navigate("/categories")}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-colors ${
              location.pathname === "/categories" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-5 w-5" strokeWidth={location.pathname === "/categories" ? 2.5 : 2} />
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
            <div className="h-16 w-16 rounded-full bg-white shadow-lg flex items-center justify-center ring-3 ring-background overflow-hidden">
              <img src={logoIcon} alt="R8ESTATE" className="h-14 w-14 object-contain scale-125" />
            </div>
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

          {/* More Menu */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{t("nav.more", "More")}</span>
          </button>
        </div>
      </nav>
      <MobileNavSheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        onSignOut={signOut}
        getDashboardRoute={() =>
          user ? "/buyer" : "/auth"
        }
      />
    </>
  );
};
