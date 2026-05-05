import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Use Vite's environment variables if available, otherwise fallback to placeholders
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Helper to check if Supabase is properly configured
const isConfigured = SUPABASE_URL && !SUPABASE_URL.includes('your-project-id')

let supabaseClient;

if (isConfigured) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e)
  }
}

// Mock client if not configured or failed to initialize
// This allows the "Demo Login" and UI to function without a real backend
export const supabase = supabaseClient || {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
    signUp: async () => ({ error: { message: 'Supabase not configured' } }),
    signOut: async () => {}
  }
}
