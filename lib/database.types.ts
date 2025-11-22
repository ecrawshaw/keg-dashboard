// Supabase Database Types
// This is a placeholder - you can generate this file using Supabase CLI:
// npx supabase gen types typescript --project-id huhojweqdkeafaoosriq > lib/database.types.ts

export type Database = {
  public: {
    Tables: {
      kegs: {
        Row: {
          [key: string]: any
        }
      }
      weight_measurements: {
        Row: {
          [key: string]: any
        }
      }
    }
  }
}
