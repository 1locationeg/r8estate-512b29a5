const testimonials = [
  {
    initials: "NM", name: "Nour Mohamed", role: "First-time buyer, Cairo",
    text: "I was about to pay a 10% deposit on a project that had 3-star reviews on R8ESTATE. I held back, did more research, and avoided what turned out to be a delayed delivery. This platform saved me real money.",
    bg: "bg-primary",
  },
  {
    initials: "KA", name: "Khaled Atef", role: "Senior Broker, New Cairo",
    text: "As a broker, my clients now ask me to show them R8ESTATE scores before they even visit a showroom. It's become part of the buying process. Developers with high scores are genuinely easier to sell.",
    bg: "bg-brand-red",
  },
  {
    initials: "RA", name: "Rami Aly", role: "Sales Director, Leading Developer",
    text: "We were skeptical at first about a review platform. But R8ESTATE's verification process meant only real buyers could review us — and our score of 9.1 became our best sales tool at exhibitions.",
    bg: "bg-accent",
  },
];

export const TestimonialsSection = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">Trusted By</span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mt-2">What Our Community Says</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow relative">
            <span className="text-5xl font-serif text-accent/20 absolute top-4 right-6 leading-none">"</span>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 relative">{t.text}</p>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center text-xs font-bold text-white`}>
                {t.initials}
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
