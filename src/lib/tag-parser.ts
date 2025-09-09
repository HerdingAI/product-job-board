import { Tag, AppJob } from './types'
import { SupabaseJob } from './supabase'

/**
 * Tag Parsing System for Product Careers Job Board
 * Extracts structured tags from various job data fields
 */

// Define tag categories and their properties
export const TAG_CATEGORIES = {
  'core-pm': {
    label: 'Core PM Skills',
    color: 'bg-blue-100 text-blue-800',
    priority: 1
  },
  'technical': {
    label: 'Technical Skills', 
    color: 'bg-green-100 text-green-800',
    priority: 2
  },
  'domain': {
    label: 'Domain Expertise',
    color: 'bg-purple-100 text-purple-800', 
    priority: 3
  }
} as const

// Core PM Skills mapping
const CORE_PM_SKILLS_MAP: Record<string, string> = {
  'product strategy': 'Product Strategy',
  'product management': 'Product Management',
  'roadmap': 'Roadmap Planning',
  'user research': 'User Research',
  'data analysis': 'Data Analysis',
  'a/b testing': 'A/B Testing',
  'analytics': 'Analytics',
  'stakeholder management': 'Stakeholder Management',
  'requirements gathering': 'Requirements Gathering',
  'prioritization': 'Prioritization',
  'market research': 'Market Research',
  'competitive analysis': 'Competitive Analysis',
  'user experience': 'UX/UI',
  'product discovery': 'Product Discovery',
  'product launch': 'Product Launch',
  'go-to-market': 'Go-to-Market',
  'growth': 'Growth Strategy',
  'metrics': 'Metrics & KPIs',
  'experimentation': 'Experimentation',
  'customer insights': 'Customer Insights'
}

// Technical Skills mapping
const TECHNICAL_SKILLS_MAP: Record<string, string> = {
  'sql': 'SQL',
  'python': 'Python',
  'r': 'R',
  'apis': 'APIs',
  'machine learning': 'Machine Learning',
  'ai': 'AI/ML',
  'data science': 'Data Science',
  'tableau': 'Tableau',
  'powerbi': 'PowerBI',
  'excel': 'Excel',
  'javascript': 'JavaScript',
  'html': 'HTML/CSS',
  'aws': 'AWS',
  'gcp': 'Google Cloud',
  'azure': 'Azure',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'git': 'Git',
  'jira': 'JIRA',
  'confluence': 'Confluence',
  'figma': 'Figma',
  'sketch': 'Sketch'
}

// Domain Expertise mapping  
const DOMAIN_EXPERTISE_MAP: Record<string, string> = {
  'b2b saas': 'B2B SaaS',
  'fintech': 'Fintech',
  'healthtech': 'Healthtech',
  'edtech': 'Edtech',
  'e-commerce': 'E-commerce',
  'marketplace': 'Marketplace',
  'social': 'Social Media',
  'gaming': 'Gaming',
  'enterprise': 'Enterprise Software',
  'consumer': 'Consumer Products',
  'mobile': 'Mobile Apps',
  'web': 'Web Applications',
  'saas': 'SaaS',
  'platform': 'Platform Products',
  'api': 'API Products',
  'data': 'Data Products',
  'ai/ml': 'AI/ML Products',
  'blockchain': 'Blockchain/Crypto',
  'iot': 'IoT',
  'devtools': 'Developer Tools'
}

// --- HELPER FUNCTIONS ---

/**
 * Parse comma-separated or array fields into structured tags
 */
function parseCommaSeparated(
  field: string | string[] | null | undefined, 
  category: keyof typeof TAG_CATEGORIES,
  skillMap?: Record<string, string>
): Tag[] {
  if (!field) return []
  
  const values = Array.isArray(field) ? field : field.split(',')
  
  return values
    .map(value => value.trim().toLowerCase())
    .filter(value => value.length > 0)
    .map(value => {
      const label = skillMap?.[value] || value.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
      
      return {
        label,
        category,
        color: TAG_CATEGORIES[category].color
      }
    })
}

/**
 * Extract keywords from job description text using NLP-like approach
 */
