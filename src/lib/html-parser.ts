interface ParsedJobContent {
  cleanText: string;
  sections: {
    title: string;
    content: string;
    type: 'text' | 'list' | 'header';
  }[];
  hasStructure: boolean;
}

interface JobSections {
  overview?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  about?: string;
  other: string;
}

/**
 * Text-based content block (SSR-safe, no DOM dependencies)
 */
interface TextBlock {
  type: 'header' | 'paragraph' | 'list';
  content: string | string[];
}

/**
 * Detects if a line is likely a section header based on patterns
 * SSR-SAFE: No browser dependencies
 */
function isTextHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 100) return false;

  // Common header patterns
  const headerPatterns = [
    /^About (the )?(Team|Role|Position|Job|Company)/i,
    /^(Your |Key |Main )?Responsibilities/i,
    /^(What )?You'?[rll] (do|be doing|excited about)/i,
    /^We'?re excited about you/i,
    /^(What |Why )?We Offer/i,
    /^Requirements?/i,
    /^Qualifications?/i,
    /^Benefits?/i,
    /^Compensation/i,
    /^Notice to Applicants/i,
    /^Statement of/i,
    /^Our (Team|Mission|Culture)/i,
  ];

  // Check if line matches header patterns
  if (headerPatterns.some(pattern => pattern.test(trimmed))) {
    return true;
  }

  // Check if line ends with ellipsis (common in headers like "You will…")
  if (trimmed.endsWith('…') || trimmed.endsWith('...')) {
    return true;
  }

  return false;
}

/**
 * Detects if lines form a bullet list
 * SSR-SAFE: No browser dependencies
 */
function isTextList(lines: string[]): boolean {
  if (lines.length < 2) return false;

  const bulletPattern = /^[•\-\*\+▪◦▸▹●○]\s/;
  const bulletCount = lines.filter(l => bulletPattern.test(l.trim())).length;

  // If 60% or more lines have bullets, it's a list
  return bulletCount >= lines.length * 0.6;
}

/**
 * Parse plain text into structured blocks
 * SSR-SAFE: No browser dependencies, works with formatless text
 */
function parseTextToBlocks(text: string): TextBlock[] {
  if (!text) return [];

  const blocks: TextBlock[] = [];

  // Split by double newlines to get potential paragraphs
  const chunks = text.split(/\n\n+/).map(chunk => chunk.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);

    if (lines.length === 0) continue;

    // Check if this chunk is a header
    if (lines.length === 1 && isTextHeader(lines[0])) {
      blocks.push({
        type: 'header',
        content: lines[0]
      });
      continue;
    }

    // Check if this chunk is a list
    if (isTextList(lines)) {
      const bulletPattern = /^[•\-\*\+▪◦▸▹●○]\s*/;
      const items = lines.map(line => line.replace(bulletPattern, '').trim());
      blocks.push({
        type: 'list',
        content: items
      });
      continue;
    }

    // Check if first line is a header followed by content
    if (lines.length > 1 && isTextHeader(lines[0])) {
      blocks.push({
        type: 'header',
        content: lines[0]
      });

      // Add remaining lines as paragraph or list
      const remainingLines = lines.slice(1);
      if (isTextList(remainingLines)) {
        const bulletPattern = /^[•\-\*\+▪◦▸▹●○]\s*/;
        const items = remainingLines.map(line => line.replace(bulletPattern, '').trim());
        blocks.push({
          type: 'list',
          content: items
        });
      } else {
        blocks.push({
          type: 'paragraph',
          content: remainingLines.join(' ')
        });
      }
      continue;
    }

    // Otherwise, treat as paragraph
    blocks.push({
      type: 'paragraph',
      content: lines.join(' ')
    });
  }

  return blocks;
}

/**
 * Strip basic HTML tags from text (SSR-safe)
 */
