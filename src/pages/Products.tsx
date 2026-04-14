import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Map, Gauge, Radio, Brain, ShieldCheck, SearchCheck, Award, MapPin, Megaphone, KeyRound } from "lucide-react";

const PRODUCTS = [
  {
    name: "R8 MAP",
    tagline: "Live Trust Intelligence Layer",
    description: "A live Google Maps overlay showing trust scores, delivery status, and buyer sentiment heatmaps across every off-plan project in Egypt.",
    features: [
      "Color-coded risk zones across every development",
      "Real-time delivery status overlaid on project locations",
      "Buyer sentiment heatmaps per neighborhood & developer",
      "Filter by developer, price range, delivery year, trust score",
    ],
    stage: "Before You Buy",
    stageNum: "01",
    type: "DISCOVERY TOOL",
    icon: Map,
  },
  {
    name: "R8 METER",
    tagline: "Instant Trust Gauge",
    description: "Type any developer, broker, project, or lawyer — get an instant visual trust score. Embeddable widget for portals, listings, and partner sites.",
    features: [
      "Real-time scoring across developers & brokers",
      "Embeddable widget for 3rd party sites",
      "Aggregates reviews, delivery data, legal history",
    ],
    stage: "Before You Buy",
    stageNum: "01",
    type: "DISCOVERY TOOL",
    icon: Gauge,
  },
  {
    name: "R8 PULSE",
    tagline: "Market Sentiment Dashboard",
    description: "Real-time trust sentiment dashboard. Bloomberg Terminal — but for Egyptian real estate trust.",
    features: [
      "Weekly sentiment trending by developer & area",
      "Complaint category analysis in real time",
      "Market risk alerts and opportunity signals",
    ],
    stage: "Before You Buy",
    stageNum: "01",
    type: "MARKET INTELLIGENCE",
    icon: Radio,
  },
  {
    name: "R8 INTEL",
    tagline: "Deep Developer Intelligence",
    description: "Comprehensive intelligence reports on any developer — financial health, delivery track record, legal disputes, and buyer satisfaction trends.",
    features: [
      "Financial health indicators",
      "Delivery track record analysis",
      "Legal dispute history",
    ],
    stage: "Before You Buy",
    stageNum: "01",
    type: "INTELLIGENCE",
    icon: Brain,
  },
  {
    name: "R8 SHIELD",
    tagline: "Contract Risk Protection",
    description: "Upload your off-plan contract and get an AI + lawyer-verified risk report highlighting dangerous clauses, missing guarantees, and red flags.",
    features: [
      "AI clause extraction & risk flagging",
      "Lawyer-verified reports on critical terms",
      "Missing guarantee detection",
      "Side-by-side comparison with market standards",
    ],
    stage: "At Signing",
    stageNum: "02",
    type: "PROTECTION PRODUCT",
    icon: ShieldCheck,
  },
  {
    name: "R8 CHECK",
    tagline: "Broker Background Verification",
    description: "One-click background check on any broker, agent, or sales rep. Verifies license status, past complaints, units sold, and client satisfaction score.",
    features: [
      "License verification & regulatory status",
      "Complaint history and resolution rate",
      "Verified transaction history & client scores",
    ],
    stage: "At Signing",
    stageNum: "02",
    type: "VERIFICATION TOOL",
    icon: SearchCheck,
  },
  {
    name: "R8 CERTIFIED",
    tagline: "The Michelin Star of Real Estate",
    description: "A certification badge developers earn by meeting R8's verified standards — on-time delivery, contract clarity, after-sales satisfaction.",
    features: [
      "Verified delivery performance scoring",
      "Contract transparency assessment",
      "Annual re-certification to maintain status",
      "Embeddable badge for developer marketing",
    ],
    stage: "At Signing",
    stageNum: "02",
    type: "DEVELOPER INCENTIVE",
    icon: Award,
  },
  {
    name: "R8 TRACK",
    tagline: "Delivery Progress Monitor",
    description: "Post-purchase delivery tracker. Register your unit and get real-time construction progress updates and instant alerts when delays are logged.",
    features: [
      "Construction milestone tracking per project",
      "Delay alerts triggered by owner community",
      "Photo & progress evidence log over time",
    ],
    stage: "After You Buy",
    stageNum: "03",
    type: "POST-PURCHASE",
    icon: MapPin,
  },
  {
    name: "R8 VOICE",
    tagline: "Verified Buyer Reviews",
    description: "The core review engine. Only verified buyers can leave reviews — receipt-verified, contract-verified, or community-verified. The trust foundation everything else is built on.",
    features: [
      "Multi-tier verification for every review",
      "Category-specific rating dimensions",
      "Developer response & resolution tracking",
    ],
    stage: "After You Buy",
    stageNum: "03",
    type: "CORE ENGINE",
    icon: Megaphone,
  },
  {
    name: "R8 KEYS",
    tagline: "Trusted Resale & Handover",
    description: "A verified resale and handover platform for post-delivery units. Buyers sell with R8-verified pricing, condition reports, and ownership history.",
    features: [
      "R8-verified unit condition & pricing reports",
      "Ownership chain verification",
      "Trusted secondary market listings",
    ],
    stage: "After You Buy",
    stageNum: "03",
    type: "RESALE PLATFORM",
    icon: KeyRound,
  },
];

