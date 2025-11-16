/**
 * Filter Value Formatting Utilities
 * Formats raw database values for user-friendly display and handles reverse mapping for queries
 */

import { formatCamelCase } from './text-formatter'

// ==================== SENIORITY LEVEL FORMATTING ====================

/**
 * Comprehensive seniority level mapping
 * Maps all possible variations to standardized display values
 */
const SENIORITY_MAP: Record<string, string> = {
  // Entry level variations
  'entry': 'Entry Level',
  'entry-level': 'Entry Level',
  'entry level': 'Entry Level',
  'junior': 'Junior',
  'jr': 'Junior',
  'associate': 'Associate',
  'early_career': 'Entry Level',

  // Mid level variations
  'mid': 'Mid-Level',
  'mid-level': 'Mid-Level',
  'mid level': 'Mid-Level',
  'intermediate': 'Mid-Level',

  // Senior variations
  'senior': 'Senior',
  'sr': 'Senior',
  'senior level': 'Senior',
  'senior-level': 'Senior',

  // Staff/Principal variations
  'staff': 'Staff',
  'principal': 'Principal',
  'lead': 'Lead',
  'senior staff': 'Senior Staff',
  'staff engineer': 'Staff',
  'principal pm': 'Principal',

  // Management variations
  'manager': 'Manager',
  'senior manager': 'Senior Manager',
  'director': 'Director',
  'senior director': 'Senior Director',
  'vp': 'VP',
  'vice president': 'VP',
  'svp': 'Senior VP',
  'senior vp': 'Senior VP',
  'evp': 'Executive VP',
  'executive vp': 'Executive VP',

  // C-level variations
  'c-level': 'C-Level',
  'c level': 'C-Level',
  'executive': 'Executive',
  'cpo': 'C-Level',
  'cto': 'C-Level',
  'ceo': 'C-Level',

  // IC variations
  'ic': 'Individual Contributor',
  'individual contributor': 'Individual Contributor',
  'individual_contributor': 'Individual Contributor',
}

/**
 * Format seniority level to Title Case with comprehensive mapping
 */
export function formatSeniorityLevel(value: string): string {
  if (!value) return ''

  const lowerValue = value.toLowerCase().trim()
  return SENIORITY_MAP[lowerValue] || formatCamelCase(value)
}

/**
 * Get all unique standardized seniority levels in display order
 */
export function getStandardSeniorityLevels(): string[] {
  return [
    'Entry Level',
    'Junior',
    'Associate',
    'Mid-Level',
    'Senior',
    'Staff',
    'Lead',
    'Principal',
    'Senior Staff',
    'Manager',
    'Senior Manager',
    'Director',
    'Senior Director',
    'VP',
    'Senior VP',
    'Executive VP',
    'C-Level',
    'Individual Contributor'
  ]
}

// ==================== LOCATION FORMATTING ====================

/**
 * Invalid location markers to filter out
 */
const INVALID_LOCATIONS = [
  'null', 'none', 'n/a', 'unknown', 'tbd', 'to be determined',
  'various', 'multiple', 'flexible', 'anywhere', 'worldwide',
  '', 'not specified', 'unspecified', 'na', 'n.a.'
]

/**
 * Comprehensive location mapping for USA and EU cities/metros
 */
