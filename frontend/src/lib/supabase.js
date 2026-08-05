import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const FEATURES = [
  'SSO',
  'Customize Dashboard',
  'Insights',
  'Data Exports',
  'Verbatim Exports',
  'Scheduling',
  'Load Prediction',
  'Mobile App'
]