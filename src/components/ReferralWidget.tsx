import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShareMenu } from "@/components/ShareMenu";
import { Gift, Copy, CheckCircle2, Users, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const ReferralWidget = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchOrCreateCode();
    fetchReferrals();
  }, [user]);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "R8-";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const fetchOrCreateCode = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("referrals")
      .select("referral_code")
      .eq("referrer_id", user.id)
      .limit(1);

    if (data && data.length > 0) {
      setReferralCode(data[0].referral_code);
    } else {
      const code = generateCode();
      await supabase.from("referrals").insert({
        referrer_id: user.id,
        referral_code: code,
        status: "active",
      });
      setReferralCode(code);
    }
    setLoading(false);
  };

  const fetchReferrals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id)
      .neq("status", "active")
      .order("created_at", { ascending: false });
    setReferrals(data || []);
  };

  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
  const convertedCount = referrals.filter(r => r.status === "converted").length;
  const totalCredits = referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t("referral.linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || loading) return null;

  return (
    <Card className="p-5 border-accent/30 bg-gradient-to-br from-card to-accent/5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-full bg-accent/15">
          <Gift className="w-5 h-5 text-accent-foreground" />
        </div>
        <h3 className="font-bold text-foreground">{t("referral.headline")}</h3>
        <Sparkles className="w-4 h-4 text-accent-foreground" />
      </div>
      <p className="text-xs text-muted-foreground mb-1">{t("referral.subtext")}</p>
      <Badge className="bg-accent/20 text-accent-foreground text-[10px] mb-4">
        {t("referral.perReferral")}
      </Badge>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-secondary/50 rounded-lg">
          <Users className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{referrals.length}</p>
          <p className="text-[10px] text-muted-foreground">{t("referral.invited")}</p>
        </div>
        <div className="text-center p-2 bg-secondary/50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 mx-auto text-verified mb-1" />
          <p className="text-lg font-bold text-foreground">{convertedCount}</p>
          <p className="text-[10px] text-muted-foreground">{t("referral.verified")}</p>
        </div>
        <div className="text-center p-2 bg-secondary/50 rounded-lg">
          <Trophy className="w-4 h-4 mx-auto text-accent-foreground mb-1" />
          <p className="text-lg font-bold text-foreground">{totalCredits}</p>
          <p className="text-[10px] text-muted-foreground">{t("referral.insightCredits")}</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="flex gap-2 mb-3">
        <Input value={referralLink} readOnly className="text-xs bg-secondary/30" />
        <Button variant="outline" size="icon" className="flex-shrink-0" onClick={copyLink}>
          {copied ? <CheckCircle2 className="w-4 h-4 text-verified" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <ShareMenu
        title={t("referral.shareTitle")}
        description={t("referral.shareDesc")}
        url={referralLink}
        label={t("referral.shareButton")}
        variant="default"
        size="default"
        className="w-full gap-2"
      />

      {/* Collective intelligence note */}
      <p className="text-[10px] text-muted-foreground text-center mt-3">
        {t("referral.rewardNote")}
      </p>
      <p className="text-[10px] text-accent-foreground/70 text-center mt-1 font-medium">
        ✨ {t("referral.collectiveNote")}
      </p>
    </Card>
  );
};
