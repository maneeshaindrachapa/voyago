import React, { useState, useRef, useEffect } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Autocomplete,
} from '@react-google-maps/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { getLatLngFromCountry } from '../lib/common-utils';
import { Skeleton } from './ui/skeleton';

const mapContainerStyle = {
  width: '100%',
  height: '40vh',
};

// Grey-themed map styles
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

function GoogleMapComponent({ trip }: { trip: any }) {
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'], // Include 'places' for Autocomplete
  });
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [defaultCenter, setDefaultCenter] = useState<{
    lat: any;
    lng: any;
  }>({
    lat: 37.7749, // Default to San Francisco
    lng: -122.4194,
  });

  const handleSetCenter = async () => {
    try {
      const { lat, lng } = await getLatLngFromCountry(
        trip.country,
        GOOGLE_MAPS_API_KEY
      );
      setDefaultCenter({ lat, lng });
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  useEffect(() => {
    handleSetCenter();
  }, [trip]);

  const addMarker = () => {
    if (!autocompleteRef.current) return; // Check if ref is valid
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setMarkers((prevMarkers) => [...prevMarkers, location]);
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
    <div className="relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex w-[20] max-w-lg items-center gap-2 bg-white p-2 shadow-md rounded-lg">
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        >
          <Input
            type="text"
            placeholder="Search for a place"
            className="flex-1 text-black"
          />
        </Autocomplete>
        <Button onClick={addMarker} variant="default">
          Add
        </Button>
      </div>

      {/* Map Container */}
      <div className="rounded-lg shadow-md overflow-hidden ">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={10}
          center={defaultCenter}
          options={{
            styles: greyMapStyles,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {/* Render Markers */}
          {markers.map((marker, index) => (
            <Marker key={index} position={marker} />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}

export default GoogleMapComponent;
