export type Difficulty = 'קל' | 'בינוני' | 'מאתגר';
export type Category = 'אפייה' | 'בישול' | 'טיגון';

export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  timeMinutes: number;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl: string;
  isGenerated?: boolean;
}

export interface GeneratorInput {
  prompt: string;
  category: Category;
}
