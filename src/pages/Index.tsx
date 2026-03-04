import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { TopDevelopersSection } from "@/components/landing/TopDevelopersSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TrustScoreSection } from "@/components/landing/TrustScoreSection";
import { RecentReviewsSection } from "@/components/landing/RecentReviewsSection";
import { DeveloperCTASection } from "@/components/landing/DeveloperCTASection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden w-full max-w-[100vw]">
      <LandingNav />
      <HeroSection />
      <TrustStrip />
      <CategoriesSection />
      <TopDevelopersSection />
      <HowItWorksSection />
      <TrustScoreSection />
      <RecentReviewsSection />
      <DeveloperCTASection />
      <TestimonialsSection />
      <LandingFooter />
      <PWAInstallBanner />
    </div>
  );
};

export default Index;
