import { SupabaseClient } from '@supabase/supabase-js';

export const addNotificationsForTripShare = async (
  supabase: SupabaseClient,
  userIds: string[],
  tripId: string | null,
  message: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create an array of notification objects
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      trip_id: tripId,
      message,
    }));

    // Insert the notifications into the table
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Error adding notifications:', error.message);
      return { success: false, error: error.message };
    }

    console.log('Notifications added successfully:', data);
    return { success: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const fetchNotificationsByTrip = async (
  supabase: SupabaseClient,
  tripId: string
) => {
  try {
    // Fetch notifications for the specific trip
    const { data, error } = await supabase
      .from('notifications')
      .select('user_id, message, is_read, created_at')
      .eq('trip_id', tripId);

    if (error) {
      console.error('Error fetching notifications:', error.message);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching notifications:', err);
    throw err;
  }
};

export const fetchUnreadNotificationsByUserId = async (
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(
        `
        *,
        trips (
          id,
          tripname,
          country,
          daterange,
          ownerid,
          created_at,
          imageurl,
          locations,
          sharedusers
        )
      `
      )
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching unread notifications: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error(
      'Error fetching unread notifications with trip details:',
      error
    );
    throw error;
  }
};

export const notificationMarkAsRead = async (
  supabase: SupabaseClient,
  notificationId: string,
  accept: boolean
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, accept: accept })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
