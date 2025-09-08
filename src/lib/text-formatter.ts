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
    'staff_pm': 'Staff PM',
    'product_manager': 'Product Manager',
    'technical_pm': 'Technical PM',
    'growth_pm': 'Growth PM',
    'data_pm': 'Data PM'
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
export function formatSalaryRange(min?: number, max?: number, currency: string = 'USD'): string {
  if (!min && !max) return '';
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };
  
  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
  } else if (min) {
    return `${formatNumber(min)}+ ${currency}`;
  } else if (max) {
    return `Up to ${formatNumber(max)} ${currency}`;
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
