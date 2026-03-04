import { Star, StarHalf, CheckCircle } from "lucide-react";

const reviews = [
  {
    initials: "AH", name: "Ahmed Hassan", role: "✓ Verified Buyer", date: "2 days ago",
    stars: 5, tag: "Excellent", tagColor: "bg-trust-excellent/15 text-trust-excellent",
    title: "Delivered 3 months early — genuinely impressive",
    text: "Signed the contract in 2021, received keys in early 2024. Build quality matched exactly what was shown in the showroom. Would confidently recommend SODIC to anyone considering off-plan.",
    project: "SODIC East, New Cairo", verified: "✓ Purchase verified",
    avatarBg: "bg-primary",
  },
  {
    initials: "SR", name: "Sara Rashed", role: "⚖️ Licensed Lawyer", date: "5 days ago",
    stars: 4, tag: "Great", tagColor: "bg-primary/15 text-primary",
    title: "Contract terms are clear — but watch clause 14",
    text: "Reviewed 6 contracts from this developer in 2024. Generally well-structured with clear delivery guarantees. Clause 14 around force majeure has been updated — get the latest version.",
    project: "Emaar Misr — General", verified: "✓ License verified",
    avatarBg: "bg-brand-red",
  },
  {
    initials: "MK", name: "Mohamed Karim", role: "🏢 Certified Broker", date: "1 week ago",
    stars: 3.5, tag: "Average", tagColor: "bg-accent/15 text-accent-foreground",
    title: "Good project, but after-sales needs improvement",
    text: "I've sold 12 units in this compound. The product is solid and clients love the location. However, post-handover maintenance response time is consistently over 3 weeks.",
    project: "Tatweer Misr — Bloomfields", verified: "✓ Sales record verified",
    avatarBg: "bg-accent",
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

export const RecentReviewsSection = () => (
  <section className="py-16 md:py-24 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Latest Activity</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mt-2">Recent Verified Reviews</h2>
        </div>
        <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">All Reviews →</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {reviews.map((r) => (
          <div key={r.name} className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${r.avatarBg} flex items-center justify-center text-xs font-bold text-white`}>{r.initials}</div>
                <div>
                  <div className="text-sm font-bold text-foreground">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{r.role}</div>
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">{r.date}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <StarRow count={r.stars} />
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.tagColor}`}>{r.tag}</span>
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">{r.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{r.text}</p>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-[11px] text-primary font-medium">{r.project}</span>
              <span className="text-[10px] text-trust-excellent font-medium">{r.verified}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
