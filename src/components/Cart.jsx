import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, ArrowRight, ArrowLeft, Trash2, Plus, Minus,
  CreditCard, Calendar, Package, Truck, Shield, Check,
  Sparkles, PartyPopper, Link2, Copy, CheckCircle, X
} from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { formatPrice, getRoom } from '../utils/recommendations';

// Sprite mappings for furniture subcategories
const spriteMap = {
  'sofa': '/sprites/sofa.svg',
  'sofa-bed': '/sprites/sofa-bed.svg',
  'armchair': '/sprites/armchair.svg',
  'office-chair': '/sprites/office-chair.svg',
  'dining-chair': '/sprites/dining-chair.svg',
  'shelving': '/sprites/shelving.svg',
  'tv-unit': '/sprites/tv-unit.svg',
  'bookcase': '/sprites/bookcase.svg',
  'dresser': '/sprites/dresser.svg',
  'wardrobe': '/sprites/wardrobe.svg',
  'drawer-unit': '/sprites/drawer-unit.svg',
  'coffee-table': '/sprites/coffee-table.svg',
  'side-table': '/sprites/side-table.svg',
  'desk': '/sprites/desk.svg',
  'dining-table': '/sprites/dining-table.svg',
  'bed': '/sprites/bed.svg',
  'pendant': '/sprites/pendant.svg',
  'floor-lamp': '/sprites/floor-lamp.svg',
  'table-lamp': '/sprites/table-lamp.svg',
  'rug': '/sprites/rug.svg',
  'textile': '/sprites/textile.svg',
  'plant': '/sprites/plant.svg',
  'frame': '/sprites/frame.svg',
  'vase': '/sprites/vase.svg',
};

const categoryFallback = {
  seating: '/sprites/sofa.svg',
  storage: '/sprites/shelving.svg',
  tables: '/sprites/coffee-table.svg',
  bedroom: '/sprites/bed.svg',
  lighting: '/sprites/pendant.svg',
  decor: '/sprites/plant.svg',
};

