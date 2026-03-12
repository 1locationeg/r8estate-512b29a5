import { useState, useEffect } from "react";
import { Phone, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface WhatsAppChatModalProps {
  onClose: () => void;
}

export const WhatsAppChatModal = ({ onClose }: WhatsAppChatModalProps) => {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedReply, setSelectedReply] = useState("");
  const [dbQuickReplies, setDbQuickReplies] = useState<string[] | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sending, setSending] = useState(false);

  // Get quick replies: prefer DB values, fallback to i18n translations
  const quickReplies = dbQuickReplies ?? (t("whatsapp.quickReplies", { returnObjects: true }) as string[]);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", ["whatsapp_number", "whatsapp_quick_replies"]);
      if (data) {
        for (const row of data) {
          if (row.key === "whatsapp_number") setWhatsappNumber(row.value);
          if (row.key === "whatsapp_quick_replies") {
            try { setDbQuickReplies(JSON.parse(row.value)); } catch { /* ignore */ }
          }
        }
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error(t("whatsapp.namePhoneRequired"));
      return;
    }
    if (phone.trim().length < 8) {
      toast.error(t("whatsapp.invalidPhone"));
      return;
    }

    setSending(true);

    // Pre-open a tab/window synchronously (mobile browsers often block window.open after awaits)
    const preOpened = window.open("", "_blank");

    const message = selectedReply || "Hello, I'd like to inquire";

    const { error } = await supabase
      .from("whatsapp_leads" as any)
      .insert({ name: name.trim(), phone: phone.trim(), message } as any);

    setSending(false);

    if (error) {
      try {
        preOpened?.close();
      } catch {
        // ignore
      }
      toast.error(t("whatsapp.error"));
      return;
    }

    const cleanNumber = (whatsappNumber || "").replace(/[^0-9]/g, "");
    if (!cleanNumber) {
      try {
        preOpened?.close();
      } catch {
        // ignore
      }
      toast.error(t("whatsapp.error"));
      return;
    }

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      `${i18n.language === "ar" ? "مرحبًا، اسمي" : "Hi, my name is"} ${name.trim()}. ${message}`
    )}`;

    // Prefer the pre-opened tab; fallback to same-tab navigation if popups are blocked.
    if (preOpened) {
      try {
        preOpened.location.href = whatsappUrl;
        preOpened.focus();
      } catch {
        window.location.href = whatsappUrl;
      }
    } else {
      window.location.href = whatsappUrl;
    }

    toast.success(t("whatsapp.redirecting"));
    onClose();
  };

  return (
    <div className="fixed bottom-24 end-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-white" />
          <div>
            <p className="text-sm font-bold text-white">Trust Chat</p>
            <p className="text-[10px] text-white/80">{t("whatsapp.replyTime")}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">{t("whatsapp.nameLabel")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("whatsapp.namePlaceholder")}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
            maxLength={100}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">{t("whatsapp.phoneLabel")}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("whatsapp.phonePlaceholder")}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
            maxLength={20}
          />
        </div>

        {/* Quick replies */}
        {Array.isArray(quickReplies) && quickReplies.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">{t("whatsapp.howCanWeHelp")}</label>
            <div className="flex flex-wrap gap-1.5">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => setSelectedReply(selectedReply === reply ? "" : reply)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    selectedReply === reply
                      ? "bg-[#25D366]/10 border-[#25D366] text-[#25D366] font-medium"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={sending || !name.trim() || !phone.trim()}
          className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin me-2" />
          ) : (
            <Send className="w-4 h-4 me-2" />
          )}
          {t("whatsapp.startChat")}
        </Button>
      </div>
    </div>
  );
};
