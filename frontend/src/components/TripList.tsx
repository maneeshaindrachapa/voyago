import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { formatDate } from '../lib/common-utils';
import { ChevronLeft, ChevronRight, Edit, Trash } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

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
import { useTheme } from '../context/ThemeContext';
import { useTripContext } from '../context/TripContext';
import ShareTripForm from './ShareTripForm';

function TripList() {
  const { user } = useUser();
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(0);
  const { theme } = useTheme();
  const { getAllTrips, trips, deleteTrip, isLoading, setSelectedTrip } =
    useTripContext();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        await getAllTrips();
      } catch (error) {
        console.error('Error fetching trips:', error);
      }
    };

    fetchTrips();
  }, []);

  useEffect(() => {
    if (trips.length > 1) {
      setShowRightButton(true);
    }
  }, [trips]);

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

      setSelectedTrip(trips[newTripId]);
    }
  };

  const handleDelete = async (tripId: string) => {
    deleteTrip(tripId);
  };

  if (isLoading)
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
        <>
          <p className="text-base font-voyago text-gray-500 text-center mt-4">
            No Trips planned
          </p>
          {theme === 'dark' ? (
            <img
              src="./images/trip_plan_dark.svg"
              className="absolute bottom-0 h-[20vh] aspect-video"
            />
          ) : (
            <img
              src="./images/trip_plan_light.svg"
              className="absolute bottom-0 h-[20vh] aspect-video"
            />
          )}
        </>
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
                      <ShareTripForm trip={trip} />
                      <Trash
                        className="h-3 w-3 text-red-400 hover:text-red-500"
                        onClick={() => handleDelete(trip.id)}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold font-voyago">
                        {trip.tripname}
                      </h2>
                      <p className="text-sm">{trip.country}</p>
                      <p className="text-xs">
                        {formatDate(dateRange.from)} |{' '}
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
