import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, Share2, Star, ThumbsUp, Briefcase, Award, Users, TrendingUp,
  Sparkles, MessageSquare, Gift, Camera, CheckCircle2, Globe,
  Bot, ArrowRight, Pencil, Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { getMockProfessional } from '@/data/mockProfessionals';

/* LinkedIn-inspired palette mapped to brand tokens.
   Accent = Navy (acts as LinkedIn blue). Surfaces = white. Page = soft gray. */
const ACCENT = 'hsl(var(--primary))';
const ACCENT_SOFT = 'hsl(var(--primary) / 0.08)';

/* ── tiny SVG bits ───────────────────────────────────── */
function Sparkline({ points, color = ACCENT }: { points: number[]; color?: string }) {
  const w = 56, h = 16;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={d} />
    </svg>
  );
}

function Ring({ value, size = 56, stroke = 5, color = ACCENT, label }: { value: number; size?: number; stroke?: number; color?: string; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--border))" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold leading-none" style={{ color }}>{value}{label ? '' : '%'}</span>
        {label && <span className="text-[8px] font-semibold tracking-wider mt-0.5 text-[hsl(var(--muted-foreground))]">{label}</span>}
      </div>
    </div>
  );
}

export default function ProfessionalDashboard() {
  const pro = useMemo(() => getMockProfessional('ahmed-hassan')!, []);
  const trustUrl = `/pro/${pro.slug}`;

  const stats = [
    { label: 'Profile views', short: 'Views', value: '2,418', delta: '+34%', icon: Eye, spark: [4, 6, 5, 8, 7, 10, 12] },
    { label: 'Page shares', short: 'Shares', value: '127', delta: '+18%', icon: Share2, spark: [3, 4, 3, 5, 6, 5, 8] },
    { label: 'Endorsements', short: 'Endorsed', value: '24', delta: '+9', icon: ThumbsUp, spark: [2, 3, 4, 3, 5, 6, 7] },
    { label: 'Hire requests', short: 'Hires', value: '11', delta: '+4', icon: Briefcase, spark: [1, 2, 1, 3, 2, 4, 5] },
  ];

  const benefits = [
    { icon: Eye, title: 'Visibility', tip: 'Indexed on r8estate, surfaced in category pages, shareable across WhatsApp, Instagram, LinkedIn.' },
    { icon: Sparkles, title: 'Expertise', tip: 'Showcase certifications, deals, portfolio, awards & specialties in one place.' },
    { icon: Briefcase, title: 'Get hired', tip: 'Developers, brokerages and service firms can discover and contact you directly.' },
    { icon: Globe, title: 'One link', tip: 'Aggregate LinkedIn, Instagram, YouTube & more — give every lead one source of truth.' },
    { icon: Award, title: 'Prestige', tip: 'A verified, public trust page that signals you are a serious, accountable professional.' },
    { icon: TrendingUp, title: 'Faster close', tip: 'Buyers arrive pre-warmed: they read verified reviews, hesitation drops, the close gets faster.' },
  ];

  const completion = [
    { label: 'Profile photo', done: true, points: 5 },
    { label: 'Headline & bio', done: true, points: 10 },
    { label: '3 socials connected', done: true, points: 10 },
    { label: '3 portfolio projects', done: true, points: 15 },
    { label: 'Verified certificate', done: true, points: 15 },
    { label: 'Verify phone', done: false, points: 10 },
    { label: '5 skill endorsements', done: false, points: 15 },
    { label: 'Publish a community post', done: false, points: 10 },
    { label: 'Invite 3 colleagues', done: false, points: 10 },
  ];
  const completed = completion.filter(c => c.done).length;
  const completionPct = Math.round((completed / completion.length) * 100);
  const nextSteps = completion.filter(c => !c.done).slice(0, 3);

  const quickActions = [
    { icon: Award, label: 'Certificate' },
    { icon: Briefcase, label: 'Experience' },
    { icon: Camera, label: 'Portfolio' },
    { icon: Globe, label: 'Socials' },
    { icon: ThumbsUp, label: 'Endorsement' },
    { icon: MessageSquare, label: 'Ask review' },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-[hsl(var(--page-bg))]">
        <div className="max-w-5xl mx-auto px-3 md:px-6 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── LEFT 2/3 ───────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Identity card — LinkedIn style cover + avatar */}
            <Card className="overflow-hidden border border-[hsl(var(--border))] shadow-sm">
              {/* cover */}
              <div
                className="relative h-24 md:h-32"
                style={{
                  background: `linear-gradient(120deg, ${ACCENT} 0%, hsl(var(--primary) / 0.85) 60%, hsl(var(--professionals) / 0.75) 100%)`,
                }}
              >
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 80% 20%, #ffffff66, transparent 50%)' }} />
                <button
                  className="absolute top-2 end-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition"
                  aria-label="Edit cover"
                >
                  <Pencil className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                </button>
              </div>

              <div className="px-4 md:px-6 pb-4 md:pb-5 -mt-10 md:-mt-12">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, hsl(var(--professionals)))` }}
                  >
                    {pro.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  {pro.verified && (
                    <span className="absolute bottom-0.5 end-0.5 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl font-bold text-[hsl(var(--foreground))] truncate">{pro.name}</h1>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] truncate mt-0.5">{pro.headline}</p>
                    <div className="flex items-center gap-3 md:gap-4 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <strong className="text-[hsl(var(--foreground))]">{pro.rating}</strong>
                        <span>· {pro.reviewCount} reviews</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <strong className="text-[hsl(var(--foreground))]">{pro.dealsClosed}</strong> deals
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1">
                        {pro.tier.emoji} <strong className="text-[hsl(var(--foreground))]">{pro.tier.name}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Ring value={pro.trustScore} size={52} stroke={4} label="TRUST" />
                    <div className="flex flex-col gap-1.5">
                      <Button asChild size="sm" className="h-8 rounded-full font-semibold" style={{ background: ACCENT, color: 'white' }}>
                        <Link to={trustUrl}><Eye className="w-3.5 h-3.5 me-1.5" />View</Link>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 rounded-full font-semibold border-[hsl(var(--primary)/0.3)]" style={{ color: ACCENT }}>
                        <Share2 className="w-3.5 h-3.5 me-1.5" />Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Analytics — clean LinkedIn-style stats row */}
            <Card className="border border-[hsl(var(--border))] shadow-sm">
              <div className="px-4 md:px-6 pt-4 pb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold">Analytics</h2>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Last 30 days</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[hsl(var(--border))] border-t border-[hsl(var(--border))]">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Tooltip key={s.label}>
                      <TooltipTrigger asChild>
                        <button className="px-4 md:px-5 py-3 text-start hover:bg-[hsl(var(--muted)/0.4)] transition">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                            <Icon className="w-3 h-3" />
                            {s.short}
                          </div>
                          <div className="mt-1 flex items-end justify-between gap-2">
                            <span className="text-xl font-bold leading-none">{s.value}</span>
                            <Sparkline points={s.spark} />
                          </div>
                          <div className="mt-1 text-[10px] font-semibold text-emerald-600">{s.delta}</div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{s.label}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </Card>

            {/* Benefits — compact icon tiles */}
            <Card className="border border-[hsl(var(--border))] shadow-sm">
              <div className="px-4 md:px-6 pt-4 pb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold">Why it matters</h2>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Hover for details</span>
              </div>
              <div className="px-4 md:px-6 pb-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <Tooltip key={b.title}>
                      <TooltipTrigger asChild>
                        <button className="group p-3 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.04)] transition flex flex-col items-center text-center min-h-[80px]">
                          <Icon className="w-5 h-5 mb-2 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition" />
                          <span className="text-[11px] font-semibold leading-tight">{b.title}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[220px]">{b.tip}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </Card>

            {/* Manage — simple action chips */}
            <Card className="border border-[hsl(var(--border))] shadow-sm">
              <div className="px-4 md:px-6 pt-4 pb-3">
                <h2 className="text-sm font-bold">Manage your page</h2>
              </div>
              <div className="px-4 md:px-6 pb-4 flex gap-2 overflow-x-auto md:flex-wrap">
                {quickActions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.label}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.04)] transition text-xs font-semibold min-h-[36px]"
                    >
                      <Plus className="w-3 h-3" style={{ color: ACCENT }} />
                      <Icon className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ── RIGHT RAIL ─────────────────────────────────── */}
          <div className="space-y-4">

            {/* Profile strength */}
            <Card className="border border-[hsl(var(--border))] shadow-sm p-4 md:p-5">
              <div className="flex items-center gap-3 mb-3">
                <Ring value={completionPct} size={56} />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Profile strength</div>
                  <div className="text-sm font-bold">All-Star is {100 - completionPct}% away</div>
                </div>
              </div>
              <ul className="space-y-1.5 mt-3">
                {nextSteps.map((c) => (
                  <li key={c.label}>
                    <button className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-[hsl(var(--muted)/0.5)] transition text-start">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                      <span className="flex-1 text-xs font-medium">{c.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: ACCENT }}>+{c.points}</span>
                      <ArrowRight className="w-3 h-3 text-[hsl(var(--muted-foreground))]" />
                    </button>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="w-full mt-3 h-8 rounded-full font-semibold" style={{ background: ACCENT, color: 'white' }}>
                Boost my page
              </Button>
            </Card>

            {/* AI Coach — single subtle AI card */}
            <Card
              className="border shadow-sm p-4 md:p-5 relative overflow-hidden"
              style={{ borderColor: 'hsl(var(--primary) / 0.2)', background: ACCENT_SOFT }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md" style={{ background: ACCENT }}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>AI coach</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-sm font-semibold leading-snug text-[hsl(var(--foreground))]">
                You&rsquo;re 1 endorsement away from a visibility boost.
              </p>
              <Button asChild size="sm" variant="ghost" className="mt-2 h-8 px-0 font-semibold hover:bg-transparent" style={{ color: ACCENT }}>
                <Link to="/community">Open community <ArrowRight className="w-3.5 h-3.5 ms-1" /></Link>
              </Button>
            </Card>

            {/* Who looked at you */}
            <Card className="border border-[hsl(var(--border))] shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">Who viewed you</h3>
                <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'SODIC', role: 'Developer · HR' },
                  { name: '3 buyers · New Cairo', role: 'Off-plan intent' },
                  { name: 'Coldwell Banker', role: 'Talent team' },
                ].map((v) => (
                  <button key={v.name} className="w-full flex items-center gap-2.5 hover:bg-[hsl(var(--muted)/0.5)] rounded-md p-1.5 -m-1.5 transition text-start">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, hsl(var(--primary) / 0.7))` }}>
                      {v.name.charAt(0)}
                    </div>
                    <div className="text-xs min-w-0 flex-1">
                      <div className="font-semibold truncate">{v.name}</div>
                      <div className="text-[hsl(var(--muted-foreground))] truncate">{v.role}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button className="w-full mt-3 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition py-1.5">
                Show all
              </button>
            </Card>

            {/* Refer */}
            <Card className="border border-[hsl(var(--border))] shadow-sm p-4 md:p-5">
              <Gift className="w-5 h-5" style={{ color: ACCENT }} />
              <h3 className="font-bold text-sm mt-2">Refer a colleague</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 mb-3">Earn Insight Credits together.</p>
              <Button size="sm" variant="outline" className="w-full h-8 rounded-full font-semibold border-[hsl(var(--primary)/0.3)]" style={{ color: ACCENT }}>
                Get my link
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
