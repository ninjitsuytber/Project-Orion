import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'undefined' && SUPABASE_ANON_KEY !== 'undefined') {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log("Supabase Client initialized!")
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e)
  }
}

if (!supabaseClient) {
  console.warn("Supabase credentials missing or invalid. App will run in limited mode (Demo only).")
  // Provide a minimal mock client to prevent the app from crashing
  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: {}, error: { message: "Supabase not configured" } }),
      signUp: async () => ({ data: {}, error: { message: "Supabase not configured" } }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({
            limit: async () => ({ data: [], error: null })
          })
        }),
        gte: () => ({
          select: async () => ({ data: [], error: null })
        })
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      update: () => ({
        eq: async () => ({ data: null, error: null })
      })
    })
  };
}

export const supabase = supabaseClient;
