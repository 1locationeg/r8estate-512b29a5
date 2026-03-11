import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Review, ReviewerTier } from '@/data/mockData';
import { reviews as mockReviews } from '@/data/mockData';

export function useReviews(developerId: string | undefined) {
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!developerId) return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('developer_id', developerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          return;
        }

        const mapped: Review[] = (data || []).map((r: any) => ({
          id: r.id,
          developerId: r.developer_id,
          author: r.is_anonymous ? 'Anonymous User' : r.author_name,
          profileVerified: r.is_verified,
          tier: 'bronze' as ReviewerTier,
          rating: r.rating,
          date: new Date(r.created_at).toISOString().split('T')[0],
          project: r.experience_type || 'General',
          comment: r.comment,
          verified: r.is_verified,
        }));

        setDbReviews(mapped);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [developerId]);

  // Combine mock reviews for this developer with DB reviews
  const mockForDeveloper = mockReviews.filter(r => r.developerId === developerId);
  const allReviews = [...dbReviews, ...mockForDeveloper];

  return { reviews: allReviews, dbReviews, loading };
}
