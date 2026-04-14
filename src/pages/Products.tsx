import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, FileSignature, ShieldCheck, Map, Gauge, Radio, Brain, Shield, SearchCheck, Award, MapPin, Megaphone, KeyRound, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  {
    name: "Before You Buy",
    icon: Search,
    color: "text-primary",
    bgLight: "bg-primary/10",
    borderAccent: "hover:border-primary/30",
    products: [
      { name: "R8 MAP", benefit: "See trust scores on a live map", icon: Map },
      { name: "R8 METER", benefit: "Instant trust score for any entity", icon: Gauge },
      { name: "R8 PULSE", benefit: "Real-time market sentiment signals", icon: Radio },
      { name: "R8 INTEL", benefit: "Deep developer intelligence reports", icon: Brain },
    ],
  },
  {
    name: "At Signing",
    icon: FileSignature,
    color: "text-accent",
    bgLight: "bg-accent/10",
    borderAccent: "hover:border-accent/30",
    products: [
      { name: "R8 SHIELD", benefit: "AI-powered contract risk detection", icon: Shield },
      { name: "R8 CHECK", benefit: "One-click broker background check", icon: SearchCheck },
      { name: "R8 CERTIFIED", benefit: "Developer trust certification badge", icon: Award },
    ],
  },
  {
    name: "After You Buy",
    icon: ShieldCheck,
    color: "text-journey-protect",
    bgLight: "bg-journey-protect/10",
    borderAccent: "hover:border-journey-protect/30",
    products: [
      { name: "R8 TRACK", benefit: "Track your unit's delivery progress", icon: MapPin },
      { name: "R8 VOICE", benefit: "Verified buyer review engine", icon: Megaphone },
      { name: "R8 KEYS", benefit: "Trusted resale & handover platform", icon: KeyRound },
    ],
  },
];

const Products = () => {
  const navigate = useNavigate();
  const interactiveProducts: Record<string, string> = { "R8 MAP": "/products/r8-map", "R8 METER": "https://meter.r8estate.com" };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to R8ESTATE
        </Link>
      </div>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-4 pt-10 pb-8 text-center">
        <p className="text-[10px] tracking-[0.3em] text-accent uppercase mb-4 font-semibold">
          R8ESTATE Product Suite
        </p>
        <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-4">
          <span className="text-primary">BUILT ON </span>
          <span className="text-accent">TRUST</span>
          <br />
          <span className="text-primary">POWERED BY DATA</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Know before you buy. Verify before you sign. Track after you pay.
        </p>
      </header>

      {/* Products by stage */}
      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-8">
        {STAGES.map((stage) => {
          const StageIcon = stage.icon;
          return (
            <div key={stage.name}>
              {/* Stage header */}
              <div className={`flex items-center gap-2.5 mb-4 pb-2 border-b border-border/60`}>
                <div className={`w-8 h-8 rounded-lg ${stage.bgLight} flex items-center justify-center`}>
                  <StageIcon className={`w-4 h-4 ${stage.color}`} />
                </div>
                <h2 className={`text-sm font-bold ${stage.color} uppercase tracking-wider`}>
                  {stage.name}
                </h2>
              </div>

              {/* Product rows */}
              <div className="space-y-2">
                {stage.products.map((product) => {
                  const ProductIcon = product.icon;
                  const link = interactiveProducts[product.name];
                  const isExternal = link?.startsWith("http");
                  const isFeatured = product.name === "R8 METER";
                  return (
                    <div
                      key={product.name}
                      onClick={() => {
                        if (isExternal) window.open(link, "_blank", "noopener");
                        else if (link) navigate(link);
                      }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg border bg-card/80 backdrop-blur-sm ${stage.borderAccent} transition-colors ${link ? "cursor-pointer" : ""} ${isFeatured ? "border-primary/40 ring-1 ring-primary/20 bg-primary/5" : "border-border/60"}`}
                    >
                      <div className={`w-9 h-9 rounded-lg ${isFeatured ? "bg-primary/20" : stage.bgLight} flex items-center justify-center shrink-0 ${isFeatured ? "ring-1 ring-primary/30 shadow-[0_0_8px_hsl(var(--primary)/0.3)]" : ""}`}>
                        <ProductIcon className={`w-4.5 h-4.5 ${isFeatured ? "text-primary" : stage.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tracking-wide text-foreground">
                            {product.name}
                          </span>
                          {isFeatured ? (
                            <Badge className="text-[9px] px-1.5 py-0.5 bg-green-500/20 text-green-400 border-green-500/40 font-bold flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                              LIVE
                            </Badge>
                          ) : link ? (
                            <Badge className="text-[9px] px-1.5 py-0 bg-accent/20 text-accent border-accent/30 font-medium flex items-center gap-0.5">
                              PREVIEW <ArrowRight className="w-2.5 h-2.5" />
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground border-border/50 font-medium">
                              COMING SOON
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {product.benefit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Flywheel line */}
      <div className="max-w-3xl mx-auto px-4 pb-4 text-center">
        <p className="text-[11px] text-muted-foreground/70 italic">
          Every product feeds every other — trust compounds over time.
        </p>
      </div>

      {/* Data Flywheel */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 sm:p-8">
          <h2 className="text-center text-lg sm:text-xl font-black tracking-tight mb-1">
            <span className="text-foreground">THE DATA </span>
            <span className="text-accent">FLYWHEEL</span>
          </h2>
          <p className="text-center text-[11px] text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
            Every product generates data that feeds every other — making R8 more accurate over time and structurally impossible to replicate.
          </p>

          {/* Flywheel nodes */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {[
              { label: "BUYERS", sub: "Use products", icon: Users },
              { label: "DATA", sub: "Flows in", icon: BarChart3 },
              { label: "SCORES", sub: "Get sharper", icon: Brain, featured: true },
              { label: "TRUST", sub: "Compounds", icon: Award },
              { label: "MOAT", sub: "Deepens", icon: Shield },
            ].map((node, i) => (
              <div key={node.label} className="flex items-center gap-3 sm:gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${
                      node.featured
                        ? "bg-accent/15 border-2 border-accent/50 shadow-[0_0_16px_hsl(var(--accent)/0.25)]"
                        : "bg-muted/30 border border-border/50"
                    }`}
                  >
                    <node.icon className={`w-5 h-5 ${node.featured ? "text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`text-[9px] font-black tracking-wider ${node.featured ? "text-accent" : "text-foreground/80"}`}>
                    {node.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground -mt-1">{node.sub}</span>
                </div>
                {i < 4 && (
                  <ArrowRight className="w-3 h-3 text-border/60 shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-primary/60">R8ESTATE</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Trust Infrastructure for Egyptian Real Estate · 2025
        </p>
      </footer>
    </div>
  );
};

export default Products;
