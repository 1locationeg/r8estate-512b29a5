import { useState, useEffect } from "react";
import { Send, Loader2, X } from "lucide-react";
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
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
