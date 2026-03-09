import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reads og_title, og_description, og_image from platform_settings
 * and injects them into the document <head> so link previews
 * (WhatsApp, social media) pick up the latest values.
 */
export const DynamicMeta = () => {
  const [meta, setMeta] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMeta = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["og_title", "og_description", "og_image"]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r) => (map[r.key] = r.value));
        setMeta(map);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    if (!Object.keys(meta).length) return;

    const setMetaTag = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setNameMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (meta.og_title) {
      document.title = meta.og_title;
      setMetaTag("og:title", meta.og_title);
      setNameMeta("twitter:title", meta.og_title);
    }
    if (meta.og_description) {
      setNameMeta("description", meta.og_description);
      setMetaTag("og:description", meta.og_description);
      setNameMeta("twitter:description", meta.og_description);
    }
    if (meta.og_image) {
      setMetaTag("og:image", meta.og_image);
      setNameMeta("twitter:image", meta.og_image);
    }
  }, [meta]);

  return null;
};
