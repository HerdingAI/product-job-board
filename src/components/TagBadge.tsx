import { Tag } from '@/lib/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface TagBadgeProps {
    tag: Tag
    onClick?: (tag: Tag) => void
    isActive?: boolean
    className?: string
}

export function TagBadge({ tag, onClick, isActive = false, className }: TagBadgeProps) {
    return (
        <button
            onClick={() => onClick?.(tag)}
            disabled={!onClick}
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                isActive
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : `${tag.color} hover:bg-opacity-80`,
                !onClick && 'cursor-default',
                className
            )}
        >
            {tag.label}
        </button>
    )
}
