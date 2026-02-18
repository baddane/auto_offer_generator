
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FullJobOffer, FullEntreprise, FullEcole, ConseilArticle } from '../types';

// These environment variables are assumed to be provided in the environment
const supabaseUrl = (process.env as any).SUPABASE_URL;
const supabaseAnonKey = (process.env as any).SUPABASE_ANON_KEY;

console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Loaded' : 'Not found');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Loaded' : 'Not found');

// Initialize the client only if keys are available to avoid "supabaseUrl is required" error
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
} else {
  console.warn('Supabase client not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY.');
}

// ─── OFFRES D'EMPLOI ──────────────────────────────────────────────────────────

export const fetchAllJobs = async (): Promise<FullJobOffer[]> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY.');
    return [];
  }

  const { data, error } = await supabase
    .from('job_offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    ville: item.ville,
    refOffre: item.ref_offre,
    typeContrat: item.type_contrat,
    raisonSociale: item.raison_sociale,
    dateOffre: item.date_offre,
    nbrePostes: item.nbre_postes,
    emploiMetier: item.emploi_metier,
    fullDescription: item.full_description,
    seoKeywords: item.seo_keywords,
    metaDescription: item.meta_description,
    suggestedSalaryRange: item.suggested_salary_range,
    requiredSkills: item.required_skills,
  }));
};

export const saveJobOffer = async (job: FullJobOffer): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Saving to cloud is disabled.');
    return false;
  }

  console.log('Attempting to save job:', job.id, job.emploiMetier);

  const { error } = await supabase
    .from('job_offers')
    .insert([{
      id: job.id,
      ville: job.ville,
      ref_offre: job.refOffre,
      type_contrat: job.typeContrat,
      raison_sociale: job.raisonSociale,
      date_offre: job.dateOffre,
      nbre_postes: job.nbrePostes,
      emploi_metier: job.emploiMetier,
      full_description: job.fullDescription,
      seo_keywords: job.seoKeywords,
      meta_description: job.metaDescription,
      suggested_salary_range: job.suggestedSalaryRange,
      required_skills: job.requiredSkills,
    }]);

  if (error) {
    console.error('Error saving job:', error);
    return false;
  }

  console.log('Job saved successfully:', job.id);
  return true;
};

// ─── ENTREPRISES ──────────────────────────────────────────────────────────────

export const fetchAllEntreprises = async (): Promise<FullEntreprise[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('entreprises')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching entreprises:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    nom: item.nom,
    secteur: item.secteur,
    ville: item.ville,
    siteWeb: item.site_web,
    nbEmployes: item.nb_employes,
    dateAjout: item.date_ajout,
    presentation: item.presentation,
    seoKeywords: item.seo_keywords,
    metaDescription: item.meta_description,
    specialites: item.specialites,
    slug: item.slug,
  }));
};

export const saveEntreprise = async (entreprise: FullEntreprise): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Saving to cloud is disabled.');
    return false;
  }

  const { error } = await supabase
    .from('entreprises')
    .insert([{
      id: entreprise.id,
      nom: entreprise.nom,
      secteur: entreprise.secteur,
      ville: entreprise.ville,
      site_web: entreprise.siteWeb,
      nb_employes: entreprise.nbEmployes,
      date_ajout: entreprise.dateAjout,
      presentation: entreprise.presentation,
      seo_keywords: entreprise.seoKeywords,
      meta_description: entreprise.metaDescription,
      specialites: entreprise.specialites,
      slug: entreprise.slug,
    }]);

  if (error) {
    console.error('Error saving entreprise:', error);
    return false;
  }

  return true;
};

// ─── ÉCOLES ───────────────────────────────────────────────────────────────────

export const fetchAllEcoles = async (): Promise<FullEcole[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('ecoles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching ecoles:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    nom: item.nom,
    typeEcole: item.type_ecole,
    ville: item.ville,
    siteWeb: item.site_web,
    dateAjout: item.date_ajout,
    presentation: item.presentation,
    seoKeywords: item.seo_keywords,
    metaDescription: item.meta_description,
    filieres: item.filieres,
    niveauxAcces: item.niveaux_acces,
    slug: item.slug,
  }));
};

export const saveEcole = async (ecole: FullEcole): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Saving to cloud is disabled.');
    return false;
  }

  const { error } = await supabase
    .from('ecoles')
    .insert([{
      id: ecole.id,
      nom: ecole.nom,
      type_ecole: ecole.typeEcole,
      ville: ecole.ville,
      site_web: ecole.siteWeb,
      date_ajout: ecole.dateAjout,
      presentation: ecole.presentation,
      seo_keywords: ecole.seoKeywords,
      meta_description: ecole.metaDescription,
      filieres: ecole.filieres,
      niveaux_acces: ecole.niveauxAcces,
      slug: ecole.slug,
    }]);

  if (error) {
    console.error('Error saving ecole:', error);
    return false;
  }

  return true;
};

// ─── CONSEILS ─────────────────────────────────────────────────────────────────

export const fetchAllConseils = async (): Promise<ConseilArticle[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('conseils')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conseils:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    titre: item.titre,
    slug: item.slug,
    thematique: item.thematique,
    contenu: item.contenu,
    metaTitle: item.meta_title,
    metaDescription: item.meta_description,
    seoKeywords: item.seo_keywords,
    datePubli: item.date_publi,
    tempsLecture: item.temps_lecture,
  }));
};

export const saveConseil = async (conseil: ConseilArticle): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase client not initialized. Saving to cloud is disabled.');
    return false;
  }

  const { error } = await supabase
    .from('conseils')
    .insert([{
      id: conseil.id,
      titre: conseil.titre,
      slug: conseil.slug,
      thematique: conseil.thematique,
      contenu: conseil.contenu,
      meta_title: conseil.metaTitle,
      meta_description: conseil.metaDescription,
      seo_keywords: conseil.seoKeywords,
      date_publi: conseil.datePubli,
      temps_lecture: conseil.tempsLecture,
    }]);

  if (error) {
    console.error('Error saving conseil:', error);
    return false;
  }

  return true;
};

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────

export const testSupabaseConnection = async (): Promise<boolean> => {
  console.log('Testing Supabase connection...');

  if (!supabase) {
    console.warn('Supabase client not initialized.');
    return false;
  }

  try {
    const { count, error } = await supabase
      .from('job_offers')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Test query failed:', error);
      return false;
    }
    console.log('Supabase connection test successful, total jobs:', count);
    return true;
  } catch (err) {
    console.error('Test connection error:', err);
    return false;
  }
};
