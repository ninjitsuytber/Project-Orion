import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseClient;

// Validate and initialize Supabase client
if (SUPABASE_URL && SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'undefined' && SUPABASE_ANON_KEY !== 'undefined' &&
  SUPABASE_ANON_KEY !== 'your_anon_key_here') {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    console.log("Supabase Client initialized successfully!")

    // Security check: Warn if using service_role key in frontend
    if (SUPABASE_ANON_KEY.includes('service_role') ||
      SUPABASE_ANON_KEY.length > 250) { // service_role keys are typically longer
      console.error(`
CRITICAL SECURITY WARNING
You appear to be using a SERVICE_ROLE key in your frontend!
This is extremely dangerous and bypasses all security rules.

Please replace it with your ANON/PUBLIC key from:
Supabase Dashboard > Project Settings > API > "anon public" key

Current environment: ${import.meta.env.MODE}
      `);
    }
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e)
  }
}

// If client initialization failed, provide mock client for demo mode
if (!supabaseClient) {
  console.warn(`
upabase credentials missing or invalid
App will run in DEMO mode with limited functionality.

To enable full functionality:
1. Create a .env file in your project root
2. Add your Supabase credentials:
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
3. Restart the dev server

Get your credentials from:
https://supabase.com/dashboard/project/[your-project-id]/settings/api
  `);

  // Provide minimal mock client to prevent app crashes
  supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => { } } }
      }),
      signInWithPassword: async () => ({
        data: {},
        error: { message: "Supabase not configured - running in demo mode" }
      }),
      signUp: async () => ({
        data: {},
        error: { message: "Supabase not configured - running in demo mode" }
      }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
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
      }),
      upsert: async () => ({ data: null, error: null })
    }),
    rpc: async () => ({
      data: { success: false, message: "Demo mode - no database" },
      error: null
    })
  };
}

export const supabase = supabaseClient;

// Export helper to check if we're in demo mode
export const isDemoMode = () => !SUPABASE_URL || !SUPABASE_ANON_KEY ||
  SUPABASE_URL === 'undefined' || SUPABASE_ANON_KEY === 'undefined' ||
  SUPABASE_ANON_KEY === 'your_anon_key_here';