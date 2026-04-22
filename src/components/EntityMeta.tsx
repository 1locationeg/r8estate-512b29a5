import { useEffect } from "react";
import type { SearchItem } from "@/data/searchIndex";

interface EntityMetaProps {
  entity: SearchItem;
  lastUpdated?: string;
}

const SITE_URL = "https://meter.r8estate.com";

const upsertMeta = (selector: string, attrName: string, attrValue: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
};

const upsertLink = (rel: string, href: string, hreflang?: string) => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
};

export const EntityMeta = ({ entity, lastUpdated }: EntityMetaProps) => {
  useEffect(() => {
    const year = new Date().getFullYear();
    const score = entity.rating ? Math.round(entity.rating * 20) : null;
    const reviewCount = entity.reviewCount ?? 0;
    const subtitle = entity.subtitle ?? "Real Estate";

    const title = score
      ? `${entity.name} — Trust Score ${score}/100 & ${reviewCount} Reviews ${year} | R8ESTATE Meter`
      : `${entity.name} — Reviews & Trust Profile ${year} | R8ESTATE Meter`;

    const description = score
      ? `See ${entity.name}'s verified Trust Score (${score}/100) based on ${reviewCount} buyer reviews. ${subtitle}. Compare delivery history, legal standing, and customer sentiment on R8ESTATE Meter.`
      : `Discover verified reviews, trust signals, and buyer sentiment for ${entity.name} (${subtitle}) on R8ESTATE Meter — Egypt's off-plan real estate trust platform.`;

    const canonical = `${SITE_URL}/entity/${entity.id}`;
    const image = entity.image && entity.image.startsWith("http")
      ? entity.image
      : `${SITE_URL}${entity.image ?? "/favicon.png"}`;

    const prevTitle = document.title;
    document.title = title;

    const created: HTMLElement[] = [];
    const trackCreated = (el: HTMLElement | null) => {
      if (el && !el.dataset.entityMetaTracked) {
        el.dataset.entityMetaTracked = "1";
        created.push(el);
      }
    };

    trackCreated(upsertMeta('meta[name="description"]', "name", "description", description));
    trackCreated(upsertMeta('meta[property="og:title"]', "property", "og:title", title));
    trackCreated(upsertMeta('meta[property="og:description"]', "property", "og:description", description));
    trackCreated(upsertMeta('meta[property="og:image"]', "property", "og:image", image));
    trackCreated(upsertMeta('meta[property="og:url"]', "property", "og:url", canonical));
    trackCreated(upsertMeta('meta[property="og:type"]', "property", "og:type", "profile"));
    trackCreated(upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title));
    trackCreated(upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description));
    trackCreated(upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", image));

    if (lastUpdated) {
      trackCreated(upsertMeta('meta[name="last-modified"]', "name", "last-modified", lastUpdated));
    }

    trackCreated(upsertLink("canonical", canonical));
    trackCreated(upsertLink("alternate", canonical, "en"));
    trackCreated(upsertLink("alternate", canonical, "ar"));
    trackCreated(upsertLink("alternate", canonical, "x-default"));

    return () => {
      document.title = prevTitle;
      // Reset descriptions to safe defaults — leave OG defaults from index.html for next page
    };
  }, [entity, lastUpdated]);

  return null;
};
