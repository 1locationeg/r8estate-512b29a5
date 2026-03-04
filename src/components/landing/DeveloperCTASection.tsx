import { CheckCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const benefits = [
  "Respond to reviews publicly with your official statement",
  "Display your R8 Trust Score as a sales tool",
  "Embed your verified rating widget on your website",
  "Get lead referrals from buyers actively searching",
  "Founding Developer badge — first 10 slots only",
];

const planFeatures = [
  "Verified Developer Profile",
  "Unlimited Review Responses",
  "R8 Trust Score Dashboard",
  "Review Widget for Your Website",
  "Featured Placement on Homepage",
  '"Founding Developer" Badge',
];

export const DeveloperCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24" style={{ background: "linear-gradient(135deg, hsl(203 81% 10%), hsl(203 81% 16%))" }}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">For Developers</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-3 leading-tight">
              Your Reputation Is Already Being Built — Own It.
            </h2>
            <p className="text-sm text-white/40 mt-4 leading-relaxed max-w-lg">
              Buyers are already talking about your projects in WhatsApp groups and Facebook pages. R8ESTATE gives you a verified, public platform to manage and respond to your reputation.
            </p>
            <div className="mt-6 space-y-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-trust-excellent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/60">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Plan card */}
          <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm font-bold text-accent uppercase tracking-wide">Founding Developer Plan</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-extrabold text-white">Free</span>
              <span className="text-sm text-white/40 mb-1">/ 6 months</span>
            </div>
            <p className="text-xs text-white/30 mb-6">Limited to first 10 developers. No credit card required.</p>

            <div className="space-y-3 mb-6">
              {planFeatures.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-accent" />
                  <span className="text-sm text-white/60">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/auth")}
              className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-bold text-sm hover:brightness-110 transition-all"
            >
              Claim Your Profile Now →
            </button>
            <p className="text-center text-[11px] text-white/25 mt-3">7 of 10 founding slots remaining</p>
          </div>
        </div>
      </div>
    </section>
  );
};
