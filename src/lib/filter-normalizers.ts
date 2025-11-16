/**
 * Filter Value Normalization - High Cardinality to Low Cardinality
 *
 * This file contains predefined normalization tables for:
 * - US Cities (500K+ population)
 * - EU Cities (500K+ population)
 * - Product Manager Seniority Levels (8 standard levels)
 *
 * Goal: Accurately reduce high-cardinality input to standardized low-cardinality output
 */

import { formatCamelCase } from './text-formatter'

// ==================== SENIORITY NORMALIZATION ====================

/**
 * Product Manager Seniority Levels (8 Standard Levels)
 * Ordered by career progression
 */
export const PM_SENIORITY_LEVELS = [
  'Associate Product Manager',
  'Product Manager',
  'Senior Product Manager',
  'Lead Product Manager',
  'Staff Product Manager',
  'Director',
  'VP',
  'CPO'
] as const

export type PMSeniorityLevel = typeof PM_SENIORITY_LEVELS[number]

/**
 * Comprehensive mapping: input variations → standardized seniority level
 * Maps ALL possible variations to exactly 8 levels
 */
const SENIORITY_NORMALIZATION_MAP: Record<string, PMSeniorityLevel> = {
  // Associate Product Manager
  'apm': 'Associate Product Manager',
  'associate': 'Associate Product Manager',
  'associate pm': 'Associate Product Manager',
  'associate product manager': 'Associate Product Manager',
  'junior': 'Associate Product Manager',
  'junior pm': 'Associate Product Manager',
  'junior product manager': 'Associate Product Manager',
  'entry': 'Associate Product Manager',
  'entry level': 'Associate Product Manager',
  'entry-level': 'Associate Product Manager',
  'entry level pm': 'Associate Product Manager',
  'jr': 'Associate Product Manager',
  'jr pm': 'Associate Product Manager',
  'early career': 'Associate Product Manager',

  // Product Manager (Mid-level)
  'pm': 'Product Manager',
  'product manager': 'Product Manager',
  'mid': 'Product Manager',
  'mid-level': 'Product Manager',
  'mid level': 'Product Manager',
  'mid-level pm': 'Product Manager',
  'intermediate': 'Product Manager',
  'intermediate pm': 'Product Manager',

  // Senior Product Manager
  'senior': 'Senior Product Manager',
  'senior pm': 'Senior Product Manager',
  'senior product manager': 'Senior Product Manager',
  'sr': 'Senior Product Manager',
  'sr pm': 'Senior Product Manager',
  'sr product manager': 'Senior Product Manager',
  'senior level': 'Senior Product Manager',

  // Lead Product Manager
  'lead': 'Lead Product Manager',
  'lead pm': 'Lead Product Manager',
  'lead product manager': 'Lead Product Manager',
  'team lead': 'Lead Product Manager',
  'product lead': 'Lead Product Manager',

  // Staff Product Manager
  'staff': 'Staff Product Manager',
  'staff pm': 'Staff Product Manager',
  'staff product manager': 'Staff Product Manager',
  'principal': 'Staff Product Manager',
  'principal pm': 'Staff Product Manager',
  'principal product manager': 'Staff Product Manager',

  // Director
  'director': 'Director',
  'director of product': 'Director',
  'director product': 'Director',
  'product director': 'Director',
  'senior director': 'Director',
  'group pm': 'Director',
  'group product manager': 'Director',

  // VP
  'vp': 'VP',
  'vice president': 'VP',
  'vp product': 'VP',
  'vp of product': 'VP',
  'vice president of product': 'VP',
  'svp': 'VP',
  'senior vp': 'VP',
  'senior vice president': 'VP',
  'evp': 'VP',
  'executive vp': 'VP',

  // CPO
  'cpo': 'CPO',
  'chief product officer': 'CPO',
  'head of product': 'CPO',
  'c-level': 'CPO',
  'executive': 'CPO',
}

/**
 * Normalize seniority input to one of 8 standard PM levels
 */
