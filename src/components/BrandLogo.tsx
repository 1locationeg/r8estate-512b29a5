import { useTranslation } from "react-i18next";
import logoIcon from "@/assets/logo-icon.png";
import { cn } from "@/lib/utils";

type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "hero";

interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
  tagline?: string;
  subtitle?: string;
}

const sizeConfig = {
  xs: { img: "h-10 w-10 -me-1.5", text: "text-lg", tagline: "text-[7px]" },
  sm: { img: "h-10 w-10 -me-1.5", text: "text-lg", tagline: "text-[7px]" },
  md: { img: "h-10 w-10 -me-1.5", text: "text-lg", tagline: "text-[7px]" },
  lg: { img: "h-14 w-14 -me-2", text: "text-2xl", tagline: "text-[8px]" },
  hero: { img: "h-14 w-14 md:h-20 md:w-20 -me-2 md:-me-3", text: "text-lg md:text-xl", tagline: "text-[8px] md:text-[10px]" },
};

export const BrandLogo = ({
  size = "md",
  className,
  tagline,
  subtitle,
}: BrandLogoProps) => {
  const { t } = useTranslation();
  const config = sizeConfig[size];
  const displayTagline = tagline ?? t("brandTagline");

  return (
    <div dir="ltr" className={cn("inline-flex items-center gap-0", className)}>
      <img src={logoIcon} alt="R8ESTATE" className={cn("object-contain", config.img)} />
      <div className="flex flex-col leading-none gap-0" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <span className={cn("inline-flex font-extrabold leading-none", config.text)}>
          <span className="text-brand-red">R8</span>
          <span className="text-primary">ESTATE</span>
        </span>
        {displayTagline && (
          <span className={cn("text-muted-foreground tracking-wide whitespace-nowrap -mt-0.5", config.tagline)}>
            {displayTagline}
          </span>
        )}
        {subtitle && (
          <span className="text-muted-foreground uppercase tracking-wider mt-0.5 text-center font-bold text-xs border-0">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
