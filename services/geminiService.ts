
import { GoogleGenAI, Type } from "@google/genai";
import { JobBasicInfo, FullJobOffer, AIModel } from "../types";

/**
 * Fonction utilitaire pour appeler l'API DeepSeek V3
 */
async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = (process.env as any).DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === "votre_cle_deepseek_ici") {
    throw new Error("Clé API DeepSeek non configurée dans le fichier .env");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en recrutement et SEO. Tu rédiges des offres d'emploi percutantes. Réponds uniquement en format JSON pur." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erreur DeepSeek: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Extrait les données structurées à partir d'une image ou d'un fichier.
 * Utilise Gemini 3 Flash pour ses capacités de vision et sa rapidité.
 */
export const extractJobsFromImage = async (base64Image: string, modelType: AIModel = 'gemini'): Promise<JobBasicInfo[]> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "votre_cle_gemini_ici") {
    throw new Error("Clé API Gemini (GEMINI_API_KEY) non configurée dans le fichier .env");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/png', // Le navigateur convertit souvent en PNG via FileReader
            },
          },
          { 
            text: "Analyse cette image d'offre d'emploi ou ce tableau. Extrait CHAQUE poste de manière structurée. Si c'est un tableau, retourne chaque ligne comme un objet." 
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            ville: { type: Type.STRING, description: "Ville du poste" },
            refOffre: { type: Type.STRING, description: "Référence de l'offre" },
            typeContrat: { type: Type.STRING, description: "CDI, CDD, Interim, etc." },
            raisonSociale: { type: Type.STRING, description: "Nom de l'entreprise" },
            dateOffre: { type: Type.STRING, description: "Date mentionnée" },
            nbrePostes: { type: Type.INTEGER, description: "Nombre de postes ouverts" },
            emploiMetier: { type: Type.STRING, description: "Intitulé exact du poste" }
          },
          required: ["ville", "refOffre", "typeContrat", "raisonSociale", "emploiMetier"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("L'IA n'a retourné aucun texte.");
  
  try {
    const data = JSON.parse(text);
    return data.map((job: any) => ({
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dateOffre: job.dateOffre || new Date().toLocaleDateString('fr-FR')
    }));
  } catch (e) {
    console.error("Erreur parsing JSON Gemini Extraction:", e);
    throw new Error("Erreur lors de l'interprétation des données extraites.");
  }
};

/**
 * Génère une offre complète optimisée SEO.
 */
export const generateDetailedJobOffer = async (job: JobBasicInfo, modelType: AIModel = 'gemini'): Promise<FullJobOffer> => {
  const prompt = `Génère une annonce de recrutement professionnelle et optimisée SEO pour le poste suivant :
  Poste: ${job.emploiMetier}
  Entreprise: ${job.raisonSociale}
  Ville: ${job.ville}
  Type: ${job.typeContrat}
  Référence: ${job.refOffre}

  Instructions:
  1. Rédige une description longue et détaillée en Markdown (fullDescription).
  2. Inclue 5 mots-clés SEO stratégiques (seoKeywords).
  3. Rédige une meta-description pour Google de 155 caractères max (metaDescription).
  4. Liste 6 compétences clés nécessaires (requiredSkills).
  5. Estime une fourchette de salaire réaliste (suggestedSalaryRange).`;

  // Option DeepSeek
  if (modelType === 'deepseek') {
    try {
      const jsonResponse = await callDeepSeek(prompt);
      const parsed = JSON.parse(jsonResponse);
      return { ...job, ...parsed };
    } catch (e: any) {
      console.error("Échec DeepSeek, bascule vers Gemini...", e);
      // Fallback automatique vers Gemini si DeepSeek échoue (optionnel, selon besoin)
    }
  }

  // Option Gemini 3 Pro (Par défaut ou fallback)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API Gemini manquante.");
  
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullDescription: { type: Type.STRING },
          seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          metaDescription: { type: Type.STRING },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedSalaryRange: { type: Type.STRING }
        },
        required: ["fullDescription", "seoKeywords", "metaDescription", "requiredSkills"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return { ...job, ...result };
  } catch (e) {
    throw new Error("Erreur de formatage de l'offre par l'IA.");
  }
};
