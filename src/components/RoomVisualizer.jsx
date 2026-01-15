import { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Image as KonvaImage } from 'react-konva';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Download, RotateCw, ZoomIn, ZoomOut, 
  Move, Trash2, Grid3X3, Eye
} from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { formatPrice } from '../utils/recommendations';

// Sprite mappings for furniture subcategories
const spriteMap = {
  // Seating
  'sofa': '/sprites/sofa.svg',
  'sofa-bed': '/sprites/sofa-bed.svg',
  'armchair': '/sprites/armchair.svg',
  'office-chair': '/sprites/office-chair.svg',
  'dining-chair': '/sprites/dining-chair.svg',
  // Storage
  'shelving': '/sprites/shelving.svg',
  'tv-unit': '/sprites/tv-unit.svg',
  'bookcase': '/sprites/bookcase.svg',
  'dresser': '/sprites/dresser.svg',
  'wardrobe': '/sprites/wardrobe.svg',
  'drawer-unit': '/sprites/drawer-unit.svg',
  // Tables
  'coffee-table': '/sprites/coffee-table.svg',
  'side-table': '/sprites/side-table.svg',
  'desk': '/sprites/desk.svg',
  'dining-table': '/sprites/dining-table.svg',
  // Bedroom
  'bed': '/sprites/bed.svg',
  // Lighting
  'pendant': '/sprites/pendant.svg',
  'floor-lamp': '/sprites/floor-lamp.svg',
  'table-lamp': '/sprites/table-lamp.svg',
  // Decor
  'rug': '/sprites/rug.svg',
  'textile': '/sprites/textile.svg',
  'plant': '/sprites/plant.svg',
  'frame': '/sprites/frame.svg',
  'vase': '/sprites/vase.svg',
};

// Category fallback sprites
const categoryFallback = {
  seating: '/sprites/sofa.svg',
  storage: '/sprites/shelving.svg',
  tables: '/sprites/coffee-table.svg',
  bedroom: '/sprites/bed.svg',
  lighting: '/sprites/pendant.svg',
  decor: '/sprites/plant.svg',
};

// Hook to load sprite images
function useSprite(subcategory, category) {
  const [image, setImage] = useState(null);
  
  useEffect(() => {
    const spritePath = spriteMap[subcategory] || categoryFallback[category] || '/sprites/sofa.svg';
    const img = new window.Image();
    img.src = spritePath;
    img.onload = () => setImage(img);
  }, [subcategory, category]);
  
  return image;
}

// Furniture colors by category (fallback for items without sprites)
const categoryColors = {
  seating: '#0058A3',
  storage: '#00A86B',
  lighting: '#FFB347',
  decor: '#FF6B6B',
  tables: '#9B59B6',
  bedroom: '#3498DB',
};

function FurnitureItem({ item, isSelected, onSelect, onDragEnd, scale }) {
  const width = (item.dimensions.width / 100) * scale;
  const depth = (item.dimensions.depth / 100) * scale;
  const spriteImage = useSprite(item.subcategory, item.category);
  const color = categoryColors[item.category] || '#666';

  return (
    <Group
      x={item.x}
      y={item.y}
      draggable
      onClick={() => onSelect(item.id)}
      onTap={() => onSelect(item.id)}
      onDragEnd={(e) => onDragEnd(item.id, e.target.x(), e.target.y())}
    >
      {/* Shadow */}
      <Rect
        x={3}
        y={3}
        width={width}
        height={depth}
        fill="rgba(0,0,0,0.15)"
        cornerRadius={4}
      />
      
      {/* Selection highlight background */}
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={width + 8}
          height={depth + 8}
          fill="transparent"
          stroke="#FFDB00"
          strokeWidth={3}
          cornerRadius={6}
          dash={[8, 4]}
        />
      )}
      
      {/* Furniture sprite or fallback */}
      {spriteImage ? (
        <KonvaImage
          image={spriteImage}
          width={width}
          height={depth}
          cornerRadius={4}
        />
      ) : (
        <>
          <Rect
            width={width}
            height={depth}
            fill={color}
            opacity={0.8}
            cornerRadius={4}
            stroke={isSelected ? '#FFDB00' : '#fff'}
            strokeWidth={isSelected ? 3 : 1}
          />
          <Text
            text={item.name}
            width={width}
            height={depth}
            align="center"
            verticalAlign="middle"
            fontSize={Math.min(width, depth) > 40 ? 10 : 8}
            fill="#fff"
            fontStyle="bold"
            wrap="word"
            padding={4}
          />
        </>
      )}
      
      {/* Label below sprite */}
      {spriteImage && (
        <Text
          text={item.name}
          y={depth + 4}
          width={width}
          align="center"
          fontSize={9}
          fill="#333"
          fontStyle="bold"
        />
      )}
    </Group>
  );
}

