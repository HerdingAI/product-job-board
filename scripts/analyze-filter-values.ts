/**
 * Script to analyze actual filter values in the database
 * This helps us create comprehensive mappings for formatters
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeFilterValues() {
  console.log('🔍 Analyzing filter values from database...\n')

  try {
    // Fetch a sample of active product jobs
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('seniority_level, location_metro, work_arrangement, location_city, location_state, location_country')
      .eq('is_currently_active', true)
      .eq('is_product_job', true)
      .limit(1000)

    if (error) {
      console.error('❌ Error fetching jobs:', error)
      return
    }

    console.log(`✅ Fetched ${jobs?.length} jobs for analysis\n`)

    // Analyze Seniority Levels
    console.log('=' .repeat(80))
    console.log('SENIORITY LEVELS')
    console.log('=' .repeat(80))
    const seniorityMap = new Map<string, number>()
    jobs?.forEach(job => {
      if (job.seniority_level) {
        const count = seniorityMap.get(job.seniority_level) || 0
        seniorityMap.set(job.seniority_level, count + 1)
      }
    })
    const sortedSeniority = Array.from(seniorityMap.entries())
      .sort((a, b) => b[1] - a[1])
    sortedSeniority.forEach(([value, count]) => {
      console.log(`  "${value}" → ${count} jobs`)
    })
    console.log(`\nTotal unique seniority values: ${seniorityMap.size}\n`)

    // Analyze Location Metro
    console.log('=' .repeat(80))
    console.log('LOCATION METRO (Top 30)')
    console.log('=' .repeat(80))
    const locationMap = new Map<string, number>()
    jobs?.forEach(job => {
      if (job.location_metro) {
        const count = locationMap.get(job.location_metro) || 0
        locationMap.set(job.location_metro, count + 1)
      }
    })
    const sortedLocations = Array.from(locationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
    sortedLocations.forEach(([value, count]) => {
      console.log(`  "${value}" → ${count} jobs`)
    })
    console.log(`\nTotal unique location values: ${locationMap.size}\n`)

    // Analyze Work Arrangement
    console.log('=' .repeat(80))
    console.log('WORK ARRANGEMENT')
    console.log('=' .repeat(80))
    const workMap = new Map<string, number>()
    jobs?.forEach(job => {
      if (job.work_arrangement) {
        const count = workMap.get(job.work_arrangement) || 0
        workMap.set(job.work_arrangement, count + 1)
      }
    })
    const sortedWork = Array.from(workMap.entries())
      .sort((a, b) => b[1] - a[1])
    sortedWork.forEach(([value, count]) => {
      console.log(`  "${value}" → ${count} jobs`)
    })
    console.log(`\nTotal unique work arrangement values: ${workMap.size}\n`)

    // Additional location analysis
    console.log('=' .repeat(80))
    console.log('LOCATION DETAILS (City/State/Country breakdown)')
    console.log('=' .repeat(80))
    const cityMap = new Map<string, number>()
    const stateMap = new Map<string, number>()
    const countryMap = new Map<string, number>()

    jobs?.forEach(job => {
      if (job.location_city) {
        const count = cityMap.get(job.location_city) || 0
        cityMap.set(job.location_city, count + 1)
      }
      if (job.location_state) {
        const count = stateMap.get(job.location_state) || 0
        stateMap.set(job.location_state, count + 1)
      }
      if (job.location_country) {
        const count = countryMap.get(job.location_country) || 0
        countryMap.set(job.location_country, count + 1)
      }
    })

    console.log('\nTop 15 Cities:')
    Array.from(cityMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([value, count]) => {
        console.log(`  "${value}" → ${count} jobs`)
      })

    console.log('\nTop 10 States:')
    Array.from(stateMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([value, count]) => {
        console.log(`  "${value}" → ${count} jobs`)
      })

    console.log('\nCountries:')
    Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([value, count]) => {
        console.log(`  "${value}" → ${count} jobs`)
      })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

analyzeFilterValues()
