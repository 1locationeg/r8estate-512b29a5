import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Loader2, Building2, Save, ExternalLink, Mail, Phone, Globe, MapPin, Calendar, Users as UsersIcon, CheckCircle, Plus, Tag, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useStartChat } from "@/hooks/useStartChat";

interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: string[];
  admin_permission: string | null;
  business_profile_id?: string | null;
  business_company_name?: string | null;
  created_at: string;
}

const BUSINESS_CATEGORIES = [
  { value: "developers", label: "Developers" },
  { value: "apps", label: "Apps" },
  { value: "brokers", label: "Brokers" },
  { value: "units", label: "Units" },
  { value: "projects", label: "Projects" },
  { value: "locations", label: "Locations" },
  { value: "property-types", label: "Property Types" },
  { value: "categories", label: "Categories" },
];

interface BusinessProfileData {
  id: string;
  company_name: string;
  description: string;
  logo_url: string;
  location: string;
  year_established: number | null;
  employees: number | null;
  specialties: string[];
  email: string;
  phone: string;
  website: string;
  license_url: string;
  categories: string[];
}

interface Props {
  user: UserInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChange: (userId: string, role: string, action: "add" | "remove") => Promise<void>;
  manageableRoles: Array<{ value: string; label: string; color: string }>;
  updatingId: string | null;
}