export function normalizeSeniority(input: string): PMSeniorityLevel | null {
  if (!input) return null

  const normalized = input.toLowerCase().trim()

  // Direct mapping
  if (normalized in SENIORITY_NORMALIZATION_MAP) {
    return SENIORITY_NORMALIZATION_MAP[normalized]
  }

  // Pattern matching for variations
  if (normalized.includes('associate') || normalized.includes('junior') || normalized.includes('entry')) {
    return 'Associate Product Manager'
  }
  if (normalized.includes('staff') || normalized.includes('principal')) {
    return 'Staff Product Manager'
  }
  if (normalized.includes('lead') && !normalized.includes('director')) {
    return 'Lead Product Manager'
  }
  if (normalized.includes('director') || normalized.includes('group pm')) {
    return 'Director'
  }
  if (normalized.includes('vp') || normalized.includes('vice president')) {
    return 'VP'
  }
  if (normalized.includes('cpo') || normalized.includes('chief') || normalized.includes('head of product')) {
    return 'CPO'
  }
  if (normalized.includes('senior') || normalized.includes('sr')) {
    return 'Senior Product Manager'
  }

  // Default to Product Manager for mid-level variations
  if (normalized.includes('product manager') || normalized.includes('pm')) {
    return 'Product Manager'
  }

  return null // Unknown seniority
}

// ==================== LOCATION NORMALIZATION ====================

/**
 * Major US Cities (500K+ population)
 * Source: US Census Bureau
 */
export const US_MAJOR_CITIES = [
  // 1M+
  'New York',
  'Los Angeles',
  'Chicago',
  'Houston',
  'Phoenix',
  'Philadelphia',
  'San Antonio',
  'San Diego',
  'Dallas',
  'San Jose',

  // 500K - 1M
  'Austin',
  'Jacksonville',
  'Fort Worth',
  'Columbus',
  'Charlotte',
  'San Francisco',
  'Indianapolis',
  'Seattle',
  'Denver',
  'Washington DC',
  'Boston',
  'El Paso',
  'Nashville',
  'Detroit',
  'Oklahoma City',
  'Portland',
  'Las Vegas',
  'Memphis',
  'Louisville',
  'Baltimore',
  'Milwaukee',
  'Albuquerque',
  'Tucson',
  'Fresno',
  'Sacramento',
  'Kansas City',
  'Mesa',
  'Atlanta',
  'Omaha',
  'Colorado Springs',
  'Raleigh',
  'Miami',
  'Long Beach',
  'Virginia Beach',
  'Oakland',
  'Minneapolis',
  'Tulsa',
  'Tampa',
  'Arlington',
  'New Orleans',
] as const

/**
 * Major EU Cities (500K+ population)
 * Source: Eurostat, National Statistics Agencies
 */
export const EU_MAJOR_CITIES = [
  // Western Europe
  'London',
  'Berlin',
  'Madrid',
  'Rome',
  'Paris',
  'Barcelona',
  'Vienna',
  'Hamburg',
  'Munich',
  'Milan',

  // Central/Eastern Europe
  'Warsaw',
  'Budapest',
  'Prague',
  'Bucharest',
  'Sofia',

  // Northern Europe
  'Stockholm',
  'Copenhagen',
  'Helsinki',
  'Oslo',
  'Amsterdam',
  'Rotterdam',
  'Brussels',

  // Southern Europe
  'Athens',
  'Lisbon',
  'Valencia',
  'Seville',
  'Naples',
  'Marseille',

  // Other major tech hubs
  'Dublin',
  'Lyon',
  'Toulouse',
  'Frankfurt',
  'Cologne',
  'Stuttgart',
  'Dortmund',
  'Essen',
  'Dresden',
  'Antwerp',
  'Gothenburg',
  'Krakow',
  'Wroclaw',
  'Porto',
] as const

/**
 * Comprehensive location normalization mapping
 * Maps variations → standardized city names
 */
