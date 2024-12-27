import { ISOStringFormat } from 'date-fns';
import axios from 'axios';
import { clerkClient } from '@clerk/clerk-sdk-node';

export function formatDate(isoString: ISOStringFormat): string {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}

export const getLatLngFromCountry = async (
  country: string,
  GOOGLE_MAPS_API_KEY: string
): Promise<{ lat: number; lng: number }> => {
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

export const getLocationName = async (
  lat: number,
  lng: number,
  GOOGLE_MAPS_API_KEY: string
): Promise<string> => {
  const geocodingURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const response = await fetch(geocodingURL);
    const data = await response.json();
    if (data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return 'Unknown location';
  } catch (error) {
    console.error('Error fetching location name:', error);
    return 'Unknown location';
  }
};

export interface UserDetails {
  fullName: string;
  email: string;
  profileImageUrl: string;
}
export async function getUserDetailsById(
  userId: string
): Promise<UserDetails | null> {
  try {
    const user = await clerkClient.users.getUser(userId);

    if (!user) {
      console.error(`No user found with ID: ${userId}`);
      return null;
    }

    return {
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.primaryEmailAddress?.emailAddress || 'No email available',
      profileImageUrl: user.imageUrl || '/default-avatar.png',
    };
  } catch (error) {
    console.error('Error fetching user details from Clerk:', error);
    return null;
  }
}
