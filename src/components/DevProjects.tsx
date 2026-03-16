import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  Loader2, Plus, Building2, MapPin, Calendar, Edit, Trash2,
  CheckCircle, Lock, ChevronDown, ChevronUp, X
} from 'lucide-react';

interface Project {
  id: string;
  company_name: string | null;
  description: string | null;
  location: string | null;
  logo_url: string | null;
  is_reviewable: boolean;
  year_established: number | null;
  created_at: string;
  specialties: string[] | null;
}

const PROJECT_STATUSES = ['Pre-Launch', 'Launched', 'Under Construction', 'Completed', 'Occupied'];
const UNIT_TYPES = ['Studio', 'Twin House', 'Villa', 'Chalet', 'Penthouse', 'Loft', 'Office', 'Retail', '1BR', '2BR', '3BR+', 'Commercial', 'Administrative', 'Medical'];

const emptyForm = {
  company_name: '',
  description: '',
  location: '',
  year_established: '',
  specialties: '',
  is_reviewable: true,
};

const DevProjects = () => {
  const { user } = useAuth();
  const { profile: parentProfile, isLoading: parentLoading } = useBusinessProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!parentProfile?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('business_profiles')
      .select('id, company_name, description, location, logo_url, is_reviewable, year_established, created_at, specialties')
      .eq('parent_id', parentProfile.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
    setProjects((data as Project[]) || []);
    setLoading(false);
  }, [parentProfile?.id]);

  useEffect(() => {
    if (parentProfile?.id) fetchProjects();
  }, [parentProfile?.id, fetchProjects]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      company_name: p.company_name || '',
      description: p.description || '',
      location: p.location || '',
      year_established: p.year_established?.toString() || '',
      specialties: (p.specialties || []).join(', '),
      is_reviewable: p.is_reviewable,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !parentProfile?.id) return;
    if (!form.company_name.trim()) {
      toast.error('Project name is required');
      return;
    }
    setSaving(true);

    const payload = {
      user_id: user.id,
      parent_id: parentProfile.id,
      company_name: form.company_name.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      year_established: form.year_established ? Number(form.year_established) : null,
      specialties: form.specialties ? form.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
      is_reviewable: form.is_reviewable,
    };

    const { error } = editingId
      ? await supabase.from('business_profiles').update(payload).eq('id', editingId)
      : await supabase.from('business_profiles').insert(payload);

    if (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } else {
      toast.success(editingId ? 'Project updated' : 'Project created');
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchProjects();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('business_profiles').delete().eq('id', id);
    if (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } else {
      toast.success('Project deleted');
      fetchProjects();
    }
    setDeletingId(null);
  };

  if (parentLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!parentProfile?.id) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-1">Set Up Your Business First</h3>
        <p className="text-sm text-muted-foreground">Complete your Business Profile before adding projects.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projects & Compounds</h2>
          <p className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {editingId ? 'Edit Project' : 'New Project'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Project / Compound Name *</Label>
              <Input
                value={form.company_name}
                onChange={e => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Palm Hills October"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. 6th October City"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Launch / Established Year</Label>
              <Input
                type="number"
                value={form.year_established}
                onChange={e => setForm({ ...form, year_established: e.target.value })}
                placeholder="e.g. 2024"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Unit Types (comma-separated)</Label>
              <Input
                value={form.specialties}
                onChange={e => setForm({ ...form, specialties: e.target.value })}
                placeholder="Villa, Chalet, 2BR"
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this project..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">Open for Reviews</p>
                <p className="text-xs text-muted-foreground">Allow buyers to submit reviews for this project</p>
              </div>
              <Switch
                checked={form.is_reviewable}
                onCheckedChange={checked => setForm({ ...form, is_reviewable: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingId ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 && !showForm ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No Projects Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your compounds and projects so buyers can review them individually.
          </p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 me-1" /> Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12 shrink-0">
                {p.logo_url && <img src={p.logo_url} alt="" className="w-full h-full object-cover rounded-full" />}
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {(p.company_name || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-foreground text-sm truncate">{p.company_name || 'Untitled'}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    p.is_reviewable ? 'bg-trust-excellent/10 text-trust-excellent' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {p.is_reviewable ? <CheckCircle className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                    {p.is_reviewable ? 'Reviewable' : 'Blocked'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {p.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>
                  )}
                  {p.year_established && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.year_established}</span>
                  )}
                </div>
                {p.specialties && p.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.specialties.slice(0, 4).map(s => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{s}</span>
                    ))}
                    {p.specialties.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">+{p.specialties.length - 4}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DevProjects;
