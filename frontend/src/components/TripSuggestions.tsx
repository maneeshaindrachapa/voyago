import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTripContext } from '../context/TripContext';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

interface Place {
  name: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: {
    photo_reference: string;
  }[];
}

interface Suggestion {
  location: string;
  attractions: Place[];
  restaurants: Place[];
}

const TripSuggestions = () => {
  const [locations, setLocations] = useState<
    {
      lat: number;
      lng: number;
      location: string;
      userId: string;
      color: string;
    }[]
  >([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { selectedTrip } = useTripContext();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  const getPhotoUrl = (photoReference: string) =>
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;

  useEffect(() => {
    if (selectedTrip != null && selectedTrip?.locations?.length > 0) {
      setLocations(selectedTrip.locations);
    } else {
      setLocations([]);
      setSuggestions([]);
    }
  }, [selectedTrip]);

  useEffect(() => {
    if (locations.length === 0) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      setError('');
      try {
        const results = await Promise.all(
          locations.map(async (location) => {
            const attractionsResponse = await axios.get(
              BACKEND_URL + '/locations/places',
              {
                params: {
                  location: `${location.lat},${location.lng}`,
                  radius: 1500,
                  type: 'tourist_attraction',
                },
              }
            );

            const restaurantsResponse = await axios.get(
              BACKEND_URL + '/locations/places',
              {
                params: {
                  location: `${location.lat},${location.lng}`,
                  radius: 1500,
                  type: 'restaurant',
                },
              }
            );

            return {
              location: location.location,
              attractions: attractionsResponse.data.results.slice(0, 3),
              restaurants: restaurantsResponse.data.results.slice(0, 3),
            };
          })
        );
        setSuggestions(results);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch suggestions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [locations]);

  if (loading)
    return (
      <div className="flex flex-col space-y-3 p-2">
        <Skeleton className="h-[40vh] w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-[20vh] w-full rounded-xl" />
      </div>
    );

  return (
    <div className="p-4 rounded-lg max-h-[70vh] overflow-y-scroll">
      <h1 className="text-lg font-semibold mb-4 font-voyago tracking-tighter">
        Trip Suggestions
      </h1>

      <div className="space-y-8">
        {error && <p className="text-red-500">{error}</p>}
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="p-0 rounded-md">
            <h2 className="text-sm font-semibold mb-1 ">
              {suggestion.location}
            </h2>
            <div className="gap-6">
              <div>
                <h3 className="font-semibold mt-4 mb-2 text-xs">
                  Top Attractions
                </h3>
                <div className="space-y-3">
                  {suggestion.attractions.map((place, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-start border-b pb-2"
                    >
                      {place.photos && place.photos[0] && (
                        <img
                          src={getPhotoUrl(place.photos[0].photo_reference)}
                          alt={place.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <p className="text-xs font-medium text-left ml-2 mr-2">
                        {place.name}
                      </p>
                      <Badge className="text-xs">
                        {place.rating ? `${place.rating}/5` : 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold mt-4 mb-2">
                  Top Restaurants
                </h3>
                <div className="space-y-3">
                  {suggestion.restaurants.map((place, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-start border-b pb-2"
                    >
                      {place.photos && place.photos[0] && (
                        <img
                          src={getPhotoUrl(place.photos[0].photo_reference)}
                          alt={place.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <p className="text-xs font-medium text-left ml-2 mr-2">
                        {place.name}
                      </p>
                      <Badge className="text-xs">
                        {place.rating ? `${place.rating}/5` : 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripSuggestions;
