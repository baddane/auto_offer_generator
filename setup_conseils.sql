
-- Table conseils : articles de blog SEO générés par IA à partir d'un titre/thématique
CREATE TABLE IF NOT EXISTS conseils (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    titre TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    thematique TEXT NOT NULL,
    contenu TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}',
    date_publi TEXT NOT NULL,
    temps_lecture TEXT
);

-- Activer Row Level Security
ALTER TABLE conseils ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Allow public read access"
ON conseils FOR SELECT
USING (true);

-- Insertion anonyme (dev/demo)
CREATE POLICY "Allow anonymous insert access"
ON conseils FOR INSERT
WITH CHECK (true);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_conseils_slug ON conseils(slug);
CREATE INDEX IF NOT EXISTS idx_conseils_thematique ON conseils(thematique);
CREATE INDEX IF NOT EXISTS idx_conseils_date ON conseils(date_publi);
