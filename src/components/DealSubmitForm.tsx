import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DisclaimerCheckbox } from "@/components/DisclaimerCheckbox";
import { toast } from "sonner";

const dealTypes = [
  { value: "payment_plan", label: "Payment Plan" },
  { value: "discount", label: "Discount" },
  { value: "early_access", label: "Early Access" },
  { value: "exclusive_units", label: "Exclusive Units" },
  { value: "other", label: "Other" },
];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
  verified: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
  rejected: <XCircle className="w-3.5 h-3.5 text-destructive" />,
};

export const DealSubmitForm = () => {
  const { user } = useAuth();
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [dealType, setDealType] = useState("");
  const [price, setPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [validUntil, setValidUntil] = useState<Date>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myDeals, setMyDeals] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Get business profile
      const { data: bp } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (bp) setBusinessId(bp.id);

      // Get my deals
      const { data: deals } = await supabase
        .from("deals" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (deals) setMyDeals(deals as any[]);
    };
    load();
  }, [user]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && tags.length < 5 && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!user || !businessId || !headline.trim() || !description.trim() || !dealType || !agreed) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("deals" as any).insert({
        business_id: businessId,
        user_id: user.id,
        headline: headline.trim(),
        description: description.trim(),
        deal_type: dealType,
        price: price ? parseFloat(price) : null,
        down_payment_percent: downPayment ? parseFloat(downPayment) : null,
        valid_until: validUntil ? format(validUntil, "yyyy-MM-dd") : null,
        tags,
      } as any);
      if (error) throw error;
      toast.success("Deal submitted for review!");
      setHeadline(""); setDescription(""); setDealType(""); setPrice(""); setDownPayment(""); setValidUntil(undefined); setTags([]); setAgreed(false);
      // Refresh
      const { data: deals } = await supabase
        .from("deals" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (deals) setMyDeals(deals as any[]);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit deal");
    } finally {
      setLoading(false);
    }
  };

  if (!businessId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>You need a business profile to submit deals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Submit a Deal</h2>
        <p className="text-sm text-muted-foreground">Submit your offer for buyer review. All deals are verified before going live.</p>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-xl p-4">
        <div>
          <Label>Deal Headline</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value.slice(0, 80))} placeholder="e.g. 8% down payment · 8-year installment" maxLength={80} />
          <p className="text-[10px] text-muted-foreground mt-1">{headline.length}/80</p>
        </div>

        <div>
          <Label>Deal Type</Label>
          <Select value={dealType} onValueChange={setDealType}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {dealTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Price (EGP)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 2500000" min="0" />
          </div>
          <div>
            <Label>Down Payment %</Label>
            <Input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="e.g. 10" min="0" max="100" />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 300))} placeholder="Describe the deal..." maxLength={300} rows={3} />
          <p className="text-[10px] text-muted-foreground mt-1">{description.length}/300</p>
        </div>

        <div>
          <Label>Valid Until</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left", !validUntil && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {validUntil ? format(validUntil, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={validUntil} onSelect={setValidUntil} disabled={(d) => d < new Date()} className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Tags (max 5)</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <Button type="button" variant="outline" size="icon" onClick={addTag} disabled={tags.length >= 5}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((t, i) => (
                <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setTags(tags.filter((_, j) => j !== i))}>
                  {t} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DisclaimerCheckbox checked={agreed} onCheckedChange={setAgreed} />

        <Button onClick={handleSubmit} disabled={loading || !headline.trim() || !description.trim() || !dealType || !agreed} className="w-full">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : "Submit for Review"}
        </Button>
      </div>

      {/* My Deals */}
      {myDeals.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">My Deals</h3>
          {myDeals.map((d: any) => (
            <div key={d.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{d.headline}</p>
                <p className="text-xs text-muted-foreground">{d.deal_type?.replace("_", " ")} · {new Date(d.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {statusIcons[d.status] || null}
                <Badge variant={d.status === "verified" ? "default" : d.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">
                  {d.status === "verified" ? "Verified" : d.status === "rejected" ? "Not Approved" : "Pending Review"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
