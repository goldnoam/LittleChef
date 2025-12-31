import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Category, Ingredient } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateChefRecipe = async (prompt: string, category: Category): Promise<Omit<Recipe, 'id' | 'imageUrl'>> => {
  const ai = getAiClient();
  
  const systemInstruction = `
  You are a fun and encouraging cooking assistant for kids called "Little Chef". 
  Create a recipe based on the user's request. 
  The recipe should be safe for kids (with adult supervision mentioned if needed).
  Language: Hebrew.
  Keep descriptions exciting and simple.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Create a ${category} recipe for: ${prompt}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Fun title of the recipe in Hebrew" },
          description: { type: Type.STRING, description: "Short, appetizing description in Hebrew" },
          category: { type: Type.STRING, enum: ['אפייה', 'בישול', 'טיגון'] },
          difficulty: { type: Type.STRING, enum: ['קל', 'בינוני', 'מאתגר'] },
          timeMinutes: { type: Type.INTEGER },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                amount: { type: Type.STRING },
              }
            }
          },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step by step instructions"
          }
        },
        required: ["title", "description", "category", "difficulty", "timeMinutes", "ingredients", "instructions"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate recipe text");
  
  return JSON.parse(text);
};

export const generateRecipeImage = async (recipeTitle: string, recipeDescription: string, ingredients: Ingredient[] = []): Promise<string> => {
  const ai = getAiClient();
  
  const ingredientsList = ingredients.map(i => i.item).join(", ");
  const prompt = `A professional, high-quality, vibrant food photography shot of a dish called "${recipeTitle}". 
  Description: ${recipeDescription}. 
  Key ingredients to visualize: ${ingredientsList}. 
  Style: Bright, colorful, appetizing, overhead or 45-degree angle, shallow depth of field, suitable for a children's cooking app. 
  The image must strictly represent the food described.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
        imageConfig: {
            aspectRatio: "4:3",
        }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return `https://picsum.photos/seed/${encodeURIComponent(recipeTitle)}/800/600`;
};