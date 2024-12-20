import { ISOStringFormat } from 'date-fns';
import axios from 'axios';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { UserResource } from '@clerk/types';

/**
 * Formats an ISO date string into `YYYY-MM-DD` format.
 *
 * @param isoString - The ISO date string to format.
 * @returns A formatted date string in the format `YYYY-MM-DD`.
 */
export function formatDate(isoString: ISOStringFormat): string {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}

/**
 * Fetches the latitude and longitude of a given country using the Google Maps Geocoding API.
 *
 * @param country - The name of the country to get latitude and longitude for.
 * @param GOOGLE_MAPS_API_KEY - The Google Maps API key used for authentication.
 * @returns A promise resolving to an object containing `lat` (latitude) and `lng` (longitude).
 *
 * @example
 * ```ts
 * const coordinates = await getLatLngFromCountry('France', 'YOUR_GOOGLE_API_KEY');
 * console.log(coordinates); // { lat: 48.8566, lng: 2.3522 }
 * ```
 *
 * @throws Will throw an error if the API request fails or the country is not found.
 */
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

/**
 * Fetches the location name (formatted address) for given latitude and longitude using the Google Maps Geocoding API.
 * @param lat - Latitude of the location.
 * @param lng - Longitude of the location.
 * @returns A promise that resolves to the formatted address or 'Unknown location' if not found.
 */
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
      return data.results[0].formatted_address; // Return the formatted address
    }
    return 'Unknown location';
  } catch (error) {
    console.error('Error fetching location name:', error);
    return 'Unknown location';
  }
};

/**
 * Fetches user details from Clerk based on the provided user ID.
 *
 * @param {string} userId - The unique ID of the user saved in Clerk.
 * @returns {Promise<{ name: string; email: string | undefined; profileImageUrl: string; }>}
 * A promise that resolves to an object containing the user's name, email, and profile image URL.
 *
 * @throws {Error} Throws an error if fetching the user details fails.
 *
 * @example
 * ```typescript
 * const userDetails = await getUserDetails('user_12345');
 * console.log(userDetails.name); // John Doe
 * console.log(userDetails.email); // johndoe@example.com
 * console.log(userDetails.profileImageUrl); // URL to the user's profile image
 * ```
 */

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
