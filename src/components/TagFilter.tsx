import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Tag } from '@/lib/types'
import { TagCloud } from './TagCloud'
import { cn } from './TagBadge'

interface TagFilterProps {
    tags: Tag[]
    activeTags: Tag[]
    onTagClick: (tag: Tag) => void
    className?: string
}

export function TagFilter({ tags, activeTags, onTagClick, className }: TagFilterProps) {
    const [searchQuery, setSearchQuery] = useState('')

    // Filter tags based on search query
    const filteredTags = useMemo(() => {
        if (!searchQuery) return tags
        const lowerQuery = searchQuery.toLowerCase()
        return tags.filter(tag => tag.label.toLowerCase().includes(lowerQuery))
    }, [tags, searchQuery])

    // Group filtered tags by category
    const groupedTags = useMemo(() => {
        const groups: Record<string, Tag[]> = {
            'core-pm': [],
            'technical': [],
            'domain': []
        }

        filteredTags.forEach(tag => {
            if (groups[tag.category]) {
                groups[tag.category].push(tag)
            }
        })

        return groups
    }, [filteredTags])

    const categoryLabels = {
        'core-pm': 'Core PM Skills',
        'technical': 'Technical Skills',
        'domain': 'Domain Expertise'
    }

    return (
        <div className={cn('flex flex-col space-y-4', className)}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                    type="text"
                    className="bg-black/40 border border-gray-800 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-colors placeholder-gray-500"
                    placeholder="Search skills, tools, or domains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {(Object.entries(groupedTags) as [keyof typeof categoryLabels, Tag[]][]).map(([category, categoryTags]) => {
                    if (categoryTags.length === 0) return null

                    return (
                        <div key={category} className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {categoryLabels[category]}
                            </h4>
                            <TagCloud
                                tags={categoryTags.map(t => ({
                                    ...t,
                                    // We simulate active state by manipulating color manually for TagCloud
                                    // But we should really pass isActive to TagCloud. We'll add this to TagCloud below.
                                }))}
                                onTagClick={onTagClick}
                            />
                        </div>
                    )
                })}
                {filteredTags.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No tags found matching &quot;{searchQuery}&quot;</p>
                )}
            </div>
        </div>
    )
}
