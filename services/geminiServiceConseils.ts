
import { GoogleGenAI, Type } from "@google/genai";
import { ConseilArticle, AIModel } from "../types";

/**
 * Génère un article de blog SEO complet à partir d'un titre et d'une thématique.
 */
export const generateConseilArticle = async (
  titre: string,
  thematique: string,
  modelType: AIModel = 'gemini'
): Promise<ConseilArticle> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "votre_cle_gemini_ici") {
    throw new Error("Clé API Gemini (GEMINI_API_KEY) non configurée dans le fichier .env");
  }

  const prompt = `Génère un article de blog complet, professionnel et optimisé SEO sur le sujet suivant :
  Titre: ${titre}
  Thématique: ${thematique}

  Instructions IMPORTANTES:
  1. Rédige un article long et riche en Markdown (contenu), structuré avec H1, H2, H3, des listes, du texte dense. Minimum 800 mots. Le contenu doit être en français, informatif et engageant.
  2. Génère un slug URL-friendly en minuscules avec tirets (slug), court et descriptif.
  3. Génère un meta title optimisé SEO de 60 caractères max (metaTitle).
  4. Génère une meta description de 155 caractères max (metaDescription).
  5. Liste 8 mots-clés SEO stratégiques (seoKeywords) incluant des longues traînes.
  6. Estime le temps de lecture en minutes (tempsLecture), ex: "5 min".`;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contenu: { type: Type.STRING },
          slug: { type: Type.STRING },
          metaTitle: { type: Type.STRING },
          metaDescription: { type: Type.STRING },
          seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          tempsLecture: { type: Type.STRING },
        },
        required: ["contenu", "slug", "metaTitle", "metaDescription", "seoKeywords"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      id: `conseil-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      titre,
      thematique,
      datePubli: new Date().toLocaleDateString('fr-FR'),
      ...result,
    };
  } catch (e) {
    throw new Error("Erreur de formatage de l'article conseil par l'IA.");
  }
};
