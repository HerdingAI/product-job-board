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
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const baseClasses = 'inline-flex items-center rounded-full font-medium border transition-colors duration-200';
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-80' : '';
  
  return (
    <span 
      className={`${baseClasses} ${colorClasses[color]} ${sizeClasses[size]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {label}
    </span>
  );
}
