/**
 * Tag extraction utility for job data
 * Handles conversion of database fields to properly formatted tags
 */

export interface ExtractedTags {
  // Content tags (displayed below job description)
  responsibilities: string[];
  tools: string[];
  technical: string[];

  // Sidebar tags (displayed in right sidebar)
  management: string[];
  kpis: string[];
  productContext: string[];
  company: string[];
  experience: string[];
  location: string[];
}

/**
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractJobTags(jobData: any): ExtractedTags {
  return {
    // Content tags
    responsibilities: parseResponsibilities(jobData.primary_responsibilities),
    tools: parseToolsPlatforms(jobData.tools_platforms),
    technical: parseTechnicalSkills(jobData.technical_skills),

    // Sidebar tags
    management: parseManagementScope(jobData.reporting_structure),
    kpis: parseKpiOwnership(jobData.kpi_ownership),
    productContext: parseProductContext(jobData),
    company: parseCompanyInfo(jobData),
    experience: parseExperience(jobData),
    location: parseLocation(jobData)
  };
}

/**
 * Parse primary_responsibilities array into formatted tags
 * Input: ["strategy", "execution", "growth", "technical", "data"]
 * Output: ["Strategy", "Execution", "Growth", "Technical", "Data"]
 */
function parseResponsibilities(data: string[] | string | null): string[] {
  if (!data) return [];

  try {
    let responsibilities: string[] = [];

    if (typeof data === 'string') {
      // Handle string format - could be JSON array or comma-separated
      if (data.startsWith('[') && data.endsWith(']')) {
        responsibilities = JSON.parse(data);
      } else {
        responsibilities = data.split(',').map(item => item.trim());
      }
    } else if (Array.isArray(data)) {
      responsibilities = data;
    }

    return responsibilities
      .filter(item => item && item.trim())
      .map(item => formatCamelCase(item.trim()));

  } catch (error) {
    console.warn('Failed to parse responsibilities:', data, error);
    return [];
  }
}

/**
 * Parse tools_platforms object into formatted tags
 * Input: {"design": [], "analytics": [], "roadmapping": []}
 * Output: ["Design Tools", "Analytics", "Roadmapping"]
 */
function parseToolsPlatforms(data: object | string | null): string[] {
  if (!data) return [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let toolsObj: Record<string, any> = {};

    if (typeof data === 'string') {
      toolsObj = JSON.parse(data);
    } else if (typeof data === 'object') {
      toolsObj = data;
    }

    const tools: string[] = [];

    // Extract category names (keys) - these represent tool categories
    Object.keys(toolsObj).forEach(category => {
      if (category && category.trim()) {
        const formattedCategory = formatToolCategory(category);
        tools.push(formattedCategory);
      }

      // Also extract any values from arrays if they exist
      const values = toolsObj[category];
      if (Array.isArray(values)) {
        values.forEach(value => {
          if (value && value.trim()) {
            tools.push(formatCamelCase(value));
          }
        });
      }
    });

    return [...new Set(tools)]; // Remove duplicates

  } catch (error) {
    console.warn('Failed to parse tools_platforms:', data, error);
    return [];
  }
}

/**
 * Parse technical_skills string into formatted tags
 * Input: "apis, cloud_platforms"
 * Output: ["APIs", "Cloud Platforms"]
 */
function parseTechnicalSkills(data: string | null): string[] {
  if (!data || typeof data !== 'string') return [];

  return data
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0)
    .map(skill => formatCamelCase(skill));
}

/**
 * Parse management scope and reporting structure
 */
function parseManagementScope(reportingStructure: string | null): string[] {
  const tags: string[] = [];

  if (reportingStructure) {
    tags.push(formatCamelCase(reportingStructure));
  }

  return tags;
}

/**
 * Parse KPI ownership array
 * Input: ["revenue_arr","user_growth","retention"]
 * Output: ["Revenue ARR", "User Growth", "Retention"]
 */
function parseKpiOwnership(data: string[] | string | null): string[] {
  if (!data) return [];

  try {
    let kpis: string[] = [];

    if (typeof data === 'string') {
      if (data.startsWith('[') && data.endsWith(']')) {
        kpis = JSON.parse(data);
      } else {
        kpis = data.split(',').map(item => item.trim());
      }
    } else if (Array.isArray(data)) {
      kpis = data;
    }

    return kpis
      .filter(kpi => kpi && kpi.trim())
      .map(kpi => formatCamelCase(kpi.trim()));

  } catch (error) {
    console.warn('Failed to parse kpi_ownership:', data, error);
    return [];
  }
}

