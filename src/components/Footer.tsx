import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Facebook, Linkedin, Youtube, Instagram, Send,
} from "lucide-react";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  x: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  tiktok: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.1v-3.52a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.76 1.52V6.69h-1z"/></svg>,
  threads: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007C5.461 23.93.052 18.47.052 11.742.052 5.023 5.478-.051 12.193-.051c6.726 0 12.147 5.075 12.147 11.793 0 4.54-2.459 8.543-6.35 10.633l-1.01-2.24a9.3 9.3 0 004.91-8.393C21.89 6.25 17.54 2.05 12.193 2.05 6.856 2.05 2.502 6.25 2.502 11.742c0 5.48 4.338 9.692 9.684 9.758v2.5z"/></svg>,
  pinterest: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>,
};

const COMPANY_LINKS = [
  { label: "Our Story", to: "/about" },
  { label: "Businesses", to: "/businesses" },
  { label: "Join Our Team", to: "/careers" },
  { label: "Contact Us", to: "/contact" },
  { label: "Press Room", to: "/press" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Use", to: "/terms" },
  { label: "Cookies Policy", to: "/cookies-policy" },
  { label: "Copyright Policy", to: "/copyright" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", to: "/help" },
  { label: "Customer Service", to: "/customer-service" },
  { label: "FAQ", to: "/faq" },
  { label: "Report a Problem", to: "/report" },
];

type SocialLink = { platform: string; url: string; enabled: boolean };

export const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "footer_social_links")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          try { setSocialLinks(JSON.parse(data.value)); } catch {}
        }
      });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribing(true);
    const { error } = await supabase
      .from("newsletter_subscribers" as any)
      .insert([{ email: trimmed }] as any);
    setSubscribing(false);
    if (error) {
      if (error.code === "23505") toast.info("You're already subscribed!");
      else toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("Subscribed successfully! 🎉");
      setEmail("");
    }
  };

  const enabledSocials = socialLinks.filter((s) => s.enabled && s.url);

  return (
    <footer className="bg-slate-900 text-slate-200 safe-bottom">

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {/* Newsletter + Social */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Subscribe</h3>
              <p className="text-sm text-slate-400 mb-4">
                Get trust reports,  exclusive deals. Join 39K+ users. 
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 flex-1"
                />
                <Button type="submit" size="sm" disabled={subscribing} className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {enabledSocials.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-white mb-3">Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  {enabledSocials.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-primary/80 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                      aria-label={s.platform}
                    >
                      {SOCIAL_ICONS[s.platform] || <span className="text-xs uppercase">{s.platform[0]}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrandLogo size="hero" className="hover:scale-105 transition-transform duration-200" />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/sitemap" className="hover:text-foreground transition-colors">
              Sitemap
            </Link>
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
