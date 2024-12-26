import { addTripRequest, TripResponse } from '../context/TripContext';
import { SupabaseClient } from '@supabase/supabase-js';
import { json } from 'body-parser';
import { toast } from 'sonner';

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

export const updateTripLocations = async (
  supabase: SupabaseClient,
  tripId: string,
  locations: {
    lat: number;
    lng: number;
    location: string;
    userId: string;
    color: string;
  }[]
) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .update({ locations })
      .eq('id', tripId);

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

export const updateTripSharedUsersByTripId = async (
  supabase: SupabaseClient,
  tripId: string,
  sharedusers: { userId: string }[]
) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .update({ sharedusers })
      .eq('id', tripId);

    if (error) {
      console.error('Error updating shared users:', error.message);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    throw err;
  }
};

export const fetchTripsSharedWithUser = async (
  supabase: SupabaseClient,
  userId: string
): Promise<TripResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .filter('sharedusers', 'cs', JSON.stringify([{ userId: userId }]));

    console.log('Raw data from Supabase:', data);

    if (error) {
      throw new Error(`Error fetching trips: ${error.message}`);
    }

    return data as TripResponse[];
  } catch (error) {
    console.error('Error fetching trips shared with the user:', error);
    throw error;
  }
};
