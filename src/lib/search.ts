import { FilterState } from '@/lib/types'

export interface RpcJobRow {
  id: string
  title: string | null
  company: string | null
  description: string | null
  search_rank?: number
  [key: string]: unknown
}

export interface SearchResult {
  jobs: (RpcJobRow | Record<string, unknown>)[]
  pagination: {
    page: number
    limit: number
    offset: number
    hasNextPage: boolean
  }
  searchTerm: string
  filters: Record<string, unknown>
}

export interface SearchParams {
  searchTerm: string
  filters: FilterState
  page?: number
  limit?: number
}

export async function searchJobs({ searchTerm, filters, page = 1, limit = 50 }: SearchParams): Promise<SearchResult> {
  const params = new URLSearchParams()
  if (searchTerm?.trim()) params.set('q', searchTerm.trim())
  params.set('page', String(page))
  params.set('limit', String(limit))

  if (filters.seniority) params.set('seniority', filters.seniority)
  if (filters.location) params.set('location', filters.location)
  if (filters.workArrangement) params.set('workArrangement', filters.workArrangement)
  if (filters.companyStage?.length) params.set('companyStage', filters.companyStage.join(','))
  if (filters.productLifecycle?.length) params.set('productLifecycle', filters.productLifecycle.join(','))
  if (filters.productDomain?.length) params.set('productDomain', filters.productDomain.join(','))
  if (filters.managementScope?.length) params.set('managementScope', filters.managementScope.join(','))
  if (filters.industryVertical?.length) params.set('industryVertical', filters.industryVertical.join(','))
  if (filters.experienceBucket?.length) params.set('experienceBucket', filters.experienceBucket.join(','))
  if (filters.domainExpertise?.length) params.set('domainExpertise', filters.domainExpertise.join(','))
  if (filters.salaryMin) params.set('salaryMin', String(filters.salaryMin))
  if (filters.salaryMax) params.set('salaryMax', String(filters.salaryMax))

  const res = await fetch(`/api/search?${params.toString()}`)
  if (!res.ok) throw new Error(`Search failed (${res.status})`)
  return res.json() as Promise<SearchResult>
}

export function highlight(text: string, search: string, maxLen = 200) {
  if (!text) return ''
  if (!search?.trim()) return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean)
  const lower = text.toLowerCase()
  let idx = -1
  for (const t of terms) {
    const i = lower.indexOf(t)
    if (i !== -1 && (idx === -1 || i < idx)) idx = i
  }
  if (idx === -1) return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
  const start = Math.max(0, idx - 50)
  const end = Math.min(text.length, start + maxLen)
  let snippet = text.slice(start, end)
  if (start > 0) snippet = '…' + snippet
  if (end < text.length) snippet = snippet + '…'
  for (const t of terms) {
    snippet = snippet.replace(new RegExp(`(${t})`, 'gi'), '<mark>$1</mark>')
  }
  return snippet
}
