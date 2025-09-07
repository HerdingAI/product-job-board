import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

// Create client with fallback values for demo mode
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Job = {
  id: string
  title: string
  company_name: string
  description: string
  location: string
  job_type: 'Full-Time' | 'Part-Time' | 'Contract'
  created_at: string
  user_id: string
}

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: Job
        Insert: Omit<Job, 'id' | 'created_at'>
        Update: Partial<Omit<Job, 'id' | 'created_at'>>
      }
    }
  }
}
