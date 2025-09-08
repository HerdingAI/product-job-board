import React from 'react';
import { 
  formatCompanyInfo, 
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
  const experience = formatExperience(jobData);
  const productContext = formatProductContext(jobData);
  const managementInfo = formatManagementInfo(jobData);
  
  // Keep legacy KPI tags from the old system
  const legacyTags = extractJobTags(jobData);

  // Helper function to check if a value should be displayed
  const shouldDisplayValue = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      return lowerValue !== 'null' && lowerValue !== 'none' && lowerValue !== '';
    }
    return true;
  };

  return (
    <div className={className}>
      {/* COMPANY Section */}
      <SidebarSection title="COMPANY">
        <div className="space-y-3">
          <p className="font-medium text-white">{companyInfo.basicInfo.name}</p>
          
          <div className="flex flex-wrap gap-1">
            {shouldDisplayValue(companyInfo.basicInfo.stage) && (
              <TagBadge label={companyInfo.basicInfo.stage!} color="blue" size="sm" />
            )}
            {shouldDisplayValue(companyInfo.basicInfo.industry) && (
              <TagBadge label={companyInfo.basicInfo.industry!} color="blue" size="sm" />
            )}
            {shouldDisplayValue(companyInfo.basicInfo.businessModel) && (
              <TagBadge label={companyInfo.basicInfo.businessModel!} color="green" size="sm" />
            )}
            {companyInfo.compensation.equityMentioned && (
              <TagBadge label="Equity Offered" color="purple" size="sm" />
            )}
          </div>
        </div>
      </SidebarSection>

      {/* EXPERIENCE Section */}
      <SidebarSection title="EXPERIENCE">
        <div className="space-y-3">
          <p className="text-sm text-gray-300">{experience.formatted}</p>
          
          {experience.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {experience.tags.filter(tag => shouldDisplayValue(tag)).map((tag, index) => (
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
      {productContext.tags.filter(tag => shouldDisplayValue(tag)).length > 0 && (
        <SidebarSection title="PRODUCT CONTEXT">
          <div className="flex flex-wrap gap-1">
            {[...new Set(productContext.tags.filter(tag => shouldDisplayValue(tag)))].map((tag, index) => (
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
      {managementInfo.tags.filter(tag => shouldDisplayValue(tag)).length > 0 && (
        <SidebarSection title="MANAGEMENT">
          <div className="flex flex-wrap gap-1">
            {managementInfo.tags.filter(tag => shouldDisplayValue(tag)).map((tag, index) => (
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
      {legacyTags.kpis.filter(tag => shouldDisplayValue(tag)).length > 0 && (
        <SidebarSection title="KPI OWNERSHIP">
          <div className="flex flex-wrap gap-1">
            {legacyTags.kpis.filter(tag => shouldDisplayValue(tag)).map((tag, index) => (
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
      {(companyInfo.culture.values && companyInfo.culture.values.filter(value => shouldDisplayValue(value)).length > 0) && (
        <SidebarSection title="CULTURE">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {companyInfo.culture.values.filter(value => shouldDisplayValue(value)).slice(0, 3).map((value, index) => (
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
      {(companyInfo.compensation.benefits && companyInfo.compensation.benefits.filter(benefit => shouldDisplayValue(benefit)).length > 0) && (
        <SidebarSection title="BENEFITS">
          <div className="flex flex-wrap gap-1">
            {companyInfo.compensation.benefits.filter(benefit => shouldDisplayValue(benefit)).slice(0, 4).map((benefit, index) => (
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
