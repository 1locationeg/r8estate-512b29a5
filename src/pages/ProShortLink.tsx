import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_DESCRIPTION =
  'R8ESTATE professional trust page — showcasing real client reviews, expertise, achievements, certifications, and trusted off-plan real estate experience.';
const DEFAULT_OG_IMAGE =
  'https://mcekdnvxeblikixmfyni.supabase.co/storage/v1/object/public/og-assets/r8estate-og.png';

/**
 * Smart short-link for professional Trust Pages.
 *
 * Shape: https://<domain>/p/<slug>
 * - JS-executing crawlers (Googlebot, Twitterbot) read per-pro OG via Helmet.
 * - Static-only crawlers fall back to the sitewide og:* in index.html.
 * - Humans get instant client-side redirect to /pro/<slug>.
 */
export default function ProShortLink() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [meta, setMeta] = useState<{
    title: string;
    description: string;
    image: string;
  } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.rpc('get_professional_by_slug', { _slug: slug });
        const row = Array.isArray(data) ? data[0] : null;

        let image = DEFAULT_OG_IMAGE;
        let title = `R8ESTATE Trust Page · ${slug.replace(/-/g, ' ')}`;
        let description = DEFAULT_DESCRIPTION;

        if (row) {
          if (row.full_name) title = `${row.full_name} — R8ESTATE Trust Page`;
          if (row.cover_url) image = row.cover_url;
          if (row.headline) description = `${row.headline}. ${DEFAULT_DESCRIPTION}`;
        }

        // Optional admin override
        const { data: ovr } = await supabase
          .from('og_overrides' as never)
          .select('image_url, title, description, enabled')
          .eq('slug', slug)
          .maybeSingle();
        const o = ovr as { image_url?: string; title?: string; description?: string; enabled?: boolean } | null;
        if (o?.enabled) {
          if (o.image_url) image = o.image_url;
          if (o.title) title = o.title;
          if (o.description) description = o.description;
        }

        if (!cancelled) setMeta({ title, description, image });
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (ready) return <Navigate to={`/pro/${slug}`} replace />;

  const shareUrl = `${window.location.origin}/p/${slug}`;
  return (
    <>
      {meta && (
        <Helmet>
          <title>{meta.title}</title>
          <meta name="description" content={meta.description} />
          <meta property="og:title" content={meta.title} />
          <meta property="og:description" content={meta.description} />
          <meta property="og:image" content={meta.image} />
          <meta property="og:url" content={shareUrl} />
          <meta property="og:type" content="profile" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={meta.title} />
          <meta name="twitter:description" content={meta.description} />
          <meta name="twitter:image" content={meta.image} />
          <link rel="canonical" href={`${window.location.origin}/pro/${slug}`} />
        </Helmet>
      )}
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </>
  );
}