import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://meter.r8estate.com";

type RouteMeta = { title: string; description: string };

const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "R8ESTATE — Verified Reviews & Trust Scores for Egyptian Real Estate",
    description:
      "Egypt's off-plan real estate trust platform. Compare developers, read verified buyer reviews, and check Trust Scores before you invest.",
  },
  "/search": {
    title: "Search Developers, Projects & Pros | R8ESTATE",
    description: "Search verified Egyptian real estate developers, projects, and professionals across the R8ESTATE Trust Platform.",
  },
  "/auth": {
    title: "Sign In or Create Account | R8ESTATE",
    description: "Sign in to R8ESTATE to write verified reviews, track developers, and protect your real estate investment.",
  },
  "/directory": {
    title: "Browse Real Estate Categories | R8ESTATE Directory",
    description: "Explore Egyptian real estate categories — developers, brokers, contractors, and more — with verified reviews and Trust Scores.",
  },
  "/categories": {
    title: "Real Estate Categories | R8ESTATE",
    description: "Browse all real estate categories in Egypt — developers, brokers, services and pros — ranked by verified Trust Score.",
  },
  "/reviews": {
    title: "Latest Verified Real Estate Reviews | R8ESTATE",
    description: "Read the latest verified buyer reviews of Egyptian real estate developers and projects on R8ESTATE Meter.",
  },
  "/community": {
    title: "R8ESTATE Community — Buyer Discussions & Stories",
    description: "Join the R8ESTATE community to share off-plan buying experiences, ask questions, and learn from verified buyers.",
  },
  "/leaderboard": {
    title: "Top Reviewers Leaderboard | R8ESTATE",
    description: "Meet the top contributors on R8ESTATE — verified buyers shaping Egypt's real estate trust score.",
  },
  "/insights": {
    title: "Market Insights & Trends | R8ESTATE",
    description: "Trust intelligence, market trends, and developer insights powering smarter off-plan decisions in Egypt.",
  },
  "/portfolio": {
    title: "My Saved Developers & Projects | R8ESTATE",
    description: "Track your saved Egyptian real estate developers and projects, with Trust Score updates and alerts.",
  },
  "/install": {
    title: "Install the R8ESTATE App",
    description: "Install R8ESTATE on your device for instant access to verified Egyptian real estate reviews and Trust Scores.",
  },
  "/deal-watch": {
    title: "Deal Watch — Compare Off-Plan Offers | R8ESTATE",
    description: "Compare side-by-side off-plan offers and get verdicts on which deal protects your money.",
  },
  "/launch-watch": {
    title: "Launch Watch — New Off-Plan Launches | R8ESTATE",
    description: "Track Egypt's newest off-plan launches with delivery history, financials, and Trust Scores.",
  },
  "/rewards": {
    title: "R8ESTATE Rewards Program — Earn Insight Credits",
    description: "Unlock Insight Credits, badges, and tier perks by reviewing developers and helping buyers stay safe.",
  },
  "/copilot": {
    title: "AI Copilot for Real Estate Decisions | R8ESTATE",
    description: "Ask the R8ESTATE Copilot anything about Egyptian developers, off-plan projects, contracts, and trust signals.",
  },
  "/businesses": {
    title: "For Real Estate Businesses | R8ESTATE",
    description: "Claim your business profile and manage your reputation across Egypt's leading real estate trust platform.",
  },
  "/reviewer-program": {
    title: "Reviewer Program — Become a Verified Buyer | R8ESTATE",
    description: "Join the R8ESTATE Reviewer Program — earn rewards for protecting buyers with verified reviews.",
  },
  "/sitemap": {
    title: "Sitemap | R8ESTATE",
    description: "Browse every page of R8ESTATE — categories, developers, projects, community, and resources.",
  },
  "/messages": {
    title: "Messages | R8ESTATE",
    description: "Your conversations with developers, brokers, and the R8ESTATE community.",
  },
  "/about": {
    title: "About R8ESTATE — Egypt's Real Estate Trust Platform",
    description: "R8ESTATE brings transparency to Egyptian off-plan real estate with verified buyer reviews and trust intelligence.",
  },
  "/careers": {
    title: "Careers at R8ESTATE",
    description: "Join the team building Egypt's real estate trust platform. See open roles or get in touch.",
  },
  "/contact": {
    title: "Contact R8ESTATE",
    description: "Reach the R8ESTATE team for support, partnerships, press, or business questions.",
  },
  "/press": {
    title: "Press & Media | R8ESTATE",
    description: "Press kits, media inquiries, and partnership opportunities for the R8ESTATE Trust Platform.",
  },
  "/privacy": {
    title: "Privacy Policy | R8ESTATE",
    description: "How R8ESTATE collects, processes, and protects your personal data on the trust platform.",
  },
  "/terms": {
    title: "Terms of Use | R8ESTATE",
    description: "The terms governing your use of the R8ESTATE platform, reviews, and community features.",
  },
  "/cookies-policy": {
    title: "Cookies Policy | R8ESTATE",
    description: "How R8ESTATE uses cookies and similar technologies, and how you can manage your preferences.",
  },
  "/copyright": {
    title: "Copyright Policy | R8ESTATE",
    description: "R8ESTATE's copyright and intellectual property protections for all platform content.",
  },
  "/help": {
    title: "Help Center | R8ESTATE",
    description: "Guides on writing reviews, managing your profile, and claiming a business on R8ESTATE.",
  },
  "/customer-service": {
    title: "Customer Service | R8ESTATE",
    description: "Get help from the R8ESTATE customer service team — fast response, real humans.",
  },
  "/faq": {
    title: "FAQ — R8ESTATE Trust Platform",
    description: "Answers to common questions about reviews, Trust Scores, claiming businesses, and using R8ESTATE.",
  },
  "/report": {
    title: "Report a Problem | R8ESTATE",
    description: "Found an issue or need to flag content? Report it to the R8ESTATE team.",
  },
  "/products": {
    title: "R8ESTATE Products & Tools",
    description: "The complete suite of R8ESTATE tools — Trust Score, Deal Watch, Compare, Truth Check, R8 Match, and more.",
  },
  "/products/r8-map": {
    title: "R8 Map — Trust-Coded Real Estate Map | R8ESTATE",
    description: "Explore Egypt's real estate landscape on a live trust-coded map of developers and projects.",
  },
  "/impact": {
    title: "Our Impact on Egyptian Real Estate | R8ESTATE",
    description: "How R8ESTATE protects buyers, surfaces trustworthy developers, and raises the bar for the Egyptian property market.",
  },
  "/match": {
    title: "R8 Match — Find Your Right Developer | R8ESTATE",
    description: "Get matched with Egyptian developers and projects that fit your budget, location, and protection needs.",
  },
  "/about-trust-meter": {
    title: "About the R8ESTATE Trust Meter",
    description: "How the R8ESTATE Trust Score is calculated from verified reviews, delivery history, and legal signals.",
  },
  "/compare": {
    title: "Compare Developers Side by Side | R8ESTATE",
    description: "Compare up to 5 Egyptian real estate developers across Trust Score, delivery, reviews, and more.",
  },
  "/truth-check": {
    title: "Truth Check — Verify Developer Claims | R8ESTATE",
    description: "Check whether a developer's claims hold up against verified reviews and platform records.",
  },
  "/demo": {
    title: "R8ESTATE Demo",
    description: "See the R8ESTATE Trust Platform in action — Trust Scores, reviews, and AI insights.",
  },
};

const matchRoute = (pathname: string): RouteMeta | null => {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  // Common dynamic prefixes — let dedicated page-level meta handle these
  if (
    pathname.startsWith("/entity/") ||
    pathname.startsWith("/pro/") ||
    pathname.startsWith("/business") ||
    pathname.startsWith("/buyer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/pro-")
  ) {
    return null;
  }
  return null;
};

/**
 * Per-route head: sets title, description, canonical, og:url, og:title,
 * og:description, twitter:title, twitter:description for each known route.
 * Page-level components (entity, pro) keep their own dedicated meta and
 * are intentionally skipped here.
 */
export const RouteHead = () => {
  const { pathname } = useLocation();
  const meta = matchRoute(pathname);
  if (!meta) return null;
  const url = `${SITE_URL}${pathname}`;
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
    </Helmet>
  );
};

export default RouteHead;