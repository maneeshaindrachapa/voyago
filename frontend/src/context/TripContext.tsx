import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import {
  deleteTripById,
  fetchTripsByUser,
  saveTrip,
  updateTripByTripId,
} from '../lib/trip-service';
import { useUser } from '@clerk/clerk-react';
import { ISOStringFormat } from 'date-fns';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { DateRange } from 'react-day-picker';

export interface addTripRequest {
  tripname: string;
  country: string;
  daterange: DateRange;
}

export interface TripResponse {
  id: string;
  tripname: string;
  country: string;
  daterange: {
    from: ISOStringFormat;
    to: ISOStringFormat;
  };
  imageurl: string;
  ownerid: string;
  locations: {
    lat: number;
    lng: number;
    location: string;
  }[];
}

// Define the context shape
interface TripContextType {
  trips: TripResponse[];
  getAllTrips: () => void;
  updateTripList: (trip: any) => void;
  addTrip: (trip: addTripRequest) => void;
  updateTrip: (tripData: {
    tripid: string;
    tripname: string;
    country: string;
    daterange: { from: Date; to: Date };
  }) => void;
  deleteTrip: (id: string) => void;
  isLoading: boolean;
  selectedTrip: TripResponse | null;
  setSelectedTrip: Dispatch<SetStateAction<TripResponse | null>>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

// Provider component
export const TripProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = createClerkSupabaseClient();
  const { user } = useUser();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get all trips
  const getAllTrips = async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    const fetchedTrips = await fetchTripsByUser(supabase, user.id);
    setTrips(fetchedTrips);
    if (fetchedTrips.length > 0) {
      setSelectedTrip(fetchedTrips[0]);
    } else {
      setSelectedTrip(null);
    }
    setIsLoading(false);
  };

  // Update trip list
  const updateTripList = (data: any) => {
    setTrips((prevTrips) => [...prevTrips, data]);
  };

  // Add trip
  const addTrip = async (trip: addTripRequest) => {
    if (!user) {
      alert('You need to be signed in to create a trip!');
      return;
    }
    await saveTrip(supabase, trip, user.id);
    await getAllTrips();
  };

  // update trip
  const updateTrip = async (tripData: {
    tripid: string;
    tripname: string;
    country: string;
    daterange: { from: Date; to: Date };
  }) => {
    await updateTripByTripId(supabase, tripData);
    await getAllTrips();
  };

  const deleteTrip = async (tripid: string) => {
    await deleteTripById(supabase, tripid);
    await getAllTrips();
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        getAllTrips,
        updateTripList,
        addTrip,
        updateTrip,
        deleteTrip,
        isLoading,
        selectedTrip,
        setSelectedTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTripContext = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};
