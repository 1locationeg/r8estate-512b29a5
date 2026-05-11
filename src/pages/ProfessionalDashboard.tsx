import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, Share2, Star, ThumbsUp, Briefcase, Award, Users, TrendingUp,
  Link2, ExternalLink, Sparkles, MessageSquare, Gift, Camera,
  CheckCircle2, Globe, Crown, Zap, Target, Bot, ArrowRight, Settings,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getMockProfessional } from '@/data/mockProfessionals';

const PRO = 'hsl(var(--professionals))';
const NAVY = 'hsl(var(--primary))';
const GOLD = 'hsl(var(--coin))';

/* ── tiny SVG bits ───────────────────────────────────── */
function Sparkline({ points, color = PRO }: { points: number[]; color?: string }) {
  const w = 60, h = 18;
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

function TrustRing({ value, size = 84, stroke = 7, color = 'white' }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold leading-none" style={{ color }}>{value}</span>
        <span className="text-[9px] font-semibold tracking-wider opacity-80" style={{ color }}>TRUST</span>
      </div>
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{ boxShadow: `0 0 0 2px ${color}33`, animationDuration: '2.4s' }}
      />
    </div>
  );
}

function MiniRing({ value, size = 56, stroke = 6, color = PRO }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
        {value}%
      </div>
    </div>
  );
}

