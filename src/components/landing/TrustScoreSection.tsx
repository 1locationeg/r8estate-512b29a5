import { Shield, Search, BarChart3, Scale } from "lucide-react";

const breakdowns = [
  { label: "Delivery on Time", value: 94, score: "9.4" },
  { label: "Build Quality", value: 88, score: "8.8" },
  { label: "Contract Clarity", value: 91, score: "9.1" },
  { label: "Sales Honesty", value: 85, score: "8.5" },
  { label: "After-Sales Support", value: 79, score: "7.9" },
  { label: "Price Alignment", value: 93, score: "9.3" },
];

const features = [
  { icon: <Shield className="w-5 h-5" />, color: "bg-primary/10 text-primary", title: "Unbiased by Design", desc: "No developer can pay to improve their score. The R8 score is calculated purely from verified user data." },
  { icon: <Search className="w-5 h-5" />, color: "bg-brand-red/10 text-brand-red", title: "Multi-Role Verification", desc: "Scores are weighted by reviewer role. A lawyer's assessment carries more weight than a social media comment." },
  { icon: <BarChart3 className="w-5 h-5" />, color: "bg-accent/10 text-accent", title: "Real-Time Updates", desc: "Every new verified review updates the score immediately. You always see the current reputation." },
  { icon: <Scale className="w-5 h-5" />, color: "bg-primary/10 text-primary", title: "Developer Right to Reply", desc: "Developers can respond publicly. Transparency works both ways — responses are shown alongside reviews." },
];

export const TrustScoreSection = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">The R8 Score</span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mt-2">What Is the R8 Trust Score?</h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
          A composite score built from 6 verified dimensions — not just star ratings.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left - Visual */}
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="65" fill="none" stroke="hsl(203 81% 21% / 0.1)" strokeWidth="10" />
                <circle cx="80" cy="80" r="65" fill="none" stroke="url(#trustGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${0.92 * 2 * Math.PI * 65} ${2 * Math.PI * 65}`} />
                <defs>
                  <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(350 85% 52%)" />
                    <stop offset="100%" stopColor="hsl(45 96% 54%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-foreground">9.2</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">R8 Score</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-semibold mt-2">SODIC — New Cairo</span>
          </div>

          {/* Breakdowns */}
          <div className="flex-1 space-y-3 w-full">
            {breakdowns.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{b.label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${b.value}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground w-8 text-right">{b.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Features */}
        <div className="space-y-5">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center flex-shrink-0`}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
