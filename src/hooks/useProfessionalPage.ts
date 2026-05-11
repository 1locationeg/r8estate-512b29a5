import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type CustomSection = {
  id: string;
  title: string;
  body: string;
  order: number;
};

export type ProfessionalPageData = {
  user_id: string;
  cover_url: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  languages: string[] | null;
  sections: CustomSection[];
};

const EMPTY: Omit<ProfessionalPageData, 'user_id'> = {
  cover_url: null,
  headline: null,
  bio: null,
  location: null,
  languages: null,
  sections: [],
};

/**
 * Loads the editable Trust Page row for the signed-in professional
 * (or `null` when not signed in / not a professional). Also exposes
 * save helpers and a `isOwner` flag the page uses to gate pencil icons.
 */
export function useProfessionalPage() {
  const { user, accountKind } = useAuth();
  const isOwner = !!user && accountKind === 'professional';
  const [data, setData] = useState<ProfessionalPageData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load
  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: row, error } = await supabase
        .from('professional_pages')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error('[professional_pages] load', error);
        setData({ user_id: user.id, ...EMPTY });
      } else if (row) {
        setData({
          user_id: row.user_id,
          cover_url: row.cover_url,
          headline: row.headline,
          bio: row.bio,
          location: row.location,
          languages: row.languages,
          sections: Array.isArray(row.sections) ? (row.sections as unknown as CustomSection[]) : [],
        });
      } else {
        setData({ user_id: user.id, ...EMPTY });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const save = useCallback(
    async (patch: Partial<Omit<ProfessionalPageData, 'user_id'>>) => {
      if (!user) return;
      const next: ProfessionalPageData = { user_id: user.id, ...EMPTY, ...(data ?? {}), ...patch };
      setData(next);
      const { error } = await supabase
        .from('professional_pages')
        .upsert([
          {
            user_id: user.id,
            cover_url: next.cover_url,
            headline: next.headline,
            bio: next.bio,
            location: next.location,
            languages: next.languages,
            sections: next.sections as unknown as never,
          },
        ], { onConflict: 'user_id' });
      if (error) {
        console.error('[professional_pages] save', error);
        toast.error('Could not save changes');
      }
    },
    [user, data],
  );

  const uploadCover = useCallback(
    async (file: File) => {
      if (!user) return;
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error('Image must be under 8MB');
        return;
      }
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/cover-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('professional-covers')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) {
        console.error(upErr);
        toast.error('Upload failed');
        return;
      }
      const { data: urlData } = supabase.storage.from('professional-covers').getPublicUrl(path);
      await save({ cover_url: urlData.publicUrl });
      toast.success('Cover updated');
    },
    [user, save],
  );

  const upsertSection = useCallback(
    async (section: CustomSection) => {
      const list = data?.sections ?? [];
      const exists = list.some((s) => s.id === section.id);
      const next = exists
        ? list.map((s) => (s.id === section.id ? section : s))
        : [...list, { ...section, order: list.length }];
      await save({ sections: next });
    },
    [data, save],
  );

  const removeSection = useCallback(
    async (id: string) => {
      const list = data?.sections ?? [];
      await save({ sections: list.filter((s) => s.id !== id) });
    },
    [data, save],
  );

  return { isOwner, data, loading, save, uploadCover, upsertSection, removeSection };
}