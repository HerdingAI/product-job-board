'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Job } from '@/lib/supabase'
import { mockJobs, isSupabaseConfigured } from '@/lib/mockData'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, MapPin, Clock, Building, Briefcase } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchJob(params.id as string)
    }
  }, [params.id])

  const fetchJob = async (id: string) => {
    setLoading(true)
    
    if (!isSupabaseConfigured()) {
      // Use mock data if Supabase is not configured
      setUsingMockData(true)
      const mockJob = mockJobs.find(job => job.id === id)
      if (mockJob) {
        setJob(mockJob)
      } else {
        router.push('/')
      }
      setLoading(false)
      return
    }

    // Use Supabase if configured
    setUsingMockData(false)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching job:', error)
      router.push('/')
    } else {
      setJob(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Job not found.</p>
          <Link href="/">
            <Button className="mt-4">Back to Jobs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </Button>
          </Link>
        </div>

        {/* Demo Banner */}
        {usingMockData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> This is sample data. Configure Supabase credentials to use real data.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Job Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start space-x-4">
                {/* Company Logo */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">
                    {job.company_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Job Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <p className="text-lg text-gray-800 font-medium mb-2">{job.company_name}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                    </div>
                    <span>•</span>
                    <span>74 people clicked apply</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {job.job_type}
                    </span>
                    <span className="text-sm text-gray-600">Promoted by hirer • Responses managed off LinkedIn</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      Apply
                    </Button>
                    <Button variant="outline" size="lg">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* How your profile fits card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">How your profile and resume fit this job</h2>
              <p className="text-sm text-gray-600 mb-4">
                Get AI-powered advice on this job and more exclusive features with Premium. 
                <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">Reactivate Premium</Link>
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <span className="text-orange-500 mr-2">✦</span>
                  <span className="text-gray-700">Tailor my resume to this job</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-orange-500 mr-2">✦</span>
                  <span className="text-gray-700">Am I a good fit for this job?</span>
                </div>
              </div>
            </div>

            {/* About the job */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About the job</h2>
              
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-2">Company Introduction:</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  We exist to wow our customers. We know we're doing the right thing when we hear our customers say, "How did I ever live without {job.company_name}?" Born out of an obsession to make shopping, eating, and living easier than ever, we're collectively disrupting the multi-billion-dollar commerce industry. We are one of the fastest-growing retail companies that established an unparalleled reputation for being a leading and reliable force in the commerce industry.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We are proud to have the best of both worlds — a startup culture with the resources of a
                </p>
              </div>
              
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">Job Description:</h3>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                    {job.description}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meet the hiring team</h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <p className="text-sm text-gray-600">Information not available in demo mode</p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-base font-medium text-gray-900 mb-3">Job details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Job ID:</span>
                    <p className="text-gray-900 font-mono text-xs">{job.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Posted:</span>
                    <p className="text-gray-900">{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Company:</span>
                    <p className="text-gray-900">{job.company_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="text-gray-900">{job.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Employment type:</span>
                    <p className="text-gray-900">{job.job_type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
