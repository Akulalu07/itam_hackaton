import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, Heart, Users, Trophy, Calendar, X } from 'lucide-react';
import { notificationService, Notification } from '../../api/services';

// Простая функция форматирования времени
const formatTimeAgo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay} дн. назад`;
    if (diffHour > 0) return `${diffHour} ч. назад`;
    if (diffMin > 0) return `${diffMin} мин. назад`;
    return 'только что';
  } catch {
    return '';
  }
};

interface NotificationBellProps {
  className?: string;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  match: <Heart className="w-4 h-4 text-error" />,
  team_invite: <Users className="w-4 h-4 text-primary" />,
  team_request: <Users className="w-4 h-4 text-info" />,
  team_accepted: <Check className="w-4 h-4 text-success" />,
  team_rejected: <X className="w-4 h-4 text-error" />,
  hackathon_start: <Trophy className="w-4 h-4 text-warning" />,
  hackathon_reminder: <Calendar className="w-4 h-4 text-secondary" />,
};

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getAll(false, 20);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  // Загружаем количество непрочитанных при монтировании
  useEffect(() => {
    fetchUnreadCount();
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Загружаем уведомления при открытии
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkRead = async (notifId: number) => {
    try {
      await notificationService.markRead(notifId);
      setNotifications(prev => 
        prev.map(n => n.id === notifId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    return formatTimeAgo(dateStr);
  };

  return (
    <div className={`dropdown dropdown-end ${className}`}>
      <button 
        className="btn btn-ghost btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="indicator">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="badge badge-xs badge-primary indicator-item">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="dropdown-content z-50 mt-3 w-80 bg-base-200 shadow-xl rounded-box">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-base-300">
            <span className="font-semibold">Уведомления</span>
            {unreadCount > 0 && (
              <button 
                className="btn btn-ghost btn-xs gap-1"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="w-3 h-3" />
                Прочитать все
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-4">
                <span className="loading loading-spinner loading-sm"></span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-base-content/50">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет уведомлений</p>
              </div>
            ) : (
              <ul className="menu menu-sm p-2">
                {notifications.map((notif) => (
                  <li key={notif.id}>
                    <button
                      className={`flex items-start gap-3 p-2 ${!notif.isRead ? 'bg-primary/10' : ''}`}
                      onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {NOTIFICATION_ICONS[notif.type] || <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold' : ''}`}>
                          {notif.title}
                        </p>
                        {notif.message && (
                          <p className="text-xs text-base-content/60 truncate">
                            {notif.message}
                          </p>
                        )}
                        <p className="text-xs text-base-content/40 mt-1">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-base-300">
              <button 
                className="btn btn-ghost btn-block btn-sm"
                onClick={() => setIsOpen(false)}
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
