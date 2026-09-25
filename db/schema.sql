CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'learner' CHECK (role IN ('learner','parent','school','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);


CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS password_reset_user_idx ON password_reset_tokens(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS learner_profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  grade text,
  province text,
  school_name text,
  highest_grade_completed text,
  birth_year integer,
  preferred_pathways text[] NOT NULL DEFAULT '{}',
  work_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  onboarding_complete boolean NOT NULL DEFAULT false,
  consent_version text NOT NULL DEFAULT '2026-01',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learner_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  mark numeric(5,2) NOT NULL CHECK (mark >= 0 AND mark <= 100),
  grade text,
  period text,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','report','schoolcore')),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject, grade, period)
);
CREATE INDEX IF NOT EXISTS learner_marks_user_idx ON learner_marks(user_id);

CREATE TABLE IF NOT EXISTS assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version text NOT NULL,
  scores jsonb NOT NULL,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  answers jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS assessment_user_idx ON assessment_results(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  summary text NOT NULL,
  what_you_do text NOT NULL,
  typical_tasks text[] NOT NULL DEFAULT '{}',
  pathways text[] NOT NULL DEFAULT '{}',
  education_notes text,
  subject_guidance jsonb NOT NULL DEFAULT '{}'::jsonb,
  traits jsonb NOT NULL,
  practical_intensity integer NOT NULL DEFAULT 3 CHECK (practical_intensity BETWEEN 1 AND 5),
  academic_intensity integer NOT NULL DEFAULT 3 CHECK (academic_intensity BETWEEN 1 AND 5),
  entrepreneurship_fit integer NOT NULL DEFAULT 3 CHECK (entrepreneurship_fit BETWEEN 1 AND 5),
  future_outlook text NOT NULL DEFAULT 'stable',
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS careers_category_idx ON careers(category);

CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  institution_type text NOT NULL,
  province text,
  city text,
  website_url text,
  application_url text,
  verification_status text NOT NULL DEFAULT 'needs_verification' CHECK (verification_status IN ('verified','needs_verification','inactive')),
  verification_body text,
  registration_number text,
  verification_source_url text,
  verification_checked_at timestamptz,
  public_institution boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS institutions_name_idx ON institutions USING gin (to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS institutions_type_idx ON institutions(institution_type);

CREATE TABLE IF NOT EXISTS qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  qualification_type text NOT NULL,
  nqf_level integer,
  saqa_id text NOT NULL DEFAULT '',
  field text,
  duration_text text,
  source_url text,
  active boolean NOT NULL DEFAULT true,
  UNIQUE(title, qualification_type, saqa_id)
);

CREATE TABLE IF NOT EXISTS career_qualifications (
  career_id uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  qualification_id uuid NOT NULL REFERENCES qualifications(id) ON DELETE CASCADE,
  relevance text NOT NULL DEFAULT 'primary',
  PRIMARY KEY(career_id, qualification_id)
);

CREATE TABLE IF NOT EXISTS programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  qualification_id uuid REFERENCES qualifications(id) ON DELETE SET NULL,
  name text NOT NULL,
  faculty text,
  campus text,
  application_url text,
  programme_url text,
  requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  application_open_date date,
  application_close_date date,
  academic_year integer,
  verified_at timestamptz,
  source_url text,
  active boolean NOT NULL DEFAULT true,
  UNIQUE(institution_id, name, academic_year)
);
CREATE INDEX IF NOT EXISTS programmes_institution_idx ON programmes(institution_id);

CREATE TABLE IF NOT EXISTS funding_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  funding_type text NOT NULL,
  summary text NOT NULL,
  eligible_pathways text[] NOT NULL DEFAULT '{}',
  eligible_fields text[] NOT NULL DEFAULT '{}',
  eligibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  application_url text,
  info_url text,
  opens_on date,
  closes_on date,
  recurring boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  verification_source_url text,
  verified_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  UNIQUE(name, provider)
);
CREATE INDEX IF NOT EXISTS funding_close_idx ON funding_opportunities(closes_on);

CREATE TABLE IF NOT EXISTS saved_careers (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_id uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, career_id)
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES institutions(id) ON DELETE SET NULL,
  programme_id uuid REFERENCES programmes(id) ON DELETE SET NULL,
  funding_id uuid REFERENCES funding_opportunities(id) ON DELETE SET NULL,
  title text NOT NULL,
  application_type text NOT NULL CHECK (application_type IN ('study','funding','learnership','apprenticeship','employment','other')),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','started','submitted','awaiting','offered','accepted','declined','closed')),
  external_url text,
  deadline date,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS applications_user_idx ON applications(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS progress_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS progress_user_idx ON progress_events(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS schoolcore_links (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  schoolcore_learner_id text UNIQUE NOT NULL,
  schoolcore_school_id text,
  linked_at timestamptz NOT NULL DEFAULT now(),
  last_sync_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth_attempts (
  id bigserial PRIMARY KEY,
  email text NOT NULL,
  ip text,
  success boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_attempts_lookup_idx ON auth_attempts(email, created_at DESC);

CREATE TABLE IF NOT EXISTS data_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  import_type text NOT NULL,
  source_name text NOT NULL,
  source_url text,
  records_total integer NOT NULL DEFAULT 0,
  records_upserted integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
