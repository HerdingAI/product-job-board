import React from 'react';
import { 
  formatCompanyInfo, 
  formatLocation, 
  formatExperience, 
  formatProductContext, 
  formatManagementInfo 
} from '@/lib/company-formatter';
import { extractJobTags } from '@/lib/tag-extraction';
import { TagBadge } from '@/components/ui/TagBadge';
import { SidebarSection } from '@/components/ui/SidebarSection';

interface CompanySidebarProps {
  jobData: any;
  className?: string;
}

export function CompanySidebar({ jobData, className = '' }: CompanySidebarProps) {
  const companyInfo = formatCompanyInfo(jobData);
  const location = formatLocation(jobData);
  const experience = formatExperience(jobData);
  const productContext = formatProductContext(jobData);
  const managementInfo = formatManagementInfo(jobData);
  
  // Keep legacy KPI tags from the old system
  const legacyTags = extractJobTags(jobData);

  return (
    <div className={className}>
      {/* COMPANY Section */}
      <SidebarSection title="COMPANY">
        <div className="space-y-3">
          <p className="font-medium text-gray-900">{companyInfo.basicInfo.name}</p>
          
          <div className="flex flex-wrap gap-1">
            {companyInfo.basicInfo.stage && (
              <TagBadge label={companyInfo.basicInfo.stage} color="blue" size="sm" />
            )}
            {companyInfo.basicInfo.industry && (
              <TagBadge label={companyInfo.basicInfo.industry} color="blue" size="sm" />
            )}
            {companyInfo.basicInfo.businessModel && (
              <TagBadge label={companyInfo.basicInfo.businessModel} color="green" size="sm" />
            )}
            {companyInfo.compensation.equityMentioned && (
              <TagBadge label="Equity Offered" color="purple" size="sm" />
            )}
          </div>
          
          {companyInfo.compensation.salaryRange && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Salary: {companyInfo.compensation.salaryRange}</p>
            </div>
          )}
        </div>
      </SidebarSection>

      {/* LOCATION Section */}
      <SidebarSection title="LOCATION">
        <div className="space-y-3">
          <p className="text-sm text-gray-900">{location.primary}</p>
          
          {location.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {location.tags.map((tag, index) => (
                <TagBadge 
                  key={`location-${index}`}
                  label={tag} 
                  color="green" 
                  size="sm" 
                />
              ))}
            </div>
          )}
          
          {companyInfo.culture.remoteFlexibility && (
            <p className="text-xs text-gray-500">{companyInfo.culture.remoteFlexibility}</p>
          )}
        </div>
      </SidebarSection>

      {/* EXPERIENCE Section */}
      <SidebarSection title="EXPERIENCE">
        <div className="space-y-3">
          <p className="text-sm text-gray-900">{experience.formatted}</p>
          
          {experience.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {experience.tags.map((tag, index) => (
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
      {productContext.tags.length > 0 && (
        <SidebarSection title="PRODUCT CONTEXT">
          <div className="flex flex-wrap gap-1">
            {productContext.tags.map((tag, index) => (
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

      {/* MANAGEMENT Section */}
      {managementInfo.tags.length > 0 && (
        <SidebarSection title="MANAGEMENT">
          <div className="flex flex-wrap gap-1">
            {managementInfo.tags.map((tag, index) => (
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
      {legacyTags.kpis.length > 0 && (
        <SidebarSection title="KPI OWNERSHIP">
          <div className="flex flex-wrap gap-1">
            {legacyTags.kpis.map((tag, index) => (
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

      {/* COMPANY CULTURE Section */}
      {(companyInfo.culture.values && companyInfo.culture.values.length > 0) && (
        <SidebarSection title="CULTURE">
          <div className="space-y-2">
            {companyInfo.culture.workArrangement && (
              <p className="text-sm text-gray-600">Work Style: {companyInfo.culture.workArrangement}</p>
            )}
            
            <div className="flex flex-wrap gap-1">
              {companyInfo.culture.values.slice(0, 3).map((value, index) => (
                <TagBadge 
                  key={`value-${index}`}
                  label={value} 
                  color="blue" 
                  size="sm" 
                />
              ))}
            </div>
          </div>
        </SidebarSection>
      )}

      {/* BENEFITS Section */}
      {(companyInfo.compensation.benefits && companyInfo.compensation.benefits.length > 0) && (
        <SidebarSection title="BENEFITS">
          <div className="flex flex-wrap gap-1">
            {companyInfo.compensation.benefits.slice(0, 4).map((benefit, index) => (
              <TagBadge 
                key={`benefit-${index}`}
                label={benefit} 
                color="green" 
                size="sm" 
              />
            ))}
          </div>
        </SidebarSection>
      )}
    </div>
  );
}
