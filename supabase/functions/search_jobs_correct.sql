-- Drop the existing function
DROP FUNCTION IF EXISTS search_jobs(text, jsonb, integer, integer);

-- Create the corrected search_jobs function matching the actual database schema
CREATE OR REPLACE FUNCTION search_jobs(
  search_term text DEFAULT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  page_limit integer DEFAULT 50,
  page_offset integer DEFAULT 0
)
RETURNS TABLE(
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
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
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
    llm_processing_date timestamp with time zone,
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
  filter_array text[];
BEGIN
  -- Build search query and ranking when search_term provided
  IF search_term IS NOT NULL AND length(trim(search_term)) > 0 THEN
    q := 'plainto_tsquery(''english'', ' || quote_literal(trim(search_term)) || ')';
    where_clauses := where_clauses || ' AND search_vector @@ ' || q;
    order_clause := ' ORDER BY ts_rank_cd(search_vector, ' || q || ') DESC, created_at DESC';
  END IF;

  -- Single value filters
  IF coalesce(filters->>'seniority','') <> '' THEN
    where_clauses := where_clauses || ' AND seniority_level = ' || quote_literal(filters->>'seniority');
  END IF;
  IF coalesce(filters->>'location','') <> '' THEN
    where_clauses := where_clauses || ' AND location_metro = ' || quote_literal(filters->>'location');
  END IF;
  IF coalesce(filters->>'workArrangement','') <> '' THEN
    where_clauses := where_clauses || ' AND work_arrangement = ' || quote_literal(filters->>'workArrangement');
  END IF;

  -- Array filters with simplified approach using ILIKE for text matching
  IF jsonb_typeof(filters->'companyStage') = 'array' AND jsonb_array_length(filters->'companyStage') > 0 THEN
    SELECT array_agg(value::text) INTO filter_array FROM jsonb_array_elements_text(filters->'companyStage');
    where_clauses := where_clauses || ' AND company_stage = ANY(' || quote_literal(filter_array) || ')';
  END IF;
  
  IF jsonb_typeof(filters->'productLifecycle') = 'array' AND jsonb_array_length(filters->'productLifecycle') > 0 THEN
    SELECT array_agg(value::text) INTO filter_array FROM jsonb_array_elements_text(filters->'productLifecycle');
    where_clauses := where_clauses || ' AND product_lifecycle_focus = ANY(' || quote_literal(filter_array) || ')';
  END IF;
  
  IF jsonb_typeof(filters->'productDomain') = 'array' AND jsonb_array_length(filters->'productDomain') > 0 THEN
    SELECT array_agg(value::text) INTO filter_array FROM jsonb_array_elements_text(filters->'productDomain');
    where_clauses := where_clauses || ' AND product_domain = ANY(' || quote_literal(filter_array) || ')';
  END IF;
  
  IF jsonb_typeof(filters->'managementScope') = 'array' AND jsonb_array_length(filters->'managementScope') > 0 THEN
    SELECT array_agg(value::text) INTO filter_array FROM jsonb_array_elements_text(filters->'managementScope');
    where_clauses := where_clauses || ' AND management_scope = ANY(' || quote_literal(filter_array) || ')';
  END IF;
  
  IF jsonb_typeof(filters->'industryVertical') = 'array' AND jsonb_array_length(filters->'industryVertical') > 0 THEN
    SELECT array_agg(value::text) INTO filter_array FROM jsonb_array_elements_text(filters->'industryVertical');
    where_clauses := where_clauses || ' AND industry_vertical = ANY(' || quote_literal(filter_array) || ')';
  END IF;
  
  IF jsonb_typeof(filters->'experienceBucket') = 'array' AND jsonb_array_length(filters->'experienceBucket') > 0 THEN
    SELECT array_agg(value::text) INTO filter_array FROM jsonb_array_elements_text(filters->'experienceBucket');
    where_clauses := where_clauses || ' AND experience_bucket = ANY(' || quote_literal(filter_array) || ')';
  END IF;
  
  IF jsonb_typeof(filters->'domainExpertise') = 'array' AND jsonb_array_length(filters->'domainExpertise') > 0 THEN
    SELECT array_agg(value::text) INTO filter_array FROM jsonb_array_elements_text(filters->'domainExpertise');
    where_clauses := where_clauses || ' AND domain_expertise = ANY(' || quote_literal(filter_array) || ')';
  END IF;

  -- Salary filters
  IF coalesce(filters->>'salaryMin','') <> '' THEN
    where_clauses := where_clauses || ' AND salary_min >= ' || (filters->>'salaryMin');
  END IF;
  IF coalesce(filters->>'salaryMax','') <> '' THEN
    where_clauses := where_clauses || ' AND salary_max <= ' || (filters->>'salaryMax');
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT 
      id, job_url, title, company, location, posted, salary, description, apply_url, 
      employment_type, is_remote, is_hybrid, is_onsite, created_at, updated_at, 
      job_category, seniority_level, salary_min, salary_max, salary_currency, 
      location_state, location_country, is_bay_area, is_top_tech_hub, is_currently_active, 
      enrichment_version, llm_processed, llm_processing_date, llm_processing_errors, 
      years_experience_min, years_experience_max, equity_mentioned, bonus_mentioned, 
      compensation_tier, work_arrangement, remote_flexibility, technical_depth_required, 
      is_international, product_lifecycle_stage, team_size_indication, industry_vertical, 
      business_model, required_skills, preferred_skills, growth_indicators, 
      extraction_confidence, is_product_job, is_ai_ml, is_ai_pm, management_scope, 
      experience_bucket, product_domain, core_pm_skills, technical_skills, 
      domain_expertise, leadership_skills, location_metro, company_stage, 
      processing_errors, is_high_priority, resume_eval_version, resume_evaluated, 
      product_lifecycle_focus, scope_of_ownership, strategic_tactical_balance, 
      primary_responsibilities, product_culture_type, team_composition, 
      product_methodology, collaboration_model, tools_platforms, kpi_ownership, 
      reporting_structure, customer_type, hiring_velocity, compensation_transparency, 
      ai_ml_focus, location_city, search_vector,
      %s AS search_rank 
    FROM public.jobs WHERE %s %s LIMIT %s OFFSET %s',
    CASE WHEN search_term IS NULL OR length(trim(search_term)) = 0 THEN '0.5' 
         ELSE 'ts_rank_cd(search_vector, plainto_tsquery(''english'', ' || quote_literal(trim(search_term)) || '))' END,
    where_clauses,
    order_clause,
    page_limit,
    page_offset
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
