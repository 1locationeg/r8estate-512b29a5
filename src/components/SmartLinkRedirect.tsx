import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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

const SmartLinkRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) { setError(true); return; }

    const redirect = async () => {
      const { data: link, error: fetchErr } = await supabase
        .from('smart_links' as any)
        .select('id, destination_url')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchErr || !link) { setError(true); return; }

      const ua = navigator.userAgent;
      const { device_type, browser } = parseUserAgent(ua);

      // Fire-and-forget click log
      supabase.from('link_clicks' as any).insert({
        link_id: (link as any).id,
        referrer_url: document.referrer || null,
        user_agent: ua,
        device_type,
        browser,
      }).then(() => {});

      window.location.href = (link as any).destination_url;
    };

    redirect();
  }, [slug]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-foreground">
        <p className="text-lg font-semibold">Link not found</p>
        <a href="/" className="text-primary underline text-sm">Go to R8ESTATE</a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default SmartLinkRedirect;