const LOCATION_NORMALIZATION_MAP: Record<string, string> = {
  // Remote
  'remote': 'Remote',
  'remote - us': 'Remote',
  'remote us': 'Remote',
  'remote - usa': 'Remote',
  'remote usa': 'Remote',
  'remote - global': 'Remote',
  'remote global': 'Remote',
  'fully remote': 'Remote',
  'work from home': 'Remote',
  'wfh': 'Remote',

  // New York Metro
  'nyc': 'New York',
  'new york': 'New York',
  'new york city': 'New York',
  'new york, ny': 'New York',
  'manhattan': 'New York',
  'brooklyn': 'New York',
  'queens': 'New York',
  'bronx': 'New York',
  'staten island': 'New York',
  'ny': 'New York',

  // San Francisco Bay Area
  'sf': 'San Francisco',
  'san francisco': 'San Francisco',
  'sf bay area': 'San Francisco',
  'san francisco bay area': 'San Francisco',
  'bay area': 'San Francisco',
  'silicon valley': 'San Francisco',
  'palo alto': 'San Francisco',
  'mountain view': 'San Francisco',
  'sunnyvale': 'San Francisco',
  'cupertino': 'San Francisco',
  'santa clara': 'San Francisco',
  'menlo park': 'San Francisco',
  'redwood city': 'San Francisco',

  // Los Angeles Metro
  'la': 'Los Angeles',
  'los angeles': 'Los Angeles',
  'los angeles, ca': 'Los Angeles',
  'santa monica': 'Los Angeles',
  'venice': 'Los Angeles',
  'hollywood': 'Los Angeles',

  // Seattle
  'seattle': 'Seattle',
  'seattle, wa': 'Seattle',
  'bellevue': 'Seattle',
  'redmond': 'Seattle',

  // Austin
  'austin': 'Austin',
  'austin, tx': 'Austin',

  // Boston
  'boston': 'Boston',
  'boston, ma': 'Boston',
  'cambridge': 'Boston',
  'somerville': 'Boston',

  // Chicago
  'chicago': 'Chicago',
  'chicago, il': 'Chicago',

  // Denver
  'denver': 'Denver',
  'denver, co': 'Denver',
  'boulder': 'Denver',

  // Washington DC
  'dc': 'Washington DC',
  'washington': 'Washington DC',
  'washington dc': 'Washington DC',
  'washington, dc': 'Washington DC',
  'arlington': 'Washington DC',
  'alexandria': 'Washington DC',

  // Portland
  'portland': 'Portland',
  'portland, or': 'Portland',

  // Atlanta
  'atlanta': 'Atlanta',
  'atlanta, ga': 'Atlanta',

  // Miami
  'miami': 'Miami',
  'miami, fl': 'Miami',
  'miami beach': 'Miami',

  // Dallas
  'dallas': 'Dallas',
  'dallas, tx': 'Dallas',

  // Houston
  'houston': 'Houston',
  'houston, tx': 'Houston',

  // Philadelphia
  'philadelphia': 'Philadelphia',
  'philadelphia, pa': 'Philadelphia',
  'philly': 'Philadelphia',

  // Phoenix
  'phoenix': 'Phoenix',
  'phoenix, az': 'Phoenix',

  // San Diego
  'san diego': 'San Diego',
  'san diego, ca': 'San Diego',

  // San Antonio
  'san antonio': 'San Antonio',
  'san antonio, tx': 'San Antonio',

  // San Jose
  'san jose': 'San Jose',
  'san jose, ca': 'San Jose',

  // Other US Cities
  'columbus': 'Columbus',
  'indianapolis': 'Indianapolis',
  'charlotte': 'Charlotte',
  'detroit': 'Detroit',
  'nashville': 'Nashville',
  'baltimore': 'Baltimore',
  'milwaukee': 'Milwaukee',
  'raleigh': 'Raleigh',
  'minneapolis': 'Minneapolis',
  'sacramento': 'Sacramento',
  'kansas city': 'Kansas City',
  'las vegas': 'Las Vegas',

  // London
  'london': 'London',
  'london, uk': 'London',

  // Berlin
  'berlin': 'Berlin',
  'berlin, germany': 'Berlin',

  // Paris
  'paris': 'Paris',
  'paris, france': 'Paris',

  // Amsterdam
  'amsterdam': 'Amsterdam',
  'amsterdam, netherlands': 'Amsterdam',

  // Dublin
  'dublin': 'Dublin',
  'dublin, ireland': 'Dublin',

  // Madrid
  'madrid': 'Madrid',
  'madrid, spain': 'Madrid',

  // Barcelona
  'barcelona': 'Barcelona',
  'barcelona, spain': 'Barcelona',

  // Munich
  'munich': 'Munich',
  'munich, germany': 'Munich',
  'münchen': 'Munich',

  // Stockholm
  'stockholm': 'Stockholm',
  'stockholm, sweden': 'Stockholm',

  // Copenhagen
  'copenhagen': 'Copenhagen',
  'copenhagen, denmark': 'Copenhagen',

  // Vienna
  'vienna': 'Vienna',
  'vienna, austria': 'Vienna',
  'wien': 'Vienna',

  // Rome
  'rome': 'Rome',
  'rome, italy': 'Rome',
  'roma': 'Rome',

  // Milan
  'milan': 'Milan',
  'milan, italy': 'Milan',
  'milano': 'Milan',

  // Warsaw
  'warsaw': 'Warsaw',
  'warsaw, poland': 'Warsaw',
  'warszawa': 'Warsaw',

  // Prague
  'prague': 'Prague',
  'prague, czech republic': 'Prague',
  'praha': 'Prague',

  // Brussels
  'brussels': 'Brussels',
  'brussels, belgium': 'Brussels',
  'bruxelles': 'Brussels',

  // Lisbon
  'lisbon': 'Lisbon',
  'lisbon, portugal': 'Lisbon',
  'lisboa': 'Lisbon',

  // Other EU cities
  'hamburg': 'Hamburg',
  'budapest': 'Budapest',
  'athens': 'Athens',
  'helsinki': 'Helsinki',
  'oslo': 'Oslo',
  'rotterdam': 'Rotterdam',
  'frankfurt': 'Frankfurt',
  'cologne': 'Cologne',
  'stuttgart': 'Stuttgart',
  'lyon': 'Lyon',
  'marseille': 'Marseille',
  'valencia': 'Valencia',
}

