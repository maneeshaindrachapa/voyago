import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import {
  fetchUnreadNotificationsByUserId,
  notificationMarkAsRead,
} from '../lib/notification-service';
import { useUser } from '@clerk/clerk-react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { TripResponse } from './TripContext';
import { updateTripSharedUsersByTripId } from '../lib/trip-service';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  trip_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  trips?: TripResponse;
}

interface NotificationContextType {
  notifications: Notification[];
  markNotificationAsRead: (notification: Notification, accept: boolean) => void;
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
  const [refresh, setRefersh] = useState(0);

  useEffect(() => {
    const fetchUserNotifications = async () => {
      try {
        if (user) {
          const data = await fetchUnreadNotificationsByUserId(
            supabase,
            user.id
          );
          setNotifications(data || []);
        } else {
          console.log('User is null or undefined');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUserNotifications();
  }, [user, refresh]);

  const markNotificationAsRead = async (
    notification: Notification,
    accept: boolean
  ) => {
    try {
      await notificationMarkAsRead(supabase, notification.id, accept);
      setRefersh(refresh + 1);
      if (user && notification.trips) {
        const updatedSharedUsers = notification.trips.sharedusers.some(
          (sharedUser) => sharedUser.userId === user?.id
        )
          ? notification.trips.sharedusers
          : [...notification.trips.sharedusers, { userId: user?.id || '' }];
        await updateTripSharedUsersByTripId(
          supabase,
          notification.trips.id,
          updatedSharedUsers
        );
        accept
          ? toast.success(
              'You have accepted the shared trip request for:' +
                notification.trips.tripname
            )
          : toast.warning(
              'You have declined the shared trip request for:' +
                notification.trips.tripname
            );
      }
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
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
