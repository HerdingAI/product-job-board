import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('jobs')
      .select('id, title, company')
      .eq('is_currently_active', true)
      .eq('is_product_job', true)
      .limit(3)

    if (testError) {
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: testError.message 
      }, { status: 500 })
    }

    // Test if RPC function exists
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('search_jobs', {
        search_term: 'test',
        filters: {},
        page_limit: 1,
        page_offset: 0
      })

    return NextResponse.json({
      success: true,
      basicQuery: {
        success: true,
        count: testData?.length || 0,
        sample: testData?.slice(0, 2)
      },
      rpcTest: {
        success: !rpcError,
        error: rpcError?.message || null,
        count: rpcData?.length || 0
      }
    })

  } catch (e: unknown) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: e instanceof Error ? e.message : 'Unknown error' 
    }, { status: 500 })
  }
}