/**
 * Invalid location markers to filter out
 */
const INVALID_LOCATIONS = [
  'null', 'none', 'n/a', 'na', 'n.a.', 'unknown', 'tbd', 'to be determined',
  'various', 'multiple', 'flexible', 'anywhere', 'worldwide', 'unspecified',
  'not specified', '', ' ', 'multiple locations', 'varies'
]

/**
 * Filter out invalid location values
 */
export function isValidLocation(location: string): boolean {
  if (!location) return false

  const lowerLoc = location.toLowerCase().trim()

  // Exclude invalid markers
  if (INVALID_LOCATIONS.includes(lowerLoc)) return false

  // Exclude very short values (likely invalid)
  if (lowerLoc.length < 2) return false

  // Exclude numeric-only values
  if (/^\d+$/.test(lowerLoc)) return false

  // Exclude values that look like job titles
  if (lowerLoc.includes('product manager') || lowerLoc.includes('engineer') || lowerLoc.includes('developer')) {
    return false
  }

  return true
}

/**
 * Normalize location input to standardized city name
 * Returns city name or null if cannot be normalized
 */
export function normalizeLocation(input: string): string | null {
  if (!input || !isValidLocation(input)) return null

  const normalized = input.toLowerCase().trim()

  // Direct mapping
  if (normalized in LOCATION_NORMALIZATION_MAP) {
    return LOCATION_NORMALIZATION_MAP[normalized]
  }

  // Pattern matching for cities
  // Check if input contains any of our known cities
  const allCities = [...US_MAJOR_CITIES, ...EU_MAJOR_CITIES]

  for (const city of allCities) {
    const cityLower = city.toLowerCase()
    if (normalized.includes(cityLower)) {
      return city
    }
  }

  // Check for metro area patterns
  if (normalized.includes('san francisco') || normalized.includes('silicon valley') || normalized.includes('bay area')) {
    return 'San Francisco'
  }
  if (normalized.includes('new york') || normalized.includes('nyc')) {
    return 'New York'
  }
  if (normalized.includes('los angeles') || normalized.includes(' la ')) {
    return 'Los Angeles'
  }
  if (normalized.includes('washington') && (normalized.includes('dc') || normalized.includes('d.c.'))) {
    return 'Washington DC'
  }

  // Remote patterns
  if (normalized.includes('remote')) {
    return 'Remote'
  }

  return null // Cannot normalize
}

