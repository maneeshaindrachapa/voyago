import React, { useEffect, useRef, useState } from 'react';
import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import { useUser } from '@clerk/clerk-react';
import { formatDate } from '../lib/common-utils';
import { ChevronLeft, ChevronRight, Edit, Trash } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

function TripList({ onTripSelect }: { onTripSelect: (trip: any) => void }) {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to the next/previous card
  const scrollToCard = (direction: 'left' | 'right') => {
    if (scrollRef.current && scrollRef.current.firstElementChild) {
      const cardWidth = scrollRef.current.firstElementChild.clientWidth + 20;
      let i = 0;
      direction === 'right' ? (i = i + 1) : (i = i - 1);

      i <= 0 ? setShowLeftButton(false) : setShowLeftButton(true);
      i == trips.length - 1
        ? setShowRightButton(false)
        : setShowRightButton(true);

      console.log(i);
      scrollRef.current.scrollBy({
        left: direction === 'right' ? cardWidth : -cardWidth,
        behavior: 'smooth',
      });
    } else {
      console.warn('No child elements found in the scroll container.');
    }
  };

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

  const handleTripClick = (trip: any) => {
    onTripSelect(trip);
  };

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

  if (loading || error)
    return (
      <>
        <div className="flex flex-col space-y-3 p-2">
          <Skeleton className="h-[20vh] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-[10vh] w-full rounded-xl" />
        </div>
      </>
    );

  return (
    <div className="relative h-full flex flex-col">
      {trips.length === 0 ? (
        <p className="text-base font-medium text-gray-500 text-center">
          No trips found.
        </p>
      ) : (
        <div className="relative h-full">
          {/* Scrollable Cards Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto h-full scrollbar-hide"
          >
            {trips.map((trip) => {
              const dateRange = trip.daterange || {};
              return (
                <div
                  key={trip.id}
                  className="flex-shrink-0 w-full h-full rounded-lg shadow-md bg-cover bg-center relative "
                  style={{
                    backgroundImage: `url('/backgrounds/${trip.imageurl}.jpg')`,
                  }}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/80 rounded-lg"></div>

                  {/* Content */}
                  <div className="relative flex flex-col justify-between h-full p-4 text-white">
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 mt-4 justify-between">
                      <button
                        onClick={() => handleEdit(trip)}
                        className="text-white hover:text-white transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(trip.id)}
                        className="text-red-400 hover:text-red-500 transition-colors"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold font-voyago">
                        {trip.tripname}
                      </h2>
                      <p className="text-sm font-voyago">{trip.country}</p>
                      <p className="text-sm font-voyago">
                        {formatDate(dateRange.from)} -{' '}
                        {formatDate(dateRange.to)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left and Right Buttons */}
          {showLeftButton && (
            <button
              onClick={() => scrollToCard('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-white p-2 rounded-full transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {showRightButton && (
            <button
              onClick={() => scrollToCard('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white p-2 rounded-full  transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TripList;
