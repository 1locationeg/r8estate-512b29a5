import { useState } from "react";
import { Users, Building2 } from "lucide-react";

interface ViewToggleProps {
  onViewChange: (view: "buyers" | "industry") => void;
}

export const ViewToggle = ({ onViewChange }: ViewToggleProps) => {
  const [activeView, setActiveView] = useState<"buyers" | "industry">("buyers");

  const handleToggle = (view: "buyers" | "industry") => {
    setActiveView(view);
    onViewChange(view);
  };

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-secondary rounded-full">
      <button
        onClick={() => handleToggle("industry")}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
          activeView === "industry"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span>For Business</span>
      </button>
    </div>
  );
};
