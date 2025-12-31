import React, { useState, useMemo, useEffect } from 'react';
import { ChefHat, Search, Heart, LayoutGrid, List, ArrowUpDown, Mail, ChevronRight, ChevronLeft } from 'lucide-react';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import RecipeGenerator from './components/RecipeGenerator';
import FilterBar from './components/FilterBar';
import { Recipe, Category, Difficulty } from './types';
import { INITIAL_RECIPES } from './constants';
import { generateChefRecipe, generateRecipeImage } from './services/geminiService';

const FAVORITES_KEY = 'little-chef-favorites-v1';
type SortOption = 'title' | 'time' | 'difficulty';

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('title');

  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleGenerateRecipe = async (prompt: string, category: Category) => {
    setIsGenerating(true);
    try {
      const recipeData = await generateChefRecipe(prompt, category);
      let imageUrl: string;
      try {
        imageUrl = await generateRecipeImage(recipeData.title, recipeData.description, recipeData.ingredients);
      } catch (imgError) {
        console.error("Image generation failed, using fallback:", imgError);
        imageUrl = `https://picsum.photos/seed/${encodeURIComponent(recipeData.title)}/800/600`;
      }
      
      const newRecipe: Recipe = {
        ...recipeData,
        id: Date.now().toString(),
        imageUrl,
        isGenerated: true,
      };

      setRecipes(prev => [newRecipe, ...prev]);
      setSelectedRecipe(newRecipe);
      
    } catch (error) {
      console.error("Failed to generate recipe:", error);
      alert("אופס! השף הקטן התבלבל קצת. נסו שוב או בדקו את חיבור האינטרנט.");
    } finally {
      setIsGenerating(false);
    }
  };

  const difficultyMap: Record<Difficulty, number> = {
    'קל': 1,
    'בינוני': 2,
    'מאתגר': 3
  };

  const filteredAndSortedRecipes = useMemo(() => {
    let result = recipes.filter(recipe => {
      const query = searchQuery.toLowerCase().trim();
      const matchesCategory = categoryFilter === 'All' || recipe.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'All' || recipe.difficulty === difficultyFilter;
      const matchesFavorites = !showOnlyFavorites || favorites.includes(recipe.id);
      
      const matchesSearch = !query || 
        recipe.title.toLowerCase().includes(query) || 
        recipe.description.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.item.toLowerCase().includes(query));
      
      return matchesCategory && matchesDifficulty && matchesSearch && matchesFavorites;
    });

    result.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'he');
      } else if (sortBy === 'time') {
        return a.timeMinutes - b.timeMinutes;
      } else if (sortBy === 'difficulty') {
        return difficultyMap[a.difficulty] - difficultyMap[b.difficulty];
      }
      return 0;
    });

    return result;
  }, [recipes, categoryFilter, difficultyFilter, searchQuery, showOnlyFavorites, favorites, sortBy]);

  // Navigation Logic for Modal
  const currentIndex = selectedRecipe ? filteredAndSortedRecipes.findIndex(r => r.id === selectedRecipe.id) : -1;
  const onNext = currentIndex < filteredAndSortedRecipes.length - 1 ? () => setSelectedRecipe(filteredAndSortedRecipes[currentIndex + 1]) : undefined;
  const onPrev = currentIndex > 0 ? () => setSelectedRecipe(filteredAndSortedRecipes[currentIndex - 1]) : undefined;

  return (
    <div className="min-h-screen bg-darkbg text-white font-sans selection:bg-secondary selection:text-darkbg pb-20">
      <header className="sticky top-0 z-40 bg-darkbg/80 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-orange-600 p-2 rounded-xl shadow-lg shadow-primary/30">
              <ChefHat size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Little Chef <span className="text-secondary">שף קטן</span>
              </h1>
            </div>
          </div>
          
          <div className="relative group">
            <button 
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border ${
                showOnlyFavorites 
                ? 'bg-primary border-primary text-white' 
                : 'border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <Heart size={18} fill={showOnlyFavorites ? "currentColor" : "none"} />
              <span className="hidden sm:inline font-bold">המועדפים שלי</span>
              <span className="bg-black/20 px-2 py-0.5 rounded-full text-xs">{favorites.length}</span>
            </button>
            <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
              {showOnlyFavorites ? 'הצג את כל המתכונים' : 'הצג רק מועדפים'}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <RecipeGenerator onGenerate={handleGenerateRecipe} isGenerating={isGenerating} />
        </section>

        <section>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-6">
            <div className="flex items-center justify-between w-full lg:w-auto lg:flex-col lg:items-start lg:justify-end gap-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">👨‍🍳</span>
                {showOnlyFavorites ? 'המועדפים שלך' : 'המתכונים שלנו'}
                </h2>
                <span className="text-gray-500 text-sm">{filteredAndSortedRecipes.length} מתכונים</span>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
              <div className="relative flex-1 sm:w-64 lg:w-80">
                  <input
                      type="text"
                      placeholder="חפש לפי שם או מצרך..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-cardbg text-white border border-gray-700 rounded-full py-3 pr-12 pl-4 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-gray-500 shadow-lg"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>

              <div className="flex items-center gap-2 bg-cardbg p-1 rounded-full border border-gray-700 shadow-lg">
                <div className="flex gap-1 border-l border-gray-700 pl-1 ml-1 pr-1">
                  <div className="relative group">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-secondary text-darkbg' : 'text-gray-400 hover:text-white'}`}
                    >
                      <LayoutGrid size={20} />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      תצוגת גריד
                    </div>
                  </div>
                  <div className="relative group">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-secondary text-darkbg' : 'text-gray-400 hover:text-white'}`}
                    >
                      <List size={20} />
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                      תצוגת רשימה
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 px-3 text-gray-400 relative group">
                  <ArrowUpDown size={20} />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent border-none focus:outline-none text-sm font-bold text-gray-300 cursor-pointer"
                  >
                    <option value="title" className="bg-cardbg">שם</option>
                    <option value="time" className="bg-cardbg">זמן</option>
                    <option value="difficulty" className="bg-cardbg">קושי</option>
                  </select>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                    מיון לפי
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FilterBar 
            activeCategory={categoryFilter}
            activeDifficulty={difficultyFilter}
            onCategoryChange={setCategoryFilter}
            onDifficultyChange={setDifficultyFilter}
          />

          {filteredAndSortedRecipes.length === 0 ? (
            <div className="text-center py-20 bg-cardbg/50 rounded-2xl border border-dashed border-gray-700 animate-fade-in">
              <p className="text-gray-400 text-lg mb-2">לא נמצאו מתכונים מתאימים...</p>
              <button 
                onClick={() => {
                    setCategoryFilter('All'); 
                    setDifficultyFilter('All');
                    setSearchQuery('');
                    setShowOnlyFavorites(false);
                }}
                className="text-secondary underline hover:text-white"
              >
                נקה את כל המסננים
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "flex flex-col gap-4 max-w-4xl mx-auto"
            }>
              {filteredAndSortedRecipes.map((recipe) => (
                <RecipeCard 
                  key={`${recipe.id}-${favorites.includes(recipe.id)}-${viewMode}`} 
                  recipe={recipe} 
                  isFavorite={favorites.includes(recipe.id)}
                  viewMode={viewMode}
                  onToggleFavorite={toggleFavorite}
                  onClick={setSelectedRecipe} 
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-gray-800 mt-12 py-10 bg-darkbg">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
            <span>&copy; Noam Gold AI 2025</span>
          </div>
          <a 
            href="mailto:goldnoamai@gmail.com" 
            className="flex items-center gap-2 text-secondary hover:text-white transition-colors text-sm font-bold bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20"
          >
            <Mail size={16} />
            שלחו משוב: goldnoamai@gmail.com
          </a>
          <p className="text-gray-600 text-xs">נבנה באהבה לשפים צעירים שרוצים ללמוד ולגלות עולמות חדשים במטבח</p>
        </div>
      </footer>

      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          isFavorite={favorites.includes(selectedRecipe.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedRecipe(null)} 
          onNext={onNext}
          onPrev={onPrev}
        />
      )}
    </div>
  );
};

export default App;