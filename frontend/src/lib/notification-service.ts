import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Adds notifications for multiple users to the notifications table in Supabase.
 *
 * @param supabase - Supabase client instance.
 * @param userIds - An array of user IDs receiving the notification.
 * @param tripId - The ID of the related trip (optional).
 * @param message - The notification message.
 * @returns {Promise<{ success: boolean; error?: string }>} - The result of the operation.
 */
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

/**
 * Fetches notifications by trip ID and read status.
 *
 * @param {supabase} - Supabase client instance.
 * @param {string} tripId - The ID of the trip.
 * @param {boolean} isRead - Whether to fetch read or unread notifications.
 * @returns {Promise<Array>} List of notifications for the trip.
 */
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

/**
 * Fetches notifications with trip details for a specific user.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user to fetch notifications for.
 * @returns Notifications with trip details.
 */
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
          locations
        )
      `
      )
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching read notifications: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error(
      'Error fetching read notifications with trip details:',
      error
    );
    throw error;
  }
};

/**
 * Marks a notification as read in the database.
 *
 * @param notificationId - The ID of the notification to mark as read.
 * @returns A success message or an error.
 */
export const notificationMarkAsRead = async (
  supabase: SupabaseClient,
  notificationId: string
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
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
