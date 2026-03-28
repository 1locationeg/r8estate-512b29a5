import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Flag, Search, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: string;
  content_id: string;
  reason: string;
  details: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reporter_name?: string;
}

const AdminContentReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('content_reports') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load reports');
      setLoading(false);
      return;
    }

    const rows = (data || []) as any[];
    const reporterIds = [...new Set(rows.map(r => r.reporter_id))];
    let profileMap: Record<string, string> = {};
    if (reporterIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', reporterIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.user_id] = p.full_name || p.email?.split('@')[0] || 'User';
      });
    }

    setReports(rows.map(r => ({ ...r, reporter_name: profileMap[r.reporter_id] || 'Unknown' })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateStatus = async (reportId: string, status: 'reviewed' | 'dismissed') => {
    setUpdatingId(reportId);
    const { error } = await (supabase.from('content_reports') as any)
      .update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq('id', reportId);
    if (error) {
      toast.error('Failed to update report');
    } else {
      toast.success(`Report ${status}`);
      fetchReports();
    }
    setUpdatingId(null);
  };

  const filtered = reports.filter(r =>
    activeTab === 'all' || r.status === activeTab
  );

  const stats = {
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  const reasonColor = (reason: string) => {
    switch (reason) {
      case 'harassment': return 'destructive';
      case 'defamation': return 'destructive';
      case 'spam': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Content Reports</h2>
        <p className="text-sm text-muted-foreground">User-submitted flags across all content types</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-center">
            <Flag className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-600">{stats.reviewed}</div>
            <div className="text-xs text-muted-foreground">Reviewed</div>
          </CardContent>
        </Card>
        <Card className="border-muted-foreground/20 bg-muted/30">
          <CardContent className="p-4 text-center">
            <XCircle className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <div className="text-2xl font-bold text-muted-foreground">{stats.dismissed}</div>
            <div className="text-xs text-muted-foreground">Dismissed</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="reviewed" className="flex-1">Reviewed ({stats.reviewed})</TabsTrigger>
          <TabsTrigger value="dismissed" className="flex-1">Dismissed ({stats.dismissed})</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">All ({reports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No reports found</p>
            </div>
          ) : (
            filtered.map(report => (
              <Card key={report.id} className={`${report.status === 'pending' ? 'border-amber-500/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{report.reporter_name}</span>
                        <Badge variant={reasonColor(report.reason) as any} className="text-xs capitalize">{report.reason}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{report.content_type}</Badge>
                        <Badge variant={report.status === 'pending' ? 'secondary' : report.status === 'reviewed' ? 'default' : 'outline'} className="text-xs capitalize">{report.status}</Badge>
                      </div>
                      {report.details && (
                        <p className="text-sm text-muted-foreground">{report.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()} • ID: {report.content_id.slice(0, 8)}...
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateStatus(report.id, 'reviewed')}
                          disabled={updatingId === report.id}
                          className="gap-1"
                        >
                          {updatingId === report.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(report.id, 'dismissed')}
                          disabled={updatingId === report.id}
                          className="gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Dismiss
                        </Button>
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

export default AdminContentReports;
