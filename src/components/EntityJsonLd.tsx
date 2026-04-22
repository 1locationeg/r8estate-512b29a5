import { useEffect } from "react";
import type { SearchItem } from "@/data/searchIndex";

interface ReviewSchema {
  author_name: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

interface EntityJsonLdProps {
  entity: SearchItem;
  reviews?: ReviewSchema[];
}

const SITE_URL = "https://meter.r8estate.com";

export const EntityJsonLd = ({ entity, reviews = [] }: EntityJsonLdProps) => {
  useEffect(() => {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/entity/${entity.id}`,
      name: entity.name,
      url: `${SITE_URL}/entity/${entity.id}`,
      ...(entity.image && { logo: entity.image, image: entity.image }),
      ...(entity.subtitle && { description: entity.subtitle }),
      ...(entity.rating && entity.reviewCount
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: entity.rating.toFixed(1),
              reviewCount: entity.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
      ...(reviews.length > 0
        ? {
            review: reviews.slice(0, 5).map((r) => ({
              "@type": "Review",
              reviewRating: {
                "@type": "Rating",
                ratingValue: r.rating,
                bestRating: 5,
              },
              author: { "@type": "Person", name: r.author_name || "Verified Buyer" },
              datePublished: r.created_at,
              ...(r.comment ? { reviewBody: r.comment.slice(0, 500) } : {}),
            })),
          }
        : {}),
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Directory", item: `${SITE_URL}/directory` },
        { "@type": "ListItem", position: 3, name: entity.name, item: `${SITE_URL}/entity/${entity.id}` },
      ],
    };

    const scriptId = "entity-jsonld";
    const breadcrumbId = "entity-breadcrumb-jsonld";

    const writeScript = (id: string, payload: object) => {
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement("script");
        el.id = id;
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(payload);
    };

    writeScript(scriptId, orgSchema);
    writeScript(breadcrumbId, breadcrumbSchema);

    return () => {
      document.getElementById(scriptId)?.remove();
      document.getElementById(breadcrumbId)?.remove();
    };
  }, [entity, reviews]);

  return null;
};
