import { useNavigate } from 'react-router-dom';
import { Coins, PenLine, Star, Shield, TrendingUp, Users, ChevronRight, Sparkles, Award, Eye, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReviewerSpotlight } from '@/components/ReviewerSpotlight';
import { Footer } from '@/components/Footer';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';

const TIERS = [
  { emoji: '✍️', name: 'New Reviewer', minReviews: 1, perks: ['Earn 25 coins per review', 'Public profile badge', 'Community access'], color: 'border-muted-foreground/40 bg-muted/30' },
  { emoji: '🔥', name: 'Active Reviewer', minReviews: 3, perks: ['Priority review display', 'Reaction badges', 'Leaderboard entry'], color: 'border-accent/40 bg-accent/10' },
  { emoji: '⭐', name: 'Pro Reviewer', minReviews: 5, perks: ['Verified Pro badge', 'AI-assisted drafts', 'Early feature access'], color: 'border-primary/40 bg-primary/10' },
  { emoji: '👑', name: 'Elite Reviewer', minReviews: 10, perks: ['Gold Elite badge', 'Featured spotlight', 'Exclusive rewards & swag'], color: 'border-coin/40 bg-coin/10' },
];

const EARN_ACTIONS = [
  { action: 'Write a review', coins: 25, icon: PenLine },
  { action: 'First ever review', coins: 50, icon: Award },
  { action: 'Add detailed narrative', coins: 15, icon: Sparkles },
  { action: 'Upload proof / receipt', coins: 10, icon: Shield },
  { action: 'Get a "Helpful" vote', coins: 5, icon: ThumbsUp },
  { action: 'Refer a friend', coins: 20, icon: Users },
];

const STEPS = [
  { step: '1', title: 'Write', desc: 'Share your real estate experience — good or bad', icon: PenLine },
  { step: '2', title: 'Earn', desc: 'Get coins, badges, and climb the tier ladder', icon: Coins },
  { step: '3', title: 'Rise', desc: 'Become an Elite Reviewer and shape the market', icon: TrendingUp },
];

const ReviewerProgram = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) navigate('/reviews');
    else navigate('/auth?intent=review');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/60 px-4 py-3 flex items-center justify-between">
        <BrandLogo />
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>Home</Button>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-coin/10 pt-16 pb-12 px-4">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--coin)),transparent_60%)]" />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coin/15 text-coin text-xs font-bold mb-4">
            <Coins className="w-3.5 h-3.5" /> Reviewer Program
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 leading-tight">
            Your Voice Has Power 🏆
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto mb-6">
            Every honest review protects a family's life savings. Write reviews, earn coins & badges, and rise to Elite Reviewer status.
          </p>
          <Button size="lg" onClick={handleCTA} className="gap-2 text-sm shadow-lg">
            <span className="flex items-center gap-1 text-coin font-bold">
              <Coins className="w-4 h-4" /> +25
            </span>
            <span className="w-px h-4 bg-primary-foreground/20" />
            <PenLine className="w-4 h-4" />
            {user ? 'Write a Review' : 'Join as Reviewer'}
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-xl font-bold text-foreground text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <Card key={s.step} className="p-5 text-center border-border/60">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-foreground mb-1">{s.title}</div>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Tier Progression */}
      <section className="bg-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-foreground text-center mb-2">Reviewer Tiers</h2>
          <p className="text-xs text-muted-foreground text-center mb-8">Write more reviews → unlock higher tiers → earn bigger perks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TIERS.map((t) => (
              <Card key={t.name} className={`p-4 border ${t.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <div className="text-sm font-bold text-foreground">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground">{t.minReviews}+ reviews</div>
                  </div>
                </div>
                <ul className="space-y-1">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Earn Coins */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-xl font-bold text-foreground text-center mb-2">Earn Coins</h2>
        <p className="text-xs text-muted-foreground text-center mb-8">Every action earns you coins toward rewards and status</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EARN_ACTIONS.map((a) => (
            <Card key={a.action} className="p-3 flex flex-col items-center text-center gap-2 border-border/60">
              <div className="w-8 h-8 rounded-full bg-coin/10 flex items-center justify-center">
                <a.icon className="w-4 h-4 text-coin" />
              </div>
              <span className="text-lg font-extrabold text-coin">+{a.coins}</span>
              <span className="text-[10px] text-muted-foreground leading-tight">{a.action}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section className="bg-gradient-to-r from-primary/5 to-coin/5 py-12 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-bold text-foreground mb-6">Your Impact Matters</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Eye, value: '2,847', label: 'Buyers helped this month' },
              { icon: Shield, value: '94%', label: 'Trust decisions informed' },
              { icon: Star, value: '4.6', label: 'Avg reviewer satisfaction' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <s.icon className="w-5 h-5 text-primary mb-1" />
                <span className="text-xl sm:text-2xl font-extrabold text-foreground">{s.value}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlight */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-xl font-bold text-foreground text-center mb-6">Featured Reviewers</h2>
        <ReviewerSpotlight onWriteReview={handleCTA} />
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Ready to Make a Difference?</h2>
        <p className="text-xs text-muted-foreground mb-5">Your review could save someone millions</p>
        <Button size="lg" onClick={handleCTA} className="gap-2 shadow-lg">
          <Coins className="w-4 h-4 text-coin" />
          Start Your Reviewer Journey
        </Button>
      </section>

      <Footer />
    </div>
  );
};

export default ReviewerProgram;
