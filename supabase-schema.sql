-- Create the jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('Full-Time', 'Part-Time', 'Contract')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read jobs
CREATE POLICY "Anyone can read jobs" ON jobs
  FOR SELECT USING (true);

-- Users can insert their own jobs
CREATE POLICY "Users can insert their own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update their own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own jobs
CREATE POLICY "Users can delete their own jobs" ON jobs
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_location ON jobs USING gin(to_tsvector('english', location));

INSERT INTO jobs (title, company_name, description, location, job_type, user_id) VALUES
(
  'Senior Frontend Developer',
  'TechCorp',
  'We are looking for an experienced frontend developer to join our team. You will be responsible for building user-facing features using React, TypeScript, and modern web technologies. The ideal candidate has 5+ years of experience in frontend development and a passion for creating exceptional user experiences.',
  'San Francisco, CA',
  'Full-Time',
  '00000000-0000-0000-0000-000000000001'
),
(
  'Product Manager',
  'StartupXYZ',
  'Join our fast-growing startup as a Product Manager. You will own the product roadmap, work closely with engineering and design teams, and drive product strategy. Experience with B2B SaaS products preferred. We offer equity, competitive salary, and the opportunity to shape the future of our product.',
  'Remote',
  'Full-Time',
  '00000000-0000-0000-0000-000000000002'
),
(
  'UX Designer',
  'DesignStudio',
  'We are seeking a talented UX Designer to create exceptional user experiences for our digital products. You should have strong skills in user research, wireframing, prototyping, and design systems. Portfolio showcasing mobile and web design work required.',
  'New York, NY',
  'Part-Time',
  '00000000-0000-0000-0000-000000000003'
),
(
  'DevOps Engineer',
  'CloudTech',
  'Looking for a DevOps Engineer to help build and maintain our cloud infrastructure. Experience with AWS, Docker, Kubernetes, and CI/CD pipelines required. You will work on automation, monitoring, and scalability challenges in a high-growth environment.',
  'Austin, TX',
  'Full-Time',
  '00000000-0000-0000-0000-000000000004'
),
(
  'Data Scientist',
  'DataCorp',
  'We need a Data Scientist to analyze large datasets and build machine learning models. Strong background in Python, SQL, and statistical analysis required. Experience with TensorFlow or PyTorch is a plus. Help us turn data into actionable insights.',
  'Seattle, WA',
  'Contract',
  '00000000-0000-0000-0000-000000000005'
),
(
  'Backend Developer',
  'ApiFirst',
  'Join our team as a Backend Developer working on scalable API services. Experience with Node.js, PostgreSQL, and microservices architecture required. You will design and implement robust backend systems that power our customer-facing applications.',
  'Remote',
  'Full-Time',
  '00000000-0000-0000-0000-000000000006'
),
(
  'Marketing Specialist',
  'GrowthCo',
  'We are hiring a Marketing Specialist to drive our digital marketing campaigns. Experience with SEO, content marketing, and social media required. You will work on increasing brand awareness and generating qualified leads for our B2B products.',
  'Los Angeles, CA',
  'Part-Time',
  '00000000-0000-0000-0000-000000000007'
),
(
  'Mobile App Developer',
  'MobileFirst',
  'Looking for a Mobile App Developer with expertise in React Native or Flutter. You will build cross-platform mobile applications with focus on performance and user experience. Experience with app store deployment and mobile-specific UX patterns required.',
  'Chicago, IL',
  'Contract',
  '00000000-0000-0000-0000-000000000008'
),
(
  'Sales Representative',
  'SalesPro',
  'Join our sales team as a Sales Representative focusing on enterprise clients. Experience in B2B sales and CRM systems required. You will identify prospects, conduct demos, and close deals. Competitive commission structure and career growth opportunities.',
  'Boston, MA',
  'Full-Time',
  '00000000-0000-0000-0000-000000000009'
),
(
  'Quality Assurance Engineer',
  'TestLab',
  'We need a QA Engineer to ensure the quality of our software products. Experience with automated testing, test planning, and bug tracking required. You will work closely with development teams to maintain high standards of software quality.',
  'Denver, CO',
  'Full-Time',
  '00000000-0000-0000-0000-000000000010'
);
