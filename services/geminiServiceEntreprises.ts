
import { GoogleGenAI, Type } from "@google/genai";
import { EntrepriseBasicInfo, FullEntreprise, AIModel } from "../types";

/**
 * Extrait les données d'entreprises à partir d'une image ou d'un fichier.
 * Utilise Gemini Flash pour ses capacités de vision.
 */
export const extractEntreprisesFromImage = async (
  base64Image: string,
  _modelType: AIModel = 'gemini'
): Promise<EntrepriseBasicInfo[]> => {
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
            text: "Analyse ce document et extrait les informations de chaque entreprise mentionnée. Pour chaque entreprise, retourne les données structurées disponibles. Si c'est un tableau, retourne chaque ligne comme un objet.",
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
            nom: { type: Type.STRING, description: "Nom ou raison sociale de l'entreprise" },
            secteur: { type: Type.STRING, description: "Secteur d'activité" },
            ville: { type: Type.STRING, description: "Ville ou localisation" },
            siteWeb: { type: Type.STRING, description: "Site web si mentionné" },
            nbEmployes: { type: Type.STRING, description: "Nombre d'employés si mentionné" },
          },
          required: ["nom", "secteur", "ville"],
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
      id: `ent-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dateAjout: new Date().toLocaleDateString('fr-FR'),
    }));
  } catch (e) {
    console.error("Erreur parsing JSON Gemini Extraction Entreprises:", e);
    throw new Error("Erreur lors de l'interprétation des données entreprises extraites.");
  }
};

/**
 * Génère une fiche entreprise complète et optimisée SEO.
 */
export const generateDetailedEntreprise = async (
  entreprise: EntrepriseBasicInfo,
  modelType: AIModel = 'gemini'
): Promise<FullEntreprise> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé API Gemini manquante.");

  const prompt = `Génère une fiche entreprise professionnelle et optimisée SEO pour :
  Entreprise: ${entreprise.nom}
  Secteur: ${entreprise.secteur}
  Ville: ${entreprise.ville}
  ${entreprise.nbEmployes ? `Effectif: ${entreprise.nbEmployes}` : ''}
  ${entreprise.siteWeb ? `Site Web: ${entreprise.siteWeb}` : ''}

  Instructions:
  1. Rédige une présentation longue et détaillée en Markdown (presentation). Inclure l'histoire, les valeurs, la culture d'entreprise, les perspectives.
  2. Génère un slug URL-friendly en minuscules avec tirets (slug) basé sur le nom de l'entreprise.
  3. Inclue 6 mots-clés SEO stratégiques (seoKeywords).
  4. Rédige une meta-description pour Google de 155 caractères max (metaDescription).
  5. Liste 5 spécialités ou points forts de l'entreprise (specialites).`;

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
          specialites: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["presentation", "slug", "seoKeywords", "metaDescription", "specialites"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return { ...entreprise, ...result };
  } catch (e) {
    throw new Error("Erreur de formatage de la fiche entreprise par l'IA.");
  }
};
