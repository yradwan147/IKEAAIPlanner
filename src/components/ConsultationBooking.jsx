import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import { format, addDays, isWeekend } from 'date-fns';
import { 
  Calendar, Clock, User, Mail, Phone, MessageSquare, 
  ArrowLeft, Check, Video, MapPin, Sparkles, PartyPopper
} from 'lucide-react';
import { usePlanner } from '../hooks/usePlanner.jsx';
import { formatPrice, getRoom } from '../utils/recommendations';
import 'react-day-picker/dist/style.css';

const timeSlots = [
  { id: '09:00', label: '9:00 AM', available: true },
  { id: '10:00', label: '10:00 AM', available: true },
  { id: '11:00', label: '11:00 AM', available: true },
  { id: '12:00', label: '12:00 PM', available: false },
  { id: '14:00', label: '2:00 PM', available: true },
  { id: '15:00', label: '3:00 PM', available: true },
  { id: '16:00', label: '4:00 PM', available: true },
  { id: '17:00', label: '5:00 PM', available: true },
];

const consultationTypes = [
  { 
    id: 'online', 
    label: 'Online Video Call', 
    icon: Video,
    description: 'Connect with our expert from anywhere',
    duration: '30 min',
  },
  { 
    id: 'instore', 
    label: 'In-Store Visit', 
    icon: MapPin,
    description: 'Visit your nearest IKEA store',
    duration: '45 min',
  },
];

