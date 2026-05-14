import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AvatarAudience = 'all' | 'buyers' | 'businesses' | 'professionals' | 'admins';
export type AvatarOverlayPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'center';

export type AvatarOverlay = {
  id: string;
  name: string;
  icon_url: string;
  audience: AvatarAudience;
  position: AvatarOverlayPosition;
  size_percent: number;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  updated_at?: string | null;
};

type AvatarOverlayContextValue = {
  overlays: AvatarOverlay[];
  refresh: () => Promise<void>;
  getOverlayForAudience: (audience?: AvatarAudience | string) => AvatarOverlay | null;
};

const AvatarOverlayContext = createContext<AvatarOverlayContextValue>({
  overlays: [],
  refresh: async () => {},
  getOverlayForAudience: () => null,
});

const isLive = (overlay: AvatarOverlay) => {
  const now = Date.now();
  const startsOk = !overlay.start_at || new Date(overlay.start_at).getTime() <= now;
  const endsOk = !overlay.end_at || new Date(overlay.end_at).getTime() >= now;
  return overlay.is_active && startsOk && endsOk;
};

export function AvatarOverlayProvider({ children }: { children: ReactNode }) {
  const [overlays, setOverlays] = useState<AvatarOverlay[]>([]);

  const refresh = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from('avatar_overlays')
      .select('id,name,icon_url,audience,position,size_percent,start_at,end_at,is_active,updated_at')
      .order('updated_at', { ascending: false });

    if (!error) {
      setOverlays(((data || []) as AvatarOverlay[]).filter(isLive));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AvatarOverlayContextValue>(() => ({
    overlays,
    refresh,
    getOverlayForAudience: (audience?: AvatarAudience | string) => {
      const target = (audience || 'all') as AvatarAudience;
      return overlays.find((overlay) => overlay.audience === target) || overlays.find((overlay) => overlay.audience === 'all') || null;
    },
  }), [overlays, refresh]);

  return <AvatarOverlayContext.Provider value={value}>{children}</AvatarOverlayContext.Provider>;
}

export function useAvatarOverlay(audience?: AvatarAudience | string) {
  return useContext(AvatarOverlayContext).getOverlayForAudience(audience);
}

export function useAvatarOverlays() {
  return useContext(AvatarOverlayContext);
}