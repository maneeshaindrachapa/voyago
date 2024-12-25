import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/clerk-react';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

// Create a single Supabase client instance
let supabaseInstance: ReturnType<typeof createClient>;

export function createClerkSupabaseClient() {
  if (!supabaseInstance) {
    const { session } = useSession();

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({
            template: 'supabase',
          });

          if (!clerkToken) {
            throw new Error('Failed to retrieve Clerk token.');
          }

          const headers = new Headers(options.headers);
          headers.set('Authorization', `Bearer ${clerkToken}`);

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    });
  }

  return supabaseInstance;
}
