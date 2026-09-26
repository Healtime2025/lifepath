ALTER TABLE qualifications
  ADD COLUMN IF NOT EXISTS credits integer;

ALTER TABLE qualifications
  ADD COLUMN IF NOT EXISTS subfield text;
