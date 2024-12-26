import React, { useState, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Autocomplete,
  Libraries,
} from '@react-google-maps/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { getLatLngFromCountry, getLocationName } from '../lib/common-utils';
import { Skeleton } from './ui/skeleton';
import { Save, SquareMinus } from 'lucide-react';
import { createClerkSupabaseClient } from '../config/SupdabaseClient';
import { toast } from 'sonner';
import { updateTripLocations } from '../lib/trip-service';
import { useTheme } from '../context/ThemeContext';
import { useTripContext } from '../context/TripContext';
import { useUser } from '@clerk/clerk-react';
import GoogleMarker from './GoogleMarker';
import { useUserContext } from '../context/UserContext';

const mapContainerStyle = {
  width: '100%',
  height: '40vh',
};

// Grey-themed map style
const greyMapStyles = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#212121',
      },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#757575',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#212121',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#2c2c2c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
];
// Light-themed map style
const lightMapStyles = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#f5f5f5',
      },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#616161',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#f5f5f5',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#ffffff',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#e0e0e0',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#c9c9c9',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9e9e9e',
      },
    ],
  },
];

const blueGradient = [
  '#0A2342',
  '#143D59',
  '#1F5986',
  '#2A76B3',
  '#348CD3',
  '#4DA3E6',
  '#67BBF9',
  '#89CEFF',
  '#A4DBFF',
  '#C0E8FF',
];

const libraries: Libraries = ['places'];

function GoogleMapComponent() {
  const supabase = createClerkSupabaseClient();
  const { theme } = useTheme();
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const { selectedTrip } = useTripContext();
  const { user } = useUser();
  const { users } = useUserContext();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [listOfPlaces, setListOfPlaces] = useState<
    {
      lat: number;
      lng: number;
      location: string;
      userId: string;
      color: string;
    }[]
  >([]);

  const [pinColor, setPinColor] = useState(
    blueGradient[Math.floor(Math.random() * blueGradient.length)]
  );

  const [saveBtn, setSaveBtn] = useState(false);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [defaultCenter, setDefaultCenter] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 37.7749,
    lng: -122.4194,
  });

  useEffect(() => {
    handleSetCenter();
    selectedTrip != null
      ? setListOfPlaces(selectedTrip.locations)
      : setListOfPlaces([]);
    setPinColor(
      selectedTrip?.locations.find((loc) => loc.userId === user?.id)?.color ||
        blueGradient[Math.floor(Math.random() * blueGradient.length)]
    );
  }, [selectedTrip]);

  const handleSetCenter = async () => {
    if (selectedTrip) {
      try {
        const { lat, lng } = await getLatLngFromCountry(
          selectedTrip.country,
          GOOGLE_MAPS_API_KEY
        );
        setDefaultCenter({ lat, lng });
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    }
  };

  const addMarker = async () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    const locationName = await getLocationName(
      location.lat,
      location.lng,
      GOOGLE_MAPS_API_KEY
    );

    setListOfPlaces((prevSetListOfPlaces) => [
      ...prevSetListOfPlaces,
      {
        lat: location.lat,
        lng: location.lng,
        location: locationName,
        userId: user?.id || '',
        color: pinColor,
      },
    ]);

    setSaveBtn(true);
  };

  const handleSaveItenary = async () => {
    try {
      if (selectedTrip == undefined) {
        console.log('No trip is selected');
        return;
      }
      await updateTripLocations(supabase, selectedTrip.id, listOfPlaces);
      toast('Trip itinerary updated successfully!');
      setSaveBtn(false);
    } catch (err) {
      console.error('Error saving itinerary:', err);
      toast('Failed to update itinerary');
    }
  };

  if (!isLoaded)
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-2 relative">
        {selectedTrip && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex w-[60vh] items-center gap-2 bg-white dark:bg-black p-2 shadow-md rounded-lg">
            <Autocomplete
              onLoad={(autocomplete) =>
                (autocompleteRef.current = autocomplete)
              }
            >
              <Input
                type="text"
                placeholder="Search for a place"
                className="flex-1 text-black dark:text-white w-[45vh] outline-none border-none hover:border-none hover:outline-none selection:outline-none focus-visible:ring-offset-0 focus-visible:ring-0 font-voyago"
              />
            </Autocomplete>
            <Button
              onClick={addMarker}
              variant="default"
              className="w-[12vh] bg-gray-600 text-white hover:bg-gray-500 font-voyago"
            >
              Add
            </Button>
          </div>
        )}

        <div className="rounded-lg shadow-md overflow-hidden ">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={6}
            center={defaultCenter}
            options={{
              styles: theme === 'dark' ? greyMapStyles : lightMapStyles,
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {listOfPlaces.map((place, index) => (
              <GoogleMarker
                key={index}
                place={place}
                index={index}
                color={place.color}
              />
            ))}
          </GoogleMap>
        </div>
      </div>
      <div className="col-span-1 relative">
        <div className="col-span-1 bg-white dark:bg-muted/50 p-4 rounded-lg shadow-md overflow-auto h-[40vh]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-voyago">
              Trip Itinerary
            </h2>
            {saveBtn && (
              <Save width={15} height={15} onClick={handleSaveItenary} />
            )}
          </div>
          {listOfPlaces.length === 0 ? (
            <p className="text-gray-500 text-sm">No locations added yet.</p>
          ) : (
            <ul className="space-y-3">
              {listOfPlaces.map((location, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2 border-b"
                >
                  <div>
                    <p className="text-sm font-medium">{location.location}</p>
                    <p className="text-xs text-gray-500">
                      Lat: {location.lat.toFixed(4)}, Lng:{' '}
                      {location.lng.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {users?.find((u) => u.id === location.userId)?.firstName}{' '}
                      {users?.find((u) => u.id === location.userId)?.lastName}
                    </p>
                  </div>
                  {user?.id === location.userId && (
                    <SquareMinus
                      color="#D0312D"
                      onClick={() => {
                        setListOfPlaces((prev) =>
                          prev.filter(
                            (_, locationIndex) => locationIndex !== index
                          )
                        );
                        setSaveBtn(true);
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleMapComponent;
