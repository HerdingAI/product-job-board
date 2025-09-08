-- Full-text search setup and RPC for jobs search with ranking & filters
-- Safe to run multiple times; uses IF NOT EXISTS guards where possible

-- 1) Ensure search_vector column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='jobs' AND column_name='search_vector'
    ) THEN
        ALTER TABLE public.jobs ADD COLUMN search_vector tsvector;
    END IF;
END $$;

-- 2) Trigger to maintain search_vector
CREATE OR REPLACE FUNCTION public.update_job_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.company, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.required_skills, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.preferred_skills, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.core_pm_skills, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.technical_skills, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.domain_expertise, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.leadership_skills, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_jobs_search_vector ON public.jobs;
CREATE TRIGGER trg_update_jobs_search_vector
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.update_job_search_vector();

-- 3) GIN index for fast FTS
CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON public.jobs USING gin(search_vector);

-- Backfill search_vector where null
UPDATE public.jobs SET search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(company, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(required_skills, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(preferred_skills, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(core_pm_skills, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(technical_skills, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(domain_expertise, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(leadership_skills, '')), 'B')
WHERE search_vector IS NULL;

-- 4) RPC: search_jobs(search_term, filters, limit, offset)
CREATE OR REPLACE FUNCTION public.search_jobs(
    search_term text DEFAULT '',
    filters jsonb DEFAULT '{}',
    page_limit int DEFAULT 50,
    page_offset int DEFAULT 0
) RETURNS TABLE (
    id text,
    job_url text,
    title text,
    company text,
    location text,
    posted text,
    salary text,
    description text,
    apply_url text,
    employment_type text,
    is_remote integer,
    is_hybrid integer,
    is_onsite integer,
    created_at timestamptz,
    updated_at timestamptz,
    job_category text,
    seniority_level text,
    salary_min integer,
    salary_max integer,
    salary_currency text,
    location_state text,
    location_country text,
    is_bay_area boolean,
    is_top_tech_hub boolean,
    is_currently_active boolean,
    enrichment_version text,
    llm_processed boolean,
    llm_processing_date timestamptz,
    llm_processing_errors text,
    years_experience_min integer,
    years_experience_max integer,
    equity_mentioned boolean,
    bonus_mentioned boolean,
    compensation_tier text,
    work_arrangement text,
    remote_flexibility text,
    technical_depth_required text,
    is_international boolean,
    product_lifecycle_stage text,
    team_size_indication text,
    industry_vertical text,
    business_model text,
    required_skills text,
    preferred_skills text,
    growth_indicators text,
    extraction_confidence text,
    is_product_job boolean,
    is_ai_ml boolean,
    is_ai_pm integer,
    management_scope text,
    experience_bucket text,
    product_domain text,
    core_pm_skills text,
    technical_skills text,
    domain_expertise text,
    leadership_skills text,
    location_metro text,
    company_stage text,
    processing_errors integer,
    is_high_priority boolean,
    resume_eval_version text,
    resume_evaluated boolean,
    product_lifecycle_focus text,
    scope_of_ownership text,
    strategic_tactical_balance text,
    primary_responsibilities text[],
    product_culture_type text,
    team_composition jsonb,
    product_methodology text[],
    collaboration_model text,
    tools_platforms jsonb,
    kpi_ownership text[],
    reporting_structure text,
    customer_type text,
    hiring_velocity text,
    compensation_transparency text,
    ai_ml_focus jsonb,
    location_city text,
    search_vector tsvector,
    search_rank real
) AS $$
DECLARE
  where_clauses text := 'is_currently_active = true AND is_product_job = true';
  order_clause text := ' ORDER BY created_at DESC';
  q text := '';
BEGIN
  -- Build search query and ranking when search_term provided
  IF search_term IS NOT NULL AND length(trim(search_term)) > 0 THEN
    q := 'plainto_tsquery(''english'', ' || quote_literal(trim(search_term)) || ')';
    where_clauses := where_clauses || ' AND search_vector @@ ' || q;
    order_clause := ' ORDER BY ts_rank_cd(search_vector, ' || q || ') DESC, created_at DESC';
  END IF;

  -- Filters (JSONB)
  IF coalesce(filters->>'seniority','') <> '' THEN
    where_clauses := where_clauses || ' AND seniority_level = ' || quote_literal(filters->>'seniority');
  END IF;
  IF coalesce(filters->>'location','') <> '' THEN
    where_clauses := where_clauses || ' AND location_metro = ' || quote_literal(filters->>'location');
  END IF;
  IF coalesce(filters->>'workArrangement','') <> '' THEN
    where_clauses := where_clauses || ' AND work_arrangement = ' || quote_literal(filters->>'workArrangement');
  END IF;

  IF jsonb_typeof(filters->'companyStage') = 'array' AND jsonb_array_length(filters->'companyStage') > 0 THEN
    where_clauses := where_clauses || ' AND company_stage = ANY(SELECT array_agg(x::text) FROM jsonb_array_elements_text(' || quote_literal(filters->'companyStage') || '::jsonb) AS t(x))';
  END IF;
  IF jsonb_typeof(filters->'productLifecycle') = 'array' AND jsonb_array_length(filters->'productLifecycle') > 0 THEN
    where_clauses := where_clauses || ' AND product_lifecycle_focus = ANY(SELECT array_agg(x::text) FROM jsonb_array_elements_text(' || quote_literal(filters->'productLifecycle') || '::jsonb) AS t(x))';
  END IF;
  IF jsonb_typeof(filters->'productDomain') = 'array' AND jsonb_array_length(filters->'productDomain') > 0 THEN
    where_clauses := where_clauses || ' AND product_domain = ANY(SELECT array_agg(x::text) FROM jsonb_array_elements_text(' || quote_literal(filters->'productDomain') || '::jsonb) AS t(x))';
  END IF;
  IF jsonb_typeof(filters->'managementScope') = 'array' AND jsonb_array_length(filters->'managementScope') > 0 THEN
    where_clauses := where_clauses || ' AND management_scope = ANY(SELECT array_agg(x::text) FROM jsonb_array_elements_text(' || quote_literal(filters->'managementScope') || '::jsonb) AS t(x))';
  END IF;
  IF jsonb_typeof(filters->'industryVertical') = 'array' AND jsonb_array_length(filters->'industryVertical') > 0 THEN
    where_clauses := where_clauses || ' AND industry_vertical = ANY(SELECT array_agg(x::text) FROM jsonb_array_elements_text(' || quote_literal(filters->'industryVertical') || '::jsonb) AS t(x))';
  END IF;
  IF jsonb_typeof(filters->'experienceBucket') = 'array' AND jsonb_array_length(filters->'experienceBucket') > 0 THEN
    where_clauses := where_clauses || ' AND experience_bucket = ANY(SELECT array_agg(x::text) FROM jsonb_array_elements_text(' || quote_literal(filters->'experienceBucket') || '::jsonb) AS t(x))';
  END IF;
  IF jsonb_typeof(filters->'domainExpertise') = 'array' AND jsonb_array_length(filters->'domainExpertise') > 0 THEN
    where_clauses := where_clauses || ' AND domain_expertise = ANY(SELECT array_agg(x::text) FROM jsonb_array_elements_text(' || quote_literal(filters->'domainExpertise') || '::jsonb) AS t(x))';
  END IF;
  IF coalesce(filters->>'salaryMin','') <> '' THEN
    where_clauses := where_clauses || ' AND salary_min >= ' || (filters->>'salaryMin');
  END IF;
  IF coalesce(filters->>'salaryMax','') <> '' THEN
    where_clauses := where_clauses || ' AND salary_max <= ' || (filters->>'salaryMax');
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT *, %s AS search_rank FROM public.jobs WHERE %s %s LIMIT %s OFFSET %s',
    CASE WHEN search_term IS NULL OR length(trim(search_term)) = 0 THEN '0.5' 
         ELSE 'ts_rank_cd(search_vector, plainto_tsquery(''english'', ' || quote_literal(trim(search_term)) || '))' END,
    where_clauses,
    order_clause,
    page_limit,
    page_offset
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
