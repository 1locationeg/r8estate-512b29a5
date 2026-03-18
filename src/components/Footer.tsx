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
            <img src={logoIcon} alt="R8ESTATE" className="h-10 w-10 object-contain -mr-1.5 transition-transform duration-200 hover:scale-110" />
            <div className="flex flex-col leading-none gap-0">
              <span className="inline-flex text-xl md:text-2xl font-bold leading-none">
                <span className="text-brand-red">R8</span>
                <span className="text-primary">ESTATE</span>
              </span>
              <span className="text-[7px] md:text-[8px] text-muted-foreground tracking-wide whitespace-nowrap -mt-0.5">
                {t("footer.brandTagline")}
              </span>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};
