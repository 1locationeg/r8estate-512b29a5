import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Globe, Building2, Leaf, Handshake, Users, ShieldCheck, TrendingUp, BarChart3, ArrowRight, ExternalLink, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sdgGoals = [
  {
    number: 11,
    title: "Sustainable Cities & Communities",
    color: "hsl(35, 85%, 55%)",
    icon: Building2,
    description: "R8ESTATE promotes transparent, well-planned urban development by enabling verified reviews of real estate developers, ensuring buyers invest in sustainable communities.",
    alignments: [
      "Verified developer ratings promote quality construction standards",
      "Community reviews expose poor urban planning practices",
      "Trust scores incentivize developers to build sustainable communities",
      "Buyer protection reduces risks in urban real estate investments",
    ],
  },
  {
    number: 13,
    title: "Climate Action",
    color: "hsl(145, 60%, 40%)",
    icon: Leaf,
    description: "Our platform introduces Environmental Friendliness as a trust category, encouraging developers to adopt green building practices and energy-efficient designs.",
    alignments: [
      "Environmental Friendliness rating category for all developers",
      "Green Building certification badges for verified eco-friendly projects",
      "Sustainability scoring integrated into trust assessments",
      "Community discussions highlight climate-conscious developments",
    ],
  },
  {
    number: 17,
    title: "Partnerships for the Goals",
    color: "hsl(210, 70%, 50%)",
    icon: Handshake,
    description: "R8ESTATE creates a global knowledge exchange by benchmarking Egyptian real estate transparency against international review platforms and best practices.",
    alignments: [
      "Global Standards compliance badge for internationally benchmarked developers",
      "Cross-border knowledge sharing on real estate transparency",
      "Partnership-ready impact metrics for UNDP, UN-Habitat, and ESG investors",
      "Open platform data contributing to Egypt's SDG progress reporting",
    ],
  },
];

const platformMetrics = [
  { label: "Verified Reviews", value: "2,400+", icon: ShieldCheck },
  { label: "Developers Rated", value: "180+", icon: Building2 },
  { label: "Buyers Protected", value: "39K+", icon: Users },
  { label: "Trust Reports Generated", value: "1,200+", icon: BarChart3 },
  { label: "Market Transparency Score", value: "72%", icon: TrendingUp },
  { label: "Community Members", value: "8,500+", icon: Globe },
];

const sdgBadges = [
  { name: "🌿 Green Building", description: "LEED or equivalent certified projects", color: "hsl(145, 60%, 40%)" },
  { name: "🏘️ Community Impact", description: "Developers with high community ratings", color: "hsl(35, 85%, 55%)" },
  { name: "🌍 Global Standards", description: "Meets international transparency benchmarks", color: "hsl(210, 70%, 50%)" },
];

const ImpactPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        userMode="buyers"
        onSwitchToBusinessView={() => {}}
        onSwitchToBuyerView={() => {}}
        togglePulse={false}
        onSignOut={() => {}}
        getDashboardRoute={() => "/buyer"}
      />

      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-primary/5 to-transparent pt-8 pb-12 px-4">
        <div className="max-w-[1100px] mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-bold tracking-wider">
            UN SUSTAINABLE DEVELOPMENT GOALS
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
            Our Impact on Sustainable Development
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            R8ESTATE is committed to advancing UN SDGs 11, 13, and 17 by bringing transparency, 
            sustainability awareness, and global best practices to Egypt's real estate market.
          </p>
        </div>
      </section>

      {/* Platform Metrics */}
      <section className="w-full px-4 -mt-4">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {platformMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-border/60 bg-card">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-lg font-extrabold text-foreground">{metric.value}</span>
                  <span className="text-[10px] font-medium text-muted-foreground text-center">{metric.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SDG Goal Cards */}
      <section className="w-full px-4 py-12">
        <div className="max-w-[1100px] mx-auto space-y-8">
          {sdgGoals.map((goal) => {
            const Icon = goal.icon;
            return (
              <div key={goal.number} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                <div className="flex items-center gap-3 p-5 border-b border-border/40" style={{ borderLeftWidth: 4, borderLeftColor: goal.color }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${goal.color}20` }}>
                    <Icon className="w-6 h-6" style={{ color: goal.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: goal.color }}>
                        SDG {goal.number}
                      </span>
                      <h2 className="text-base md:text-lg font-bold text-foreground">{goal.title}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">How R8ESTATE Contributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {goal.alignments.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: goal.color }} />
                        <span className="text-xs text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SDG Badges System */}
      <section className="w-full px-4 pb-12">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-2 text-center">SDG Alignment Badges</h2>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-xl mx-auto">
            Developers and businesses can earn verified SDG badges that appear on their profiles, 
            demonstrating commitment to sustainable practices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sdgBadges.map((badge) => (
              <div key={badge.name} className="flex flex-col items-center gap-2 p-6 rounded-xl border border-border/60 bg-card text-center">
                <span className="text-3xl">{badge.name.split(" ")[0]}</span>
                <span className="text-sm font-bold text-foreground">{badge.name.slice(badge.name.indexOf(" ") + 1)}</span>
                <span className="text-xs text-muted-foreground">{badge.description}</span>
                <div className="w-8 h-1 rounded-full mt-1" style={{ backgroundColor: badge.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Categories Enhancement */}
      <section className="w-full px-4 pb-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-[hsl(145,60%,40%)]/5 to-transparent p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">New Trust Categories</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We've expanded our rating system to include sustainability-focused categories that reviewers 
              can score developers on:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Environmental Friendliness", desc: "Energy efficiency, green spaces, LEED certifications, waste management", emoji: "🌿" },
                { name: "Community Impact", desc: "Social infrastructure, community facilities, neighborhood quality", emoji: "🏘️" },
                { name: "Sustainability Practices", desc: "Long-term maintenance plans, sustainable materials, carbon footprint", emoji: "♻️" },
              ].map((cat) => (
                <div key={cat.name} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/40">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <span className="text-sm font-bold text-foreground block">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="w-full px-4 pb-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-6 md:p-8 text-center">
            <Globe className="w-10 h-10 text-primary mx-auto mb-3" />
            <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">Partner With Us</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-4">
              Are you a development organization, ESG fund, or government agency interested in advancing 
              real estate transparency in Egypt? We'd love to collaborate.
            </p>
            <Button onClick={() => navigate("/contact")} className="gap-2">
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ImpactPage;
