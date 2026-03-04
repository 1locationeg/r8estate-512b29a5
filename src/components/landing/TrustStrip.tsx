import { Shield, CheckCircle, Scale, Home, Lock } from "lucide-react";

const items = [
  { icon: <Shield className="w-4 h-4" />, text: "All reviews AI-verified & moderated" },
  { icon: <CheckCircle className="w-4 h-4" />, text: "Buyer identity confirmed" },
  { icon: <Scale className="w-4 h-4" />, text: "Legal expert reviews included" },
  { icon: <Home className="w-4 h-4" />, text: "Off-plan specialist platform" },
  { icon: <Lock className="w-4 h-4" />, text: "No paid rankings. Ever." },
];

export const TrustStrip = () => (
  <div className="bg-primary py-3 md:py-4 overflow-x-auto scrollbar-hide">
    <div className="flex items-center justify-center gap-6 md:gap-10 px-4 min-w-max mx-auto">
      {items.map((item) => (
        <div key={item.text} className="flex items-center gap-2 text-primary-foreground/70">
          <span className="text-accent">{item.icon}</span>
          <span className="text-xs md:text-sm font-medium whitespace-nowrap">{item.text}</span>
        </div>
      ))}
    </div>
  </div>
);
