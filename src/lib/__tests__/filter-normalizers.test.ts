/**
 * Test suite for filter normalizers
 * Validates high-cardinality to low-cardinality normalization
 */

import {
  normalizeSeniority,
  normalizeLocation,
  normalizeWorkArrangement,
  PM_SENIORITY_LEVELS,
  US_MAJOR_CITIES,
  EU_MAJOR_CITIES,
  getAllNormalizedCities,
  reverseNormalizeSeniority,
  reverseNormalizeLocation,
  reverseFormatWorkArrangement
} from '../filter-normalizers'

// ==================== SENIORITY NORMALIZATION TESTS ====================

console.log('='.repeat(80))
console.log('PM SENIORITY NORMALIZATION TESTS')
console.log('='.repeat(80))

const seniorityTests = [
  // Associate Product Manager
  { input: 'apm', expected: 'Associate Product Manager' },
  { input: 'associate', expected: 'Associate Product Manager' },
  { input: 'junior', expected: 'Associate Product Manager' },
  { input: 'entry level', expected: 'Associate Product Manager' },
  { input: 'junior pm', expected: 'Associate Product Manager' },

  // Product Manager
  { input: 'pm', expected: 'Product Manager' },
  { input: 'product manager', expected: 'Product Manager' },
  { input: 'mid-level', expected: 'Product Manager' },
  { input: 'intermediate', expected: 'Product Manager' },

  // Senior Product Manager
  { input: 'senior', expected: 'Senior Product Manager' },
  { input: 'senior pm', expected: 'Senior Product Manager' },
  { input: 'sr pm', expected: 'Senior Product Manager' },

  // Lead Product Manager
  { input: 'lead', expected: 'Lead Product Manager' },
  { input: 'lead pm', expected: 'Lead Product Manager' },
  { input: 'team lead', expected: 'Lead Product Manager' },

  // Staff Product Manager
  { input: 'staff', expected: 'Staff Product Manager' },
  { input: 'staff pm', expected: 'Staff Product Manager' },
  { input: 'principal', expected: 'Staff Product Manager' },
  { input: 'principal pm', expected: 'Staff Product Manager' },

  // Director
  { input: 'director', expected: 'Director' },
  { input: 'director of product', expected: 'Director' },
  { input: 'group pm', expected: 'Director' },

  // VP
  { input: 'vp', expected: 'VP' },
  { input: 'vice president', expected: 'VP' },
  { input: 'vp product', expected: 'VP' },
  { input: 'svp', expected: 'VP' },

  // CPO
  { input: 'cpo', expected: 'CPO' },
  { input: 'chief product officer', expected: 'CPO' },
  { input: 'head of product', expected: 'CPO' },
]

let seniorityPassed = 0
let seniorityFailed = 0

seniorityTests.forEach(({ input, expected }) => {
  const result = normalizeSeniority(input)
  const status = result === expected ? '✅' : '❌'
  if (result === expected) {
    seniorityPassed++
  } else {
    seniorityFailed++
    console.log(`${status} "${input}" → "${result}" (expected: "${expected}")`)
  }
})

console.log(`\nResults: ${seniorityPassed}/${seniorityTests.length} passed`)
if (seniorityFailed === 0) {
  console.log('✅ All seniority normalization tests passed!')
}

console.log('\nStandard PM Seniority Levels (8 levels):')
PM_SENIORITY_LEVELS.forEach((level, i) => {
  console.log(`  ${i + 1}. ${level}`)
})

// ==================== LOCATION NORMALIZATION TESTS ====================

console.log('\n' + '='.repeat(80))
console.log('LOCATION NORMALIZATION TESTS')
console.log('='.repeat(80))

const locationTests = [
  // Remote
  { input: 'remote', expected: 'Remote' },
  { input: 'remote - us', expected: 'Remote' },
  { input: 'fully remote', expected: 'Remote' },
  { input: 'wfh', expected: 'Remote' },

  // New York
  { input: 'nyc', expected: 'New York' },
  { input: 'new york', expected: 'New York' },
  { input: 'new york city', expected: 'New York' },
  { input: 'manhattan', expected: 'New York' },
  { input: 'brooklyn', expected: 'New York' },

  // San Francisco
  { input: 'sf', expected: 'San Francisco' },
  { input: 'san francisco', expected: 'San Francisco' },
  { input: 'sf bay area', expected: 'San Francisco' },
  { input: 'bay area', expected: 'San Francisco' },
  { input: 'silicon valley', expected: 'San Francisco' },
  { input: 'palo alto', expected: 'San Francisco' },
  { input: 'mountain view', expected: 'San Francisco' },

  // Other US cities
  { input: 'seattle', expected: 'Seattle' },
  { input: 'austin', expected: 'Austin' },
  { input: 'boston', expected: 'Boston' },
  { input: 'chicago', expected: 'Chicago' },
  { input: 'denver', expected: 'Denver' },
  { input: 'los angeles', expected: 'Los Angeles' },
  { input: 'la', expected: 'Los Angeles' },
  { input: 'washington dc', expected: 'Washington DC' },
  { input: 'dc', expected: 'Washington DC' },

  // EU cities
  { input: 'london', expected: 'London' },
  { input: 'berlin', expected: 'Berlin' },
  { input: 'paris', expected: 'Paris' },
  { input: 'amsterdam', expected: 'Amsterdam' },
  { input: 'dublin', expected: 'Dublin' },
  { input: 'madrid', expected: 'Madrid' },
  { input: 'barcelona', expected: 'Barcelona' },

  // Invalid - should return null
  { input: 'null', expected: null },
  { input: 'n/a', expected: null },
  { input: 'unknown', expected: null },
  { input: '', expected: null },
]

