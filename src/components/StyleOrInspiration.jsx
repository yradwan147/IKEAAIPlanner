import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Image, X, Sparkles, ArrowRight, ArrowLeft, Check, 
  Loader2, Palette, Camera, ChevronRight, Leaf, Home, Building, Heart 
} from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { analyzeInspirationImage, styles } from '../utils/recommendations';

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

export default function StyleOrInspiration() {
  const { state, dispatch } = usePlanner();
  const { inspirationImage, detectedStyles, selectedStyles } = state;
  const [mode, setMode] = useState(null); // null, 'inspiration', 'manual'
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const imageUrl = URL.createObjectURL(file);
    dispatch({ type: 'SET_INSPIRATION_IMAGE', payload: imageUrl });

    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysisResults = analyzeInspirationImage();
    dispatch({ type: 'SET_DETECTED_STYLES', payload: analysisResults });
    
    // Auto-apply the top detected style
    if (analysisResults && analysisResults.length > 0) {
      const topStyle = analysisResults[0].style.id;
      if (!selectedStyles.includes(topStyle)) {
        dispatch({ type: 'TOGGLE_STYLE', payload: topStyle });
      }
    }
    
    setIsAnalyzing(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processImage(file);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processImage(file);
  };

  const handleRemoveImage = () => {
    dispatch({ type: 'SET_INSPIRATION_IMAGE', payload: null });
    dispatch({ type: 'SET_DETECTED_STYLES', payload: null });
    dispatch({ type: 'SET_STYLES', payload: [] });
  };

  const handleStyleToggle = (styleId) => {
    dispatch({ type: 'TOGGLE_STYLE', payload: styleId });
  };

  const handleApplyStyle = (styleId) => {
    if (!selectedStyles.includes(styleId)) {
      dispatch({ type: 'TOGGLE_STYLE', payload: styleId });
    }
  };

  const canProceed = selectedStyles.length > 0;

  // Mode selection screen
  if (mode === null) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <motion.h2 
            className="text-3xl font-bold text-ikea-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            How Would You Like to Define Your Style?
          </motion.h2>
          <motion.p 
            className="mt-2 text-ikea-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Choose the way that works best for you
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Inspiration Upload Option */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setMode('inspiration')}
            className="group relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-1 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="bg-white rounded-[22px] p-8 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-ikea-gray-800 mb-3">
                Upload Inspiration
              </h3>
              <p className="text-ikea-gray-500 mb-6">
                Have a photo of a room you love? Our AI will analyze it and match your style automatically.
              </p>
              <div className="mt-auto flex items-center gap-2 text-purple-600 font-semibold">
                <Sparkles className="w-5 h-5" />
                <span>AI-Powered Analysis</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Manual Style Selection Option */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setMode('manual')}
            className="group relative bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 rounded-3xl p-1 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="bg-white rounded-[22px] p-8 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-ikea-gray-800 mb-3">
                Pick Your Style
              </h3>
              <p className="text-ikea-gray-500 mb-6">
                Browse our curated style collections and choose the ones that speak to you.
              </p>
              <div className="mt-auto flex items-center gap-2 text-orange-600 font-semibold">
                <span>Browse Styles</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Navigation */}
        <div className="flex justify-start pt-4">
          <button
            onClick={() => dispatch({ type: 'PREV_STEP' })}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>
    );
  }

  // Inspiration Upload Mode
  if (mode === 'inspiration') {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <motion.h2 
            className="text-3xl font-bold text-ikea-gray-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Upload Your Inspiration
          </motion.h2>
          <motion.p 
            className="mt-2 text-ikea-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Share an image that inspires you and we'll match your style
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              {!inspirationImage ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative h-80 border-3 border-dashed rounded-3xl cursor-pointer
                    transition-all duration-300 flex flex-col items-center justify-center
                    ${isDragging 
                      ? 'border-purple-500 bg-purple-50 scale-[1.02]' 
                      : 'border-ikea-gray-300 hover:border-purple-400 bg-white hover:bg-purple-50/30'
                    }
                  `}
                >
                  <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-colors
                    ${isDragging ? 'bg-purple-500 text-white' : 'bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-500'}
                  `}>
                    <Upload className="w-10 h-10" />
                  </div>
                  
                  <p className="text-lg font-semibold text-ikea-gray-700">
                    {isDragging ? 'Drop your image here' : 'Drag & drop an image'}
                  </p>
                  <p className="text-sm text-ikea-gray-500 mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-ikea-gray-400 mt-4">
                    Supports JPG, PNG, WebP up to 10MB
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative h-80 rounded-3xl overflow-hidden shadow-xl"
                >
                  <img
                    src={inspirationImage}
                    alt="Inspiration"
                    className="w-full h-full object-cover"
                  />
                  
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5 text-ikea-gray-700" />
                  </button>

                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-purple-600/80 backdrop-blur-sm flex flex-col items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-12 h-12 text-white mb-4" />
                      </motion.div>
                      <p className="text-white font-semibold text-lg">Analyzing your image...</p>
                      <p className="text-white/80 text-sm mt-1">Detecting styles and colors</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Analysis Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl p-6 shadow-lg h-80 overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-ikea-gray-800">AI Style Analysis</h3>
                  <p className="text-xs text-ikea-gray-500">Powered by visual recognition</p>
                </div>
              </div>

              {!inspirationImage ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Image className="w-16 h-16 text-ikea-gray-200 mb-4" />
                  <p className="text-ikea-gray-400">
                    Upload an image to see AI-powered style analysis
                  </p>
                </div>
              ) : isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <p className="text-ikea-gray-500">Processing...</p>
                </div>
              ) : detectedStyles ? (
                <div className="space-y-4">
                  <p className="text-sm text-ikea-gray-600">
                    Based on your image, we detected these style matches:
                  </p>
                  
                  {detectedStyles.slice(0, 4).map((result, index) => {
                    const isApplied = selectedStyles.includes(result.style.id);
                    
                    return (
                      <motion.div
                        key={result.style.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          flex items-center justify-between p-3 rounded-xl transition-colors
                          ${isApplied ? 'bg-purple-50 border border-purple-200' : 'bg-ikea-gray-50'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: result.style.colors[0] }}
                          />
                          <div>
                            <p className="font-medium text-ikea-gray-800">
                              {result.style.name}
                            </p>
                            <p className="text-xs text-ikea-gray-500">
                              {result.confidence}% match
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-ikea-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${result.confidence}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                          
                          <button
                            onClick={() => handleApplyStyle(result.style.id)}
                            disabled={isApplied}
                            className={`
                              px-3 py-1 rounded-full text-xs font-medium transition-all
                              ${isApplied 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-white border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white'
                              }
                            `}
                          >
                            {isApplied ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Applied
                              </span>
                            ) : 'Apply'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Selected Styles Summary */}
        {selectedStyles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-4"
          >
            <p className="text-sm text-ikea-gray-700 text-center">
              <span className="font-semibold">Your selected styles: </span>
              {selectedStyles.map((id, i) => {
                const style = styles.find(s => s.id === id);
                return (
                  <span key={id}>
                    {style?.name}
                    {i < selectedStyles.length - 1 ? ', ' : ''}
                  </span>
                );
              })}
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => {
              setMode(null);
              handleRemoveImage();
            }}
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
            View Recommendations
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Manual Style Selection Mode
  return (
    <div className="space-y-8">
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
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium"
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
                  ? 'ring-4 ring-orange-500 shadow-xl shadow-orange-500/20 scale-[1.02]' 
                  : 'ring-1 ring-ikea-gray-200 hover:ring-orange-400/50 hover:shadow-lg'
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
                    ? 'bg-orange-500/40' 
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
                    <Check className="w-6 h-6 text-orange-500" />
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
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl"
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
          onClick={() => {
            setMode(null);
            dispatch({ type: 'SET_STYLES', payload: [] });
          }}
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
          {selectedStyles.length === 0 ? 'Select a Style' : 'View Recommendations'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

