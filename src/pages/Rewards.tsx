import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Star, Shield, Trophy, Zap, Gift, Crown, Target, Users,
  MessageSquare, Eye, Heart, FileText, Award, CheckCircle2,
  ArrowRight, Coins, TrendingUp, Sparkles
} from 'lucide-react';
import { BUYER_TIERS } from '@/lib/buyerGamification';
import { POINTS_PER_ACTION } from '@/lib/buyerGamification';
import { useAuth } from '@/contexts/AuthContext';

const HERO_ACTIONS = [
  { icon: Star, label: 'Write a Review', points: 25, color: 'bg-accent/20 text-accent-foreground' },
  { icon: MessageSquare, label: 'Community Post', points: 15, color: 'bg-primary/10 text-primary' },
  { icon: Eye, label: 'View Developers', points: 2, color: 'bg-blue-500/10 text-blue-600' },
  { icon: Heart, label: 'Save Projects', points: 4, color: 'bg-destructive/10 text-destructive' },
  { icon: Shield, label: 'Verify Purchase', points: 40, color: 'bg-emerald-500/10 text-emerald-600' },
  { icon: FileText, label: 'Unlock Reports', points: 10, color: 'bg-purple-500/10 text-purple-600' },
];

const BENEFITS = [
  {
    icon: Crown,
    title: 'Exclusive Tiers',
    description: 'Rise through 5 tiers from Newcomer to Ambassador. Each tier unlocks new perks and privileges.',
  },
  {
    icon: Award,
    title: 'Earn Badges',
    description: 'Collect 18+ unique badges for your achievements. Show them off on your profile.',
  },
  {
    icon: Gift,
    title: 'VIP Perks',
    description: 'Get priority support, early access to listings, exclusive deals, and direct developer contact.',
  },
  {
    icon: TrendingUp,
    title: 'Leaderboard Fame',
    description: 'Compete with other members on weekly & all-time leaderboards. Top reviewers get featured.',
  },
  {
    icon: Zap,
    title: 'Streak Bonuses',
    description: 'Stay active daily to build streaks. Hit 7, 14, and 30-day milestones for bonus coins.',
  },
  {
    icon: Users,
    title: 'Community Status',
    description: 'Become a Community Champion by helping others. Your expertise gets recognized platform-wide.',
  },
];

const BADGE_SHOWCASE = [
  { emoji: '⭐', name: 'First Review', desc: 'Write your first review' },
  { emoji: '🛡️', name: 'Verified Buyer', desc: 'Submit purchase receipt' },
  { emoji: '🏆', name: 'Top Reviewer', desc: '10+ detailed reviews' },
  { emoji: '🔥', name: 'On Fire', desc: '3-day activity streak' },
  { emoji: '⚡', name: 'Week Warrior', desc: '7-day streak' },
  { emoji: '💎', name: 'Community Champion', desc: '10+ posts & 20+ replies' },
  { emoji: '🔍', name: 'Explorer', desc: 'View 10+ developers' },
  { emoji: '💖', name: 'Collector', desc: 'Save 5+ projects' },
];

export default function Rewards() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Rewards" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[hsl(203,81%,28%)] text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-accent blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 py-1.5 mb-6">
            <Coins className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Earn Coins • Unlock Perks • Rise in Rank</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Get Rewarded for Being <span className="text-accent">Smart</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Every action you take on R8ESTATE earns you coins. Write reviews, explore developers, join the community — and unlock exclusive benefits.
          </p>
          {!user && (
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base px-8 gap-2"
              onClick={() => navigate('/auth')}
            >
              Join Now & Start Earning <ArrowRight className="w-5 h-5" />
            </Button>
          )}
          {user && (
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base px-8 gap-2"
              onClick={() => navigate('/buyer')}
            >
              View My Rewards <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </section>

      {/* How to Earn Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">How You Earn Coins</h2>
          <p className="text-muted-foreground">Simple actions, real rewards. Here's what earns you coins:</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {HERO_ACTIONS.map((action) => (
            <Card key={action.label} className="group hover:shadow-md transition-shadow border-border/50">
              <CardContent className="flex flex-col items-center text-center p-5 gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm text-foreground">{action.label}</span>
                <Badge variant="secondary" className="bg-accent/15 text-accent-foreground font-bold text-xs border-0">
                  +{action.points} coins
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tiers Section */}
      <section className="bg-muted/50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Your Journey Through 5 Tiers</h2>
            <p className="text-muted-foreground">The more you engage, the higher you climb. Each tier brings better perks.</p>
          </div>
          <div className="relative">
            {/* Progress line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-border rounded-full z-0" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
              {BUYER_TIERS.map((tier, i) => (
                <div key={tier.id} className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full bg-card border-2 border-border flex items-center justify-center text-2xl mb-3 shadow-sm ${i === BUYER_TIERS.length - 1 ? 'ring-2 ring-accent ring-offset-2' : ''}`}>
                    {tier.emoji}
                  </div>
                  <h3 className={`font-bold text-sm ${tier.color}`}>{tier.name}</h3>
                  <span className="text-xs text-muted-foreground mb-2">{tier.minPoints}+ coins</span>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tier.perks.map((p) => (
                      <li key={p} className="flex items-start gap-1">
                        <CheckCircle2 className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Why It's Worth It</h2>
          <p className="text-muted-foreground">Here's what you get as a rewarded member of R8ESTATE:</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="border-border/50 hover:border-accent/30 transition-colors">
              <CardContent className="p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Badges Showcase */}
      <section className="bg-muted/50 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Collect Badges</h2>
            <p className="text-muted-foreground">Earn recognition for your achievements. Here are some you can unlock:</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGE_SHOWCASE.map((b) => (
              <div key={b.name} className="bg-card rounded-xl border border-border/50 p-4 text-center hover:shadow-md transition-shadow">
                <span className="text-3xl block mb-2">{b.emoji}</span>
                <h4 className="font-semibold text-sm text-foreground">{b.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ready to Start Earning?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of smart buyers who are earning rewards while making better real estate decisions.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground font-bold gap-2 px-8"
                onClick={() => navigate('/auth')}
              >
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="w-5 h-5" /> View Leaderboard
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground font-bold gap-2 px-8"
                onClick={() => navigate('/buyer')}
              >
                Go to My Dashboard <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="w-5 h-5" /> View Leaderboard
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
