import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useChatMessages } from '@/hooks/useMessages';
import { useUserPresence } from '@/hooks/usePresence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatThreadProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  onBack?: () => void;
}

export const ChatThread = ({ conversationId, otherUserId, otherUserName, otherUserAvatar, onBack }: ChatThreadProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChatMessages(conversationId);
  const { isOnline, lastSeen } = useUserPresence(otherUserId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusText = isOnline
    ? t('messages.online', 'Online')
    : lastSeen
      ? t('messages.lastSeen', 'Last seen') + ' ' + formatDistanceToNow(new Date(lastSeen), { addSuffix: true })
      : t('messages.offline', 'Offline');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarImage src={otherUserAvatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {otherUserName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 end-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{otherUserName}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Circle className={cn('w-2 h-2 fill-current', isOnline ? 'text-green-500' : 'text-muted-foreground/40')} />
            {statusText}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">{t('messages.startConversation', 'Say hello! 👋')}</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] px-3.5 py-2 rounded-2xl text-sm',
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={cn(
                    'text-[10px] mt-1',
                    isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  )}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('messages.typeMessage', 'Type a message...')}
            className="flex-1 h-10"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-10 w-10 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
