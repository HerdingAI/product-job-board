import React from 'react';

interface TagBadgeProps {
  label: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'gray' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export function TagBadge({ 
  label, 
  color, 
  size = 'md', 
  className = '',
  onClick 
}: TagBadgeProps) {
  const colorClasses = {
    blue: 'bg-blue-900/30 text-blue-300 border-blue-800/50 hover:bg-blue-900/50',
    green: 'bg-emerald-900/30 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/50',
    purple: 'bg-violet-900/30 text-violet-300 border-violet-800/50 hover:bg-violet-900/50',
    orange: 'bg-orange-900/30 text-orange-300 border-orange-800/50 hover:bg-orange-900/50',
    indigo: 'bg-indigo-900/30 text-indigo-300 border-indigo-800/50 hover:bg-indigo-900/50',
    gray: 'bg-gray-800/50 text-gray-300 border-gray-700/50 hover:bg-gray-800/70',
    red: 'bg-red-900/30 text-red-300 border-red-800/50 hover:bg-red-900/50',
    yellow: 'bg-amber-900/30 text-amber-300 border-amber-800/50 hover:bg-amber-900/50'
  };
  
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const baseClasses = 'inline-flex items-center rounded-lg font-medium border transition-all duration-200 ease-in-out';
  const interactiveClasses = onClick 
    ? 'cursor-pointer hover:scale-105 hover:shadow-sm active:scale-95' 
    : '';
  
  return (
    <span 
      className={`${baseClasses} ${colorClasses[color]} ${sizeClasses[size]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {label}
    </span>
  );
}
