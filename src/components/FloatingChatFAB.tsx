import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Bot, Phone } from "lucide-react";
import { WhatsAppChatModal } from "./WhatsAppChatModal";
import { AIChatWidget } from "./AIChatWidget";
import { useTranslation } from "react-i18next";

export const FloatingChatFAB = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<"ai" | "whatsapp" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={menuRef} className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
        {/* Menu options */}
        {menuOpen && !activeChat && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => { setActiveChat("ai"); setMenuOpen(false); }}
              className="flex items-center gap-3 bg-card border border-border shadow-lg rounded-full px-4 py-2.5 hover:bg-secondary transition-colors"
            >
              <Bot className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{t("whatsapp.fabAI")}</span>
            </button>
            <button
              onClick={() => { setActiveChat("whatsapp"); setMenuOpen(false); }}
              className="flex items-center gap-3 bg-card border border-border shadow-lg rounded-full px-4 py-2.5 hover:bg-secondary transition-colors"
            >
              <Phone className="w-5 h-5 text-trust-excellent" />
              <span className="text-sm font-medium text-foreground">WhatsApp</span>
            </button>
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => {
            if (activeChat) { setActiveChat(null); }
            else { setMenuOpen(!menuOpen); }
          }}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:bg-primary/90 transition-all"
        >
          {activeChat ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Chat panels */}
      {activeChat === "whatsapp" && (
        <WhatsAppChatModal onClose={() => setActiveChat(null)} />
      )}
      {activeChat === "ai" && (
        <AIChatWidget onClose={() => setActiveChat(null)} />
      )}
    </>
  );
};
