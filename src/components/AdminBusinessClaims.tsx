import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Loader2, CheckCircle, XCircle, Clock, Search, Shield, ExternalLink, Building2,
} from 'lucide-react';
import { toast } from 'sonner';

interface BusinessClaim {
  id: string;
  user_id: string;
  business_name: string;
  business_mock_id: string | null;
  business_profile_id: string | null;
  document_url: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const AdminBusinessClaims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<BusinessClaim | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('business_claims' as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load claims');
      console.error(error);
    }
    const rawClaims = (data as any[]) || [];

    // Fetch profile info for user context
    const userIds = [...new Set(rawClaims.map((c: any) => c.user_id))];
    let profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.user_id] = { full_name: p.full_name, email: p.email };
      });
    }

    setClaims(rawClaims.map((c: any) => ({
      ...c,
      _userName: profileMap[c.user_id]?.full_name || null,
      _userEmail: profileMap[c.user_id]?.email || null,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleModerate = async (claimId: string, status: 'approved' | 'rejected') => {
    setProcessing(claimId);
    const { error } = await supabase
      .from('business_claims' as any)
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      } as any)
      .eq('id', claimId);

    if (error) {
      toast.error(`Failed to ${status} claim`);
      console.error(error);
    } else {
      toast.success(`Claim ${status}`);
      setReviewModal(null);
      setAdminNotes('');
      fetchClaims();
    }
    setProcessing(null);
  };

  const filtered = claims.filter(c => {
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    const matchesSearch = !searchQuery ||
      c.business_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Business Claims</h2>
        <p className="text-sm text-muted-foreground">Review and verify business ownership claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by business name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full ps-10 pe-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved" className="flex-1">Approved</TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No {activeTab !== 'all' ? activeTab : ''} claims found</p>
            </div>
          ) : (
            filtered.map(claim => (
              <Card key={claim.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{claim.business_name}</span>
                        <Badge
                          variant={claim.status === 'approved' ? 'default' : claim.status === 'rejected' ? 'destructive' : 'secondary'}
                          className="capitalize"
                        >
                          {claim.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        Submitted by {(claim as any)._userName || 'Unknown'} {(claim as any)._userEmail ? `(${(claim as any)._userEmail})` : ''} · {new Date(claim.created_at).toLocaleDateString()}
                      </p>

                      {claim.document_url && (
                        <a
                          href={claim.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View document
                        </a>
                      )}

                      {claim.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">Note: {claim.admin_notes}</p>
                      )}
                    </div>

                    {claim.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setReviewModal(claim); setAdminNotes(''); }}
                      >
                        <Shield className="w-3 h-3 me-1" />
                        Review
                      </Button>
                    )}

                    {claim.status !== 'pending' && claim.reviewed_at && (
                      <div className="text-xs text-muted-foreground text-end shrink-0">
                        <p>Reviewed</p>
                        <p>{new Date(claim.reviewed_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {reviewModal && (
        <Dialog open={!!reviewModal} onOpenChange={() => setReviewModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Claim: {reviewModal.business_name}</DialogTitle>
              <DialogDescription>
                Review the submitted documents and approve or reject this business ownership claim.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {reviewModal.document_url && (
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">Verification Document</label>
                  <a
                    href={reviewModal.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4 text-primary" />
                    Open document in new tab
                  </a>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Admin Notes (optional)</label>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="destructive"
                onClick={() => handleModerate(reviewModal.id, 'rejected')}
                disabled={!!processing}
              >
                {processing === reviewModal.id ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <XCircle className="w-4 h-4 me-1" />}
                Reject
              </Button>
              <Button
                onClick={() => handleModerate(reviewModal.id, 'approved')}
                disabled={!!processing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {processing === reviewModal.id ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : <CheckCircle className="w-4 h-4 me-1" />}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminBusinessClaims;
