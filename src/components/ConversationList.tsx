import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare } from 'lucide-react';
import { useUserPresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { Conversation } from '@/hooks/useMessages';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  loading: boolean;
}

const ConversationItem = ({ conv, isActive, onSelect }: { conv: Conversation; isActive: boolean; onSelect: () => void }) => {
  const { isOnline } = useUserPresence(conv.other_user_id);
  const timeAgo = conv.last_message_at
    ? new Date(conv.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-3 text-start transition-all rounded-lg',
        isActive ? 'bg-primary/10' : 'hover:bg-muted'
      )}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conv.other_user_avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {conv.other_user_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{conv.other_user_name}</span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {conv.last_message || 'No messages yet'}
        </p>
      </div>
      {conv.unread_count > 0 && (
        <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-[20px] flex items-center justify-center rounded-full flex-shrink-0">
          {conv.unread_count}
        </Badge>
      )}
    </button>
  );
};

export const ConversationList = ({ conversations, activeId, onSelect, loading }: ConversationListProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c =>
    c.other_user_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('messages.searchConversations', 'Search conversations...')}
            className="ps-9 h-9 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {t('messages.noConversations', 'No conversations yet')}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {t('messages.startChat', 'Visit a business profile to start a chat')}
            </p>
          </div>
        ) : (
          filtered.map(conv => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={activeId === conv.id}
              onSelect={() => onSelect(conv)}
            />
          ))
        )}
      </div>
    </div>
  );
};
