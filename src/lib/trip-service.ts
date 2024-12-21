import { addTripRequest, TripResponse } from '../context/TripContext';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

/**
 * Saves a new trip to the database.
 *
 * @param supabase - The Supabase client instance for database operations.
 * @param tripData - The trip data to be saved.
 *
 * @returns A promise that resolves when the trip is successfully saved or rejects with an error.
 */
export async function saveTrip(
  supabase: SupabaseClient,
  tripData: addTripRequest,
  userID: string
): Promise<void> {
  try {
    const { data, error } = await supabase.from('trips').insert({
      tripname: tripData.tripname,
      country: tripData.country,
      daterange: tripData.daterange,
      ownerid: userID,
      imageurl: Math.floor(Math.random() * 6) + 1,
    });

    if (error) {
      console.error('Error saving trip:', error.message);
      toast.error('Error saving trip. Please try again.');
    } else {
      console.log('Trip saved successfully:', data);
      toast.success('Trip created successfully!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('An unexpected error occurred while saving the trip.');
  }
}

/**
 * Deletes a trip from the database.
 *
 * @param {SupabaseClient} supabase - The Supabase client instance for database operations.
 * @param {string} tripId - The ID of the trip to be deleted.
 *
 */
export async function deleteTripById(supabase: SupabaseClient, tripId: string) {
  try {
    const { error } = await supabase.from('trips').delete().eq('id', tripId);

    if (error) {
      console.error('Error deleting trip:', error.message);
      toast.error('Error deleting trip. Please try again.');
    } else {
      toast.success('Trip deleted successfully!');
      return true;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('An unexpected error occurred while deleting the trip.');
    return false;
  }
}

/**
 * Updates a trip in the database.
 *
 * @param supabase - The Supabase client instance for database operations.
 * @param tripId - The ID of the trip to update.
 * @param tripData - An object containing updated trip details.
 * @param tripData.tripname - The updated name of the trip.
 * @param tripData.country - The updated country of the trip.
 * @param tripData.daterange - The updated date range of the trip.
 * @param tripData.daterange.from - The start date of the trip in Date format.
 * @param tripData.daterange.to - The end date of the trip in Date format.
 * @param onTripUpdate - A callback function to trigger after a successful trip update.
 * @returns {Promise<void>} - Resolves when the update is successful or rejects with an error.
 */
export async function updateTripByTripId(
  supabase: SupabaseClient,
  tripData: {
    tripid: string;
    tripname: string;
    country: string;
    daterange: { from: Date; to: Date };
  }
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .update({
        tripname: tripData.tripname,
        country: tripData.country,
        daterange: tripData.daterange,
      })
      .eq('id', tripData.tripid);

    if (error) {
      console.error('Error updating trip:', error.message);
      toast.error('Error updating trip. Please try again.');
    } else {
      toast.success('Trip updated successfully!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('An unexpected error occurred while updating the trip.');
  }
}

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

    return (data as TripResponse[]) || [];
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
