import { motion } from 'framer-motion';
import { Package, AlertCircle } from 'lucide-react';
import productsData from '../data/products.json';

export default function DebugProducts() {
  const products = productsData.products;

  return (
    <div className="min-h-screen bg-ikea-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ikea-gray-800 flex items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            Debug: All Products ({products.length})
          </h1>
          <p className="text-ikea-gray-500 mt-2">
            Review all product images to identify any that need fixing
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-ikea-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="absolute inset-0 bg-red-100 items-center justify-center text-red-500 hidden"
                >
                  <span className="text-xs text-center p-2">Image Failed</span>
                </div>
                
                {/* Index Badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  #{index + 1}
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-2 right-2 bg-ikea-blue text-white text-xs px-2 py-1 rounded">
                  {product.category}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-sm text-ikea-gray-800 truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-ikea-gray-500 truncate mt-0.5">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-ikea-gray-400">
                    {product.articleNumber}
                  </span>
                  <span className="text-sm font-bold text-ikea-blue">
                    SAR {product.price.toLocaleString()}
                  </span>
                </div>
                
                {/* Subcategory */}
                <div className="mt-2 pt-2 border-t border-ikea-gray-100">
                  <span className="text-xs bg-ikea-gray-100 text-ikea-gray-600 px-2 py-0.5 rounded">
                    {product.subcategory}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary by Category */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-md">
          <h2 className="font-bold text-lg text-ikea-gray-800 mb-4">Products by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              products.reduce((acc, p) => {
                acc[p.category] = (acc[p.category] || 0) + 1;
                return acc;
              }, {})
            ).map(([category, count]) => (
              <div key={category} className="bg-ikea-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-ikea-blue">{count}</div>
                <div className="text-sm text-ikea-gray-600 capitalize">{category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Back to App
          </button>
        </div>
      </div>
    </div>
  );
}

