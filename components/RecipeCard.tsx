import React, { useState } from 'react';
import { Clock, BarChart, ChefHat, Heart, Share2, Eye, EyeOff, ChevronLeft, Loader2 } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  viewMode: 'grid' | 'list';
  onToggleFavorite: (id: string) => void;
  onClick: (recipe: Recipe) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1495195129352-aec325a55b65?auto=format&fit=crop&q=80&w=800';

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isFavorite, viewMode, onToggleFavorite, onClick }) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(recipe.imageUrl);

  const difficultyColor = {
    'קל': 'text-green-400',
    'בינוני': 'text-yellow-400',
    'מאתגר': 'text-red-400',
  };

  const categoryIcon = {
    'אפייה': '🍰',
    'בישול': '🍲',
    'טיגון': '🍳',
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(recipe.id);
  };

  const handleQuickViewToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickView(!showQuickView);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `תראו איזה מתכון מגניב מצאתי בשף קטן: ${recipe.title}\n\n${recipe.description}`;
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      alert('הקישור הועתק ללוח!');
    }
  };

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE);
  };

  const quickViewOverlay = (
    <div className={`absolute inset-0 bg-cardbg/95 backdrop-blur-md z-20 p-4 transition-all duration-300 flex flex-col ${showQuickView ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-secondary text-lg">מבט מהיר 🔎</h4>
        <button onClick={handleQuickViewToggle} className="text-gray-400 hover:text-white">
          <EyeOff size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar mb-4">
        <p className="text-gray-300 text-sm mb-3 font-medium">{recipe.description}</p>
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">🛒 מצרכים עיקריים:</p>
          <ul className="text-xs text-gray-400 space-y-1">
            {recipe.ingredients.slice(0, 5).map((ing, idx) => (
              <li key={idx} className="flex justify-between items-center bg-white/5 p-1 rounded">
                <span>{ing.item}</span>
                <span className="text-secondary font-semibold">{ing.amount}</span>
              </li>
            ))}
            {recipe.ingredients.length > 5 && (
              <li className="text-center italic mt-1 text-[10px]">ועוד {recipe.ingredients.length - 5} מצרכים...</li>
            )}
          </ul>
        </div>
      </div>
      <button 
        onClick={() => onClick(recipe)}
        className="w-full bg-secondary text-darkbg font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
      >
        מתכון מלא <ChevronLeft size={16} />
      </button>
    </div>
  );

  const ImageComponent = (
    <div className="relative w-full h-full bg-darkbg overflow-hidden">
      {!isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-cardbg animate-pulse">
          <Loader2 className="text-secondary animate-spin" size={24} />
        </div>
      )}
      <img 
        src={imgSrc} 
        alt={recipe.title} 
        loading="lazy"
        onLoad={() => setIsImageLoaded(true)}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-500 group-hover:scale-110 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => onClick(recipe)}
        className="bg-cardbg rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.01] transition-all duration-300 cursor-pointer border border-gray-700 hover:border-secondary flex animate-fade-in group relative"
      >
        {quickViewOverlay}
        
        <div className="relative w-32 sm:w-48 flex-shrink-0">
          {ImageComponent}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold text-white flex items-center gap-1">
            <span>{categoryIcon[recipe.category]}</span>
            <span>{recipe.category}</span>
          </div>
        </div>

        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">{recipe.title}</h3>
              <div className="flex gap-1 sm:gap-2">
                <div className="relative group/tooltip">
                  <button 
                    onClick={handleQuickViewToggle}
                    className="p-1.5 sm:p-2 rounded-full bg-black/20 text-gray-400 hover:text-white transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/tooltip:block bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
                    מבט מהיר
                  </div>
                </div>
                <div className="relative group/tooltip">
                  <button 
                    onClick={handleShareClick}
                    className="p-1.5 sm:p-2 rounded-full bg-black/20 text-gray-400 hover:text-white transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/tooltip:block bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
                    שיתוף
                  </div>
                </div>
                <div className="relative group/tooltip">
                  <button 
                    onClick={handleFavoriteClick}
                    className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                      isFavorite ? 'bg-primary text-white' : 'bg-black/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/tooltip:block bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
                    {isFavorite ? 'הסר מהמועדפים' : 'הוסף למועדפים'}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-3">
              {recipe.description}
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] sm:text-xs">
            <div className="flex items-center gap-2 sm:gap-4">
               <div className="flex items-center gap-1 text-gray-300">
                <Clock size={14} className="text-secondary" />
                <span>{recipe.timeMinutes} דק'</span>
              </div>
              <div className={`flex items-center gap-1 font-semibold ${difficultyColor[recipe.difficulty]}`}>
                <BarChart size={14} />
                <span>{recipe.difficulty}</span>
              </div>
            </div>
            
            {recipe.isGenerated && (
              <div className="bg-purple-600/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider">
                <ChefHat size={10} />
                AI
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-cardbg rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-700 hover:border-secondary group animate-fade-in relative"
    >
      {quickViewOverlay}

      <div className="relative h-48 w-full">
        {ImageComponent}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-white flex items-center gap-1">
          <span>{categoryIcon[recipe.category]}</span>
          <span>{recipe.category}</span>
        </div>
        
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          <div className="relative group/tooltip">
            <button 
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                isFavorite ? 'bg-primary text-white scale-110' : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover/tooltip:block bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
              {isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            </div>
          </div>
          <div className="relative group/tooltip">
            <button 
              onClick={handleShareClick}
              className="p-2 rounded-full backdrop-blur-md bg-black/40 text-white hover:bg-black/60 transition-all duration-300"
            >
              <Share2 size={18} />
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover/tooltip:block bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
              שיתוף
            </div>
          </div>
          <div className="relative group/tooltip">
            <button 
              onClick={handleQuickViewToggle}
              className="p-2 rounded-full backdrop-blur-md bg-black/40 text-white hover:bg-black/60 transition-all duration-300"
            >
              <Eye size={18} />
            </button>
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover/tooltip:block bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50">
              מבט מהיר
            </div>
          </div>
        </div>

        {recipe.isGenerated && (
          <div className="absolute bottom-2 right-2 bg-purple-600/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1 uppercase tracking-wider">
            <ChefHat size={10} />
            AI שף
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-white truncate">{recipe.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
          {recipe.description}
        </p>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-gray-300">
            <Clock size={16} className="text-secondary" />
            <span>{recipe.timeMinutes} דק'</span>
          </div>
          <div className={`flex items-center gap-1 font-semibold ${difficultyColor[recipe.difficulty]}`}>
            <BarChart size={16} />
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;