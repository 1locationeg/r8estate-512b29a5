import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Bot, Phone } from "lucide-react";
import { WhatsAppChatModal } from "./WhatsAppChatModal";
import { AIChatWidget } from "./AIChatWidget";

export const FloatingChatFAB = () => {
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
      <div ref={menuRef} className="fixed bottom-20 md:bottom-6 end-4 z-50 flex flex-col items-end gap-2">
        {menuOpen && !activeChat && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <button
              onClick={() => { setActiveChat("ai"); setMenuOpen(false); }}
              className="w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
              title="AI Chat"
            >
              <Bot className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setActiveChat("whatsapp"); setMenuOpen(false); }}
              className="w-11 h-11 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
              style={{ backgroundColor: "#25D366" }}
              title="WhatsApp"
            >
              <Phone className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            if (activeChat) setActiveChat(null);
            else setMenuOpen(!menuOpen);
          }}
          className="w-13 h-13 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ backgroundColor: activeChat ? undefined : "#25D366" }}
          className={`w-13 h-13 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 ${activeChat ? "bg-muted-foreground" : ""}`}
        >
          {activeChat ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {activeChat === "whatsapp" && (
        <WhatsAppChatModal onClose={() => setActiveChat(null)} />
      )}
      {activeChat === "ai" && (
        <AIChatWidget onClose={() => setActiveChat(null)} />
      )}
    </>
  );
};
