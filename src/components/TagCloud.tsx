import { Tag } from '@/lib/types'
import { TagBadge } from './TagBadge'

interface TagCloudProps {
    tags: Tag[]
    activeTags?: Tag[]
    onTagClick?: (tag: Tag) => void
    className?: string
}

export function TagCloud({ tags, activeTags = [], onTagClick, className }: TagCloudProps) {
    if (!tags || tags.length === 0) return null

    return (
        <div className={`flex flex-wrap gap-2 ${className || ''}`}>
            {tags.map((tag) => {
                const isActive = activeTags.some(t => t.label === tag.label && t.category === tag.category)
                return (
                    <TagBadge
                        key={`${tag.category}-${tag.label}`}
                        tag={tag}
                        onClick={onTagClick}
                        isActive={isActive}
                    />
                )
            })}
        </div>
    )
}
