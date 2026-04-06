import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BusinessProfile {
  id?: string;
  user_id: string;
  company_name: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  location: string;
  year_established: number | null;
  employees: number | null;
  specialties: string[];
  categories: string[];
  email: string;
  phone: string;
  website: string;
  social_links: Record<string, string>;
  license_url: string;
}

interface BusinessProfileContextValue {
  profile: BusinessProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  saveProfile: (updates: Partial<BusinessProfile>) => Promise<void>;
  refetch: () => Promise<void>;
}

const emptyProfile = (userId: string): BusinessProfile => ({
  user_id: userId,
  company_name: '',
  description: '',
  logo_url: '',
  cover_image_url: '',
  location: '',
  year_established: null,
  employees: null,
  specialties: [],
  categories: [],
  email: '',
  phone: '',
  website: '',
  social_links: {},
  license_url: '',
});

const BusinessProfileContext = createContext<BusinessProfileContextValue | null>(null);

export const BusinessProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .is('parent_id', null)
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching business profile:', error);
      setProfile(emptyProfile(user.id));
    } else {
      const row = data?.[0];
      setProfile(row ? {
        ...row,
        company_name: row.company_name ?? '',
        description: row.description ?? '',
        logo_url: row.logo_url ?? '',
        cover_image_url: row.cover_image_url ?? '',
        location: row.location ?? '',
        specialties: row.specialties ?? [],
        categories: row.categories ?? [],
        email: row.email ?? '',
        phone: row.phone ?? '',
        website: row.website ?? '',
        social_links: (row.social_links as Record<string, string>) ?? {},
        license_url: row.license_url ?? '',
      } : emptyProfile(user.id));
    }
    setIsLoading(false);
  }, [user, authLoading]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const saveProfile = useCallback(async (updates: Partial<BusinessProfile>) => {
    if (!user) return;
    setIsSaving(true);

    const payload = {
      user_id: user.id,
      company_name: updates.company_name ?? profile?.company_name ?? '',
      description: updates.description ?? profile?.description ?? '',
      logo_url: updates.logo_url ?? profile?.logo_url ?? '',
      cover_image_url: updates.cover_image_url ?? profile?.cover_image_url ?? '',
      location: updates.location ?? profile?.location ?? '',
      year_established: updates.year_established ?? profile?.year_established,
      employees: updates.employees ?? profile?.employees,
      specialties: updates.specialties ?? profile?.specialties ?? [],
      categories: updates.categories ?? profile?.categories ?? [],
      email: updates.email ?? profile?.email ?? '',
      phone: updates.phone ?? profile?.phone ?? '',
      website: updates.website ?? profile?.website ?? '',
      social_links: updates.social_links ?? profile?.social_links ?? {},
      license_url: updates.license_url ?? profile?.license_url ?? '',
    };

    const { error } = profile?.id
      ? await supabase.from('business_profiles').update(payload).eq('id', profile.id)
      : await supabase.from('business_profiles').insert(payload);

    if (error) {
      console.error('Error saving business profile:', error);
      toast.error('Failed to save profile');
    } else {
      toast.success('Business profile saved');
      await fetchProfile();
    }
    setIsSaving(false);
  }, [user, profile, fetchProfile]);

  return (
    <BusinessProfileContext.Provider value={{ profile, isLoading, isSaving, saveProfile, refetch: fetchProfile }}>
      {children}
    </BusinessProfileContext.Provider>
  );
};

export function useBusinessProfile() {
  const ctx = useContext(BusinessProfileContext);
  if (!ctx) {
    throw new Error('useBusinessProfile must be used within a BusinessProfileProvider');
  }
  return ctx;
}
