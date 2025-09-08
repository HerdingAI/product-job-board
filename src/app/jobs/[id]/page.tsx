'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { JobContent } from '@/components/JobContent'
import { JobTags } from '@/components/JobTags'
import { CompanySidebar } from '@/components/CompanySidebar'
import { formatCamelCase, getFormattedLocation } from '@/lib/tag-extraction'
import { formatJobDate } from '@/lib/data-mapper'
import { TagBadge } from '@/components/ui/TagBadge'
import { ArrowLeft, MapPin, Clock, Building, ExternalLink, Calendar, Briefcase } from 'lucide-react'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [jobData, setJobData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJob = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('is_currently_active', true)
        .eq('is_product_job', true)
        .single()

      if (fetchError) {
        console.error('Error fetching job:', fetchError)
        if (fetchError.code === 'PGRST116') {
          setError('Job not found or no longer available.')
        } else {
          setError('Failed to load job details. Please try again.')
        }
        return
      }

      // Store raw job data directly
      setJobData(data)
      
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (params.id) {
      fetchJob(params.id as string)
    }
  }, [params.id, fetchJob])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading job details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/">
              <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Jobs</span>
              </button>
            </Link>
          </div>
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error || 'Job not found.'}</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Browse all jobs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Helper function to format salary
  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link href="/">
            <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm sm:text-base">Back to Jobs</span>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Job Header */}
            <div className="modern-card p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 sm:mb-6">
              <div className="flex-grow mb-4 lg:mb-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">{jobData.title}</h1>
                
                {/* Mobile-optimized info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center lg:space-x-6 gap-2 sm:gap-3 lg:gap-0 text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base lg:text-lg font-medium text-gray-300 truncate">{jobData.company}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">{getFormattedLocation(jobData)}</span>
                  </div>
                  {jobData.work_arrangement && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{formatCamelCase(jobData.work_arrangement)}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{formatJobDate(jobData.posted || jobData.created_at)}</span>
                  </div>
                  {jobData.employment_type && jobData.employment_type.toLowerCase() !== 'null' && jobData.employment_type.toLowerCase() !== 'none' && (
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{formatCamelCase(jobData.employment_type)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end lg:text-right space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-2">
                {(jobData.salary_min || jobData.salary_max) && (
                  <div className="text-emerald-400 font-bold text-lg sm:text-xl lg:text-xl">
                    <span>{formatSalary(jobData.salary_min, jobData.salary_max, jobData.salary_currency)}</span>
                  </div>
                )}
                {jobData.seniority_level && (
                  <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium bg-blue-900/30 text-blue-300 border border-blue-800/50">
                    {formatCamelCase(jobData.seniority_level)} Level
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Job Content Section */}
            <div className="modern-card p-4 sm:p-6 lg:p-8">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Job Description</h2>
                <JobContent rawHtml={jobData.description} />
              </div>

              {/* Enhanced Tags Section */}
              <JobTags jobData={jobData} />
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="modern-card p-4 sm:p-6">
              <CompanySidebar jobData={jobData} />
              
              {/* Apply Button (Sidebar) */}
              {jobData.apply_url && (
                <div className="pt-4 sm:pt-6 border-t border-gray-800 mt-4 sm:mt-6">
                  <a
                    href={jobData.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-modern w-full inline-flex justify-center items-center text-sm sm:text-base py-3 sm:py-2"
                  >
                    Apply Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
