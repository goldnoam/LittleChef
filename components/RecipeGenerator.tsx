import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Category } from '../types';

interface RecipeGeneratorProps {
  onGenerate: (prompt: string, category: Category) => Promise<void>;
  isGenerating: boolean;
}

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<Category>('אפייה');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt, category);
  };

  return (
    <div className="bg-gradient-to-br from-cardbg to-darkbg p-6 rounded-2xl border border-secondary/30 shadow-xl mb-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Wand2 className="text-accent" />
          מכונת המתכונים הקסומה
        </h2>
        <p className="text-gray-400">כתבו מה בא לכם להכין, והקסם יקרה!</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="bg-darkbg text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary md:w-48"
          disabled={isGenerating}
        >
          <option value="אפייה">🍰 אפייה</option>
          <option value="בישול">🍲 בישול</option>
          <option value="טיגון">🍳 טיגון</option>
        </select>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="למשל: עוגיות שוקולד בצורת דינוזאור..."
          className="flex-1 bg-darkbg text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-gray-500"
          disabled={isGenerating}
        />

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className={`
            bg-gradient-to-r from-secondary to-blue-500 hover:from-secondary/90 hover:to-blue-600 
            text-darkbg font-bold py-3 px-8 rounded-xl transition-all duration-300 
            flex items-center justify-center gap-2 shadow-lg hover:shadow-secondary/20
            ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" />
              מבשל רעיון...
            </>
          ) : (
            <>
              <Wand2 size={20} />
              צור מתכון
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RecipeGenerator;
