import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, X, Sparkles, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { analyzeInspirationImage, styles } from '../utils/recommendations';

export default function InspirationUpload() {
  const { state, dispatch } = usePlanner();
  const { inspirationImage, detectedStyles, selectedStyles } = state;
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

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    dispatch({ type: 'SET_INSPIRATION_IMAGE', payload: imageUrl });

    // Simulate AI analysis
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    
    const analysisResults = analyzeInspirationImage();
    dispatch({ type: 'SET_DETECTED_STYLES', payload: analysisResults });
    setIsAnalyzing(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    processImage(file);
  }, [dispatch]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processImage(file);
  };

  const handleRemoveImage = () => {
    dispatch({ type: 'SET_INSPIRATION_IMAGE', payload: null });
    dispatch({ type: 'SET_DETECTED_STYLES', payload: null });
  };

  const handleApplyStyle = (styleId) => {
    if (!selectedStyles.includes(styleId)) {
      dispatch({ type: 'TOGGLE_STYLE', payload: styleId });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-ikea-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Upload Inspiration
        </motion.h2>
        <motion.p 
          className="mt-2 text-ikea-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Share an image that inspires you and we'll match your style
        </motion.p>
        <motion.p 
          className="mt-1 text-sm text-ikea-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          This step is optional — feel free to skip if you prefer
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
                    ? 'border-ikea-blue bg-ikea-blue/10 scale-[1.02]' 
                    : 'border-ikea-gray-300 hover:border-ikea-blue/50 bg-white hover:bg-ikea-gray-50'
                  }
                `}
              >
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-colors
                  ${isDragging ? 'bg-ikea-blue text-white' : 'bg-ikea-gray-100 text-ikea-gray-400'}
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
                
                {/* Remove Button */}
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-ikea-gray-700" />
                </button>

                {/* Analyzing Overlay */}
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-ikea-blue/80 backdrop-blur-sm flex flex-col items-center justify-center"
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
              <div className="w-10 h-10 bg-gradient-to-br from-ikea-blue to-ikea-blue-light rounded-xl flex items-center justify-center">
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
                <Loader2 className="w-12 h-12 text-ikea-blue animate-spin mb-4" />
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
                        ${isApplied ? 'bg-ikea-blue/10' : 'bg-ikea-gray-50'}
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
                        {/* Confidence Bar */}
                        <div className="w-20 h-2 bg-ikea-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-ikea-blue rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          />
                        </div>
                        
                        {/* Apply Button */}
                        <button
                          onClick={() => handleApplyStyle(result.style.id)}
                          disabled={isApplied}
                          className={`
                            px-3 py-1 rounded-full text-xs font-medium transition-all
                            ${isApplied 
                              ? 'bg-ikea-blue text-white' 
                              : 'bg-white border border-ikea-blue text-ikea-blue hover:bg-ikea-blue hover:text-white'
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

      {/* Current Styles Summary */}
      {selectedStyles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-ikea-yellow/20 to-amber-50 rounded-2xl p-4"
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
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          className="btn-primary flex items-center gap-2 text-lg"
        >
          View Recommendations
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

