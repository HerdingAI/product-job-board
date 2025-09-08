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
import { ArrowLeft, MapPin, Clock, Building, DollarSign, ExternalLink, Calendar, Briefcase } from 'lucide-react'

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/">
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Jobs</span>
              </button>
            </Link>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Job not found.'}</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Job Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-grow">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{jobData.title}</h1>
                <div className="flex items-center space-x-6 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    <span className="text-lg font-medium">{jobData.company}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{getFormattedLocation(jobData)}</span>
                  </div>
                  {jobData.work_arrangement && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{formatCamelCase(jobData.work_arrangement)}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{formatJobDate(jobData.posted || jobData.created_at)}</span>
                  </div>
                  {jobData.employment_type && jobData.employment_type.toLowerCase() !== 'null' && jobData.employment_type.toLowerCase() !== 'none' && (
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      <span>{formatCamelCase(jobData.employment_type)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                {(jobData.salary_min || jobData.salary_max) && (
                  <div className="flex items-center text-green-600 font-bold text-xl mb-2">
                    <DollarSign className="h-6 w-6 mr-1" />
                    <span>{formatSalary(jobData.salary_min, jobData.salary_max, jobData.salary_currency)}</span>
                  </div>
                )}
                {jobData.seniority_level && (
                  <div className="text-gray-500">
                    {formatCamelCase(jobData.seniority_level)} Level
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                  <JobContent rawHtml={jobData.description} />
                </div>

                {/* Enhanced Tags Section */}
                <JobTags jobData={jobData} />
              </div>

              {/* Enhanced Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <CompanySidebar jobData={jobData} />
                  
                  {/* Apply Button (Sidebar) */}
                  {jobData.apply_url && (
                    <div className="pt-4 border-t border-gray-200 mt-6">
                      <a
                        href={jobData.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      </div>
    </div>
  )
}
