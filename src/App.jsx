import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlannerProvider, usePlanner, STEPS } from './hooks/usePlanner.jsx';
import ProgressStepper from './components/ProgressStepper';
import RoomConfig from './components/RoomConfig';
import BudgetSelector from './components/BudgetSelector';
import StyleOrInspiration from './components/StyleOrInspiration';
import ProductRecommendations from './components/ProductRecommendations';
import RoomVisualizer from './components/RoomVisualizer';
import Cart from './components/Cart';
import ConsultationBooking from './components/ConsultationBooking';
import DebugProducts from './components/DebugProducts';
import { Sparkles } from 'lucide-react';

function Header() {
  return (
    <header className="bg-ikea-blue text-white py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 bg-ikea-yellow rounded flex items-center justify-center">
            <span className="text-ikea-blue font-bold text-lg">IKEA</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              AI Room Planner
              <Sparkles className="w-5 h-5 text-ikea-yellow" />
            </h1>
            <p className="text-sm text-blue-200">Smart planning for your perfect home</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-blue-200">Saudi Arabia</p>
          <p className="font-medium">Prices in SAR</p>
        </div>
      </div>
    </header>
  );
}

function StepContent() {
  const { state } = usePlanner();

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const steps = [
    <RoomConfig key="room" />,
    <BudgetSelector key="budget" />,
    <StyleOrInspiration key="style" />,
    <ProductRecommendations key="products" />,
    <RoomVisualizer key="visualizer" />,
    <Cart key="cart" />,
    <ConsultationBooking key="booking" />,
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.currentStep}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {steps[state.currentStep]}
      </motion.div>
    </AnimatePresence>
  );
}

function PlannerApp() {
  const { state } = usePlanner();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col">
        {/* Progress Stepper */}
        <div className="bg-white border-b border-ikea-gray-200 py-4 px-6 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <ProgressStepper steps={STEPS} currentStep={state.currentStep} />
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <StepContent />
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-ikea-gray-800 text-white py-4 px-6 text-center text-sm">
        <p>© 2026 IKEA Innovation Challenge Demo • AI Room Planner</p>
      </footer>
    </div>
  );
}

function App() {
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      setShowDebug(window.location.hash === '#debug');
    };
    
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (showDebug) {
    return <DebugProducts />;
  }

  return (
    <PlannerProvider>
      <PlannerApp />
    </PlannerProvider>
  );
}

export default App;
