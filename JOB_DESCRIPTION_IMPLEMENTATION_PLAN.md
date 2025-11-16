# Job Description Formatting - Implementation Plan

## OVERVIEW

This plan implements the 3-phase intelligent parser approach to fix job description formatting issues.

**Estimated Implementation Time:** 4-6 hours
**Risk Level:** Low (backwards compatible, isolated changes)
**Testing Required:** High (comprehensive test coverage needed)

---

## IMPLEMENTATION PHASES

### **PHASE 1: Fix Critical Whitespace Issues** ⏱️ 1-2 hours
> Quick win - fixes the most visible problem (wall of text)

### **PHASE 2: Implement Block-Based Architecture** ⏱️ 2-3 hours
> Foundation for reliable parsing

### **PHASE 3: Enhanced Structure Detection** ⏱️ 1-2 hours
> Intelligent section organization

### **PHASE 4: Testing & Validation** ⏱️ 1 hour
> Ensure quality and prevent regressions

---

# PHASE 1: FIX CRITICAL WHITESPACE ISSUES

## Goal
Stop destroying paragraph breaks, preserve basic formatting

## Files Modified
- `src/lib/html-parser.ts`

## Changes Required

### Change 1.1: Fix `cleanText()` function

**Location:** `src/lib/html-parser.ts:318-325`

**Current (BROKEN):**
```typescript
function cleanText(text: string): string {
  if (!text) return '';

  return text
    .replace(/\s+/g, ' ') // ❌ DESTROYS paragraph breaks
    .replace(/\n\s*\n/g, '\n') // ❌ Already destroyed by previous line
    .trim();
}
```

**New (FIXED):**
```typescript
function cleanText(text: string): string {
  if (!text) return '';

  // Split into lines, clean each line, then rejoin
  // This preserves intentional line breaks while cleaning whitespace
  return text
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim()) // Clean whitespace within each line
    .join('\n')
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .trim();
}
```

### Change 1.2: Fix `extractTextContent()` final cleaning

**Location:** `src/lib/html-parser.ts:287-296`

**Current (PROBLEMATIC):**
```typescript
let text = result.join('');

// Clean up extra whitespace and newlines
text = text
  .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines to double
  .replace(/^\s+|\s+$/g, '') // Trim start and end
  .replace(/\s+/g, ' ') // ❌ DESTROYS all newlines (including the ones we just preserved!)
  .replace(/\n\s+/g, '\n') // Remove spaces after newlines
  .replace(/\s+\n/g, '\n'); // Remove spaces before newlines

return text;
```

**New (FIXED):**
```typescript
let text = result.join('');

// Clean up whitespace while preserving structure
text = text
  .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines (paragraph breaks)
  .replace(/^\s+|\s+$/g, '') // Trim start and end
  .split('\n') // Split into lines
  .map(line => line.replace(/\s+/g, ' ').trim()) // Clean whitespace WITHIN lines only
  .join('\n') // Rejoin with newlines preserved
  .replace(/\n\s+/g, '\n') // Remove spaces after newlines
  .replace(/\s+\n/g, '\n'); // Remove spaces before newlines

return text;
```

### Change 1.3: Improve paragraph handling in `extractTextContent()`

**Location:** `src/lib/html-parser.ts:223-230`

**Current:**
```typescript
if (tagName === 'p' || tagName === 'div') {
  // Add paragraph breaks
  if (result.length > 0 && result[result.length - 1] !== '\n\n') {
    result.push('\n\n');
  }
  // Process children
  Array.from(element.childNodes).forEach(processNode);
  result.push('\n\n');
}
```

**New (Improved):**
```typescript
if (tagName === 'p' || tagName === 'div') {
  // Add paragraph break before (if needed)
  if (result.length > 0) {
    const lastItem = result[result.length - 1];
    if (lastItem !== '\n\n' && lastItem !== '\n') {
      result.push('\n\n');
    }
  }
  // Process children
  Array.from(element.childNodes).forEach(processNode);
  // Add paragraph break after (if content was added)
  const lastItem = result[result.length - 1];
  if (lastItem && lastItem !== '\n\n' && lastItem !== '\n') {
    result.push('\n\n');
  }
}
```

## Testing for Phase 1

Create test file: `src/lib/__tests__/html-parser.phase1.test.ts`

