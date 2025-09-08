interface CompanyInfo {
  basicInfo: {
    name: string;
    stage?: string;
    industry?: string;
    businessModel?: string;
  };
  compensation: {
    equityMentioned: boolean;
    salaryRange?: string;
    benefits?: string[];
  };
  culture: {
    workArrangement?: string;
    remoteFlexibility?: string;
    values?: string[];
  };
}

export function formatCompanyInfo(jobData: any): CompanyInfo {
  return {
    basicInfo: {
      name: jobData.company,
      stage: formatCompanyStage(jobData.company_stage),
      industry: formatIndustry(jobData.industry_vertical),
      businessModel: formatBusinessModel(jobData.business_model)
    },
    compensation: {
      equityMentioned: jobData.equity_mentioned === true || jobData.equity_mentioned === 1,
      salaryRange: formatSalaryRange(jobData.salary_min, jobData.salary_max),
      benefits: extractBenefits(jobData.description)
    },
    culture: {
      workArrangement: formatWorkArrangement(jobData.work_arrangement),
      remoteFlexibility: jobData.is_remote === 1 ? jobData.remote_flexibility : null,
      values: extractCompanyValues(jobData.description)
    }
  };
}

function formatCompanyStage(stage: string | null): string | undefined {
  if (!stage) return undefined;
  
  const stageMap: Record<string, string> = {
    'seed': 'Seed',
    'series_a': 'Series A',
    'series_b': 'Series B', 
    'series_c': 'Series C',
    'series_d': 'Series D',
    'series_e': 'Series E',
    'pre_ipo': 'Pre-IPO',
    'public': 'Public',
    'startup': 'Startup',
    'scaleup': 'Scale-up',
    'enterprise': 'Enterprise',
    'fortune_500': 'Fortune 500',
    'unicorn': 'Unicorn',
    'decacorn': 'Decacorn'
  };
  
  return stageMap[stage.toLowerCase()] || formatCamelCase(stage);
}

function formatIndustry(industry: string | null): string | undefined {
  if (!industry) return undefined;
  
  const industryMap: Record<string, string> = {
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
    'artificial_intelligence': 'Artificial Intelligence',
    'machine_learning': 'Machine Learning',
    'data_analytics': 'Data Analytics',
    'cloud_computing': 'Cloud Computing',
    'enterprise_software': 'Enterprise Software',
    'consumer_software': 'Consumer Software',
    'mobile_apps': 'Mobile Apps',
    'web_development': 'Web Development',
    'e_commerce': 'E-commerce',
    'social_media': 'Social Media',
    'gaming': 'Gaming',
    'media_entertainment': 'Media & Entertainment',
    'real_estate': 'Real Estate',
    'financial_services': 'Financial Services',
    'healthcare': 'Healthcare',
    'education': 'Education',
    'retail': 'Retail',
    'manufacturing': 'Manufacturing',
    'logistics': 'Logistics',
    'transportation': 'Transportation',
    'energy': 'Energy',
    'agriculture': 'Agriculture'
  };
  
  return industryMap[industry.toLowerCase()] || formatCamelCase(industry);
}

function formatBusinessModel(model: string | null): string | undefined {
  if (!model) return undefined;
  
  const modelMap: Record<string, string> = {
    'b2b': 'B2B',
    'b2c': 'B2C',
    'b2b2c': 'B2B2C',
    'c2c': 'C2C',
    'b2g': 'B2G',
    'b2b_enterprise': 'B2B Enterprise',
    'b2b_smb': 'B2B SMB',
    'b2c_consumer': 'B2C Consumer',
    'marketplace': 'Marketplace',
    'platform': 'Platform',
    'saas': 'SaaS',
    'paas': 'PaaS',
    'iaas': 'IaaS',
    'subscription': 'Subscription',
    'freemium': 'Freemium',
    'advertising': 'Advertising',
    'transaction_fee': 'Transaction Fee',
    'commission': 'Commission',
    'licensing': 'Licensing',
    'consulting': 'Consulting',
    'hybrid': 'Hybrid Model'
  };
  
  return modelMap[model.toLowerCase()] || formatCamelCase(model);
}

function formatSalaryRange(minSalary: number | null, maxSalary: number | null): string | undefined {
  if (!minSalary && !maxSalary) return undefined;
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (minSalary && maxSalary) {
    return `${formatCurrency(minSalary)} - ${formatCurrency(maxSalary)}`;
  } else if (minSalary) {
    return `${formatCurrency(minSalary)}+`;
  } else if (maxSalary) {
    return `Up to ${formatCurrency(maxSalary)}`;
  }
  
  return undefined;
}

function formatWorkArrangement(arrangement: string | null): string | undefined {
  if (!arrangement) return undefined;
  
  const arrangementMap: Record<string, string> = {
    'remote': 'Remote',
    'hybrid': 'Hybrid',
    'onsite': 'On-site',
    'flexible': 'Flexible',
    'remote_first': 'Remote First',
    'office_first': 'Office First',
    'distributed': 'Distributed',
    'co_located': 'Co-located'
  };
  
  return arrangementMap[arrangement.toLowerCase()] || formatCamelCase(arrangement);
}

