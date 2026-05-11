import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Shield, MapPin, Clock, Briefcase, Languages, Share2, Heart, UserPlus,
  Phone, Mail, Building2, Award, GraduationCap, Sparkles, BadgeCheck, ThumbsUp,
  Linkedin, Instagram, Youtube, Facebook, Globe, ChevronRight, MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { TrustGaugeMini } from '@/components/TrustGaugeMini';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { generateAvatar } from '@/lib/avatarUtils';
import { toast } from 'sonner';
import { getMockProfessional, type ProfessionalProfile } from '@/data/mockProfessionals';

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  tiktok: MessageCircle,
  x: MessageCircle,
  website: Globe,
};

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'skills', label: 'Skills' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'education', label: 'Education' },
  { id: 'faq', label: 'FAQ' },
];

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

const ProfessionalProfilePage = () => {
  const { slug = 'ahmed-hassan' } = useParams();
  const pro: ProfessionalProfile | null = useMemo(() => getMockProfessional(slug), [slug]);
  const [activeSection, setActiveSection] = useState('about');

  if (!pro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Professional not found</h1>
          <p className="text-muted-foreground mb-4">No Trust Page exists for "{slug}".</p>
          <Link to="/" className="text-[hsl(var(--professionals))] underline">Return home</Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/pro/${pro.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Trust Page link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalReviews = pro.ratingBreakdown.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Cover + Hero */}
      <header className="relative">
        <div
          className="h-40 md:h-56 w-full"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--professionals) / 0.85), hsl(var(--professionals) / 0.55) 60%, hsl(var(--primary) / 0.65))',
          }}
        />
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 -mt-16 md:-mt-20 relative">
          <div className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-lg backdrop-blur">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-end">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 rounded-2xl border-4 border-card ring-2 ring-[hsl(var(--professionals)/0.4)]">
                  <AvatarImage src={pro.avatar || generateAvatar(pro.name, 'developer')} alt={pro.name} className="rounded-2xl" />
                  <AvatarFallback className="rounded-2xl bg-[hsl(var(--professionals)/0.15)] text-[hsl(var(--professionals))] text-3xl font-bold">
                    {pro.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{pro.name}</h1>
                  {pro.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-verified/10 border border-verified rounded-full">
                      <Shield className="w-3.5 h-3.5 text-verified fill-verified" />
                      <span className="text-[10px] font-semibold text-verified-foreground">Verified Pro</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--professionals)/0.10)] border border-[hsl(var(--professionals)/0.35)] rounded-full">
                    <span className="text-xs">{pro.tier.emoji}</span>
                    <span className="text-[10px] font-semibold text-[hsl(var(--professionals))]">{pro.tier.name}</span>
                  </span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground mb-2">{pro.headline}</p>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-3">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{pro.location}</span>
                  <span className="inline-flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{pro.yearsExperience}+ years</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Replies in {pro.responseTime}</span>
                  <span className="inline-flex items-center gap-1.5"><Languages className="w-3.5 h-3.5" />{pro.languages.join(' · ')}</span>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                  <div className="inline-flex items-center gap-1.5">
                    <Stars value={pro.rating} size="md" />
                    <span className="text-base font-bold text-foreground">{pro.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({pro.reviewCount} reviews)</span>
                  </div>
                  <div className="hidden md:block w-px h-6 bg-border" />
                  <TrustGaugeMini score={pro.trustScore} size="sm" />
                  <div className="hidden md:block w-px h-6 bg-border" />
                  <span className="text-xs text-muted-foreground">{pro.dealsClosed} deals closed</span>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border">
              <Button size="sm" className="gap-1.5 bg-[hsl(var(--professionals))] hover:bg-[hsl(var(--professionals)/0.9)] text-[hsl(var(--professionals-foreground))]">
                <Phone className="w-4 h-4" /> Contact
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Mail className="w-4 h-4" /> Message
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handleShare}>
                <Share2 className="w-4 h-4" /> Share
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Heart className="w-4 h-4" /> Save
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5">
                <UserPlus className="w-4 h-4" /> Refer a friend
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky sub-nav */}
      <nav className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border mt-6">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 overflow-x-auto">
          <ul className="flex items-center gap-1 py-2 min-w-max">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-[44px] md:min-h-0 ${
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

      {/* Body */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* About */}
          <section id="about" className="bg-card border border-border rounded-xl p-5 md:p-6">
            <h2 className="heading-section text-lg font-bold text-foreground mb-3">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pro.bio}</p>
            <div className="flex flex-wrap gap-1.5">
              {pro.specialties.map(s => (
                <Badge key={s} variant="secondary" className="text-[11px] font-medium">{s}</Badge>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section id="experience" className="bg-card border border-border rounded-xl p-5 md:p-6">
            <h2 className="heading-section text-lg font-bold text-foreground mb-4">Experience</h2>
            <ol className="relative ms-3 space-y-5 border-s border-border ps-5">
              {pro.experience.map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -start-[27px] top-1.5 w-3 h-3 rounded-full bg-[hsl(var(--professionals))] ring-4 ring-card" />
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{e.role}</h3>
                    <span className="text-[11px] text-muted-foreground">{e.start} – {e.end ?? 'Present'}</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--professionals))] font-medium mb-2">{e.company}</p>
                  <ul className="space-y-1">
                    {e.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex gap-2">
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
          <section id="reviews" className="bg-card border border-border rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="heading-section text-lg font-bold text-foreground">Reviews</h2>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Star className="w-3.5 h-3.5" /> Write a review
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 p-4 rounded-lg bg-muted/30">
              <div className="text-center sm:text-start">
                <div className="text-3xl font-bold text-foreground">{pro.rating.toFixed(1)}</div>
                <Stars value={pro.rating} size="md" />
                <p className="text-[11px] text-muted-foreground mt-1">{pro.reviewCount} verified reviews</p>
              </div>
              <div className="sm:col-span-2 space-y-1">
                {pro.ratingBreakdown.map(rb => (
                  <div key={rb.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted-foreground">{rb.stars}</span>
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <Progress value={(rb.count / totalReviews) * 100} className="h-1.5 flex-1" />
                    <span className="w-8 text-end text-muted-foreground">{rb.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {pro.reviews.map(r => (
                <article key={r.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">{r.author}</h4>
                        {r.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-verified-foreground">
                            <BadgeCheck className="w-3 h-3 text-verified" /> Verified deal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{r.authorRole} · {r.dealType}</p>
                    </div>
                    <div className="text-end">
                      <Stars value={r.rating} />
                      <p className="text-[10px] text-muted-foreground mt-0.5">{r.date}</p>
                    </div>
                  </div>
                  <h5 className="text-sm font-medium text-foreground mb-1">{r.title}</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section id="skills" className="bg-card border border-border rounded-xl p-5 md:p-6">
            <h2 className="heading-section text-lg font-bold text-foreground mb-4">Skills & Endorsements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pro.skills.map(s => (
                <div key={s.name} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border hover:border-[hsl(var(--professionals)/0.4)] transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--professionals))] shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">{s.name}</span>
                  </div>
                  <button className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-muted hover:bg-[hsl(var(--professionals)/0.12)] hover:text-[hsl(var(--professionals))] transition-colors min-h-[32px]">
                    <ThumbsUp className="w-3 h-3" /> {s.endorsements}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio */}
          <section id="portfolio" className="bg-card border border-border rounded-xl p-5 md:p-6">
            <h2 className="heading-section text-lg font-bold text-foreground mb-4">Recent Deals & Projects</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pro.portfolio.map((p, i) => (
                <div key={i} className="p-3 rounded-lg border border-border hover:border-[hsl(var(--professionals)/0.4)] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-[hsl(var(--professionals))] uppercase tracking-wide">{p.type}</span>
                    <span className="text-[10px] text-muted-foreground">{p.year}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground truncate">{p.title}</h4>
                  <p className="text-[11px] text-muted-foreground truncate">{p.developer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Certificates */}
          <section id="certificates" className="bg-card border border-border rounded-xl p-5 md:p-6">
            <h2 className="heading-section text-lg font-bold text-foreground mb-4">Certificates & Licenses</h2>
            <ul className="space-y-3">
              {pro.certificates.map((c, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <Award className="w-5 h-5 text-[hsl(var(--professionals))] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">{c.name}</h4>
                      {c.verified && <BadgeCheck className="w-3.5 h-3.5 text-verified" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.issuer} · {c.year}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Education */}
          <section id="education" className="bg-card border border-border rounded-xl p-5 md:p-6">
            <h2 className="heading-section text-lg font-bold text-foreground mb-4">Education</h2>
            <ul className="space-y-3">
              {pro.education.map((e, i) => (
                <li key={i} className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-[hsl(var(--professionals))] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{e.school}</h4>
                    <p className="text-[11px] text-muted-foreground">{e.degree} · {e.year}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ */}
          <section id="faq" className="bg-card border border-border rounded-xl p-5 md:p-6">
            <h2 className="heading-section text-lg font-bold text-foreground mb-4">FAQ</h2>
            <div className="space-y-3">
              {pro.faqs.map((f, i) => (
                <details key={i} className="group rounded-lg border border-border p-3">
                  <summary className="cursor-pointer text-sm font-medium text-foreground list-none flex items-center justify-between gap-2">
                    {f.q}
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Right rail */}
        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start min-w-0">
          {/* Trust snapshot */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Trust Snapshot</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted/40">
                <div className="text-lg font-bold text-foreground">{pro.trustScore}</div>
                <div className="text-[10px] text-muted-foreground">Trust Score</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/40">
                <div className="text-lg font-bold text-foreground">{pro.rating.toFixed(1)}★</div>
                <div className="text-[10px] text-muted-foreground">{pro.reviewCount} reviews</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/40">
                <div className="text-lg font-bold text-foreground">{pro.dealsClosed}</div>
                <div className="text-[10px] text-muted-foreground">Deals closed</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/40">
                <div className="text-lg font-bold text-foreground">{pro.responseTime}</div>
                <div className="text-[10px] text-muted-foreground">Avg response</div>
              </div>
            </div>
            {pro.awards.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {pro.awards.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Award className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.issuer} · {a.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified socials */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Verified Socials</h3>
            <ul className="space-y-2">
              {pro.socials.map((s, i) => {
                const Icon = SOCIAL_ICONS[s.platform] ?? Globe;
                return (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                    >
                      <Icon className="w-4 h-4 text-[hsl(var(--professionals))] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-foreground truncate">{s.handle}</span>
                          {s.verified && <BadgeCheck className="w-3 h-3 text-verified shrink-0" />}
                        </div>
                        {s.followers !== undefined && (
                          <p className="text-[10px] text-muted-foreground">{s.followers.toLocaleString()} followers</p>
                        )}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Affiliation */}
          {pro.affiliation && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Currently at</h3>
              <Link to={pro.affiliation.slug ? `/entity/${pro.affiliation.slug}` : '#'} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--professionals)/0.15)] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[hsl(var(--professionals))]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{pro.affiliation.company}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{pro.affiliation.role}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          )}

          {/* Hire CTA */}
          <div
            className="rounded-xl p-5 text-[hsl(var(--professionals-foreground))]"
            style={{ background: 'linear-gradient(135deg, hsl(var(--professionals)), hsl(var(--professionals) / 0.75))' }}
          >
            <h3 className="text-base font-bold mb-1">Looking to hire {pro.name.split(' ')[0]}?</h3>
            <p className="text-xs opacity-90 mb-4">Verified pro · {pro.dealsClosed} deals · Replies in {pro.responseTime}.</p>
            <Button size="sm" variant="secondary" className="w-full gap-1.5">
              <Phone className="w-4 h-4" /> Request a call
            </Button>
          </div>

          {/* Refer */}
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <Sparkles className="w-5 h-5 text-[hsl(var(--professionals))] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-foreground mb-1">Know someone who needs a pro?</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Share this Trust Page and earn Insight Credits.</p>
            <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5" /> Share Trust Page
            </Button>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default ProfessionalProfilePage;