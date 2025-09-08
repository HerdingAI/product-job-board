// Data transformation utilities for converting Supabase data to frontend entities
import { SupabaseJob } from './supabase'
import { AppJob, Tag, Company, Location, Compensation, ProductContext, Experience, AiMlFocus } from './types'
import { extractTagsFromJob } from './tag-parser'

/**
 * Enhanced parsing for comma-separated strings with deduplication and cleaning
 */
export function parseCommaSeparated(value: string | null, category: Tag['category']): Tag[] {
  if (!value) return []
  
  const items = value
    .split(/[,;|]/) // Support multiple separators
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => item.replace(/['"]/g, '')) // Remove quotes
    .filter((item, index, arr) => arr.indexOf(item) === index) // Deduplicate
  
  return items.map(item => ({
    label: item,
    category
  }))
}

/**
 * Format job posting date for display
 */
export function formatJobDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'Recently posted'
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Format salary range for display - only show if we have salary info
 */
export function formatSalaryRange(compensation: Compensation): string | null {
  if (!compensation) return null
  
  // Only display if we have actual salary numbers
  if (compensation.salaryMin && compensation.salaryMax) {
    // Format without dollar sign for cleaner display
    const formatNum = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
      if (num >= 1000) return `${Math.floor(num / 1000)}K`
      return num.toString()
    }
    return `${formatNum(compensation.salaryMin)} - ${formatNum(compensation.salaryMax)}`
  }
  
  // Don't show anything if no salary info
  return null
}

/**
 * Transform company data
 */
export function transformCompany(job: SupabaseJob): Company {
  return {
    name: job.company || 'Unknown Company',
    stage: job.company_stage_inferred || undefined,
    industry: job.industry_vertical || undefined,
    businessModel: job.business_model || undefined,
    teamSize: job.team_size_indication || undefined
  }
}

/**
 * Transform location data
 */
export function transformLocation(job: SupabaseJob): Location {
  return {
    city: job.location_city || undefined,
    state: job.location_state || undefined,
    country: job.location_country || undefined,
    metro: job.location_metro || job.metro_area || undefined,
    isRemote: Boolean(job.is_remote),
    isHybrid: Boolean(job.is_hybrid),
    isOnsite: !Boolean(job.is_remote) && !Boolean(job.is_hybrid),
    isBayArea: Boolean(job.is_bay_area),
    isTopTechHub: Boolean(job.is_top_tech_hub),
    isInternational: Boolean(job.is_international)
  }
}

/**
 * Transform compensation data
 */
export function transformCompensation(job: SupabaseJob): Compensation {
  return {
    salaryMin: job.salary_min || undefined,
    salaryMax: job.salary_max || undefined,
    currency: job.salary_currency || undefined,
    salaryText: job.salary || undefined,
    equityMentioned: job.equity_mentioned || false,
    bonusMentioned: job.bonus_mentioned || false,
    tier: job.compensation_tier || undefined,
    transparency: job.salary_transparency || job.compensation_transparency || undefined
  }
}

/**
 * Transform product context data
 */
export function transformProductContext(job: SupabaseJob): ProductContext {
  return {
    lifecycleStage: job.product_lifecycle_stage || undefined,
    lifecycleFocus: job.product_lifecycle_focus || undefined,
    domain: job.product_domain || undefined,
    scopeOfOwnership: job.scope_of_ownership || undefined,
    strategicTacticalBalance: job.strategic_tactical_balance || undefined,
    cultureType: job.product_culture_type || undefined,
    methodology: job.product_methodology || undefined,
    collaborationModel: job.collaboration_model || undefined,
    customerType: job.customer_type || undefined
  }
}

/**
 * Transform experience data
 */
export function transformExperience(job: SupabaseJob): Experience {
  return {
    seniorityLevel: job.seniority_level || undefined,
    seniorityTier: job.seniority_tier || undefined,
    experienceBucket: job.experience_bucket || undefined,
    yearsMin: job.years_experience_min || undefined,
    yearsMax: job.years_experience_max || undefined,
    yearsRequired: job.experience_years_required || undefined,
    managementScope: job.management_scope || undefined,
    technicalDepthRequired: job.technical_depth_required || undefined
  }
}

/**
 * Transform AI/ML focus data
 */
export function transformAiMlFocus(job: SupabaseJob): AiMlFocus {
  return {
    isAiMl: job.is_ai_ml || false,
    isAiPm: Boolean(job.is_ai_pm),
    focus: job.ai_ml_focus || undefined
  }
}

/**
 * Main transformation function - converts raw Supabase job to structured AppJob
 */
type RpcJobRow = SupabaseJob & { search_rank?: number }

export function mapSupabaseJobToAppJob(rawJob: SupabaseJob | RpcJobRow): AppJob {
  const job: AppJob = {
    id: rawJob.id,
    title: rawJob.title || 'Product Manager',
    company: transformCompany(rawJob),
    location: transformLocation(rawJob),
    compensation: transformCompensation(rawJob),
    
    // Job Details
    description: rawJob.description || '',
    primaryResponsibilities: rawJob.primary_responsibilities || undefined,
    kpiOwnership: rawJob.kpi_ownership || undefined,
    toolsPlatforms: rawJob.tools_platforms || undefined,
    teamComposition: rawJob.team_composition || undefined,
    
    // URLs and Metadata
    jobUrl: rawJob.job_url || undefined,
    applyUrl: rawJob.apply_url || undefined,
    employmentType: rawJob.employment_type || undefined,
    workArrangement: rawJob.work_arrangement || undefined,
    
    // Dates
    createdAt: rawJob.created_at || new Date().toISOString(),
    postedDate: rawJob.posted || undefined,
    
    // Product-specific context
    productContext: transformProductContext(rawJob),
    experience: transformExperience(rawJob),
    aiMlFocus: transformAiMlFocus(rawJob),
    
    // Tags and Categories
    tags: extractTagsFromJob(rawJob),
    
    // Status and Classification
    isCurrentlyActive: rawJob.is_currently_active || false,
    daysActive: rawJob.days_active || undefined,
    llmProcessed: rawJob.llm_processed || false,
    processingErrors: rawJob.processing_errors || undefined,
    
    // Quality & Analytics
    extractionConfidence: rawJob.extraction_confidence || undefined,
    jobDescriptionQuality: rawJob.job_description_quality || undefined,
    resumeFitScore: rawJob.resume_fit_score || undefined,
    criteriaScore: rawJob.criteria_score || undefined,
    overallFitScore: rawJob.overall_fit_score || undefined
  }

  // Optional relevance score from RPC
  const maybeRank = rawJob as Partial<RpcJobRow>
  if (typeof maybeRank.search_rank === 'number') {
    job.searchRank = maybeRank.search_rank
  }

  return job
}
