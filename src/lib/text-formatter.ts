/**
 * Text formatting utilities for consistent CamelCase and special term handling
 */

/**
 * Formats text to proper CamelCase with special handling for common terms
 */
export function formatCamelCase(text: string): string {
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
    'retention': 'Retention',
    
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
    'ipo': 'IPO',
    'public': 'Public',
    'startup': 'Startup',
    'scaleup': 'Scale-up',
    'growth': 'Growth Stage',
    'enterprise': 'Enterprise',
    'fortune_500': 'Fortune 500',
    'unicorn': 'Unicorn',
    'decacorn': 'Decacorn',
    
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
    'cybersecurity': 'Cybersecurity',
    
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
    'reports_to_gm': 'Reports to GM',
    'reports_to_ceo': 'Reports to CEO',
    'reports_to_cpo': 'Reports to CPO',
    'individual_contributor': 'Individual Contributor',
    'team_lead': 'Team Lead',
    'senior_pm': 'Senior PM',
    'principal_pm': 'Principal PM',
    'staff_pm': 'Staff PM',
    'product_manager': 'Product Manager',
    'technical_pm': 'Technical PM',
    'growth_pm': 'Growth PM',
    'data_pm': 'Data PM',
    
    // Platform and tools
    'cloud_platforms': 'Cloud Platforms',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'react': 'React',
    'vue': 'Vue',
    'angular': 'Angular',
    'node_js': 'Node.js',
    'python': 'Python',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    
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

/**
 * Format business model to readable format
 */
export function formatBusinessModel(model: string): string {
  const modelMappings: Record<string, string> = {
    'b2b_enterprise': 'B2B Enterprise',
    'b2b_saas': 'B2B SaaS',
    'b2c': 'B2C',
    'marketplace': 'Marketplace',
    'platform': 'Platform',
    'subscription': 'Subscription',
    'freemium': 'Freemium',
    'enterprise_saas': 'Enterprise SaaS'
  };
  
  return modelMappings[model.toLowerCase()] || formatCamelCase(model);
}

/**
 * Format company stage to readable format
 */
export function formatCompanyStage(stage: string): string {
  const stageMappings: Record<string, string> = {
    'pre_seed': 'Pre-Seed',
    'seed': 'Seed',
    'series_a': 'Series A',
    'series_b': 'Series B',
    'series_c': 'Series C',
    'series_d': 'Series D',
    'growth': 'Growth Stage',
    'pre_ipo': 'Pre-IPO',
    'ipo': 'IPO',
    'public_company': 'Public Company',
    'startup': 'Startup',
    'scale_up': 'Scale-up',
    'enterprise': 'Enterprise'
  };
  
  return stageMappings[stage.toLowerCase()] || formatCamelCase(stage);
}

/**
 * Format work arrangement to readable format
 */
export function formatWorkArrangement(arrangement: string): string {
  const arrangementMappings: Record<string, string> = {
    'remote': 'Remote',
    'hybrid': 'Hybrid',
    'onsite': 'On-site',
    'hybrid_only': 'Hybrid Only',
    'remote_only': 'Remote Only',
    'flexible': 'Flexible'
  };
  
  return arrangementMappings[arrangement.toLowerCase()] || formatCamelCase(arrangement);
}

/**
 * Format salary range to readable format
 */
export function formatSalaryRange(min?: number, max?: number): string {
  if (!min && !max) return '';
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };
  
  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  } else if (min) {
    return `${formatNumber(min)}+`;
  } else if (max) {
    return `Up to ${formatNumber(max)}`;
  }
  
  return '';
}

/**
 * Format job date to readable format
 */
export function formatJobDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
  } catch (error) {
    console.warn('Failed to format date:', dateString, error);
    return dateString;
  }
}
