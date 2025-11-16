# Filter Display Fixes - Implementation Plan

## 🎯 Objective
Fix display formatting for filter values and tags to be user-friendly and aesthetically pleasing.

---

## 📋 Issues to Fix

### 1. **Seniority Levels** - All lowercase
- **Current:** "senior", "junior", "mid-level", "principal"
- **Expected:** "Senior", "Junior", "Mid-Level", "Principal"

### 2. **Locations** - Lowercase and contain out-of-context options
- **Current:** "san francisco bay area", "new york city", "remote", "invalid values"
- **Expected:** "San Francisco Bay Area", "New York City", "Remote"
- **Cleanup:** Remove out-of-context/invalid location values

### 3. **Work Types** - Should only show 3 options
- **Current:** Multiple variations like "remote", "hybrid", "onsite", "remote_us", "hybrid_only", etc.
- **Expected:** Only 3 options: "Remote", "Hybrid", "In-Person"

### 4. **Skills and Tags** - Should read in Title Case
- **Current:** Mixed formatting, sometimes lowercase
- **Expected:** Consistent Title Case for all tags and skills

---

## 🔍 Current State Analysis

### Data Flow
```
Database (raw values)
    ↓
fetchActualFilterValues() [page.tsx:352-431]
    ↓
actualFilterValues state [page.tsx:167]
    ↓
Display in dropdowns [page.tsx:857, 875, 893]
    ↓
Display in AdvancedFilterSidebar [AdvancedFilterSidebar.tsx:168]
```

### Key Files
1. **`src/app/page.tsx`** - Main page with filter dropdowns (lines 352-431, 857-895)
2. **`src/components/AdvancedFilterSidebar.tsx`** - Advanced filter chips (line 168)
3. **`src/lib/text-formatter.ts`** - Existing formatting utilities (lines 1-271)
4. **`src/lib/tag-parser.ts`** - Tag formatting logic (lines 117-122)
5. **`src/lib/tag-extraction.ts`** - Tag extraction (various functions)

### Existing Utilities
- `formatCamelCase()` in `text-formatter.ts:8-160` - Handles special cases and Title Case
- `formatWorkArrangement()` in `text-formatter.ts:206-217` - Work arrangement formatting
- Various special case mappings already exist

---

## 🛠️ Implementation Strategy

### **Approach: Format at Display Time, Not Storage**
- **Keep database values unchanged** - Maintain query compatibility
- **Apply formatting only when displaying** - Clean separation of concerns
- **Use centralized formatting functions** - Single source of truth

---

## 📝 Detailed Implementation Steps

### **STEP 1: Create Centralized Filter Formatting Utilities**

**File:** `src/lib/filter-formatters.ts` (NEW FILE)

**Purpose:** Centralized formatting functions for all filter values

**Functions to Create:**

#### 1.1 `formatSeniorityLevel(value: string): string`
```typescript
/**
 * Format seniority level to Title Case
 * Input: "senior", "mid-level", "principal"
 * Output: "Senior", "Mid-Level", "Principal"
 */
```
- Use existing `formatCamelCase()` from `text-formatter.ts`
- Special cases: "IC" (Individual Contributor), "VP", "C-Level"

#### 1.2 `formatLocation(value: string): string`
```typescript
/**
 * Format location to Title Case with special handling
 * Input: "san francisco bay area", "new york city", "remote"
 * Output: "San Francisco Bay Area", "New York City", "Remote"
 */
```
- Handle metro areas properly (NYC, SF Bay Area, etc.)
- Keep "Remote" as-is
- Use `formatCamelCase()` for general cases

