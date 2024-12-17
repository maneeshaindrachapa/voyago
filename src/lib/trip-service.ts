import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches trips for a specific user.
 *
 * @param supabase - The Supabase client instance.
 * @param userId - The ID of the user to fetch trips for.
 * @returns A promise resolving to the list of trips or an error.
 */
export const fetchTripsByUser = async (
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('ownerid', userId);

    if (error) {
      console.error('Error fetching trips:', error.message);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error:', err);
    throw err;
  }
};

/**
 * Updates the locations for a specific trip.
 *
 * @param supabase - The Supabase client instance.
 * @param tripId - The ID of the trip to update.
 * @param locations - An array of locations to be updated in the 'locations' JSONB column.
 * @returns A promise that resolves to the updated data or throws an error.
 */
export const updateTripLocations = async (
  supabase: SupabaseClient,
  tripId: string,
  locations: { lat: number; lng: number; location: string }[]
) => {
  try {
    const { data, error } = await supabase
      .from('trips') // Replace 'trips' with your table name
      .update({ locations }) // Update the 'locations' JSONB column
      .eq('id', tripId); // Filter to update the specific trip by ID

    if (error) {
      console.error('Error updating trip locations:', error.message);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    throw err;
  }
};