function SuccessModal({ consultation, room, totalPrice, onClose }) {
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
        <div className="gradient-ikea p-8 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <PartyPopper className="w-10 h-10 text-ikea-blue" />
          </motion.div>
          <h2 className="text-2xl font-bold">Consultation Booked!</h2>
          <p className="text-blue-100 mt-2">We're excited to help you create your dream space</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="bg-ikea-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-ikea-blue" />
              <span className="text-ikea-gray-700">
                {consultation.date && format(new Date(consultation.date), 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-ikea-blue" />
              <span className="text-ikea-gray-700">
                {timeSlots.find(t => t.id === consultation.timeSlot)?.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {consultation.type === 'online' ? (
                <Video className="w-5 h-5 text-ikea-blue" />
              ) : (
                <MapPin className="w-5 h-5 text-ikea-blue" />
              )}
              <span className="text-ikea-gray-700">
                {consultation.type === 'online' ? 'Video Consultation' : 'In-Store Visit'}
              </span>
            </div>
          </div>

          <div className="border-t border-ikea-gray-200 pt-4">
            <p className="text-sm text-ikea-gray-500 mb-2">Your plan summary:</p>
            <div className="flex justify-between items-center">
              <span className="font-medium text-ikea-gray-700">{room?.name || 'Room'} Design</span>
              <span className="font-bold text-ikea-blue">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="bg-ikea-yellow/20 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-ikea-gray-700">
              <p className="font-medium">What's next?</p>
              <p className="text-ikea-gray-600 mt-1">
                You'll receive a confirmation email at <strong>{consultation.email}</strong> with 
                meeting details and a link to prepare for your consultation.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-ikea-gray-100">
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ConsultationBooking() {
  const { state, dispatch } = usePlanner();
  const { consultation, roomConfig, selectedProducts } = state;
  const [consultationType, setConsultationType] = useState('online');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const room = getRoom(roomConfig.type);
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  // Date restrictions - next 30 days, no weekends
  const today = new Date();
  const disabledDays = [
    { before: addDays(today, 1) },
    { after: addDays(today, 30) },
    { dayOfWeek: [5, 6] }, // Friday and Saturday (Saudi weekend)
  ];

  const handleInputChange = (field, value) => {
    dispatch({ type: 'SET_CONSULTATION', payload: { [field]: value } });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!consultation.date) newErrors.date = 'Please select a date';
    if (!consultation.timeSlot) newErrors.timeSlot = 'Please select a time';
    if (!consultation.name?.trim()) newErrors.name = 'Name is required';
    if (!consultation.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(consultation.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!consultation.phone?.trim()) newErrors.phone = 'Phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      dispatch({ type: 'SET_CONSULTATION', payload: { type: consultationType } });
      setShowSuccess(true);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    dispatch({ type: 'COMPLETE' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-ikea-gray-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Book Your Consultation
        </motion.h2>
        <motion.p 
          className="mt-2 text-ikea-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Get expert guidance to finalize your room design
        </motion.p>
      </div>

      {/* Consultation Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {consultationTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = consultationType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => setConsultationType(type.id)}
              className={`
                p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${isSelected 
                  ? 'border-ikea-blue bg-ikea-blue/5 shadow-lg' 
                  : 'border-ikea-gray-200 bg-white hover:border-ikea-blue/50'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${isSelected ? 'bg-ikea-blue text-white' : 'bg-ikea-gray-100 text-ikea-gray-600'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ikea-gray-800">{type.label}</h3>
                  <p className="text-sm text-ikea-gray-500 mt-1">{type.description}</p>
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-ikea-gray-100 text-ikea-gray-600 rounded-full">
                    {type.duration}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-ikea-blue rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-6 shadow-lg"
        >
          <h3 className="font-semibold text-ikea-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ikea-blue" />
            Select Date & Time
          </h3>

          {/* Date Picker */}
          <div className="flex justify-center mb-6">
            <DayPicker
              mode="single"
              selected={consultation.date ? new Date(consultation.date) : undefined}
              onSelect={(date) => handleInputChange('date', date?.toISOString())}
              disabled={disabledDays}
              modifiersStyles={{
                selected: { backgroundColor: '#0058A3' },
              }}
              className="!font-sans"
            />
          </div>
          {errors.date && (
            <p className="text-red-500 text-sm mb-4">{errors.date}</p>
          )}

          {/* Time Slots */}
          <div>
            <p className="text-sm text-ikea-gray-600 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Available Times
            </p>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isSelected = consultation.timeSlot === slot.id;
                
                return (
                  <button
                    key={slot.id}
                    onClick={() => slot.available && handleInputChange('timeSlot', slot.id)}
                    disabled={!slot.available}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${!slot.available 
                        ? 'bg-ikea-gray-100 text-ikea-gray-300 cursor-not-allowed line-through' 
                        : isSelected
                          ? 'bg-ikea-blue text-white shadow-md'
                          : 'bg-ikea-gray-50 text-ikea-gray-700 hover:bg-ikea-blue/10'
                      }
                    `}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
            {errors.timeSlot && (
              <p className="text-red-500 text-sm mt-2">{errors.timeSlot}</p>
            )}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-6 shadow-lg"
        >
          <h3 className="font-semibold text-ikea-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-ikea-blue" />
            Your Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ikea-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ikea-gray-400" />
                <input
                  type="text"
                  value={consultation.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your name"
                  className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ikea-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ikea-gray-400" />
                <input
                  type="email"
                  value={consultation.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ikea-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ikea-gray-400" />
                <input
                  type="tel"
                  value={consultation.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+966 XX XXX XXXX"
                  className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ikea-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-ikea-gray-400" />
                <textarea
                  value={consultation.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any specific questions or requirements..."
                  rows={3}
                  className="input-field pl-10 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-ikea-gray-50 rounded-xl">
            <h4 className="font-medium text-ikea-gray-800 mb-2">Consultation Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ikea-gray-600">Room Type:</span>
                <span className="font-medium">{room?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ikea-gray-600">Selected Products:</span>
                <span className="font-medium">{selectedProducts.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ikea-gray-600">Estimated Total:</span>
                <span className="font-bold text-ikea-blue">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </motion.div>
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
          onClick={handleSubmit}
          className="btn-accent flex items-center gap-2 text-lg"
        >
          <Check className="w-5 h-5" />
          Confirm Booking
        </button>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            consultation={{ ...consultation, type: consultationType }}
            room={room}
            totalPrice={totalPrice}
            onClose={handleCloseSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

