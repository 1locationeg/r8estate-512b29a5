import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Clock, Star, Search, MessageSquare } from 'lucide-react';
import { getRatingColorClass } from '@/lib/ratingColors';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { localizeStoredReviewValue } from '@/lib/reviewCopy';

interface ModerationReview {
  id: string;
  user_id: string;
  author_name: string;
  developer_id: string;
  developer_name: string | null;
  rating: number;
  title: string | null;
  comment: string;
  experience_type: string | null;
  is_anonymous: boolean;
  is_verified: boolean;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const AdminModerationQueue = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ModerationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load reviews');
      console.error(error);
    }
    setReviews((data as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    setProcessing(reviewId);
    const { error } = await supabase
      .from('reviews')
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reviewId);
    if (error) {
      toast.error(`Failed to ${status === 'approved' ? 'approve' : 'reject'} review`);
      console.error(error);
    } else {
      toast.success(`Review ${status === 'approved' ? 'approved' : 'rejected'}`);
      fetchReviews();
    }
    setProcessing(null);
  };

  const filtered = reviews.filter(r => {
    const matchesTab = activeTab === 'all' || r.status === activeTab;
    const matchesSearch = !searchQuery || 
      r.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.developer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const statusBadge = (status: string) => {
    const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';
    return <Badge variant={variant} className="capitalize">{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Review Moderation</h2>
          <p className="text-sm text-muted-foreground">Approve or reject submitted reviews before they go public</p>
        </div>
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by author, comment, or developer..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No {activeTab !== 'all' ? activeTab : ''} reviews found</p>
            </div>
          ) : (
            filtered.map(review => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {statusIcon(review.status)}
                        <span className="font-medium text-sm text-foreground">
                          {review.is_anonymous ? t('reviews.anonymousUser', 'Anonymous user') : review.author_name}
                        </span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="text-sm text-muted-foreground">{review.developer_name || 'Unknown'}</span>
                        {statusBadge(review.status)}
                        {review.is_verified && <Badge variant="outline" className="text-xs">Verified</Badge>}
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? getRatingColorClass(review.rating).replace('text-', 'fill-') + ' ' + getRatingColorClass(review.rating) : 'text-muted'}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {review.title && <p className="text-sm font-medium text-foreground mb-1">{review.title}</p>}
                      <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
                      
                      {review.experience_type && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {localizeStoredReviewValue(review.experience_type, t)}
                        </Badge>
                      )}
                    </div>

                    {review.status === 'pending' && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleModerate(review.id, 'approved')}
                          disabled={processing === review.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processing === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          <span className="ml-1">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleModerate(review.id, 'rejected')}
                          disabled={processing === review.id}
                        >
                          {processing === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          <span className="ml-1">Reject</span>
                        </Button>
                      </div>
                    )}

                    {review.status !== 'pending' && review.reviewed_at && (
                      <div className="text-xs text-muted-foreground text-right shrink-0">
                        <p>Reviewed</p>
                        <p>{new Date(review.reviewed_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModerationQueue;