#### 1.3 `normalizeWorkArrangement(value: string): string | null`
```typescript
/**
 * Normalize work arrangement to one of 3 standard values
 * Input: "remote", "hybrid", "onsite", "remote_us", "hybrid_only", "in-person"
 * Output: "Remote" | "Hybrid" | "In-Person" | null
 */
```
- Map all variations to 3 standard values:
  - "remote", "remote_us", "remote_only", "remote_first" → "Remote"
  - "hybrid", "hybrid_only", "flexible" → "Hybrid"
  - "onsite", "on-site", "onsite_only", "office_first", "in-person" → "In-Person"
- Return `null` for unmappable values (will be filtered out)

#### 1.4 `filterValidLocations(locations: string[]): string[]`
```typescript
/**
 * Filter out invalid/out-of-context location values
 * Keep only: actual metro areas, city names, states, countries, "Remote"
 */
```
- Exclude: empty strings, "null", "none", "n/a", "unknown"
- Exclude: values that are clearly not locations (job titles, etc.)
- Keep common patterns: city names, metro areas, states, countries

#### 1.5 `formatFilterValue(value: string, filterType: string): string`
```typescript
/**
 * Generic filter value formatter based on filter type
 * Routes to appropriate formatting function
 */
```
- Routes based on `filterType`: 'seniority', 'location', 'workArrangement', etc.
- Uses `formatCamelCase()` for generic cases

---

### **STEP 2: Update Main Page Filter Value Processing**

**File:** `src/app/page.tsx`

#### 2.1 Import new formatters (add after line 14)
```typescript
import {
  formatSeniorityLevel,
  formatLocation,
  normalizeWorkArrangement,
  filterValidLocations,
  formatFilterValue
} from '@/lib/filter-formatters'
```

#### 2.2 Modify `fetchActualFilterValues()` function (lines 352-431)

**Current code (lines 388-401):**
```typescript
const seniority = [...new Set(allJobs.map(j => j.seniority_level).filter(Boolean))].sort()
const location = [...new Set([
  ...allJobs.map(j => j.location_metro).filter(Boolean)
])].sort()
const workArrangement = [...new Set(allJobs.map(j => j.work_arrangement).filter(Boolean))].sort()
```

**New code:**
```typescript
// Extract and format seniority levels
const seniorityRaw = [...new Set(allJobs.map(j => j.seniority_level).filter(Boolean))]
const seniority = seniorityRaw
  .map(level => formatSeniorityLevel(level))
  .filter(Boolean)
  .sort()

// Extract, validate, and format locations
const locationRaw = [...new Set(allJobs.map(j => j.location_metro).filter(Boolean))]
const location = filterValidLocations(locationRaw)
  .map(loc => formatLocation(loc))
  .filter(Boolean)
  .sort()

// Normalize work arrangements to 3 standard values
const workArrangementRaw = [...new Set(allJobs.map(j => j.work_arrangement).filter(Boolean))]
const workArrangement = [...new Set(
  workArrangementRaw
    .map(arr => normalizeWorkArrangement(arr))
    .filter(Boolean) as string[]
)].sort()

// Format other filter values using generic formatter
const companyStage = [...new Set(allJobs.map(j => j.company_stage).filter(Boolean))]
  .map(stage => formatFilterValue(stage, 'companyStage'))
  .sort()

const productLifecycle = [...new Set(allJobs.map(j => j.product_lifecycle_focus).filter(Boolean))]
  .map(pl => formatFilterValue(pl, 'productLifecycle'))
  .sort()

const productDomain = [...new Set(allJobs.map(j => j.product_domain).filter(Boolean))]
  .map(pd => formatFilterValue(pd, 'productDomain'))
  .sort()

const managementScope = [...new Set(allJobs.map(j => j.management_scope).filter(Boolean))]
  .map(ms => formatFilterValue(ms, 'managementScope'))
  .sort()

const industryVertical = [...new Set(allJobs.map(j => j.industry_vertical).filter(Boolean))]
  .map(iv => formatFilterValue(iv, 'industryVertical'))
  .sort()

const experienceBucket = [...new Set(allJobs.map(j => j.experience_bucket).filter(Boolean))]
  .map(eb => formatFilterValue(eb, 'experienceBucket'))
  .sort()

const domainExpertise = [...new Set(allJobs.map(j => j.domain_expertise).filter(Boolean))]
  .map(de => formatFilterValue(de, 'domainExpertise'))
  .sort()
```

