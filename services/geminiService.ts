import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation } from '../types';

// Safely check for API key
const apiKey = process.env.API_KEY;
export const isAIEnabled = typeof apiKey === 'string' && apiKey.length > 0;

// Initialize the API client only if key exists
let ai: GoogleGenAI | null = null;
if (isAIEnabled) {
  try {
    ai = new GoogleGenAI({ apiKey: apiKey! });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
}

export interface PlaceResult {
  name: string;
  address: string;
  category: string;
}

export const searchPlaces = async (query: string): Promise<PlaceResult[]> => {
  if (!ai) return [];

  try {
    // Using Google Maps tool for real data
    const prompt = `
      Find 5 real places in Nantes matching "${query}" using Google Maps.
      Return the results as a strictly formatted JSON array of objects.
      Each object must have these keys: "name", "address", "category".
      Do not include any markdown formatting (like \`\`\`json). Just return the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          // Provide Nantes coordinates to ground the search locally
          retrievalConfig: {
            latLng: {
              latitude: 47.2184,
              longitude: -1.5536
            }
          }
        }
      },
    });

    let text = response.text || "[]";
    
    // Clean up markdown if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
            return data.map((item: any) => ({
                name: item.name || 'Lieu inconnu',
                address: item.address || 'Nantes',
                category: item.category || 'Lieu'
            }));
        }
    } catch (e) {
        console.warn("Failed to parse JSON from search result", text);
    }
    return [];
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};

export const getAIRecommendations = async (
  city: string,
  interests: string[]
): Promise<Recommendation[]> => {
  if (!ai) return [];

  try {
    const prompt = `
      Je suis un voyageur solo / digital nomad à ${city}.
      Mes centres d'intérêt sont : ${interests.join(', ')}.
      Suggère-moi 3 endroits ou activités spécifiques (restaurants, bars, co-working, visites) 
      qui favorisent les rencontres ou sont adaptés au travail à distance.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              placeName: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              reason: { type: Type.STRING, description: "Pourquoi c'est bien pour un digital nomad ou voyageur solo" },
            },
            required: ["placeName", "category", "description", "reason"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as Recommendation[];
    }
    return [];
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return [];
  }
};