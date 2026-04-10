import { useState } from "react";
import { WhatsAppChatModal } from "./WhatsAppChatModal";
import { AIChatWidget } from "./AIChatWidget";

const WhatsAppAIIcon = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
    {/* WhatsApp phone icon */}
    <path
      d="M24 4C12.954 4 4 12.954 4 24c0 3.537.93 6.856 2.553 9.736L4 44l10.573-2.472A19.92 19.92 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4zm0 36a15.92 15.92 0 01-8.127-2.226l-.583-.348-6.04 1.412 1.437-5.89-.38-.607A15.933 15.933 0 018 24c0-8.837 7.163-16 16-16s16 7.163 16 16-7.163 16-16 16z"
      fill="white"
    />
    <path
      d="M34.176 28.738c-.553-.276-3.27-1.614-3.778-1.798-.508-.184-.878-.276-1.248.276s-1.432 1.798-1.756 2.168c-.324.37-.648.416-1.2.138-.553-.276-2.334-.86-4.446-2.742-1.643-1.464-2.752-3.27-3.076-3.824-.324-.552-.035-.852.243-1.126.25-.248.553-.648.83-.972.276-.324.368-.554.553-.922.184-.37.092-.692-.046-.968-.138-.276-1.248-3.008-1.71-4.118-.45-1.08-.908-0.934-1.248-.952-.324-.016-.692-.02-1.062-.02s-.968.138-1.478.692c-.508.552-1.94 1.89-1.94 4.622 0 2.73 1.986 5.368 2.264 5.738.276.37 3.91 5.97 9.476 8.372 1.324.572 2.358.912 3.164 1.168 1.33.422 2.54.362 3.496.22 1.066-.16 3.27-1.336 3.73-2.626.462-1.29.462-2.396.324-2.626-.138-.23-.508-.368-1.062-.646z"
      fill="white"
    />
    {/* AI sparkle badge */}
    <circle cx="38" cy="10" r="8" fill="#6366f1" stroke="#25D366" strokeWidth="1.5" />
    <path d="M38 6l1.2 2.4L41.6 9.6l-2.4 1.2L38 13.2l-1.2-2.4L34.4 9.6l2.4-1.2z" fill="white" />
  </svg>
);

export const FloatingChatFAB = () => {
  const [activeChat, setActiveChat] = useState<"ai" | "whatsapp" | null>(null);

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 end-4 z-50">
        <button
          onClick={() => setActiveChat(activeChat ? null : "whatsapp")}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ backgroundColor: "#25D366" }}
        >
          <WhatsAppAIIcon size={30} />
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
