import { Shield } from "lucide-react";

export const TrustBadge = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-verified/10 border border-verified rounded-full">
      <Shield className="w-3.5 h-3.5 text-verified fill-verified" />
      <span className="text-xs font-semibold text-verified-foreground">Verified</span>
    </div>
  );
};
