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

import { formatCamelCase } from './text-formatter';
import { 
  formatLocation as formatLocationUtil, 
  formatExperience as formatExperienceUtil, 
  formatProductContext as formatProductContextUtil, 
  formatManagementInfo as formatManagementInfoUtil 
} from './location-formatter';

// Location formatting utilities
export interface LocationInfo {
  primary: string;
  tags: string[];
}

export function formatLocation(jobData: any): LocationInfo {
  return formatLocationUtil(jobData);
}

// Experience formatting utilities
export interface ExperienceInfo {
  formatted: string;
  tags: string[];
}

export function formatExperience(jobData: any): ExperienceInfo {
  return formatExperienceUtil(jobData);
}

// Product context formatting utilities
export interface ProductContextInfo {
  tags: string[];
}

export function formatProductContext(jobData: any): ProductContextInfo {
  return formatProductContextUtil(jobData);
}

// Management information formatting utilities
export interface ManagementInfo {
  tags: string[];
}

export function formatManagementInfo(jobData: any): ManagementInfo {
  return formatManagementInfoUtil(jobData);
}
