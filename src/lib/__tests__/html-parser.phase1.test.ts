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

  test('normalizes excessive whitespace within paragraphs', () => {
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

  test('handles mixed content with headers and paragraphs', () => {
    const input = `
      <h2>About</h2>
      <p>First paragraph about the company.</p>
      <p>Second paragraph with more details.</p>
      <h2>Requirements</h2>
      <p>We are looking for candidates with experience.</p>
    `
    const result = parseJobDescription(input)

    // Should have paragraph breaks between sections
    expect(result.cleanText).toContain('\n')

    // Should not be a wall of text
    const lines = result.cleanText.split('\n').filter(l => l.trim())
    expect(lines.length).toBeGreaterThan(3)
  })

  test('handles div-based paragraphs', () => {
    const input = `
      <div>First section</div>
      <div>Second section</div>
      <div>Third section</div>
    `
    const result = parseJobDescription(input)

    const sections = result.cleanText.split('\n\n').filter(s => s.trim())
    expect(sections.length).toBeGreaterThanOrEqual(3)
  })

  test('handles br tags correctly', () => {
    const input = '<p>Line 1<br>Line 2<br>Line 3</p>'
    const result = parseJobDescription(input)

    // Should preserve line breaks
    expect(result.cleanText).toContain('\n')

    // Should have 3 lines
    const lines = result.cleanText.split('\n').filter(l => l.trim())
    expect(lines.length).toBeGreaterThanOrEqual(3)
  })

  test('does not create wall of text from multiple paragraphs', () => {
    const input = `
      <p>We are seeking a Product Manager to join our team.</p>
      <p>You will be responsible for defining product vision and strategy.</p>
      <p>Requirements include 5+ years of experience in product management.</p>
      <p>We offer competitive salary and remote work options.</p>
    `
    const result = parseJobDescription(input)

    // Check that we have paragraph breaks (double newlines)
    const hasDoubleNewlines = result.cleanText.includes('\n\n')
    expect(hasDoubleNewlines).toBe(true)

    // Should not be one long line
    const singleLine = !result.cleanText.includes('\n')
    expect(singleLine).toBe(false)

    // Count paragraphs
    const paragraphs = result.cleanText.split('\n\n').filter(p => p.trim())
    expect(paragraphs.length).toBeGreaterThanOrEqual(4)
  })

  test('handles empty elements gracefully', () => {
    const input = '<p></p><p>Content</p><p></p>'
    const result = parseJobDescription(input)

    expect(result.cleanText.trim()).toBe('Content')
  })

  test('limits consecutive newlines to maximum of 2', () => {
    const input = '<p>Para 1</p>\n\n\n\n\n<p>Para 2</p>'
    const result = parseJobDescription(input)

    // Should not have more than 2 consecutive newlines
    expect(result.cleanText).not.toContain('\n\n\n')
  })
})
