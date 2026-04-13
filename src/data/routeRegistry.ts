export interface PublicRoute {
  name: string;
  path: string;
}

/**
 * Single source of truth for all public routes.
 * Add new pages here — Sitemap.tsx picks them up automatically.
 */
export const PUBLIC_ROUTES: PublicRoute[] = [
  { name: "Home", path: "/" },
  { name: "Authentication", path: "/auth" },
  { name: "Reviews", path: "/reviews" },
  { name: "Directory", path: "/directory" },
  { name: "Businesses", path: "/businesses" },
  { name: "Community", path: "/community" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "Rewards", path: "/rewards" },
  { name: "Deal Watch", path: "/deal-watch" },
  { name: "Launch Watch", path: "/launch-watch" },
  { name: "Categories", path: "/categories" },
  { name: "Messages", path: "/messages" },
  { name: "Install App", path: "/install" },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Insights", path: "/insights" },
  { name: "Sitemap", path: "/sitemap" },
  { name: "Our Story", path: "/about" },
  { name: "Join Our Team", path: "/careers" },
  { name: "Contact Us", path: "/contact" },
  { name: "Press Room", path: "/press" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms of Use", path: "/terms" },
  { name: "Cookies Policy", path: "/cookies-policy" },
  { name: "Copyright", path: "/copyright" },
  { name: "Help Center", path: "/help" },
  { name: "Customer Service", path: "/customer-service" },
  { name: "FAQ", path: "/faq" },
  { name: "Report a Problem", path: "/report" },
  { name: "Reviewer Program", path: "/reviewer-program" },
];
