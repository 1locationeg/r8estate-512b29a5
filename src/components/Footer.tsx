import { useTranslation } from "react-i18next";
import logoIcon from "@/assets/logo-icon.png";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border safe-bottom">
      {/* Reviews Carousel */}
      <ReviewsCarousel />

      {/* Copyright */}
      <div className="container mx-auto px-4 py-6 md:py-8">
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
  );
};
