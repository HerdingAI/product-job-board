import React, { useState } from 'react'
import { FilterState, Tag } from '@/lib/types'
import { ChevronDown, ChevronUp, X, Sliders, Hash, Building, Briefcase, User, Target, Layers, Boxes } from 'lucide-react'
import { TAG_CATEGORIES, getAllUniqueTagsFromJobs } from '@/lib/tag-parser'
import { AppJob } from '@/lib/types'

interface AdvancedFilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  isOpen: boolean
  onToggle: () => void
  jobs?: AppJob[] // Add jobs for tag extraction
  actualFilterValues: {
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
  }
}

export function AdvancedFilterSidebar({ filters, onFilterChange, isOpen, onToggle, jobs = [], actualFilterValues }: AdvancedFilterSidebarProps) {
  const [expandedTagCategories, setExpandedTagCategories] = useState<Set<string>>(new Set(['core-pm']))
  const [expandedFilterCategories, setExpandedFilterCategories] = useState<Set<string>>(
    new Set(['company-stage', 'product-domain']) // Start with most common ones expanded
  )
  
  // Extract unique tags from jobs for filter options
  const availableTags = getAllUniqueTagsFromJobs(jobs)
  
  // Use actual database values instead of hardcoded ones
  const companyStageOptions = actualFilterValues.companyStage.length > 0 
    ? actualFilterValues.companyStage 
    : ['Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Pre-IPO', 'Public', 'Startup', 'Scale-up', 'Enterprise']

  const productLifecycleOptions = actualFilterValues.productLifecycle.length > 0
    ? actualFilterValues.productLifecycle
    : ['Early Stage', 'Growth Stage', 'Mature Stage', 'Sunset Stage', 'Pre-Launch', 'Launch', 'Scale', 'Optimize']

  const productDomainOptions = actualFilterValues.productDomain.length > 0
    ? actualFilterValues.productDomain
    : ['B2B SaaS', 'Consumer', 'Enterprise', 'E-commerce', 'Fintech', 'Healthtech', 'Edtech', 'Marketplace', 'Social', 'Gaming']

  const managementScopeOptions = actualFilterValues.managementScope.length > 0
    ? actualFilterValues.managementScope
    : ['Individual Contributor', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'VP', 'C-Level']

  const industryVerticalOptions = actualFilterValues.industryVertical.length > 0
    ? actualFilterValues.industryVertical
    : []

  const experienceBucketOptions = actualFilterValues.experienceBucket.length > 0
    ? actualFilterValues.experienceBucket
    : []

  const domainExpertiseOptions = actualFilterValues.domainExpertise.length > 0
    ? actualFilterValues.domainExpertise
    : []

  const handleSalaryRangeSelect = (minSalary: number) => {
    onFilterChange({ salaryMin: minSalary, salaryMax: undefined })
  }

  const clearSalaryFilter = () => {
    onFilterChange({ salaryMin: undefined, salaryMax: undefined })
  }

  const handleMultiSelectChange = (key: keyof FilterState, value: string, currentValues: string[] = []) => {
    const updated = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    onFilterChange({ [key]: updated })
  }

  const handleTagToggle = (tag: Tag) => {
    const currentTags = filters.activeTags || []
    const isSelected = currentTags.some(t => t.label === tag.label && t.category === tag.category)
    
    const updatedTags = isSelected
      ? currentTags.filter(t => !(t.label === tag.label && t.category === tag.category))
      : [...currentTags, tag]
    
    onFilterChange({ activeTags: updatedTags })
  }

  const toggleTagCategory = (category: string) => {
    const newExpanded = new Set(expandedTagCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedTagCategories(newExpanded)
  }

  const toggleFilterCategory = (category: string) => {
    const newExpanded = new Set(expandedFilterCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedFilterCategories(newExpanded)
  }

  const handleFilterChipToggle = (filterKey: keyof FilterState, value: string) => {
    const currentValues = (filters[filterKey] as string[]) || []
    const updated = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    onFilterChange({ [filterKey]: updated })
  }

  const FilterCategoryChips = ({ 
    categoryKey, 
    title, 
    options, 
    selectedValues, 
    filterKey,
    icon 
  }: {
    categoryKey: string
    title: string
    options: string[]
    selectedValues: string[]
    filterKey: keyof FilterState
    icon?: React.ReactNode
  }) => {
    if (options.length === 0) return null
    
    const isExpanded = expandedFilterCategories.has(categoryKey)
    
    return (
      <div className="border border-gray-800 rounded-lg bg-gray-900/20">
        <button
          onClick={() => toggleFilterCategory(categoryKey)}
          className="w-full px-3 py-2 text-left flex items-center justify-between bg-gray-800/30 hover:bg-gray-800/50 rounded-t-lg transition-colors"
        >
          <span className="text-sm font-medium text-gray-200 flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </span>
          <div className="flex items-center">
            {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-3 max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option)
                return (
                  <button
                    key={option}
                    onClick={() => handleFilterChipToggle(filterKey, option)}
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const clearAllFilters = () => {
    onFilterChange({
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
    })
    
    // Reset expanded states
    setExpandedFilterCategories(new Set(['company-stage', 'product-domain']))
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 sm:p-3 rounded-r-lg shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <Sliders className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-30"
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-full sm:w-80 max-w-sm bg-black border-r border-gray-800 shadow-2xl z-40 overflow-y-auto">
        {/* Add padding for fixed header */}
        <div className="pt-16 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Sliders className="h-5 w-5 mr-2" />
              Advanced Filters
            </h2>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Clear All */}
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            Clear all filters
          </button>

          {/* Active Filters Summary */}
          {(filters.companyStage?.length || filters.productLifecycle?.length || 
            filters.productDomain?.length || filters.managementScope?.length || 
            filters.industryVertical?.length || filters.experienceBucket?.length || 
            filters.domainExpertise?.length) && (
            <div className="mb-4 p-3 bg-blue-950/20 border border-blue-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-1">
                {[
                  ...(filters.companyStage?.map(s => ({ label: s, key: 'companyStage' as keyof FilterState })) || []),
                  ...(filters.productLifecycle?.map(s => ({ label: s, key: 'productLifecycle' as keyof FilterState })) || []),
                  ...(filters.productDomain?.map(s => ({ label: s, key: 'productDomain' as keyof FilterState })) || []),
                  ...(filters.managementScope?.map(s => ({ label: s, key: 'managementScope' as keyof FilterState })) || []),
                  ...(filters.industryVertical?.map(s => ({ label: s, key: 'industryVertical' as keyof FilterState })) || []),
                  ...(filters.experienceBucket?.map(s => ({ label: s, key: 'experienceBucket' as keyof FilterState })) || []),
                  ...(filters.domainExpertise?.map(s => ({ label: s, key: 'domainExpertise' as keyof FilterState })) || [])
                ].map((filter, index) => (
                  <span
                    key={`${filter.key}-${filter.label}-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer bg-blue-900/40 text-blue-200 border border-blue-700/50 hover:bg-blue-900/60 transition-colors"
                    onClick={() => handleFilterChipToggle(filter.key, filter.label)}
                  >
                    {filter.label}
                    <X className="ml-1 h-3 w-3" />
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Salary Range */}
            <div>
              <h3 className="font-medium text-white mb-3">Salary Range (USD)</h3>
              
              {/* Quick Salary Range Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: '$80K+', value: 80000 },
                  { label: '$100K+', value: 100000 },
                  { label: '$125K+', value: 125000 },
                  { label: '$150K+', value: 150000 },
                  { label: '$175K+', value: 175000 }
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleSalaryRangeSelect(range.value)}
                    className={`px-3 py-2 text-sm rounded-md border transition-all duration-200 ${
                      filters.salaryMin === range.value
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
                
                {/* Clear button in the grid */}
                <button
                  onClick={clearSalaryFilter}
                  className="px-3 py-2 text-sm rounded-md border bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500 hover:text-gray-300 transition-all duration-200"
                >
                  Clear
                </button>
              </div>
              
              {/* Show current selection */}
              {filters.salaryMin && (
                <div className="text-sm text-blue-400 bg-blue-950/30 border border-blue-800/30 rounded-md px-3 py-2">
                  Showing jobs: ${(filters.salaryMin / 1000).toFixed(0)}K+
                </div>
              )}
            </div>

            {/* Skills & Tags */}
            <div>
              <h3 className="font-medium text-white mb-3 flex items-center">
                <Hash className="h-4 w-4 mr-2" />
                Skills & Tags
              </h3>
              
              {/* Show active tags */}
              {filters.activeTags && filters.activeTags.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm text-gray-400 mb-2">Active Tags:</h4>
                  <div className="flex flex-wrap gap-1">
                    {filters.activeTags.map((tag, index) => (
                      <span
                        key={`${tag.category}-${tag.label}-${index}`}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer bg-blue-900/30 text-blue-300 border border-blue-800/50 hover:bg-blue-900/50 transition-colors"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag.label}
                        <X className="ml-1 h-3 w-3" />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag categories */}
              <div className="space-y-3">
                {Object.entries(TAG_CATEGORIES).map(([categoryKey, categoryInfo]) => {
                  const tags = availableTags[categoryKey as keyof typeof availableTags] || []
                  if (tags.length === 0) return null
                  
                  const isExpanded = expandedTagCategories.has(categoryKey)
                  
                  return (
                    <div key={categoryKey} className="border border-gray-800 rounded-lg bg-gray-900/20">
                      <button
                        onClick={() => toggleTagCategory(categoryKey)}
                        className="w-full px-3 py-2 text-left flex items-center justify-between bg-gray-800/30 hover:bg-gray-800/50 rounded-t-lg transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">{categoryInfo.label}</span>
                        <div className="flex items-center">
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="p-3 max-h-32 overflow-y-auto">
                          <div className="flex flex-wrap gap-1">
                            {tags.slice(0, 20).map((tag, index) => { // Limit to 20 tags per category
                              const isSelected = filters.activeTags?.some(t => t.label === tag.label && t.category === tag.category) || false
                              return (
                                <button
                                  key={`${tag.label}-${index}`}
                                  onClick={() => handleTagToggle(tag)}
                                  className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                                    isSelected 
                                      ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50'
                                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800/70 border border-gray-700/50'
                                  }`}
                                >
                                  {tag.label}
                                </button>
                              )
                            })}
                          </div>
                          {tags.length > 20 && (
                            <p className="text-xs text-gray-400 mt-2">+{tags.length - 20} more...</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Professional Experience Group */}
            <div>
              <h3 className="font-medium text-white mb-3 text-base">Professional Experience</h3>
              <div className="space-y-3">
                <FilterCategoryChips
                  categoryKey="experience-bucket"
                  title="Experience Level"
                  options={experienceBucketOptions}
                  selectedValues={filters.experienceBucket || []}
                  filterKey="experienceBucket"
                  icon={<User className="h-4 w-4" />}
                />
                
                <FilterCategoryChips
                  categoryKey="management-scope"
                  title="Management Scope"
                  options={managementScopeOptions}
                  selectedValues={filters.managementScope || []}
                  filterKey="managementScope"
                  icon={<Briefcase className="h-4 w-4" />}
                />
                
                <FilterCategoryChips
                  categoryKey="domain-expertise"
                  title="Domain Expertise"
                  options={domainExpertiseOptions}
                  selectedValues={filters.domainExpertise || []}
                  filterKey="domainExpertise"
                  icon={<Target className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Company & Product Group */}
            <div>
              <h3 className="font-medium text-white mb-3 text-base">Company & Product</h3>
              <div className="space-y-3">
                <FilterCategoryChips
                  categoryKey="company-stage"
                  title="Company Stage"
                  options={companyStageOptions}
                  selectedValues={filters.companyStage || []}
                  filterKey="companyStage"
                  icon={<Building className="h-4 w-4" />}
                />
                
                <FilterCategoryChips
                  categoryKey="product-lifecycle"
                  title="Product Lifecycle"
                  options={productLifecycleOptions}
                  selectedValues={filters.productLifecycle || []}
                  filterKey="productLifecycle"
                  icon={<Layers className="h-4 w-4" />}
                />
                
                <FilterCategoryChips
                  categoryKey="product-domain"
                  title="Product Domain"
                  options={productDomainOptions}
                  selectedValues={filters.productDomain || []}
                  filterKey="productDomain"
                  icon={<Boxes className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Industry Group */}
            <div>
              <h3 className="font-medium text-white mb-3 text-base">Industry</h3>
              <div className="space-y-3">
                <FilterCategoryChips
                  categoryKey="industry-vertical"
                  title="Industry Vertical"
                  options={industryVerticalOptions}
                  selectedValues={filters.industryVertical || []}
                  filterKey="industryVertical"
                  icon={<Building className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>
          {/* Add bottom padding to ensure content isn't cut off */}
          <div className="pb-6"></div>
        </div>
      </div>
    </>
  )
}
