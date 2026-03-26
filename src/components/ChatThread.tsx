import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/contexts/AuthContext';
import { useChatMessages } from '@/hooks/useMessages';
import { useUserPresence } from '@/hooks/usePresence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Circle, Bold, Italic, List, Link2, Quote, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatThreadProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  onBack?: () => void;
}

interface SelectionResult {
  nextValue: string;
  selectionStart: number;
  selectionEnd: number;
}

export const ChatThread = ({ conversationId, otherUserId, otherUserName, otherUserAvatar, onBack }: ChatThreadProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChatMessages(conversationId);
  const { isOnline, lastSeen } = useUserPresence(otherUserId);
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateSelection = (transform: (selectedText: string, start: number, end: number) => SelectionResult) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? input.length;
    const end = textarea?.selectionEnd ?? input.length;
    const selectedText = input.slice(start, end);
    const result = transform(selectedText, start, end);

    setInput(result.nextValue);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const wrapSelection = (prefix: string, suffix = prefix, placeholder = 'text') => {
    updateSelection((selectedText, start, end) => {
      const content = selectedText || placeholder;
      const nextValue = `${input.slice(0, start)}${prefix}${content}${suffix}${input.slice(end)}`;
      const contentStart = start + prefix.length;
      const contentEnd = contentStart + content.length;

      return {
        nextValue,
        selectionStart: contentStart,
        selectionEnd: contentEnd,
      };
    });
  };

  const prefixLines = (prefix: string, placeholder: string) => {
    updateSelection((selectedText, start, end) => {
      const content = selectedText || placeholder;
      const lines = content.split('\n').map((line) => `${prefix}${line}`).join('\n');
      const nextValue = `${input.slice(0, start)}${lines}${input.slice(end)}`;

      return {
        nextValue,
        selectionStart: start,
        selectionEnd: start + lines.length,
      };
    });
  };

  const insertLink = () => {
    updateSelection((selectedText, start, end) => {
      const label = selectedText || 'link text';
      const template = `[${label}](https://)`;
      const nextValue = `${input.slice(0, start)}${template}${input.slice(end)}`;
      const urlStart = start + label.length + 3;
      const urlEnd = urlStart + 'https://'.length;

      return {
        nextValue,
        selectionStart: urlStart,
        selectionEnd: urlEnd,
      };
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    setShowPreview(false);
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const statusText = isOnline
    ? t('messages.online', 'Online')
    : lastSeen
      ? `${t('messages.lastSeen', 'Last seen')} ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
      : t('messages.offline', 'Offline');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
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
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] px-3.5 py-2 rounded-2xl text-sm',
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  <div
                    className={cn(
                      'prose prose-sm max-w-none break-words prose-p:my-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-blockquote:my-2 prose-blockquote:border-s prose-blockquote:border-border prose-blockquote:ps-3 prose-a:break-all',
                      isMine && 'prose-invert'
                    )}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    )}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="rounded-2xl border border-border bg-card p-2 space-y-2">
          <div className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => wrapSelection('**')}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => wrapSelection('*')}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => prefixLines('- ', 'List item')}>
              <List className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => prefixLines('> ', 'Quoted text')}>
              <Quote className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={insertLink}>
              <Link2 className="w-4 h-4" />
            </Button>
            <div className="ms-auto">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview((prev) => !prev)}>
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {showPreview && (
            <div className="rounded-xl border border-border bg-background px-3 py-2 max-h-40 overflow-y-auto">
              {input.trim() ? (
                <div className="prose prose-sm max-w-none break-words prose-p:my-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-blockquote:my-2 prose-blockquote:border-s prose-blockquote:border-border prose-blockquote:ps-3 prose-a:break-all">
                  <ReactMarkdown>{input}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('messages.previewPlaceholder', 'Message preview will appear here.')}
                </p>
              )}
            </div>
          )}

          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('messages.typeRichMessage', 'Write a message... Use the toolbar for rich text. Ctrl/Cmd + Enter to send.')}
              className="flex-1 min-h-[88px] max-h-40 resize-none border-0 shadow-none focus-visible:ring-0"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-11 w-11 rounded-full shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
