import { useState, useEffect, useCallback } from 'react';
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
  email: string;
  phone: string;
  website: string;
  social_links: Record<string, string>;
  license_url: string;
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
  email: '',
  phone: '',
  website: '',
  social_links: {},
  license_url: '',
});

export function useBusinessProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .is('parent_id', null)
      .maybeSingle();

    if (error) {
      console.error('Error fetching business profile:', error);
      setProfile(emptyProfile(user.id));
    } else {
      setProfile(data ? {
        ...data,
        company_name: data.company_name ?? '',
        description: data.description ?? '',
        logo_url: data.logo_url ?? '',
        location: data.location ?? '',
        specialties: data.specialties ?? [],
        email: data.email ?? '',
        phone: data.phone ?? '',
        website: data.website ?? '',
        social_links: (data.social_links as Record<string, string>) ?? {},
        license_url: data.license_url ?? '',
      } : emptyProfile(user.id));
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const saveProfile = async (updates: Partial<BusinessProfile>) => {
    if (!user) return;
    setIsSaving(true);

    const payload = {
      user_id: user.id,
      company_name: updates.company_name ?? profile?.company_name ?? '',
      description: updates.description ?? profile?.description ?? '',
      logo_url: updates.logo_url ?? profile?.logo_url ?? '',
      location: updates.location ?? profile?.location ?? '',
      year_established: updates.year_established ?? profile?.year_established,
      employees: updates.employees ?? profile?.employees,
      specialties: updates.specialties ?? profile?.specialties ?? [],
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
  };

  return { profile, isLoading, isSaving, saveProfile, refetch: fetchProfile };
}
