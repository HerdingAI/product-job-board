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

  // Remove script tags, style tags, and other unwanted elements
  const cleanHtml = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');

  // Parse DOM structure
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, 'text/html');
  
  const sections: ParsedJobContent['sections'] = [];
  let hasStructure = false;

  // Extract headers and their content
  const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  if (headers.length > 0) {
    hasStructure = true;
    
    headers.forEach((header, index) => {
      const headerText = cleanText(header.textContent || '');
      if (!headerText) return;

      // Get content between this header and the next one
      const content = getContentBetweenHeaders(header, headers[index + 1]);
      
      sections.push({
        title: headerText,
        content: content.text,
        type: content.hasLists ? 'list' : 'text'
      });
    });
  }

  // If no clear structure, treat as single content block
  if (!hasStructure) {
    const bodyContent = extractTextContent(doc.body || doc);
    
    sections.push({
      title: '',
      content: bodyContent,
      type: 'text'
    });
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
        // Add paragraph breaks
        if (result.length > 0 && result[result.length - 1] !== '\n\n') {
          result.push('\n\n');
        }
        // Process children
        Array.from(element.childNodes).forEach(processNode);
        result.push('\n\n');
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
  
  // Clean up extra whitespace and newlines
  text = text
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines to double
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
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
 * Cleans text content by removing extra whitespace and formatting
 */
function cleanText(text: string): string {
  if (!text) return '';

  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
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
