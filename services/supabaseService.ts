
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FullJobOffer } from '../types';

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
  console.log('SUPABASE_URL:', supabaseUrl);
  console.log('SUPABASE_ANON_KEY:', supabaseAnonKey);
}

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
    requiredSkills: item.required_skills
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
      required_skills: job.requiredSkills
    }]);

  if (error) {
    console.error('Error saving job:', error);
    return false;
  }

  console.log('Job saved successfully:', job.id);
  return true;
};

// Fonction de test pour vérifier la connexion Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  console.log('Testing Supabase connection...');
  
  if (!supabase) {
    console.warn('Supabase client not initialized.');
    return false;
  }

  try {
    console.log('Attempting to connect to Supabase...');
    // Utilisation correcte de count avec Supabase
    const { count, error } = await supabase
      .from('job_offers')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Test query failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return false;
    }
    console.log('Supabase connection test successful, total jobs:', count);
    return true;
  } catch (err) {
    console.error('Test connection error:', err);
    return false;
  }
};