```typescript
import { parseJobDescription } from '../html-parser'

describe('Phase 1: Whitespace Preservation', () => {
  test('preserves paragraph breaks in simple HTML', () => {
    const input = '<p>Paragraph 1</p><p>Paragraph 2</p><p>Paragraph 3</p>'
    const result = parseJobDescription(input)

    expect(result.cleanText).toContain('Paragraph 1')
    expect(result.cleanText).toContain('Paragraph 2')
    expect(result.cleanText).toContain('Paragraph 3')

    // Should have paragraph breaks (not all on one line)
    const paragraphs = result.cleanText.split('\n\n').filter(p => p.trim())
    expect(paragraphs.length).toBeGreaterThanOrEqual(3)
  })

  test('preserves paragraph breaks in plain text', () => {
    const input = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3'
    const result = parseJobDescription(input)

    const paragraphs = result.cleanText.split('\n\n').filter(p => p.trim())
    expect(paragraphs.length).toBeGreaterThanOrEqual(3)
  })

  test('normalizes excessive whitespace', () => {
    const input = '<p>Text    with     many      spaces</p>'
    const result = parseJobDescription(input)

    expect(result.cleanText).not.toContain('    ')
    expect(result.cleanText).toContain('Text with many spaces')
  })

  test('preserves list formatting', () => {
    const input = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
    const result = parseJobDescription(input)

    expect(result.cleanText).toContain('• Item 1')
    expect(result.cleanText).toContain('• Item 2')
    expect(result.cleanText).toContain('• Item 3')
  })
})
```

**Run tests:**
```bash
npm test -- html-parser.phase1.test.ts
```

## Validation
- [ ] Wall of text issue resolved
- [ ] Paragraph breaks visible in job descriptions
- [ ] Lists still render correctly
- [ ] No regression in structured content

---

# PHASE 2: IMPLEMENT BLOCK-BASED ARCHITECTURE

## Goal
Replace string-based parsing with structured block-based data model

## Files Modified
- `src/lib/html-parser.ts` (add new interfaces and functions)
- `src/components/JobContent.tsx` (update to use blocks)

## Step 2.1: Define Block Interfaces

**Add to:** `src/lib/html-parser.ts` (top of file)

```typescript
/**
 * Content block types for structured parsing
 */
export type BlockType = 'header' | 'paragraph' | 'list' | 'empty_line'

export interface ContentBlock {
  type: BlockType
  content: string | string[] // string for text, array for lists
  level?: number // for headers (1-3)
  metadata?: {
    isStrong?: boolean // was this bold in original?
    listStyle?: 'bullet' | 'number'
    originalTag?: string // original HTML tag
  }
}

export interface NormalizedContent {
  blocks: ContentBlock[]
  rawBlocks: ContentBlock[] // before section organization
}

// Update existing interface
export interface ParsedJobContent {
  cleanText: string // keep for backwards compatibility
  sections: {
    title: string
    content: string
    type: 'text' | 'list' | 'header'
  }[]
  hasStructure: boolean
  // NEW: Add block-based representation
  normalized?: NormalizedContent
}
```

## Step 2.2: Implement Block Extraction

**Add new function to:** `src/lib/html-parser.ts`

```typescript
/**
 * Extracts content as structured blocks instead of flattened text
 */
export function extractContentBlocks(element: Element | Document): ContentBlock[] {
  const blocks: ContentBlock[] = []

  const processElement = (el: Element): void => {
    const tagName = el.tagName.toLowerCase()

    // Headers
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      const level = parseInt(tagName[1])
      const text = cleanText(el.textContent || '')
      if (text) {
        blocks.push({
          type: 'header',
          content: text,
          level: Math.min(level, 3), // Cap at level 3 for consistency
          metadata: { originalTag: tagName }
        })
      }
      return
    }

    // Lists
    if (tagName === 'ul' || tagName === 'ol') {
      const items = Array.from(el.querySelectorAll('li'))
        .map(li => cleanText(li.textContent || ''))
        .filter(item => item.length > 0)

      if (items.length > 0) {
        blocks.push({
          type: 'list',
          content: items,
          metadata: {
            listStyle: tagName === 'ol' ? 'number' : 'bullet',
            originalTag: tagName
          }
        })
      }
      return
    }

    // Paragraphs and divs
    if (tagName === 'p' || tagName === 'div') {
      // Check if this contains a bold header
      const strong = el.querySelector('strong, b')
      const text = cleanText(el.textContent || '')

      if (text) {
        // Check if entire content is bold (likely a header)
        if (strong && cleanText(strong.textContent || '') === text && text.length < 100) {
          blocks.push({
            type: 'header',
            content: text,
            level: 2,
            metadata: { isStrong: true, originalTag: tagName }
          })
        } else {
          blocks.push({
            type: 'paragraph',
            content: text,
            metadata: { originalTag: tagName }
          })
        }
      }
      return
    }

    // Line breaks
    if (tagName === 'br') {
      // Add empty line block
      blocks.push({ type: 'empty_line', content: '' })
      return
    }

    // For other elements, process children recursively
    Array.from(el.children).forEach(processElement)
  }

  // Start processing
  if (element.nodeType === Node.DOCUMENT_NODE) {
    const doc = element as Document
    if (doc.body) {
      Array.from(doc.body.children).forEach(processElement)
    }
  } else {
    Array.from(element.children).forEach(processElement)
  }

  return blocks
}
```

