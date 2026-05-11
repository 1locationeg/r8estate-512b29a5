import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Upload, ArrowLeft, ExternalLink, User as UserIcon } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { generateAvatar } from '@/lib/avatarUtils';
import { toast } from 'sonner';

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(80, 'Name must be 80 characters or less');

const ProfessionalSettings = () => {
  const { t } = useTranslation();
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setAvatarUrl(profile.avatar_url ?? null);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('professional.settings.img_required'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('professional.settings.img_too_big'));
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true, contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success(t('professional.settings.uploaded'));
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const parsed = nameSchema.safeParse(fullName);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: parsed.data, avatar_url: avatarUrl })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success(t('professional.settings.saved'));
    } catch (err: any) {
      toast.error(err.message || t('professional.settings.save_failed'));
    } finally {
      setSaving(false);
    }
  };

  const previewAvatar = avatarUrl || generateAvatar(fullName || 'Pro', 'developer');

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userMode="buyers"
        onSwitchToBusinessView={() => {}}
        onSwitchToBuyerView={() => {}}
        togglePulse={false}
        onSignOut={() => {}}
        getDashboardRoute={() => '/pro-dashboard'}
      />

      <div className="max-w-[760px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6 gap-3">
          <Link to="/pro-dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground min-h-[44px]">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('professional.settings.back')}
          </Link>
          <Button variant="outline" size="sm" className="gap-1.5 min-h-[44px]" onClick={() => {
            const name = profile?.full_name || user?.email?.split('@')[0] || 'ahmed-hassan';
            const slug = name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') || 'ahmed-hassan';
            navigate(`/pro/${slug}`);
          }}>
            <ExternalLink className="w-4 h-4" /> {t('professional.settings.view_trust')}
          </Button>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{t('professional.settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('professional.settings.sub')}</p>
        </header>

        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-6">
          {/* Avatar */}
          <section>
            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{t('professional.settings.avatar')}</Label>
            <div className="mt-3 flex items-center gap-4">
              <Avatar className="h-20 w-20 rounded-2xl border-2 border-border ring-2 ring-[hsl(var(--professionals)/0.4)]">
                <AvatarImage src={previewAvatar} alt={fullName || 'You'} className="rounded-2xl" />
                <AvatarFallback className="rounded-2xl bg-[hsl(var(--professionals)/0.15)] text-[hsl(var(--professionals))] font-bold">
                  <UserIcon className="w-7 h-7" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatar}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 min-h-[44px]"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? t('professional.settings.uploading') : t('professional.settings.upload')}
                </Button>
                <p className="text-[11px] text-muted-foreground mt-2">{t('professional.settings.avatar_hint')}</p>
              </div>
            </div>
          </section>

          {/* Name */}
          <section>
            <Label htmlFor="full-name" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
              {t('professional.settings.name')}
            </Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={80}
              placeholder={t('professional.settings.name_ph')}
              className="mt-2 min-h-[44px]"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">{t('professional.settings.name_hint')}</p>
          </section>

          {/* Email — read-only */}
          <section>
            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">{t('professional.settings.email')}</Label>
            <Input value={user.email ?? ''} disabled className="mt-2 min-h-[44px] bg-muted/40" />
          </section>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end border-t border-border">
            <Button variant="outline" size="sm" className="min-h-[44px]" onClick={() => navigate(-1)}>
              {t('professional.settings.cancel')}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 min-h-[44px] bg-[hsl(var(--professionals))] hover:bg-[hsl(var(--professionals)/0.9)] text-[hsl(var(--professionals-foreground))]"
              disabled={saving}
              onClick={handleSave}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('professional.settings.save')}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfessionalSettings;
