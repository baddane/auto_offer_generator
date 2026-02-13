
-- Create the job_offers table
CREATE TABLE IF NOT EXISTS job_offers (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ville TEXT NOT NULL,
    ref_offre TEXT NOT NULL,
    type_contrat TEXT NOT NULL,
    raison_sociale TEXT NOT NULL,
    date_offre TEXT NOT NULL,
    nbre_postes INTEGER DEFAULT 1,
    emploi_metier TEXT NOT NULL,
    full_description TEXT NOT NULL,
    seo_keywords TEXT[] DEFAULT '{}',
    meta_description TEXT,
    suggested_salary_range TEXT,
    required_skills TEXT[] DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read job offers
CREATE POLICY "Allow public read access" 
ON job_offers FOR SELECT 
USING (true);

-- Create a policy that allows anonymous inserts (for development/demo purposes)
-- Note: In a production app, you'd restrict this to authenticated users
CREATE POLICY "Allow anonymous insert access" 
ON job_offers FOR INSERT 
WITH CHECK (true);

-- Create an index on ref_offre for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_offers_ref_offre ON job_offers(ref_offre);
