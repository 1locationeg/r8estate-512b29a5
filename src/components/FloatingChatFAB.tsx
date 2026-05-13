import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { WhatsAppChatModal } from "./WhatsAppChatModal";
import { AIChatWidget } from "./AIChatWidget";
import { MessageSquare, Sparkles } from "lucide-react";

const AIChatIcon = ({ size = 44 }: { size?: number }) => (
  <svg viewBox="0 0 56 56" width={size} height={size} fill="none">
    <defs>
      <linearGradient id="aiFabGrad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
      <radialGradient id="aiFabGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="28" cy="28" r="26" fill="url(#aiFabGlow)" opacity="0.55" />
    <circle cx="28" cy="28" r="22" fill="url(#aiFabGrad)" />
    <circle cx="28" cy="28" r="22" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
    {/* Sparkle / AI star */}
    <path
      d="M28 16l2.6 6.4L37 25l-6.4 2.6L28 34l-2.6-6.4L19 25l6.4-2.6L28 16z"
      fill="white"
    />
    <circle cx="38" cy="18" r="1.6" fill="white" opacity="0.9" />
    <circle cx="18" cy="36" r="1.2" fill="white" opacity="0.8" />
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
          aria-label="Open AI chat"
          className="relative flex items-center justify-center transition-all hover:scale-110 bg-transparent border-none p-0 rounded-full ai-fab-glow"
        >
          <AIChatIcon size={52} />
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
