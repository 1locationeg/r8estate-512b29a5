import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShareMenu } from "@/components/ShareMenu";
import { Gift, Copy, CheckCircle2, Users, Trophy } from "lucide-react";
import { toast } from "sonner";

export const ReferralWidget = () => {
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
  const totalPoints = referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user || loading) return null;

  return (
    <Card className="p-5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground">Invite Friends</h3>
        <Badge className="bg-accent/20 text-accent-foreground text-[10px]">+50 pts each</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-secondary/50 rounded-lg">
          <Users className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{referrals.length}</p>
          <p className="text-[10px] text-muted-foreground">Invited</p>
        </div>
        <div className="text-center p-2 bg-secondary/50 rounded-lg">
          <CheckCircle2 className="w-4 h-4 mx-auto text-verified mb-1" />
          <p className="text-lg font-bold text-foreground">{convertedCount}</p>
          <p className="text-[10px] text-muted-foreground">Joined</p>
        </div>
        <div className="text-center p-2 bg-secondary/50 rounded-lg">
          <Trophy className="w-4 h-4 mx-auto text-accent mb-1" />
          <p className="text-lg font-bold text-foreground">{totalPoints}</p>
          <p className="text-[10px] text-muted-foreground">Points</p>
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
        title="Join R8ESTATE"
        description="Join R8ESTATE — the trusted real estate review platform!"
        url={referralLink}
        label="Share Invite Link"
        variant="default"
        size="default"
        className="w-full gap-2"
      />

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Earn 50 points when your friend signs up and takes their first action
      </p>
    </Card>
  );
};

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Earn 50 points when your friend signs up and takes their first action
      </p>
    </Card>
  );
};