/**
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProductContext(jobData: any): string[] {
  const tags: string[] = [];

  if (jobData.product_lifecycle_focus) {
    tags.push(formatCamelCase(jobData.product_lifecycle_focus));
  }

  if (jobData.product_domain) {
    tags.push(formatCamelCase(jobData.product_domain));
  }

  if (jobData.domain_expertise) {
    tags.push(formatCamelCase(jobData.domain_expertise));
  }

  return tags;
}

/**
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCompanyInfo(jobData: any): string[] {
  const tags: string[] = [];

  if (jobData.company_stage) {
    tags.push(formatCamelCase(jobData.company_stage));
  }

  if (jobData.business_model) {
    tags.push(formatCamelCase(jobData.business_model));
  }

  if (jobData.industry_vertical) {
    tags.push(formatCamelCase(jobData.industry_vertical));
  }

  if (jobData.equity_mentioned === true || jobData.equity_mentioned === 1) {
    tags.push('Equity Offered');
  }

  return tags;
}

/**
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseExperience(jobData: any): string[] {
  const tags: string[] = [];

  if (jobData.seniority_level) {
    tags.push(formatCamelCase(jobData.seniority_level));
  }

  return tags;
}

/**
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseLocation(jobData: any): string[] {
  const tags: string[] = [];

  if (jobData.work_arrangement) {
    tags.push(formatCamelCase(jobData.work_arrangement));
  }

  if (jobData.is_remote === 1 && jobData.remote_flexibility) {
    tags.push(formatCamelCase(jobData.remote_flexibility));
  }

  if (jobData.is_hybrid === 1) {
    tags.push('Hybrid');
  }

  if (jobData.is_remote === 1) {
    tags.push('Remote');
  }

  return tags;
}

/**
 * Format text to proper CamelCase with special handling for common terms
 */
export function formatCamelCase(text: string): string {
  if (!text) return '';

  // Handle special cases first
  const specialCases: Record<string, string> = {
    'revenue_arr': 'Revenue ARR',
    'user_growth': 'User Growth',
    'retention': 'Retention',
    'api': 'API',
    'apis': 'APIs',
    'ai_ml': 'AI/ML',
    'ai': 'AI',
    'ml': 'ML',
    'b2b_enterprise': 'B2B Enterprise',
    'b2b': 'B2B',
    'b2c': 'B2C',
    'saas': 'SaaS',
    'remote_us': 'Remote (US)',
    'hybrid_only': 'Hybrid Only',
    'series_a': 'Series A',
    'series_b': 'Series B',
    'series_c': 'Series C',
    'series_d': 'Series D',
    'ipo': 'IPO',
    'startup': 'Startup',
    'growth': 'Growth Stage',
    'enterprise': 'Enterprise',
    'fintech': 'Fintech',
    'healthtech': 'HealthTech',
    'edtech': 'EdTech',
    'cloud_platforms': 'Cloud Platforms',
    'reports_to_gm': 'Reports to GM',
    'reports_to_ceo': 'Reports to CEO',
    'reports_to_cpo': 'Reports to CPO',
    'individual_contributor': 'Individual Contributor',
    'team_lead': 'Team Lead',
    'senior_pm': 'Senior PM',
    'principal_pm': 'Principal PM',
    'staff_pm': 'Staff PM'
  };

  const lowerText = text.toLowerCase();
  if (specialCases[lowerText]) {
    return specialCases[lowerText];
  }

  // General conversion: "company_stage" -> "Company Stage"
  return text
    .split(/[_\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format tool categories with special handling
 */
function formatToolCategory(category: string): string {
  const categoryMappings: Record<string, string> = {
    'design': 'Design Tools',
    'analytics': 'Analytics',
    'roadmapping': 'Roadmapping',
    'engineering': 'Engineering Tools',
    'communication': 'Communication',
    'project_management': 'Project Management',
    'data': 'Data Tools'
  };

  return categoryMappings[category.toLowerCase()] || formatCamelCase(category);
}

/**
 * Format experience bucket to readable format
 */
/**
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFormattedLocation(jobData: any): string {
  return jobData.location_metro || jobData.location_city || 'Location TBD';
}

/**
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFormattedExperience(jobData: any): string {
  const { years_experience_min, years_experience_max } = jobData;

  if (years_experience_min && years_experience_max) {
    return `${years_experience_min}-${years_experience_max} years as PM`;
  } else if (years_experience_min) {
    return `${years_experience_min}+ years as PM`;
  }

  return 'Experience TBD';
}
