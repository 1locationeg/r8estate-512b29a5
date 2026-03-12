import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, User } from "lucide-react";

interface ViewToggleProps {
  onViewChange: (view: "buyers" | "industry") => void;
  defaultView?: "buyers" | "industry";
}

export const ViewToggle = ({ onViewChange, defaultView = "buyers" }: ViewToggleProps) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<"buyers" | "industry">(defaultView);

  const handleToggle = (view: "buyers" | "industry") => {
    setActiveView(view);
    onViewChange(view);
  };

  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 bg-secondary rounded-full">
      <button
        onClick={() => handleToggle("buyers")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
          activeView === "buyers"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <User className="w-3.5 h-3.5" />
        <span>Buyer</span>
      </button>
      <button
        onClick={() => handleToggle("industry")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
          activeView === "industry"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Business</span>
      </button>
    </div>
  );
};
