// Frontend entity types for the Product Careers application
// These types represent the structured data that the UI components will consume

export interface Tag {
  label: string
  category: 'core-pm' | 'technical' | 'domain' | 'leadership' | 'methodology' | 'responsibilities'
  color?: string
}

export interface Company {
  name: string
  stage?: string
  industry?: string
  businessModel?: string
  teamSize?: string
}

export interface Location {
  city?: string
  state?: string
  country?: string
  metro?: string
  isRemote: boolean
  isHybrid: boolean
  isOnsite: boolean
  isBayArea?: boolean
  isTopTechHub?: boolean
  isInternational?: boolean
}

export interface Compensation {
  salaryMin?: number
  salaryMax?: number
  currency?: string
  salaryText?: string
  equityMentioned?: boolean
  bonusMentioned?: boolean
  tier?: string
  transparency?: string
  // Enhanced fields for better parsing
  type?: 'range' | 'minimum' | 'exact' | 'unknown'
  min?: number
  max?: number
  period?: 'yearly' | 'monthly' | 'hourly'
}

export interface ProductContext {
  lifecycleStage?: string
  lifecycleFocus?: string
  domain?: string
  scopeOfOwnership?: string
  strategicTacticalBalance?: string
  cultureType?: string
  methodology?: string[]
  collaborationModel?: string
  customerType?: string
}

export interface Experience {
  seniorityLevel?: string
  seniorityTier?: string
  experienceBucket?: string
  yearsMin?: number
  yearsMax?: number
  yearsRequired?: number
  managementScope?: string
  technicalDepthRequired?: string
}

export interface AiMlFocus {
  isAiMl: boolean
  isAiPm: boolean
  focus?: Record<string, unknown> | string | null
}

// Main job entity that the frontend will work with
export interface AppJob {
  id: string
  title: string
  company: Company
  location: Location
  description: string
  compensation: Compensation
  productContext: ProductContext
  experience: Experience
  aiMlFocus: AiMlFocus
  tags: Tag[]
  
  // Metadata
  postedDate?: string
  createdAt?: string
  updatedAt?: string
  applyUrl?: string
  jobUrl?: string
  employmentType?: string
  workArrangement?: string
  
  // Enrichment & Processing
  isCurrentlyActive: boolean
  daysActive?: number
  llmProcessed?: boolean
  processingErrors?: number
  
  // Quality & Fit Scores
  extractionConfidence?: string
  jobDescriptionQuality?: string
  resumeFitScore?: number
  criteriaScore?: number
  overallFitScore?: number
  // Relevance
  searchRank?: number
  
  // Additional arrays
  primaryResponsibilities?: string[]
  kpiOwnership?: string[]
  toolsPlatforms?: Record<string, unknown> | string | null
  teamComposition?: Record<string, unknown> | string | null
}

// Filter state types for the UI
export interface FilterState {
  // Basic filters
  search?: string
  seniority?: string
  location?: string
  workArrangement?: string
  
  // Advanced filters based on real Supabase data
  companyStage?: string[]          // company_stage values
  productLifecycle?: string[]      // product_lifecycle_focus values  
  productDomain?: string[]         // product_domain values
  managementScope?: string[]       // management_scope values
  industryVertical?: string[]      // industry_vertical values
  experienceBucket?: string[]      // experience_bucket values
  domainExpertise?: string[]       // domain_expertise values
  activeTags: Tag[]               // Multi-category tag filtering
  
  // Salary filtering
  salaryMin?: number
  salaryMax?: number
  
  // UI state
  showAdvancedFilters?: boolean
  sortBy?: 'date' | 'salary' | 'relevance'
  resultsPerPage?: number
  currentPage?: number
}

// Analytics event types
export interface AnalyticsEvent {
  eventName: string
  eventData?: Record<string, unknown>
  timestamp?: string
}
