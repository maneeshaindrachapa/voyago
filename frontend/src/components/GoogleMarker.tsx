import React from 'react';
import { Marker } from '@react-google-maps/api';

const MapPinIcon = ({ color = '#000000' }: { color?: string }) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="40" height="40">
    <path d="M12 24s8-7.06 8-13.429C20 4.607 16.418 1 12 1S4 4.607 4 10.571C4 16.94 12 24 12 24zM12 11.572c-1.438 0-2.607-1.168-2.607-2.607S10.562 6.358 12 6.358s2.607 1.168 2.607 2.607S13.438 11.572 12 11.572z" />
  </svg>
`;

const GoogleMarker = ({
  place,
  index,
  color,
}: {
  place: any;
  index: number;
  color: string;
}) => {
  const markerIconColor = color;

  return (
    <Marker
      key={index}
      position={{ lat: place.lat, lng: place.lng }}
      icon={{
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(MapPinIcon({ color: markerIconColor }))}`,
        scaledSize: new window.google.maps.Size(10, 10), // Adjust size as needed
      }}
    />
  );
};

export default GoogleMarker;
