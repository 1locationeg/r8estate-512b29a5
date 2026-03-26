import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStartChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const startChat = useCallback(async (otherUserId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (otherUserId === user.id) {
      toast.info("You can't message yourself");
      return;
    }

    try {
      const { data, error } = await supabase.rpc('find_or_create_conversation', {
        _other_user_id: otherUserId,
      });

      if (error) {
        console.error('Error starting conversation:', error);
        toast.error('Failed to start conversation');
        return;
      }

      navigate('/messages', { state: { conversationId: data } });
    } catch (err) {
      console.error(err);
      toast.error('Failed to start conversation');
    }
  }, [user, navigate]);

  const startChatWithBusinessId = useCallback(async (businessMockId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Look up business_profiles to find the owner user_id
    const { data: profiles } = await supabase
      .from('business_profiles')
      .select('user_id')
      .or(`id.eq.${businessMockId}`)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      toast.info("This business hasn't been claimed yet. Messaging is not available.");
      return;
    }

    await startChat(profiles[0].user_id);
  }, [user, navigate, startChat]);

  return { startChat, startChatWithBusinessId };
};