#### 2.3 **IMPORTANT: Handle Filter Value Mapping for Queries**

**Problem:** Display values are now formatted (e.g., "Remote"), but database has raw values (e.g., "remote")

**Solution:** Create reverse mapping functions

**Add to `src/lib/filter-formatters.ts`:**
```typescript
/**
 * Convert display value back to database value for queries
 */
export function reverseFormatWorkArrangement(displayValue: string): string[] {
  const reverseMap: Record<string, string[]> = {
    'Remote': ['remote', 'remote_us', 'remote_only', 'remote_first'],
    'Hybrid': ['hybrid', 'hybrid_only', 'flexible'],
    'In-Person': ['onsite', 'on-site', 'onsite_only', 'office_first', 'in-person']
  }
  return reverseMap[displayValue] || [displayValue.toLowerCase()]
}

export function reverseFormatFilterValue(displayValue: string): string {
  // Convert back to lowercase/snake_case for database query
  return displayValue.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}
```

#### 2.4 Update query building logic (lines 486-520)

**Current code (line 492):**
```typescript
if (filters.workArrangement && filters.workArrangement.trim()) {
  q = q.eq('work_arrangement', filters.workArrangement)
}
```

**New code:**
```typescript
if (filters.workArrangement && filters.workArrangement.trim()) {
  // Handle multiple possible database values for standardized display value
  const dbValues = reverseFormatWorkArrangement(filters.workArrangement)
  q = q.in('work_arrangement', dbValues)
}

// Similar updates for other filters if needed (seniority, location)
if (filters.seniority && filters.seniority.trim()) {
  const dbValue = reverseFormatFilterValue(filters.seniority)
  q = q.eq('seniority_level', dbValue)
}

if (filters.location && filters.location.trim()) {
  const dbValue = reverseFormatFilterValue(filters.location)
  q = q.eq('location_metro', dbValue)
}
```

---

### **STEP 3: Update Advanced Filter Sidebar**

**File:** `src/components/AdvancedFilterSidebar.tsx`

#### 3.1 Import formatters (add after line 3)
```typescript
import { formatFilterValue } from '@/lib/filter-formatters'
```

#### 3.2 Format fallback values (lines 37-63)

**Current code (line 39):**
```typescript
const companyStageOptions = actualFilterValues.companyStage.length > 0
  ? actualFilterValues.companyStage
  : ['Seed', 'Series A', 'Series B', ...]
```

**New code:**
```typescript
// actualFilterValues already contain formatted values from page.tsx
// No change needed here - just ensure fallbacks are also formatted
const companyStageOptions = actualFilterValues.companyStage.length > 0
  ? actualFilterValues.companyStage
  : ['Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Pre-IPO', 'Public', 'Startup', 'Scale-up', 'Enterprise']
```

**Note:** If `actualFilterValues` is properly formatted in `page.tsx`, the sidebar will automatically receive formatted values. Only ensure fallback values are also properly formatted.

---

### **STEP 4: Update Tag Formatting**

**File:** `src/lib/tag-parser.ts`

#### 4.1 Enhance `parseCommaSeparated()` function (lines 107-130)

**Current code (lines 120-122):**
```typescript
const label = skillMap?.[value] || value.split(' ').map(word =>
  word.charAt(0).toUpperCase() + word.slice(1)
).join(' ')
```

**New code:**
```typescript
import { formatCamelCase } from './text-formatter'

const label = skillMap?.[value] || formatCamelCase(value)
```

This ensures all tags use the comprehensive `formatCamelCase()` function which handles special cases (API, UI/UX, B2B, etc.)

---

### **STEP 5: Update Tag Extraction Formatting**

