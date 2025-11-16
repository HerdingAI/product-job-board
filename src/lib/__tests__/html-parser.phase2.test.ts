import { parseJobDescription, extractJobSections } from '../html-parser'

describe('Phase 2: Block-Based Architecture', () => {
  test('extracts header blocks from h2 tags', () => {
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
    expect(blocks[0].metadata?.isStrong).toBe(true)
  })

  test('extracts list blocks from ul/li', () => {
    const input = '<ul><li>Item 1</li><li>Item 2</li></ul>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    expect(blocks[0].type).toBe('list')
    expect(blocks[0].content).toEqual(['Item 1', 'Item 2'])
  })

  test('detects text-based lists with bullets', () => {
    const input = '<p>• Item 1<br>• Item 2<br>• Item 3</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    const listBlock = blocks.find(b => b.type === 'list')
    expect(listBlock).toBeDefined()
    expect((listBlock!.content as string[]).length).toBeGreaterThanOrEqual(3)
  })

  test('detects text-based lists with dashes', () => {
    const input = '<p>- First item<br>- Second item<br>- Third item</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    const listBlock = blocks.find(b => b.type === 'list')
    expect(listBlock).toBeDefined()
  })

  test('detects numbered lists', () => {
    const input = '<p>1) First<br>2) Second<br>3) Third</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    const listBlock = blocks.find(b => b.type === 'list')
    expect(listBlock).toBeDefined()
  })

  test('detects headers ending with colon', () => {
    const input = '<p>Requirements:</p><p>Some text</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    expect(blocks[0].type).toBe('header')
    expect(blocks[0].content).toBe('Requirements:')
  })

  test('detects ALL CAPS headers', () => {
    const input = '<p>REQUIREMENTS</p><p>Some text</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    expect(blocks[0].type).toBe('header')
    expect(blocks[0].content).toBe('REQUIREMENTS')
  })

  test('preserves paragraph blocks', () => {
    const input = '<p>Paragraph 1</p><p>Paragraph 2</p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    const paraBlocks = blocks.filter(b => b.type === 'paragraph')
    expect(paraBlocks.length).toBeGreaterThanOrEqual(2)
  })

  test('handles mixed content types', () => {
    const input = `
      <h2>About</h2>
      <p>Company description</p>
      <p><strong>Responsibilities</strong></p>
      <ul>
        <li>Lead projects</li>
        <li>Mentor team</li>
      </ul>
    `
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks

    // Should have headers
    const headers = blocks.filter(b => b.type === 'header')
    expect(headers.length).toBeGreaterThanOrEqual(2)

    // Should have paragraphs
    const paragraphs = blocks.filter(b => b.type === 'paragraph')
    expect(paragraphs.length).toBeGreaterThanOrEqual(1)

    // Should have lists
    const lists = blocks.filter(b => b.type === 'list')
    expect(lists.length).toBeGreaterThanOrEqual(1)
  })

  test('handles ordered lists', () => {
    const input = '<ol><li>First</li><li>Second</li><li>Third</li></ol>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    expect(blocks[0].type).toBe('list')
    expect(blocks[0].metadata?.listStyle).toBe('number')
  })

  test('handles unordered lists', () => {
    const input = '<ul><li>One</li><li>Two</li></ul>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    expect(blocks[0].type).toBe('list')
    expect(blocks[0].metadata?.listStyle).toBe('bullet')
  })

  test('does not treat long text as header', () => {
    const longText = 'This is a very long paragraph that should not be considered a header because it exceeds one hundred characters in length and is clearly body text'
    const input = `<p>${longText}</p>`
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    expect(blocks[0].type).toBe('paragraph')
  })

  test('handles empty elements gracefully', () => {
    const input = '<p></p><p>Content</p><p></p>'
    const result = parseJobDescription(input)

    const blocks = result.normalized!.blocks
    const paraBlocks = blocks.filter(b => b.type === 'paragraph' && b.content)
    expect(paraBlocks.length).toBeGreaterThanOrEqual(1)
  })

  test('extracts blocks and raw blocks', () => {
    const input = '<h2>Title</h2><p>Text</p>'
    const result = parseJobDescription(input)

    expect(result.normalized?.blocks).toBeDefined()
    expect(result.normalized?.rawBlocks).toBeDefined()
    expect(result.normalized!.blocks.length).toBeGreaterThan(0)
    expect(result.normalized!.rawBlocks.length).toBeGreaterThan(0)
  })

  test('processes blocks correctly', () => {
    const input = '<p>• Item 1<br>• Item 2</p>'
    const result = parseJobDescription(input)

    // rawBlocks should have paragraph
    const rawParagraphs = result.normalized!.rawBlocks.filter(b => b.type === 'paragraph')
    expect(rawParagraphs.length).toBeGreaterThan(0)

    // processedBlocks should convert to list
    const processedLists = result.normalized!.blocks.filter(b => b.type === 'list')
    expect(processedLists.length).toBeGreaterThan(0)
  })

  test('handles complex real-world structure', () => {
    const input = `
      <div>
        <h2>Product Manager - Remote</h2>
        <p>We're looking for an experienced Product Manager to drive our platform vision.</p>

        <p><strong>Responsibilities:</strong></p>
        <p>
          • Develop product strategy<br>
          • Manage product lifecycle<br>
          • Collaborate with stakeholders
        </p>

        <h3>Requirements</h3>
        <ul>
          <li>5+ years product management</li>
          <li>Data-driven mindset</li>
          <li>Strong communication skills</li>
        </ul>

        <p>We offer competitive compensation and fully remote work.</p>
      </div>
    `

    const result = parseJobDescription(input)
    const blocks = result.normalized!.blocks

    // Should have multiple headers
    const headers = blocks.filter(b => b.type === 'header')
    expect(headers.length).toBeGreaterThanOrEqual(3)

    // Should have paragraphs
    const paragraphs = blocks.filter(b => b.type === 'paragraph')
    expect(paragraphs.length).toBeGreaterThanOrEqual(2)

    // Should have lists
    const lists = blocks.filter(b => b.type === 'list')
    expect(lists.length).toBeGreaterThanOrEqual(2)
  })
})