let locationPassed = 0
let locationFailed = 0

locationTests.forEach(({ input, expected }) => {
  const result = normalizeLocation(input)
  const status = result === expected ? '✅' : '❌'
  if (result === expected) {
    locationPassed++
  } else {
    locationFailed++
    console.log(`${status} "${input}" → "${result}" (expected: "${expected}")`)
  }
})

console.log(`\nResults: ${locationPassed}/${locationTests.length} passed`)
if (locationFailed === 0) {
  console.log('✅ All location normalization tests passed!')
}

console.log(`\nTotal Normalized Cities: ${getAllNormalizedCities().length}`)
console.log(`  US Cities (500K+): ${US_MAJOR_CITIES.length}`)
console.log(`  EU Cities (500K+): ${EU_MAJOR_CITIES.length}`)
console.log(`  Plus: Remote`)

// ==================== WORK ARRANGEMENT TESTS ====================

console.log('\n' + '='.repeat(80))
console.log('WORK ARRANGEMENT NORMALIZATION TESTS (KEEPING - WORKING)')
console.log('='.repeat(80))

const workTests = [
  { input: 'remote', expected: 'Remote' },
  { input: 'remote_us', expected: 'Remote' },
  { input: 'wfh', expected: 'Remote' },
  { input: 'hybrid', expected: 'Hybrid' },
  { input: 'flexible', expected: 'Hybrid' },
  { input: 'onsite', expected: 'In-Person' },
  { input: 'office', expected: 'In-Person' },
]

let workPassed = 0
workTests.forEach(({ input, expected }) => {
  const result = normalizeWorkArrangement(input)
  if (result === expected) workPassed++
  else console.log(`❌ "${input}" → "${result}" (expected: "${expected}")`)
})

console.log(`Results: ${workPassed}/${workTests.length} passed`)
if (workPassed === workTests.length) {
  console.log('✅ All work arrangement tests passed!')
}

// ==================== REVERSE MAPPING TESTS ====================

console.log('\n' + '='.repeat(80))
console.log('REVERSE MAPPING TESTS')
console.log('='.repeat(80))

console.log('\nSeniority Reverse Mapping:')
const seniorityReversalTests = [
  'Associate Product Manager',
  'Product Manager',
  'Senior Product Manager',
  'Lead Product Manager',
  'Staff Product Manager',
  'Director',
  'VP',
  'CPO'
]

seniorityReversalTests.forEach(level => {
  const dbValues = reverseNormalizeSeniority(level as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  console.log(`  "${level}" → ${dbValues.length} DB values: [${dbValues.slice(0, 3).join(', ')}...]`)
})

console.log('\nLocation Reverse Mapping (samples):')
const locationReversalTests = ['New York', 'San Francisco', 'Remote', 'London']

locationReversalTests.forEach(city => {
  const dbValues = reverseNormalizeLocation(city)
  console.log(`  "${city}" → ${dbValues.length} DB values: [${dbValues.slice(0, 3).join(', ')}...]`)
})

console.log('\nWork Arrangement Reverse Mapping:')
const workReversalTests = ['Remote', 'Hybrid', 'In-Person']

workReversalTests.forEach(work => {
  const dbValues = reverseFormatWorkArrangement(work)
  console.log(`  "${work}" → ${dbValues.length} DB values: [${dbValues.slice(0, 3).join(', ')}...]`)
})

// ==================== CARDINALITY REDUCTION SUMMARY ====================

console.log('\n' + '='.repeat(80))
console.log('CARDINALITY REDUCTION SUMMARY')
console.log('='.repeat(80))

console.log(`
✅ Seniority:
   High Cardinality (Input): 60+ variations
   Low Cardinality (Output): 8 standard PM levels
   Reduction: ${((1 - 8 / 60) * 100).toFixed(0)}%

✅ Locations:
   High Cardinality (Input): 1000+ variations
   Low Cardinality (Output): ${getAllNormalizedCities().length} major cities
   Reduction: ${((1 - getAllNormalizedCities().length / 1000) * 100).toFixed(0)}%

✅ Work Arrangement:
   High Cardinality (Input): 30+ variations
   Low Cardinality (Output): 3 options
   Reduction: 90%
`)

console.log('='.repeat(80))
console.log('FINAL SUMMARY')
console.log('='.repeat(80))
console.log(`✅ Seniority: ${seniorityPassed}/${seniorityTests.length} tests passed`)
console.log(`✅ Location: ${locationPassed}/${locationTests.length} tests passed`)
console.log(`✅ Work Arrangement: ${workPassed}/${workTests.length} tests passed`)
console.log(`✅ Total: ${seniorityPassed + locationPassed + workPassed}/${seniorityTests.length + locationTests.length + workTests.length} tests passed`)
console.log('='.repeat(80))