**File:** `src/lib/tag-extraction.ts`

#### 5.1 Import formatter (add at top)
```typescript
import { formatCamelCase } from './text-formatter'
```

#### 5.2 Update all formatting functions to use `formatCamelCase()`

**Find and replace pattern:**
- Current: `.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())`
- Replace with: Use `formatCamelCase()` function

**Specific locations:**
- Line 65: `parseResponsibilities()` - Already uses `formatCamelCase()` ✅
- Line 313: Similar pattern - Update to `formatCamelCase()`
- Line 331: `formatToolCategory()` - Already uses mappings, ensure fallback uses `formatCamelCase()`

---

### **STEP 6: Update Search API to Handle Formatted Values**

**File:** `src/app/api/search/route.ts`

#### 6.1 Import reverse formatters (add at top)
```typescript
import { reverseFormatWorkArrangement, reverseFormatFilterValue } from '@/lib/filter-formatters'
```

#### 6.2 Update filter parameter handling (lines 20-35)

**Current approach:** Passes values directly to RPC

**New approach:** Convert display values back to database values

```typescript
// Handle work arrangement (may have display value like "Remote")
const workArrangement = searchParams.get('workArrangement')
const workArrangementDbValues = workArrangement
  ? reverseFormatWorkArrangement(workArrangement)
  : undefined

// Handle other single-value filters
const seniority = searchParams.get('seniority')
const seniorityDb = seniority ? reverseFormatFilterValue(seniority) : undefined

const location = searchParams.get('location')
const locationDb = location ? reverseFormatFilterValue(location) : undefined

// Update RPC call to use database values
filters: {
  seniority_level: seniorityDb,
  location_metro: locationDb,
  work_arrangement_values: workArrangementDbValues,
  // ... other filters
}
```

---

## 🎨 Implementation Details for `filter-formatters.ts`

### Complete File Structure

