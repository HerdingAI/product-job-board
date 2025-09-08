import React from 'react';
import { extractJobTags, getFormattedLocation, getFormattedExperience } from '@/lib/tag-extraction';
import { TagBadge } from '@/components/ui/TagBadge';
import { SidebarSection } from '@/components/ui/SidebarSection';

interface CompanySidebarProps {
  jobData: any;
  className?: string;
}

export function CompanySidebar({ jobData, className = '' }: CompanySidebarProps) {
  const extractedTags = extractJobTags(jobData);
  const formattedLocation = getFormattedLocation(jobData);
  const formattedExperience = getFormattedExperience(jobData);

  return (
    <div className={className}>
      {/* COMPANY Section */}
      <SidebarSection title="COMPANY">
        <div className="space-y-3">
          <p className="font-medium text-gray-900">{jobData.company}</p>
          
          {extractedTags.company.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {extractedTags.company.map((tag, index) => (
                <TagBadge 
                  key={`company-${index}`}
                  label={tag} 
                  color="blue" 
                  size="sm" 
                />
              ))}
            </div>
          )}
        </div>
      </SidebarSection>

      {/* LOCATION Section */}
      <SidebarSection title="LOCATION">
        <div className="space-y-3">
          <p className="text-sm text-gray-900">{formattedLocation}</p>
          
          {extractedTags.location.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {extractedTags.location.map((tag, index) => (
                <TagBadge 
                  key={`location-${index}`}
                  label={tag} 
                  color="green" 
                  size="sm" 
                />
              ))}
            </div>
          )}
        </div>
      </SidebarSection>

      {/* EXPERIENCE Section */}
      <SidebarSection title="EXPERIENCE">
        <div className="space-y-3">
          <p className="text-sm text-gray-900">{formattedExperience}</p>
          
          {extractedTags.experience.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {extractedTags.experience.map((tag, index) => (
                <TagBadge 
                  key={`experience-${index}`}
                  label={tag} 
                  color="orange" 
                  size="sm" 
                />
              ))}
            </div>
          )}
        </div>
      </SidebarSection>

      {/* PRODUCT CONTEXT Section */}
      {extractedTags.productContext.length > 0 && (
        <SidebarSection title="PRODUCT CONTEXT">
          <div className="flex flex-wrap gap-1">
            {extractedTags.productContext.map((tag, index) => (
              <TagBadge 
                key={`product-context-${index}`}
                label={tag} 
                color="purple" 
                size="sm" 
              />
            ))}
          </div>
        </SidebarSection>
      )}

      {/* MANAGEMENT & LEADERSHIP Section */}
      {extractedTags.management.length > 0 && (
        <SidebarSection title="MANAGEMENT & LEADERSHIP">
          <div className="flex flex-wrap gap-1">
            {extractedTags.management.map((tag, index) => (
              <TagBadge 
                key={`management-${index}`}
                label={tag} 
                color="indigo" 
                size="sm" 
              />
            ))}
          </div>
        </SidebarSection>
      )}

      {/* KPI OWNERSHIP Section */}
      {extractedTags.kpis.length > 0 && (
        <SidebarSection title="KPI OWNERSHIP">
          <div className="flex flex-wrap gap-1">
            {extractedTags.kpis.map((tag, index) => (
              <TagBadge 
                key={`kpi-${index}`}
                label={tag} 
                color="yellow" 
                size="sm" 
              />
            ))}
          </div>
        </SidebarSection>
      )}

      {/* Additional Information */}
      <div className="mt-6 p-3 bg-gray-100 rounded-lg">
        <p className="text-xs text-gray-600">
          <span className="font-medium">Information extracted from:</span> Company data, job requirements, and role specifications
        </p>
      </div>
    </div>
  );
}
