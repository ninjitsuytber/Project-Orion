import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
//connect
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

//log
console.log("Supabase Client initialized!")