```typescript
/**
 * Filter value formatting utilities
 * Formats raw database values for user-friendly display
 */

import { formatCamelCase } from './text-formatter'

// ==================== SENIORITY FORMATTING ====================

export function formatSeniorityLevel(value: string): string {
  if (!value) return ''

  const seniorityMap: Record<string, string> = {
    'junior': 'Junior',
    'mid': 'Mid',
    'mid-level': 'Mid-Level',
    'senior': 'Senior',
    'staff': 'Staff',
    'principal': 'Principal',
    'lead': 'Lead',
    'director': 'Director',
    'vp': 'VP',
    'c-level': 'C-Level',
    'ic': 'IC',
    'individual_contributor': 'Individual Contributor',
    'entry': 'Entry',
    'associate': 'Associate'
  }

  const lowerValue = value.toLowerCase().trim()
  return seniorityMap[lowerValue] || formatCamelCase(value)
}

// ==================== LOCATION FORMATTING ====================

const INVALID_LOCATIONS = [
  'null', 'none', 'n/a', 'unknown', 'tbd', 'to be determined',
  'various', 'multiple', 'flexible', 'anywhere'
]

export function filterValidLocations(locations: string[]): string[] {
  return locations.filter(loc => {
    const lowerLoc = loc.toLowerCase().trim()

    // Exclude invalid markers
    if (INVALID_LOCATIONS.includes(lowerLoc)) return false

    // Exclude very short values (likely invalid)
    if (lowerLoc.length < 2) return false

    // Exclude numeric-only values
    if (/^\d+$/.test(lowerLoc)) return false

    return true
  })
}

export function formatLocation(value: string): string {
  if (!value) return ''

  const locationMap: Record<string, string> = {
    'remote': 'Remote',
    'sf': 'San Francisco',
    'sf bay area': 'San Francisco Bay Area',
    'bay area': 'San Francisco Bay Area',
    'san francisco bay area': 'San Francisco Bay Area',
    'nyc': 'New York City',
    'new york': 'New York City',
    'new york city': 'New York City',
    'la': 'Los Angeles',
    'los angeles': 'Los Angeles',
    'boston': 'Boston',
    'seattle': 'Seattle',
    'austin': 'Austin',
    'chicago': 'Chicago',
    'denver': 'Denver',
    'portland': 'Portland',
    'washington dc': 'Washington DC',
    'dc': 'Washington DC',
    'atlanta': 'Atlanta',
    'miami': 'Miami',
    'dallas': 'Dallas',
    'houston': 'Houston',
    'usa': 'USA',
    'us': 'USA',
    'united states': 'USA',
    'uk': 'United Kingdom',
    'europe': 'Europe',
    'canada': 'Canada',
    'australia': 'Australia'
  }

  const lowerValue = value.toLowerCase().trim()
  return locationMap[lowerValue] || formatCamelCase(value)
}

// ==================== WORK ARRANGEMENT FORMATTING ====================

export function normalizeWorkArrangement(value: string): string | null {
  if (!value) return null

  const lowerValue = value.toLowerCase().trim()

  // Map to "Remote"
  if (['remote', 'remote_us', 'remote_only', 'remote_first', 'remote_global', 'fully_remote', 'work_from_home', 'wfh'].includes(lowerValue)) {
    return 'Remote'
  }

  // Map to "Hybrid"
  if (['hybrid', 'hybrid_only', 'flexible', 'flexible_remote', 'part_remote', 'remote_hybrid'].includes(lowerValue)) {
    return 'Hybrid'
  }

  // Map to "In-Person"
  if (['onsite', 'on-site', 'onsite_only', 'office_first', 'in-person', 'in_person', 'office', 'in_office'].includes(lowerValue)) {
    return 'In-Person'
  }

  // If doesn't match any pattern, try to infer
  if (lowerValue.includes('remote')) return 'Remote'
  if (lowerValue.includes('hybrid') || lowerValue.includes('flexible')) return 'Hybrid'
  if (lowerValue.includes('onsite') || lowerValue.includes('office')) return 'In-Person'

  return null // Unmappable values are filtered out
}

// ==================== REVERSE MAPPING FOR QUERIES ====================

export function reverseFormatWorkArrangement(displayValue: string): string[] {
  const reverseMap: Record<string, string[]> = {
    'Remote': ['remote', 'remote_us', 'remote_only', 'remote_first', 'remote_global', 'fully_remote', 'work_from_home', 'wfh'],
    'Hybrid': ['hybrid', 'hybrid_only', 'flexible', 'flexible_remote', 'part_remote', 'remote_hybrid'],
    'In-Person': ['onsite', 'on-site', 'onsite_only', 'office_first', 'in-person', 'in_office', 'office']
  }

  return reverseMap[displayValue] || [displayValue.toLowerCase()]
}

export function reverseFormatFilterValue(displayValue: string): string {
  // Convert formatted display value back to database format
  // "Mid-Level" → "mid-level" or "mid_level"
  return displayValue
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
}

// ==================== GENERIC FORMATTER ====================

export function formatFilterValue(value: string, filterType?: string): string {
  if (!value) return ''

  // Use specific formatters when available
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
      // Use generic CamelCase formatter
      return formatCamelCase(value)
  }
}
```

---

## ✅ Testing Checklist

### Filter Display Tests
- [ ] Seniority dropdown shows Title Case values ("Senior", "Junior", "Mid-Level")
- [ ] Location dropdown shows formatted values ("San Francisco Bay Area", "New York City")
- [ ] Location dropdown excludes invalid values ("null", "n/a", empty strings)
- [ ] Work arrangement dropdown shows ONLY 3 options: "Remote", "Hybrid", "In-Person"
- [ ] Advanced filter chips display formatted values
- [ ] All filter categories use Title Case

