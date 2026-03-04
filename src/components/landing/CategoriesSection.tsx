import { useNavigate } from "react-router-dom";

const categories = [
  { icon: "🏗️", name: "Developers", count: "340 listed", active: true },
  { icon: "🏢", name: "Projects", count: "1,240 projects" },
  { icon: "🤝", name: "Brokers", count: "892 agents" },
  { icon: "⚖️", name: "Legal Experts", count: "156 lawyers" },
  { icon: "🔧", name: "Service Companies", count: "420 companies" },
];

export const CategoriesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Browse by Type</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-foreground mt-2 leading-tight">
              Explore Every Corner<br className="hidden sm:block" /> of the Market
            </h2>
          </div>
          <button onClick={() => navigate("/directory")} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
            View All Categories →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-200 ${
                cat.active
                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                  : "bg-card text-foreground border-border hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <span className="text-3xl md:text-4xl">{cat.icon}</span>
              <span className="font-bold text-sm md:text-base">{cat.name}</span>
              <span className={`text-[11px] md:text-xs ${cat.active ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
