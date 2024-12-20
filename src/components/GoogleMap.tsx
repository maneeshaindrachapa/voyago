import React, { useState, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
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

const libraries: Libraries = ['places'];

/**
 * GoogleMapComponent
 *
 * A reusable React component to render a Google Map with:
 * - Centered map based on a given trip location.
 * - Optional markers for user interaction or search.
 * - Get the location name
 *
 * @param {Object} props - Component props.
 * @param {any} props.trip - The trip object containing the `country` property for map centering.
 */
function GoogleMapComponent({ trip }: { trip: any }) {
  const supabase = createClerkSupabaseClient();
  const { theme } = useTheme();
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  // Load Google Maps script and required libraries.
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // State to hold the list of locations of the markers
  const [listOfPlaces, setListOfPlaces] = useState<
    {
      lat: number;
      lng: number;
      location: string;
    }[]
  >([]);

  // State to have the save button for trip itenary
  const [saveBtn, setSaveBtn] = useState(false);

  // Ref for the Google Maps Autocomplete instance.
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // State for setting the default center of the map.
  const [defaultCenter, setDefaultCenter] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 37.7749, // Default latitude (San Francisco)
    lng: -122.4194, // Default longitude (San Francisco)
  });

  useEffect(() => {
    handleSetCenter(); //set the country selected as the center of google map
    trip != null ? setListOfPlaces(trip.locations) : setListOfPlaces([]);
  }, [trip]);

  /**
   * Sets the map center based on the `country` property of the trip object.
   *
   * This function fetches the latitude and longitude of the given country
   * using the `getLatLngFromCountry` utility function.
   *
   * @async
   * @function handleSetCenter
   * @returns {Promise<void>} Resolves after updating the map center.
   */
  const handleSetCenter = async () => {
    if (trip) {
      try {
        const { lat, lng } = await getLatLngFromCountry(
          trip.country,
          GOOGLE_MAPS_API_KEY
        );
        setDefaultCenter({ lat, lng }); // Update center state
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    }
  };

  /**
   * Adds a marker to the map based on the selected location from the Autocomplete input.
   *
   * This function:
   * 1. Retrieves the selected place using the Autocomplete reference.
   * 2. Extracts the latitude and longitude of the location.
   * 3. Updates the markers state with the new marker and its associated name (formatted address).
   *
   * @async
   * @function addMarker
   * @returns {Promise<void>} Resolves after adding the marker to the state.
   *
   * @throws Will silently return if:
   * - The Autocomplete reference is invalid.
   * - The selected place has no valid geometry or location.
   */
  const addMarker = async () => {
    if (!autocompleteRef.current) return; // Check if ref is valid

    // Retrieve the selected place details
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;

    // Extract latitude and longitude from the place
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    // Fetch and add the location name to the marker
    const locationName = await getLocationName(
      location.lat,
      location.lng,
      GOOGLE_MAPS_API_KEY
    );

    // Add location to the state
    setListOfPlaces((prevSetListOfPlaces) => [
      ...prevSetListOfPlaces,
      { lat: location.lat, lng: location.lng, location: locationName },
    ]);

    // Save Button enabled
    setSaveBtn(true);
  };

  // Save itenary
  const handleSaveItenary = async () => {
    try {
      await updateTripLocations(supabase, trip.id, listOfPlaces);
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
        {/* Search Bar */}
        {trip && (
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
              <Marker
                key={index}
                position={{ lat: place.lat, lng: place.lng }}
                icon={{
                  url:
                    theme === 'dark'
                      ? './map-pin_dark.png'
                      : 'map-pin_light.png',
                  scaledSize: new window.google.maps.Size(10, 10),
                }}
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
                  </div>
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