## Step 2.3: Detect Text-Based Lists

**Add new function to:** `src/lib/html-parser.ts`

```typescript
/**
 * Detects if text content is a list based on bullet patterns
 */
function detectTextList(text: string): { isList: boolean; items: string[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  if (lines.length < 2) {
    return { isList: false, items: [] }
  }

  // Common bullet markers
  const bulletPattern = /^[•\-\*\+▪◦▸▹●○]\s+(.+)$/
  const bulletLines = lines.filter(l => bulletPattern.test(l))

  // If majority of lines have bullets, it's a list
  if (bulletLines.length >= lines.length * 0.6) {
    const items = lines.map(l => {
      const match = l.match(bulletPattern)
      return match ? match[1].trim() : l
    })
    return { isList: true, items }
  }

  // Check for numbered lists
  const numberPattern = /^\d+[\.)]\s+(.+)$/
  const numberedLines = lines.filter(l => numberPattern.test(l))

  if (numberedLines.length >= lines.length * 0.6) {
    const items = lines.map(l => {
      const match = l.match(numberPattern)
      return match ? match[1].trim() : l
    })
    return { isList: true, items }
  }

  return { isList: false, items: [] }
}
```

## Step 2.4: Detect Text-Based Headers

**Add new function to:** `src/lib/html-parser.ts`

```typescript
/**
 * Determines if text is likely a header
 */
function isLikelyHeader(text: string): boolean {
  const trimmed = text.trim()

  // Too long to be a header
  if (trimmed.length > 100) return false

  // Too short to be meaningful
  if (trimmed.length < 3) return false

  // Ends with colon (common header pattern)
  if (trimmed.endsWith(':')) return true

  // ALL CAPS (minimum 4 characters to avoid false positives)
  if (trimmed.length >= 4 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    return true
  }

  // Common section keywords
  const headerKeywords = [
    /^about( the)?( role| position| job)?$/i,
    /^responsibilities$/i,
    /^requirements$/i,
    /^qualifications$/i,
    /^benefits$/i,
    /^what (you'll do|we offer|you bring)$/i,
    /^(key|your) responsibilities$/i,
    /^(our|the) team$/i,
    /^overview$/i,
  ]

  return headerKeywords.some(pattern => pattern.test(trimmed))
}
```

## Step 2.5: Update parseJobDescription to include blocks

**Modify:** `src/lib/html-parser.ts` - `parseJobDescription()` function

Add at the end of the function (before return):

```typescript
// NEW: Extract block-based representation
const blocks = extractContentBlocks(doc)

// Post-process blocks to detect lists in paragraphs
const processedBlocks: ContentBlock[] = []
for (const block of blocks) {
  if (block.type === 'paragraph') {
    const listCheck = detectTextList(block.content as string)
    if (listCheck.isList) {
      // Convert paragraph to list
      processedBlocks.push({
        type: 'list',
        content: listCheck.items,
        metadata: { listStyle: 'bullet' }
      })
    } else if (isLikelyHeader(block.content as string)) {
      // Convert paragraph to header
      processedBlocks.push({
        type: 'header',
        content: block.content,
        level: 2,
        metadata: { ...block.metadata }
      })
    } else {
      processedBlocks.push(block)
    }
  } else {
    processedBlocks.push(block)
  }
}

return {
  cleanText: cleanTextContent,
  sections,
  hasStructure,
  normalized: {
    blocks: processedBlocks,
    rawBlocks: blocks
  }
}
```

