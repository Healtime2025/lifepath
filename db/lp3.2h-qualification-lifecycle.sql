ALTER TABLE qualifications
  ADD COLUMN IF NOT EXISTS registration_status text,
  ADD COLUMN IF NOT EXISTS registration_start_date date,
  ADD COLUMN IF NOT EXISTS registration_end_date date,
  ADD COLUMN IF NOT EXISTS last_enrolment_date date,
  ADD COLUMN IF NOT EXISTS last_achievement_date date;