### Tag Display Tests
- [ ] Job tags display in Title Case ("Product Strategy", not "product strategy")
- [ ] Special terms formatted correctly ("API", "UI/UX", "B2B SaaS")
- [ ] Tag extraction maintains proper formatting
- [ ] Sidebar tags are formatted consistently

### Query Functionality Tests
- [ ] Selecting "Remote" filter queries database correctly (matches "remote", "remote_us", etc.)
- [ ] Selecting "Senior" filter queries database correctly (matches "senior", case-insensitive)
- [ ] Multiple work arrangements work correctly
- [ ] Search + filters combination works
- [ ] URL state persistence works with formatted values

### Edge Cases
- [ ] Empty/null values handled gracefully
- [ ] Unknown values fall back to generic formatting
- [ ] Special characters in values handled correctly
- [ ] Database queries still work after formatting changes

---

## 📊 Impact Analysis

### Files Modified
1. **NEW:** `src/lib/filter-formatters.ts` (~200 lines)
2. **MODIFIED:** `src/app/page.tsx` (~50 lines changed)
3. **MODIFIED:** `src/app/api/search/route.ts` (~30 lines changed)
4. **MODIFIED:** `src/lib/tag-parser.ts` (~5 lines changed)
5. **MODIFIED:** `src/lib/tag-extraction.ts` (~10 lines changed)

### Total Lines Changed: ~295 lines

### Risk Level: **LOW-MEDIUM**
- Display-only changes (low risk)
- Query logic changes require careful testing (medium risk)
- Backward compatible with database schema

---

## 🚀 Deployment Strategy

### Phase 1: Create Formatters (No Risk)
1. Create `filter-formatters.ts` with all formatting functions
2. Write unit tests for formatters
3. Commit: "feat: add filter value formatting utilities"

### Phase 2: Update Display (Low Risk)
1. Update `page.tsx` to format filter values for display
2. Update `AdvancedFilterSidebar.tsx` if needed
3. Update tag formatters
4. Test display changes thoroughly
5. Commit: "feat: apply formatting to filter and tag display"

### Phase 3: Update Queries (Medium Risk - Test Thoroughly)
1. Add reverse mapping functions
2. Update query building logic in `page.tsx`
3. Update API route in `search/route.ts`
4. **CRITICAL:** Test all filter combinations
5. Commit: "fix: update query logic for formatted filter values"

### Phase 4: Validation (High Priority)
1. Manual testing of all filters
2. Check search functionality
3. Verify URL state persistence
4. Test edge cases
5. Commit: "test: validate filter formatting changes"

---

## 🎯 Success Criteria

### Display
✅ All filter dropdowns show Title Case values
✅ Work arrangement shows exactly 3 options
✅ Location values are clean and formatted
✅ Tags display in Title Case
✅ Special terms formatted correctly (API, B2B, etc.)

### Functionality
✅ All filters work correctly with formatted values
✅ Search + filters combination works
✅ URL state persistence works
✅ Database queries return correct results
✅ No breaking changes to existing functionality

---

## 📝 Notes

### Why Format at Display Time?
- **Database integrity:** Keep raw values in database for consistency
- **Query flexibility:** Can still query using raw values
- **Backward compatibility:** No database migration needed
- **Separation of concerns:** Display logic separate from data logic

### Why Reverse Mapping?
- User selects "Remote" from dropdown
- Need to query database for "remote", "remote_us", "remote_only", etc.
- Reverse mapping ensures all variations are captured
- Maintains accurate filtering

### Alternative Approach (NOT Recommended)
- Store formatted values in database
- **Problems:** Requires database migration, breaks existing queries, harder to maintain

---

## 🔄 Rollback Plan

If issues arise:
1. **Revert Phase 3** (query changes) - Restores functionality
2. **Keep Phase 2** (display changes) - Visual improvements remain
3. **Fix issues** with query logic
4. **Re-deploy Phase 3** after fixes

---

**END OF IMPLEMENTATION PLAN**
