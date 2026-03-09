import { useState, useEffect } from "react";
import { Phone, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WhatsAppChatModalProps {
  onClose: () => void;
}

export const WhatsAppChatModal = ({ onClose }: WhatsAppChatModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedReply, setSelectedReply] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sending, setSending] = useState(false);

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
            try { setQuickReplies(JSON.parse(row.value)); } catch { /* ignore */ }
          }
        }
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    if (phone.trim().length < 8) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSending(true);
    const message = selectedReply || "Hello, I'd like to inquire";

    // Save lead to database
    const { error } = await supabase
      .from("whatsapp_leads" as any)
      .insert({ name: name.trim(), phone: phone.trim(), message } as any);

    setSending(false);

    if (error) {
      toast.error("Something went wrong, please try again");
      return;
    }

    // Open WhatsApp
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      `Hi, my name is ${name.trim()}. ${message}`
    )}`;
    window.open(whatsappUrl, "_blank");
    toast.success("Redirecting to WhatsApp...");
    onClose();
  };

  return (
    <div className="fixed bottom-24 end-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
        <Phone className="w-5 h-5 text-white" />
        <div>
          <p className="text-sm font-bold text-white">WhatsApp Chat</p>
          <p className="text-[10px] text-white/80">We typically reply within minutes</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Your Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
            maxLength={100}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+20 1XX XXX XXXX"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
            maxLength={20}
          />
        </div>

        {/* Quick replies */}
        {quickReplies.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">How can we help?</label>
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
          Start WhatsApp Chat
        </Button>
      </div>
    </div>
  );
};