## Step 2.6: Update JobContent to use blocks

**Modify:** `src/components/JobContent.tsx`

Add new rendering function:

```typescript
const renderBlock = (block: ContentBlock, index: number) => {
  switch (block.type) {
    case 'header':
      const HeadingTag = block.level === 1 ? 'h2' : 'h3'
      return (
        <HeadingTag
          key={index}
          className="text-base sm:text-lg font-semibold text-white mt-4 sm:mt-6 mb-2 sm:mb-3"
        >
          {block.content}
        </HeadingTag>
      )

    case 'paragraph':
      return (
        <p
          key={index}
          className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base"
        >
          {renderInlineFormatting(block.content as string)}
        </p>
      )

    case 'list':
      return (
        <div key={index} className="space-y-2 mb-4">
          {(block.content as string[]).map((item, i) => (
            <div key={i} className="flex items-start">
              <span className="text-blue-400 mr-2 mt-1 flex-shrink-0">•</span>
              <span className="text-gray-300 leading-relaxed text-sm sm:text-base">
                {renderInlineFormatting(item)}
              </span>
            </div>
          ))}
        </div>
      )

    case 'empty_line':
      return <div key={index} className="h-2" />

    default:
      return null
  }
}
```

Add fallback rendering for block-based content:

```typescript
// After existing structured rendering, before unstructured fallback, add:

// NEW: If we have block-based content, use it
if (parsedContent.normalized?.blocks && parsedContent.normalized.blocks.length > 0) {
  return (
    <div className={`max-w-none ${className}`}>
      <div className="text-gray-300 text-sm sm:text-base">
        {parsedContent.normalized.blocks.map((block, index) =>
          renderBlock(block, index)
        )}
      </div>
    </div>
  )
}
```

## Testing for Phase 2

Create test file: `src/lib/__tests__/html-parser.phase2.test.ts`

```typescript
import { parseJobDescription } from '../html-parser'

describe('Phase 2: Block-Based Architecture', () => {
  test('extracts header blocks', () => {
    const input = '<h2>About the Role</h2><p>Description</p>'
    const result = parseJobDescription(input)

    expect(result.normalized?.blocks).toBeDefined()
    const blocks = result.normalized!.blocks

    expect(blocks[0].type).toBe('header')
    expect(blocks[0].content).toBe('About the Role')
    expect(blocks[0].level).toBe(2)
  })

  test('detects bold text as headers', () => {
    const input = '<p><strong>Responsibilities</strong></p><p>Do things</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    expect(blocks[0].type).toBe('header')
    expect(blocks[0].content).toBe('Responsibilities')
  })

  test('extracts list blocks', () => {
    const input = '<ul><li>Item 1</li><li>Item 2</li></ul>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    expect(blocks[0].type).toBe('list')
    expect(blocks[0].content).toEqual(['Item 1', 'Item 2'])
  })

  test('detects text-based lists', () => {
    const input = '<p>• Item 1\n• Item 2\n• Item 3</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    const listBlock = blocks.find(b => b.type === 'list')
    expect(listBlock).toBeDefined()
    expect(listBlock!.content).toHaveLength(3)
  })

  test('preserves paragraph blocks', () => {
    const input = '<p>Paragraph 1</p><p>Paragraph 2</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    const paraBlocks = blocks.filter(b => b.type === 'paragraph')
    expect(paraBlocks).toHaveLength(2)
  })
})
```

## Validation
- [ ] Blocks extracted correctly
- [ ] Headers detected (h1-h6 and bold text)
- [ ] Lists detected (HTML and text-based)
- [ ] Paragraphs preserved
- [ ] Block rendering works in JobContent

---

# PHASE 3: ENHANCED STRUCTURE DETECTION

## Goal
Intelligently organize blocks into sections

## Step 3.1: Expand Section Keywords

**Modify:** `src/lib/html-parser.ts` - `extractJobSections()` function

Replace the `sectionKeywords` object with comprehensive patterns:

