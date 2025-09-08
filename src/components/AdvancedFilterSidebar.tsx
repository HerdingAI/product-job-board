import React, { useState } from 'react'
import { FilterState, Tag } from '@/lib/types'
import { ChevronDown, ChevronUp, X, Sliders, Hash } from 'lucide-react'
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

  const handleMultiSelectChange = (key: keyof FilterState, value: string, currentValues: string[] = []) => {
    const updated = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    onFilterChange({ [key]: updated })
  }

  const handleSalaryChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) * 1000 : undefined // Convert K to actual value
    onFilterChange({ [`salary${type.charAt(0).toUpperCase() + type.slice(1)}`]: numValue })
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

          <div className="space-y-6">
            {/* Salary Range */}
            <div>
              <h3 className="font-medium text-white mb-3">Salary Range (USD)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Min (K)</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={filters.salaryMin ? Math.floor(filters.salaryMin / 1000) : ''}
                    onChange={(e) => handleSalaryChange('min', e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max (K)</label>
                  <input
                    type="number"
                    placeholder="200"
                    value={filters.salaryMax ? Math.floor(filters.salaryMax / 1000) : ''}
                    onChange={(e) => handleSalaryChange('max', e.target.value)}
                    className="input-modern w-full"
                  />
                </div>
              </div>
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
                          <span className="text-xs text-gray-400 mr-2">({tags.length})</span>
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

            {/* Industry Vertical */}
            <div>
              <h3 className="font-medium text-white mb-3">Industry Vertical</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {industryVerticalOptions.map((vertical) => (
                  <label key={vertical} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.industryVertical?.includes(vertical) || false}
                      onChange={() => handleMultiSelectChange('industryVertical', vertical, filters.industryVertical)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{vertical}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Bucket */}
            <div>
              <h3 className="font-medium text-white mb-3">Experience Bucket</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {experienceBucketOptions.map((bucket) => (
                  <label key={bucket} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.experienceBucket?.includes(bucket) || false}
                      onChange={() => handleMultiSelectChange('experienceBucket', bucket, filters.experienceBucket)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{bucket}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Domain Expertise */}
            <div>
              <h3 className="font-medium text-white mb-3">Domain Expertise</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {domainExpertiseOptions.map((domain) => (
                  <label key={domain} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.domainExpertise?.includes(domain) || false}
                      onChange={() => handleMultiSelectChange('domainExpertise', domain, filters.domainExpertise)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{domain}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Company Stage */}
            <div>
              <h3 className="font-medium text-white mb-3">Company Stage</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {companyStageOptions.map((stage) => (
                  <label key={stage} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.companyStage?.includes(stage) || false}
                      onChange={() => handleMultiSelectChange('companyStage', stage, filters.companyStage)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Product Lifecycle */}
            <div>
              <h3 className="font-medium text-white mb-3">Product Lifecycle</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {productLifecycleOptions.map((lifecycle) => (
                  <label key={lifecycle} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.productLifecycle?.includes(lifecycle) || false}
                      onChange={() => handleMultiSelectChange('productLifecycle', lifecycle, filters.productLifecycle)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{lifecycle}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Product Domain */}
            <div>
              <h3 className="font-medium text-white mb-3">Product Domain</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {productDomainOptions.map((domain) => (
                  <label key={domain} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.productDomain?.includes(domain) || false}
                      onChange={() => handleMultiSelectChange('productDomain', domain, filters.productDomain)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{domain}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Management Scope */}
            <div>
              <h3 className="font-medium text-white mb-3">Management Scope</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {managementScopeOptions.map((scope) => (
                  <label key={scope} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.managementScope?.includes(scope) || false}
                      onChange={() => handleMultiSelectChange('managementScope', scope, filters.managementScope)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors">{scope}</span>
                  </label>
                ))}
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
