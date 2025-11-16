# Job Description Formatting - Solution Approach

## OBJECTIVE
Transform any job description format (HTML, plain text, pseudo-HTML) into **consistently formatted, readable content** with proper structure, spacing, and organization.

---

## DESIGN PRINCIPLES

### 1. **Functional** - Must handle all common input formats
### 2. **Reliable** - Consistent output regardless of input variability
### 3. **Simple** - Minimal complexity, easy to maintain and debug
### 4. **Safe** - No XSS vulnerabilities, proper HTML sanitization

---

## SOLUTION APPROACH: Multi-Pass Intelligent Parser

### Overview
Replace the current single-pass parser with a **3-phase intelligent parsing system**:

```
Phase 1: NORMALIZE
  ↓ Convert all formats to unified intermediate format

Phase 2: STRUCTURE
  ↓ Detect and organize content into sections

Phase 3: RENDER
  ↓ Generate consistent React components
```

---

## PHASE 1: NORMALIZATION

### Goal: Convert ANY input format to unified intermediate format

### Approach:
1. **Detect Input Type**
   - HTML with semantic structure (`<h1-h6>`, `<ul>`, `<p>`)
   - HTML with pseudo-structure (`<strong>` headers, `<br>` lists)
   - Minimal HTML (just `<p>` tags)
   - Plain text with natural breaks
   - Mixed/malformed HTML

2. **Intelligent HTML Parsing**
   ```typescript
   - Parse HTML with DOMParser
   - Preserve paragraph boundaries
   - Convert <br> sequences to paragraph breaks
   - Detect bold text used as headers
   - Extract lists (proper <ul>/<li> OR text patterns)
   - Decode HTML entities
   - Strip dangerous elements (scripts, styles, iframes)
   ```

3. **Plain Text Enhancement**
   ```typescript
   - Detect natural paragraph breaks (double newlines)
   - Identify manual bullets (•, -, *, numbers)
   - Recognize all-caps or bold markers as potential headers
   - Preserve intentional line breaks
   ```

4. **Output: Unified Intermediate Format**
   ```typescript
   interface NormalizedContent {
     blocks: ContentBlock[]
   }

   interface ContentBlock {
     type: 'header' | 'paragraph' | 'list' | 'empty_line'
     content: string | string[] // string for text, array for lists
     level?: number // for headers (1-3)
     metadata?: {
       isStrong?: boolean // was this bold in original?
       listStyle?: 'bullet' | 'number'
     }
   }
   ```

### Key Improvement: **NO WHITESPACE DESTRUCTION**
- Preserve paragraph breaks throughout
- Use structured blocks instead of flattened text
- Maintain formatting metadata

---

## PHASE 2: STRUCTURE DETECTION

### Goal: Organize blocks into logical sections

### Approach:
1. **Enhanced Section Recognition**
   ```typescript
   const SECTION_PATTERNS = {
     about: [
       /about( the)? (role|position|job)/i,
       /company overview/i,
       /who we are/i,
       /our mission/i,
       /overview/i,
       /^about$/i
     ],
     responsibilities: [
       /responsibilities/i,
       /what you('ll| will) (do|be doing)/i,
       /your (role|duties)/i,
       /key (responsibilities|accountabilities)/i,
       /day(to| to |-)day/i,
       /in this role/i,
       /you will/i
     ],
     requirements: [
       /requirements/i,
       /qualifications/i,
       /what (you|we)('re| are) looking for/i,
       /skills( needed)?/i,
       /experience( required)?/i,
       /you (have|bring|must have)/i,
       /ideal candidate/i,
       /minimum (requirements|qualifications)/i
     ],
     benefits: [
       /benefits/i,
       /what we offer/i,
       /compensation( package)?/i,
       /perks( and benefits)?/i,
       /why join( us)?/i,
       /we offer/i,
       /package/i
     ]
   }
   ```

2. **Smart Header Detection**
   - Look for actual headers (h1-h6)
   - Look for bold text that matches section patterns
   - Look for ALL_CAPS text
   - Look for text followed by colons ("Requirements:")
   - Consider text length (short = likely header)

3. **Section Organization**
   ```typescript
   interface OrganizedContent {
     sections: {
       about?: Section
       responsibilities?: Section
       requirements?: Section
       benefits?: Section
       other: Section[]
     }
   }

   interface Section {
     title: string
     blocks: ContentBlock[]
   }
   ```

