import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/BrandLogo";
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
          <div className="flex items-center gap-0">
            <BrandLogo size="sm" tagline={t("footer.brandTagline")} className="hover:scale-105 transition-transform duration-200" />
          </div>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};
