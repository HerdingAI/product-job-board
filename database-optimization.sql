-- Database performance optimization for job board
-- Run these commands in your Supabase SQL editor for better performance

-- 1. Index for job listing queries (most common)
CREATE INDEX IF NOT EXISTS idx_jobs_active_product 
ON jobs (is_currently_active, is_product_job) 
WHERE is_currently_active = true AND is_product_job = true;

-- 2. Index for search queries
CREATE INDEX IF NOT EXISTS idx_jobs_search 
ON jobs USING gin(to_tsvector('english', title || ' ' || company || ' ' || COALESCE(description, '')));

-- 3. Index for filter combinations
CREATE INDEX IF NOT EXISTS idx_jobs_filters 
ON jobs (seniority_level, location_metro, work_arrangement, company_stage, industry_vertical)
WHERE is_currently_active = true AND is_product_job = true;

-- 4. Index for salary range queries
CREATE INDEX IF NOT EXISTS idx_jobs_salary 
ON jobs (salary_min, salary_max)
WHERE is_currently_active = true AND is_product_job = true;

-- 5. Index for date sorting (most recent first)
CREATE INDEX IF NOT EXISTS idx_jobs_created_at 
ON jobs (created_at DESC)
WHERE is_currently_active = true AND is_product_job = true;

-- 6. Composite index for common filter + search combinations
CREATE INDEX IF NOT EXISTS idx_jobs_composite 
ON jobs (is_currently_active, is_product_job, seniority_level, work_arrangement, created_at DESC);

-- 7. Analyze tables for better query planning
ANALYZE jobs;

-- Performance monitoring view
CREATE OR REPLACE VIEW job_search_performance AS
SELECT 
  COUNT(*) as total_active_jobs,
  COUNT(DISTINCT seniority_level) as seniority_options,
  COUNT(DISTINCT location_metro) as location_options,
  COUNT(DISTINCT work_arrangement) as work_arrangement_options,
  COUNT(DISTINCT industry_vertical) as industry_options,
  AVG(LENGTH(description)) as avg_description_length
FROM jobs 
WHERE is_currently_active = true AND is_product_job = true;
