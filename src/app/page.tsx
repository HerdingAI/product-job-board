'use client'

import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { mapSupabaseJobToAppJob } from '@/lib/data-mapper'
import { AppJob, FilterState, Tag } from '@/lib/types'
import { Search, MapPin, Clock, Building, Sliders } from 'lucide-react'
import { formatJobDate, formatSalaryRange } from '@/lib/data-mapper'
import { searchJobs, highlightSafe, highlight } from '@/lib/search'
import { extractCleanTextPreview } from '@/lib/html-parser'
import type { SupabaseJob } from '@/lib/supabase'
import { tagToUrlParam, tagFromUrlParam } from '@/lib/tag-parser'
import { usePerformance } from '@/hooks/usePerformance'

// Lazy load the AdvancedFilterSidebar for better performance
const AdvancedFilterSidebar = lazy(() => 
  import('@/components/AdvancedFilterSidebar').then(module => ({ 
    default: module.AdvancedFilterSidebar 
  }))
)

// Memoized JobCard component for performance
const JobCard = memo(({ job, searchTerm }: { job: AppJob; searchTerm: string }) => (
  <div className="modern-card p-4 sm:p-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
      <div className="flex-grow mb-3 sm:mb-0">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 leading-tight">
          <Link href={`/jobs/${job.id}`} className="hover:text-blue-400 transition-colors duration-200">
            <span dangerouslySetInnerHTML={{ __html: highlight(job.title, searchTerm) }} />
          </Link>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 text-gray-400 mb-3 text-sm sm:text-base">
          <div className="flex items-center">
            <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500 flex-shrink-0" />
            <span className="font-medium text-gray-300 truncate">{job.company.name}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500 flex-shrink-0" />
            <span className="truncate">
              {job.location.metro || job.location.city || 
               (job.location.isRemote ? 'Remote' : 'Location TBD')}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500 flex-shrink-0" />
            <span>{formatJobDate(job.postedDate || job.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-row sm:flex-col items-start sm:items-end sm:text-right sm:ml-6 space-x-3 sm:space-x-0 sm:space-y-2">
        {formatSalaryRange(job.compensation) && (
          <div className="flex items-center text-emerald-400 font-semibold text-base sm:text-lg">
            <span>{formatSalaryRange(job.compensation)}</span>
          </div>
        )}
        {job.experience.seniorityLevel && (
          <div className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800/50 whitespace-nowrap">
            {job.experience.seniorityLevel} Level
          </div>
        )}
      </div>
    </div>

    {/* Job Description Preview with optional highlighting - Clean Text Only */}
    <p 
      className="text-gray-300 mb-3 sm:mb-4 line-clamp-2 leading-relaxed text-sm sm:text-base" 
      dangerouslySetInnerHTML={{ 
        __html: highlightSafe(
          extractCleanTextPreview(job.description, 180), 
          searchTerm
        ) 
      }} 
    />

    {/* Tags */}
    {job.tags.length > 0 && (
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {job.tags.slice(0, 4).map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105
              ${tag.category === 'core-pm' ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' :
                tag.category === 'technical' ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50' :
                tag.category === 'domain' ? 'bg-violet-900/30 text-violet-300 border border-violet-800/50' :
                tag.category === 'leadership' ? 'bg-orange-900/30 text-orange-300 border border-orange-800/50' :
                'bg-gray-800/50 text-gray-300 border border-gray-700/50'}`}
          >
            {tag.label}
          </span>
        ))}
        {job.tags.length > 4 && (
          <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium bg-gray-800/50 text-gray-400 border border-gray-700/50">
            +{job.tags.length - 4} more
          </span>
        )}
      </div>
    )}

    {/* Job Meta */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 border-t border-gray-800 space-y-2 sm:space-y-0">
      <div className="flex flex-wrap gap-2 text-sm text-gray-400">
        {job.employmentType && (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-800/50 text-gray-300 text-xs font-medium">
            {job.employmentType}
          </span>
        )}
        {job.location.isRemote && (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-900/30 text-emerald-300 text-xs font-medium">
            Remote OK
          </span>
        )}
        {job.location.isHybrid && (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-900/30 text-blue-300 text-xs font-medium">
            Hybrid
          </span>
        )}
      </div>
      <Link 
        href={`/jobs/${job.id}`}
        className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors duration-200 group self-start sm:self-auto"
      >
        <span>View Details</span>
        <span className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
      </Link>
    </div>
  </div>
))

JobCard.displayName = 'JobCard'

export default function HomePage() {
  // Performance monitoring
  const { startTimer, updateJobCount, logMetrics } = usePerformance()
  
  // Search input ref for focus management
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Next.js routing hooks for URL state management
  const router = useRouter()
  
  const [jobs, setJobs] = useState<AppJob[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, hasNextPage: false })
  const [totalLoaded, setTotalLoaded] = useState(0)
  const [canLoadMore, setCanLoadMore] = useState(true)
  
  // Separate state for search input to enable debouncing
  const [searchInput, setSearchInput] = useState('')
  const [isSearchPending, setIsSearchPending] = useState(false)
  const [actualFilterValues, setActualFilterValues] = useState<{
    seniority: string[]
    location: string[]
    workArrangement: string[]
    companyStage: string[]
    productLifecycle: string[]
    productDomain: string[]
    managementScope: string[]
    industryVertical: string[]
    experienceBucket: string[]
    domainExpertise: string[]
  }>({
    seniority: [],
    location: [],
    workArrangement: [],
    companyStage: [],
    productLifecycle: [],
    productDomain: [],
    managementScope: [],
    industryVertical: [],
    experienceBucket: [],
    domainExpertise: []
  })
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>(() => {
    const initialFilters: FilterState = {
      search: '',
      seniority: '',
      location: '',
      workArrangement: '',
      companyStage: [],
      productLifecycle: [],
      productDomain: [],
      managementScope: [],
      industryVertical: [],
      experienceBucket: [],
      domainExpertise: [],
      activeTags: [],
  showAdvancedFilters: false,
  sortBy: 'relevance',
  resultsPerPage: 50,
  currentPage: 1
    }
    
    // If we're on the client side, parse URL parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      
      // Parse single-value filters
      if (params.get('search')) initialFilters.search = params.get('search') || ''
      if (params.get('seniority')) initialFilters.seniority = params.get('seniority') || ''
      if (params.get('location')) initialFilters.location = params.get('location') || ''
      if (params.get('workArrangement')) initialFilters.workArrangement = params.get('workArrangement') || ''
      
      // Parse multi-value filters
      if (params.get('companyStage')) {
        initialFilters.companyStage = params.get('companyStage')?.split(',') || []
      }
      if (params.get('productLifecycle')) {
        initialFilters.productLifecycle = params.get('productLifecycle')?.split(',') || []
      }
      if (params.get('productDomain')) {
        initialFilters.productDomain = params.get('productDomain')?.split(',') || []
      }
      if (params.get('managementScope')) {
        initialFilters.managementScope = params.get('managementScope')?.split(',') || []
      }
      if (params.get('industryVertical')) {
        initialFilters.industryVertical = params.get('industryVertical')?.split(',') || []
      }
      if (params.get('experienceBucket')) {
        initialFilters.experienceBucket = params.get('experienceBucket')?.split(',') || []
      }
      if (params.get('domainExpertise')) {
        initialFilters.domainExpertise = params.get('domainExpertise')?.split(',') || []
      }
      
      // Parse salary filters
      if (params.get('salaryMin')) {
        initialFilters.salaryMin = parseInt(params.get('salaryMin') || '0') || undefined
      }
      if (params.get('salaryMax')) {
        initialFilters.salaryMax = parseInt(params.get('salaryMax') || '0') || undefined
      }
      
      // Parse tags
      if (params.get('tags')) {
        const tagParams = params.get('tags')?.split(',') || []
        initialFilters.activeTags = tagParams
          .map(tagFromUrlParam)
          .filter((tag): tag is Tag => tag !== null)
      }

  // Parse pagination
  const pageParam = params.get('page')
  const limitParam = params.get('limit')
  if (pageParam) initialFilters.currentPage = Math.max(1, parseInt(pageParam))
  if (limitParam) initialFilters.resultsPerPage = Math.max(1, parseInt(limitParam))
    }
    
    return initialFilters
  })

  // URL synchronization function
  const updateUrl = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams()
    
    // Add non-empty single-value filters
    if (newFilters.search?.trim()) params.set('search', newFilters.search.trim())
    if (newFilters.seniority?.trim()) params.set('seniority', newFilters.seniority.trim())
    if (newFilters.location?.trim()) params.set('location', newFilters.location.trim())
    if (newFilters.workArrangement?.trim()) params.set('workArrangement', newFilters.workArrangement.trim())
    
    // Add non-empty multi-value filters
    if (newFilters.companyStage?.length) params.set('companyStage', newFilters.companyStage.join(','))
    if (newFilters.productLifecycle?.length) params.set('productLifecycle', newFilters.productLifecycle.join(','))
    if (newFilters.productDomain?.length) params.set('productDomain', newFilters.productDomain.join(','))
    if (newFilters.managementScope?.length) params.set('managementScope', newFilters.managementScope.join(','))
    if (newFilters.industryVertical?.length) params.set('industryVertical', newFilters.industryVertical.join(','))
    if (newFilters.experienceBucket?.length) params.set('experienceBucket', newFilters.experienceBucket.join(','))
    if (newFilters.domainExpertise?.length) params.set('domainExpertise', newFilters.domainExpertise.join(','))
    
    // Add salary filters
    if (newFilters.salaryMin) params.set('salaryMin', newFilters.salaryMin.toString())
    if (newFilters.salaryMax) params.set('salaryMax', newFilters.salaryMax.toString())
    
    // Add tags
    if (newFilters.activeTags?.length) {
      const tagParams = newFilters.activeTags.map(tagToUrlParam).join(',')
      params.set('tags', tagParams)
    }
    
  // Pagination params
  if (newFilters.resultsPerPage) params.set('limit', String(newFilters.resultsPerPage))
  if (newFilters.currentPage) params.set('page', String(newFilters.currentPage))

  // Update URL without page reload
    const queryString = params.toString()
    const newUrl = queryString ? `/?${queryString}` : '/'
    
    // Only update if the URL actually changed to avoid infinite loops
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl, { scroll: false })
    }
  }, [router])

  // Enhanced filter change handler with URL sync
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters }
      return updatedFilters
    })
  }, [])

  // Use useEffect to sync URL after filters change
  useEffect(() => {
    updateUrl(filters)
  }, [filters, updateUrl])

  // Debounced search effect with smart timing based on search length
  useEffect(() => {
    // Smart debounce timing based on search term length
    const getDebounceDelay = (searchTerm: string) => {
      const trimmed = searchTerm.trim()
      if (trimmed.length === 0) return 0 // Clear immediately
      if (trimmed.length <= 2) return 1200 // Longer delay for short terms
      if (trimmed.length <= 4) return 800 // Medium delay for medium terms
      return 600 // Shorter delay for longer, more specific terms
    }

    const delay = getDebounceDelay(searchInput)
    
    // Show pending state if there's a delay and search input differs from current filter
    if (delay > 0 && searchInput !== filters.search) {
      setIsSearchPending(true)
    }

    const timeoutId = setTimeout(() => {
      setIsSearchPending(false)
      handleFilterChange({ search: searchInput })
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      if (delay === 0) setIsSearchPending(false)
    }
  }, [searchInput, filters.search]) // Added filters.search to dependency

  // Sync searchInput with filters.search when filters change externally (e.g., URL change)
  useEffect(() => {
    setSearchInput(filters.search || '')
  }, [filters.search])

  // Focus search input after results update (for better UX during active searching)
  useEffect(() => {
    if (!loading && searchInput.trim() && searchInputRef.current && document.activeElement !== searchInputRef.current) {
      // Small delay to ensure the page has updated before focusing
      const timeoutId = setTimeout(() => {
        searchInputRef.current?.focus()
        // Move cursor to end of input
        const input = searchInputRef.current
        if (input) {
          input.setSelectionRange(input.value.length, input.value.length)
        }
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [jobs, loading, searchInput]) // Focus when jobs update and user has searched

  // Function to fetch actual filter values from the database
  const fetchActualFilterValues = useCallback(async () => {
    try {
      console.log('🔍 Fetching actual filter values from database...')
      
      // First, let's test if we can reach the jobs table at all
      const { data: testJobs, error: testError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('is_currently_active', true)
        .eq('is_product_job', true)
        .limit(5)
      
      if (testError) {
        console.error('❌ Database connection error:', testError)
        return
      }
      
      console.log('✅ Database connection working. Found', testJobs?.length, 'jobs')
      console.log('📋 Sample jobs:', testJobs?.map(j => j.title).slice(0, 3))
      
      // Now try the actual filter query - using CORRECT schema field names from the database
      const { data: allJobs, error } = await supabase
        .from('jobs')
        .select('seniority_level, location_metro, work_arrangement, company_stage, product_lifecycle_focus, product_domain, management_scope, industry_vertical, experience_bucket, domain_expertise')
        .eq('is_currently_active', true)
        .eq('is_product_job', true)
        .limit(1000) // Get a good sample
      
      if (error) {
        console.error('❌ Filter values query error:', error)
        return
      }
      
      console.log('✅ Filter query successful. Got', allJobs?.length, 'jobs for filter extraction')
      
      if (allJobs) {
        // Extract unique values and filter out nulls/empty strings
        const seniority = [...new Set(allJobs.map(j => j.seniority_level).filter(Boolean))].sort()
        const location = [...new Set([
          ...allJobs.map(j => j.location_metro).filter(Boolean)
        ])].sort()
        const workArrangement = [...new Set(allJobs.map(j => j.work_arrangement).filter(Boolean))].sort()
        const companyStage = [...new Set(allJobs.map(j => j.company_stage).filter(Boolean))].sort()
        const productLifecycle = [...new Set(allJobs.map(j => j.product_lifecycle_focus).filter(Boolean))].sort()
        const productDomain = [...new Set(allJobs.map(j => j.product_domain).filter(Boolean))].sort()
        const managementScope = [...new Set(allJobs.map(j => j.management_scope).filter(Boolean))].sort()
        const industryVertical = [...new Set(allJobs.map(j => j.industry_vertical).filter(Boolean))].sort()
        const experienceBucket = [...new Set(allJobs.map(j => j.experience_bucket).filter(Boolean))].sort()
        const domainExpertise = [...new Set(allJobs.map(j => j.domain_expertise).filter(Boolean))].sort()
        
        console.log('🔍 Actual database values:')
        console.log('  Seniority:', seniority)
        console.log('  Location:', location)
        console.log('  Work Arrangement:', workArrangement)
        console.log('  Company Stage:', companyStage)
        console.log('  Product Lifecycle:', productLifecycle)
        console.log('  Product Domain:', productDomain)
        console.log('  Management Scope:', managementScope)
        console.log('  Industry Vertical:', industryVertical)
        console.log('  Experience Bucket:', experienceBucket)
        console.log('  Domain Expertise:', domainExpertise)
        
        setActualFilterValues({
          seniority,
          location,
          workArrangement,
          companyStage,
          productLifecycle,
          productDomain,
          managementScope,
          industryVertical,
          experienceBucket,
          domainExpertise
        })
      }
    } catch (error) {
      console.error('Error fetching filter values:', error)
    }
  }, [])

  // Fetch actual filter values on component mount
  useEffect(() => {
    fetchActualFilterValues()
  }, [fetchActualFilterValues])

  const fetchJobs = useCallback(async () => {
    const searchTimer = startTimer('search')
    setLoading(true)
    setError(null)
    
    try {
      console.log('=== FETCH JOBS START ===')
      console.log('Current filters:', filters)
      
      const shouldUseSearch = Boolean(filters.search && filters.search.trim().length > 0)
      if (shouldUseSearch) {
        const page = filters.currentPage || 1
        const limit = filters.resultsPerPage || 50
        try {
          const result = await searchJobs({
            searchTerm: filters.search!.trim(),
            filters,
            page,
            limit,
          })
          const rpcRows = (result.jobs || []) as Array<SupabaseJob & { search_rank?: number }>
          let mapped = rpcRows.map(row => mapSupabaseJobToAppJob(row))
          if (filters.activeTags && filters.activeTags.length > 0) {
            mapped = mapped.filter(job =>
              filters.activeTags!.every(selectedTag =>
                job.tags.some(jobTag => jobTag.label === selectedTag.label && jobTag.category === selectedTag.category)
              )
            )
          }
          setJobs(mapped)
          setTotalLoaded(mapped.length)
          setCanLoadMore(mapped.length < 1000 && (result.pagination?.hasNextPage || false))
          setPagination({ page, limit, hasNextPage: result.pagination?.hasNextPage || false })
        } catch (e) {
          console.warn('[search] RPC failed, falling back to simple filter query:', e)
          // Fallback: basic LIKE search across title/company/description
          let q = supabase
            .from('jobs')
            .select('*')
            .eq('is_currently_active', true)
            .eq('is_product_job', true)
            .or(
              `ilike(title,%${filters.search!.trim()}%),ilike(company,%${filters.search!.trim()}%),ilike(description,%${filters.search!.trim()}%)`
            )
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

          if (filters.seniority && filters.seniority.trim()) {
            q = q.eq('seniority_level', filters.seniority)
          }
          if (filters.location && filters.location.trim()) {
            q = q.eq('location_metro', filters.location)
          }
          if (filters.workArrangement && filters.workArrangement.trim()) {
            q = q.eq('work_arrangement', filters.workArrangement)
          }
          if (filters.companyStage?.length) q = q.in('company_stage', filters.companyStage)
          if (filters.productLifecycle?.length) q = q.in('product_lifecycle_focus', filters.productLifecycle)
          if (filters.productDomain?.length) q = q.in('product_domain', filters.productDomain)
          if (filters.managementScope?.length) q = q.in('management_scope', filters.managementScope)
          if (filters.industryVertical?.length) q = q.in('industry_vertical', filters.industryVertical)
          if (filters.experienceBucket?.length) q = q.in('experience_bucket', filters.experienceBucket)
          if (filters.domainExpertise?.length) q = q.in('domain_expertise', filters.domainExpertise)
          if (filters.salaryMin) q = q.gte('salary_min', filters.salaryMin)
          if (filters.salaryMax) q = q.lte('salary_max', filters.salaryMax)

          const { data, error: fbErr, count } = await q
          if (fbErr) throw fbErr
          let mapped = (data || []).map(mapSupabaseJobToAppJob)
          if (filters.activeTags && filters.activeTags.length > 0) {
            mapped = mapped.filter(job =>
              filters.activeTags!.every(selectedTag =>
                job.tags.some(jobTag => jobTag.label === selectedTag.label && jobTag.category === selectedTag.category)
              )
            )
          }
          setJobs(mapped)
          setTotalLoaded(mapped.length)
          setCanLoadMore(mapped.length < 1000 && (data?.length || 0) === limit)
          // Best-effort pagination signal (if page returns full page, assume maybe next)
          setPagination({ page, limit, hasNextPage: (data?.length || 0) === limit })
        }
      } else {
        // Fall back to previous filter-only fetch
        let query = supabase
          .from('jobs')
          .select('*')
          .eq('is_currently_active', true)
          .eq('is_product_job', true)
          .order('created_at', { ascending: false })
          .limit(filters.resultsPerPage || 50)

        if (filters.seniority && filters.seniority.trim()) {
          query = query.eq('seniority_level', filters.seniority)
        }
        if (filters.location && filters.location.trim()) {
          query = query.eq('location_metro', filters.location)
        }
        if (filters.workArrangement && filters.workArrangement.trim()) {
          query = query.eq('work_arrangement', filters.workArrangement)
        }
        if (filters.companyStage?.length) query = query.in('company_stage', filters.companyStage)
        if (filters.productLifecycle?.length) query = query.in('product_lifecycle_focus', filters.productLifecycle)
        if (filters.productDomain?.length) query = query.in('product_domain', filters.productDomain)
        if (filters.managementScope?.length) query = query.in('management_scope', filters.managementScope)
        if (filters.industryVertical?.length) query = query.in('industry_vertical', filters.industryVertical)
        if (filters.experienceBucket?.length) query = query.in('experience_bucket', filters.experienceBucket)
        if (filters.domainExpertise?.length) query = query.in('domain_expertise', filters.domainExpertise)
        if (filters.salaryMin) query = query.gte('salary_min', filters.salaryMin)
        if (filters.salaryMax) query = query.lte('salary_max', filters.salaryMax)

        const { data, error: fetchError } = await query
        if (fetchError) {
          setError(`Failed to load jobs: ${fetchError.message || 'Unknown error'}`)
          return
        }
        let mapped = (data || []).map(mapSupabaseJobToAppJob)
        if (filters.activeTags && filters.activeTags.length > 0) {
          mapped = mapped.filter(job =>
            filters.activeTags!.every(selectedTag =>
              job.tags.some(jobTag => jobTag.label === selectedTag.label && jobTag.category === selectedTag.category)
            )
          )
        }
        setJobs(mapped)
        setTotalLoaded(mapped.length)
        setCanLoadMore(mapped.length < 1000 && mapped.length >= (filters.resultsPerPage || 50))
        setPagination({ page: 1, limit: filters.resultsPerPage || 50, hasNextPage: false })
      }
      
  // Note: removed legacy debug and centralized tag filtering within data branches
      
    } catch (err) {
      console.error('Search API error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      const searchTime = searchTimer.end()
      updateJobCount(jobs.length)
      logMetrics()
      setLoading(false)
    }
  }, [filters])

  // Load more jobs function - appends to existing jobs
  const loadMoreJobs = useCallback(async () => {
    if (!canLoadMore || loadingMore || totalLoaded >= 1000) return
    
    setLoadingMore(true)
    setError(null)
    
    try {
      const nextPage = pagination.page + 1
      const limit = pagination.limit
      
      console.log('=== LOAD MORE JOBS ===')
      console.log('Loading page:', nextPage, 'Current total:', totalLoaded)
      
      const shouldUseSearch = Boolean(filters.search && filters.search.trim().length > 0)
      
      if (shouldUseSearch) {
        try {
          const result = await searchJobs({
            searchTerm: filters.search!.trim(),
            filters,
            page: nextPage,
            limit,
          })
          const rpcRows = (result.jobs || []) as Array<SupabaseJob & { search_rank?: number }>
          let newJobs = rpcRows.map(row => mapSupabaseJobToAppJob(row))
          
          if (filters.activeTags && filters.activeTags.length > 0) {
            newJobs = newJobs.filter(job =>
              filters.activeTags!.every(selectedTag =>
                job.tags.some(jobTag => jobTag.label === selectedTag.label && jobTag.category === selectedTag.category)
              )
            )
          }
          
          const updatedJobs = [...jobs, ...newJobs]
          setJobs(updatedJobs)
          setTotalLoaded(updatedJobs.length)
          setCanLoadMore(updatedJobs.length < 1000 && newJobs.length === limit && (result.pagination?.hasNextPage || false))
          setPagination({ page: nextPage, limit, hasNextPage: result.pagination?.hasNextPage || false })
          
        } catch (e) {
          console.warn('[loadMore] Search failed, trying regular query:', e)
          // Fallback to regular query
          await loadMoreWithRegularQuery(nextPage, limit)
        }
      } else {
        await loadMoreWithRegularQuery(nextPage, limit)
      }
      
    } catch (err) {
      console.error('Load more error:', err)
      setError('Failed to load more jobs. Please try again.')
    } finally {
      setLoadingMore(false)
    }
  }, [filters, jobs, pagination, canLoadMore, loadingMore, totalLoaded])

  // Helper function for regular query load more
  const loadMoreWithRegularQuery = async (nextPage: number, limit: number) => {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_currently_active', true)
      .eq('is_product_job', true)
      .order('created_at', { ascending: false })
      .range((nextPage - 1) * limit, nextPage * limit - 1)

    // Apply all filters
    if (filters.seniority && filters.seniority.trim()) {
      query = query.eq('seniority_level', filters.seniority)
    }
    if (filters.location && filters.location.trim()) {
      query = query.eq('location_metro', filters.location)
    }
    if (filters.workArrangement && filters.workArrangement.trim()) {
      query = query.eq('work_arrangement', filters.workArrangement)
    }
    if (filters.companyStage?.length) query = query.in('company_stage', filters.companyStage)
    if (filters.productLifecycle?.length) query = query.in('product_lifecycle_focus', filters.productLifecycle)
    if (filters.productDomain?.length) query = query.in('product_domain', filters.productDomain)
    if (filters.managementScope?.length) query = query.in('management_scope', filters.managementScope)
    if (filters.industryVertical?.length) query = query.in('industry_vertical', filters.industryVertical)
    if (filters.experienceBucket?.length) query = query.in('experience_bucket', filters.experienceBucket)
    if (filters.domainExpertise?.length) query = query.in('domain_expertise', filters.domainExpertise)
    if (filters.salaryMin) query = query.gte('salary_min', filters.salaryMin)
    if (filters.salaryMax) query = query.lte('salary_max', filters.salaryMax)

    const { data, error: fetchError } = await query
    if (fetchError) throw fetchError
    
    let newJobs = (data || []).map(mapSupabaseJobToAppJob)
    if (filters.activeTags && filters.activeTags.length > 0) {
      newJobs = newJobs.filter(job =>
        filters.activeTags!.every(selectedTag =>
          job.tags.some(jobTag => jobTag.label === selectedTag.label && jobTag.category === selectedTag.category)
        )
      )
    }
    
    const updatedJobs = [...jobs, ...newJobs]
    setJobs(updatedJobs)
    setTotalLoaded(updatedJobs.length)
    setCanLoadMore(updatedJobs.length < 1000 && newJobs.length === limit)
    setPagination({ page: nextPage, limit, hasNextPage: newJobs.length === limit })
  }

  useEffect(() => {
    // Reset pagination and load more state when filters change
    setTotalLoaded(0)
    setCanLoadMore(true)
    setPagination({ page: 1, limit: 50, hasNextPage: false })
    
    // Debounce the fetchJobs call to avoid excessive API calls during typing
    const timeoutId = setTimeout(() => {
      fetchJobs()
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [fetchJobs])

  // Memoize the job list rendering for better performance
  const memoizedJobList = useMemo(() => (
    <div className="space-y-3 sm:space-y-4">
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job} 
          searchTerm={filters.search || ''} 
        />
      ))}
    </div>
  ), [jobs, filters.search])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-300 text-sm sm:text-base">Loading product jobs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-8 sm:py-12">
            <p className="text-red-400 mb-4 text-sm sm:text-base">{error}</p>
            <button 
              onClick={fetchJobs}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Advanced Filter Sidebar */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
          <div className="bg-gray-900 h-full w-80 p-6 shadow-2xl border-r border-gray-800">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-800 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-800 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }>
        <AdvancedFilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          isOpen={showAdvancedFilters}
          onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
          jobs={jobs}
          actualFilterValues={actualFilterValues}
        />
      </Suspense>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
            Product Management Jobs
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Discover your next product role from top companies worldwide
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="relative group">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 transition-colors group-focus-within:text-primary-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search jobs by title, company, or skills... (Press Enter for instant search)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                // Allow users to press Escape to blur the search input
                if (e.key === 'Escape') {
                  searchInputRef.current?.blur()
                }
                // Allow users to press Enter for immediate search
                if (e.key === 'Enter') {
                  setIsSearchPending(false)
                  handleFilterChange({ search: searchInput })
                }
              }}
              className="input-modern w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-base placeholder-gray-500 focus:placeholder-gray-400"
            />
            
            {/* Search pending indicator */}
            {isSearchPending && (
              <div className="absolute right-10 sm:right-12 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {searchInput.trim() && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                aria-label="Clear search"
              >
                <span className="text-base sm:text-lg">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative">
              <select
                value={filters.seniority || ''}
                onChange={(e) => handleFilterChange({ seniority: e.target.value })}
                className="input-modern appearance-none w-full pr-8 sm:pr-10 text-sm sm:text-base"
              >
                <option value="">All Seniority Levels</option>
                {actualFilterValues.seniority.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={filters.location || ''}
                onChange={(e) => handleFilterChange({ location: e.target.value })}
                className="input-modern appearance-none w-full pr-8 sm:pr-10 text-sm sm:text-base"
              >
                <option value="">All Locations</option>
                {actualFilterValues.location.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={filters.workArrangement || ''}
                onChange={(e) => handleFilterChange({ workArrangement: e.target.value })}
                className="input-modern appearance-none w-full pr-10"
              >
                <option value="">All Work Types</option>
                {actualFilterValues.workArrangement.map(arrangement => (
                  <option key={arrangement} value={arrangement}>{arrangement}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setShowAdvancedFilters(true)}
              className="btn-modern flex items-center justify-center"
            >
              <Sliders className="h-4 w-4 mr-2" />
              Advanced Filters
            </button>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setFilters({ 
                search: '', 
                seniority: '', 
                location: '', 
                workArrangement: '', 
                companyStage: [],
                productLifecycle: [],
                productDomain: [],
                managementScope: [],
                industryVertical: [],
                experienceBucket: [],
                domainExpertise: [],
                activeTags: [],
                salaryMin: undefined,
                salaryMax: undefined
              })}
              className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.companyStage?.length || filters.productLifecycle?.length || filters.productDomain?.length || 
          filters.managementScope?.length || filters.industryVertical?.length || filters.experienceBucket?.length || 
          filters.domainExpertise?.length || filters.salaryMin || filters.salaryMax) && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-900">Active Advanced Filters:</h4>
              <button
                onClick={() => setFilters(prev => ({
                  ...prev,
                  companyStage: [],
                  productLifecycle: [],
                  productDomain: [],
                  managementScope: [],
                  industryVertical: [],
                  experienceBucket: [],
                  domainExpertise: [],
                  salaryMin: undefined,
                  salaryMax: undefined
                }))}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear Advanced
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.companyStage?.map(stage => (
                <span key={stage} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Company: {stage}
                </span>
              ))}
              {filters.productLifecycle?.map(lifecycle => (
                <span key={lifecycle} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Lifecycle: {lifecycle}
                </span>
              ))}
              {filters.productDomain?.map(domain => (
                <span key={domain} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Domain: {domain}
                </span>
              ))}
              {filters.managementScope?.map(scope => (
                <span key={scope} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Management: {scope}
                </span>
              ))}
              {filters.industryVertical?.map(industry => (
                <span key={industry} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                  Industry: {industry}
                </span>
              ))}
              {filters.experienceBucket?.map(experience => (
                <span key={experience} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-cyan-100 text-cyan-800">
                  Experience: {experience}
                </span>
              ))}
              {filters.domainExpertise?.map(domain => (
                <span key={domain} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                  Domain: {domain}
                </span>
              ))}
              {(filters.salaryMin || filters.salaryMax) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                  Salary: {filters.salaryMin ? `$${Math.floor(filters.salaryMin/1000)}K` : '0'} - {filters.salaryMax ? `$${Math.floor(filters.salaryMax/1000)}K` : '∞'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results Count & Search Status */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              {filters.search?.trim() ? (
                <>
                  <span className="font-medium">{jobs.length}</span> results found for 
                  <span className="font-medium text-blue-600 ml-1">"{filters.search.trim()}"</span>
                </>
              ) : (
                <>Showing <span className="font-medium">{jobs.length}</span> product management positions</>
              )}
            </p>
            {filters.search?.trim() && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <span>Clear search</span>
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
          {filters.search?.trim() && (
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, currentPage: Math.max(1, (prev.currentPage || 1) - 1) }))}
                className={`px-3 py-1 border rounded ${pagination.page <= 1 ? 'text-gray-300' : 'hover:bg-gray-50'}`}
              >Prev</button>
              <span className="text-sm text-gray-500">Page {pagination.page}</span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setFilters(prev => ({ ...prev, currentPage: (prev.currentPage || 1) + 1 }))}
                className={`px-3 py-1 border rounded ${!pagination.hasNextPage ? 'text-gray-300' : 'hover:bg-gray-50'}`}
              >Next</button>
            </div>
          )}
        </div>

        {/* Job List */}
        {memoizedJobList}

        {/* Load More Button */}
        {jobs.length > 0 && canLoadMore && totalLoaded < 1000 && (
          <div className="text-center mt-8 mb-8">
            <button
              onClick={loadMoreJobs}
              disabled={loadingMore}
              className="btn-modern px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
            >
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading more jobs...</span>
                </>
              ) : (
                <>
                  <span>Load More Jobs</span>
                  <span className="text-sm text-gray-300">({totalLoaded}/1000 loaded)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Maximum Reached Message */}
        {jobs.length > 0 && totalLoaded >= 1000 && (
          <div className="text-center mt-8 mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-900/30 text-blue-300 border border-blue-800/50">
              <span className="text-sm">Maximum of 1000 jobs loaded. Please refine your search for more specific results.</span>
            </div>
          </div>
        )}

        {/* No More Jobs Message */}
        {jobs.length > 0 && !canLoadMore && totalLoaded < 1000 && (
          <div className="text-center mt-8 mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-800/50 text-gray-400 border border-gray-700/50">
              <span className="text-sm">All jobs loaded ({totalLoaded} total)</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {jobs.length === 0 && !loading && (
          <div className="text-center py-12 px-4">
            <div className="mb-6">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              {filters.search?.trim() ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found for "{filters.search.trim()}"
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search terms or removing some filters to see more results.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No jobs match your current filters
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try broadening your search criteria or clearing some filters.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {filters.search?.trim() && (
                <button
                  onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                  className="block mx-auto text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search term
                </button>
              )}
              <button
                onClick={() => setFilters({ search: '', seniority: '', location: '', workArrangement: '', activeTags: [] })}
                className="block mx-auto text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
              <p className="text-sm text-gray-400 mt-4">
                Or try searching for terms like "product manager", "AI", "senior", "growth"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
