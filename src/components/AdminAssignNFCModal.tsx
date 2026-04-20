// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Search, Building2, Check } from 'lucide-react';

type Mode = 'generate' | 'assign';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  // For 'assign' mode: a single existing tag id to relink
  tagId?: string | null;
  onDone?: () => void;
}

export default function AdminAssignNFCModal({ open, onOpenChange, mode, tagId, onDone }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [count, setCount] = useState(5);
  const [destinationType, setDestinationType] = useState('profile');
  const [labelPrefix, setLabelPrefix] = useState('R8ESTATE Card');
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (!open) {
      setQuery(''); setResults([]); setSelected(null);
      setCount(5); setDestinationType('profile'); setLabelPrefix('R8ESTATE Card');
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase.from('business_profiles')
        .select('id, company_name, user_id, logo_url')
        .ilike('company_name', `%${query.trim()}%`)
        .limit(8);
      setResults(data || []);
      setSearching(false);
    }, 250);
  }, [query]);

  const notify = async (userId: string, title: string, message: string) => {
    // create_notification RPC isn't directly callable; insert directly (admin RLS allows)
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'announcement',
      title,
      message,
      metadata: { link: '/business/nfc' },
    });
  };

  const handleGenerate = async () => {
    if (!selected) { toast.error('Pick a business first'); return; }
    const qty = Math.min(Math.max(parseInt(String(count), 10) || 0, 1), 50);
    setSubmitting(true);
    const rows = Array.from({ length: qty }, (_, i) => ({
      label: `${labelPrefix} #${i + 1}`,
      destination_type: destinationType,
      business_id: selected.id,
      user_id: selected.user_id,
      issued_by_admin: user?.id,
      approval_status: 'approved',
      is_active: true,
    }));
    const { error } = await supabase.from('nfc_tags').insert(rows);
    setSubmitting(false);
    if (error) { toast.error('Failed: ' + error.message); return; }
    await notify(
      selected.user_id,
      `🎁 ${qty} NFC tag${qty > 1 ? 's' : ''} from R8ESTATE`,
      `Admin assigned ${qty} new NFC tag${qty > 1 ? 's' : ''} to your account. Manage them at /business/nfc`,
    );
    toast.success(`Generated ${qty} tags for ${selected.company_name}`);
    onOpenChange(false);
    onDone?.();
  };

  const handleAssign = async () => {
    if (!selected || !tagId) { toast.error('Pick a business first'); return; }
    setSubmitting(true);
    const { error } = await supabase.from('nfc_tags').update({
      business_id: selected.id,
      user_id: selected.user_id,
      issued_by_admin: user?.id,
    }).eq('id', tagId);
    setSubmitting(false);
    if (error) { toast.error('Failed: ' + error.message); return; }
    await notify(
      selected.user_id,
      '🎁 NFC tag assigned to you',
      `Admin assigned an NFC tag to your account. Manage it at /business/nfc`,
    );
    toast.success(`Assigned to ${selected.company_name}`);
    onOpenChange(false);
    onDone?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'generate' ? 'Generate NFC Tags for a Business' : 'Assign NFC Tag to a Business'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Search business</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="ps-9" placeholder="Type a company name…"
                value={query} onChange={e => { setQuery(e.target.value); setSelected(null); }} />
            </div>
            {searching && <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Searching…</div>}
            {results.length > 0 && !selected && (
              <div className="mt-2 border rounded-md divide-y max-h-56 overflow-auto">
                {results.map(r => (
                  <button key={r.id} type="button"
                    className="w-full text-start p-2 hover:bg-muted flex items-center gap-2"
                    onClick={() => { setSelected(r); setQuery(r.company_name); setResults([]); }}>
                    {r.logo_url ? <img src={r.logo_url} className="w-6 h-6 rounded" alt="" /> :
                      <Building2 className="w-5 h-5 text-muted-foreground" />}
                    <span className="text-sm truncate">{r.company_name}</span>
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <div className="mt-2 p-2 border rounded-md bg-muted/50 flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span className="font-medium truncate">{selected.company_name}</span>
                <Button size="sm" variant="ghost" className="ms-auto" onClick={() => { setSelected(null); setQuery(''); }}>
                  Change
                </Button>
              </div>
            )}
          </div>

          {mode === 'generate' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Quantity (1–50)</Label>
                  <Input type="number" min={1} max={50} value={count}
                    onChange={e => setCount(parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <Label className="text-xs">Default destination</Label>
                  <Select value={destinationType} onValueChange={setDestinationType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profile">Business Profile</SelectItem>
                      <SelectItem value="review">Leave a Review</SelectItem>
                      <SelectItem value="projects">Projects Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Label prefix</Label>
                <Input value={labelPrefix} onChange={e => setLabelPrefix(e.target.value)} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!selected || submitting}
            onClick={mode === 'generate' ? handleGenerate : handleAssign}>
            {submitting && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
            {mode === 'generate' ? 'Generate Tags' : 'Assign Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}