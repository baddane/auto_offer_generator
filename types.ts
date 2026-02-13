
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

export type AIModel = 'gemini' | 'deepseek';

export type ProcessingStatus = 'idle' | 'extracting' | 'generating' | 'completed' | 'error';
