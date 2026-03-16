import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Copy, RefreshCw, Check, Instagram, Linkedin, Twitter, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRatingColorClass } from '@/lib/ratingColors';

type Platform = 'instagram' | 'twitter' | 'linkedin' | 'general';

interface ReviewData {
  author: string;
  rating: number;
  comment: string;
  project?: string;
}

interface ReviewToSocialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ReviewData;
  businessName: string;
}

const PLATFORMS: { id: Platform; label: string; icon: React.ElementType; maxChars: number }[] = [
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, maxChars: 280 },
  { id: 'instagram', label: 'Instagram', icon: Instagram, maxChars: 2200 },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, maxChars: 3000 },
  { id: 'general', label: 'General', icon: Share2, maxChars: 500 },
];

export function ReviewToSocialModal({ open, onOpenChange, review, businessName }: ReviewToSocialModalProps) {
  const [platform, setPlatform] = useState<Platform>('twitter');
  const [postText, setPostText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const selectedPlatform = PLATFORMS.find(p => p.id === platform)!;

  const generate = async () => {
    setIsLoading(true);
    setCopied(false);
    try {
      const { data, error } = await supabase.functions.invoke('review-to-social', {
        body: { review, platform, businessName },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPostText(data.post_text || '');
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Post copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const handleOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setPostText('');
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share as Social Post
          </DialogTitle>
        </DialogHeader>

        {/* Review summary */}
        <div className="bg-secondary/50 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">{review.author}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < review.rating ? getRatingColorClass(review.rating) : 'text-muted'}`} />
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{review.comment}</p>
        </div>

        {/* Platform selector */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <Button
              key={p.id}
              size="sm"
              variant={platform === p.id ? 'default' : 'outline'}
              onClick={() => { setPlatform(p.id); setPostText(''); setCopied(false); }}
              className="gap-1.5 text-xs"
            >
              <p.icon className="w-3.5 h-3.5" />
              {p.label}
            </Button>
          ))}
        </div>

        {/* Generate button or result */}
        {!postText && !isLoading && (
          <Button onClick={generate} className="w-full gap-2">
            <Share2 className="w-4 h-4" />
            Generate {selectedPlatform.label} Post
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <span className="ms-2 text-sm text-muted-foreground">Generating post…</span>
          </div>
        )}

        {postText && !isLoading && (
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{postText}</p>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant={postText.length > selectedPlatform.maxChars ? 'destructive' : 'secondary'} className="text-xs">
                {postText.length} / {selectedPlatform.maxChars}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={generate} className="gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </Button>
                <Button size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
