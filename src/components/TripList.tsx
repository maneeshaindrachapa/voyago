import React, { useEffect, useRef, useState } from 'react';
import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import { useUser } from '@clerk/clerk-react';
import { formatDate } from '../lib/common-utils';
import { ChevronLeft, ChevronRight, Edit, Share, Trash } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { fetchTripsByUser } from '../lib/trip-service';
import { toast } from 'sonner';

import { Avatar, AvatarImage } from './ui/avatar';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';
import TripForm from './TripForm';

function TripList({
  onTripSelect,
  refresh,
}: {
  onTripSelect: (trip: any) => void;
  refresh: boolean;
}) {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTrips = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const fetchedTrips = await fetchTripsByUser(supabase, user.id);
        setTrips(fetchedTrips);
        if (fetchedTrips.length > 0) {
          onTripSelect(fetchedTrips[0]);
        }
      } catch (err) {
        setError('Error fetching trips');
        toast.error('Failed to fetch trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadTrips();
  }, [supabase, user, onTripSelect, refresh]);

  const scrollToCard = (direction: 'left' | 'right') => {
    if (scrollRef.current && scrollRef.current.firstElementChild) {
      const cardWidth = scrollRef.current.firstElementChild.clientWidth + 20;

      const newTripId =
        direction === 'right'
          ? Math.min(selectedTripId + 1, trips.length - 1)
          : Math.max(selectedTripId - 1, 0);

      scrollRef.current.scrollBy({
        left: direction === 'right' ? cardWidth : -cardWidth,
        behavior: 'smooth',
      });

      setSelectedTripId(newTripId);
      setShowLeftButton(newTripId > 0);
      setShowRightButton(newTripId < trips.length - 1);

      onTripSelect(trips[newTripId]);
    }
  };

  const handleDelete = async (tripId: string) => {
    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId);
      if (error) {
        toast.error('Failed to delete the trip. Please try again.');
      } else {
        setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
        toast.success('Trip deleted successfully');
      }
    } catch (err) {
      toast.error('Unexpected error while deleting the trip.');
    }
  };

  if (loading || error)
    return (
      <div className="flex flex-col space-y-3 p-2">
        <Skeleton className="h-[20vh] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-[10vh] w-full rounded-xl" />
      </div>
    );

  return (
    <div className="relative h-full flex flex-col">
      {trips.length === 0 ? (
        <p className="text-base font-medium text-gray-500 text-center">
          No trips found.
        </p>
      ) : (
        <div className="relative h-full">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto h-full scrollbar-hide"
          >
            {trips.map((trip) => {
              const dateRange = trip.daterange || {};
              return (
                <div
                  key={trip.id}
                  className="flex-shrink-0 w-full h-full rounded-lg shadow-md bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url('/backgrounds/${trip.imageurl}.jpg')`,
                  }}
                >
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
                  <div className="relative flex flex-col justify-between h-full p-4 text-white">
                    <div className="flex items-center space-x-2 mt-4 justify-center">
                      <Drawer>
                        <DrawerTrigger>
                          <Edit className="h-3 w-3" />
                        </DrawerTrigger>
                        <DrawerContent className="mx-auto h-[70vh]  max-w-sm justify-center">
                          <DrawerHeader>
                            <DrawerTitle className="font-voyago">
                              {trip.tripname}
                            </DrawerTitle>
                            <DrawerDescription>
                              <div className="mt-4">
                                <div className="flex items-center space-x-3 mb-8">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={
                                        user?.imageUrl || '/default-avatar.png'
                                      }
                                      alt={user?.fullName || ''}
                                    />
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {user?.fullName || 'Unknown User'}
                                    </p>
                                    <p className="text-xs">
                                      {user?.primaryEmailAddress
                                        ?.emailAddress || ''}
                                    </p>
                                  </div>
                                </div>
                                <TripForm
                                  onTripCreated={() => {}}
                                  trip={{
                                    tripname: trip.tripname,
                                    country: trip.country,
                                    daterange: {
                                      from: trip.daterange.from,
                                      to: trip.daterange.to,
                                    },
                                    id: trip.id,
                                  }}
                                  isUpdated={true}
                                />
                              </div>
                            </DrawerDescription>
                          </DrawerHeader>
                          <DrawerFooter>
                            <DrawerClose />
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                      <Share className="h-3 w-3" />
                      <Trash
                        className="h-3 w-3 text-red-400 hover:text-red-500"
                        onClick={() => handleDelete(trip.id)}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {trip.tripname}
                      </h2>
                      <p>{trip.country}</p>
                      <p>
                        {formatDate(dateRange.from)} -{' '}
                        {formatDate(dateRange.to)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {showLeftButton && (
            <button
              onClick={() => scrollToCard('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-white p-2 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {showRightButton && (
            <button
              onClick={() => scrollToCard('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white p-2 rounded-full"
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
