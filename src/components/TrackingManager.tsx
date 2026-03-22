import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackerConfig {
  key: string;
  idKey: string;
  scriptId: string;
  inject: (id: string) => void;
}

const TRACKERS: TrackerConfig[] = [
  {
    key: "mouseflow_enabled",
    idKey: "mouseflow_id",
    scriptId: "mouseflow-script",
    inject: (id: string) => {
      (window as any)._mfq = (window as any)._mfq || [];
      const s = document.createElement("script");
      s.id = "mouseflow-script";
      s.defer = true;
      s.src = `//cdn.mouseflow.com/projects/${id}.js`;
      document.head.appendChild(s);
    },
  },
  {
    key: "ga4_enabled",
    idKey: "ga4_id",
    scriptId: "ga4-script",
    inject: (id: string) => {
      const s = document.createElement("script");
      s.id = "ga4-script";
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(s);
      const s2 = document.createElement("script");
      s2.id = "ga4-inline";
      s2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
      document.head.appendChild(s2);
    },
  },
  {
    key: "meta_pixel_enabled",
    idKey: "meta_pixel_id",
    scriptId: "meta-pixel-script",
    inject: (id: string) => {
      const s = document.createElement("script");
      s.id = "meta-pixel-script";
      s.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`;
      document.head.appendChild(s);
    },
  },
  {
    key: "hotjar_enabled",
    idKey: "hotjar_id",
    scriptId: "hotjar-script",
    inject: (id: string) => {
      const s = document.createElement("script");
      s.id = "hotjar-script";
      s.textContent = `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${id},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=6');`;
      document.head.appendChild(s);
    },
  },
  {
    key: "clarity_enabled",
    idKey: "clarity_id",
    scriptId: "clarity-script",
    inject: (id: string) => {
      const s = document.createElement("script");
      s.id = "clarity-script";
      s.textContent = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`;
      document.head.appendChild(s);
    },
  },
];

/**
 * Dynamically loads all enabled tracking scripts based on platform_settings.
 */
export const TrackingManager = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const keys = TRACKERS.flatMap((t) => [t.key, t.idKey]);
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", keys);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r) => (map[r.key] = r.value));
        setSettings(map);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!Object.keys(settings).length) return;

    TRACKERS.forEach((tracker) => {
      const enabled = settings[tracker.key] === "true";
      const id = settings[tracker.idKey];

      if (enabled && id && !document.getElementById(tracker.scriptId)) {
        tracker.inject(id);
      }
    });

    return () => {
      TRACKERS.forEach((tracker) => {
        const el = document.getElementById(tracker.scriptId);
        if (el) el.remove();
        // Clean up GA4 inline script too
        if (tracker.scriptId === "ga4-script") {
          const inline = document.getElementById("ga4-inline");
          if (inline) inline.remove();
        }
      });
    };
  }, [settings]);

  return null;
};