const LOCATION_MAP: Record<string, string> = {
  // Remote
  'remote': 'Remote',
  'remote - us': 'Remote (US)',
  'remote - usa': 'Remote (US)',
  'remote - united states': 'Remote (US)',
  'remote (us)': 'Remote (US)',
  'remote (usa)': 'Remote (US)',
  'remote - eu': 'Remote (EU)',
  'remote - europe': 'Remote (EU)',
  'remote (eu)': 'Remote (EU)',
  'remote - global': 'Remote (Global)',
  'remote (global)': 'Remote (Global)',
  'fully remote': 'Remote',
  'work from home': 'Remote',
  'wfh': 'Remote',

  // USA - Major Tech Hubs
  'sf': 'San Francisco',
  'san francisco': 'San Francisco',
  'sf bay area': 'San Francisco Bay Area',
  'san francisco bay area': 'San Francisco Bay Area',
  'bay area': 'San Francisco Bay Area',
  'silicon valley': 'San Francisco Bay Area',

  'nyc': 'New York City',
  'new york': 'New York City',  // Priority: map to city not state
  'new york city': 'New York City',
  'new york, ny': 'New York City',
  'manhattan': 'New York City',
  'brooklyn': 'New York City',

  'seattle': 'Seattle',
  'seattle, wa': 'Seattle',

  'austin': 'Austin',
  'austin, tx': 'Austin',

  'boston': 'Boston',
  'boston, ma': 'Boston',

  'los angeles': 'Los Angeles',
  'la': 'Los Angeles',
  'los angeles, ca': 'Los Angeles',

  // USA - Other Major Cities
  'chicago': 'Chicago',
  'chicago, il': 'Chicago',

  'denver': 'Denver',
  'denver, co': 'Denver',

  'portland': 'Portland',
  'portland, or': 'Portland',

  'washington dc': 'Washington DC',
  'washington, dc': 'Washington DC',
  'dc': 'Washington DC',

  'atlanta': 'Atlanta',
  'atlanta, ga': 'Atlanta',

  'miami': 'Miami',
  'miami, fl': 'Miami',

  'dallas': 'Dallas',
  'dallas, tx': 'Dallas',

  'houston': 'Houston',
  'houston, tx': 'Houston',

  'philadelphia': 'Philadelphia',
  'philadelphia, pa': 'Philadelphia',

  'phoenix': 'Phoenix',
  'phoenix, az': 'Phoenix',

  'san diego': 'San Diego',
  'san diego, ca': 'San Diego',

  'raleigh': 'Raleigh',
  'raleigh, nc': 'Raleigh',
  'research triangle': 'Raleigh-Durham',

  'nashville': 'Nashville',
  'nashville, tn': 'Nashville',

  'salt lake city': 'Salt Lake City',
  'slc': 'Salt Lake City',

  'minneapolis': 'Minneapolis',
  'minneapolis, mn': 'Minneapolis',

  // USA - States
  'california': 'California',
  'ca': 'California',
  'texas': 'Texas',
  'tx': 'Texas',
  'new york state': 'New York',
  'ny state': 'New York',
  'washington': 'Washington',
  'wa': 'Washington',
  'massachusetts': 'Massachusetts',
  'ma': 'Massachusetts',
  'colorado': 'Colorado',
  'co': 'Colorado',

  // USA - Regions
  'usa': 'USA',
  'us': 'USA',
  'united states': 'USA',

  // EU - Major Cities
  'london': 'London',
  'london, uk': 'London',

  'berlin': 'Berlin',
  'berlin, germany': 'Berlin',

  'paris': 'Paris',
  'paris, france': 'Paris',

  'amsterdam': 'Amsterdam',
  'amsterdam, netherlands': 'Amsterdam',

  'dublin': 'Dublin',
  'dublin, ireland': 'Dublin',

  'madrid': 'Madrid',
  'madrid, spain': 'Madrid',

  'barcelona': 'Barcelona',
  'barcelona, spain': 'Barcelona',

  'munich': 'Munich',
  'munich, germany': 'Munich',

  'stockholm': 'Stockholm',
  'stockholm, sweden': 'Stockholm',

  'copenhagen': 'Copenhagen',
  'copenhagen, denmark': 'Copenhagen',

  'zurich': 'Zurich',
  'zurich, switzerland': 'Zurich',

  'vienna': 'Vienna',
  'vienna, austria': 'Vienna',

  'prague': 'Prague',
  'prague, czech republic': 'Prague',

  'warsaw': 'Warsaw',
  'warsaw, poland': 'Warsaw',

  // EU - Countries
  'uk': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'germany': 'Germany',
  'france': 'France',
  'netherlands': 'Netherlands',
  'ireland': 'Ireland',
  'spain': 'Spain',
  'sweden': 'Sweden',
  'denmark': 'Denmark',
  'switzerland': 'Switzerland',
  'austria': 'Austria',
  'belgium': 'Belgium',
  'portugal': 'Portugal',
  'italy': 'Italy',

  // EU - Region
  'europe': 'Europe',
  'eu': 'Europe',
  'european union': 'Europe',

  // Canada
  'toronto': 'Toronto',
  'toronto, canada': 'Toronto',
  'vancouver': 'Vancouver',
  'vancouver, canada': 'Vancouver',
  'montreal': 'Montreal',
  'montreal, canada': 'Montreal',
  'canada': 'Canada',

  // Australia
  'sydney': 'Sydney',
  'melbourne': 'Melbourne',
  'australia': 'Australia',
}

