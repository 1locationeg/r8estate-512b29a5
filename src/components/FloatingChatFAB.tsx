import { useState } from "react";
import { WhatsAppChatModal } from "./WhatsAppChatModal";
import { AIChatWidget } from "./AIChatWidget";

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

export const FloatingChatFAB = () => {
  const [activeChat, setActiveChat] = useState<"ai" | "whatsapp" | null>(null);

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 end-4 z-50">
        <button
          onClick={() => setActiveChat(activeChat ? null : "whatsapp")}
          className="flex items-center justify-center transition-all hover:scale-105 bg-transparent border-none p-0"
        >
          <WhatsAppAIIcon size={40} />
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
