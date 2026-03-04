import { useState, useRef, useCallback, useEffect } from "react";
import { Search, Sparkles, Star, StarHalf, Trophy, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoIcon from "@/assets/logo-icon.png";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(203 81% 12%), hsl(203 81% 18%), hsl(203 60% 22%))" }}>
      {/* Background effects */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(45 96% 54%) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-5" style={{ background: "radial-gradient(circle, hsl(350 85% 52%) 0%, transparent 70%)" }} />

      <div className="container mx-auto px-4 py-20 md:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side */}
          <div className="space-y-6 md:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-white/80 tracking-wide uppercase">
                Egypt's #1 Real Estate Trust Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
              <span className="text-white">Real Reviews.</span>
              <br />
              <span className="text-white">Real </span>
              <em className="not-italic text-accent">Decisions</em>
              <span className="text-white">.</span>
              <br />
              <span className="text-white">Zero </span>
              <span className="relative text-white">
                Risk
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-brand-red rounded-full" />
              </span>
              <span className="text-white">.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base md:text-lg text-white/55 leading-relaxed max-w-xl">
              Before you invest in any off-plan property, read verified reviews from real buyers, brokers, and legal experts. R8ESTATE is your protection against empty promises.
            </p>

            {/* Search bar */}
            <div className="flex items-center bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-xl p-1.5 max-w-xl">
              <div className="flex items-center flex-1 px-3 gap-2">
                <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search developer, project, or area…"
                  className="flex-1 bg-transparent text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none py-2.5"
                />
              </div>
              <button className="px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-semibold text-sm whitespace-nowrap hover:brightness-110 transition-all">
                Search →
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 md:gap-10 pt-2">
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">
                  12<span className="text-accent">K+</span>
                </div>
                <div className="text-[11px] md:text-xs text-white/40 font-medium uppercase tracking-wider mt-0.5">Verified Reviews</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">
                  340<span className="text-accent">+</span>
                </div>
                <div className="text-[11px] md:text-xs text-white/40 font-medium uppercase tracking-wider mt-0.5">Developers Rated</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-white">
                  98<span className="text-accent">%</span>
                </div>
                <div className="text-[11px] md:text-xs text-white/40 font-medium uppercase tracking-wider mt-0.5">Trust Score</div>
              </div>
            </div>
          </div>

          {/* Right side - Floating cards */}
          <div className="hidden lg:block relative h-[480px]">
            {/* Main review card */}
            <div className="absolute left-0 top-8 w-[320px] bg-white/[0.06] backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-2xl">
              <div className="font-bold text-white text-base">SODIC East — New Cairo</div>
              <div className="text-xs text-white/40 mt-1">Reviewed by 248 verified buyers</div>
              <div className="flex items-center gap-0.5 mt-3">
                {[...Array(4)].map((_, i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}
                <StarHalf className="w-4 h-4 fill-accent text-accent" />
              </div>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-3xl font-extrabold text-white">4.5</span>
                <span className="text-xs text-white/40 mb-1">/ 5.0 overall</span>
              </div>
              <p className="text-sm text-white/50 mt-3 italic leading-relaxed">
                "Delivery was 3 months ahead of schedule. Build quality exceeded the brochure. The sales team was transparent throughout."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">AH</div>
                <div>
                  <div className="text-sm font-semibold text-white">Ahmed Hassan</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-trust-excellent/20 text-trust-excellent font-medium">✓ Verified Buyer</span>
                </div>
              </div>
            </div>

            {/* Trust score card */}
            <div className="absolute right-0 top-0 w-[140px] bg-accent rounded-2xl p-5 text-center shadow-2xl">
              <Trophy className="w-6 h-6 mx-auto text-accent-foreground/70 mb-1" />
              <div className="text-4xl font-extrabold text-accent-foreground">9.2</div>
              <div className="text-[10px] font-bold text-accent-foreground/70 uppercase tracking-widest mt-1">Trust Score</div>
            </div>

            {/* Metrics card */}
            <div className="absolute right-0 bottom-8 w-[220px] bg-white/[0.06] backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-2xl">
              <div className="text-sm font-bold text-white mb-3">Developer Metrics</div>
              {[
                { label: "Delivery On Time", value: 92 },
                { label: "Build Quality", value: 88 },
                { label: "After-Sales", value: 79 },
              ].map((m) => (
                <div key={m.label} className="mb-2.5 last:mb-0">
                  <div className="flex justify-between text-[11px] text-white/50 mb-1">
                    <span>{m.label}</span>
                    <span className="text-white/70 font-medium">{m.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${m.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
