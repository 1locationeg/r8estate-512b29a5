import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { WhatsAppChatModal } from "./WhatsAppChatModal";
import { AIChatWidget } from "./AIChatWidget";
import { MessageSquare, Sparkles } from "lucide-react";

const WhatsAppAIIcon = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
    <circle cx="24" cy="24" r="22" fill="#25D366" />
    <path
      d="M24 8C15.163 8 8 15.163 8 24c0 2.828.744 5.485 2.042 7.789L8 40l8.41-1.978A15.936 15.936 0 0024 40c8.837 0 16-7.163 16-16S32.837 8 24 8zm0 28.8a12.736 12.736 0 01-6.502-1.781l-.466-.278-4.832 1.13 1.15-4.712-.304-.486A12.747 12.747 0 0111.2 24c0-7.07 5.73-12.8 12.8-12.8S36.8 16.93 36.8 24 31.07 36.8 24 36.8z"
      fill="white"
    />
    <path
      d="M31.341 27.39c-.442-.22-2.616-1.291-3.022-1.438-.407-.147-.702-.22-.998.221-.297.442-1.146 1.438-1.405 1.734-.259.296-.518.333-.96.11-.442-.22-1.867-.688-3.557-2.193-1.314-1.171-2.202-2.616-2.461-3.06-.259-.441-.028-.681.194-.901.2-.198.442-.518.664-.778.221-.259.294-.443.442-.737.147-.296.074-.554-.037-.775-.11-.22-.998-2.406-1.368-3.294-.36-.864-.726-.747-.998-.762-.259-.012-.554-.016-.85-.016s-.774.11-1.182.554c-.407.442-1.552 1.512-1.552 3.697 0 2.184 1.589 4.294 1.811 4.59.221.297 3.128 4.776 7.581 6.698 1.06.457 1.886.73 2.531.934 1.064.338 2.032.29 2.797.176.853-.128 2.616-1.069 2.984-2.101.369-1.032.369-1.917.259-2.101-.11-.184-.407-.294-.85-.515z"
      fill="white"
    />
    <circle cx="38" cy="10" r="7" fill="#6366f1" />
    <path d="M38 6.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="white" />
  </svg>
);

const WhatsAppMiniIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
    <circle cx="24" cy="24" r="22" fill="#25D366" />
    <path
      d="M24 10C16.268 10 10 16.268 10 24c0 2.476.652 4.8 1.787 6.81L10 38l7.368-1.726A13.94 13.94 0 0024 38c7.732 0 14-6.268 14-14S31.732 10 24 10z"
      fill="white"
    />
    <path
      d="M30.5 27c-.4-.2-2.4-1.2-2.8-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.3 1.6-.2.3-.5.3-.9.1-.4-.2-1.7-.6-3.2-2-1.2-1.1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.2-1.2-3-.3-.8-.7-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 3.9 1.7 4.2c.2.3 2.9 4.4 7 6.1 1 .4 1.7.7 2.3.9 1 .3 1.9.3 2.6.2.8-.1 2.4-1 2.7-1.9.3-1 .3-1.8.2-1.9-.1-.2-.4-.3-.8-.5z"
      fill="#25D366"
    />
  </svg>
);

export const FloatingChatFAB = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<"ai" | "whatsapp" | null>(null);
  const [visible, setVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const openChat = (type: "ai" | "whatsapp") => {
    setMenuOpen(false);
    setActiveChat(type);
  };

  if (pathname.startsWith('/messages')) {
    return null;
  }

  return (
    <>
      <div className={`fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+4px)] md:bottom-6 ltr:right-[calc(env(safe-area-inset-right,0px)+12px)] rtl:left-[calc(env(safe-area-inset-left,0px)+12px)] z-40 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`} ref={menuRef}>
        {/* Option buttons */}
        <div
          className={`flex flex-col items-end gap-2 mb-2 transition-all duration-200 ${
            menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          <button
            onClick={() => openChat("whatsapp")}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700"
          >
            <WhatsAppMiniIcon size={20} />
            WhatsApp
          </button>
          <button
            onClick={() => openChat("ai")}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100 hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700"
          >
            <Sparkles size={18} className="text-indigo-500" />
            AI Chat
          </button>
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-center transition-all hover:scale-105 bg-transparent border-none p-0"
        >
          <WhatsAppAIIcon size={44} />
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
