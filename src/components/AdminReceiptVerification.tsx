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
  Loader2, CheckCircle, XCircle, Clock, Search, Receipt, ExternalLink, User,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptSubmission {
  id: string;
  user_id: string;
  developer_id: string | null;
  developer_name: string | null;
  image_url: string;
  status: string;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  // joined from profiles
  user_name?: string;
  user_email?: string;
}

const AdminReceiptVerification = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<ReceiptSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('receipt_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load receipts');
      console.error(error);
    }
    const rawReceipts = (data as any[]) || [];

    // Fetch profile info for all user_ids
    const userIds = [...new Set(rawReceipts.map(r => r.user_id))];
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

    setReceipts(rawReceipts.map(r => ({
      ...r,
      user_name: profileMap[r.user_id]?.full_name || null,
      user_email: profileMap[r.user_id]?.email || null,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  const handleModerate = async (receiptId: string, status: 'approved' | 'rejected') => {
    setProcessing(receiptId);
    const receipt = receipts.find(r => r.id === receiptId);

    const { error } = await supabase
      .from('receipt_submissions')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', receiptId);

    if (error) {
      toast.error(`Failed to ${status} receipt`);
      console.error(error);
    } else {
      // On approval, upgrade user's reviews verification_level to 'transaction'
      if (status === 'approved' && receipt) {
        await supabase
          .from('reviews')
          .update({ verification_level: 'transaction' } as any)
          .eq('user_id', receipt.user_id)
          .in('verification_level', ['none', 'identity']);
      }
      toast.success(`Receipt ${status}`);
      setReviewModal(null);
      setAdminNotes('');
      fetchReceipts();
    }
    setProcessing(null);
  };

  const filtered = receipts.filter(r => {
    const matchesTab = activeTab === 'all' || r.status === activeTab;
    const matchesSearch = !searchQuery ||
      (r.developer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.user_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    pending: receipts.filter(r => r.status === 'pending').length,
    approved: receipts.filter(r => r.status === 'approved').length,
    rejected: receipts.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Receipt Verification</h2>
        <p className="text-sm text-muted-foreground">Review buyer receipt submissions to verify transaction history</p>
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
          placeholder="Search by developer or user name..."
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
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No {activeTab !== 'all' ? activeTab : ''} receipts found</p>
            </div>
          ) : (
            filtered.map(receipt => (
              <Card key={receipt.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      {/* Receipt image preview */}
                      <a href={receipt.image_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary">
                          <img src={receipt.image_url} alt="Receipt" className="w-full h-full object-cover" />
                        </div>
                      </a>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Receipt className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">{receipt.developer_name || 'Unknown Developer'}</span>
                          <Badge
                            variant={receipt.status === 'approved' ? 'default' : receipt.status === 'rejected' ? 'destructive' : 'secondary'}
                            className="capitalize"
                          >
                            {receipt.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <User className="w-3 h-3" />
                          <span>{receipt.user_name || 'Unknown'}</span>
                          {receipt.user_email && <span className="text-muted-foreground/60">({receipt.user_email})</span>}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(receipt.created_at).toLocaleDateString()}
                        </p>

                        {receipt.admin_notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">Note: {receipt.admin_notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {receipt.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setReviewModal(receipt); setAdminNotes(''); }}
                        >
                          <Receipt className="w-3 h-3 me-1" />
                          Review
                        </Button>
                      )}

                      {receipt.status !== 'pending' && receipt.reviewed_at && (
                        <div className="text-xs text-muted-foreground text-end">
                          <p>Reviewed</p>
                          <p>{new Date(receipt.reviewed_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Receipt</DialogTitle>
              <DialogDescription>
                Verify the receipt for {reviewModal.developer_name || 'Unknown Developer'} submitted by {reviewModal.user_name || 'Unknown User'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Receipt image */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Receipt Image</label>
                <a
                  href={reviewModal.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="rounded-lg overflow-hidden border border-border max-h-64">
                    <img src={reviewModal.image_url} alt="Receipt" className="w-full object-contain max-h-64" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Open full size
                  </span>
                </a>
              </div>

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

export default AdminReceiptVerification;
