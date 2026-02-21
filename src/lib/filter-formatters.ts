/**
 * Filter Value Formatting Utilities
 * Delegates to normalizers for seniority and location
 * Keeps work arrangement logic (working as expected)
 */

import { formatCamelCase } from './text-formatter'
import {
  normalizeSeniority,
  normalizeLocation,
  normalizeWorkArrangement as normalizeWork,
  reverseNormalizeSeniority,
  reverseNormalizeLocation,
  reverseFormatWorkArrangement as reverseWorkArr,
  PM_SENIORITY_LEVELS,
  getAllNormalizedCities,
  isValidLocation
} from './filter-normalizers'

// Re-export for compatibility
export { normalizeWorkArrangement } from './filter-normalizers'

// ==================== SENIORITY LEVEL FORMATTING ====================

/**
 * Format seniority level using normalization
 * Maps to 8 PM-specific levels
 */
export function formatSeniorityLevel(value: string): string {
  if (!value) return ''
  const normalized = normalizeSeniority(value)
  return normalized || formatCamelCase(value)
}

/**
 * Get standardized PM seniority levels (8 levels)
 */
export function getStandardSeniorityLevels(): string[] {
  return [...PM_SENIORITY_LEVELS]
}

// ==================== LOCATION FORMATTING ====================

/**
 * Filter out invalid location values
 */
export function filterValidLocations(locations: string[]): string[] {
  return locations.filter(isValidLocation)
}

/**
 * Format location using normalization
 * Maps to major US/EU cities (500K+)
 */
export function formatLocation(value: string): string {
  if (!value) return ''
  const normalized = normalizeLocation(value)
  return normalized || formatCamelCase(value)
}

/**
 * Get all normalized cities for dropdown
 */
export function getAllCities(): string[] {
  return getAllNormalizedCities()
}

// ==================== WORK ARRANGEMENT FORMATTING ====================

/**
 * Get the 3 standard work arrangement options
 */
export function getStandardWorkArrangements(): string[] {
  return ['Remote', 'Hybrid', 'In-Person']
}

// Note: normalizeWorkArrangement is imported from filter-normalizers

// ==================== REVERSE MAPPING FOR QUERIES ====================

/**
 * Convert display value back to database values for work arrangement queries
 */
export function reverseFormatWorkArrangement(displayValue: string): string[] {
  return reverseWorkArr(displayValue)
}

/**
 * Convert formatted display value back to database values (array) for queries
 * Returns array of possible database values for accurate filtering
 */
export function reverseFormatFilterValues(displayValue: string, filterType?: string): string[] {
  if (!displayValue) return []

  // For seniority, use reverse normalization (returns all possible DB values)
  if (filterType === 'seniority') {
    return reverseNormalizeSeniority(displayValue as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  // For locations, use reverse normalization (returns all possible DB values)
  if (filterType === 'location') {
    return reverseNormalizeLocation(displayValue)
  }

  // Generic fallback
  return [displayValue.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '')]
}

/**
 * Convert formatted display value back to single database value (legacy)
 * Use reverseFormatFilterValues for better accuracy
 */
export function reverseFormatFilterValue(displayValue: string, filterType?: string): string {
  const values = reverseFormatFilterValues(displayValue, filterType)
  return values[0] || displayValue.toLowerCase()
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
      return normalizeWork(value) || ''

    default:
      return formatCamelCase(value)
  }
}
