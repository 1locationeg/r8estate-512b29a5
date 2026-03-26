import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, type Conversation } from '@/hooks/useMessages';
import { ConversationList } from '@/components/ConversationList';
import { ChatThread } from '@/components/ChatThread';
import { ChatPresenceToggle } from '@/components/ChatPresenceToggle';
import { MessageSquare, Settings2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Messages = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { conversations, loading, startConversation } = useConversations();
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleSelectConv = (conv: Conversation) => {
    setActiveConv(conv);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: two-panel */}
      <div className="hidden md:flex h-screen max-w-6xl mx-auto border-x border-border">
        {/* Left panel */}
        <div className="w-[340px] border-e border-border flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">{t('messages.title', 'Messages')}</h1>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
          {showSettings && (
            <div className="p-3 border-b border-border">
              <ChatPresenceToggle />
            </div>
          )}
          <ConversationList
            conversations={conversations}
            activeId={activeConv?.id || null}
            onSelect={handleSelectConv}
            loading={loading}
          />
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <ChatThread
              conversationId={activeConv.id}
              otherUserId={activeConv.other_user_id}
              otherUserName={activeConv.other_user_name}
              otherUserAvatar={activeConv.other_user_avatar}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <MessageSquare className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-1">
                {t('messages.selectConversation', 'Select a conversation')}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t('messages.selectDescription', 'Choose a conversation from the list or visit a business profile to start chatting.')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: single panel */}
      <div className="md:hidden flex flex-col h-screen">
        {activeConv ? (
          <ChatThread
            conversationId={activeConv.id}
            otherUserId={activeConv.other_user_id}
            otherUserName={activeConv.other_user_name}
            otherUserAvatar={activeConv.other_user_avatar}
            onBack={() => setActiveConv(null)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-bold text-foreground">{t('messages.title', 'Messages')}</h1>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
            {showSettings && (
              <div className="p-3 border-b border-border">
                <ChatPresenceToggle />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                activeId={null}
                onSelect={handleSelectConv}
                loading={loading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
