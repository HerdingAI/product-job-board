import { X } from 'lucide-react'
import { Tag } from '@/lib/types'
import { cn } from './TagBadge'

interface ActiveTagsDisplayProps {
    tags: Tag[]
    onRemoveTag: (tag: Tag) => void
    onClearAll: () => void
    className?: string
}

export function ActiveTagsDisplay({ tags, onRemoveTag, onClearAll, className }: ActiveTagsDisplayProps) {
    if (!tags || tags.length === 0) return null

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            <span className="text-sm text-gray-400 mr-1">Active filters:</span>
            {tags.map((tag) => (
                <span
                    key={`${tag.category}-${tag.label}`}
                    className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                        tag.color
                    )}
                >
                    {tag.label}
                    <button
                        onClick={() => onRemoveTag(tag)}
                        className="hover:bg-black/20 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500"
                        aria-label={`Remove ${tag.label} filter`}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <button
                onClick={onClearAll}
                className="text-xs text-gray-400 hover:text-white underline decoration-transparent hover:decoration-white transition-all ml-2"
            >
                Clear all
            </button>
        </div>
    )
}
