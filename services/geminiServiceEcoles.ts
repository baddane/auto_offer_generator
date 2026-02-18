
import { GoogleGenAI, Type } from "@google/genai";
import { EcoleBasicInfo, FullEcole, AIModel } from "../types";

/**
 * Extrait les données d'écoles à partir d'une image ou d'un fichier.
 * Utilise Gemini Flash pour ses capacités de vision.
 */
export const extractEcolesFromImage = async (
  base64Image: string,
  _modelType: AIModel = 'gemini'
): Promise<EcoleBasicInfo[]> => {
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
              mimeType: 'image/png',
            },
          },
          {
            text: "Analyse ce document et extrait les informations de chaque école, université ou établissement d'enseignement mentionné. Pour chaque établissement, retourne les données structurées disponibles.",
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
            nom: { type: Type.STRING, description: "Nom de l'établissement" },
            typeEcole: { type: Type.STRING, description: "Type: université, grande école, lycée, institut, etc." },
            ville: { type: Type.STRING, description: "Ville ou localisation" },
            siteWeb: { type: Type.STRING, description: "Site web si mentionné" },
          },
          required: ["nom", "typeEcole", "ville"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("L'IA n'a retourné aucun texte.");

  try {
    const data = JSON.parse(text);
    return data.map((item: any) => ({
      ...item,
      id: `eco-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dateAjout: new Date().toLocaleDateString('fr-FR'),
    }));
  } catch (e) {
    console.error("Erreur parsing JSON Gemini Extraction Écoles:", e);
    throw new Error("Erreur lors de l'interprétation des données écoles extraites.");
  }
};

/**
 * Génère une fiche école complète et optimisée SEO.
 */
export const generateDetailedEcole = async (
  ecole: EcoleBasicInfo,
  modelType: AIModel = 'gemini'
): Promise<FullEcole> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API Gemini manquante.");

  const prompt = `Génère une fiche établissement d'enseignement professionnelle et optimisée SEO pour :
  Établissement: ${ecole.nom}
  Type: ${ecole.typeEcole}
  Ville: ${ecole.ville}
  ${ecole.siteWeb ? `Site Web: ${ecole.siteWeb}` : ''}

  Instructions:
  1. Rédige une présentation longue et détaillée en Markdown (presentation). Inclure l'histoire, les points forts pédagogiques, l'environnement académique, les débouchés.
  2. Génère un slug URL-friendly en minuscules avec tirets (slug) basé sur le nom de l'établissement.
  3. Inclue 6 mots-clés SEO stratégiques (seoKeywords).
  4. Rédige une meta-description pour Google de 155 caractères max (metaDescription).
  5. Liste 5 filières ou programmes proposés (filieres).
  6. Liste les niveaux d'accès requis (niveauxAcces) ex: Bac, Bac+2, Bac+3, etc.`;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          presentation: { type: Type.STRING },
          slug: { type: Type.STRING },
          seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          metaDescription: { type: Type.STRING },
          filieres: { type: Type.ARRAY, items: { type: Type.STRING } },
          niveauxAcces: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["presentation", "slug", "seoKeywords", "metaDescription", "filieres", "niveauxAcces"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return { ...ecole, ...result };
  } catch (e) {
    throw new Error("Erreur de formatage de la fiche école par l'IA.");
  }
};
