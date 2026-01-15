import { createContext, useContext, useReducer, useMemo } from 'react';

const PlannerContext = createContext(null);

const initialState = {
  currentStep: 0,
  roomConfig: {
    type: null,
    width: 4,
    length: 5,
    familySize: 'couple',
  },
  budget: {
    total: 15000,
    breakdown: {
      seating: 40,
      storage: 25,
      lighting: 15,
      decor: 20,
    },
    smartBudget: true,
  },
  selectedStyles: [],
  inspirationImage: null,
  detectedStyles: null,
  selectedProducts: [],
  furnitureLayout: [],
  consultation: {
    date: null,
    timeSlot: null,
    name: '',
    email: '',
    phone: '',
    notes: '',
  },
  isComplete: false,
};

function plannerReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };
    
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    
    case 'SET_ROOM_CONFIG':
      return { ...state, roomConfig: { ...state.roomConfig, ...action.payload } };
    
    case 'SET_BUDGET':
      return { ...state, budget: { ...state.budget, ...action.payload } };
    
    case 'SET_BUDGET_BREAKDOWN':
      return { 
        ...state, 
        budget: { 
          ...state.budget, 
          breakdown: { ...state.budget.breakdown, ...action.payload } 
        } 
      };
    
    case 'TOGGLE_STYLE':
      const styleId = action.payload;
      const hasStyle = state.selectedStyles.includes(styleId);
      return {
        ...state,
        selectedStyles: hasStyle
          ? state.selectedStyles.filter(s => s !== styleId)
          : [...state.selectedStyles, styleId],
      };
    
    case 'SET_STYLES':
      return { ...state, selectedStyles: action.payload };
    
    case 'SET_INSPIRATION_IMAGE':
      return { ...state, inspirationImage: action.payload };
    
    case 'SET_DETECTED_STYLES':
      return { ...state, detectedStyles: action.payload };
    
    case 'ADD_PRODUCT':
      if (state.selectedProducts.find(p => p.id === action.payload.id)) {
        return state;
      }
      return { ...state, selectedProducts: [...state.selectedProducts, action.payload] };
    
    case 'REMOVE_PRODUCT':
      return {
        ...state,
        selectedProducts: state.selectedProducts.filter(p => p.id !== action.payload),
        furnitureLayout: state.furnitureLayout.filter(f => f.productId !== action.payload),
      };
    
    case 'SET_FURNITURE_LAYOUT':
      return { ...state, furnitureLayout: action.payload };
    
    case 'UPDATE_FURNITURE_POSITION':
      return {
        ...state,
        furnitureLayout: state.furnitureLayout.map(item =>
          item.id === action.payload.id
            ? { ...item, x: action.payload.x, y: action.payload.y }
            : item
        ),
      };
    
    case 'SET_CONSULTATION':
      return { ...state, consultation: { ...state.consultation, ...action.payload } };
    
    case 'COMPLETE':
      return { ...state, isComplete: true };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

export function PlannerProvider({ children }) {
  const [state, dispatch] = useReducer(plannerReducer, initialState);
  
  const value = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}

export const STEPS = [
  { id: 0, title: 'Room Setup', icon: 'Home' },
  { id: 1, title: 'Budget', icon: 'Wallet' },
  { id: 2, title: 'Style', icon: 'Palette' },
  { id: 3, title: 'Products', icon: 'ShoppingBag' },
  { id: 4, title: 'Layout', icon: 'Layout' },
  { id: 5, title: 'Book', icon: 'Calendar' },
];
