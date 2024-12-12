import React, { useEffect, useState } from 'react';
import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import { useUser } from '@clerk/clerk-react';
import { formatDate } from '../lib/common-utils';
import { Edit, Trash } from 'lucide-react';

function TripList() {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('ownerid', user.id);

        if (error) {
          console.error('Error fetching trips:', error.message);
          setError(error.message);
        } else {
          setTrips(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [supabase]);

  const handleEdit = (trip: any) => {
    console.log('Edit Trip:', trip);
    // Implement your edit functionality here
  };

  const handleDelete = async (tripId: string) => {
    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId);
      if (error) {
        console.error('Error deleting trip:', error.message);
      } else {
        setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
        console.log('Trip deleted successfully');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-base font-medium">Your Trips</h1>
      {trips.length === 0 ? (
        <p className="text-base font-medium text-gray-500">No trips found.</p>
      ) : (
        <ul className="space-y-4">
          {trips.map((trip) => {
            const dateRange = trip.daterange || {};
            return (
              <li
                key={trip.id}
                className="flex items-center justify-between p-4 shadow-md rounded-lg border"
              >
                <div>
                  <h2 className="text-lg font-semibold">{trip.tripname}</h2>
                  <p className="text-sm text-gray-600">
                    Country: {trip.country}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date Range: {formatDate(dateRange.from)} -{' '}
                    {formatDate(dateRange.to)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleEdit(trip)}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default TripList;