```typescript
const sectionKeywords = {
  about: [
    'about', 'company', 'overview', 'who we are', 'our mission',
    'about the role', 'about the position', 'about the job',
    'role overview', 'position overview', 'job overview',
    'about us', 'our company', 'the company', 'background'
  ],
  responsibilities: [
    'responsibilities', 'what you\'ll do', 'duties', 'role', 'you will',
    'your role', 'day to day', 'key responsibilities', 'in this role',
    'what you will do', 'what you\'ll be doing', 'your responsibilities',
    'key accountabilities', 'primary responsibilities', 'main duties',
    'day-to-day', 'daily responsibilities', 'core responsibilities',
    'job duties', 'primary functions', 'key duties'
  ],
  requirements: [
    'requirements', 'qualifications', 'what you bring', 'skills',
    'experience', 'what we\'re looking for', 'ideal candidate',
    'you have', 'minimum requirements', 'must have', 'required skills',
    'required qualifications', 'required experience', 'what we need',
    'what you need', 'you should have', 'you must have',
    'minimum qualifications', 'basic qualifications', 'preferred qualifications',
    'education', 'credentials', 'technical skills', 'desired skills'
  ],
  benefits: [
    'benefits', 'what we offer', 'compensation', 'perks',
    'why join', 'package', 'rewards', 'why work', 'why us',
    'our benefits', 'employee benefits', 'we offer', 'you\'ll get',
    'compensation package', 'salary', 'total rewards', 'perks and benefits',
    'what you\'ll get', 'joining us'
  ]
}
```

## Step 3.2: Implement Pattern-Based Section Detection

**Add new function to:** `src/lib/html-parser.ts`

```typescript
/**
 * Determines section type based on header content
 */
function detectSectionType(headerText: string): keyof JobSections | null {
  const lower = headerText.toLowerCase().trim().replace(/[:\.\?!]/g, '')

  const sectionPatterns = {
    about: [
      /^about/,
      /overview$/,
      /^(the |our )?(company|role|position|job)/,
      /who we are/,
      /our mission/
    ],
    responsibilities: [
      /responsibilit/,
      /what you'?(ll| will)/,
      /your (role|duties)/,
      /(key|primary|main) (duties|accountabilities)/,
      /day(to| to |-)day/,
      /in this role/
    ],
    requirements: [
      /requirement/,
      /qualification/,
      /what (you|we)/,
      /skills/,
      /experience/,
      /(must|should) have/,
      /ideal candidate/,
      /you (have|bring)/
    ],
    benefits: [
      /benefit/,
      /what we offer/,
      /compensation/,
      /perks/,
      /why (join|work|us)/,
      /package/,
      /rewards/
    ]
  }

  for (const [section, patterns] of Object.entries(sectionPatterns)) {
    if (patterns.some(pattern => pattern.test(lower))) {
      return section as keyof JobSections
    }
  }

  return null
}
```

## Step 3.3: Organize Blocks into Sections

**Add new function to:** `src/lib/html-parser.ts`

```typescript
/**
 * Organizes blocks into logical sections
 */
export function organizeBlocksIntoSections(blocks: ContentBlock[]): JobSections {
  const sections: JobSections = { other: '' }

  let currentSection: keyof JobSections | null = null
  let currentBlocks: ContentBlock[] = []

  const commitSection = () => {
    if (currentBlocks.length === 0) return

    if (currentSection && currentSection !== 'other') {
      // Convert blocks to appropriate format
      const listBlocks = currentBlocks.filter(b => b.type === 'list')
      const textBlocks = currentBlocks.filter(b => b.type === 'paragraph')

      if (['responsibilities', 'requirements', 'benefits'].includes(currentSection)) {
        // Array-based sections
        const items: string[] = []
        listBlocks.forEach(block => {
          items.push(...(block.content as string[]))
        })
        sections[currentSection] = items.length > 0 ? items : undefined
      } else if (currentSection === 'about') {
        // Text-based section
        const text = textBlocks
          .map(b => b.content as string)
          .filter(t => t.length > 0)
          .join('\n\n')
        sections.about = text || undefined
      }
    } else {
      // Add to 'other'
      const text = currentBlocks
        .filter(b => b.type !== 'empty_line')
        .map(b => {
          if (b.type === 'header') return `**${b.content}**`
          if (b.type === 'list') return (b.content as string[]).map(i => `• ${i}`).join('\n')
          return b.content as string
        })
        .join('\n\n')
      sections.other += (sections.other ? '\n\n' : '') + text
    }

    currentBlocks = []
  }

  for (const block of blocks) {
    if (block.type === 'header') {
      // Commit previous section
      commitSection()

      // Detect new section
      currentSection = detectSectionType(block.content as string)
      currentBlocks = []
    } else {
      currentBlocks.push(block)
    }
  }

  // Commit final section
  commitSection()

  return sections
}
```

