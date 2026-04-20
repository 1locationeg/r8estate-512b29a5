import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

function parseUserAgent(ua: string) {
  let device_type = 'desktop';
  if (/mobile|android|iphone|ipod/i.test(ua)) device_type = 'mobile';
  else if (/tablet|ipad/i.test(ua)) device_type = 'tablet';

  let browser = 'Other';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';

  return { device_type, browser };
}

const NFCRedirect = () => {
  const { tagCode } = useParams<{ tagCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [interstitial, setInterstitial] = useState<{ url: string; domain: string } | null>(null);

  useEffect(() => {
    if (!tagCode) { setError('Invalid tag.'); return; }

    const run = async () => {
      const { data: tag, error: fetchErr } = await supabase
        .from('nfc_tags')
        .select('id, business_id, destination_type, custom_url, is_active, is_blocked, approval_status')
        .eq('tag_code', tagCode)
        .maybeSingle();

      if (fetchErr || !tag) { setError('This NFC tag is not registered.'); return; }
      if (!tag.is_active) { setError('This NFC tag has been paused by its owner.'); return; }
      if (tag.is_blocked) { setError('This NFC tag has been blocked by an administrator.'); return; }
      if (tag.approval_status !== 'approved') { setError('This NFC tag is awaiting approval.'); return; }

      const ua = navigator.userAgent;
      const { device_type, browser } = parseUserAgent(ua);

      // Fire-and-forget tap log (trigger increments tap_count)
      supabase.from('nfc_tag_taps').insert({
        tag_id: tag.id,
        referrer_url: document.referrer || null,
        user_agent: ua,
        device_type,
        browser,
      }).then(() => {});

      // Resolve destination
      switch (tag.destination_type) {
        case 'profile':
          if (tag.business_id) navigate(`/entity/${tag.business_id}`, { replace: true });
          else setError('Tag has no business assigned.');
          return;
        case 'review':
          if (tag.business_id) navigate(`/review?to=${tag.business_id}`, { replace: true });
          else setError('Tag has no business assigned.');
          return;
        case 'projects':
          if (tag.business_id) navigate(`/entity/${tag.business_id}#projects`, { replace: true });
          else setError('Tag has no business assigned.');
          return;
        case 'custom':
          if (!tag.custom_url) { setError('Custom URL not set.'); return; }
          try {
            const u = new URL(tag.custom_url);
            setInterstitial({ url: tag.custom_url, domain: u.hostname });
          } catch {
            setError('Invalid custom URL.');
          }
          return;
      }
    };

    run();
  }, [tagCode, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-foreground p-6">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-lg font-semibold text-center">{error}</p>
        <a href="/" className="text-primary underline text-sm">Go to R8ESTATE</a>
      </div>
    );
  }

  if (interstitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-lg text-center space-y-4">
          <ExternalLink className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-xl font-semibold">You're leaving R8ESTATE</h1>
          <p className="text-sm text-muted-foreground">
            This NFC tag will take you to:
          </p>
          <div className="bg-muted rounded-lg px-3 py-2 text-sm font-mono break-all">
            {interstitial.domain}
          </div>
          <p className="text-xs text-muted-foreground">
            R8ESTATE is not responsible for content on external sites.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/', { replace: true })}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => { window.location.href = interstitial.url; }}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default NFCRedirect;