const STAGES = [
  { num: "01", label: "Before You Buy", products: ["R8 MAP", "R8 METER", "R8 PULSE", "R8 INTEL"] },
  { num: "02", label: "At Signing", products: ["R8 SHIELD", "R8 CHECK", "R8 CERTIFIED"] },
  { num: "03", label: "After You Buy", products: ["R8 TRACK", "R8 VOICE", "R8 KEYS"] },
];

const FLYWHEEL = [
  { label: "BUYERS", sub: "Use products", icon: "👥" },
  { label: "DATA", sub: "Flows in", icon: "📊" },
  { label: "SCORES", sub: "Get sharper", icon: "📈" },
  { label: "TRUST", sub: "Compounds", icon: "🛡️" },
  { label: "MOAT", sub: "Widens", icon: "🏰" },
];

const stageColor = (num: string) => {
  if (num === "01") return "border-emerald-500/30 bg-emerald-500/5";
  if (num === "02") return "border-amber-500/30 bg-amber-500/5";
  return "border-sky-500/30 bg-sky-500/5";
};

const stageBadgeColor = (num: string) => {
  if (num === "01") return "bg-emerald-500/15 text-emerald-400";
  if (num === "02") return "bg-amber-500/15 text-amber-400";
  return "bg-sky-500/15 text-sky-400";
};

const Products = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-amber-500/30">
      {/* Grain texture */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Back link */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to R8ESTATE
        </Link>
      </div>

      {/* Hero */}
      <header className="relative z-10 max-w-4xl mx-auto px-4 pt-12 pb-16 text-center">
        <p className="text-[11px] tracking-[0.3em] text-amber-400/70 uppercase mb-4">
          R8ESTATE Product Suite · Trust Infrastructure · Egypt
        </p>
        <p className="text-xs tracking-[0.2em] text-white/30 uppercase mb-6">The Complete Ecosystem</p>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] mb-6">
          BUILT ON <span className="text-amber-400">TRUST</span>
          <br />
          POWERED BY DATA
        </h1>
        <p className="text-sm sm:text-base text-white/50 max-w-2xl mx-auto leading-relaxed">
          10 interconnected products covering every stage of the real estate journey — before you buy, at signing, and after delivery. Every data point feeds every product.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-10">
          {[
            { val: "10", label: "PRODUCTS" },
            { val: "3", label: "JOURNEY STAGES" },
            { val: "∞", label: "DATA FLYWHEEL" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{s.val}</div>
              <div className="text-[10px] tracking-[0.15em] text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Stage overview */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STAGES.map((stage) => (
            <div
              key={stage.num}
              className={`rounded-xl border p-5 ${stageColor(stage.num)}`}
            >
              <div className="text-[10px] tracking-[0.2em] text-white/30 mb-1">STAGE {stage.num}</div>
              <div className="text-sm font-bold text-white/90 mb-3">{stage.label}</div>
              <ul className="space-y-1">
                {stage.products.map((p) => (
                  <li key={p} className="text-xs text-white/50">• {p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Products grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-center text-lg sm:text-2xl font-black tracking-wide mb-2">THE PRODUCTS</h2>
        <p className="text-center text-[11px] tracking-[0.2em] text-white/30 uppercase mb-10">
          10 Products · Full Ecosystem
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PRODUCTS.map((product) => {
            const Icon = product.icon;
            return (
              <div
                key={product.name}
                className={`rounded-xl border p-6 transition-colors hover:border-amber-500/30 ${stageColor(product.stageNum)}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-black tracking-wide">{product.name}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold tracking-wider ${stageBadgeColor(product.stageNum)}`}>
                        {product.stage.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-amber-400/80 font-medium">{product.tagline}</p>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed mb-4">{product.description}</p>
                <ul className="space-y-1.5">
                  {product.features.map((f, i) => (
                    <li key={i} className="text-[11px] text-white/40 flex items-start gap-2">
                      <span className="text-amber-500/60 mt-0.5">→</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-white/5">
                  <span className="text-[9px] tracking-[0.2em] text-white/20 uppercase">{product.type}</span>
                  <span className="ml-2 text-[9px] text-amber-500/40">COMING SOON</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flywheel */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16 text-center">
        <h2 className="text-lg sm:text-2xl font-black tracking-wide mb-2">THE DATA FLYWHEEL</h2>
        <p className="text-xs text-white/40 max-w-lg mx-auto mb-10">
          Every product generates data that feeds every other product — making R8 more accurate over time and structurally impossible to replicate quickly.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {FLYWHEEL.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1 w-20">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-[10px] font-bold tracking-wider">{step.label}</span>
                <span className="text-[9px] text-white/40">{step.sub}</span>
              </div>
              {i < FLYWHEEL.length - 1 && (
                <span className="text-amber-500/40 text-lg font-light">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-xs font-bold tracking-[0.2em] text-white/30">R8ESTATE</p>
        <p className="text-[10px] text-white/15 mt-1">Trust Infrastructure for Egyptian Real Estate · 2025</p>
      </footer>
    </div>
  );
};

export default Products;
