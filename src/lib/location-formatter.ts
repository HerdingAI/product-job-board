interface FormattedLocation {
  primary: string;
  tags: string[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatLocation(jobData: any): FormattedLocation {
  // Coalesce location_metro and location_city
  const primaryLocation = jobData.location_metro || jobData.location_city || 'Location TBD';

  const tags: string[] = [];

  // Add remote/hybrid work arrangement tags
  if (jobData.is_remote === 1) {
    tags.push('Remote');

    // Add remote flexibility if available
    if (jobData.remote_flexibility) {
      tags.push(formatCamelCase(jobData.remote_flexibility));
    }
  }

  if (jobData.is_hybrid === 1) {
    tags.push('Hybrid');
  }

  // Add work arrangement
  if (jobData.work_arrangement) {
    const arrangement = formatCamelCase(jobData.work_arrangement);
    if (!tags.includes(arrangement)) {
      tags.push(arrangement);
    }
  }

  return {
    primary: primaryLocation,
    tags: tags.filter(Boolean)
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatExperience(jobData: any): { formatted: string; tags: string[] } {
  const years = formatYearsExperience(jobData.years_experience_min, jobData.years_experience_max);
  const tags: string[] = [];

  if (jobData.seniority_level) {
    tags.push(formatCamelCase(jobData.seniority_level));
  }

  return {
    formatted: years,
    tags: tags.filter(Boolean)
  };
}

function formatYearsExperience(min?: number, max?: number): string {
  if (min && max) {
    return `${min}-${max} years as PM`;
  } else if (min) {
    return `${min}+ years as PM`;
  } else {
    return 'Experience TBD';
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatProductContext(jobData: any): { tags: string[] } {
  const tags: string[] = [];

  if (jobData.product_lifecycle_focus) {
    tags.push(formatCamelCase(jobData.product_lifecycle_focus));
  }

  if (jobData.product_domain) {
    tags.push(formatCamelCase(jobData.product_domain));
  }

  if (jobData.domain_expertise) {
    // Handle both string and array formats
    const domains = Array.isArray(jobData.domain_expertise)
      ? jobData.domain_expertise
      : [jobData.domain_expertise];

    domains.forEach((domain: string) => {
      if (domain) {
        tags.push(formatCamelCase(domain));
      }
    });
  }

  return { tags: tags.filter(Boolean) };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatManagementInfo(jobData: any): { tags: string[] } {
  const tags: string[] = [];

  if (jobData.reporting_structure) {
    tags.push(formatCamelCase(jobData.reporting_structure));
  }

  // Add team size information
  if (jobData.team_size_direct) {
    tags.push(`${jobData.team_size_direct} Direct Reports`);
  }

  if (jobData.team_size_indirect) {
    tags.push(`${jobData.team_size_indirect} Indirect Reports`);
  }

  // Parse KPI ownership array - REMOVED to avoid duplication with KPI OWNERSHIP section
  // KPI data is handled separately in the dedicated KPI OWNERSHIP section

  return { tags: tags.filter(Boolean) };
}

// Enhanced CamelCase formatter with comprehensive special cases
function formatCamelCase(text: string): string {
  if (!text) return '';

  // Handle special cases first
  const specialCases: Record<string, string> = {
    // Revenue and metrics
    'revenue_arr': 'Revenue ARR',
    'user_growth': 'User Growth',
    'churn_rate': 'Churn Rate',
    'conversion_rate': 'Conversion Rate',
    'customer_acquisition': 'Customer Acquisition',
    'ltv_cac': 'LTV/CAC',
    'monthly_recurring_revenue': 'Monthly Recurring Revenue',
    'annual_recurring_revenue': 'Annual Recurring Revenue',

    // Technical terms
    'api': 'API',
    'apis': 'APIs',
    'ai_ml': 'AI/ML',
    'ai': 'AI',
    'ml': 'ML',
    'ui_ux': 'UI/UX',
    'ui': 'UI',
    'ux': 'UX',
    'sql': 'SQL',
    'nosql': 'NoSQL',
    'aws': 'AWS',
    'gcp': 'GCP',
    'azure': 'Azure',
    'saas': 'SaaS',
    'paas': 'PaaS',
    'iaas': 'IaaS',
    'sdk': 'SDK',
    'cdn': 'CDN',
    'devops': 'DevOps',
    'cicd': 'CI/CD',
    'ci_cd': 'CI/CD',

    // Business models and company info
    'b2b': 'B2B',
    'b2c': 'B2C',
    'b2b2c': 'B2B2C',
    'c2c': 'C2C',
    'b2g': 'B2G',
    'b2b_enterprise': 'B2B Enterprise',
    'b2b_smb': 'B2B SMB',
    'b2c_consumer': 'B2C Consumer',

    // Company stages
    'series_a': 'Series A',
    'series_b': 'Series B',
    'series_c': 'Series C',
    'series_d': 'Series D',
    'series_e': 'Series E',
    'pre_ipo': 'Pre-IPO',
    'fortune_500': 'Fortune 500',

    // Work arrangements
    'remote_us': 'Remote (US)',
    'remote_global': 'Remote (Global)',
    'hybrid_only': 'Hybrid Only',
    'onsite_only': 'On-site Only',
    'flexible_remote': 'Flexible Remote',
    'remote_first': 'Remote First',
    'office_first': 'Office First',

    // Industries
    'fintech': 'FinTech',
    'healthtech': 'HealthTech',
    'edtech': 'EdTech',
    'proptech': 'PropTech',
    'regtech': 'RegTech',
    'adtech': 'AdTech',
    'martech': 'MarTech',
    'insurtech': 'InsurTech',
    'biotech': 'BioTech',
    'cleantech': 'CleanTech',

    // Product management terms
    'product_lifecycle': 'Product Lifecycle',
    'go_to_market': 'Go-to-Market',
    'gtm': 'GTM',
    'mvp': 'MVP',
    'poc': 'POC',
    'kpi': 'KPI',
    'kpis': 'KPIs',
    'okr': 'OKR',
    'okrs': 'OKRs',
    'roi': 'ROI',
    'roas': 'ROAS',

    // Management and leadership
    'cross_functional': 'Cross-functional',
    'direct_reports': 'Direct Reports',
    'indirect_reports': 'Indirect Reports',
    'stakeholder_management': 'Stakeholder Management',

    // Common abbreviations
    'usa': 'USA',
    'uk': 'UK',
    'eu': 'EU',
    'apac': 'APAC',
    'emea': 'EMEA',
    'nyc': 'NYC',
    'sf': 'SF',
    'la': 'LA'
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
