import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://tyfuhlposjkkiapfhdgf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZnVobHBvc2pra2lhcGZoZGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDMyNzgsImV4cCI6MjA5MzQ3OTI3OH0.D77hI4ByP_TKSnv3SCew6W5LlXsWTziOEr6fr_XqzmQ'

//connect
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

//log
console.log("Supabase Client initialized!")