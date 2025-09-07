'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

type JobFormData = {
  title: string
  company_name: string
  description: string
  location: string
  job_type: 'Full-Time' | 'Part-Time' | 'Contract'
}

export default function EditJobPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<JobFormData>()

  const fetchJob = useCallback(async (id: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .single()

    if (error || !data) {
      console.error('Error fetching job:', error)
      router.push('/dashboard')
    } else {
      // Populate form with existing data
      setValue('title', data.title)
      setValue('company_name', data.company_name)
      setValue('description', data.description)
      setValue('location', data.location)
      setValue('job_type', data.job_type)
    }
    setLoading(false)
  }, [user?.id, setValue, router])

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    if (params.id) {
      fetchJob(params.id as string)
    }
  }, [user, params.id, router, fetchJob])

  const onSubmit = async (data: JobFormData) => {
    setSubmitting(true)
    
    const { error } = await supabase
      .from('jobs')
      .update(data)
      .eq('id', params.id as string)
      .eq('user_id', user?.id)

    if (error) {
      console.error('Error updating job:', error)
      alert('Error updating job. Please try again.')
    } else {
      router.push('/dashboard')
    }
    
    setSubmitting(false)
  }

  if (!user || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Job Posting</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              {...register('title', { required: 'Job title is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Senior Software Engineer"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="company_name"
              {...register('company_name', { required: 'Company name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Tech Corp"
            />
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              id="location"
              {...register('location', { required: 'Location is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. San Francisco, CA or Remote"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
              Job Type *
            </label>
            <select
              id="job_type"
              {...register('job_type', { required: 'Job type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select job type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
            </select>
            {errors.job_type && (
              <p className="mt-1 text-sm text-red-600">{errors.job_type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              id="description"
              rows={8}
              {...register('description', { required: 'Job description is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the role, responsibilities, requirements, and benefits..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
