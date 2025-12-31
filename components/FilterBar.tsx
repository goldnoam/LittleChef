import React from 'react';
import { Category, Difficulty } from '../types';

interface FilterBarProps {
  activeCategory: Category | 'All';
  activeDifficulty: Difficulty | 'All';
  onCategoryChange: (cat: Category | 'All') => void;
  onDifficultyChange: (diff: Difficulty | 'All') => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  activeCategory, 
  activeDifficulty, 
  onCategoryChange, 
  onDifficultyChange 
}) => {
  const categories: (Category | 'All')[] = ['All', 'אפייה', 'בישול', 'טיגון'];
  const difficulties: (Difficulty | 'All')[] = ['All', 'קל', 'בינוני', 'מאתגר'];

  const getLabel = (val: string) => val === 'All' ? 'הכל' : val;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 text-sm">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
        <span className="text-gray-400 font-semibold pl-2 hidden md:block">סוג:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`
              px-4 py-2 rounded-full whitespace-nowrap transition-colors
              ${activeCategory === cat 
                ? 'bg-secondary text-darkbg font-bold shadow-lg shadow-secondary/20' 
                : 'bg-cardbg text-gray-400 hover:bg-gray-700 hover:text-white'}
            `}
          >
            {getLabel(cat)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
        <span className="text-gray-400 font-semibold pl-2 hidden md:block">רמה:</span>
        {difficulties.map((diff) => (
          <button
            key={diff}
            onClick={() => onDifficultyChange(diff)}
            className={`
              px-4 py-2 rounded-full whitespace-nowrap transition-colors
              ${activeDifficulty === diff 
                ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20' 
                : 'bg-cardbg text-gray-400 hover:bg-gray-700 hover:text-white'}
            `}
          >
            {getLabel(diff)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