function ShareLinkModal({ shareUrl, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Link2 className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-bold text-center">Share Your Cart</h2>
          <p className="text-violet-100 mt-1 text-center text-sm">
            Send this link to share your room design
          </p>
        </div>

        {/* Link Display */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Shareable Link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 font-mono truncate">
                {shareUrl}
              </div>
              <motion.button
                onClick={handleCopy}
                whileTap={{ scale: 0.95 }}
                className={`
                  p-3 rounded-xl transition-all duration-200 flex-shrink-0
                  ${copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-ikea-blue text-white hover:bg-ikea-blue-dark'
                  }
                `}
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </motion.button>
            </div>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-600 text-sm mt-2 flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Copied to clipboard!
              </motion.p>
            )}
          </div>

          <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Perfect for sharing!</p>
              <p className="text-gray-600 mt-1">
                Anyone with this link can view your room design and product selections.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full btn-secondary"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CheckoutSuccessModal({ totalPrice, itemCount, onClose, dispatch }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <PartyPopper className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold">Order Confirmed!</h2>
          <p className="text-emerald-100 mt-2">Thank you for shopping with IKEA</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-emerald-600" />
              <span className="text-gray-700">
                {itemCount} items in your order
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span className="text-gray-700">
                Total: <strong>{formatPrice(totalPrice)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span className="text-gray-700">
                Estimated delivery: 3-5 business days
              </span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">What's next?</p>
              <p className="text-gray-600 mt-1">
                You'll receive a confirmation email with your order details and tracking information once your items ship.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
              dispatch({ type: 'COMPLETE' });
            }}
            className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CartItem({ product, onRemove }) {
  const spritePath = spriteMap[product.subcategory] || categoryFallback[product.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-2"
          />
        ) : spritePath ? (
          <img
            src={spritePath}
            alt={product.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate">{product.name}</h4>
        <p className="text-sm text-gray-500 truncate">{product.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          Art. {product.articleNumber}
        </p>
      </div>

      {/* Price & Remove */}
      <div className="flex flex-col items-end gap-2">
        <span className="text-lg font-bold text-ikea-blue">
          {formatPrice(product.price)}
        </span>
        <button
          onClick={() => onRemove(product.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Cart() {
  const { state, dispatch } = usePlanner();
  const { selectedProducts, roomConfig, budget, selectedStyles } = state;
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const room = getRoom(roomConfig.type);
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const savings = budget.total - totalPrice;

  const handleRemoveProduct = (productId) => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: productId });
  };

  const handleCheckout = () => {
    setShowCheckoutSuccess(true);
  };

  const handleBookConsultation = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleGenerateShareLink = () => {
    // Create a shareable state object with essential data
    const shareData = {
      room: roomConfig.type,
      products: selectedProducts.map(p => p.id),
      budget: budget.total,
      styles: selectedStyles,
    };
    
    // Encode the data as base64
    const encodedData = btoa(JSON.stringify(shareData));
    
    // Generate the shareable URL
    const baseUrl = window.location.origin + window.location.pathname;
    const generatedUrl = `${baseUrl}?share=${encodedData}`;
    
    setShareUrl(generatedUrl);
    setShowShareModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Cart
        </motion.h2>
        <motion.p 
          className="mt-2 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Review your selections and choose how to proceed
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-ikea-blue" />
              Items ({selectedProducts.length})
            </h3>
            
            {/* Share Link Button */}
            {selectedProducts.length > 0 && (
              <motion.button
                onClick={handleGenerateShareLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link2 className="w-4 h-4" />
                Share Cart
              </motion.button>
            )}
          </motion.div>

          {selectedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 rounded-2xl p-12 text-center"
            >
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600">Your cart is empty</h4>
              <p className="text-gray-400 mt-2">Go back and add some products to your room</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {selectedProducts.map((product) => (
                  <CartItem
                    key={product.id}
                    product={product}
                    onRemove={handleRemoveProduct}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Order Summary & CTAs */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Room Type</span>
                <span className="font-medium text-gray-800">{room?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Items</span>
                <span className="font-medium text-gray-800">{selectedProducts.length}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Budget</span>
                <span className="font-medium text-gray-800">{formatPrice(budget.total)}</span>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-ikea-blue">{formatPrice(totalPrice)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600 mt-1">
                    <span className="text-sm">Under budget by</span>
                    <span className="text-sm font-medium">{formatPrice(savings)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck className="w-4 h-4 text-ikea-blue" />
                <span>Free delivery on orders over SAR 500</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Options */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <p className="text-center text-sm text-gray-500 font-medium">
              Choose how you'd like to proceed
            </p>

            {/* Checkout Option */}
            <button
              onClick={handleCheckout}
              disabled={selectedProducts.length === 0}
              className={`
                w-full group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                ${selectedProducts.length === 0 
                  ? 'bg-gray-100 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                  ${selectedProducts.length === 0 ? 'bg-gray-200' : 'bg-white/20'}
                `}>
                  <CreditCard className={`w-7 h-7 ${selectedProducts.length === 0 ? 'text-gray-400' : 'text-white'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold ${selectedProducts.length === 0 ? 'text-gray-400' : 'text-white'}`}>
                    Checkout Now
                  </h4>
                  <p className={`text-sm mt-1 ${selectedProducts.length === 0 ? 'text-gray-400' : 'text-white/80'}`}>
                    Complete your purchase and get your items delivered
                  </p>
                </div>
                <ArrowRight className={`w-6 h-6 ${selectedProducts.length === 0 ? 'text-gray-400' : 'text-white'} group-hover:translate-x-1 transition-transform`} />
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Consultation Option */}
            <button
              onClick={handleBookConsultation}
              disabled={selectedProducts.length === 0}
              className={`
                w-full group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 border-2
                ${selectedProducts.length === 0 
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                  : 'bg-white border-ikea-blue hover:bg-ikea-blue/5 shadow-lg hover:shadow-xl'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                  ${selectedProducts.length === 0 ? 'bg-gray-200' : 'bg-ikea-blue/10'}
                `}>
                  <Calendar className={`w-7 h-7 ${selectedProducts.length === 0 ? 'text-gray-400' : 'text-ikea-blue'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold ${selectedProducts.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                    Book Consultation
                  </h4>
                  <p className={`text-sm mt-1 ${selectedProducts.length === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                    Get expert advice before finalizing your purchase
                  </p>
                </div>
                <ArrowRight className={`w-6 h-6 ${selectedProducts.length === 0 ? 'text-gray-400' : 'text-ikea-blue'} group-hover:translate-x-1 transition-transform`} />
              </div>
            </button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-50 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium">Not sure?</p>
                <p className="text-gray-600 mt-1">
                  Our design consultants can help optimize your room layout and suggest alternatives that fit your style.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => dispatch({ type: 'PREV_STEP' })}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Layout
        </button>
      </div>

      {/* Checkout Success Modal */}
      <AnimatePresence>
        {showCheckoutSuccess && (
          <CheckoutSuccessModal
            totalPrice={totalPrice}
            itemCount={selectedProducts.length}
            onClose={() => setShowCheckoutSuccess(false)}
            dispatch={dispatch}
          />
        )}
      </AnimatePresence>

      {/* Share Link Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareLinkModal
            shareUrl={shareUrl}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