4. **Fallback for Unstructured Content**
   - If no sections detected, apply smart defaults:
     - First 2-3 paragraphs = "About"
     - Lists in middle = "Responsibilities"
     - Lists at end = "Requirements" or "Benefits"
   - Use heuristics based on content and position

---

## PHASE 3: RENDERING

### Goal: Generate consistent, beautiful React output

### Approach:
1. **Structured Output** (when sections detected)
   ```tsx
   <Section title="About the Role">
     <Paragraphs />
   </Section>
   <Section title="Responsibilities">
     <BulletList items={...} color="blue" />
   </Section>
   <Section title="Requirements">
     <BulletList items={...} color="blue" />
   </Section>
   <Section title="Benefits">
     <BulletList items={...} color="emerald" />
   </Section>
   ```

2. **Unstructured Output** (fallback)
   ```tsx
   <FormattedContent>
     {blocks.map(block => renderBlock(block))}
   </FormattedContent>
   ```

3. **Block Rendering**
   - Headers → `<h3>` with consistent styling
   - Paragraphs → `<p>` with proper spacing
   - Lists → Bullet items with icons
   - Empty lines → Spacing elements

4. **Consistent Styling**
   - All sections use same visual hierarchy
   - Consistent spacing between elements
   - Mobile-responsive typography
   - Proper text color and contrast

---

## TECHNICAL IMPLEMENTATION DETAILS

### 1. **Safe HTML Handling**

**Option A: DOMPurify (Recommended)**
```typescript
import DOMPurify from 'isomorphic-dompurify'

const cleanHtml = DOMPurify.sanitize(rawHtml, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'],
  ALLOWED_ATTR: []
})
```

**Option B: Enhanced Manual Sanitization**
```typescript
// Continue using DOMParser but with improved text extraction
// No dangerouslySetInnerHTML, only text content
```

**Recommendation:** Stick with current approach (Option B) since:
- Already using DOMParser + text extraction
- No direct HTML injection
- Avoids new dependency
- Just need to fix the whitespace handling

### 2. **Whitespace Preservation**

**Current (BROKEN):**
```typescript
text = text.replace(/\s+/g, ' ') // Destroys everything
```

**New (FIXED):**
```typescript
// Preserve paragraph breaks but normalize inline whitespace
text = text
  .split('\n\n') // Split into paragraphs
  .map(para => para
    .replace(/\s+/g, ' ') // Normalize whitespace WITHIN paragraphs
    .trim()
  )
  .filter(para => para.length > 0)
  .join('\n\n') // Rejoin with paragraph breaks
```

### 3. **Block-Based Architecture**

**Current:** String manipulation → loses structure

**New:** Block-based data structure → preserves structure

```typescript
// Instead of:
cleanText: string // "Para 1\n\nPara 2\n\n• Item 1\n• Item 2"

// Use:
blocks: [
  { type: 'paragraph', content: 'Para 1' },
  { type: 'paragraph', content: 'Para 2' },
  { type: 'list', content: ['Item 1', 'Item 2'] }
]
```

### 4. **Header Detection Algorithm**

```typescript
function isLikelyHeader(block: string): boolean {
  // Short length (headers are typically concise)
  if (block.length > 100) return false

  // Ends with colon
  if (block.trim().endsWith(':')) return true

  // ALL CAPS
  if (block === block.toUpperCase() && block.length > 3) return true

  // Matches known section patterns
  for (const patterns of Object.values(SECTION_PATTERNS)) {
    if (patterns.some(p => p.test(block))) return true
  }

  // Starts with number (numbered headers)
  if (/^\d+[\.)]\s/.test(block)) return true

  return false
}
```

### 5. **List Detection Algorithm**

```typescript
function detectList(text: string): string[] | null {
  // Split into lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  // Check if majority of lines start with bullet markers
  const bulletMarkers = /^[•\-\*\+▪◦▸▹●○]\s/
  const bulletLines = lines.filter(l => bulletMarkers.test(l))

  if (bulletLines.length >= lines.length * 0.6) {
    // Likely a list
    return lines.map(l => l.replace(bulletMarkers, '').trim())
  }

  // Check for numbered lists
  const numberedPattern = /^\d+[\.)]\s/
  const numberedLines = lines.filter(l => numberedPattern.test(l))

  if (numberedLines.length >= lines.length * 0.6) {
    return lines.map(l => l.replace(numberedPattern, '').trim())
  }

  return null
}
```

---

## FILE STRUCTURE

