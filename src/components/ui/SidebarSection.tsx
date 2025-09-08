import React from 'react';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarSection({ title, children, className = '' }: SidebarSectionProps) {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0 ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
