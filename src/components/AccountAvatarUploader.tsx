import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarWithOverlay } from '@/components/AvatarWithOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AccountAvatarUploaderProps = {
  audience?: 'buyers' | 'businesses' | 'professionals' | 'admins' | 'all';
  title?: string;
};

export function AccountAvatarUploader({ audience = 'all', title = 'Profile photo' }: AccountAvatarUploaderProps) {
  const { user, profile, refreshProfile } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      const { error: profileError } = await (supabase as any).from('profiles').upsert(
        {
          user_id: user.id,
          email: user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      if (profileError) throw profileError;

      await refreshProfile();
      toast.success('Profile photo updated');
    } catch (err: any) {
      toast.error(err.message || 'Could not update profile photo');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 font-semibold text-foreground">{title}</h3>
      <div className="flex items-center gap-4">
        <AvatarWithOverlay
          audience={audience}
          src={profile?.avatar_url || undefined}
          alt={profile?.full_name || 'User'}
          fallback={profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          className="h-20 w-20 rounded-full ring-2 ring-primary/20"
          fallbackClassName="bg-primary text-primary-foreground text-2xl font-bold"
        />
        <div className="min-w-0 flex-1">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
          <Button type="button" variant="outline" className="min-h-[44px] gap-2" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {uploading ? 'Uploading…' : 'Change avatar'}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, WEBP, or SVG. Max 5MB.</p>
        </div>
      </div>
    </div>
  );
}