/**
 * Get all valid normalized cities (for dropdown display)
 */
export function getAllNormalizedCities(): string[] {
  const cities = new Set<string>()

  // Add Remote first
  cities.add('Remote')

  // Add US cities
  US_MAJOR_CITIES.forEach(city => cities.add(city))

  // Add EU cities
  EU_MAJOR_CITIES.forEach(city => cities.add(city))

  return Array.from(cities).sort()
}

// ==================== WORK ARRANGEMENT (KEEP EXISTING - WORKING) ====================

export function normalizeWorkArrangement(value: string): string | null {
  if (!value) return null

  const lowerValue = value.toLowerCase().trim()

  const WORK_ARRANGEMENT_MAP: Record<string, 'Remote' | 'Hybrid' | 'In-Person' | null> = {
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

    'hybrid': 'Hybrid',
    'hybrid_only': 'Hybrid',
    'flexible': 'Hybrid',
    'flexible_remote': 'Hybrid',
    'part_remote': 'Hybrid',
    'remote_hybrid': 'Hybrid',
    'hybrid remote': 'Hybrid',
    'flexible work': 'Hybrid',

    'onsite': 'In-Person',
    'on-site': 'In-Person',
    'on site': 'In-Person',
    'onsite_only': 'In-Person',
    'office_first': 'In-Person',
    'in-person': 'In-Person',
    'in_office': 'In-Person',
    'office': 'In-Person',
  }

  const mapped = WORK_ARRANGEMENT_MAP[lowerValue]
  if (mapped !== undefined) return mapped

  // Pattern matching
  if (lowerValue.includes('remote') && !lowerValue.includes('hybrid')) return 'Remote'
  if (lowerValue.includes('hybrid') || lowerValue.includes('flexible')) return 'Hybrid'
  if (lowerValue.includes('onsite') || lowerValue.includes('office')) return 'In-Person'

  return null
}

export function reverseFormatWorkArrangement(displayValue: string): string[] {
  const reverseMap: Record<string, string[]> = {
    'Remote': ['remote', 'remote_us', 'remote_only', 'remote_first', 'remote_global', 'fully_remote', 'wfh'],
    'Hybrid': ['hybrid', 'hybrid_only', 'flexible', 'flexible_remote', 'part_remote'],
    'In-Person': ['onsite', 'on-site', 'onsite_only', 'office_first', 'in-person', 'in_office', 'office']
  }
  return reverseMap[displayValue] || [displayValue.toLowerCase()]
}

// ==================== REVERSE MAPPING ====================

export function reverseNormalizeSeniority(displayValue: PMSeniorityLevel): string[] {
  // Find all keys that map to this display value
  const keys: string[] = []
  for (const [key, value] of Object.entries(SENIORITY_NORMALIZATION_MAP)) {
    if (value === displayValue) {
      keys.push(key)
    }
  }
  return keys.length > 0 ? keys : [displayValue.toLowerCase()]
}

export function reverseNormalizeLocation(displayValue: string): string[] {
  // Find all keys that map to this display value
  const keys: string[] = []
  for (const [key, value] of Object.entries(LOCATION_NORMALIZATION_MAP)) {
    if (value === displayValue) {
      keys.push(key)
    }
  }
  return keys.length > 0 ? keys : [displayValue.toLowerCase()]
}
