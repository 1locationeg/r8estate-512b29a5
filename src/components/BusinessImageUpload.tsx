import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessImageUploadProps {
  businessId: string;
  type: 'logo' | 'cover';
  currentUrl?: string;
  onUploaded: (url: string) => void;
  className?: string;
}

export const BusinessImageUpload = ({
  businessId,
  type,
  currentUrl,
  onUploaded,
  className,
}: BusinessImageUploadProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setIsUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${businessId}/${type}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('business-images')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to upload image');
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('business-images')
      .getPublicUrl(path);

    const column = type === 'logo' ? 'logo_url' : 'cover_image_url';
    const { error: updateError } = await supabase
      .from('business_profiles')
      .update({ [column]: urlData.publicUrl })
      .eq('id', businessId);

    if (updateError) {
      console.error('Update error:', updateError);
      toast.error('Failed to save image');
    } else {
      toast.success(`${type === 'logo' ? 'Profile' : 'Cover'} image updated`);
      onUploaded(urlData.publicUrl);
    }
    setIsUploading(false);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-background transition-colors',
          type === 'logo' ? 'w-8 h-8' : 'px-3 py-1.5 gap-1.5 text-xs font-medium',
          className,
        )}
        title={`Change ${type === 'logo' ? 'profile' : 'cover'} image`}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <>
            <Camera className="w-4 h-4 text-foreground" />
            {type === 'cover' && <span className="text-foreground">Edit Cover</span>}
          </>
        )}
      </button>
    </>
  );
};