function RoomGrid({ width, height, gridSize }) {
  const lines = [];
  
  // Vertical lines
  for (let i = 0; i <= width; i += gridSize) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, height]}
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />
    );
  }
  
  // Horizontal lines
  for (let i = 0; i <= height; i += gridSize) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i, width, i]}
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />
    );
  }
  
  return <>{lines}</>;
}

export default function RoomVisualizer() {
  const { state, dispatch } = usePlanner();
  const { roomConfig, selectedProducts, furnitureLayout } = state;
  const [selectedItem, setSelectedItem] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 500 });

  // Calculate scale (pixels per meter)
  const scale = 80 * zoom;
  const roomWidth = roomConfig.width * scale;
  const roomHeight = roomConfig.length * scale;

  // Initialize furniture layout from selected products
  useEffect(() => {
    if (selectedProducts.length > 0 && furnitureLayout.length === 0) {
      const layout = selectedProducts.map((product, index) => ({
        id: `${product.id}-${index}`,
        productId: product.id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        dimensions: product.dimensions,
        x: 50 + (index % 4) * 120,
        y: 50 + Math.floor(index / 4) * 120,
        rotation: 0,
      }));
      dispatch({ type: 'SET_FURNITURE_LAYOUT', payload: layout });
    }
  }, [selectedProducts, furnitureLayout.length, dispatch]);

  // Update stage size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 32, 800);
        const height = Math.min(roomHeight + 100, 600);
        setStageSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [roomHeight]);

  const handleDragEnd = (itemId, x, y) => {
    // Clamp to room boundaries
    const item = furnitureLayout.find(i => i.id === itemId);
    if (!item) return;

    const itemWidth = (item.dimensions.width / 100) * scale;
    const itemHeight = (item.dimensions.depth / 100) * scale;

    const clampedX = Math.max(0, Math.min(x, roomWidth - itemWidth));
    const clampedY = Math.max(0, Math.min(y, roomHeight - itemHeight));

    dispatch({
      type: 'UPDATE_FURNITURE_POSITION',
      payload: { id: itemId, x: clampedX, y: clampedY },
    });
  };

  const handleRemoveItem = () => {
    if (!selectedItem) return;
    const item = furnitureLayout.find(i => i.id === selectedItem);
    if (item) {
      dispatch({ type: 'REMOVE_PRODUCT', payload: item.productId });
      setSelectedItem(null);
    }
  };

  const handleRotateItem = () => {
    if (!selectedItem) return;
    dispatch({
      type: 'SET_FURNITURE_LAYOUT',
      payload: furnitureLayout.map(item => 
        item.id === selectedItem 
          ? { 
              ...item, 
              dimensions: {
                ...item.dimensions,
                width: item.dimensions.depth,
                depth: item.dimensions.width,
              }
            }
          : item
      ),
    });
  };

  const handleExport = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'ikea-room-layout.png';
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const selectedItemData = useMemo(() => {
    if (!selectedItem) return null;
    const layoutItem = furnitureLayout.find(i => i.id === selectedItem);
    if (!layoutItem) return null;
    return selectedProducts.find(p => p.id === layoutItem.productId);
  }, [selectedItem, furnitureLayout, selectedProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-ikea-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Design Your Room Layout
        </motion.h2>
        <motion.p 
          className="mt-2 text-ikea-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Drag furniture to arrange your perfect room
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Canvas Area */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-ikea-gray-100 bg-ikea-gray-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-ikea-blue text-white' : 'bg-white text-ikea-gray-600'}`}
                  title="Toggle grid"
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  className="p-2 bg-white rounded-lg text-ikea-gray-600 hover:bg-ikea-gray-100"
                  title="Zoom out"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-sm text-ikea-gray-600 w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                  className="p-2 bg-white rounded-lg text-ikea-gray-600 hover:bg-ikea-gray-100"
                  title="Zoom in"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedItem && (
                  <>
                    <button
                      onClick={handleRotateItem}
                      className="p-2 bg-white rounded-lg text-ikea-gray-600 hover:bg-ikea-gray-100"
                      title="Rotate item"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleRemoveItem}
                      className="p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-ikea-blue text-white rounded-lg hover:bg-ikea-blue-dark transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div 
              ref={containerRef}
              className="p-4 bg-ikea-gray-100 overflow-auto"
              style={{ minHeight: '400px' }}
            >
              <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                onClick={(e) => {
                  // Deselect if clicking on empty space
                  if (e.target === e.target.getStage()) {
                    setSelectedItem(null);
                  }
                }}
              >
                <Layer>
                  {/* Room background */}
                  <Rect
                    x={0}
                    y={0}
                    width={roomWidth}
                    height={roomHeight}
                    fill="#fafafa"
                    stroke="#0058A3"
                    strokeWidth={3}
                    cornerRadius={8}
                  />

                  {/* Grid */}
                  {showGrid && (
                    <RoomGrid 
                      width={roomWidth} 
                      height={roomHeight} 
                      gridSize={scale / 2} 
                    />
                  )}

                  {/* Room dimensions label */}
                  <Text
                    x={roomWidth / 2 - 40}
                    y={roomHeight + 10}
                    text={`${roomConfig.width}m × ${roomConfig.length}m`}
                    fontSize={14}
                    fill="#666"
                    fontStyle="bold"
                  />

                  {/* Furniture items */}
                  {furnitureLayout.map((item) => (
                    <FurnitureItem
                      key={item.id}
                      item={item}
                      isSelected={selectedItem === item.id}
                      onSelect={setSelectedItem}
                      onDragEnd={handleDragEnd}
                      scale={scale}
                    />
                  ))}
                </Layer>
              </Stage>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-ikea-gray-100 flex flex-wrap gap-4">
              <span className="text-sm text-ikea-gray-500 font-medium">Furniture shown with realistic top-view sprites</span>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Selected Item & Items List */}
        <div className="space-y-4">
          {/* Selected Item Info */}
          {selectedItemData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-4 shadow-lg"
            >
              <h3 className="font-semibold text-ikea-gray-800 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-ikea-blue" />
                Selected Item
              </h3>
              <div className="flex gap-3">
                <img
                  src={selectedItemData.image}
                  alt={selectedItemData.name}
                  className="w-16 h-16 object-contain bg-ikea-gray-50 rounded-lg"
                />
                <div>
                  <p className="font-medium text-ikea-gray-800">{selectedItemData.name}</p>
                  <p className="text-sm text-ikea-gray-500">{formatPrice(selectedItemData.price)}</p>
                  <p className="text-xs text-ikea-gray-400 mt-1">
                    {selectedItemData.dimensions.width}×{selectedItemData.dimensions.depth} cm
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Items in Room */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg"
          >
            <h3 className="font-semibold text-ikea-gray-800 mb-3 flex items-center gap-2">
              <Move className="w-5 h-5 text-ikea-blue" />
              Items in Room ({furnitureLayout.length})
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {furnitureLayout.map((item) => {
                const product = selectedProducts.find(p => p.id === item.productId);
                const spritePath = spriteMap[item.subcategory] || categoryFallback[item.category];
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item.id)}
                    className={`
                      w-full p-2 rounded-lg text-left flex items-center gap-2 transition-colors
                      ${selectedItem === item.id 
                        ? 'bg-ikea-blue/10 border border-ikea-blue' 
                        : 'bg-ikea-gray-50 hover:bg-ikea-gray-100'
                      }
                    `}
                  >
                    {spritePath && (
                      <img 
                        src={spritePath} 
                        alt="" 
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <span className="text-sm text-ikea-gray-700 truncate flex-1">
                      {item.name}
                    </span>
                    {product && (
                      <span className="text-xs text-ikea-gray-500">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Tips */}
          <div className="bg-ikea-yellow/20 rounded-2xl p-4">
            <h4 className="font-medium text-ikea-gray-800 mb-2">Tips</h4>
            <ul className="text-sm text-ikea-gray-600 space-y-1">
              <li>• Drag items to reposition</li>
              <li>• Click an item to select it</li>
              <li>• Use rotate button to change orientation</li>
              <li>• Export your layout as an image</li>
            </ul>
          </div>
        </div>
      </div>

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
          Book Consultation
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
