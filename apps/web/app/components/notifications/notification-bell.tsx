'use client'

import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/hooks/use-notifications'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useLanguageSettings } from '@/hooks/use-settings-store'

export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead,
    markAllAsRead,
    isConnected 
  } = useNotifications()
  const { t } = useLanguageSettings()

  const recentNotifications = notifications.slice(0, 5)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '✅'
      case 'WARNING':
        return '⚠️'
      case 'ERROR':
        return '❌'
      case 'SYSTEM':
        return '⚙️'
      default:
        return 'ℹ️'
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (notification.status === 'UNREAD') {
      await markAsRead(notification.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t('notifications')}</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                {t('markAllAsRead')}
              </Button>
            )}
            {!isConnected && (
              <div className="w-2 h-2 bg-orange-500 rounded-full" title={t('disconnected')} />
            )}
            {isConnected && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title={t('connected')} />
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('loadingNotifications')}
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center text-sm text-red-500">
            {error}
          </div>
        )}
        
        {!loading && !error && recentNotifications.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t('noNotifications')}
          </div>
        )}
        
        {!loading && !error && recentNotifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className={cn(
              "flex flex-col items-start p-3 cursor-pointer",
              notification.status === 'UNREAD' && "bg-accent/50"
            )}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-2 w-full">
              <span className="text-base mt-0.5">
                {getNotificationIcon(notification.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn(
                    "text-sm font-medium leading-tight",
                    notification.status === 'UNREAD' && "font-semibold"
                  )}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {notification.message && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}