function stripHtmlTags(html: string): string {
  if (!html) return '';

  // Remove script, style, and comment tags
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Replace common HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Parses raw HTML job descriptions into clean, structured content
 * Handles various HTML structures from different job boards
 */
export function parseJobDescription(rawHtml: string): ParsedJobContent {
  if (!rawHtml) {
    return {
      cleanText: '',
      sections: [],
      hasStructure: false
    };
  }

  // Strip HTML tags to get plain text (SSR-safe)
  const plainText = stripHtmlTags(rawHtml);

  // Parse text into structured blocks
  const blocks = parseTextToBlocks(plainText);

  // Convert blocks to sections format
  const sections: ParsedJobContent['sections'] = [];
  let hasStructure = blocks.some(b => b.type === 'header');

  for (const block of blocks) {
    if (block.type === 'header') {
      sections.push({
        title: block.content as string,
        content: '',
        type: 'header'
      });
    } else if (block.type === 'list') {
      sections.push({
        title: '',
        content: (block.content as string[]).map(item => `• ${item}`).join('\n'),
        type: 'list'
      });
    } else {
      sections.push({
        title: '',
        content: block.content as string,
        type: 'text'
      });
    }
  }

  // Generate clean text version
  const cleanTextContent = sections
    .map(section => `${section.title ? section.title + '\n' : ''}${section.content}`)
    .join('\n\n')
    .trim();

  return {
    cleanText: cleanTextContent,
    sections,
    hasStructure
  };
}

/**
 * Extracts job sections based on common patterns and keywords
 */
export function extractJobSections(content: ParsedJobContent): JobSections {
  const sections: JobSections = {
    other: ''
  };

  // Keywords for section identification
  const sectionKeywords = {
    about: ['about', 'company', 'overview', 'who we are', 'our mission'],
    responsibilities: [
      'responsibilities', 'what you\'ll do', 'duties', 'role', 'you will',
      'your role', 'day to day', 'key responsibilities', 'in this role'
    ],
    requirements: [
      'requirements', 'qualifications', 'what you bring', 'skills',
      'experience', 'what we\'re looking for', 'ideal candidate',
      'you have', 'minimum requirements', 'must have'
    ],
    benefits: [
      'benefits', 'what we offer', 'compensation', 'perks',
      'why join', 'package', 'rewards'
    ]
  };

  // First pass: try to match sections by headers
  content.sections.forEach(section => {
    const titleLower = section.title.toLowerCase();
    let matched = false;

    // Check each section type
    Object.entries(sectionKeywords).forEach(([sectionType, keywords]) => {
      if (matched) return;
      
      const isMatch = keywords.some(keyword => 
        titleLower.includes(keyword.toLowerCase())
      );
      
      if (isMatch) {
        matched = true;
        
        if (sectionType === 'responsibilities' || sectionType === 'requirements') {
          // Convert to array format for list-based sections
          sections[sectionType] = parseListContent(section.content);
        } else if (sectionType === 'about') {
          sections.about = section.content;
        } else if (sectionType === 'benefits') {
          sections.benefits = parseListContent(section.content); // Store as array for consistency
        }
      }
    });

    // If no match, add to 'other'
    if (!matched) {
      const sectionText = section.title ? 
        `${section.title}\n${section.content}` : 
        section.content;
      
      sections.other += (sections.other ? '\n\n' : '') + sectionText;
    }
  });

  // Second pass: if we have unstructured content, try to extract from full text
  if (!content.hasStructure && content.cleanText) {
    sections.other = content.cleanText;
  }

  return sections;
}

/**
 * Gets content between two headers
 */
function getContentBetweenHeaders(
  startHeader: Element, 
  endHeader: Element | null
): { text: string; hasLists: boolean } {
  const content: string[] = [];
  let hasLists = false;
  let currentElement = startHeader.nextElementSibling;

  while (currentElement && currentElement !== endHeader) {
    if (currentElement.tagName.match(/^H[1-6]$/)) {
      break; // Stop at another header
    }

    if (currentElement.tagName === 'UL' || currentElement.tagName === 'OL') {
      hasLists = true;
      // Extract list items
      const listItems = Array.from(currentElement.querySelectorAll('li'))
        .map(li => `• ${cleanText(li.textContent || '')}`)
        .filter(item => item.trim() !== '•');
      
      content.push(...listItems);
    } else {
      const text = cleanText(currentElement.textContent || '');
      if (text) {
        content.push(text);
      }
    }

    currentElement = currentElement.nextElementSibling;
  }

  return {
    text: content.join('\n').trim(),
    hasLists
  };
}

/**
 * Extracts clean text content from an element, preserving structure
 */
function extractTextContent(element: Element | Document): string {
  if (!element) return '';

  const result: string[] = [];

  // Process all child nodes recursively
  const processNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        result.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Handle different HTML elements
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
      } else if (tagName === 'br') {
        result.push('\n');
      } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        // Add header formatting
        result.push('\n\n');
        const text = element.textContent?.trim();
        if (text) {
          result.push(`**${text}**`);
        }
        result.push('\n\n');
      } else if (tagName === 'ul' || tagName === 'ol') {
        // Handle lists
        result.push('\n');
        Array.from(element.children).forEach(li => {
          if (li.tagName.toLowerCase() === 'li') {
            const text = li.textContent?.trim();
            if (text) {
              result.push(`• ${text}\n`);
            }
          }
        });
        result.push('\n');
      } else if (tagName === 'li') {
        // Individual list item (in case not caught by ul/ol)
        const text = element.textContent?.trim();
        if (text) {
          result.push(`• ${text}\n`);
        }
      } else if (tagName === 'strong' || tagName === 'b') {
        const text = element.textContent?.trim();
        if (text) {
          result.push(`**${text}**`);
        }
      } else if (tagName === 'em' || tagName === 'i') {
        const text = element.textContent?.trim();
        if (text) {
          result.push(`*${text}*`);
        }
      } else {
        // For other elements, just process children
        Array.from(element.childNodes).forEach(processNode);
      }
    }
  };

  // Start processing from the root element
  if (element.nodeType === Node.DOCUMENT_NODE) {
    const doc = element as Document;
    if (doc.body) {
      Array.from(doc.body.childNodes).forEach(processNode);
    }
  } else {
    Array.from(element.childNodes).forEach(processNode);
  }

  // Join and clean up the result
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
}

