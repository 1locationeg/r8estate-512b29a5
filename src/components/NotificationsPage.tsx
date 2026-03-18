import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, Megaphone, MessageSquare, TrendingUp, Star, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { getNotificationLink } from "@/components/NotificationBell";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

export const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    announcement: { icon: <Megaphone className="w-5 h-5" />, label: t("notif.announcements"), color: "text-primary" },
    review: { icon: <MessageSquare className="w-5 h-5" />, label: t("notif.reviews"), color: "text-accent" },
    review_status: { icon: <Star className="w-5 h-5" />, label: t("notif.review_status"), color: "text-brand-gold" },
    trust_score: { icon: <TrendingUp className="w-5 h-5" />, label: t("notif.trust_score"), color: "text-trust-excellent" },
    general: { icon: <Bell className="w-5 h-5" />, label: t("notif.general"), color: "text-muted-foreground" },
  };

  const ALL_TYPES = ["all", "announcement", "review", "review_status", "trust_score", "general"] as const;

  const filtered =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const typeCounts = notifications.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  const handleNotificationClick = (n: Notification) => {
    const link = getNotificationLink(n);
    if (link) {
      if (!n.is_read) markAsRead(n.id);
      navigate(link);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t("notif.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? t("notif.unread_count", { count: unreadCount })
              : t("notif.all_caught_up")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="w-4 h-4" />
              {t("notif.mark_all_read")}
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
            <Link to="../notification-preferences">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t("notif.preferences")}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_TYPES.map((type) => {
          const config = type === "all" ? null : typeConfig[type];
          const count = type === "all" ? notifications.length : typeCounts[type] || 0;
          const isActive = activeFilter === type;

          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {config ? (
                <span className={isActive ? "text-primary-foreground" : config.color}>
                  {config.icon}
                </span>
              ) : (
                <Filter className="w-3.5 h-3.5" />
              )}
              {type === "all" ? t("notif.all") : config?.label}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? "bg-primary-foreground/20" : "bg-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">{t("notif.loading")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">{t("notif.no_notifications")}</p>
          <p className="text-xs text-muted-foreground">
            {activeFilter === "all"
              ? t("notif.empty_all")
              : t("notif.empty_filter")}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
          {filtered.map((n) => {
            const config = typeConfig[n.type] || typeConfig.general;
            const timeAgo = formatDistanceToNow(new Date(n.created_at), { addSuffix: true });
            const link = getNotificationLink(n);

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 flex items-start gap-4 transition-colors ${
                  link ? "cursor-pointer" : ""
                } ${!n.is_read ? "bg-primary/5" : "hover:bg-secondary/30"}`}
              >
                <div
                  className={`mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    !n.is_read ? "bg-primary/10" : "bg-secondary"
                  }`}
                >
                  <span className={config.color}>{config.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-semibold text-foreground ${!n.is_read ? "" : "opacity-70"}`}>
                        {n.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground/70">{timeAgo}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        !n.is_read ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => markAsRead(n.id)}
                      title={t("notif.mark_read")}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteNotification(n.id)}
                    title={t("notif.delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
