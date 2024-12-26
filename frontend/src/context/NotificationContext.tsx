import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import {
  fetchNotificationsbyUserId,
  notificationMarkAsRead,
} from '../lib/notification-service';
import { useUser } from '@clerk/clerk-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Notification {
  id: string;
  user_id: string;
  trip_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  markNotificationAsRead: () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();

  useEffect(() => {
    const fetchUserNotifications = async () => {
      try {
        if (user) {
          const data = await fetchNotificationsbyUserId(supabase, user.id);
          setNotifications(data || []);
        } else {
          console.log('User is null or undefined');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUserNotifications();
  }, [user]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationMarkAsRead(supabase, notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, markNotificationAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);