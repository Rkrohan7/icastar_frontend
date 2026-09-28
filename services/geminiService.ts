
import { GoogleGenAI, Type } from "@google/genai";
import { SuggestedArtist } from "../types";
import { translate } from "@/i18n";

// IMPORTANT: In a real application, you would not hardcode the API key.
// It is sourced from process.env.API_KEY, which is assumed to be configured
// in the execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        artists: {
            type: Type.ARRAY,
            description: "A list of suggested artist profiles.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.INTEGER, description: "A unique fictional ID for the artist." },
                    name: { type: Type.STRING, description: "The artist's full name." },
                    bio: { type: Type.STRING, description: "A short, one-sentence biography for the artist." },
                    skills: {
                        type: Type.ARRAY,
                        description: "A list of 3-5 relevant skills.",
                        items: { type: Type.STRING }
                    },
                    matchScore: { type: Type.INTEGER, description: "A percentage score (0-100) indicating the match quality." },
                    reason: { type: Type.STRING, description: "A brief explanation of why this artist is a good match." },
                },
                required: ["id", "name", "bio", "skills", "matchScore", "reason"]
            }
        }
    },
    required: ["artists"]
};


export const getArtistSuggestions = async (jobDescription: string): Promise<SuggestedArtist[]> => {
  if (!API_KEY) {
    throw new Error(translate('services.gemini.apiKeyMissing'));
  }

  const prompt = `
    Based on the following job description for a creative role, please generate 3-5 fictional artist profiles that would be excellent candidates.
    For each artist, provide a name, a short bio, a list of skills, a match score percentage, and a brief reason for the match.
    Ensure the artists are diverse and their skills directly relate to the job description.

    Job Description:
    ---
    ${jobDescription}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    // Add a placeholder avatar URL to each artist
    return parsed.artists.map((artist: Omit<SuggestedArtist, 'avatarUrl'>, index: number) => ({
        ...artist,
        avatarUrl: `https://picsum.photos/seed/${artist.id}/100/100`
    }));

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    throw new Error(translate('services.gemini.suggestionsFailed'));
  }
};
