
'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Info, CheckCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'event';
  title: string;
  message: string;
  date: string;
  read?: boolean;
}

const placeholderNotifications: NotificationItem[] = [
  {
    id: '1',
    type: 'event',
    title: 'Event Reminder: Annual Tech Symposium',
    message: 'The Annual Tech Symposium is starting in 2 hours in the main auditorium.',
    date: '2024-10-15T08:00:00Z',
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Profile Updated Successfully',
    message: 'Your profile information has been saved.',
    date: '2024-10-14T15:30:00Z',
    read: true,
  },
  {
    id: '3',
    type: 'warning',
    title: 'Upcoming Maintenance',
    message: 'ClgGallery will be undergoing scheduled maintenance on Oct 20th from 2 AM to 4 AM.',
    date: '2024-10-12T10:00:00Z',
    read: false,
  },
  {
    id: '4',
    type: 'info',
    title: 'New Feature: Dark Mode',
    message: 'You can now enable dark mode from your settings page.',
    date: '2024-10-10T11:00:00Z',
    read: true,
  },
];

function getNotificationIcon(type: NotificationItem['type']) {
  switch (type) {
    case 'event':
      return <Bell className="h-5 w-5 text-primary" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(placeholderNotifications);
  const [isMounted, setIsMounted] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been removed.",
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Notification Center</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Stay updated with the latest alerts, messages, and reminders.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <span>All Notifications</span>
              {unreadCount > 0 && <Badge variant="destructive" className="ml-2">{unreadCount} Unread</Badge>}
            </CardTitle>
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAllNotifications}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <CardDescription>
            Here are your recent notifications. Click on a notification to mark it as read.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 border-l-4 ${notification.read ? 'opacity-70 bg-muted/30' : 'bg-card hover:shadow-md'} transition-all cursor-pointer`}
                style={{ borderLeftColor: notification.type === 'event' ? 'hsl(var(--primary))' : notification.type === 'success' ? 'hsl(var(--chart-2))' : notification.type === 'warning' ? 'hsl(var(--chart-4))' : 'hsl(var(--accent))' }}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h3 className={`font-semibold ${notification.read ? 'font-normal' : ''}`}>{notification.title}</h3>
                      {!notification.read && <Badge variant="outline" className="text-xs">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isMounted ? new Date(notification.date).toLocaleDateString() : new Date(notification.date).toISOString().split('T')[0]}
                      {' - '}
                      {isMounted ? new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(notification.date).toISOString().split('T')[1].substring(0,8)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">You have no notifications right now.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
