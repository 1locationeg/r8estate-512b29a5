import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, CheckCircle2, Trophy, Gift, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code: string;
  status: string;
  points_awarded: number;
  created_at: string;
  converted_at: string | null;
}

interface ReferrerProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ReferrerProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setReferrals(data);
      const userIds = [...new Set(data.map(r => r.referrer_id))];
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);
        if (profs) {
          const map: Record<string, ReferrerProfile> = {};
          profs.forEach(p => (map[p.user_id] = p));
          setProfiles(map);
        }
      }
    }
    setLoading(false);
  };

  const totalCodes = new Set(referrals.filter(r => r.status === 'active').map(r => r.referral_code)).size;
  const totalInvited = referrals.filter(r => r.status !== 'active').length;
  const totalConverted = referrals.filter(r => r.status === 'converted').length;
  const totalCredits = referrals.reduce((s, r) => s + (r.points_awarded || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" /> Referral System
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor referral codes, conversions, and Insight Credits awarded.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Codes', value: totalCodes, icon: <Users className="w-4 h-4" />, color: 'text-primary' },
          { label: 'Invited', value: totalInvited, icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-500' },
          { label: 'Converted', value: totalConverted, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-500' },
          { label: 'Credits Awarded', value: totalCredits, icon: <Trophy className="w-4 h-4" />, color: 'text-amber-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <div className={`mx-auto mb-1 ${s.color}`}>{s.icon}</div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Referrals</CardTitle>
          <CardDescription>Complete list of referral activity</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No referrals yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-start py-2 pe-4">Referrer</th>
                    <th className="text-start py-2 pe-4">Code</th>
                    <th className="text-start py-2 pe-4">Status</th>
                    <th className="text-start py-2 pe-4">Credits</th>
                    <th className="text-start py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pe-4">
                        {profiles[r.referrer_id]?.full_name || profiles[r.referrer_id]?.email || r.referrer_id.slice(0, 8)}
                      </td>
                      <td className="py-2 pe-4 font-mono text-xs">{r.referral_code}</td>
                      <td className="py-2 pe-4">
                        <Badge variant={r.status === 'converted' ? 'default' : 'secondary'} className="text-[10px]">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2 pe-4">{r.points_awarded}</td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {format(new Date(r.created_at), 'dd MMM yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReferrals;