## Step 3.4: Integrate Section Organization

**Modify:** `src/lib/html-parser.ts` - `extractJobSections()` function

Replace current implementation with:

```typescript
export function extractJobSections(content: ParsedJobContent): JobSections {
  // If we have block-based content, use it
  if (content.normalized?.blocks && content.normalized.blocks.length > 0) {
    return organizeBlocksIntoSections(content.normalized.blocks)
  }

  // Fall back to original logic for backwards compatibility
  // ... (keep existing implementation)
}
```

## Testing for Phase 3

Create test file: `src/lib/__tests__/html-parser.phase3.test.ts`

```typescript
import { parseJobDescription, extractJobSections } from '../html-parser'

describe('Phase 3: Structure Detection', () => {
  test('detects About section from bold header', () => {
    const input = '<p><strong>About the Role</strong></p><p>We are hiring...</p>'
    const parsed = parseJobDescription(input)
    const sections = extractJobSections(parsed)

    expect(sections.about).toBeDefined()
    expect(sections.about).toContain('We are hiring')
  })

  test('detects Responsibilities from various header formats', () => {
    const tests = [
      '<h2>Responsibilities</h2>',
      '<p><strong>What You\'ll Do</strong></p>',
      '<h3>Your Responsibilities</h3>',
      '<p><strong>KEY RESPONSIBILITIES</strong></p>'
    ]

    tests.forEach(headerHtml => {
      const input = `${headerHtml}<ul><li>Task 1</li><li>Task 2</li></ul>`
      const parsed = parseJobDescription(input)
      const sections = extractJobSections(parsed)

      expect(sections.responsibilities).toBeDefined()
      expect(sections.responsibilities).toHaveLength(2)
    })
  })

  test('detects Requirements section', () => {
    const input = `
      <p><strong>What We're Looking For</strong></p>
      <p>• 5+ years experience<br>• Bachelor's degree</p>
    `
    const parsed = parseJobDescription(input)
    const sections = extractJobSections(parsed)

    expect(sections.requirements).toBeDefined()
    expect(sections.requirements?.length).toBeGreaterThan(0)
  })

  test('detects Benefits section', () => {
    const input = `
      <h3>What We Offer</h3>
      <ul>
        <li>Competitive salary</li>
        <li>Health insurance</li>
        <li>Remote work</li>
      </ul>
    `
    const parsed = parseJobDescription(input)
    const sections = extractJobSections(parsed)

    expect(sections.benefits).toBeDefined()
    expect(sections.benefits).toHaveLength(3)
  })

  test('handles mixed section formats', () => {
    const input = `
      <h2>About</h2>
      <p>Great company</p>
      <p><strong>Responsibilities:</strong></p>
      <p>• Lead projects<br>• Mentor team</p>
      <h3>Requirements</h3>
      <ul><li>Skill 1</li><li>Skill 2</li></ul>
    `
    const parsed = parseJobDescription(input)
    const sections = extractJobSections(parsed)

    expect(sections.about).toBeDefined()
    expect(sections.responsibilities).toBeDefined()
    expect(sections.requirements).toBeDefined()
  })
})
```

## Validation
- [ ] Section keywords properly matched
- [ ] Bold headers detected as section breaks
- [ ] Content properly organized into sections
- [ ] Multiple section header formats supported
- [ ] Fallback to 'other' for unrecognized content

---

# PHASE 4: TESTING & VALIDATION

## Step 4.1: Comprehensive Integration Tests

Create test file: `src/lib/__tests__/html-parser.integration.test.ts`

