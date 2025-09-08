import React from 'react';
import { extractJobTags } from '@/lib/tag-extraction';
import { TagBadge } from './ui/TagBadge';

interface JobTagsProps {
  jobData: any;
  className?: string;
}

export function JobTags({ jobData, className = '' }: JobTagsProps) {
  const extractedTags = extractJobTags(jobData);
  
  // Helper function to check if a value should be displayed
  const shouldDisplayValue = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      return lowerValue !== 'null' && lowerValue !== 'none' && lowerValue !== '';
    }
    return true;
  };
  
  // Only show content tags here (responsibilities, tools, technical)
  const contentCategories = [
    { 
      name: 'Responsibilities', 
      tags: extractedTags.responsibilities.filter(tag => shouldDisplayValue(tag)),
      color: 'blue' as const,
      description: 'Key areas of responsibility'
    },
    { 
      name: 'Tools & Platforms', 
      tags: extractedTags.tools.filter(tag => shouldDisplayValue(tag)),
      color: 'green' as const,
      description: 'Tools and platforms used'
    },
    { 
      name: 'Technical Skills', 
      tags: extractedTags.technical.filter(tag => shouldDisplayValue(tag)),
      color: 'purple' as const,
      description: 'Technical skills required'
    }
  ];

  // Filter out empty categories
  const visibleCategories = contentCategories.filter(category => category.tags.length > 0);

  // If no tags available, don't render the section
  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold text-white mb-6">Tags</h2>
      
      <div className="space-y-6">
        {visibleCategories.map(category => (
          <div key={category.name} className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-200 mb-1">{category.name}</h3>
              <p className="text-xs text-gray-400">{category.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {category.tags.map((tag, index) => (
                <TagBadge 
                  key={`${category.name}-${index}`}
                  label={tag} 
                  color={category.color}
                  size="md"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional info if data is available */}
      {(jobData.primary_responsibilities || jobData.tools_platforms || jobData.technical_skills) && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <p className="text-xs text-blue-300">
            <span className="font-medium">Tags extracted from:</span> Job requirements, responsibilities, and skills data
          </p>
        </div>
      )}
    </div>
  );
}
