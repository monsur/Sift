import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Create an anon client optionally scoped to a user's JWT for RLS-enforced queries.
 */
export function createAnonClient(accessToken?: string): SupabaseClient {
  const options: Parameters<typeof createClient>[2] = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  };
  if (accessToken) {
    options.global = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options);
}

let serviceClient: SupabaseClient | null = null;

/**
 * Get the service-role client (bypasses RLS). Singleton.
 */
export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return serviceClient;
}
