
// ─── OFFRES D'EMPLOI (existant) ───────────────────────────────────────────────

export interface JobBasicInfo {
  id: string;
  ville: string;
  refOffre: string;
  typeContrat: string;
  raisonSociale: string;
  dateOffre: string;
  nbrePostes: number;
  emploiMetier: string;
}

export interface FullJobOffer extends JobBasicInfo {
  fullDescription: string;
  seoKeywords: string[];
  metaDescription: string;
  suggestedSalaryRange?: string;
  requiredSkills: string[];
}

// ─── ENTREPRISES ──────────────────────────────────────────────────────────────

export interface EntrepriseBasicInfo {
  id: string;
  nom: string;
  secteur: string;
  ville: string;
  siteWeb?: string;
  nbEmployes?: string;
  dateAjout: string;
}

export interface FullEntreprise extends EntrepriseBasicInfo {
  presentation: string;
  seoKeywords: string[];
  metaDescription: string;
  specialites: string[];
  slug: string;
}

// ─── ÉCOLES ───────────────────────────────────────────────────────────────────

export interface EcoleBasicInfo {
  id: string;
  nom: string;
  typeEcole: string;
  ville: string;
  siteWeb?: string;
  dateAjout: string;
}

export interface FullEcole extends EcoleBasicInfo {
  presentation: string;
  seoKeywords: string[];
  metaDescription: string;
  filieres: string[];
  niveauxAcces: string[];
  slug: string;
}

// ─── CONSEILS (articles de blog) ──────────────────────────────────────────────

export interface ConseilArticle {
  id: string;
  titre: string;
  slug: string;
  thematique: string;
  contenu: string;
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  datePubli: string;
  tempsLecture?: string;
}

// ─── COMMUNS ──────────────────────────────────────────────────────────────────

export type AIModel = 'gemini' | 'deepseek';

export type ProcessingStatus = 'idle' | 'extracting' | 'generating' | 'completed' | 'error';

export type AppTab = 'offres' | 'entreprises' | 'ecoles' | 'conseils';
