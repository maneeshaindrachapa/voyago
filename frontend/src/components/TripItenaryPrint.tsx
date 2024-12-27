import { Printer } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { formatDate } from '../lib/common-utils';

export const TripItineraryPrint = () => {
  const { selectedTrip } = useTripContext();
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const calculateDirections = () => {
    if (selectedTrip != null && selectedTrip?.locations?.length < 2) {
      console.log('Add at least two locations to calculate directions.');
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const waypoints = selectedTrip?.locations.slice(1, -1).map((place) => ({
      location: { lat: place.lat, lng: place.lng },
      stopover: true,
    }));

    if (selectedTrip?.locations) {
      directionsService.route(
        {
          origin: {
            lat: selectedTrip?.locations[0].lat,
            lng: selectedTrip?.locations[0].lng,
          },
          destination: {
            lat: selectedTrip?.locations[selectedTrip?.locations.length - 1]
              .lat,
            lng: selectedTrip?.locations[selectedTrip?.locations.length - 1]
              .lng,
          },
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    }
  };

  useEffect(() => {
    calculateDirections();
  }, [selectedTrip]);

  if (!directions) {
    return (
      <p>No directions available. Add locations and calculate the route.</p>
    );
  }

  const route = directions.routes[0];
  const legs = route.legs;
  const totalDurationInMinutes =
    route.legs.reduce((total, leg) => total + (leg.duration?.value || 0), 0) /
    60;

  const hours = Math.floor(totalDurationInMinutes / 60);
  const minutes = Math.round(totalDurationInMinutes % 60);

  return (
    <div className="p-4 rounded-lg shadow-md">
      <div ref={contentRef}>
        <div className="flex flex-col mb-4">
          <h2 className="text-lg font-semibold">{selectedTrip?.tripname}</h2>
          <p className="text-sm">Country:{selectedTrip?.country}</p>
          <p className="text-sm">
            Date:
            {selectedTrip?.daterange
              ? formatDate(selectedTrip?.daterange.from)
              : ''}
            &nbsp;|&nbsp;
            {selectedTrip?.daterange
              ? formatDate(selectedTrip?.daterange.to)
              : ''}
          </p>
        </div>
        <ul className="space-y-4">
          {legs.map((leg, index) => (
            <li key={index} className="border-b pb-4">
              <h3 className="text-md font-medium">
                Step {index + 1}:<br /> {leg.start_address} → <br />
                {leg.end_address}
              </h3>
              <p className="text-xs">
                Distance: {leg.distance?.text}, Duration: {leg.duration?.text}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <div className="flex flex-row">
            <h3 className="text-md font-semibold">Total Distance:</h3>
            <p className="text-sm ml-1">
              {route.legs.reduce(
                (total, leg) => total + (leg.distance?.value || 0),
                0
              ) / 1000}{' '}
              km
            </p>
          </div>
          <div className="flex flex-row">
            <h3 className="text-md font-semibold">Total Duration:</h3>
            <p className="text-sm ml-1">
              {hours} {hours === 1 ? 'hour' : 'hours'} and {minutes}{' '}
              {minutes === 1 ? 'minute' : 'minutes'}
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={() => reactToPrintFn()}
        className="mt-4 bg-muted p-2 hover:bg-muted/50 px-4 py-2 rounded shadow flex flex-row text-sm float-end"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Itinerary
      </button>
    </div>
  );
};