### Modified Files:
1. **`src/lib/html-parser.ts`** - Complete rewrite with 3-phase approach
2. **`src/components/JobContent.tsx`** - Updated to use new parser output

### New Files:
1. **`src/lib/__tests__/html-parser.test.ts`** - Comprehensive tests
2. **`src/lib/html-normalizer.ts`** - (Optional) Separate normalization logic

---

## TESTING STRATEGY

### Test Cases:

1. **Well-structured HTML**
   - Input: Semantic HTML with h1-h6, ul/li, p tags
   - Expected: Clean section organization

2. **Pseudo-structured HTML**
   - Input: Bold headers, br-separated lists
   - Expected: Detect structure, organize sections

3. **Minimal HTML**
   - Input: Just paragraph tags
   - Expected: Preserve paragraphs, apply smart defaults

4. **Plain text**
   - Input: Natural paragraph breaks, manual bullets
   - Expected: Convert to structured format

5. **Mixed format**
   - Input: Combination of HTML and plain text
   - Expected: Normalize and structure

6. **Edge cases**
   - Empty descriptions
   - Very short descriptions (< 100 chars)
   - Very long descriptions (> 10000 chars)
   - Special characters and HTML entities
   - Malformed HTML

### Test Data:
Create `test-descriptions.json` with real-world examples from various job boards:
- Greenhouse format
- Lever format
- Workable format
- LinkedIn format
- Indeed format
- Custom company career pages

---

## BACKWARDS COMPATIBILITY

### Approach:
- New parser outputs same interface as current parser
- `JobContent.tsx` receives enhanced data structure
- Gradual rollout possible with feature flag

```typescript
// Feature flag approach (optional)
const USE_ENHANCED_PARSER = process.env.NEXT_PUBLIC_USE_ENHANCED_PARSER === 'true'

const parsedContent = USE_ENHANCED_PARSER
  ? parseJobDescriptionEnhanced(rawHtml)
  : parseJobDescription(rawHtml)
```

---

## MIGRATION PATH

### Phase 1: Fix Critical Issues
- Fix whitespace destruction
- Fix paragraph preservation
- Deploy and test

### Phase 2: Enhance Structure Detection
- Add bold-header detection
- Expand section keywords
- Add list pattern detection

### Phase 3: Add Intelligence
- Implement smart defaults for unstructured content
- Add heuristic-based section assignment
- Improve edge case handling

---

## SUCCESS METRICS

### Before (Current State):
- ❌ Wall of text for many descriptions
- ❌ Missing paragraph breaks
- ❌ Lost formatting
- ❌ Sections not detected

### After (Target State):
- ✅ Proper paragraph spacing for 100% of descriptions
- ✅ Section organization for 80%+ of descriptions
- ✅ Consistent formatting across all descriptions
- ✅ Lists properly rendered
- ✅ Headers clearly visible

---

## WHY THIS APPROACH IS BEST

### ✅ **Functional:**
- Handles all common formats (HTML, pseudo-HTML, plain text)
- Robust pattern matching for structure detection
- Intelligent fallbacks for edge cases

### ✅ **Reliable:**
- Block-based architecture prevents data loss
- Multiple detection strategies (headers, keywords, heuristics)
- Comprehensive test coverage

### ✅ **Simple:**
- Clear 3-phase separation of concerns
- Each phase has single responsibility
- Easy to debug and extend
- Builds on existing DOMParser approach

### ✅ **Safe:**
- No new dependencies needed (can use current DOMParser)
- Text-only rendering (no dangerouslySetInnerHTML)
- Explicit element whitelisting

---

## ALTERNATIVE APPROACHES CONSIDERED

### ❌ Option 1: Markdown Conversion
Convert HTML → Markdown → Parse
- **Rejected:** Adds complexity, potential data loss, external dependency

### ❌ Option 2: ML/AI-Based Parser
Use AI to detect structure
- **Rejected:** Overkill, adds latency, unpredictable

### ❌ Option 3: Format-Specific Parsers
Detect source (Greenhouse, Lever) and use custom parser
- **Rejected:** Unmaintainable, doesn't scale

### ✅ Option 4: Enhanced Intelligent Parser (SELECTED)
Multi-phase parsing with pattern matching and heuristics
- **Selected:** Best balance of power, simplicity, and reliability

---

## NEXT: Implementation Plan

See `JOB_DESCRIPTION_IMPLEMENTATION_PLAN.md` for detailed step-by-step implementation.
