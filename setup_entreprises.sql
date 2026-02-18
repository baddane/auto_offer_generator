
-- Table entreprises : générées par IA à partir d'images/PDF/Excel
CREATE TABLE IF NOT EXISTS entreprises (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nom TEXT NOT NULL,
    secteur TEXT NOT NULL,
    ville TEXT NOT NULL,
    site_web TEXT,
    nb_employes TEXT,
    date_ajout TEXT NOT NULL,
    presentation TEXT NOT NULL,
    seo_keywords TEXT[] DEFAULT '{}',
    meta_description TEXT,
    specialites TEXT[] DEFAULT '{}',
    slug TEXT NOT NULL
);

-- Activer Row Level Security
ALTER TABLE entreprises ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Allow public read access"
ON entreprises FOR SELECT
USING (true);

-- Insertion anonyme (dev/demo)
CREATE POLICY "Allow anonymous insert access"
ON entreprises FOR INSERT
WITH CHECK (true);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_entreprises_slug ON entreprises(slug);
CREATE INDEX IF NOT EXISTS idx_entreprises_secteur ON entreprises(secteur);
CREATE INDEX IF NOT EXISTS idx_entreprises_ville ON entreprises(ville);
