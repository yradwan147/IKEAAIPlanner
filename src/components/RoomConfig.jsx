import { motion } from 'framer-motion';
import { Sofa, Bed, Monitor, UtensilsCrossed, Users, ArrowRight, Ruler } from 'lucide-react';
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

export default function RoomConfig() {
  const { state, dispatch } = usePlanner();
  const { roomConfig } = state;

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
          <div className="flex items-center gap-2 mb-6 text-ikea-gray-600">
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
                  <div 
                    className="border-2 border-dashed border-ikea-blue bg-gradient-to-br from-ikea-blue/5 to-ikea-blue/15 rounded-lg flex flex-col items-center justify-center transition-all duration-500 relative shadow-inner"
                    style={{
                      width: `${displayWidth}px`,
                      height: `${displayHeight}px`,
                    }}
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
                  </div>
                );
              })()}
            </div>
          </div>
          
          <p className="text-center text-xs text-ikea-gray-400 mt-2">
            Drag the sliders or type dimensions to see the room shape update
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

