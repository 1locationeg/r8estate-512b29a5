import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReviewabilityResult {
  isReviewable: boolean;
  isLoading: boolean;
  parentName?: string;
  childProjects: { id: string; name: string }[];
}

/**
 * Checks if a developer/entity is reviewable.
 * If a matching business_profile exists with is_reviewable=false,
 * reviews are blocked and child projects are fetched as alternatives.
 * 
 * Entities without a business_profile (e.g. mock data) are always reviewable.
 */
export function useReviewability(developerId: string | undefined): ReviewabilityResult {
  const [isReviewable, setIsReviewable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [parentName, setParentName] = useState<string>();
  const [childProjects, setChildProjects] = useState<{ id: string; name: string }[]>([]);

  const check = useCallback(async () => {
    if (!developerId) return;
    setIsLoading(true);

    try {
      // Check if this developer has a business_profile with reviewability info
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id, company_name, is_reviewable')
        .eq('id', developerId)
        .maybeSingle();

      if (!profile) {
        // No business_profile found — default to reviewable (mock data entities)
        setIsReviewable(true);
        setIsLoading(false);
        return;
      }

      setIsReviewable(profile.is_reviewable ?? true);
      setParentName(profile.company_name ?? undefined);

      if (!profile.is_reviewable) {
        // Fetch child projects that ARE reviewable
        const { data: children } = await supabase
          .from('business_profiles')
          .select('id, company_name')
          .eq('parent_id', profile.id)
          .eq('is_reviewable', true)
          .order('company_name');

        setChildProjects(
          (children || []).map((c) => ({ id: c.id, name: c.company_name ?? 'Unnamed Project' }))
        );
      }
    } catch (err) {
      console.error('Error checking reviewability:', err);
      setIsReviewable(true); // fail open
    } finally {
      setIsLoading(false);
    }
  }, [developerId]);

  useEffect(() => {
    check();
  }, [check]);

  return { isReviewable, isLoading, parentName, childProjects };
}