function extractKeywordsFromText(text: string, skillMap: Record<string, string>): string[] {
  if (!text) return []
  
  const cleanText = text.toLowerCase()
  const keywords: string[] = []
  
  // Look for skill keywords in the text
  Object.keys(skillMap).forEach(skill => {
    if (cleanText.includes(skill)) {
      keywords.push(skill)
    }
  })
  
  return keywords
}

/**
 * Main function to extract all tags from a Supabase job record
 */
export function extractTagsFromJob(job: SupabaseJob): Tag[] {
  const allTags: Tag[] = []
  
  // 1. Core PM Skills (from dedicated field + description analysis)
  const coreSkillsFromField = parseCommaSeparated(job.core_pm_skills, 'core-pm', CORE_PM_SKILLS_MAP)
  const coreSkillsFromDesc = extractKeywordsFromText(job.description || '', CORE_PM_SKILLS_MAP)
    .map(skill => ({
      label: CORE_PM_SKILLS_MAP[skill],
      category: 'core-pm' as const,
      color: TAG_CATEGORIES['core-pm'].color
    }))
  
  allTags.push(...coreSkillsFromField)
  allTags.push(...coreSkillsFromDesc)
  
  // 2. Technical Skills (from dedicated field + description analysis)
  const techSkillsFromField = parseCommaSeparated(job.technical_skills, 'technical', TECHNICAL_SKILLS_MAP)
  const techSkillsFromDesc = extractKeywordsFromText(job.description || '', TECHNICAL_SKILLS_MAP)
    .map(skill => ({
      label: TECHNICAL_SKILLS_MAP[skill],
      category: 'technical' as const,
      color: TAG_CATEGORIES.technical.color
    }))
  
  allTags.push(...techSkillsFromField)
  allTags.push(...techSkillsFromDesc)
  
  // 3. Domain Expertise
  if (job.domain_expertise) {
    allTags.push(...parseCommaSeparated(job.domain_expertise, 'domain', DOMAIN_EXPERTISE_MAP))
  }
  
  // Also check product_domain field
  if (job.product_domain) {
    const domainTag = DOMAIN_EXPERTISE_MAP[job.product_domain.toLowerCase()] || job.product_domain
    allTags.push({
      label: domainTag,
      category: 'domain',
      color: TAG_CATEGORIES.domain.color
    })
  }
  
  // Remove duplicates based on label and category combination
  const uniqueTags = allTags.filter((tag, index, self) => 
    index === self.findIndex(t => t.label === tag.label && t.category === tag.category)
  )
  
  // Sort by category priority and then alphabetically by label
  return uniqueTags.sort((a, b) => {
    const priorityDiff = TAG_CATEGORIES[a.category].priority - TAG_CATEGORIES[b.category].priority
    if (priorityDiff !== 0) return priorityDiff
    return a.label.localeCompare(b.label)
  })
}

/**
 * Filter tags by category for UI display
 */
export function filterTagsByCategory(tags: Tag[], category: keyof typeof TAG_CATEGORIES): Tag[] {
  return tags.filter(tag => tag.category === category)
}

/**
 * Get all unique tags from a list of jobs for filter options
 */
export function getAllUniqueTagsFromJobs(jobs: AppJob[]): {
  corePm: Tag[]
  technical: Tag[]
  domain: Tag[]
} {
  const allTags = jobs.flatMap(job => job.tags)
  
  return {
    corePm: [...new Map(filterTagsByCategory(allTags, 'core-pm').map(tag => [tag.label, tag])).values()],
    technical: [...new Map(filterTagsByCategory(allTags, 'technical').map(tag => [tag.label, tag])).values()],
    domain: [...new Map(filterTagsByCategory(allTags, 'domain').map(tag => [tag.label, tag])).values()]
  }
}

/**
 * Convert tag to search-friendly string for URL params
 */
export function tagToUrlParam(tag: Tag): string {
  return `${tag.category}:${tag.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
}

/**
 * Parse tag from URL parameter string
 */
export function tagFromUrlParam(param: string): Tag | null {
  const [category, labelSlug] = param.split(':')
  if (!category || !labelSlug || !(category in TAG_CATEGORIES)) return null
  
  const label = labelSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return {
    label,
    category: category as keyof typeof TAG_CATEGORIES,
    color: TAG_CATEGORIES[category as keyof typeof TAG_CATEGORIES].color
  }
}
