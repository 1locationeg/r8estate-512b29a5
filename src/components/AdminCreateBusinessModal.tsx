import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Building2, Loader2, Plus, CheckCircle, Search, UserPlus, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BUSINESS_CATEGORIES } from "@/data/businessCategories";

interface AdminCreateBusinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AdminCreateBusinessModal({ open, onOpenChange, onCreated }: AdminCreateBusinessModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User selection
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<Array<{ id: string; email: string; full_name: string | null }>>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; full_name: string | null } | null>(null);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    const q = userSearch.trim();
    if (q.length < 2) {
      setUserResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearchingUsers(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, email, full_name")
        .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(10);
      setUserResults(
        (data || []).map((p: any) => ({ id: p.user_id, email: p.email || "", full_name: p.full_name }))
      );
      setSearchingUsers(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  const resetForm = () => {
    setCompanyName("");
    setDescription("");
    setLocation("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setCategories([]);
    setUserSearch("");
    setUserResults([]);
    setSelectedUser(null);
  };

  const toggleCategory = (value: string) => {
    setCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to assign this business to");
      return;
    }
    if (!companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user already has a root business profile
      const { data: existing } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", selectedUser.id)
        .is("parent_id", null)
        .limit(1)
        .maybeSingle();

      if (existing) {
        toast.error("This user already has a business profile. Use the Business Management table to edit it.");
        setIsSubmitting(false);
        return;
      }

      // Create business profile
      const { error: profileError } = await supabase
        .from("business_profiles")
        .insert({
          user_id: selectedUser.id,
          company_name: companyName.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          website: website.trim() || null,
          categories,
          specialties: [],
          social_links: {},
        });

      if (profileError) throw profileError;

      // Add business role if not already present
      await supabase
        .from("user_roles")
        .upsert(
          { user_id: selectedUser.id, role: "business" as any },
          { onConflict: "user_id,role" }
        );

      // Remove buyer/user roles
      await Promise.all([
        supabase.from("user_roles").delete().eq("user_id", selectedUser.id).eq("role", "buyer" as any),
        supabase.from("user_roles").delete().eq("user_id", selectedUser.id).eq("role", "user" as any),
      ]);

      // Send notification
      await supabase.from("notifications").insert({
        user_id: selectedUser.id,
        type: "review_status",
        title: "Welcome to Business! 🎉",
        message: `Your business "${companyName.trim()}" has been created by an admin. Complete your profile to get started.`,
        metadata: { link: "/business/profile" },
      });

      toast.success(`Business "${companyName.trim()}" created successfully!`);
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create business");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-business-border" />
            Create Business Account
          </DialogTitle>
          <DialogDescription>
            Create a new business profile and assign it to an existing user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Selection */}
          <div>
            <Label className="text-sm font-medium">Assign to User *</Label>
            {selectedUser ? (
              <div className="mt-1.5 flex items-center justify-between bg-business/50 border border-business-border/20 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedUser.full_name || "No name"}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelectedUser(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="mt-1.5 space-y-2">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="ps-9 text-sm"
                  />
                </div>
                {searchingUsers && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {userResults.length > 0 && (
                  <div className="border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
                    {userResults.map((u) => (
                      <button
                        key={u.id}
                        className="w-full flex items-center gap-3 p-2.5 text-start hover:bg-secondary/50 transition-colors"
                        onClick={() => {
                          setSelectedUser(u);
                          setUserSearch("");
                          setUserResults([]);
                        }}
                      >
                        <UserPlus className="w-4 h-4 text-business-border shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{u.full_name || "No name"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Company Name */}
          <div>
            <Label className="text-sm font-medium">Company Name *</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value.slice(0, 100))}
              placeholder="e.g. Palm Hills Developments"
              maxLength={100}
              className="mt-1"
            />
          </div>

          {/* Categories */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Categories
            </Label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {BUSINESS_CATEGORIES.map(cat => {
                const isActive = categories.includes(cat.value);
                return (
                  <Badge
                    key={cat.value}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "text-[10px] cursor-pointer transition-colors select-none",
                    isActive ? "bg-business-border text-white hover:bg-business-border/80" : "hover:bg-secondary"
                    )}
                    onClick={() => toggleCategory(cat.value)}
                  >
                    {isActive ? <CheckCircle className="w-3 h-3 me-1" /> : <Plus className="w-3 h-3 me-1" />}
                    {cat.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Location & Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New Cairo"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@company.com"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 1xx xxx xxxx"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Website</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Brief description of this business..."
              maxLength={500}
              rows={3}
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !companyName.trim() || !selectedUser}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
            {isSubmitting ? "Creating..." : "Create Business Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
