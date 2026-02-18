
-- Table ecoles : générées par IA à partir d'images/PDF/Excel
CREATE TABLE IF NOT EXISTS ecoles (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nom TEXT NOT NULL,
    type_ecole TEXT NOT NULL,
    ville TEXT NOT NULL,
    site_web TEXT,
    date_ajout TEXT NOT NULL,
    presentation TEXT NOT NULL,
    seo_keywords TEXT[] DEFAULT '{}',
    meta_description TEXT,
    filieres TEXT[] DEFAULT '{}',
    niveaux_acces TEXT[] DEFAULT '{}',
    slug TEXT NOT NULL
);

-- Activer Row Level Security
ALTER TABLE ecoles ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Allow public read access"
ON ecoles FOR SELECT
USING (true);

-- Insertion anonyme (dev/demo)
CREATE POLICY "Allow anonymous insert access"
ON ecoles FOR INSERT
WITH CHECK (true);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_ecoles_slug ON ecoles(slug);
CREATE INDEX IF NOT EXISTS idx_ecoles_type ON ecoles(type_ecole);
CREATE INDEX IF NOT EXISTS idx_ecoles_ville ON ecoles(ville);