function extractBenefits(description: string | null): string[] {
  if (!description) return [];
  
  const benefitKeywords = [
    'health insurance', 'dental', 'vision', 'medical',
    '401k', 'retirement', 'pension',
    'pto', 'vacation', 'sick leave', 'time off',
    'parental leave', 'maternity', 'paternity',
    'flexible hours', 'flex time', 'flexible schedule',
    'remote work', 'work from home',
    'gym membership', 'fitness',
    'education', 'learning', 'training', 'conferences',
    'stock options', 'equity', 'rsu',
    'bonus', 'performance bonus',
    'lunch', 'meals', 'food',
    'commuter', 'transportation',
    'mental health', 'wellness',
    'professional development'
  ];
  
  const foundBenefits: string[] = [];
  const lowerDescription = description.toLowerCase();
  
  benefitKeywords.forEach(keyword => {
    if (lowerDescription.includes(keyword)) {
      foundBenefits.push(formatCamelCase(keyword));
    }
  });
  
  // Remove duplicates and return
  return Array.from(new Set(foundBenefits));
}

function extractCompanyValues(description: string | null): string[] {
  if (!description) return [];
  
  const valueKeywords = [
    'innovation', 'creativity', 'integrity', 'transparency',
    'collaboration', 'teamwork', 'diversity', 'inclusion',
    'customer first', 'customer-centric', 'customer focus',
    'excellence', 'quality', 'continuous improvement',
    'growth mindset', 'learning', 'development',
    'ownership', 'accountability', 'responsibility',
    'agility', 'adaptability', 'flexibility',
    'empowerment', 'autonomy', 'trust',
    'impact', 'mission-driven', 'purpose',
    'sustainability', 'social responsibility'
  ];
  
  const foundValues: string[] = [];
  const lowerDescription = description.toLowerCase();
  
  valueKeywords.forEach(keyword => {
    if (lowerDescription.includes(keyword)) {
      foundValues.push(formatCamelCase(keyword));
    }
  });
  
  // Remove duplicates and return
  return Array.from(new Set(foundValues));
}

// Helper function for CamelCase formatting
function formatCamelCase(text: string): string {
  if (!text) return '';
  
  return text
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Location formatting utilities
export interface LocationInfo {
  primary: string;
  tags: string[];
}

export function formatLocation(jobData: any): LocationInfo {
  const tags: string[] = [];
  let primary = 'Location TBD';
  
  // Primary location
  if (jobData.location_metro) {
    primary = jobData.location_metro;
  } else if (jobData.location_city && jobData.location_state) {
    primary = `${jobData.location_city}, ${jobData.location_state}`;
  } else if (jobData.location_city) {
    primary = jobData.location_city;
  }
  
  // Work arrangement tags
  if (jobData.is_remote === 1) {
    tags.push('Remote');
  }
  if (jobData.is_hybrid === 1) {
    tags.push('Hybrid');
  }
  if (jobData.work_arrangement) {
    const arrangement = formatWorkArrangement(jobData.work_arrangement);
    if (arrangement && !tags.includes(arrangement)) {
      tags.push(arrangement);
    }
  }
  
  return { primary, tags };
}

// Experience formatting utilities
export interface ExperienceInfo {
  formatted: string;
  tags: string[];
}

export function formatExperience(jobData: any): ExperienceInfo {
  const tags: string[] = [];
  let formatted = 'Experience TBD';
  
  // Years of experience
  if (jobData.years_experience_min && jobData.years_experience_max) {
    formatted = `${jobData.years_experience_min}-${jobData.years_experience_max} years`;
  } else if (jobData.years_experience_min) {
    formatted = `${jobData.years_experience_min}+ years`;
  }
  
  // Seniority level tag
  if (jobData.seniority_level) {
    tags.push(formatCamelCase(jobData.seniority_level));
  }
  
  return { formatted, tags };
}

// Product context formatting utilities
export interface ProductContextInfo {
  tags: string[];
}

export function formatProductContext(jobData: any): ProductContextInfo {
  const tags: string[] = [];
  
  if (jobData.product_lifecycle_focus) {
    tags.push(formatCamelCase(jobData.product_lifecycle_focus));
  }
  
  if (jobData.product_domain) {
    tags.push(formatCamelCase(jobData.product_domain));
  }
  
  if (jobData.domain_expertise) {
    const domains = Array.isArray(jobData.domain_expertise) 
      ? jobData.domain_expertise 
      : [jobData.domain_expertise];
    
    domains.forEach((domain: string) => {
      if (domain) {
        tags.push(formatCamelCase(domain));
      }
    });
  }
  
  return { tags };
}

// Management information formatting utilities
export interface ManagementInfo {
  tags: string[];
}

export function formatManagementInfo(jobData: any): ManagementInfo {
  const tags: string[] = [];
  
  if (jobData.reporting_structure) {
    tags.push(formatCamelCase(jobData.reporting_structure));
  }
  
  if (jobData.team_size_direct) {
    tags.push(`${jobData.team_size_direct} Direct Reports`);
  }
  
  if (jobData.team_size_indirect) {
    tags.push(`${jobData.team_size_indirect} Indirect Reports`);
  }
  
  return { tags };
}
