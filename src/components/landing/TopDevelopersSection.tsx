import { Star, StarHalf, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const devs = [
  {
    initials: "SO", name: "SODIC", areas: "New Cairo · Sheikh Zayed · North Coast",
    score: 4.7, reviews: "1,240", onTime: "94%", quality: "4.8", handover: "4.6", projects: 28, stars: 4.5,
  },
  {
    initials: "EM", name: "Emaar Misr", areas: "Madinaty · Cairo Gate · Uptown Cairo",
    score: 4.5, reviews: "2,870", onTime: "89%", quality: "4.7", handover: "4.3", projects: 41, stars: 4.5,
  },
  {
    initials: "TC", name: "Tatweer Misr", areas: "Fouka Bay · IL Monte Galala · Bloomfields",
    score: 4.3, reviews: "680", onTime: "85%", quality: "4.5", handover: "4.1", projects: 12, stars: 4,
  },
];

const StarRow = ({ count }: { count: number }) => {
  const full = Math.floor(count);
  const half = count % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(full)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />)}
      {half && <StarHalf className="w-3.5 h-3.5 fill-accent text-accent" />}
      {[...Array(5 - full - (half ? 1 : 0))].map((_, i) => <Star key={`e${i}`} className="w-3.5 h-3.5 text-border" />)}
    </div>
  );
};

export const TopDevelopersSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Top Rated</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mt-2 leading-tight">
              Most Trusted Developers<br className="hidden sm:block" /> in Egypt
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              Rankings based on verified buyer reviews, delivery records, and legal compliance scores.
            </p>
          </div>
          <button onClick={() => navigate("/directory")} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
            All Developers →
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-8">
          {devs.map((dev) => (
            <div key={dev.name} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
              {/* Header */}
              <div className="relative p-5 pb-4" style={{ background: "linear-gradient(135deg, hsl(203 81% 15%), hsl(203 81% 21%))" }}>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold bg-trust-excellent/20 text-trust-excellent rounded-full px-2.5 py-1">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-white mb-3">
                  {dev.initials}
                </div>
                <div className="text-lg font-bold text-white">{dev.name}</div>
                <div className="text-xs text-white/40 mt-1">{dev.areas}</div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-extrabold text-foreground">{dev.score}</span>
                  <div>
                    <div className="text-xs text-muted-foreground">From {dev.reviews} reviews</div>
                    <StarRow count={dev.stars} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "On Time", val: dev.onTime },
                    { label: "Quality", val: dev.quality },
                    { label: "Handover", val: dev.handover },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm font-bold text-foreground">{m.val}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-accent group-hover:underline">Write a Review →</span>
                <span className="text-[11px] text-muted-foreground">{dev.projects} active projects</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
