import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Star, Shield, MapPin, Clock, Briefcase, Languages, Share2, Heart, UserPlus,
  Phone, Mail, Building2, Award, GraduationCap, Sparkles, BadgeCheck, ThumbsUp,
  Linkedin, Instagram, Youtube, Facebook, Globe, ChevronRight, MessageCircle,
  ShieldCheck, Wallet, HeartHandshake, Crown, Zap, FileCheck, Trophy, Bot, Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { generateAvatar } from '@/lib/avatarUtils';
import { toast } from 'sonner';
import { getMockProfessional, type ProfessionalProfile } from '@/data/mockProfessionals';
import { useAuth } from '@/contexts/AuthContext';
import { useProfessionalPage } from '@/hooks/useProfessionalPage';
import { EditableField } from '@/components/professional-edit/EditableField';
import { CoverEditor } from '@/components/professional-edit/CoverEditor';
import { CustomSections } from '@/components/professional-edit/CustomSections';

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin, instagram: Instagram, youtube: Youtube,
  facebook: Facebook, tiktok: MessageCircle, x: MessageCircle, website: Globe,
};

const SECTION_IDS = ['about', 'experience', 'reviews', 'skills', 'portfolio', 'certificates', 'faq'] as const;

const Stars = ({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' | 'lg' }) => {
  const cls = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${cls} ${i <= Math.round(value) ? 'text-accent fill-accent' : 'text-muted'}`} />
      ))}
    </div>
  );
};

// Animated SVG trust ring
const TrustRing = ({ score, size = 92, label }: { score: number; size?: number; label: string }) => {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-[hsl(var(--professionals)/0.25)] blur-xl animate-pulse" />
      <svg width={size} height={size} className="relative -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeOpacity="0.3" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="hsl(var(--professionals))" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-[hsl(var(--professionals))] leading-none">{score}</span>
        <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--professionals))]/80 font-bold">{label}</span>
      </div>
    </div>
  );
};

const Sparkline = ({ values, color = 'hsl(var(--professionals))' }: { values: number[]; color?: string }) => {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 60, h = 18;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-90">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StatTile = ({ icon: Icon, value, label, spark, color = 'professionals' }: {
  icon: React.ComponentType<{ className?: string }>; value: string; label: string;
  spark?: number[]; color?: 'professionals' | 'accent' | 'primary' | 'verified';
}) => (
  <div className="relative p-3 md:p-4 rounded-xl bg-card border border-border hover:border-[hsl(var(--professionals)/0.4)] transition-colors overflow-hidden">
    <div className={`absolute -top-6 -end-6 w-16 h-16 rounded-full bg-[hsl(var(--${color})/0.12)] blur-xl`} />
    <div className="relative flex items-center justify-between mb-1.5">
      <Icon className={`w-4 h-4 text-[hsl(var(--${color}))]`} />
      {spark && <Sparkline values={spark} color={`hsl(var(--${color}))`} />}
    </div>
    <div className="relative">
      <div className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
    </div>
  </div>
);

const BENEFIT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: ShieldCheck, wallet: Wallet, heart: HeartHandshake, crown: Crown, zap: Zap, file: FileCheck,
};

const ProfessionalProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { profile, accountKind } = useAuth();
  const { slug = 'ahmed-hassan' } = useParams();
  // Build the signed-in professional's own slug from their account name so the
  // public Trust Page URL always reflects "the link is the name of the account".
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  const ownerSlug = useMemo(() => {
    if (accountKind !== 'professional') return null;
    const name = profile?.full_name?.trim();
    return name ? slugify(name) || null : null;
  }, [profile?.full_name, accountKind]);
  // Fall back to the default template so any slug (e.g. a freshly signed-up
  // professional whose page hasn't been authored yet) still renders rather
  // than 404'ing. Real identity is overlaid below.
  const basePro = useMemo(
    () => getMockProfessional(slug) ?? getMockProfessional('ahmed-hassan'),
    [slug],
  );
  const { isOwner, data: pageData, save, uploadCover, upsertSection, removeSection } = useProfessionalPage();
  // Overlay the signed-in professional's identity on top of the mock template
  const pro: ProfessionalProfile | null = useMemo(() => {
    if (!basePro) return null;
    const merged: ProfessionalProfile = { ...basePro, slug };
    if (accountKind === 'professional' && profile?.full_name) {
      merged.name = profile.full_name;
      merged.avatar = profile.avatar_url ?? basePro.avatar;
    }
    if (pageData) {
      if (pageData.headline) merged.headline = pageData.headline;
      if (pageData.bio) merged.bio = pageData.bio;
      if (pageData.location) merged.location = pageData.location;
      if (pageData.languages && pageData.languages.length) merged.languages = pageData.languages;
    }
    return merged;
  }, [basePro, profile, accountKind, pageData, slug]);
  const [activeSection, setActiveSection] = useState('about');
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [bioOpen, setBioOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Sync HTML dir with current language so the Trust Page mirrors correctly in Arabic.
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  const sections = useMemo(
    () => SECTION_IDS.map((id) => ({ id, label: t(`professional.profile.sections.${id}`) })),
    [t, i18n.language],
  );

  // Rotate emotional quotes
  useEffect(() => {
    if (!pro) return;
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % Math.min(pro.reviews.length, 3)), 5000);
    return () => clearInterval(t);
  }, [pro]);

  if (!pro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('professional.profile.not_found_title')}</h1>
          <p className="text-muted-foreground mb-4">{t('professional.profile.not_found_desc', { slug })}</p>
          <Link to="/" className="text-[hsl(var(--professionals))] underline">{t('professional.profile.return_home')}</Link>
        </div>
      </div>
    );
  }

  // If the signed-in pro lands on someone else's (or a template) slug, push
  // them to their own canonical /pro/<their-name> URL so share/copy is correct.
  if (ownerSlug && ownerSlug !== slug) {
    return <Navigate to={`/pro/${ownerSlug}`} replace />;
  }

  const handleShare = async () => {
    const shareSlug = ownerSlug ?? pro.slug;
    const url = `${window.location.origin}/pro/${shareSlug}`;
    try { await navigator.clipboard.writeText(url); toast.success(t('professional.profile.share_copied')); }
    catch { toast.error(t('professional.profile.share_failed')); }
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalReviews = pro.ratingBreakdown.reduce((s, r) => s + r.count, 0) || 1;

  // Derived benefits — 6 icon tiles
  const benefits = [
    { key: 'shield', title: t('professional.profile.benefits.shield_title'), desc: t('professional.profile.benefits.shield_desc') },
    { key: 'wallet', title: t('professional.profile.benefits.wallet_title'), desc: t('professional.profile.benefits.wallet_desc') },
    { key: 'heart', title: t('professional.profile.benefits.heart_title'), desc: t('professional.profile.benefits.heart_desc') },
    { key: 'crown', title: t('professional.profile.benefits.crown_title'), desc: t('professional.profile.benefits.crown_desc') },
    { key: 'zap', title: t('professional.profile.benefits.zap_title'), desc: t('professional.profile.benefits.zap_desc', { time: pro.responseTime }) },
    { key: 'file', title: t('professional.profile.benefits.file_title'), desc: t('professional.profile.benefits.file_desc') },
  ];

  const topQuote = pro.reviews[quoteIdx];
  const visibleReviews = showAllReviews ? pro.reviews : pro.reviews.slice(0, 2);
  const firstSentence = pro.bio.split(/(?<=[.!?])\s+/)[0];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="emerald-mode min-h-screen bg-background overflow-x-hidden">
        <Navbar
          userMode="buyers"
          onSwitchToBusinessView={() => {}}
          onSwitchToBuyerView={() => {}}
          togglePulse={false}
          onSignOut={() => {}}
          getDashboardRoute={() => '/buyer'}
        />

        {/* HERO — Navy → Professionals gradient + AI mesh */}
        <header className="relative">
          <div
            className="relative h-44 md:h-60 w-full overflow-hidden"
            style={{
              background: pageData?.cover_url
                ? undefined
                : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 35%, hsl(var(--professionals)) 100%)',
            }}
          >
            {pageData?.cover_url && (
              <>
                <img
                  src={pageData.cover_url}
                  alt="Cover"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent" />
              </>
            )}
            {isOwner && <CoverEditor onUpload={uploadCover} />}
            {/* AI mesh */}
            <div className="absolute inset-0 opacity-60"
              style={{
                background: `radial-gradient(circle at 20% 30%, hsl(var(--professionals)/0.55), transparent 45%),
                             radial-gradient(circle at 80% 60%, hsl(var(--accent)/0.35), transparent 40%),
                             radial-gradient(circle at 50% 100%, hsl(var(--professionals)/0.4), transparent 50%)`
              }}
            />
            <div className="absolute top-6 right-10 w-32 h-32 rounded-full bg-[hsl(var(--accent)/0.25)] blur-3xl animate-pulse" />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
          </div>

          <div className="max-w-[1100px] mx-auto px-4 md:px-6 -mt-8 md:-mt-10 relative">
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-4 md:p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
                {/* Avatar with glow + tier badge */}
                <div className="flex-shrink-0 relative">
                  <div className="absolute inset-0 rounded-2xl bg-[hsl(var(--professionals)/0.4)] blur-2xl animate-pulse" />
                  <Avatar className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-card ring-2 ring-[hsl(var(--professionals))]">
                    <AvatarImage src={pro.avatar || generateAvatar(pro.name, 'developer')} alt={pro.name} className="rounded-2xl" />
                    <AvatarFallback className="rounded-2xl bg-[hsl(var(--professionals)/0.15)] text-[hsl(var(--professionals))] text-3xl font-bold">
                      {pro.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* tier badge floating */}
                  <div className="absolute -bottom-2 -end-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-accent-foreground shadow-lg border-2 border-card">
                    <Crown className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{pro.tier.name}</span>
                  </div>
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{pro.name}</h1>
                    {pro.verified && (
                      <span className="relative inline-flex items-center gap-1 px-2 py-0.5 bg-verified/10 border border-verified rounded-full overflow-hidden">
                        <span className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        <Shield className="w-3.5 h-3.5 text-verified fill-verified relative" />
                        <span className="text-[10px] font-bold text-verified-foreground relative">{t('professional.profile.verified_pro')}</span>
                      </span>
                    )}
                    <span className="ms-auto"><LanguageSwitcher /></span>
                  </div>
                  {isOwner ? (
                    <div className="mb-3 pe-7">
                      <EditableField
                        value={pro.headline}
                        onSave={(v) => save({ headline: v || null })}
                        placeholder={t('professional.profile.editable.headline_ph')}
                        label={t('professional.profile.editable.headline_label')}
                      >
                        <p className="text-sm text-muted-foreground line-clamp-1">{pro.headline}</p>
                      </EditableField>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{pro.headline}</p>
                  )}

                  {/* Big-impact metric strip */}
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <div className="inline-flex items-center gap-1.5">
                      <Stars value={pro.rating} size="md" />
                      <span className="text-base font-extrabold text-foreground">{pro.rating.toFixed(1)}</span>
                      <span className="text-[11px] text-muted-foreground">({pro.reviewCount})</span>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-border" />
                    <div className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[hsl(var(--professionals))]" />
                      <span className="text-base font-extrabold text-[hsl(var(--professionals))]">{pro.trustScore}</span>
                      <span className="text-[11px] text-muted-foreground">{t('professional.profile.trust_short')}</span>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-border" />
                    <div className="inline-flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-foreground" />
                      <span className="text-base font-extrabold text-foreground">{pro.dealsClosed}</span>
                      <span className="text-[11px] text-muted-foreground">{t('professional.profile.deals_short')}</span>
                    </div>
                    <div className="hidden md:block w-px h-6 bg-border" />
                    <div className="inline-flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-foreground" />
                      <span className="text-base font-extrabold text-foreground">{pro.yearsExperience}{t('professional.profile.years_suffix')}</span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex md:flex-col gap-2 md:items-end">
                  <Button size="sm" className="gap-1.5 bg-[hsl(var(--professionals))] hover:bg-[hsl(var(--professionals)/0.9)] text-[hsl(var(--professionals-foreground))] shadow-lg shadow-[hsl(var(--professionals)/0.3)] flex-1 md:flex-none min-h-[44px]">
                    <Phone className="w-4 h-4" /> {t('professional.profile.contact')}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1 md:flex-none min-h-[44px]">
                    <Mail className="w-4 h-4" /> {t('professional.profile.message')}
                  </Button>
                  <div className="flex gap-1">
                    <Tooltip><TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-9 w-9 min-h-[44px] min-w-[44px]" onClick={handleShare}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger><TooltipContent>{t('professional.profile.share_tooltip')}</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-9 w-9 min-h-[44px] min-w-[44px]">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger><TooltipContent>{t('professional.profile.save_tooltip')}</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-9 w-9 min-h-[44px] min-w-[44px]">
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger><TooltipContent>{t('professional.profile.refer_tooltip')}</TooltipContent></Tooltip>
                  </div>
                </div>
              </div>

              {/* Gold ribbon — top % */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent/20 via-accent/30 to-accent/20 border border-accent/40">
                  <Trophy className="w-4 h-4 text-accent-foreground" />
                  <span className="text-xs font-bold text-accent-foreground">{t('professional.profile.top_in', { city: pro.location.split(',')[0], year: 2024 })}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {isOwner ? (
                      <EditableField
                        value={pro.location}
                        onSave={(v) => save({ location: v || null })}
                        placeholder={t('professional.profile.editable.location_ph')}
                        label={t('professional.profile.editable.location_label')}
                      >
                        <span>{pro.location}</span>
                      </EditableField>
                    ) : (
                      pro.location
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{t('professional.profile.replies_in', { time: pro.responseTime })}</span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <Languages className="w-3 h-3" />
                    {isOwner ? (
                      <EditableField
                        value={pro.languages.join(', ')}
                        onSave={(v) =>
                          save({
                            languages: v
                              ? v.split(',').map((s) => s.trim()).filter(Boolean)
                              : null,
                          })
                        }
                        placeholder={t('professional.profile.editable.languages_ph')}
                        label={t('professional.profile.editable.languages_label')}
                      >
                        <span>{pro.languages.join(' · ')}</span>
                      </EditableField>
                    ) : (
                      pro.languages.join(' · ')
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Sub-nav */}
        <nav className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border mt-6">
          <div className="max-w-[1100px] mx-auto px-4 md:px-6 overflow-x-auto">
            <ul className="flex items-center gap-1 py-2 min-w-max">
              {sections.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollTo(s.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors min-h-[44px] md:min-h-0 ${
                      activeSection === s.id
                        ? 'bg-[hsl(var(--professionals)/0.12)] text-[hsl(var(--professionals))]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* TRUST AT A GLANCE — 4 visual tiles */}
        <section className="max-w-[1100px] mx-auto px-4 md:px-6 pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatTile icon={Star} value={pro.rating.toFixed(1)} label={t('professional.profile.stats.rating')} spark={[4.6, 4.7, 4.7, 4.8, 4.9, 4.9]} color="accent" />
            <StatTile icon={ShieldCheck} value={String(pro.trustScore)} label={t('professional.profile.stats.trust')} spark={[78, 82, 85, 88, 91, 94]} color="professionals" />
            <StatTile icon={HeartHandshake} value={String(pro.dealsClosed)} label={t('professional.profile.stats.deals')} spark={[60, 78, 95, 110, 128, 142]} color="primary" />
            <StatTile icon={Zap} value={pro.responseTime} label={t('professional.profile.stats.replies')} spark={[6, 5, 4, 3, 3, 2]} color="verified" />
          </div>
        </section>

        {/* WHY BUYERS PICK — 6 icon benefit tiles */}
        <section className="max-w-[1100px] mx-auto px-4 md:px-6 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[hsl(var(--professionals))]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{t('professional.profile.why_pick', { name: pro.name.split(' ')[0] })}</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {benefits.map(b => {
              const Icon = BENEFIT_ICONS[b.key];
              return (
                <Tooltip key={b.key}>
                  <TooltipTrigger asChild>
                    <button className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-[hsl(var(--professionals)/0.5)] hover:bg-[hsl(var(--professionals)/0.04)] transition-all min-h-[88px]">
                      <div className="w-9 h-9 rounded-lg bg-[hsl(var(--professionals)/0.12)] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-4.5 h-4.5 text-[hsl(var(--professionals))]" />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{b.title}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px] text-xs">{b.desc}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </section>

        {/* EMOTIONAL QUOTE STRIP — gold */}
        <section className="max-w-[1100px] mx-auto px-4 md:px-6 pt-6">
          <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 border border-accent/40"
            style={{ background: 'linear-gradient(135deg, hsl(var(--accent)/0.18), hsl(var(--accent)/0.08) 60%, hsl(var(--professionals)/0.12))' }}
          >
            <Quote className="absolute -top-2 -start-2 w-20 h-20 text-accent/20" />
            <div className="relative flex items-start gap-3">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-accent/20 items-center justify-center shrink-0">
                <Quote className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base md:text-lg font-bold text-foreground leading-snug" key={topQuote.id}>
                  "{topQuote.title}"
                </p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <Stars value={topQuote.rating} />
                  <span className="text-xs font-semibold text-foreground">{topQuote.author}</span>
                  <span className="text-[11px] text-muted-foreground">· {topQuote.dealType}</span>
                  {topQuote.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-verified-foreground">
                      <BadgeCheck className="w-3 h-3 text-verified" /> {t('professional.profile.verified_deal')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* dots */}
            <div className="absolute bottom-3 end-4 flex gap-1">
              {pro.reviews.slice(0, 3).map((_, i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === quoteIdx ? 'bg-[hsl(var(--professionals))] w-4' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* BODY */}
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 min-w-0">
            {/* About — compressed */}
            <section id="about" className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{t('professional.profile.about_title')}</h2>
                {isOwner && (
                  <EditableField
                    value={pro.bio}
                    onSave={(v) => save({ bio: v || null })}
                    multiline
                    placeholder={t('professional.profile.editable.bio_ph')}
                    label={t('professional.profile.editable.bio_label')}
                  >
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[hsl(var(--professionals))] cursor-pointer">{t('professional.profile.edit')}</span>
                  </EditableField>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
                {bioOpen ? pro.bio : firstSentence}
                {pro.bio.length > firstSentence.length && (
                  <button onClick={() => setBioOpen(o => !o)} className="ms-1 text-[hsl(var(--professionals))] font-semibold hover:underline">
                    {bioOpen ? t('professional.profile.less') : t('professional.profile.read_more')}
                  </button>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pro.specialties.map(s => (
                  <Badge key={s} variant="secondary" className="text-[11px] font-medium bg-[hsl(var(--professionals)/0.08)] text-[hsl(var(--professionals))] border-0">
                    {s}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Experience — compressed timeline */}
            <section id="experience" className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">{t('professional.profile.sections.experience')}</h2>
              <ol className="relative ms-2 space-y-4 border-s-2 border-[hsl(var(--professionals)/0.2)] ps-5">
                {pro.experience.map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-[25px] top-1 w-3.5 h-3.5 rounded-full bg-[hsl(var(--professionals))] ring-4 ring-card shadow" />
                    <div className="flex items-baseline justify-between flex-wrap gap-2">
                      <h3 className="text-sm font-bold text-foreground">{e.role}</h3>
                      <span className="text-[10px] text-muted-foreground font-medium">{e.start} – {e.end ?? t('professional.profile.present')}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] mt-1 mb-2 border-[hsl(var(--professionals)/0.3)] text-[hsl(var(--professionals))]">
                      {e.company}
                    </Badge>
                    <ul className="space-y-1">
                      {e.highlights.slice(0, 2).map((h, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex gap-1.5">
                          <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-[hsl(var(--professionals))]" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>

            {/* Reviews */}
            <section id="reviews" className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{t('professional.profile.sections.reviews')}</h2>
                <Button size="sm" variant="outline" className="gap-1.5 min-h-[44px]">
                  <Star className="w-3.5 h-3.5" /> {t('professional.profile.write_review')}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--professionals)/0.06)] to-accent/5 border border-border">
                <div className="text-center sm:text-start">
                  <div className="text-4xl font-extrabold text-foreground leading-none">{pro.rating.toFixed(1)}</div>
                  <Stars value={pro.rating} size="md" />
                  <p className="text-[11px] text-muted-foreground mt-1">{t('professional.profile.verified_count', { count: pro.reviewCount })}</p>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  {pro.ratingBreakdown.map(rb => (
                    <div key={rb.stars} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted-foreground font-semibold">{rb.stars}</span>
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <Progress value={(rb.count / totalReviews) * 100} className="h-1.5 flex-1" />
                      <span className="w-8 text-end text-muted-foreground">{rb.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {visibleReviews.map(r => (
                  <article key={r.id} className="p-4 rounded-lg border border-border hover:border-[hsl(var(--professionals)/0.4)] transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">{r.author}</h4>
                          {r.verified && <BadgeCheck className="w-3.5 h-3.5 text-verified" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{r.authorRole} · {r.dealType}</p>
                      </div>
                      <div className="text-end">
                        <Stars value={r.rating} />
                        <p className="text-[10px] text-muted-foreground mt-0.5">{r.date}</p>
                      </div>
                    </div>
                    <h5 className="text-sm font-semibold text-foreground mb-1">{r.title}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{r.body}</p>
                  </article>
                ))}
                {pro.reviews.length > 2 && (
                  <button onClick={() => setShowAllReviews(s => !s)} className="w-full text-center text-xs font-semibold text-[hsl(var(--professionals))] py-2 hover:underline min-h-[44px]">
                    {showAllReviews ? t('professional.profile.show_less') : t('professional.profile.show_all', { count: pro.reviews.length })}
                  </button>
                )}
              </div>
            </section>

            {/* Skills — compact grid */}
            <section id="skills" className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">{t('professional.profile.sections.skills')}</h2>
              <div className="flex flex-wrap gap-2">
                {pro.skills.map(s => (
                  <div key={s.name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border hover:border-[hsl(var(--professionals)/0.4)] transition-colors">
                    <span className="text-xs font-medium text-foreground">{s.name}</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[hsl(var(--professionals))]">
                      <ThumbsUp className="w-2.5 h-2.5" /> {s.endorsements}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Portfolio */}
            <section id="portfolio" className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">{t('professional.profile.recent_deals')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {pro.portfolio.map((p, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border hover:border-[hsl(var(--professionals)/0.4)] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-[hsl(var(--professionals))] uppercase tracking-wide">{p.type}</span>
                      <span className="text-[10px] text-muted-foreground">{p.year}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground truncate">{p.title}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{p.developer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Certificates + Education combined */}
            <section id="certificates" className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">{t('professional.profile.credentials')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pro.certificates.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-border">
                    <Award className="w-4 h-4 text-[hsl(var(--professionals))] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-foreground truncate">{c.name}</h4>
                        {c.verified && <BadgeCheck className="w-3 h-3 text-verified shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{c.issuer} · {c.year}</p>
                    </div>
                  </div>
                ))}
                {pro.education.map((e, i) => (
                  <div key={`ed-${i}`} className="flex items-start gap-2 p-2.5 rounded-lg border border-border">
                    <GraduationCap className="w-4 h-4 text-[hsl(var(--professionals))] shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-foreground truncate">{e.school}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{e.degree} · {e.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">{t('professional.profile.sections.faq')}</h2>
              <div className="space-y-2">
                {pro.faqs.map((f, i) => (
                  <details key={i} className="group rounded-lg border border-border p-3 hover:border-[hsl(var(--professionals)/0.4)] transition-colors">
                    <summary className="cursor-pointer text-sm font-semibold text-foreground list-none flex items-center justify-between gap-2">
                      {f.q}
                      <ChevronRight className="w-4 h-4 text-[hsl(var(--professionals))] transition-transform group-open:rotate-90 shrink-0" />
                    </summary>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Custom sections (owner-editable) */}
            <CustomSections
              sections={pageData?.sections ?? []}
              isOwner={isOwner}
              onUpsert={upsertSection}
              onRemove={removeSection}
            />
          </div>

          {/* RIGHT RAIL */}
          <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start min-w-0">
            {/* Trust Score donut card */}
            <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-5 text-center">
              <div className="absolute inset-0 opacity-50"
                style={{ background: 'radial-gradient(circle at 50% 0%, hsl(var(--professionals)/0.18), transparent 60%)' }}
              />
              <div className="relative flex flex-col items-center">
                <TrustRing score={pro.trustScore} size={104} label={t('professional.profile.trust_ring_label')} />
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-verified/10 text-[10px] font-bold text-verified-foreground border border-verified/40">
                    <Shield className="w-3 h-3 text-verified" /> {t('professional.profile.trust_chips.verified')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(var(--professionals)/0.1)] text-[10px] font-bold text-[hsl(var(--professionals))] border border-[hsl(var(--professionals)/0.3)]">
                    <Zap className="w-3 h-3" /> {t('professional.profile.trust_chips.top_responder')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-[10px] font-bold text-accent-foreground border border-accent/40">
                    <Crown className="w-3 h-3" /> {t('professional.profile.trust_chips.elite')}
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky quick contact */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <Button size="sm" className="w-full gap-1.5 bg-[hsl(var(--professionals))] hover:bg-[hsl(var(--professionals)/0.9)] text-[hsl(var(--professionals-foreground))] min-h-[44px]">
                <Phone className="w-4 h-4" /> {t('professional.profile.request_call')}
              </Button>
              <Button size="sm" variant="outline" className="w-full gap-1.5 min-h-[44px]">
                <Mail className="w-4 h-4" /> {t('professional.profile.send_message')}
              </Button>
            </div>

            {/* Affiliation */}
            {pro.affiliation && (
              <Link to={pro.affiliation.slug ? `/entity/${pro.affiliation.slug}` : '#'} className="block bg-card border border-border rounded-2xl p-4 hover:border-[hsl(var(--professionals)/0.4)] transition-colors">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">{t('professional.profile.currently_at')}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--professionals)/0.15)] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-[hsl(var(--professionals))]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{pro.affiliation.company}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{pro.affiliation.role}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            )}

            {/* Verified socials — compact icon row */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">{t('professional.profile.verified_socials')}</p>
              <div className="flex flex-wrap gap-2">
                {pro.socials.map((s, i) => {
                  const Icon = SOCIAL_ICONS[s.platform] ?? Globe;
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          className="relative w-10 h-10 rounded-lg bg-muted/40 hover:bg-[hsl(var(--professionals)/0.12)] flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                        >
                          <Icon className="w-4 h-4 text-[hsl(var(--professionals))]" />
                          {s.verified && (
                            <BadgeCheck className="absolute -top-1 -end-1 w-3.5 h-3.5 text-verified bg-card rounded-full" />
                          )}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        {s.handle}{s.followers ? ` · ${s.followers.toLocaleString()}` : ''}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* AI Insight card */}
            <div className="relative overflow-hidden rounded-2xl p-4 border border-[hsl(var(--professionals)/0.4)]"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--professionals)) 100%)' }}
            >
              <div className="absolute inset-0 opacity-40"
                style={{ background: 'radial-gradient(circle at 70% 20%, hsl(var(--accent)/0.4), transparent 50%)' }}
              />
              <Sparkles className="absolute top-2 end-2 w-3 h-3 text-white/60 animate-pulse" />
              <Sparkles className="absolute bottom-3 end-8 w-2 h-2 text-white/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="relative flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-white/70 font-bold">{t('professional.profile.ai_insight')}</p>
                  <p className="text-xs font-semibold text-white leading-snug mt-0.5">
                    {t('professional.profile.ai_insight_pre')}
                    <span className="font-extrabold text-accent">{t('professional.profile.ai_insight_highlight')}</span>
                    {t('professional.profile.ai_insight_post', { city: pro.location.split(',')[0] })}
                  </p>
                </div>
              </div>
            </div>

            {/* Refer */}
            <div className="bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/40 rounded-2xl p-4 text-center">
              <UserPlus className="w-5 h-5 text-accent-foreground mx-auto mb-1.5" />
              <p className="text-xs font-bold text-foreground mb-2">{t('professional.profile.refer_card')}</p>
              <Button size="sm" variant="outline" className="w-full gap-1.5 min-h-[44px] border-accent/40" onClick={handleShare}>
                <Share2 className="w-3.5 h-3.5" /> {t('professional.profile.share_trust_page')}
              </Button>
            </div>
          </aside>
        </div>

        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default ProfessionalProfilePage;
