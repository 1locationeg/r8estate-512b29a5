import { useState } from "react";
import { ViewToggle } from "@/components/ViewToggle";
import { SearchBar } from "@/components/SearchBar";
import { DeveloperCard } from "@/components/DeveloperCard";
import { ReviewCard } from "@/components/ReviewCard";
import { developers, reviews } from "@/data/mockData";
import { TrendingUp, Shield, Users, Award } from "lucide-react";

const Index = () => {
  const [currentView, setCurrentView] = useState<"buyers" | "industry">("buyers");

  const stats = [
    { icon: Users, label: "Verified Reviews", value: "4,185+" },
    { icon: Shield, label: "Verified Developers", value: "150+" },
    { icon: TrendingUp, label: "Projects Rated", value: "580+" },
    { icon: Award, label: "Trust Score Avg", value: "91.6" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
              R8
            </div>
            <span className="text-2xl font-bold text-foreground">R8ESTATE</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Developers
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Projects
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Reviews
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <ViewToggle onViewChange={setCurrentView} />
          </div>

          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {currentView === "buyers" ? (
                <>
                  Trust Verified.
                  <br />
                  <span className="text-primary">Investments Secured.</span>
                </>
              ) : (
                <>
                  Build Your
                  <br />
                  <span className="text-primary">Reputation Score.</span>
                </>
              )}
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {currentView === "buyers"
                ? "Make informed decisions with verified reviews from real buyers. Investigate developers and projects before you invest."
                : "Showcase your track record and build trust with potential buyers. Manage your reputation with powerful analytics."}
            </p>
            <SearchBar />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Top Rated Developers</h2>
              <p className="text-muted-foreground">Verified by thousands of real buyers</p>
            </div>
            <button className="text-primary font-semibold hover:underline">View All →</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Recent Reviews</h2>
              <p className="text-muted-foreground">Real feedback from verified buyers</p>
            </div>
            <button className="text-primary font-semibold hover:underline">View All →</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl">
                  R8
                </div>
                <span className="text-xl font-bold text-foreground">R8ESTATE</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Trust verified. Investments secured. The reputation platform for off-plan real estate.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Developers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Projects</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Reviews</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">TrustScore</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Guidelines</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 R8ESTATE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
