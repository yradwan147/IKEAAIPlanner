import { motion } from 'framer-motion';
import { Check, Home, Wallet, Palette, Image, ShoppingBag, Layout, Calendar } from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';

const iconMap = {
  Home,
  Wallet,
  Palette,
  Image,
  ShoppingBag,
  Layout,
  Calendar,
};

export default function ProgressStepper({ steps, currentStep }) {
  const { dispatch } = usePlanner();

  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-ikea-gray-200 hidden sm:block" />
      <motion.div 
        className="absolute top-5 left-0 h-0.5 bg-ikea-blue hidden sm:block"
        initial={{ width: '0%' }}
        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />

      {/* Steps */}
      <div className="flex justify-between relative">
        {steps.map((step, index) => {
          const Icon = iconMap[step.icon] || Home;
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= currentStep + 1;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && dispatch({ type: 'SET_STEP', payload: index })}
              disabled={!isClickable}
              className={`
                flex flex-col items-center relative z-10 transition-all duration-200
                ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
              `}
            >
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 shadow-md
                  ${isComplete 
                    ? 'bg-ikea-blue text-white' 
                    : isCurrent 
                      ? 'bg-ikea-yellow text-ikea-gray-800 ring-4 ring-ikea-yellow/30' 
                      : 'bg-white text-ikea-gray-400 border-2 border-ikea-gray-200'
                  }
                `}
                whileHover={isClickable ? { scale: 1.1 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {isComplete ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              
              <span className={`
                mt-2 text-xs font-medium hidden sm:block
                ${isCurrent ? 'text-ikea-blue' : isComplete ? 'text-ikea-gray-600' : 'text-ikea-gray-400'}
              `}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile current step indicator */}
      <div className="sm:hidden mt-4 text-center">
        <span className="text-sm font-medium text-ikea-blue">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
        </span>
      </div>
    </div>
  );
}