/**
 * Filter out invalid location values
 */
export function filterValidLocations(locations: string[]): string[] {
  return locations.filter(loc => {
    if (!loc) return false

    const lowerLoc = loc.toLowerCase().trim()

    // Exclude invalid markers
    if (INVALID_LOCATIONS.includes(lowerLoc)) return false

    // Exclude very short values (likely invalid)
    if (lowerLoc.length < 2) return false

    // Exclude numeric-only values
    if (/^\d+$/.test(lowerLoc)) return false

    // Exclude values that look like job titles or other non-location data
    if (lowerLoc.includes('product manager') || lowerLoc.includes('engineer')) return false

    return true
  })
}

/**
 * Format location to proper display format
 */
export function formatLocation(value: string): string {
  if (!value) return ''

  const lowerValue = value.toLowerCase().trim()

  // Check mapping first
  if (LOCATION_MAP[lowerValue]) {
    return LOCATION_MAP[lowerValue]
  }

  // If not in map, apply generic formatting
  return formatCamelCase(value)
}

// ==================== WORK ARRANGEMENT FORMATTING ====================

/**
 * Comprehensive work arrangement mapping
 * ALL variations map to exactly one of: Remote, Hybrid, In-Person
 */
const WORK_ARRANGEMENT_MAP: Record<string, 'Remote' | 'Hybrid' | 'In-Person' | null> = {
  // Remote variations
  'remote': 'Remote',
  'remote_us': 'Remote',
  'remote_only': 'Remote',
  'remote_first': 'Remote',
  'remote_global': 'Remote',
  'fully_remote': 'Remote',
  'fully remote': 'Remote',
  'work_from_home': 'Remote',
  'work from home': 'Remote',
  'wfh': 'Remote',
  '100% remote': 'Remote',
  'remote work': 'Remote',
  'remote (us)': 'Remote',
  'remote (global)': 'Remote',

  // Hybrid variations
  'hybrid': 'Hybrid',
  'hybrid_only': 'Hybrid',
  'flexible': 'Hybrid',
  'flexible_remote': 'Hybrid',
  'part_remote': 'Hybrid',
  'remote_hybrid': 'Hybrid',
  'hybrid remote': 'Hybrid',
  'flexible work': 'Hybrid',
  'hybrid work': 'Hybrid',
  'hybrid/remote': 'Hybrid',
  'remote/hybrid': 'Hybrid',
  'part-time remote': 'Hybrid',
  'partially remote': 'Hybrid',

  // In-Person variations
  'onsite': 'In-Person',
  'on-site': 'In-Person',
  'on site': 'In-Person',
  'onsite_only': 'In-Person',
  'office_first': 'In-Person',
  'office first': 'In-Person',
  'in-person': 'In-Person',
  'in-office': 'In-Person',
  'in_person': 'In-Person',
  'in_office': 'In-Person',
  'office': 'In-Person',
  'in office': 'In-Person',
  'on-site work': 'In-Person',
  'onsite work': 'In-Person',
  '100% onsite': 'In-Person',
  '100% on-site': 'In-Person',
  'full-time office': 'In-Person',
}

