import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { usePresence } from '@/hooks/usePresence';

export const ChatPresenceToggle = () => {
  const { t } = useTranslation();
  const { hideOnlineStatus, toggleHideOnlineStatus } = usePresence();

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2.5">
        {hideOnlineStatus ? (
          <EyeOff className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Eye className="w-4 h-4 text-primary" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {t('messages.showOnlineStatus', 'Show online status')}
          </p>
          <p className="text-xs text-muted-foreground">
            {hideOnlineStatus
              ? t('messages.hiddenDescription', 'Others cannot see when you are online')
              : t('messages.visibleDescription', 'Others can see when you are online')}
          </p>
        </div>
      </div>
      <Switch
        checked={!hideOnlineStatus}
        onCheckedChange={(checked) => toggleHideOnlineStatus(!checked)}
      />
    </div>
  );
};
