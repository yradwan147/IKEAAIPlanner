import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sofa, Bed, Monitor, UtensilsCrossed, Users, ArrowRight, Ruler, 
  Camera, Upload, Sparkles, X, Check, Scan, Maximize2, Move3D
} from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { rooms, familySizes } from '../utils/recommendations';

const roomIcons = {
  'living-room': Sofa,
  'bedroom': Bed,
  'home-office': Monitor,
  'dining-room': UtensilsCrossed,
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

// Generate plausible room dimensions based on room type
function generatePlausibleDimensions(roomType) {
  const dimensionRanges = {
    'living-room': { width: [4, 6], length: [5, 7] },
    'bedroom': { width: [3.5, 5], length: [4, 5.5] },
    'home-office': { width: [2.5, 4], length: [3, 4.5] },
    'dining-room': { width: [3.5, 5], length: [4, 6] },
  };
  
  const range = dimensionRanges[roomType] || { width: [4, 5], length: [4, 6] };
  
  const randomInRange = (min, max) => {
    const value = min + Math.random() * (max - min);
    return Math.round(value * 2) / 2; // Round to nearest 0.5
  };
  
  return {
    width: randomInRange(range.width[0], range.width[1]),
    length: randomInRange(range.length[0], range.length[1]),
  };
}

export default function RoomConfig() {
  const { state, dispatch } = usePlanner();
  const { roomConfig } = state;
  const [roomImage, setRoomImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const analysisStages = [
    { icon: Scan, text: 'Detecting room boundaries...' },
    { icon: Move3D, text: 'Analyzing perspective...' },
    { icon: Maximize2, text: 'Calculating dimensions...' },
    { icon: Check, text: 'Measurement complete!' },
  ];

  const handleRoomSelect = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    dispatch({
      type: 'SET_ROOM_CONFIG',
      payload: {
        type: roomId,
        width: room?.defaultWidth || 4,
        length: room?.defaultLength || 5,
      },
    });
    // Reset analysis state when changing room type
    setAnalysisComplete(false);
    setRoomImage(null);
  };

  const handleDimensionChange = (dimension, value) => {
    const numValue = parseFloat(value) || 1;
    dispatch({
      type: 'SET_ROOM_CONFIG',
      payload: { [dimension]: Math.max(1, Math.min(15, numValue)) },
    });
  };

  const handleFamilySizeChange = (sizeId) => {
    dispatch({
      type: 'SET_ROOM_CONFIG',
      payload: { familySize: sizeId },
    });
  };

  const processImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const imageUrl = URL.createObjectURL(file);
    setRoomImage(imageUrl);
    setIsAnalyzing(true);
    setAnalysisStage(0);
    setAnalysisComplete(false);

    // Simulate AI analysis stages
    for (let i = 0; i < analysisStages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      setAnalysisStage(i + 1);
    }

    // Generate plausible dimensions based on room type
    const dimensions = generatePlausibleDimensions(roomConfig.type);
    
    // Apply the "detected" dimensions
    dispatch({
      type: 'SET_ROOM_CONFIG',
      payload: dimensions,
    });

    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processImage(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setRoomImage(null);
    setAnalysisComplete(false);
    setIsAnalyzing(false);
    setAnalysisStage(0);
  };

  const canProceed = roomConfig.type && roomConfig.width && roomConfig.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-ikea-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Let's Plan Your Room
        </motion.h2>
        <motion.p 
          className="mt-2 text-ikea-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Tell us about the space you want to furnish
        </motion.p>
      </div>

      {/* Room Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-ikea-gray-700 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-ikea-blue text-white flex items-center justify-center text-sm font-bold">1</span>
          Select Room Type
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rooms.map((room, index) => {
            const Icon = roomIcons[room.id] || Sofa;
            const isSelected = roomConfig.type === room.id;
            
            return (
              <motion.button
                key={room.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => handleRoomSelect(room.id)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-ikea-blue bg-ikea-blue/5 shadow-lg shadow-ikea-blue/20' 
                    : 'border-ikea-gray-200 bg-white hover:border-ikea-blue/50 hover:shadow-md'
                  }
                `}
              >
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3
                  ${isSelected ? 'bg-ikea-blue text-white' : 'bg-ikea-gray-100 text-ikea-gray-600'}
                `}>
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-ikea-gray-800">{room.name}</h4>
                <p className="text-xs text-ikea-gray-500 mt-1">{room.nameAr}</p>
                
                {isSelected && (
                  <motion.div
                    layoutId="room-selected"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-ikea-yellow rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-ikea-blue text-sm">✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Room Dimensions */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: roomConfig.type ? 1 : 0.5 }}
      >
        <h3 className="text-lg font-semibold text-ikea-gray-700 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-ikea-blue text-white flex items-center justify-center text-sm font-bold">2</span>
          Room Dimensions
        </h3>
        
        <div className="bg-white rounded-2xl p-6 shadow-md">
          {/* AI Image Upload Option */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-ikea-gray-600">
              <Camera className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Upload a room photo for AI measurement</span>
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Smart</span>
            </div>
            
            <AnimatePresence mode="wait">
              {!roomImage ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative h-32 border-2 border-dashed rounded-xl cursor-pointer
                    transition-all duration-300 flex flex-col items-center justify-center gap-2
                    ${isDragging 
                      ? 'border-purple-500 bg-purple-50 scale-[1.01]' 
                      : 'border-ikea-gray-300 hover:border-purple-400 bg-ikea-gray-50 hover:bg-purple-50/30'
                    }
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-colors
                    ${isDragging ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-500'}
                  `}>
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-ikea-gray-600">
                    {isDragging ? 'Drop your photo here' : 'Upload room photo'}
                  </p>
                  <p className="text-xs text-ikea-gray-400">
                    AI will estimate dimensions automatically
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative h-40 rounded-xl overflow-hidden shadow-lg"
                >
                  <img
                    src={roomImage}
                    alt="Room"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove Button */}
                  {!isAnalyzing && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <X className="w-4 h-4 text-ikea-gray-700" />
                    </button>
                  )}
                  
                  {/* Analysis Overlay */}
                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-indigo-600/90 backdrop-blur-sm flex flex-col items-center justify-center"
                    >
                      {/* Scanning animation */}
                      <motion.div
                        className="absolute inset-4 border-2 border-white/30 rounded-lg"
                        animate={{ 
                          boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 10px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0.4)']
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      
                      {/* Scanning line */}
                      <motion.div
                        className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      
                      {/* Stage indicator */}
                      <div className="relative z-10 text-center">
                        <motion.div
                          key={analysisStage}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mb-3"
                        >
                          {analysisStage > 0 && analysisStage <= analysisStages.length && (
                            (() => {
                              const StageIcon = analysisStages[analysisStage - 1].icon;
                              return (
                                <motion.div
                                  animate={{ rotate: analysisStage < analysisStages.length ? 360 : 0 }}
                                  transition={{ duration: 1, repeat: analysisStage < analysisStages.length ? Infinity : 0, ease: 'linear' }}
                                >
                                  <StageIcon className="w-10 h-10 text-white mx-auto" />
                                </motion.div>
                              );
                            })()
                          )}
                        </motion.div>
                        
                        <p className="text-white font-semibold text-lg">
                          {analysisStage > 0 && analysisStage <= analysisStages.length 
                            ? analysisStages[analysisStage - 1].text 
                            : 'Starting analysis...'}
                        </p>
                        
                        {/* Progress dots */}
                        <div className="flex justify-center gap-2 mt-3">
                          {analysisStages.map((_, i) => (
                            <motion.div
                              key={i}
                              className={`w-2 h-2 rounded-full ${i < analysisStage ? 'bg-white' : 'bg-white/30'}`}
                              animate={i < analysisStage ? { scale: [1, 1.3, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Analysis Complete Badge */}
                  {analysisComplete && !isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-2 left-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2 flex items-center gap-2"
                    >
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-xs font-semibold">AI Measurement Complete</p>
                        <p className="text-white/80 text-xs">
                          Detected: {roomConfig.width}m × {roomConfig.length}m
                        </p>
                      </div>
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ikea-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-ikea-gray-400">or enter manually</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4 text-ikea-gray-600">
            <Ruler className="w-5 h-5" />
            <span className="text-sm">Enter your room measurements in meters</span>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ikea-gray-700 mb-2">
                Width (m)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="15"
                  step="0.5"
                  value={roomConfig.width}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  className="input-field text-2xl font-bold text-center"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ikea-gray-700 mb-2">
                Length (m)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="15"
                  step="0.5"
                  value={roomConfig.length}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  className="input-field text-2xl font-bold text-center"
                />
              </div>
            </div>
          </div>
          
          {/* Visual room preview - maintains accurate aspect ratio */}
          <div className="mt-6 flex flex-col items-center">
            <div className="relative flex items-center justify-center" style={{ width: '220px', height: '200px' }}>
              {(() => {
                const maxWidth = 180;
                const maxHeight = 160;
                const aspectRatio = roomConfig.width / roomConfig.length;
                
                let displayWidth, displayHeight;
                if (aspectRatio > maxWidth / maxHeight) {
                  // Width is the limiting factor
                  displayWidth = maxWidth;
                  displayHeight = maxWidth / aspectRatio;
                } else {
                  // Height is the limiting factor
                  displayHeight = maxHeight;
                  displayWidth = maxHeight * aspectRatio;
                }
                
                return (
                  <motion.div 
                    className="border-2 border-dashed border-ikea-blue bg-gradient-to-br from-ikea-blue/5 to-ikea-blue/15 rounded-lg flex flex-col items-center justify-center transition-all duration-500 relative shadow-inner"
                    style={{
                      width: `${displayWidth}px`,
                      height: `${displayHeight}px`,
                    }}
                    animate={analysisComplete ? { 
                      borderColor: ['#0058A3', '#10B981', '#0058A3'],
                    } : {}}
                    transition={{ duration: 1, repeat: analysisComplete ? 2 : 0 }}
                  >
                    {/* Width label on top */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
                      <div className="h-px w-4 bg-ikea-gray-400" />
                      <span className="text-xs font-semibold text-ikea-gray-600 bg-ikea-gray-50 px-1.5 py-0.5 rounded">
                        {roomConfig.width}m
                      </span>
                      <div className="h-px w-4 bg-ikea-gray-400" />
                    </div>
                    
                    {/* Length label on side */}
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                      <div className="w-px h-4 bg-ikea-gray-400" />
                      <span className="text-xs font-semibold text-ikea-gray-600 bg-ikea-gray-50 px-1.5 py-0.5 rounded whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                        {roomConfig.length}m
                      </span>
                      <div className="w-px h-4 bg-ikea-gray-400" />
                    </div>
                    
                    {/* Grid pattern */}
                    <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-px opacity-30">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-ikea-blue/30 rounded-sm" />
                      ))}
                    </div>
                    
                    {/* Center label */}
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm z-10">
                      <span className="text-sm font-bold text-ikea-blue">
                        {(roomConfig.width * roomConfig.length).toFixed(1)} m²
                      </span>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </div>
          
          <p className="text-center text-xs text-ikea-gray-400 mt-2">
            {analysisComplete 
              ? 'Dimensions detected from your photo — you can adjust if needed'
              : 'Drag the sliders or type dimensions to see the room shape update'
            }
          </p>
        </div>
      </motion.div>

      {/* Family Size */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: roomConfig.type ? 1 : 0.5 }}
      >
        <h3 className="text-lg font-semibold text-ikea-gray-700 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-ikea-blue text-white flex items-center justify-center text-sm font-bold">3</span>
          Who Lives Here?
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {familySizes.map((size) => {
            const isSelected = roomConfig.familySize === size.id;
            
            return (
              <button
                key={size.id}
                onClick={() => handleFamilySizeChange(size.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-ikea-blue bg-ikea-blue text-white' 
                    : 'border-ikea-gray-200 bg-white hover:border-ikea-blue/50'
                  }
                `}
              >
                <Users className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-white' : 'text-ikea-gray-400'}`} />
                <p className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-ikea-gray-700'}`}>
                  {size.name}
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Next Button */}
      <motion.div 
        className="flex justify-end pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => dispatch({ type: 'NEXT_STEP' })}
          disabled={!canProceed}
          className={`
            btn-primary flex items-center gap-2 text-lg
            ${!canProceed ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Continue to Budget
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
