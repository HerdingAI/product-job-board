import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'

// Create client with fallback values for demo mode
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Comprehensive Supabase Job type matching the production schema
export type SupabaseJob = {
  id: string
  job_url: string | null
  title: string | null
  company: string | null
  location: string | null
  posted: string | null
  salary: string | null
  description: string | null
  apply_url: string | null
  employment_type: string | null
  is_remote: number | null
  is_hybrid: number | null
  is_onsite: number | null
  created_at: string | null
  updated_at: string | null
  job_category: string | null
  job_subcategory: string | null
  seniority_level: string | null
  experience_years_required: number | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  location_city: string | null
  location_state: string | null
  location_country: string | null
  metro_area: string | null
  is_bay_area: boolean | null
  is_top_tech_hub: boolean | null
  key_technologies: string | null
  date_removed: string | null
  is_currently_active: boolean | null
  days_active: number | null
  last_enrichment_date: string | null
  enrichment_version: string | null
  llm_processed: boolean | null
  llm_processing_date: string | null
  llm_processing_errors: string | null
  seniority_tier: string | null
  years_experience_min: number | null
  years_experience_max: number | null
  equity_mentioned: boolean | null
  bonus_mentioned: boolean | null
  compensation_tier: string | null
  salary_transparency: string | null
  work_arrangement: string | null
  remote_flexibility: string | null
  technical_depth_required: string | null
  is_international: boolean | null
  product_lifecycle_stage: string | null
  team_size_indication: string | null
  cross_functional_scope: string | null
  company_stage_inferred: string | null
  industry_vertical: string | null
  business_model: string | null
  required_skills: string | null
  preferred_skills: string | null
  urgency_indicators: string | null
  growth_indicators: string | null
  job_description_quality: string | null
  extraction_confidence: string | null
  is_product_job: boolean | null
  is_ai_ml: boolean | null
  is_ai_pm: number | null
  management_scope: string | null
  experience_bucket: string | null
  product_domain: string | null
  core_pm_skills: string | null
  technical_skills: string | null
  domain_expertise: string | null
  leadership_skills: string | null
  location_metro: string | null
  company_stage: string | null
  processing_errors: number | null
  is_high_priority: boolean | null
  resume_fit_score: number | null
  criteria_score: number | null
  overall_fit_score: number | null
  resume_fit_json: string | null
  last_resume_eval_date: string | null
  resume_eval_version: string | null
  resume_evaluated: boolean | null
  product_lifecycle_focus: string | null
  scope_of_ownership: string | null
  strategic_tactical_balance: string | null
  primary_responsibilities: string[] | null
  product_culture_type: string | null
  team_composition: Record<string, unknown> | string | null
  product_methodology: string[] | null
  collaboration_model: string | null
  tools_platforms: Record<string, unknown> | string | null
  kpi_ownership: string[] | null
  reporting_structure: string | null
  customer_type: string | null
  hiring_velocity: string | null
  compensation_transparency: string | null
  ai_ml_focus: Record<string, unknown> | string | null
}

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: SupabaseJob
        Insert: Omit<SupabaseJob, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SupabaseJob, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
