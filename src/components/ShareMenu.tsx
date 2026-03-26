import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Forward, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareMenuProps {
  /** Title shown in share text */
  title: string;
  /** Optional description for share text */
  description?: string;
  /** URL to share – defaults to current page */
  url?: string;
  /** Custom button label */
  label?: string;
  /** Render as icon-only button */
  iconOnly?: boolean;
  /** Button variant */
  variant?: "ghost" | "outline" | "secondary" | "default";
  /** Button size */
  size?: "sm" | "default" | "icon";
  /** Extra class */
  className?: string;
}

export const ShareMenu = ({
  title,
  description,
  url,
  label,
  iconOnly = false,
  variant = "ghost",
  size = "icon",
  className,
}: ShareMenuProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = description ? `${title} — ${description}` : title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: t("share.linkCopied") });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      toast({ title: t("share.linkCopied") });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(waUrl, "_blank");
    setOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
      } catch {
        // User cancelled or browser blocked share
      }
      setOpen(false);
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Forward className="w-4 h-4 text-current" />
          {!iconOnly && <span>{label || t("share.share")}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="end">
        <div className="space-y-1">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-secondary transition-colors text-start"
          >
            {copied ? <Check className="w-4 h-4 text-trust-excellent" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            <span>{copied ? t("share.copied") : t("share.copyLink")}</span>
          </button>
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-secondary transition-colors text-start"
          >
            <MessageCircle className="w-4 h-4 text-green-500" />
            <span>{t("share.whatsapp")}</span>
          </button>
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-secondary transition-colors text-start"
            >
              <Forward className="w-4 h-4 text-muted-foreground" />
              <span>{t("share.moreOptions")}</span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
