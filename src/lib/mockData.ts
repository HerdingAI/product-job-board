// Mock data for development purposes when Supabase is not configured
export const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company_name: 'TechCorp',
    description: 'We are looking for an experienced frontend developer to join our team. You will be responsible for building user-facing features using React, TypeScript, and modern web technologies. The ideal candidate has 5+ years of experience in frontend development.',
    location: 'San Francisco, CA',
    job_type: 'Full-Time' as const,
    created_at: '2025-09-01T10:00:00Z',
    user_id: 'user-1'
  },
  {
    id: '2',
    title: 'Product Manager',
    company_name: 'StartupXYZ',
    description: 'Join our fast-growing startup as a Product Manager. You will own the product roadmap, work closely with engineering and design teams, and drive product strategy. Experience with B2B SaaS products preferred.',
    location: 'Remote',
    job_type: 'Full-Time' as const,
    created_at: '2025-08-30T14:30:00Z',
    user_id: 'user-2'
  },
  {
    id: '3',
    title: 'UX Designer',
    company_name: 'DesignStudio',
    description: 'We\'re seeking a talented UX Designer to create exceptional user experiences for our digital products. You should have strong skills in user research, wireframing, prototyping, and design systems.',
    location: 'New York, NY',
    job_type: 'Part-Time' as const,
    created_at: '2025-08-28T09:15:00Z',
    user_id: 'user-3'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company_name: 'CloudTech',
    description: 'Looking for a DevOps Engineer to help build and maintain our cloud infrastructure. Experience with AWS, Docker, Kubernetes, and CI/CD pipelines required. You will work on automation, monitoring, and scalability.',
    location: 'Austin, TX',
    job_type: 'Contract' as const,
    created_at: '2025-08-25T16:45:00Z',
    user_id: 'user-4'
  },
  {
    id: '5',
    title: 'Data Scientist',
    company_name: 'DataCorp',
    description: 'Join our data science team to analyze large datasets and build machine learning models. We\'re looking for someone with strong Python skills, experience with pandas, scikit-learn, and statistical analysis.',
    location: 'Seattle, WA',
    job_type: 'Full-Time' as const,
    created_at: '2025-08-20T11:20:00Z',
    user_id: 'user-5'
  }
]

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return !!(url && 
           key && 
           url !== 'https://placeholder.supabase.co' && 
           key !== 'placeholder_anon_key' &&
           url.includes('supabase.co'))
}