export function AdminUserDetailSheet({ user, open, onOpenChange, onRoleChange, manageableRoles, updatingId }: Props) {
  const navigate = useNavigate();
  const { startChat } = useStartChat();
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");

  const isBusiness = user?.roles.includes("business");

  useEffect(() => {
    if (!open || !user) {
      setProfile(null);
      return;
    }
    if (isBusiness) {
      fetchBusinessProfile(user.id);
    }
  }, [open, user?.id, isBusiness, user?.roles?.length]);

  const fetchBusinessProfile = async (userId: string) => {
    setLoadingProfile(true);
    const { data } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (data) {
      setProfile({
        id: data.id,
        company_name: data.company_name ?? "",
        description: data.description ?? "",
        logo_url: data.logo_url ?? "",
        location: data.location ?? "",
        year_established: data.year_established,
        employees: data.employees,
        specialties: data.specialties ?? [],
        email: data.email ?? "",
        phone: data.phone ?? "",
        website: data.website ?? "",
        license_url: data.license_url ?? "",
        categories: (data as any).categories ?? [],
      });
    } else {
      setProfile(null);
    }
    setLoadingProfile(false);
  };

  const handleCreateProfile = async () => {
    if (!user) return;
    setSaving(true);
    const fallbackName = user.full_name?.trim()
      ? `${user.full_name}'s Business`
      : user.email?.split("@")[0]
        ? `${user.email.split("@")[0]}'s Business`
        : "My Business";

    const { error } = await supabase
      .from("business_profiles")
      .insert({
        user_id: user.id,
        company_name: fallbackName,
        specialties: [],
        social_links: {},
      });

    if (error) {
      toast.error("Failed to create profile: " + error.message);
    } else {
      toast.success("Business profile created");
      await fetchBusinessProfile(user.id);
    }
    setSaving(false);
  };

  const updateField = (field: keyof BusinessProfileData, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("business_profiles")
      .update({
        company_name: profile.company_name,
        description: profile.description,
        logo_url: profile.logo_url,
        location: profile.location,
        year_established: profile.year_established,
        employees: profile.employees,
        specialties: profile.specialties,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        license_url: profile.license_url,
        categories: profile.categories,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Business profile saved");
    }
    setSaving(false);
  };

  const addSpecialty = () => {
    if (!profile || !newSpecialty.trim()) return;
    updateField("specialties", [...profile.specialties, newSpecialty.trim()]);
    setNewSpecialty("");
  };

  const removeSpecialty = (idx: number) => {
    if (!profile) return;
    updateField("specialties", profile.specialties.filter((_, i) => i !== idx));
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user.avatar_url && <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />}
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {(user.full_name || user.email || "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold">{user.full_name || "No name"}</p>
              <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* User Info */}
          <div className="bg-secondary/30 rounded-lg p-3 space-y-1.5">
            <p className="text-[10px] text-muted-foreground">Joined {new Date(user.created_at).toLocaleDateString()}</p>
            <div className="flex flex-wrap gap-1">
              {user.roles.map(r => (
                <Badge key={r} variant="secondary" className="text-[10px] capitalize">{r}</Badge>
              ))}
              {user.roles.length === 0 && (
                <Badge variant="outline" className="text-[10px]">No role</Badge>
              )}
            </div>
          </div>

          {/* Role Management */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Manage Roles</p>
            <div className="flex flex-wrap gap-2">
              {manageableRoles.map(ar => {
                const hasRole = user.roles.includes(ar.value);
                const isUpdating = updatingId === user.id;
                return (
                  <Button
                    key={ar.value}
                    size="sm"
                    variant={hasRole ? "default" : "outline"}
                    disabled={isUpdating}
                    className="text-xs h-8"
                    onClick={() => onRoleChange(user.id, ar.value, hasRole ? "remove" : "add")}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : hasRole ? (
                      <><CheckCircle className="w-3 h-3 me-1" />{ar.label}</>
                    ) : (
                      <><Plus className="w-3 h-3 me-1" />{ar.label}</>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Business Profile Editor */}
          {isBusiness && (
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  Business Profile
                </p>
                {profile && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[10px] h-7"
                    onClick={() => navigate(`/entity/${profile.id}`)}
                  >
                    <ExternalLink className="w-3 h-3 me-1" />View Page
                  </Button>
                )}
              </div>

              {loadingProfile ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : !profile ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-muted-foreground">No business profile found.</p>
                  <Button size="sm" onClick={handleCreateProfile} disabled={saving} className="gap-1.5">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Create Business Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Company Name</label>
                    <Input
                      value={profile.company_name}
                      onChange={e => updateField("company_name", e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Description</label>
                    <Textarea
                      value={profile.description}
                      onChange={e => updateField("description", e.target.value)}
                      className="text-sm"
                      rows={3}
                    />
                  </div>
                  {/* Category Picker */}
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Tag className="w-3 h-3" />Business Categories
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {BUSINESS_CATEGORIES.map(cat => {
                        const isActive = profile.categories.includes(cat.value);
                        return (
                          <Badge
                            key={cat.value}
                            variant={isActive ? "default" : "outline"}
                            className={cn(
                              "text-[10px] cursor-pointer transition-colors select-none",
                              isActive ? "bg-primary text-primary-foreground hover:bg-primary/80" : "hover:bg-secondary"
                            )}
                            onClick={() => {
                              const newCats = isActive
                                ? profile.categories.filter(c => c !== cat.value)
                                : [...profile.categories, cat.value];
                              updateField("categories", newCats);
                            }}
                          >
                            {isActive ? <CheckCircle className="w-3 h-3 me-1" /> : <Plus className="w-3 h-3 me-1" />}
                            {cat.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />Location</label>
                      <Input
                        value={profile.location}
                        onChange={e => updateField("location", e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Year Est.</label>
                      <Input
                        type="number"
                        value={profile.year_established ?? ""}
                        onChange={e => updateField("year_established", e.target.value ? parseInt(e.target.value) : null)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><Mail className="w-3 h-3" />Email</label>
                      <Input
                        value={profile.email}
                        onChange={e => updateField("email", e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><Phone className="w-3 h-3" />Phone</label>
                      <Input
                        value={profile.phone}
                        onChange={e => updateField("phone", e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><Globe className="w-3 h-3" />Website</label>
                      <Input
                        value={profile.website}
                        onChange={e => updateField("website", e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><UsersIcon className="w-3 h-3" />Employees</label>
                      <Input
                        type="number"
                        value={profile.employees ?? ""}
                        onChange={e => updateField("employees", e.target.value ? parseInt(e.target.value) : null)}
                        className="text-sm h-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Logo URL</label>
                    <Input
                      value={profile.logo_url}
                      onChange={e => updateField("logo_url", e.target.value)}
                      className="text-sm h-9"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1"><Tag className="w-3 h-3" />Specialties</label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {profile.specialties.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] cursor-pointer hover:bg-destructive/20" onClick={() => removeSpecialty(i)}>
                          {s} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSpecialty}
                        onChange={e => setNewSpecialty(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                        placeholder="Add specialty..."
                        className="text-sm h-8 flex-1"
                      />
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addSpecialty}>Add</Button>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Business Profile
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
