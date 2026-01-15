import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Sparkles, ArrowRight, ArrowLeft, Sofa, Lamp, Package, Palette } from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { formatPrice, getRoom, calculateBudgetAllocation } from '../utils/recommendations';

const categoryIcons = {
  seating: Sofa,
  storage: Package,
  lighting: Lamp,
  decor: Palette,
  tables: Package,
  bedroom: Sofa,
};

const categoryColors = {
  seating: '#0058A3',
  storage: '#00A86B',
  lighting: '#FFB347',
  decor: '#FF6B6B',
  tables: '#9B59B6',
  bedroom: '#3498DB',
};

export default function BudgetSelector() {
  const { state, dispatch } = usePlanner();
  const { budget, roomConfig } = state;
  const [localBudget, setLocalBudget] = useState(budget.total);
  
  const room = getRoom(roomConfig.type);
  const budgetAllocation = calculateBudgetAllocation(localBudget, roomConfig.type, budget.smartBudget);

  useEffect(() => {
    setLocalBudget(budget.total);
  }, [budget.total]);

  const handleBudgetChange = (value) => {
    const numValue = parseInt(value) || 1000;
    setLocalBudget(numValue);
    dispatch({
      type: 'SET_BUDGET',
      payload: { total: numValue },
    });
  };

  const handleSmartBudgetToggle = () => {
    dispatch({
      type: 'SET_BUDGET',
      payload: { smartBudget: !budget.smartBudget },
    });
  };

  const budgetPresets = [5000, 10000, 15000, 25000, 40000];

  const getBudgetLabel = (value) => {
    if (value <= 5000) return { label: 'Budget-Friendly', color: 'text-green-600' };
    if (value <= 15000) return { label: 'Balanced', color: 'text-ikea-blue' };
    if (value <= 30000) return { label: 'Premium', color: 'text-purple-600' };
    return { label: 'Luxury', color: 'text-amber-600' };
  };

  const budgetInfo = getBudgetLabel(localBudget);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-ikea-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Set Your Budget
        </motion.h2>
        <motion.p 
          className="mt-2 text-ikea-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          We'll find the best furniture combinations within your budget
        </motion.p>
      </div>

      {/* Main Budget Card */}
      <motion.div 
        className="bg-white rounded-3xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Budget Display */}
        <div className="gradient-ikea p-8 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="w-6 h-6" />
            <span className="text-blue-100">Your Total Budget</span>
          </div>
          
          <motion.div 
            className="text-5xl font-bold mb-2"
            key={localBudget}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {formatPrice(localBudget)}
          </motion.div>
          
          <span className={`
            inline-block px-4 py-1 rounded-full text-sm font-medium
            ${budgetInfo.color} bg-white/90
          `}>
            {budgetInfo.label}
          </span>
        </div>

        {/* Slider Section */}
        <div className="p-8">
          {/* Budget Slider */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-ikea-gray-500 mb-2">
              <span>{formatPrice(1000)}</span>
              <span>{formatPrice(50000)}</span>
            </div>
            
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={localBudget}
              onChange={(e) => handleBudgetChange(e.target.value)}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0058A3 0%, #0058A3 ${((localBudget - 1000) / 49000) * 100}%, #E0E0E0 ${((localBudget - 1000) / 49000) * 100}%, #E0E0E0 100%)`
              }}
            />
          </div>

          {/* Quick Budget Presets */}
          <div className="mb-8">
            <p className="text-sm text-ikea-gray-600 mb-3">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              {budgetPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleBudgetChange(preset)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${localBudget === preset 
                      ? 'bg-ikea-blue text-white shadow-md' 
                      : 'bg-ikea-gray-100 text-ikea-gray-700 hover:bg-ikea-gray-200'
                    }
                  `}
                >
                  {formatPrice(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Budget Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-ikea-yellow/20 to-amber-50 rounded-2xl mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ikea-yellow rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-ikea-gray-800" />
              </div>
              <div>
                <p className="font-semibold text-ikea-gray-800">Smart Budget Allocation</p>
                <p className="text-sm text-ikea-gray-600">
                  AI optimizes spending across categories
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSmartBudgetToggle}
              className={`
                relative w-14 h-8 rounded-full transition-colors duration-300
                ${budget.smartBudget ? 'bg-ikea-blue' : 'bg-ikea-gray-300'}
              `}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ left: budget.smartBudget ? '28px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Budget Breakdown */}
          {room && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-ikea-gray-800">
                Budget Breakdown for {room.name}
              </h3>
              
              <div className="space-y-3">
                {Object.entries(budgetAllocation).map(([category, amount]) => {
                  const Icon = categoryIcons[category] || Package;
                  const color = categoryColors[category] || '#666';
                  const percentage = Math.round((amount / localBudget) * 100);
                  
                  return (
                    <div key={category} className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize font-medium text-ikea-gray-700">
                            {category}
                          </span>
                          <span className="text-ikea-gray-600">
                            {formatPrice(amount)} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-ikea-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

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
          Choose Style
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

