import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to subscribe to real-time changes
export function subscribeToKegChanges(
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel('kegs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'kegs',
      },
      callback
    )
    .subscribe()

  return channel
}

// Helper function to subscribe to weight measurement changes
export function subscribeToMeasurementChanges(
  kegId: string | null,
  callback: (payload: any) => void
) {
  const filter = kegId
    ? { keg_id: `eq.${kegId}` }
    : {}

  const channel = supabase
    .channel('measurements-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'weight_measurements',
        filter: kegId ? `keg_id=eq.${kegId}` : undefined,
      },
      callback
    )
    .subscribe()

  return channel
}