```typescript
import { parseJobDescription, extractJobSections } from '../html-parser'

describe('HTML Parser Integration Tests', () => {
  test('handles well-structured HTML', () => {
    const input = `
      <h2>About the Role</h2>
      <p>We're seeking a Product Manager to join our team.</p>
      <h3>Responsibilities</h3>
      <ul>
        <li>Define product strategy</li>
        <li>Lead cross-functional teams</li>
        <li>Analyze market trends</li>
      </ul>
      <h3>Requirements</h3>
      <ul>
        <li>5+ years in product management</li>
        <li>Strong analytical skills</li>
        <li>Excellent communication</li>
      </ul>
      <h3>Benefits</h3>
      <ul>
        <li>Competitive salary</li>
        <li>Health insurance</li>
        <li>Remote work options</li>
      </ul>
    `

    const parsed = parseJobDescription(input)
    const sections = extractJobSections(parsed)

    expect(sections.about).toContain('Product Manager')
    expect(sections.responsibilities).toHaveLength(3)
    expect(sections.requirements).toHaveLength(3)
    expect(sections.benefits).toHaveLength(3)
    expect(parsed.hasStructure).toBe(true)
  })

  test('handles pseudo-structured HTML (bold headers)', () => {
    const input = `
      <p>We're hiring a Senior Product Manager.</p>
      <p><strong>What You'll Do</strong></p>
      <p>• Define product roadmap<br>• Lead sprints<br>• Collaborate with engineering</p>
      <p><strong>What You Bring</strong></p>
      <p>• 7+ years experience<br>• Technical background<br>• Leadership skills</p>
    `

    const parsed = parseJobDescription(input)
    const sections = extractJobSections(parsed)

    expect(sections.responsibilities).toBeDefined()
    expect(sections.responsibilities?.length).toBeGreaterThanOrEqual(3)
    expect(sections.requirements).toBeDefined()
    expect(sections.requirements?.length).toBeGreaterThanOrEqual(3)
  })

  test('handles plain text with natural breaks', () => {
    const input = `
      <p>Product Manager - Remote

We're looking for an experienced Product Manager to drive our platform vision.

Responsibilities:
• Develop product strategy
• Manage product lifecycle
• Collaborate with stakeholders

Requirements:
• 5+ years product management
• Data-driven mindset
• Strong communication skills

We offer competitive compensation and fully remote work.</p>
    `

    const parsed = parseJobDescription(input)
    const sections = extractJobSections(parsed)

    // Should preserve paragraph breaks
    const paragraphCount = (parsed.cleanText.match(/\n\n/g) || []).length
    expect(paragraphCount).toBeGreaterThan(0)

    // Should detect lists
    expect(parsed.normalized?.blocks.some(b => b.type === 'list')).toBe(true)
  })

  test('handles minimal HTML (just paragraphs)', () => {
    const input = `
      <p>Join our product team as a Product Manager.</p>
      <p>You will be responsible for defining product vision and working with engineering to deliver features.</p>
      <p>We're looking for someone with 5+ years of experience and strong technical skills.</p>
      <p>We offer great benefits and remote work flexibility.</p>
    `

    const parsed = parseJobDescription(input)

    // Should preserve all 4 paragraphs
    const blocks = parsed.normalized?.blocks.filter(b => b.type === 'paragraph')
    expect(blocks?.length).toBeGreaterThanOrEqual(4)

    // Should NOT be wall of text
    expect(parsed.cleanText).toContain('\n')
  })

  test('handles edge cases', () => {
    // Empty description
    expect(parseJobDescription('').cleanText).toBe('')

    // Very short description
    const short = parseJobDescription('<p>Hiring PM</p>')
    expect(short.cleanText).toBe('Hiring PM')

    // Special characters and HTML entities
    const entities = parseJobDescription('<p>Salary: $100k–$150k</p>')
    expect(entities.cleanText).toContain('$100k')
  })
})
```

## Step 4.2: Visual Regression Testing

Create test descriptions file: `test-job-descriptions.json`

```json
[
  {
    "name": "greenhouse-structured",
    "source": "Greenhouse",
    "description": "<div class=\"content\"><h2>About Acme Corp</h2><p>We're a fast-growing startup...</p><h3>Responsibilities</h3><ul><li>Lead product development</li><li>Define roadmap</li></ul><h3>Requirements</h3><ul><li>5+ years experience</li><li>Technical background</li></ul></div>"
  },
  {
    "name": "lever-bold-headers",
    "source": "Lever",
    "description": "<div><p><b>About the Role</b></p><p>Join our team...</p><p><b>What You'll Do</b></p><p>- Build product strategy<br/>- Lead teams<br/>- Drive growth</p></div>"
  },
  {
    "name": "minimal-paragraphs",
    "source": "Custom",
    "description": "<p>Product Manager position.</p><p>Responsible for product lifecycle.</p><p>Requires 5 years experience.</p><p>Remote work available.</p>"
  }
]
```