/**
 * Normalize work arrangement to one of 3 standard values
 * Returns null for unmappable values (they will be filtered out)
 */
export function normalizeWorkArrangement(value: string): string | null {
  if (!value) return null

  const lowerValue = value.toLowerCase().trim()

  // Check exact mapping first
  const mapped = WORK_ARRANGEMENT_MAP[lowerValue]
  if (mapped !== undefined) {
    return mapped
  }

  // Try pattern matching as fallback
  if (lowerValue.includes('remote') && !lowerValue.includes('hybrid')) {
    return 'Remote'
  }
  if (lowerValue.includes('hybrid') || lowerValue.includes('flexible')) {
    return 'Hybrid'
  }
  if (lowerValue.includes('onsite') || lowerValue.includes('office') || lowerValue.includes('on-site')) {
    return 'In-Person'
  }

  // Unable to map - return null to filter out
  return null
}

/**
 * Get the 3 standard work arrangement options
 */
export function getStandardWorkArrangements(): string[] {
  return ['Remote', 'Hybrid', 'In-Person']
}

// ==================== REVERSE MAPPING FOR QUERIES ====================

/**
 * Convert display value back to database values for work arrangement queries
 * Returns array of possible database values that map to this display value
 */
export function reverseFormatWorkArrangement(displayValue: string): string[] {
  const reverseMap: Record<string, string[]> = {
    'Remote': [
      'remote', 'remote_us', 'remote_only', 'remote_first', 'remote_global',
      'fully_remote', 'fully remote', 'work_from_home', 'work from home', 'wfh',
      '100% remote', 'remote work', 'remote (us)', 'remote (global)'
    ],
    'Hybrid': [
      'hybrid', 'hybrid_only', 'flexible', 'flexible_remote', 'part_remote',
      'remote_hybrid', 'hybrid remote', 'flexible work', 'hybrid work',
      'hybrid/remote', 'remote/hybrid', 'part-time remote', 'partially remote'
    ],
    'In-Person': [
      'onsite', 'on-site', 'on site', 'onsite_only', 'office_first', 'office first',
      'in-person', 'in-office', 'in_person', 'in_office', 'office', 'in office',
      'on-site work', 'onsite work', '100% onsite', '100% on-site', 'full-time office'
    ]
  }

  return reverseMap[displayValue] || [displayValue.toLowerCase()]
}

/**
 * Convert formatted display value back to database format for queries
 * Handles seniority and other single-value filters
 */
export function reverseFormatFilterValue(displayValue: string, filterType?: string): string {
  if (!displayValue) return ''

  // For seniority, find the original key from the map
  if (filterType === 'seniority') {
    const lowerDisplay = displayValue.toLowerCase()
    // Find first matching key in the seniority map
    for (const [key, value] of Object.entries(SENIORITY_MAP)) {
      if (value.toLowerCase() === lowerDisplay) {
        return key
      }
    }
  }

  // For locations, find the original key from the map
  if (filterType === 'location') {
    const lowerDisplay = displayValue.toLowerCase()
    for (const [key, value] of Object.entries(LOCATION_MAP)) {
      if (value.toLowerCase() === lowerDisplay) {
        return key
      }
    }
  }

  // Generic fallback: convert to lowercase with underscores
  return displayValue
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
}

// ==================== GENERIC FORMATTER ====================

/**
 * Generic filter value formatter based on filter type
 */
export function formatFilterValue(value: string, filterType?: string): string {
  if (!value) return ''

  switch (filterType) {
    case 'seniority':
    case 'seniorityLevel':
      return formatSeniorityLevel(value)

    case 'location':
    case 'locationMetro':
      return formatLocation(value)

    case 'workArrangement':
      return normalizeWorkArrangement(value) || ''

    default:
      // Use generic CamelCase formatter for other fields
      return formatCamelCase(value)
  }
}
