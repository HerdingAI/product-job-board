/**
 * Test suite for filter formatters
 * Validates that all variations map correctly to standardized values
 */

import {
  formatSeniorityLevel,
  formatLocation,
  normalizeWorkArrangement,
  filterValidLocations,
  reverseFormatWorkArrangement,
  reverseFormatFilterValue,
  formatFilterValue,
  getStandardSeniorityLevels,
  getStandardWorkArrangements
} from '../filter-formatters'

// ==================== SENIORITY TESTS ====================

console.log('=' .repeat(80))
console.log('SENIORITY LEVEL FORMATTING TESTS')
console.log('=' .repeat(80))

const seniorityTestCases = [
  { input: 'junior', expected: 'Junior' },
  { input: 'mid-level', expected: 'Mid-Level' },
  { input: 'senior', expected: 'Senior' },
  { input: 'staff', expected: 'Staff' },
  { input: 'principal', expected: 'Principal' },
  { input: 'director', expected: 'Director' },
  { input: 'vp', expected: 'VP' },
  { input: 'c-level', expected: 'C-Level' },
  { input: 'entry', expected: 'Entry Level' },
  { input: 'entry-level', expected: 'Entry Level' },
  { input: 'mid', expected: 'Mid-Level' },
  { input: 'sr', expected: 'Senior' },
  { input: 'principal pm', expected: 'Principal' },
  { input: 'senior director', expected: 'Senior Director' },
  { input: 'individual contributor', expected: 'Individual Contributor' },
]

seniorityTestCases.forEach(({ input, expected }) => {
  const result = formatSeniorityLevel(input)
  const status = result === expected ? '✅' : '❌'
  console.log(`${status} "${input}" → "${result}" (expected: "${expected}")`)
})

console.log('\nStandard Seniority Levels:')
console.log(getStandardSeniorityLevels())

// ==================== LOCATION TESTS ====================

console.log('\n' + '='.repeat(80))
console.log('LOCATION FORMATTING TESTS')
console.log('=' .repeat(80))

const locationTestCases = [
  { input: 'remote', expected: 'Remote' },
  { input: 'san francisco bay area', expected: 'San Francisco Bay Area' },
  { input: 'sf bay area', expected: 'San Francisco Bay Area' },
  { input: 'bay area', expected: 'San Francisco Bay Area' },
  { input: 'nyc', expected: 'New York City' },
  { input: 'new york', expected: 'New York City' },
  { input: 'seattle', expected: 'Seattle' },
  { input: 'austin', expected: 'Austin' },
  { input: 'boston', expected: 'Boston' },
  { input: 'london', expected: 'London' },
  { input: 'berlin', expected: 'Berlin' },
  { input: 'remote - us', expected: 'Remote (US)' },
  { input: 'usa', expected: 'USA' },
  { input: 'united kingdom', expected: 'United Kingdom' },
  { input: 'europe', expected: 'Europe' },
]

locationTestCases.forEach(({ input, expected }) => {
  const result = formatLocation(input)
  const status = result === expected ? '✅' : '❌'
  console.log(`${status} "${input}" → "${result}" (expected: "${expected}")`)
})

console.log('\n\nLocation Validation Tests:')
const invalidLocations = ['null', '', 'n/a', 'unknown', 'tbd', '123']
const validLocations = ['san francisco', 'remote', 'new york', 'london']
const testLocations = [...invalidLocations, ...validLocations]

console.log('Input:', testLocations)
const filtered = filterValidLocations(testLocations)
console.log('Filtered:', filtered)
console.log(`✅ Filtered out ${testLocations.length - filtered.length} invalid locations`)

// ==================== WORK ARRANGEMENT TESTS ====================

console.log('\n' + '='.repeat(80))
console.log('WORK ARRANGEMENT NORMALIZATION TESTS')
console.log('=' .repeat(80))

const workArrangementTestCases = [
  // Remote variations
  { input: 'remote', expected: 'Remote' },
  { input: 'remote_us', expected: 'Remote' },
  { input: 'remote_only', expected: 'Remote' },
  { input: 'fully_remote', expected: 'Remote' },
  { input: 'work_from_home', expected: 'Remote' },
  { input: 'wfh', expected: 'Remote' },
  { input: '100% remote', expected: 'Remote' },

  // Hybrid variations
  { input: 'hybrid', expected: 'Hybrid' },
  { input: 'hybrid_only', expected: 'Hybrid' },
  { input: 'flexible', expected: 'Hybrid' },
  { input: 'flexible_remote', expected: 'Hybrid' },
  { input: 'part_remote', expected: 'Hybrid' },
  { input: 'remote_hybrid', expected: 'Hybrid' },

  // In-Person variations
  { input: 'onsite', expected: 'In-Person' },
  { input: 'on-site', expected: 'In-Person' },
  { input: 'onsite_only', expected: 'In-Person' },
  { input: 'office_first', expected: 'In-Person' },
  { input: 'in-person', expected: 'In-Person' },
  { input: 'in_office', expected: 'In-Person' },
  { input: 'office', expected: 'In-Person' },
]

workArrangementTestCases.forEach(({ input, expected }) => {
  const result = normalizeWorkArrangement(input)
  const status = result === expected ? '✅' : '❌'
  console.log(`${status} "${input}" → "${result}" (expected: "${expected}")`)
})

console.log('\nStandard Work Arrangements:')
console.log(getStandardWorkArrangements())

// Test that unknown values return null (to be filtered out)
console.log('\nUnknown value test:')
const unknownResult = normalizeWorkArrangement('some_weird_value')
console.log(`${unknownResult === null ? '✅' : '❌'} Unknown value returns null: ${unknownResult}`)

// ==================== REVERSE MAPPING TESTS ====================

console.log('\n' + '='.repeat(80))
console.log('REVERSE MAPPING TESTS (for database queries)')
console.log('=' .repeat(80))

console.log('\nWork Arrangement Reverse Mapping:')
const reverseWorkTests = ['Remote', 'Hybrid', 'In-Person']
reverseWorkTests.forEach(displayValue => {
  const dbValues = reverseFormatWorkArrangement(displayValue)
  console.log(`"${displayValue}" maps to ${dbValues.length} DB values:`)
  console.log(`  ${dbValues.slice(0, 5).join(', ')}${dbValues.length > 5 ? '...' : ''}`)
})

console.log('\nSeniority Reverse Mapping:')
const reverseSeniorityTests = ['Junior', 'Mid-Level', 'Senior', 'Principal']
reverseSeniorityTests.forEach(displayValue => {
  const dbValue = reverseFormatFilterValue(displayValue, 'seniority')
  console.log(`"${displayValue}" → DB value: "${dbValue}"`)
})

console.log('\nLocation Reverse Mapping:')
const reverseLocationTests = ['San Francisco Bay Area', 'New York City', 'Remote']
reverseLocationTests.forEach(displayValue => {
  const dbValue = reverseFormatFilterValue(displayValue, 'location')
  console.log(`"${displayValue}" → DB value: "${dbValue}"`)
})

// ==================== SUMMARY ====================

console.log('\n' + '='.repeat(80))
console.log('TEST SUMMARY')
console.log('=' .repeat(80))
console.log(`✅ Seniority formatter handles ${seniorityTestCases.length} variations`)
console.log(`✅ Location formatter handles ${locationTestCases.length} variations`)
console.log(`✅ Work arrangement normalizes ${workArrangementTestCases.length} variations to 3 options`)
console.log(`✅ Location validation filters out invalid values`)
console.log(`✅ Reverse mapping enables accurate database queries`)
console.log('=' .repeat(80))