Manual testing checklist:
- [ ] Load test descriptions in local environment
- [ ] Verify formatting looks correct
- [ ] Check paragraph spacing
- [ ] Verify section headers appear
- [ ] Confirm lists render properly
- [ ] Test mobile responsive layout

## Step 4.3: Performance Testing

Add performance test:

```typescript
test('parses large descriptions efficiently', () => {
  const largeHtml = '<p>Large paragraph</p>'.repeat(1000)

  const start = performance.now()
  const parsed = parseJobDescription(largeHtml)
  const duration = performance.now() - start

  expect(duration).toBeLessThan(100) // Should parse in < 100ms
  expect(parsed.normalized?.blocks.length).toBeGreaterThan(0)
})
```

## Final Validation Checklist

- [ ] All Phase 1 tests passing
- [ ] All Phase 2 tests passing
- [ ] All Phase 3 tests passing
- [ ] Integration tests passing
- [ ] No TypeScript errors
- [ ] No console errors in development
- [ ] Job descriptions render correctly on detail pages
- [ ] Mobile layout works
- [ ] Performance is acceptable (< 100ms parse time)
- [ ] No regression in existing functionality

---

## ROLLOUT STRATEGY

### Option A: Direct Deployment
- Implement all phases
- Deploy to production
- Monitor for issues

**Risk:** Medium
**Recommended for:** Small user base, easy rollback capability

### Option B: Gradual Rollout
- Phase 1 → Deploy → Monitor (1-2 days)
- Phase 2 → Deploy → Monitor (1-2 days)
- Phase 3 → Deploy → Monitor (1-2 days)

**Risk:** Low
**Recommended for:** Large user base, need for stability

### Option C: Feature Flag
- Implement all phases
- Use environment variable to enable/disable
- Test in production with flag off
- Enable for subset of users
- Full rollout

**Risk:** Very Low
**Recommended for:** Enterprise, need for A/B testing

---

## POST-DEPLOYMENT MONITORING

### Metrics to Track:
1. **Parse errors** - Any job descriptions failing to parse
2. **Rendering time** - Performance impact
3. **User feedback** - Support tickets about formatting
4. **Section detection rate** - % of jobs with detected sections

### Logging:
Add temporary logging to track:
```typescript
console.log('[JobDescription] Parsed:', {
  hasStructure: parsed.hasStructure,
  blockCount: parsed.normalized?.blocks.length,
  sections: Object.keys(extractJobSections(parsed))
})
```

Remove after 1 week of stable operation.

---

## ROLLBACK PROCEDURE

If issues occur:

### Quick Rollback (< 5 minutes):
```bash
git revert HEAD
git push origin claude/understand-app-functionality-01WYS5peBSAwf1fZ18n2Ce3A
```

### Partial Rollback:
Revert specific phase commits individually

### Emergency Fix:
Add feature flag to toggle new vs. old parser

---

## SUCCESS CRITERIA

### Minimum (Phase 1):
- ✅ No more "wall of text" issues
- ✅ Paragraph breaks preserved
- ✅ Lists render correctly

### Target (Phases 1-2):
- ✅ All minimum criteria met
- ✅ Block-based architecture working
- ✅ Headers detected from bold text
- ✅ Text-based lists detected

### Stretch (Phases 1-3):
- ✅ All target criteria met
- ✅ 80%+ section detection rate
- ✅ Consistent formatting across all sources
- ✅ Zero user complaints about formatting

---

## TIMELINE ESTIMATE

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1 | 1-2 hours | 1-2 hours |
| Phase 2 | 2-3 hours | 3-5 hours |
| Phase 3 | 1-2 hours | 4-7 hours |
| Phase 4 | 1 hour | 5-8 hours |
| **Total** | **5-8 hours** | **5-8 hours** |

**Realistic estimate with breaks: 1-2 days**

---

## NEXT STEPS

Ready to begin implementation? Recommend starting with:

1. ✅ Review this plan
2. ✅ Get user approval
3. 🚀 Start Phase 1 implementation
4. ✅ Test Phase 1
5. 🚀 Continue with Phase 2...

Would you like me to proceed with Phase 1 implementation?
