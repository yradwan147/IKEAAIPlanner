import productsData from '../data/products.json';
import stylesData from '../data/styles.json';
import roomsData from '../data/roomTemplates.json';

const { products } = productsData;
const { styles } = stylesData;
const { rooms, familySizes } = roomsData;

export function getRoom(roomId) {
  return rooms.find(r => r.id === roomId);
}

export function getStyle(styleId) {
  return styles.find(s => s.id === styleId);
}

export function getFamilySize(familySizeId) {
  return familySizes.find(f => f.id === familySizeId);
}

export function filterProductsByRoom(roomId) {
  return products.filter(p => p.rooms.includes(roomId));
}

export function filterProductsByStyle(productList, styleIds) {
  if (!styleIds || styleIds.length === 0) return productList;
  
  return productList.filter(product => 
    product.styles.some(style => styleIds.includes(style))
  ).sort((a, b) => {
    // Sort by how many matching styles
    const aMatches = a.styles.filter(s => styleIds.includes(s)).length;
    const bMatches = b.styles.filter(s => styleIds.includes(s)).length;
    return bMatches - aMatches;
  });
}

export function filterProductsByBudget(productList, maxPrice) {
  return productList.filter(p => p.price <= maxPrice);
}

export function calculateBudgetAllocation(totalBudget, roomId, smartBudget = true) {
  const room = getRoom(roomId);
  if (!room || !smartBudget) {
    return {
      seating: totalBudget * 0.4,
      storage: totalBudget * 0.25,
      lighting: totalBudget * 0.15,
      decor: totalBudget * 0.1,
      tables: totalBudget * 0.1,
    };
  }
  
  const allocation = {};
  for (const [category, percentage] of Object.entries(room.budgetAllocation)) {
    allocation[category] = Math.round(totalBudget * (percentage / 100));
  }
  return allocation;
}

export function generateRecommendations(config) {
  const { roomId, budget, styleIds, familySizeId } = config;
  
  const room = getRoom(roomId);
  const familySize = getFamilySize(familySizeId);
  
  if (!room) return { products: [], bundles: [], totalPrice: 0 };
  
  // Get budget allocation
  const budgetAllocation = calculateBudgetAllocation(budget, roomId);
  
  // Filter products by room
  let availableProducts = filterProductsByRoom(roomId);
  
  // Filter by styles
  availableProducts = filterProductsByStyle(availableProducts, styleIds);
  
  // Create category bundles
  const bundles = [];
  const selectedProducts = [];
  let totalPrice = 0;
  
  // Essential categories for the room
  const essentialCategories = room.essentialCategories;
  
  for (const category of essentialCategories) {
    const categoryBudget = budgetAllocation[category] || budget * 0.15;
    
    // Get products in this category
    const categoryProducts = availableProducts.filter(p => 
      p.category === category || 
      (category === 'tables' && p.category === 'tables') ||
      (category === 'bedroom' && p.category === 'bedroom')
    );
    
    // Filter by budget and sort by price (prefer mid-range)
    const affordableProducts = filterProductsByBudget(categoryProducts, categoryBudget);
    
    if (affordableProducts.length > 0) {
      // Pick the best match (highest style match within budget)
      const picked = affordableProducts[0];
      
      if (totalPrice + picked.price <= budget) {
        selectedProducts.push(picked);
        totalPrice += picked.price;
        
        bundles.push({
          category,
          product: picked,
          budgetAllocated: categoryBudget,
          alternatives: affordableProducts.slice(1, 4),
        });
      }
    }
  }
  
  // Add some decor items if budget allows
  const decorItems = availableProducts.filter(p => p.category === 'decor');
  const remainingBudget = budget - totalPrice;
  
  for (const item of decorItems) {
    if (item.price <= remainingBudget && !selectedProducts.find(p => p.id === item.id)) {
      if (totalPrice + item.price <= budget * 0.95) {
        selectedProducts.push(item);
        totalPrice += item.price;
        
        if (totalPrice >= budget * 0.8) break;
      }
    }
  }
  
  return {
    products: selectedProducts,
    bundles,
    totalPrice,
    budget,
    budgetUtilization: Math.round((totalPrice / budget) * 100),
    room,
    styleMatches: styleIds,
  };
}

export function getProductAlternatives(productId, budget) {
  const product = products.find(p => p.id === productId);
  if (!product) return [];
  
  return products.filter(p => 
    p.id !== productId &&
    p.subcategory === product.subcategory &&
    p.price <= budget * 1.2 &&
    p.price >= budget * 0.5
  ).slice(0, 4);
}

export function analyzeInspirationImage(imageColors) {
  // Simulated AI analysis - in real implementation, this would call a vision API
  const styleScores = {};
  
  for (const style of styles) {
    let score = Math.random() * 40 + 30; // Base random score 30-70
    
    // Boost based on color matching (simplified)
    if (imageColors) {
      score += Math.random() * 30;
    }
    
    styleScores[style.id] = Math.min(Math.round(score), 95);
  }
  
  // Sort and normalize
  const sorted = Object.entries(styleScores)
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({
      style: styles.find(s => s.id === id),
      confidence: score,
    }));
  
  return sorted;
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export { products, styles, rooms, familySizes };

