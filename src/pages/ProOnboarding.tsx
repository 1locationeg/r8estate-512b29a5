import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Star, Upload, MapPin, Languages as LanguagesIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useProfessionalPage } from '@/hooks/useProfessionalPage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

const identitySchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  headline: z.string().trim().min(4, 'Add a short headline').max(120),
  location: z.string().trim().max(80).optional().or(z.literal('')),
});

const storySchema = z.object({
  bio: z.string().trim().min(20, 'Tell buyers a bit more (min 20 chars)').max(800),
});

type Step = 0 | 1 | 2 | 3;
const STEPS = ['Claim', 'Identity', 'Story', 'Preview'] as const;

export default function ProOnboarding() {
  const navigate = useNavigate();
  const { user, profile, isLoading, accountKind, setAccountKind, refreshProfile } = useAuth();
  const { data: pageData, save } = useProfessionalPage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(0);
  const [claiming, setClaiming] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFullName((v) => v || profile.full_name || '');
      setAvatarUrl((v) => v || profile.avatar_url || null);
    }
  }, [profile]);
  useEffect(() => {
    if (pageData) {
      setHeadline((v) => v || pageData.headline || '');
      setLocation((v) => v || pageData.location || '');
      setLanguages((v) => v.length ? v : (pageData.languages || []));
      setBio((v) => v || pageData.bio || '');
    }
  }, [pageData]);

  // Auto-advance past Claim if already a professional.
  useEffect(() => {
    if (!isLoading && user && accountKind === 'professional' && step === 0) setStep(1);
  }, [isLoading, user, accountKind, step]);

  const slug = useMemo(() => slugify(fullName || 'your-name'), [fullName]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth?intent=claim_pro&redirect=/pro/onboarding" replace />;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const result = await setAccountKind('professional');
      if (!result) throw new Error('Could not claim');
      toast.success('Trust Page claimed ✨');
      setStep(1);
    } catch (e) {
      toast.error('Could not claim your Trust Page');
    } finally {
      setClaiming(false);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error('Image must be under 4MB'); return; }
    setAvatarUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const fresh = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').upsert({ user_id: user.id, avatar_url: fresh }, { onConflict: 'user_id' });
      setAvatarUrl(fresh);
      await refreshProfile();
      toast.success('Photo updated');
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  const validateAndAdvance = () => {
    if (step === 1) {
      const r = identitySchema.safeParse({ fullName, headline, location });
      if (!r.success) {
        const errs: Record<string, string> = {};
        r.error.issues.forEach((i) => (errs[i.path.join('.')] = i.message));
        setErrors(errs);
        return;
      }
    } else if (step === 2) {
      const r = storySchema.safeParse({ bio });
      if (!r.success) {
        const errs: Record<string, string> = {};
        r.error.issues.forEach((i) => (errs[i.path.join('.')] = i.message));
        setErrors(errs);
        return;
      }
    }
    setErrors({});
    setStep((s) => (Math.min(3, (s + 1)) as Step));
  };

  const handlePublish = async () => {
    if (!user) return;
    setPublishing(true);
    try {
      // Persist name on profile
      const trimmedName = fullName.trim();
      if (trimmedName && trimmedName !== profile?.full_name) {
        await supabase.from('profiles').upsert(
          { user_id: user.id, full_name: trimmedName },
          { onConflict: 'user_id' },
        );
      }
      await save({
        headline: headline.trim() || null,
        location: location.trim() || null,
        languages: languages.length ? languages : null,
        bio: bio.trim() || null,
      });
      await refreshProfile();
      toast.success('Your Trust Page is live 🎉');
      navigate(`/pro/${slug}`);
    } catch (e) {
      console.error(e);
      toast.error('Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const initials = (fullName || profile?.full_name || 'You').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="emerald-mode min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Stepper */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Claim your Trust Page</h1>
            <span className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1 flex items-center gap-2">
                <div className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 mt-2 text-xs text-muted-foreground">
            {STEPS.map((label, i) => (
              <span key={label} className={i === step ? 'text-foreground font-medium' : ''}>{label}</span>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-[var(--velvet-shadow,0_10px_30px_-10px_rgba(0,0,0,0.1))]">
          {step === 0 && (
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                <Sparkles className="w-3.5 h-3.5" /> R8ESTATE for Professionals
              </div>
              <h2 className="text-xl md:text-2xl font-semibold">Your reputation, finally on the map.</h2>
              <p className="text-muted-foreground">
                Claim your free Trust Page to showcase reviews, expertise, and verified deals.
                Your URL will be <span className="font-medium text-foreground">/pro/{slug}</span>.
              </p>
              <ul className="grid gap-2 text-sm">
                {['SEO-friendly profile that ranks for your name', 'Verified reviews from real buyers', 'Endorsements & verified deals', 'Free for founding members'].map((b) => (
                  <li key={b} className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> {b}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={handleClaim} disabled={claiming} size="lg">
                  {claiming ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Sparkles className="w-4 h-4 me-2" />}
                  Claim my Trust Page
                </Button>
                <Button variant="outline" asChild><Link to="/">Maybe later</Link></Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold">Your identity</h2>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}>
                    {avatarUploading ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Upload className="w-4 h-4 me-2" />}
                    Upload photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG/PNG up to 4MB</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Mohamed Mahmoud" maxLength={80} />
                  {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Your URL: <span className="font-mono">/pro/{slug}</span></p>
                </div>
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Senior Real Estate Advisor — New Cairo & North Coast" maxLength={120} />
                  {errors.headline && <p className="text-xs text-destructive mt-1">{errors.headline}</p>}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cairo, Egypt" maxLength={80} />
                </div>
                <div>
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['English', 'العربية', 'Français'].map((lng) => {
                      const active = languages.includes(lng);
                      return (
                        <button
                          key={lng}
                          type="button"
                          onClick={() => setLanguages((curr) => active ? curr.filter((l) => l !== lng) : [...curr, lng])}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${active ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-muted'}`}
                        >
                          {lng}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold">Your story</h2>
              <p className="text-sm text-muted-foreground">
                A short bio buyers see at the top of your Trust Page. Mention your areas, years of experience, and what you stand for.
              </p>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={6} maxLength={800}
                  placeholder="I help families buy off-plan in New Cairo with full price-history due diligence…" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  {errors.bio ? <span className="text-destructive">{errors.bio}</span> : <span>Min 20 characters</span>}
                  <span>{bio.length}/800</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold">Preview your trust card</h2>
              <p className="text-sm text-muted-foreground">This is what buyers will see at the top of your Trust Page.</p>
              <TrustCardPreview
                name={fullName || 'Your name'}
                headline={headline || 'Add a headline so buyers know what you do'}
                location={location}
                languages={languages}
                bio={bio}
                avatarUrl={avatarUrl}
                initials={initials}
                slug={slug}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Your page goes live at <span className="font-mono text-foreground">/pro/{slug}</span> immediately. You can refine anytime from Settings.
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        {step > 0 && (
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep((s) => (Math.max(1, s - 1) as Step))} disabled={step === 1}>
              <ArrowLeft className="w-4 h-4 me-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={validateAndAdvance}>Continue <ArrowRight className="w-4 h-4 ms-2" /></Button>
            ) : (
              <Button onClick={handlePublish} disabled={publishing} size="lg">
                {publishing ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <ExternalLink className="w-4 h-4 me-2" />}
                Publish my Trust Page
              </Button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function TrustCardPreview({ name, headline, location, languages, bio, avatarUrl, initials, slug }: {
  name: string; headline: string; location: string; languages: string[]; bio: string;
  avatarUrl: string | null; initials: string; slug: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
      <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="flex items-start gap-4 relative">
        <Avatar className="w-20 h-20 ring-2 ring-primary/30">
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold truncate">{name}</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
              <ShieldCheck className="w-3 h-3" /> Trust Page
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{headline}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            {location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>}
            {languages.length > 0 && (
              <span className="inline-flex items-center gap-1"><LanguagesIcon className="w-3 h-3" /> {languages.join(' · ')}</span>
            )}
            <span className="font-mono">/pro/{slug}</span>
          </div>
          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 text-[hsl(var(--champagne,40_35%_70%))] fill-current" />
            ))}
            <span className="text-xs text-muted-foreground ms-2">New — awaiting your first reviews</span>
          </div>
        </div>
      </div>
      {bio && <p className="text-sm text-foreground/90 mt-4 leading-relaxed line-clamp-4">{bio}</p>}
    </div>
  );
}