'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, type Job } from '@/lib/supabase'
import { mockJobs, isSupabaseConfigured } from '@/lib/mockData'
import { Button } from '@/components/ui/Button'
import { Search, MapPin, Clock, Building } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [locationFilter, setLocationFilter] = useState('')
  const [jobTypeFilter, setJobTypeFilter] = useState('')
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [locationFilter, jobTypeFilter])

  const fetchJobs = async () => {
    setLoading(true)
    
    if (!isSupabaseConfigured()) {
      // Use mock data if Supabase is not configured
      setUsingMockData(true)
      let filteredJobs = mockJobs
      
      if (locationFilter) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(locationFilter.toLowerCase())
        )
      }
      
      if (jobTypeFilter) {
        filteredJobs = filteredJobs.filter(job => job.job_type === jobTypeFilter)
      }
      
      setJobs(filteredJobs)
      setLoading(false)
      return
    }

    // Use Supabase if configured
    setUsingMockData(false)
    let query = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (locationFilter) {
      query = query.ilike('location', `%${locationFilter}%`)
    }

    if (jobTypeFilter) {
      query = query.eq('job_type', jobTypeFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
    } else {
      setJobs(data || [])
    }
    setLoading(false)
  }

  const handleLocationFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(e.target.value)
  }

  const handleJobTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setJobTypeFilter(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  <strong>Demo Mode:</strong> This is showing sample data. To use real data, configure your Supabase credentials in the .env.local file.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Jobs</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter location..."
                      value={locationFilter}
                      onChange={handleLocationFilter}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={jobTypeFilter}
                    onChange={handleJobTypeFilter}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Job Types</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Top job picks for you
              </h1>
              <p className="text-gray-600">
                Based on your profile, preferences, and activity like applies, searches, and saves
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {jobs.length} result{jobs.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Jobs List */}
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-600">No jobs found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <Link href={`/jobs/${job.id}`} className="block p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Company Logo Placeholder */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-lg">
                              {job.company_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Job Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 mb-1">
                              {job.title}
                            </h3>
                            
                            <p className="text-gray-900 font-medium mb-2">
                              {job.company_name}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {job.job_type}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 text-sm line-clamp-2">
                              {job.description}
                            </p>
                            
                            <div className="mt-3 flex items-center text-sm text-gray-500">
                              <span>Promoted by hirer • Responses managed off LinkedIn</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
