'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { mapSupabaseJobToAppJob, formatJobDate, formatSalaryRange } from '@/lib/data-mapper'
import { AppJob } from '@/lib/types'
import { ArrowLeft, MapPin, Clock, Building, DollarSign, ExternalLink, Calendar } from 'lucide-react'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<AppJob | null>(null)
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

      // Transform the data using our mapper
      const transformedJob = mapSupabaseJobToAppJob(data)
      setJob(transformedJob)
      
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

  if (error || !job) {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex items-center space-x-6 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    <span className="text-lg font-medium">{job.company.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>
                      {job.location.metro || job.location.city || 
                       (job.location.isRemote ? 'Remote' : 'Location TBD')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{formatJobDate(job.postedDate || job.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {formatSalaryRange(job.compensation) && (
                  <div className="flex items-center text-green-600 font-bold text-xl mb-2">
                    <DollarSign className="h-6 w-6 mr-1" />
                    <span>{formatSalaryRange(job.compensation)}</span>
                  </div>
                )}
                {job.experience.seniorityLevel && (
                  <div className="text-gray-500">
                    {job.experience.seniorityLevel} Level
                  </div>
                )}
              </div>
            </div>

            {/* Apply Button */}
            {job.applyUrl && (
              <div className="mb-6">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply for this position
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            )}

            {/* Work Arrangement Tags */}
            <div className="flex flex-wrap gap-2">
              {job.employmentType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {job.employmentType}
                </span>
              )}
              {job.location.isRemote && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Remote
                </span>
              )}
              {job.location.isHybrid && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Hybrid
                </span>
              )}
              {job.aiMlFocus.isAiMl && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  AI/ML
                </span>
              )}
            </div>
          </div>

          {/* Job Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                </div>

                {/* Skills & Tags */}
                {job.tags.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills & Expertise</h2>
                    <div className="flex flex-wrap gap-3">
                      {job.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                            ${tag.category === 'core-pm' ? 'bg-blue-100 text-blue-800' :
                              tag.category === 'technical' ? 'bg-green-100 text-green-800' :
                              tag.category === 'domain' ? 'bg-purple-100 text-purple-800' :
                              tag.category === 'leadership' ? 'bg-orange-100 text-orange-800' :
                              tag.category === 'methodology' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'}`}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  {/* Company Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Company</h3>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">{job.company.name}</p>
                      {job.company.stage && (
                        <p className="text-sm text-gray-600">Stage: {job.company.stage}</p>
                      )}
                      {job.company.industry && (
                        <p className="text-sm text-gray-600">Industry: {job.company.industry}</p>
                      )}
                    </div>
                  </div>

                  {/* Location Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Location</h3>
                    <div className="space-y-2">
                      {job.location.city && job.location.state && (
                        <p className="text-sm text-gray-900">{job.location.city}, {job.location.state}</p>
                      )}
                      {job.location.metro && (
                        <p className="text-sm text-gray-600">Metro: {job.location.metro}</p>
                      )}
                      <div className="space-y-1">
                        {job.location.isRemote && (
                          <span className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Remote OK</span>
                        )}
                        {job.location.isHybrid && (
                          <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-1">Hybrid</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Experience Level */}
                  {job.experience.seniorityLevel && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Experience</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900">{job.experience.seniorityLevel} Level</p>
                        {(job.experience.yearsMin || job.experience.yearsMax || job.experience.yearsRequired) && (
                          <p className="text-sm text-gray-600">
                            {job.experience.yearsRequired ? `${job.experience.yearsRequired}+ years` :
                             job.experience.yearsMin && job.experience.yearsMax ? 
                             `${job.experience.yearsMin}-${job.experience.yearsMax} years` :
                             job.experience.yearsMin ? `${job.experience.yearsMin}+ years` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Product Context */}
                  {(job.productContext.lifecycleStage || job.productContext.domain) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Product Context</h3>
                      <div className="space-y-2">
                        {job.productContext.lifecycleStage && (
                          <p className="text-sm text-gray-900">Stage: {job.productContext.lifecycleStage}</p>
                        )}
                        {job.productContext.domain && (
                          <p className="text-sm text-gray-600">Domain: {job.productContext.domain}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Apply Button (Sidebar) */}
                  {job.applyUrl && (
                    <div className="pt-4 border-t border-gray-200">
                      <a
                        href={job.applyUrl}
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
