import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, Megaphone, MessageSquare, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, React.ReactNode> = {
  announcement: <Megaphone className="w-4 h-4 text-primary" />,
  review: <MessageSquare className="w-4 h-4 text-accent" />,
  review_status: <Star className="w-4 h-4 text-brand-gold" />,
  trust_score: <TrendingUp className="w-4 h-4 text-trust-excellent" />,
  general: <Bell className="w-4 h-4 text-muted-foreground" />,
};

export const getNotificationLink = (notification: Notification): string | null => {
  const meta = notification.metadata as Record<string, any> | null;
  if (meta?.link) return meta.link;
  if (meta?.url) return meta.url;
  switch (notification.type) {
    case "review":
    case "review_status":
      return meta?.developer_id ? `/reviews?developer=${meta.developer_id}` : "/reviews";
    case "trust_score":
      return "/directory";
    case "announcement":
      return "/community";
    default:
      return null;
  }
};

const NotificationItem = ({
  notification,
  onRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (link: string, id: string) => void;
}) => {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (link) onNavigate(link, notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-b border-border last:border-0 transition-colors ${
        link ? "cursor-pointer hover:bg-secondary/50" : ""
      } ${notification.is_read ? "opacity-60" : "bg-primary/5"}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {typeIcons[notification.type] || typeIcons.general}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-tight">{notification.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {!notification.is_read && (
            <button
              onClick={() => onRead(notification.id)}
              className="p-1 hover:bg-secondary rounded transition-colors"
              title="Mark as read"
            >
              <Check className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1 hover:bg-destructive/10 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleNavigate = (link: string, id: string) => {
    if (!notifications.find((n) => n.id === id)?.is_read) {
      markAsRead(id);
    }
    setOpen(false);
    navigate(link);
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 end-1 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[360px]">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={markAsRead}
                onDelete={deleteNotification}
                onNavigate={handleNavigate}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
