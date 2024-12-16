import { ISOStringFormat } from 'date-fns';
import axios from 'axios';

export function formatDate(isoString: ISOStringFormat) {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}

export const getLatLngFromCountry = async (
  country: string,
  GOOGLE_MAPS_API_KEY: string
) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address: country,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      console.error('Error from Geocoding API:', response.data.status);
      throw new Error('Unable to find location');
    }
  } catch (error) {
    console.error('Geocoding API Error:', error);
    throw error;
  }
};