export default function ProfessionalDashboard() {
  const pro = useMemo(() => getMockProfessional('ahmed-hassan')!, []);
  const trustUrl = `/pro/${pro.slug}`;

  const stats = [
    { label: 'Profile views', short: 'Views', value: '2,418', delta: '+34%', icon: Eye, spark: [4, 6, 5, 8, 7, 10, 12] },
    { label: 'Trust page shares', short: 'Shares', value: '127', delta: '+18%', icon: Share2, spark: [3, 4, 3, 5, 6, 5, 8] },
    { label: 'New endorsements', short: 'Endorsed', value: '24', delta: '+9', icon: ThumbsUp, spark: [2, 3, 4, 3, 5, 6, 7] },
    { label: 'Hire requests', short: 'Hires', value: '11', delta: '+4', icon: Briefcase, spark: [1, 2, 1, 3, 2, 4, 5] },
  ];

  const benefits = [
    { icon: Crown, title: 'Prestige', tip: 'A verified, public trust page that signals you are a serious, accountable professional.' },
    { icon: Eye, title: 'Visibility', tip: 'Indexed on r8estate, surfaced in category pages, shareable across WhatsApp, Instagram, LinkedIn.' },
    { icon: Sparkles, title: 'Expertise', tip: 'Showcase certifications, deals, portfolio, awards & specialties in one place.' },
    { icon: Target, title: 'Faster close', tip: 'Buyers arrive pre-warmed: they read verified reviews, hesitation drops, the close gets faster.' },
    { icon: Briefcase, title: 'Get hired', tip: 'Developers, brokerages and service firms can discover and contact you directly.' },
    { icon: Globe, title: 'One link', tip: 'Aggregate LinkedIn, Instagram, YouTube, TikTok & more — give every lead one source of truth.' },
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
        {/* ── HERO ─────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden border-b"
          style={{
            background: `linear-gradient(125deg, ${NAVY} 0%, ${PRO} 100%)`,
            borderColor: 'hsl(var(--professionals) / 0.4)',
          }}
        >
          {/* AI mesh */}
          <div
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, ${GOLD}33, transparent 40%),
                radial-gradient(circle at 80% 70%, ${PRO}55, transparent 45%),
                radial-gradient(circle at 60% 20%, #ffffff22, transparent 35%)
              `,
            }}
          />
          {/* glow orb */}
          <div
            className="absolute -top-16 end-10 w-56 h-56 rounded-full blur-3xl pointer-events-none animate-pulse"
            style={{ background: `${GOLD}55`, animationDuration: '4s' }}
          />
          {/* AI badge */}
          <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-[10px] font-semibold tracking-wider uppercase text-white">
              <Bot className="w-3 h-3" />
              <span>AI-powered cockpit</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-6">
            <div className="flex items-center gap-4 md:gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white/30"
                  style={{ background: `linear-gradient(135deg, ${PRO}, ${GOLD})` }}
                >
                  {pro.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                {pro.verified && (
                  <span className="absolute -bottom-1 -end-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                )}
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 text-white">
                <h1 className="text-lg md:text-2xl font-extrabold leading-tight truncate">{pro.name}</h1>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold">
                    {pro.tier.emoji} {pro.tier.name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {pro.rating}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur text-[11px] font-semibold">
                    <Briefcase className="w-3 h-3" /> {pro.dealsClosed}
                  </span>
                </div>
              </div>

              {/* Trust ring */}
              <div className="hidden sm:block">
                <TrustRing value={pro.trustScore} />
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon" className="bg-white hover:bg-white/90" style={{ color: NAVY }}>
                      <Link to={trustUrl} aria-label="View trust page"><Eye className="w-4 h-4" /></Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View my trust page</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20 hover:text-white" aria-label="Share">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share my page</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon" variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20 hover:text-white" aria-label="Edit profile settings">
                      <Link to="/pro-settings"><Settings className="w-4 h-4" /></Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit name &amp; avatar</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-6 space-y-5 md:space-y-6">

          {/* ── STAT TILES ───────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <Tooltip key={s.label}>
                  <TooltipTrigger asChild>
                    <Card className="p-3 md:p-4 border-[hsl(var(--professionals)/0.15)] bg-white/70 backdrop-blur hover:shadow-md hover:-translate-y-0.5 transition cursor-default">
                      <div className="flex items-start justify-between">
                        <Icon className="w-4 h-4" style={{ color: PRO }} />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700">{s.delta}</span>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-2">
                        <div>
                          <div className="text-xl md:text-2xl font-extrabold leading-none">{s.value}</div>
                          <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wider font-semibold">{s.short}</div>
                        </div>
                        <Sparkline points={s.spark} />
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>{s.label} (last 30 days)</TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* ── BOOSTER ─────────────────────────────── */}
          <Card
            className="relative overflow-hidden p-4 md:p-5 border-0 text-white"
            style={{ background: `linear-gradient(120deg, ${NAVY} 0%, ${PRO} 60%, ${GOLD} 110%)` }}
          >
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 80% 50%, #ffffff44, transparent 50%)' }} />
            <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
              <MiniRing value={completionPct} size={72} stroke={8} color="white" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-90">
                  <Sparkles className="w-3 h-3" /> Boost your trust page
                </div>
                <div className="text-base md:text-lg font-extrabold mt-0.5">
                  {100 - completionPct}% to Elite — finish 3 quick steps
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {nextSteps.map(s => (
                    <span key={s.label} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-[11px] font-semibold">
                      {s.label} <span className="opacity-80">+{s.points}</span>
                    </span>
                  ))}
                </div>
              </div>
              <Button size="sm" className="bg-white hover:bg-white/90 font-bold shrink-0" style={{ color: NAVY }}>
                Boost now <ArrowRight className="w-4 h-4 ms-1.5" />
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

            {/* ── LEFT 2/3 ──────────────────────────── */}
            <div className="lg:col-span-2 space-y-5 md:space-y-6">

              {/* Benefits — icon tiles */}
              <Card className="p-4 md:p-5 border-[hsl(var(--professionals)/0.15)]">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4" style={{ color: PRO }} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Your unfair advantages</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
                  {benefits.map((b) => {
                    const Icon = b.icon;
                    return (
                      <Tooltip key={b.title}>
                        <TooltipTrigger asChild>
                          <button className="group p-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--professionals)/0.5)] hover:bg-[hsl(var(--professionals)/0.05)] transition flex flex-col items-center text-center min-h-[88px]">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition group-hover:scale-110"
                              style={{ background: `linear-gradient(135deg, hsl(var(--professionals)/0.15), ${GOLD}22)` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: PRO }} />
                            </div>
                            <span className="text-[11px] font-bold leading-tight">{b.title}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px]">{b.tip}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </Card>

              {/* Quick actions — chip rail */}
              <Card className="p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4" style={{ color: PRO }} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Manage page</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap pb-1">
                  {quickActions.map(a => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.label}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--professionals)/0.5)] hover:bg-[hsl(var(--professionals)/0.05)] transition text-xs font-semibold min-h-[44px]"
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: PRO }} />
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* ── RIGHT RAIL ─────────────────────────── */}
            <div className="space-y-4 md:space-y-5">

              {/* Profile strength */}
              <Card className="p-4 md:p-5 border-[hsl(var(--professionals)/0.15)]">
                <div className="flex items-center gap-3 mb-3">
                  <MiniRing value={completionPct} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Profile strength</div>
                    <div className="text-base font-extrabold">{completed} of {completion.length} done</div>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {nextSteps.map(c => (
                    <li key={c.label} className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(var(--professionals)/0.06)]">
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PRO }} />
                      <span className="flex-1 text-xs font-semibold">{c.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: PRO }}>+{c.points}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Who viewed you */}
              <Card className="p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: PRO }} />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Who looked at you</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'SODIC', role: 'Developer · HR' },
                    { name: '3 buyers · New Cairo', role: 'Off-plan intent' },
                    { name: 'Coldwell Banker', role: 'Talent team' },
                  ].map(v => (
                    <div key={v.name} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${PRO}, ${NAVY})` }}>
                        {v.name.charAt(0)}
                      </div>
                      <div className="text-xs min-w-0 flex-1">
                        <div className="font-bold truncate">{v.name}</div>
                        <div className="text-[hsl(var(--muted-foreground))] truncate">{v.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Refer */}
              <Card className="p-4 md:p-5 border-0 text-[hsl(var(--primary))]"
                style={{ background: `linear-gradient(135deg, ${GOLD}33, ${GOLD}11)` }}>
                <Gift className="w-5 h-5" style={{ color: GOLD }} />
                <h3 className="font-extrabold text-sm mt-1.5">Refer a colleague</h3>
                <p className="text-[11px] opacity-80 mt-0.5 mb-2.5">Earn Insight Credits together.</p>
                <Button size="sm" className="w-full font-bold" style={{ background: NAVY, color: 'white' }}>
                  Get my link
                </Button>
              </Card>

              {/* AI Coach */}
              <Card className="relative overflow-hidden p-4 md:p-5 border-0 text-white"
                style={{ background: `linear-gradient(135deg, ${NAVY}, ${PRO})` }}>
                <div className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 70% 30%, ${GOLD}55, transparent 50%)` }} />
                <div className="relative">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-90">
                    <Bot className="w-3 h-3" />
                    AI coach
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-bold leading-snug mt-2">
                    You&rsquo;re 1 endorsement away from a visibility boost.
                  </p>
                  <Button asChild size="sm" variant="secondary" className="mt-3 bg-white/15 backdrop-blur border border-white/20 hover:bg-white/25 text-white">
                    <Link to="/community">
                      <TrendingUp className="w-3.5 h-3.5 me-1.5" /> Open community
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
