import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Building2, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface UserResult {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'business' | 'buyer' | 'user' | 'admin';
  company_name?: string | null;
}

interface NewConversationDialogProps {
  onStartConversation: (userId: string) => Promise<void>;
}

export const NewConversationDialog = ({ onStartConversation }: NewConversationDialogProps) => {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  const isBusiness = role === 'business';

  useEffect(() => {
    if (!open || !user) return;
    const timer = setTimeout(async () => {
      await searchUsers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, open, user]);

  const searchUsers = async (query: string) => {
    if (!user) return;
    setLoading(true);

    // Fetch profiles
    let profileQuery = supabase
      .from('public_profiles')
      .select('user_id, full_name, avatar_url')
      .neq('user_id', user.id)
      .limit(20);

    if (query.trim()) {
      profileQuery = profileQuery.ilike('full_name', `%${query.trim()}%`);
    }

    const { data: profiles } = await profileQuery;
    if (!profiles || profiles.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const userIds = profiles.map(p => p.user_id);

    // Fetch roles for these users
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const roleMap: Record<string, string> = {};
    roles?.forEach(r => { roleMap[r.user_id] = r.role; });

    // Fetch business profiles for business users
    const businessUserIds = userIds.filter(id => roleMap[id] === 'business');
    let businessMap: Record<string, string> = {};
    if (businessUserIds.length > 0) {
      const { data: bizProfiles } = await supabase
        .from('business_profiles')
        .select('user_id, company_name')
        .in('user_id', businessUserIds);
      bizProfiles?.forEach(b => {
        if (b.company_name) businessMap[b.user_id] = b.company_name;
      });
    }

    const mapped: UserResult[] = profiles.map(p => ({
      user_id: p.user_id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      role: (roleMap[p.user_id] || 'user') as UserResult['role'],
      company_name: businessMap[p.user_id] || null,
    }));

    // Sort: businesses first if current user is business
    if (isBusiness) {
      mapped.sort((a, b) => {
        if (a.role === 'business' && b.role !== 'business') return -1;
        if (a.role !== 'business' && b.role === 'business') return 1;
        return 0;
      });
    }

    setResults(mapped);
    setLoading(false);
  };

  const handleSelect = async (userId: string) => {
    setStarting(userId);
    await onStartConversation(userId);
    setStarting(null);
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-9 w-9" title={t('messages.newConversation', 'New conversation')}>
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('messages.newConversation', 'New Conversation')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('messages.searchUsers', 'Search users or businesses...')}
              className="ps-9"
              autoFocus
            />
          </div>

          <div className="max-h-[320px] overflow-y-auto space-y-0.5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {search ? t('messages.noUsersFound', 'No users found') : t('messages.typeToSearch', 'Type to search for users or businesses')}
              </div>
            ) : (
              results.map(u => (
                <button
                  key={u.user_id}
                  onClick={() => handleSelect(u.user_id)}
                  disabled={starting === u.user_id}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-start transition-all hover:bg-muted',
                    starting === u.user_id && 'opacity-60 pointer-events-none'
                  )}
                >
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {(u.full_name || 'U').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {u.full_name || 'User'}
                      </span>
                      {u.role === 'business' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 flex-shrink-0">
                          <Building2 className="w-2.5 h-2.5" />
                          Business
                        </Badge>
                      )}
                      {(u.role === 'buyer' || u.role === 'user') && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 flex-shrink-0 border-muted-foreground/30">
                          <User className="w-2.5 h-2.5" />
                          Buyer
                        </Badge>
                      )}
                    </div>
                    {u.company_name && (
                      <p className="text-xs text-muted-foreground truncate">{u.company_name}</p>
                    )}
                  </div>
                  {starting === u.user_id && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