/**
 * Parses list content into array format
 */
function parseListContent(content: string): string[] {
  if (!content) return [];

  // Split by bullet points or newlines
  const items = content
    .split(/\n|•/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && item !== '•');

  return items.length > 0 ? items : [content];
}

/**
 * Cleans text content by removing extra whitespace while preserving paragraph breaks
 */
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

/**
 * Extracts clean, text-only content from HTML for previews (like job cards)
 * Removes all HTML tags, images, and other non-text content
 */
export function extractCleanTextPreview(htmlContent: string, maxLength = 200): string {
  if (!htmlContent) return '';
  
  // Create a temporary DOM element to parse HTML safely
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove any script, style, img, video, etc. tags
    const unwantedElements = tempDiv.querySelectorAll('script, style, img, video, audio, iframe, object, embed');
    unwantedElements.forEach(el => el.remove());
    
    // Get clean text content
    let cleanContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean and limit the text
    cleanContent = cleanText(cleanContent);
    
    if (cleanContent.length > maxLength) {
      cleanContent = cleanContent.slice(0, maxLength).trim() + '…';
    }
    
    return cleanContent;
  }
  
  // Server-side fallback: use regex to strip HTML tags
  const textOnly = htmlContent
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove styles
    .replace(/<img[^>]*>/gi, '') // Remove images
    .replace(/<[^>]*>/g, ' ') // Remove all other HTML tags
    .replace(/&[a-z]+;/gi, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return textOnly.length > maxLength ? textOnly.slice(0, maxLength).trim() + '…' : textOnly;
}

/**
 * Formats content for display with proper line breaks and structure
 */
export function formatContentForDisplay(content: string): string {
  if (!content) return '';

  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Checks if content appears to be structured (has headers, lists, etc.)
 */
export function hasStructuredContent(rawHtml: string): boolean {
  if (!rawHtml) return false;

  const hasHeaders = /<h[1-6][^>]*>/i.test(rawHtml);
  const hasLists = /<[uo]l[^>]*>/i.test(rawHtml);
  const hasDivs = /<div[^>]*class[^>]*>/i.test(rawHtml);

  return hasHeaders || hasLists || hasDivs;
}
