import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import notificationService from '@/components/api/notificationService';
import { useState, useEffect } from 'react';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getAllNotifications();
        // Filter notifications for student if needed
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Notifications</CardTitle>
            <NotificationDropdown />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border-b pb-4">
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {notificationService.formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}