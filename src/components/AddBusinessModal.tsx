import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Building2, Plus, Clock, CheckCircle, Crown } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/data/businessCategories";

interface AddBusinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentBusinessId?: string;
  mode?: 'sub' | 'upgrade';
}

export const AddBusinessModal = ({ open, onOpenChange, parentBusinessId, mode = 'sub' }: AddBusinessModalProps) => {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [subBusinesses, setSubBusinesses] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    if (!open || !user || !parentBusinessId || mode !== 'sub') {
      setLoadingSubs(false);
      return;
    }
    setLoadingSubs(true);
    supabase
      .from("business_profiles")
      .select("id, company_name, location, categories, created_at")
      .eq("parent_id", parentBusinessId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubBusinesses(data || []);
        setLoadingSubs(false);
      });
  }, [open, user, parentBusinessId, mode]);

  const handleSubmit = async () => {
    if (!user || !parentBusinessId) return;
    
    if (mode === 'sub' && !companyName.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    setLoading(true);
    try {
      if (mode === 'sub') {
        const { error } = await supabase.from("business_profiles").insert({
          user_id: user.id,
          parent_id: parentBusinessId,
          company_name: companyName.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          categories: category ? [category] : [],
        });
        if (error) throw error;
        toast.success("Sub-business added successfully!");
        setCompanyName("");
        setDescription("");
        setLocation("");
        setCategory("");
        
        const { data } = await supabase
          .from("business_profiles")
          .select("id, company_name, location, categories, created_at")
          .eq("parent_id", parentBusinessId)
          .order("created_at", { ascending: false });
        setSubBusinesses(data || []);
      } else {
        // Handle upgrade logic
        toast.info("Redirecting to upgrade plans...");
        window.location.href = "/pricing";
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'sub' ? (
              <>
                <Building2 className="w-5 h-5 text-business-border" />
                Add Sub-Business / Branch
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 text-amber-500" />
                Upgrade Business Plan
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'sub' ? (
            <div className="space-y-3 bg-card border border-border rounded-xl p-4">
              <div>
                <Label>Business Name *</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value.slice(0, 100))}
                  placeholder="e.g. Branch - New Cairo"
                  maxLength={100}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New Cairo, Cairo"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                  placeholder="Brief description of this branch or sub-business..."
                  maxLength={300}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={loading || !companyName.trim()}
                className="w-full"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin me-2" /> Adding...</>
                ) : (
                  <><Plus className="w-4 h-4 me-2" /> Add Sub-Business</>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-muted-foreground">
                Upgrade your plan to unlock advanced features, analytics, and unlimited sub-businesses.
              </p>
              <Button onClick={handleSubmit} className="w-full bg-amber-600 hover:bg-amber-700">
                View Premium Plans
              </Button>
            </div>
          )}

          {mode === 'sub' && !loadingSubs && subBusinesses.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Your Sub-Businesses</h4>
              {subBusinesses.map((sb) => (
                <div key={sb.id} className="bg-muted/50 border border-border rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{sb.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sb.location || "No location"} · {sb.categories?.[0] || "Uncategorized"}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
