// @ts-nocheck
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Rocket, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const districtOptions = ["New Cairo", "Sheikh Zayed", "6th of October", "North Coast", "Mostakbal City", "New Capital", "Sokhna", "Other"];
const launchTypeOptions = [
  { value: "new_project", label: "New Project" },
  { value: "new_phase", label: "New Phase" },
  { value: "relaunch", label: "Re-launch" },
];
const unitTypeOptions = ["Studio", "1BR", "2BR", "3BR", "Villa"];

const statusIcons: Record<string, React.ReactNode> = {
  upcoming: <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
  reservations_open: <Clock className="w-3.5 h-3.5 text-amber-600" />,
  active: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
  sold_out: <XCircle className="w-3.5 h-3.5 text-muted-foreground" />,
};

export const LaunchSubmitForm = () => {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState("");
  const [district, setDistrict] = useState("");
  const [compound, setCompound] = useState("");
  const [launchType, setLaunchType] = useState("");
  const [reservationDate, setReservationDate] = useState<Date>();
  const [launchDate, setLaunchDate] = useState<Date>();
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [pricePerM2, setPricePerM2] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [unitTypes, setUnitTypes] = useState<string[]>([]);
  const [downPayment, setDownPayment] = useState("");
  const [installmentYears, setInstallmentYears] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [myLaunches, setMyLaunches] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: bp } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (bp) setBusinessId(bp.id);

      const { data: launches } = await supabase
        .from("launches" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (launches) setMyLaunches(launches as any[]);
    };
    load();
  }, [user]);

  const toggleUnitType = (ut: string) => {
    setUnitTypes((prev) => prev.includes(ut) ? prev.filter((x) => x !== ut) : [...prev, ut]);
  };

  const handleSubmit = async () => {
    if (!user || !businessId || !projectName.trim() || !district || !launchType || !agreed) return;
    setLoading(true);
    try {
      const total = totalUnits ? parseInt(totalUnits) : 0;
      const { error } = await supabase.from("launches" as any).insert({
        business_id: businessId,
        user_id: user.id,
        project_name: projectName.trim(),
        location_district: district,
        location_compound: compound.trim() || null,
        launch_type: launchType,
        reservation_date: reservationDate ? format(reservationDate, "yyyy-MM-dd") : null,
        launch_date: launchDate ? format(launchDate, "yyyy-MM-dd") : null,
        delivery_date: deliveryDate ? format(deliveryDate, "yyyy-MM-dd") : null,
        current_price_per_m2: pricePerM2 ? parseFloat(pricePerM2) : null,
        total_units: total,
        units_remaining: total,
        unit_types: unitTypes,
        down_payment_pct: downPayment ? parseFloat(downPayment) : null,
        installment_years: installmentYears ? parseInt(installmentYears) : null,
      } as any);
      if (error) throw error;
      toast.success("Launch submitted for review!");
      setProjectName(""); setDistrict(""); setCompound(""); setLaunchType("");
      setReservationDate(undefined); setLaunchDate(undefined); setDeliveryDate(undefined);
      setPricePerM2(""); setTotalUnits(""); setUnitTypes([]); setDownPayment("");
      setInstallmentYears(""); setAgreed(false);
      const { data: launches } = await supabase
        .from("launches" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (launches) setMyLaunches(launches as any[]);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit launch");
    } finally {
      setLoading(false);
    }
  };

  if (!businessId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>You need a business profile to submit launches.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Submit a Launch
        </h2>
        <p className="text-sm text-muted-foreground">Submit your project launch for buyer review. All launches are verified before going live.</p>
      </div>

      <div className="space-y-4 bg-card border border-border rounded-xl p-4">
        <div>
          <Label>Project Name</Label>
          <Input value={projectName} onChange={(e) => setProjectName(e.target.value.slice(0, 100))} placeholder="e.g. Ora Towers — Phase 2" maxLength={100} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Location (District)</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>
                {districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Compound Name</Label>
            <Input value={compound} onChange={(e) => setCompound(e.target.value)} placeholder="e.g. Mostakbal City" />
          </div>
        </div>

        <div>
          <Label>Launch Type</Label>
          <Select value={launchType} onValueChange={setLaunchType}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {launchTypeOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Reservation Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-start", !reservationDate && "text-muted-foreground")}>
                  <CalendarIcon className="me-2 h-4 w-4" />
                  {reservationDate ? format(reservationDate, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={reservationDate} onSelect={setReservationDate} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Launch Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-start", !launchDate && "text-muted-foreground")}>
                  <CalendarIcon className="me-2 h-4 w-4" />
                  {launchDate ? format(launchDate, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={launchDate} onSelect={setLaunchDate} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Launch Price per m² (EGP)</Label>
            <Input type="number" value={pricePerM2} onChange={(e) => setPricePerM2(e.target.value)} placeholder="e.g. 45000" min="0" />
          </div>
          <div>
            <Label>Total Units</Label>
            <Input type="number" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} placeholder="e.g. 120" min="0" />
          </div>
        </div>

        <div>
          <Label>Unit Types Available</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {unitTypeOptions.map((ut) => (
              <label key={ut} className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox checked={unitTypes.includes(ut)} onCheckedChange={() => toggleUnitType(ut)} />
                <span className="text-xs">{ut}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Down Payment %</Label>
            <Input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="e.g. 10" min="0" max="100" />
          </div>
          <div>
            <Label>Installment Years</Label>
            <Input type="number" value={installmentYears} onChange={(e) => setInstallmentYears(e.target.value)} placeholder="e.g. 8" min="0" />
          </div>
          <div>
            <Label>Delivery Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-start text-xs", !deliveryDate && "text-muted-foreground")}>
                  <CalendarIcon className="me-2 h-3 w-3" />
                  {deliveryDate ? format(deliveryDate, "PPP") : "Pick"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DisclaimerCheckbox checked={agreed} onCheckedChange={setAgreed} />

        <p className="text-[10px] text-muted-foreground bg-destructive/5 rounded p-2 border border-destructive/20">
          ⚠️ I confirm this is a real, verified launch. Misleading launch data will result in removal and account suspension.
        </p>

        <Button
          onClick={handleSubmit}
          disabled={loading || !projectName.trim() || !district || !launchType || !agreed}
          className="w-full"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin me-2" /> Submitting...</> : "Submit for Review"}
        </Button>
      </div>

      {/* My Launches */}
      {myLaunches.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">My Launches</h3>
          {myLaunches.map((l: any) => (
            <div key={l.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{l.project_name}</p>
                <p className="text-xs text-muted-foreground">{l.location_district} · {l.launch_type?.replace("_", " ")} · {new Date(l.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {l.is_verified ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 text-[10px]">✓ Verified</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">Under Review</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
