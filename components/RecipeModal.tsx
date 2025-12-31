import React, { useState, useEffect } from 'react';
import { X, Clock, Users, Flame, Share2, Heart, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeModalProps {
  recipe: Recipe | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1495195129352-aec325a55b65?auto=format&fit=crop&q=80&w=800';

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, isFavorite, onToggleFavorite, onClose, onNext, onPrev }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(recipe?.imageUrl || FALLBACK_IMAGE);
  
  // Reset image loader state and source when recipe changes
  useEffect(() => {
    setIsImageLoaded(false);
    if (recipe) {
      setImgSrc(recipe.imageUrl);
    }
  }, [recipe?.id]);

  if (!recipe) return null;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `תראו איזה מתכון מגניב מצאתי בשף קטן: ${recipe.title}\n\n${recipe.description}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: text,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      alert('הקישור הועתק ללוח!');
    }
  };

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      {/* Navigation Buttons (Desktop Floating) */}
      <div className="hidden md:flex fixed inset-x-8 top-1/2 -translate-y-1/2 justify-between pointer-events-none z-[60]">
        {onPrev ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="pointer-events-auto p-4 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all hover:scale-110 active:scale-90 group relative"
          >
            <ChevronRight size={32} />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap">
              מתכון קודם
            </div>
          </button>
        ) : <div />}
        {onNext ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="pointer-events-auto p-4 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all hover:scale-110 active:scale-90 group relative"
          >
            <ChevronLeft size={32} />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap">
              מתכון הבא
            </div>
          </button>
        ) : <div />}
      </div>

      <div className="bg-cardbg rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl relative flex flex-col md:flex-row animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors group"
        >
          <X size={24} />
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
            סגור
          </div>
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 h-64 md:h-auto relative bg-darkbg">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="text-secondary animate-spin" size={32} />
            </div>
          )}
          <img 
            src={imgSrc} 
            alt={recipe.title} 
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cardbg to-transparent h-24 md:hidden"></div>
          
          {/* Mobile Quick Nav */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 md:hidden">
            {onPrev && (
              <button onClick={onPrev} className="bg-black/60 p-2 rounded-full text-white">
                <ChevronRight size={24} />
              </button>
            )}
            {onNext && (
              <button onClick={onNext} className="bg-black/60 p-2 rounded-full text-white">
                <ChevronLeft size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="mb-6">
            <div className="flex justify-between items-start">
               <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-bold mb-2 inline-block">
                {recipe.category}
              </span>
              <div className="flex gap-2">
                <div className="relative group/action">
                  <button 
                    onClick={() => onToggleFavorite(recipe.id)} 
                    className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
                  </button>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/action:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
                    {isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                  </div>
                </div>
                <div className="relative group/action">
                  <button onClick={handleShare} className="text-gray-400 hover:text-white p-2 transition-colors">
                    <Share2 size={24} />
                  </button>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/action:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
                    שיתוף
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{recipe.title}</h2>
            <p className="text-gray-300">{recipe.description}</p>
          </div>

          <div className="flex gap-4 mb-8 bg-darkbg/50 p-4 rounded-xl border border-gray-700">
            <div className="flex flex-col items-center flex-1 text-center">
              <Clock className="text-secondary mb-1" size={20} />
              <span className="text-xs text-gray-400">זמן הכנה</span>
              <span className="font-bold">{recipe.timeMinutes} דק'</span>
            </div>
            <div className="w-px bg-gray-700"></div>
            <div className="flex flex-col items-center flex-1 text-center">
              <Flame className="text-primary mb-1" size={20} />
              <span className="text-xs text-gray-400">קושי</span>
              <span className="font-bold">{recipe.difficulty}</span>
            </div>
            <div className="w-px bg-gray-700"></div>
            <div className="flex flex-col items-center flex-1 text-center">
              <Users className="text-accent mb-1" size={20} />
              <span className="text-xs text-gray-400">מתאים ל</span>
              <span className="font-bold">ילדים</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                  <span>🛒</span> מצרכים
                </h3>
                <span className="text-xs text-gray-400 font-bold bg-darkbg/80 px-2 py-1 rounded-lg">
                  {recipe.ingredients.length} מצרכים סה"כ
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-darkbg/30 p-2 rounded-lg border border-gray-800/50">
                    <span className="text-gray-200">{ing.item}</span>
                    <span className="font-bold text-primary">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-xl font-bold text-secondary flex items-center gap-2">
                  <span>👩‍🍳</span> הוראות הכנה
                </h3>
                <span className="text-xs text-gray-400 font-bold bg-darkbg/80 px-2 py-1 rounded-lg">
                  {recipe.instructions.length} שלבים
                </span>
              </div>
              <ol className="space-y-4">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-gray-300 pt-1 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="mt-8 text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl">
             <p className="text-sm text-gray-400 font-medium">✨ בתיאבון! אל תשכחו לצלם ולשתף! ✨</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;