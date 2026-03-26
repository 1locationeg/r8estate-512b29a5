import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePresence = () => {
  const { user } = useAuth();
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);

  const updatePresence = useCallback(async (isOnline: boolean) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    if (error) console.error('Presence update error:', error);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Load hide status
    supabase
      .from('user_presence')
      .select('hide_online_status')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setHideOnlineStatus(data.hide_online_status);
      });

    // Set online
    updatePresence(true);

    // Heartbeat every 60s
    const heartbeat = setInterval(() => updatePresence(true), 60000);

    // Visibility change
    const onVisibility = () => {
      updatePresence(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Before unload
    const onUnload = () => {
      // Use sendBeacon for reliability
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`;
      navigator.sendBeacon?.(url); // best-effort
      updatePresence(false);
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onUnload);
      updatePresence(false);
    };
  }, [user, updatePresence]);

  const toggleHideOnlineStatus = useCallback(async (hide: boolean) => {
    if (!user) return;
    setHideOnlineStatus(hide);
    await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        hide_online_status: hide,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }, [user]);

  return { hideOnlineStatus, toggleHideOnlineStatus };
};

export const useUserPresence = (userId: string | undefined) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetch = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('is_online, last_seen, hide_online_status')
        .eq('user_id', userId)
        .maybeSingle();
      if (data) {
        setIsOnline(data.hide_online_status ? false : data.is_online);
        setLastSeen(data.hide_online_status ? null : data.last_seen);
      }
    };
    fetch();

    const channel = supabase
      .channel(`presence-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=eq.${userId}`,
      }, (payload: any) => {
        const d = payload.new;
        if (d) {
          setIsOnline(d.hide_online_status ? false : d.is_online);
          setLastSeen(d.hide_online_status ? null : d.last_seen);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { isOnline, lastSeen };
};
