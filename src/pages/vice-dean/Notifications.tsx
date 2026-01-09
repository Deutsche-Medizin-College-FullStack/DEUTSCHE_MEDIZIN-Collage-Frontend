import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import notificationService from '@/components/api/notificationService';
import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getAllNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notif of unreadNotifications) {
        await notificationService.markNotificationAsRead(notif.id);
      }
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 text-gray-900 dark:text-white" />
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Notifications
              </CardTitle>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={notifications.filter(n => !n.isRead).length === 0}
              >
                Mark all as read
              </button>
              <NotificationDropdown />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 dark:border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                No notifications
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                You don't have any notifications yet. When you receive notifications, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`rounded-lg p-4 transition-all duration-200 ${
                    !notification.isRead 
                      ? 'bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700' 
                      : 'bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {!notification.isRead && (
                          <div className="mt-1.5 flex-shrink-0">
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className={`font-medium mb-1.5 ${
                            !notification.isRead 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-200'
                          }`}>
                            {notification.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {notificationService.formatTimeAgo(notification.createdAt)}
                            </p>
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200 font-medium">
                              {notification.senderRole}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex-shrink-0 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}