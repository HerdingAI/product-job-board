import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const searchTerm = searchParams.get('q') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const offset = (page - 1) * limit

    console.log('Search API called with params:', Object.fromEntries(searchParams.entries()))

    const filters: Record<string, unknown> = {}
    const single = ['seniority', 'location', 'workArrangement', 'salaryMin', 'salaryMax']
    const multi = ['companyStage', 'productLifecycle', 'productDomain', 'managementScope', 'industryVertical', 'experienceBucket', 'domainExpertise']

    for (const key of single) {
      const v = searchParams.get(key)
      if (v) filters[key] = key.includes('salary') ? parseInt(v) : v
    }
    for (const key of multi) {
      const v = searchParams.get(key)
      if (v) {
        console.log(`Processing filter ${key}:`, v)
        // Handle URL-decoded comma-separated values
        // Replace + with spaces and properly split on commas
        const cleanValue = decodeURIComponent(v).replace(/\+/g, ' ')
        console.log(`Cleaned value for ${key}:`, cleanValue)
        filters[key] = cleanValue.split(',').map(item => item.trim()).filter(Boolean)
        console.log(`Final array for ${key}:`, filters[key])
      }
    }

    console.log('Final filters object:', JSON.stringify(filters, null, 2))

    const { data, error } = await supabase.rpc('search_jobs', {
      search_term: searchTerm,
      filters,
      page_limit: limit,
      page_offset: offset,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      jobs: data ?? [],
      pagination: {
        page,
        limit,
        offset,
        hasNextPage: (data?.length || 0) === limit,
      },
      searchTerm,
      filters,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Search failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
