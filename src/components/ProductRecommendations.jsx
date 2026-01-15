import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, ArrowRight, ArrowLeft, Check, Plus, Minus, 
  RefreshCw, ExternalLink, Sparkles, Package, TrendingUp
} from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { 
  generateRecommendations, 
  getProductAlternatives, 
  formatPrice, 
  products 
} from '../utils/recommendations';

function ProductCard({ product, isSelected, onToggle, onShowAlternatives }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        relative bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-300
        ${isSelected 
          ? 'ring-2 ring-ikea-blue shadow-lg shadow-ikea-blue/20' 
          : 'hover:shadow-lg'
        }
      `}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-ikea-gray-100 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            className={`
              w-full h-full object-contain p-4 transition-opacity duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-ikea-gray-300" />
          </div>
        )}

        {/* Selected Badge */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 left-3 w-8 h-8 bg-ikea-blue rounded-full flex items-center justify-center shadow-md"
          >
            <Check className="w-5 h-5 text-white" />
          </motion.div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          In Stock
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-ikea-gray-800">{product.name}</h4>
            <p className="text-sm text-ikea-gray-500 line-clamp-1">{product.description}</p>
          </div>
        </div>

        <p className="text-xs text-ikea-gray-400 mb-3">
          Art. {product.articleNumber}
        </p>

        {/* Dimensions */}
        <div className="flex gap-2 text-xs text-ikea-gray-500 mb-3">
          <span>{product.dimensions.width}×{product.dimensions.depth}×{product.dimensions.height} cm</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-ikea-gray-800">
            {formatPrice(product.price)}
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => onShowAlternatives(product)}
              className="p-2 text-ikea-gray-400 hover:text-ikea-blue hover:bg-ikea-gray-100 rounded-lg transition-colors"
              title="View alternatives"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onToggle(product)}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isSelected 
                  ? 'bg-ikea-blue text-white' 
                  : 'bg-ikea-gray-100 text-ikea-gray-600 hover:bg-ikea-blue hover:text-white'
                }
              `}
            >
              {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AlternativesModal({ product, alternatives, onClose, onSelect }) {
  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-ikea-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-ikea-gray-800">
                Alternatives for {product.name}
              </h3>
              <p className="text-sm text-ikea-gray-500">
                Similar products you might like
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ikea-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {alternatives.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {alternatives.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-ikea-gray-50 rounded-xl p-4 flex gap-4 hover:bg-ikea-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    onSelect(alt);
                    onClose();
                  }}
                >
                  <img
                    src={alt.image}
                    alt={alt.name}
                    className="w-20 h-20 object-contain bg-white rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-ikea-gray-800">{alt.name}</h4>
                    <p className="text-sm text-ikea-gray-500 line-clamp-1">{alt.description}</p>
                    <p className="text-lg font-bold text-ikea-blue mt-2">
                      {formatPrice(alt.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-ikea-gray-500">
              No alternatives found in your budget range
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductRecommendations() {
  const { state, dispatch } = usePlanner();
  const { roomConfig, budget, selectedStyles, selectedProducts } = state;
  const [showAlternatives, setShowAlternatives] = useState(null);
  const [alternatives, setAlternatives] = useState([]);

  // Generate recommendations based on current selections
  const recommendations = useMemo(() => {
    return generateRecommendations({
      roomId: roomConfig.type,
      budget: budget.total,
      styleIds: selectedStyles,
      familySizeId: roomConfig.familySize,
    });
  }, [roomConfig, budget, selectedStyles]);

  const handleToggleProduct = (product) => {
    const isSelected = selectedProducts.find(p => p.id === product.id);
    if (isSelected) {
      dispatch({ type: 'REMOVE_PRODUCT', payload: product.id });
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: product });
    }
  };

  const handleShowAlternatives = (product) => {
    const alts = getProductAlternatives(product.id, budget.total);
    setAlternatives(alts);
    setShowAlternatives(product);
  };

  const handleSelectAlternative = (product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  // Calculate totals
  const totalSelected = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const budgetRemaining = budget.total - totalSelected;
  const budgetUtilization = Math.round((totalSelected / budget.total) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-ikea-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Personalized Recommendations
        </motion.h2>
        <motion.p 
          className="mt-2 text-ikea-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Curated products matching your style and budget
        </motion.p>
      </div>

      {/* Budget Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-ikea-blue/10 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-ikea-blue" />
            </div>
            <div>
              <p className="text-sm text-ikea-gray-500">Selected Items</p>
              <p className="text-2xl font-bold text-ikea-gray-800">
                {selectedProducts.length} products
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-ikea-gray-500">Total Cost</p>
            <p className="text-2xl font-bold text-ikea-blue">
              {formatPrice(totalSelected)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-ikea-gray-500">Budget Remaining</p>
            <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(budgetRemaining)}
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="relative">
          <div className="h-4 bg-ikea-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${budgetUtilization > 100 ? 'bg-red-500' : 'bg-ikea-blue'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-ikea-gray-500">{budgetUtilization}% utilized</span>
            <span className="text-ikea-gray-500">Budget: {formatPrice(budget.total)}</span>
          </div>
        </div>
      </motion.div>

      {/* AI Recommendation Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 p-4 bg-gradient-to-r from-ikea-yellow/20 to-amber-50 rounded-2xl"
      >
        <div className="w-12 h-12 bg-ikea-yellow rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-ikea-gray-800" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-ikea-gray-800">AI-Powered Recommendations</p>
          <p className="text-sm text-ikea-gray-600">
            Based on your {recommendations.room?.name || 'room'}, {formatPrice(budget.total)} budget, and{' '}
            {selectedStyles.length > 0 ? selectedStyles.join(', ') : 'selected'} style preferences
          </p>
        </div>
        <TrendingUp className="w-8 h-8 text-ikea-blue" />
      </motion.div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {recommendations.products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard
                product={product}
                isSelected={!!selectedProducts.find(p => p.id === product.id)}
                onToggle={handleToggleProduct}
                onShowAlternatives={handleShowAlternatives}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* More Products Section */}
      {recommendations.products.length < products.filter(p => p.rooms.includes(roomConfig.type)).length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 border-t border-ikea-gray-200"
        >
          <p className="text-ikea-gray-500 mb-4">
            Showing top recommendations. More products available based on your preferences.
          </p>
          <a
            href="https://www.ikea.com/sa/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-ikea-blue hover:underline font-medium"
          >
            Browse full catalog on IKEA.sa
            <ExternalLink className="w-4 h-4" />
          </a>
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
          disabled={selectedProducts.length === 0}
          className={`
            btn-primary flex items-center gap-2 text-lg
            ${selectedProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          View Room Layout
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Alternatives Modal */}
      <AnimatePresence>
        {showAlternatives && (
          <AlternativesModal
            product={showAlternatives}
            alternatives={alternatives}
            onClose={() => setShowAlternatives(null)}
            onSelect={handleSelectAlternative}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

