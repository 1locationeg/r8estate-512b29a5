const steps = [
  { num: 1, title: "Submit Your Review", desc: "Buyers, brokers, or legal experts submit a detailed review of their experience with a developer or project." },
  { num: 2, title: "Identity Verification", desc: "We verify the reviewer's role — buyer contract, broker license, or legal credential — before the review goes live." },
  { num: 3, title: "AI Moderation", desc: "Our AI scans for fake reviews, coordinated attacks, and paid testimonials. Only authentic experiences pass." },
  { num: 4, title: "Trust Score Updated", desc: "The developer's R8 Trust Score updates in real time, giving buyers the most accurate picture possible." },
];

export const HowItWorksSection = () => (
  <section className="py-16 md:py-24" style={{ background: "linear-gradient(135deg, hsl(203 81% 12%), hsl(203 81% 18%))" }}>
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">How R8ESTATE Works</span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-2 leading-tight">
          From Review to<br />Confident Decision
        </h2>
        <p className="text-sm text-white/40 mt-3 max-w-lg mx-auto">
          Every review on R8ESTATE goes through a 4-step verification process before it's published.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div key={s.num} className="relative bg-white/[0.04] border border-white/8 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
            <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-extrabold mb-4">
              {s.num}
            </div>
            <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
