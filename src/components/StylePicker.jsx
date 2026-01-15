import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles, Leaf, Home, Building, Heart } from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { styles } from '../utils/recommendations';

const styleIcons = {
  modern: Building,
  scandinavian: Leaf,
  traditional: Home,
  cozy: Heart,
  urban: Building,
};

const styleImages = {
  modern: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  scandinavian: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop',
  traditional: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
  cozy: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
  urban: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
};

export default function StylePicker() {
  const { state, dispatch } = usePlanner();
  const { selectedStyles } = state;

  const handleStyleToggle = (styleId) => {
    dispatch({ type: 'TOGGLE_STYLE', payload: styleId });
  };

  const canProceed = selectedStyles.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-ikea-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Choose Your Style
        </motion.h2>
        <motion.p 
          className="mt-2 text-ikea-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Select one or more styles that inspire you
        </motion.p>
      </div>

      {/* Selected Styles Indicator */}
      <motion.div 
        className="flex items-center justify-center gap-2 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {selectedStyles.length === 0 ? (
          <span className="text-ikea-gray-400 text-sm">No styles selected yet</span>
        ) : (
          selectedStyles.map((styleId) => {
            const style = styles.find(s => s.id === styleId);
            return (
              <motion.span
                key={styleId}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-ikea-blue text-white rounded-full text-sm font-medium"
              >
                {style?.name}
                <button
                  onClick={() => handleStyleToggle(styleId)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </motion.span>
            );
          })
        )}
      </motion.div>

      {/* Style Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {styles.map((style, index) => {
          const Icon = styleIcons[style.id] || Sparkles;
          const isSelected = selectedStyles.includes(style.id);
          const imageUrl = styleImages[style.id];

          return (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleStyleToggle(style.id)}
              className={`
                relative group overflow-hidden rounded-2xl transition-all duration-300
                ${isSelected 
                  ? 'ring-4 ring-ikea-blue shadow-xl shadow-ikea-blue/20 scale-[1.02]' 
                  : 'ring-1 ring-ikea-gray-200 hover:ring-ikea-blue/50 hover:shadow-lg'
                }
              `}
            >
              {/* Image Background */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`
                  absolute inset-0 transition-opacity duration-300
                  ${isSelected 
                    ? 'bg-ikea-blue/40' 
                    : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
                  }
                `} />
                
                {/* Selected Check */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-6 h-6 text-ikea-blue" />
                  </motion.div>
                )}

                {/* Style Name on Image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    {style.name}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {style.nameAr}
                  </p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 bg-white">
                <p className="text-sm text-ikea-gray-600 mb-4">
                  {style.description}
                </p>

                {/* Color Palette */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ikea-gray-500">Colors:</span>
                  <div className="flex gap-1">
                    {style.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-ikea-gray-200 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {style.keywords.slice(0, 4).map((keyword) => (
                    <span
                      key={keyword}
                      className="text-xs px-2 py-0.5 bg-ikea-gray-100 text-ikea-gray-600 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Blend Styles Info */}
      {selectedStyles.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-ikea-yellow/20 to-amber-50 rounded-2xl"
        >
          <Sparkles className="w-6 h-6 text-amber-600" />
          <p className="text-ikea-gray-700">
            <span className="font-semibold">Style Blend:</span> We'll combine elements from your selected styles for a unique look!
          </p>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          disabled={!canProceed}
          className={`
            btn-primary flex items-center gap-2 text-lg
            ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {selectedStyles.length === 0 ? 'Select a Style' : 'Continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

