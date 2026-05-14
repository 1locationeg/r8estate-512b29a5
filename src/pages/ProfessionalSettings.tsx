import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Upload, ArrowLeft, ExternalLink, User as UserIcon, ImageIcon, Trash2 } from 'lucide-react';
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
import { useProfessionalPage } from '@/hooks/useProfessionalPage';

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
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverBoxRef = useRef<HTMLDivElement>(null);
  const [coverSize, setCoverSize] = useState<{ w: number | null; h: number }>({ w: null, h: 220 });
  const dragStateRef = useRef<{ axis: 'x' | 'y' | 'xy'; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const { data: pageData, uploadCover, save: savePage } = useProfessionalPage();

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

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (coverInputRef.current) coverInputRef.current.value = '';
    if (!file) return;
    setCoverUploading(true);
    try {
      await uploadCover(file);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    setCoverUploading(true);
    try {
      await savePage({ cover_url: null });
      toast.success(t('professional.settings.saved'));
    } finally {
      setCoverUploading(false);
    }
  };

  const beginResize = (axis: 'x' | 'y' | 'xy') => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const box = coverBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    dragStateRef.current = {
      axis,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const s = dragStateRef.current;
      if (!s) return;
      const parent = box.parentElement;
      const maxW = parent ? parent.getBoundingClientRect().width : rect.width;
      const dx = ev.clientX - s.startX;
      const dy = ev.clientY - s.startY;
      setCoverSize((prev) => ({
        w: s.axis === 'y' ? prev.w : Math.max(240, Math.min(maxW, s.startW + dx)),
        h: s.axis === 'x' ? prev.h : Math.max(80, Math.min(600, s.startH + dy)),
      }));
    };
    const onUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

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
      const freshUrl = `${data.publicUrl}?t=${Date.now()}`;
      const { error: profileErr } = await (supabase as any)
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: fullName || profile?.full_name || user.email?.split('@')[0] || null,
          avatar_url: freshUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      if (profileErr) throw profileErr;
      setAvatarUrl(freshUrl);
      await refreshProfile();
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
    <div className="emerald-mode min-h-screen bg-background">
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
          {/* Cover image */}
          <section>
            <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
              {t('professional.settings.cover', 'Cover image')}
            </Label>
            <div
              ref={coverBoxRef}
              className="mt-3 relative rounded-xl overflow-hidden border border-border bg-muted/40 select-none"
              style={{
                width: coverSize.w ? `${coverSize.w}px` : '100%',
                height: `${coverSize.h}px`,
                maxWidth: '100%',
              }}
            >
              {pageData?.cover_url ? (
                <img
                  src={pageData.cover_url}
                  alt="Trust Page cover"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 35%, hsl(var(--professionals)) 100%)',
                  }}
                />
              )}
              {!pageData?.cover_url && (
                <div className="absolute inset-0 flex items-center justify-center text-primary-foreground/80 text-xs gap-1.5 pointer-events-none">
                  <ImageIcon className="w-4 h-4" />
                  {t('professional.settings.cover_empty', 'No cover yet — recommended 1600×600')}
                </div>
              )}

              {/* Live size badge */}
              <div className="absolute top-2 start-2 px-2 py-0.5 rounded-md bg-background/85 backdrop-blur text-[10px] font-mono text-foreground border border-border pointer-events-none">
                {Math.round(coverBoxRef.current?.getBoundingClientRect().width ?? coverSize.w ?? 0)} × {Math.round(coverSize.h)}
              </div>

              {/* Right edge — width handle */}
              <div
                role="slider"
                aria-label="Resize cover width"
                onPointerDown={beginResize('x')}
                className="absolute top-0 end-0 h-full w-2 cursor-ew-resize flex items-center justify-center group"
              >
                <div className="w-1 h-10 rounded-full bg-foreground/30 group-hover:bg-primary transition-colors" />
              </div>

              {/* Bottom edge — height handle */}
              <div
                role="slider"
                aria-label="Resize cover height"
                onPointerDown={beginResize('y')}
                className="absolute bottom-0 start-0 w-full h-2 cursor-ns-resize flex items-center justify-center group"
              >
                <div className="h-1 w-10 rounded-full bg-foreground/30 group-hover:bg-primary transition-colors" />
              </div>

              {/* Bottom-right corner — both axes */}
              <div
                role="slider"
                aria-label="Resize cover"
                onPointerDown={beginResize('xy')}
                className="absolute bottom-0 end-0 w-4 h-4 cursor-nwse-resize bg-primary/80 hover:bg-primary"
                style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setCoverSize({ w: null, h: 220 })}
              className="mt-2 text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            >
              Reset size
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCover}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 min-h-[44px]"
                disabled={coverUploading}
                onClick={() => coverInputRef.current?.click()}
              >
                {coverUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {coverUploading
                  ? t('professional.settings.uploading')
                  : pageData?.cover_url
                    ? t('professional.settings.cover_replace', 'Replace cover')
                    : t('professional.settings.cover_upload', 'Upload cover')}
              </Button>
              {pageData?.cover_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 min-h-[44px] text-destructive hover:text-destructive"
                  disabled={coverUploading}
                  onClick={handleRemoveCover}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('professional.settings.cover_remove', 'Remove')}
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {t('professional.settings.cover_hint', 'Shown as the banner on your public Trust Page. Max 8MB.')}
            </p>
          </section>

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
