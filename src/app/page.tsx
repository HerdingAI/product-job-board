'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { mapSupabaseJobToAppJob } from '@/lib/data-mapper'
import { AppJob, FilterState, Tag } from '@/lib/types'
import { Search, MapPin, Clock, Building, DollarSign, Sliders } from 'lucide-react'
import { formatJobDate, formatSalaryRange } from '@/lib/data-mapper'
import { AdvancedFilterSidebar } from '@/components/AdvancedFilterSidebar'
import { searchJobs, highlight } from '@/lib/search'
import type { SupabaseJob } from '@/lib/supabase'
import { tagToUrlParam, tagFromUrlParam } from '@/lib/tag-parser'

export default function HomePage() {
  // Next.js routing hooks for URL state management
  const router = useRouter()
  
  const [jobs, setJobs] = useState<AppJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, hasNextPage: false })
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
      
      // Sync with URL
      updateUrl(updatedFilters)
      
      return updatedFilters
    })
  }, [updateUrl])

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
        setPagination({ page: 1, limit: filters.resultsPerPage || 50, hasNextPage: false })
      }
      
  // Note: removed legacy debug and centralized tag filtering within data branches
      
    } catch (err) {
      console.error('Search API error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    // Debounce the fetchJobs call to avoid excessive API calls during typing
    const timeoutId = setTimeout(() => {
      fetchJobs()
    }, 300) // 300ms delay

    return () => clearTimeout(timeoutId)
  }, [fetchJobs])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product jobs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchJobs}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Advanced Filter Sidebar */}
      <AdvancedFilterSidebar
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={showAdvancedFilters}
        onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
        jobs={jobs}
        actualFilterValues={actualFilterValues}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Management Jobs
          </h1>
          <p className="text-gray-600">
            Discover your next product role from top companies
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or skills..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select
              value={filters.seniority || ''}
              onChange={(e) => handleFilterChange({ seniority: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Seniority Levels</option>
              {actualFilterValues.seniority.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <select
              value={filters.location || ''}
              onChange={(e) => handleFilterChange({ location: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {actualFilterValues.location.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={filters.workArrangement || ''}
              onChange={(e) => handleFilterChange({ workArrangement: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Work Types</option>
              {actualFilterValues.workArrangement.map(arrangement => (
                <option key={arrangement} value={arrangement}>{arrangement}</option>
              ))}
            </select>

            <button
              onClick={() => setShowAdvancedFilters(true)}
              className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
              className="text-gray-600 hover:text-gray-800 text-sm"
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

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">Showing {jobs.length} product management positions</p>
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
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/jobs/${job.id}`} className="hover:text-blue-600">
                      {job.title}
                    </Link>
                  </h3>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{job.company.name}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {job.location.metro || job.location.city || 
                         (job.location.isRemote ? 'Remote' : 'Location TBD')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatJobDate(job.postedDate || job.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {formatSalaryRange(job.compensation) && (
                    <div className="flex items-center text-green-600 font-medium">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{formatSalaryRange(job.compensation)}</span>
                    </div>
                  )}
                  {job.experience.seniorityLevel && (
                    <div className={`text-sm text-gray-500 ${formatSalaryRange(job.compensation) ? 'mt-1' : ''}`}>
                      {job.experience.seniorityLevel} Level
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Preview with optional highlighting */}
              <p className="text-gray-700 mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: highlight(job.description, filters.search || '') }} />

              {/* Tags */}
              {job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.slice(0, 6).map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${tag.category === 'core-pm' ? 'bg-blue-100 text-blue-800' :
                          tag.category === 'technical' ? 'bg-green-100 text-green-800' :
                          tag.category === 'domain' ? 'bg-purple-100 text-purple-800' :
                          tag.category === 'leadership' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                  {job.tags.length > 6 && (
                    <span className="text-gray-500 text-xs">
                      +{job.tags.length - 6} more
                    </span>
                  )}
                </div>
              )}

              {/* Job Meta */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-4 text-sm text-gray-500">
                  {job.employmentType && (
                    <span>{job.employmentType}</span>
                  )}
                  {job.location.isRemote && (
                    <span className="text-green-600">Remote OK</span>
                  )}
                  {job.location.isHybrid && (
                    <span className="text-blue-600">Hybrid</span>
                  )}
                </div>
                <Link 
                  href={`/jobs/${job.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {jobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No jobs found matching your criteria.</p>
            <button
              onClick={() => setFilters({ search: '', seniority: '', location: '', workArrangement: '', activeTags: [] })}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
