import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye, Share2, Star, ThumbsUp, Briefcase, Award, Users, TrendingUp,
  Link2, ExternalLink, Sparkles, MessageSquare, Gift, Target, Camera,
  CheckCircle2, BarChart3, Globe, Crown, Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getMockProfessional } from '@/data/mockProfessionals';

const ACCENT = 'hsl(var(--professionals))';

export default function ProfessionalDashboard() {
  const pro = useMemo(() => getMockProfessional('ahmed-hassan')!, []);
  const trustUrl = `/pro/${pro.slug}`;

  const stats = [
    { label: 'Profile views (30d)', value: '2,418', delta: '+34%', icon: Eye },
    { label: 'Trust page shares', value: '127', delta: '+18%', icon: Share2 },
    { label: 'New endorsements', value: '24', delta: '+9', icon: ThumbsUp },
    { label: 'Hire requests', value: '11', delta: '+4', icon: Briefcase },
  ];

  const benefits = [
    { icon: Crown, title: 'Prestige & positioning', desc: 'A verified, public trust page that signals you are a serious, accountable professional — not a random agent.' },
    { icon: Eye, title: 'Visibility & exposure', desc: 'Indexed on r8estate, surfaced in category pages, and shareable as a single link across WhatsApp, Instagram, LinkedIn.' },
    { icon: Sparkles, title: 'Show your expertise', desc: 'Showcase certifications, deals, portfolio, awards, languages and specialties in one place — no more scattered PDFs.' },
    { icon: Target, title: 'Shorter sales cycle', desc: 'Buyers arrive pre-warmed: they have already read verified reviews, so hesitation drops and the close gets faster.' },
    { icon: Briefcase, title: 'Get hired by companies', desc: 'Developers, brokerages and service firms can discover and contact you directly via your trust page.' },
    { icon: Globe, title: 'Your social hub', desc: 'Aggregate LinkedIn, Instagram, YouTube, TikTok, website & more — give every lead one source of truth.' },
  ];

  const completion = [
    { label: 'Add a profile photo', done: true, points: 5 },
    { label: 'Write your headline & bio', done: true, points: 10 },
    { label: 'Connect 3 social accounts', done: true, points: 10 },
    { label: 'Upload 3 portfolio projects', done: true, points: 15 },
    { label: 'Add a verified certificate', done: true, points: 15 },
    { label: 'Verify your phone number', done: false, points: 10 },
    { label: 'Get 5 endorsements on a skill', done: false, points: 15 },
    { label: 'Publish a community post', done: false, points: 10 },
    { label: 'Invite 3 colleagues to endorse you', done: false, points: 10 },
  ];
  const completed = completion.filter(c => c.done).length;
  const completionPct = Math.round((completed / completion.length) * 100);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header bar */}
      <div
        className="border-b"
        style={{
          background: `linear-gradient(135deg, ${ACCENT} 0%, hsl(var(--professionals) / 0.85) 100%)`,
          borderColor: 'hsl(var(--professionals) / 0.4)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 text-white">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-90 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Professional workspace
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {pro.name.split(' ')[0]}</h1>
              <p className="text-sm md:text-base opacity-90 mt-1">
                Your trust page is your reputation, your CV and your funnel — all in one.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="bg-white text-[hsl(var(--professionals))] hover:bg-white/90 font-semibold">
                <Link to={trustUrl}><Eye className="w-4 h-4 me-2" />View my trust page</Link>
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/40 text-white hover:bg-white/20 hover:text-white">
                <Share2 className="w-4 h-4 me-2" />Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4 border-[hsl(var(--professionals)/0.2)]">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--professionals) / 0.12)' }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">{s.delta}</span>
                </div>
                <div className="mt-3 text-2xl font-bold text-[hsl(var(--foreground))]">{s.value}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Trust page identity card */}
        <Card className="p-5 md:p-6 border-[hsl(var(--professionals)/0.25)]">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
              style={{ background: ACCENT }}
            >
              {pro.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-xl font-bold">{pro.name}</h2>
                <Badge style={{ background: 'hsl(var(--professionals) / 0.12)', color: ACCENT }} className="border-0">
                  {pro.tier.emoji} {pro.tier.name}
                </Badge>
                {pro.verified && (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 me-1" />Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 truncate">{pro.headline}</p>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> <strong>{pro.rating}</strong> · {pro.reviewCount} reviews</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" style={{ color: ACCENT }} /> Trust score <strong>{pro.trustScore}</strong></span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {pro.dealsClosed} deals</span>
              </div>
            </div>
            <div className="flex md:flex-col gap-2 md:w-44">
              <Button asChild size="sm" className="flex-1" style={{ background: ACCENT, color: 'white' }}>
                <Link to={trustUrl}><ExternalLink className="w-4 h-4 me-1.5" />Open</Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-[hsl(var(--professionals)/0.4)]" style={{ color: ACCENT }}>
                <Link2 className="w-4 h-4 me-1.5" />Copy link
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Benefits — left 2/3 */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card className="p-5 md:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
                <h3 className="text-base md:text-lg font-bold">Why your trust page is your unfair advantage</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">
                Built for individuals — agents, lawyers, marketers, photographers, vloggers, journalists & more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.title} className="p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--professionals)/0.4)] transition-colors">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: 'hsl(var(--professionals) / 0.12)' }}>
                        <Icon className="w-4.5 h-4.5" style={{ color: ACCENT }} />
                      </div>
                      <div className="font-semibold text-sm">{b.title}</div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">{b.desc}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick actions */}
            <Card className="p-5 md:p-6">
              <h3 className="text-base md:text-lg font-bold mb-4">Manage your trust page</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: Award, label: 'Add certificate' },
                  { icon: Briefcase, label: 'Add experience' },
                  { icon: Camera, label: 'Add portfolio' },
                  { icon: Globe, label: 'Connect socials' },
                  { icon: ThumbsUp, label: 'Request endorsement' },
                  { icon: MessageSquare, label: 'Ask for a review' },
                ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.label}
                      className="p-3 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--professionals)/0.5)] hover:bg-[hsl(var(--professionals)/0.05)] transition text-start"
                    >
                      <Icon className="w-4 h-4 mb-2" style={{ color: ACCENT }} />
                      <div className="text-xs font-semibold">{a.label}</div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4 md:space-y-6">

            {/* Profile completion */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">Profile strength</h3>
                <span className="text-sm font-bold" style={{ color: ACCENT }}>{completionPct}%</span>
              </div>
              <Progress value={completionPct} className="h-2 mb-4" />
              <ul className="space-y-2">
                {completion.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-xs">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${c.done ? 'text-emerald-500' : 'text-[hsl(var(--muted-foreground)/0.4)]'}`}
                    />
                    <span className={`flex-1 ${c.done ? 'line-through text-[hsl(var(--muted-foreground))]' : ''}`}>{c.label}</span>
                    <span className="text-[10px] font-semibold" style={{ color: ACCENT }}>+{c.points}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Referral / share */}
            <Card className="p-5 border-[hsl(var(--professionals)/0.3)]" style={{ background: 'hsl(var(--professionals) / 0.05)' }}>
              <Gift className="w-5 h-5 mb-2" style={{ color: ACCENT }} />
              <h3 className="font-bold text-sm">Refer a colleague, earn credits</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 mb-3">
                Every professional who joins through your link earns you both Insight Credits and badge progress.
              </p>
              <Button size="sm" className="w-full" style={{ background: ACCENT, color: 'white' }}>
                <Share2 className="w-4 h-4 me-1.5" />Get my referral link
              </Button>
            </Card>

            {/* Insights teaser */}
            <Card className="p-5">
              <BarChart3 className="w-5 h-5 mb-2" style={{ color: ACCENT }} />
              <h3 className="font-bold text-sm">Who looked at your profile</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 mb-3">
                See companies, developers and buyers checking your trust page this week.
              </p>
              <div className="space-y-2">
                {[
                  { name: 'SODIC', role: 'Developer · HR' },
                  { name: '3 buyers from New Cairo', role: 'Off-plan apartment intent' },
                  { name: 'Coldwell Banker', role: 'Talent team' },
                ].map((v) => (
                  <div key={v.name} className="flex items-center gap-2 p-2 rounded-lg bg-[hsl(var(--muted)/0.4)]">
                    <Users className="w-4 h-4" style={{ color: ACCENT }} />
                    <div className="text-xs">
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-[hsl(var(--muted-foreground))]">{v.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trending */}
            <Card className="p-5">
              <TrendingUp className="w-5 h-5 mb-2" style={{ color: ACCENT }} />
              <h3 className="font-bold text-sm">Boost your visibility</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 mb-3">
                Professionals who post 1× weekly in the community see 3.4× more profile views.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full border-[hsl(var(--professionals)/0.4)]" style={{ color: ACCENT }}>
                <Link to="/community">Open community</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}