import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Frontend Supabase client — uses the ANON key (safe for client-side code).
 *
 * Required env vars (in .env with EXPO_PUBLIC_ prefix so Expo bundles them):
 *   EXPO_PUBLIC_SUPABASE_URL
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY
 *
 * ⚠️  Never use the service_role key here — only in the NestJS backend.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is not set.\n' +
      'Add them to your .env file.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage so the session persists across app restarts
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Required for React Native — do not try to parse URL fragments
    detectSessionInUrl: false,
  },
});
