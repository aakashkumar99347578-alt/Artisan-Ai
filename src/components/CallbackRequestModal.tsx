import React, { useState } from 'react';
import { CallbackRequest } from '../types';
import { dataStore } from '../lib/supabase';
import { Phone, Calendar, Clock, CheckCircle2, X, Sparkles, UserCheck } from 'lucide-react';

interface CallbackRequestModalProps {
  onClose: () => void;
  onSuccess: (request: CallbackRequest) => void;
}

export const CallbackRequestModal: React.FC<CallbackRequestModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const currentArtisan = dataStore.getArtisans()[0];

  const [phone, setPhone] = useState(currentArtisan?.profile_id ? '+91 94140 12345' : '+91 98110 99887');
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi');
  const [preferredDate, setPreferredDate] = useState('2026-09-10');
  const [preferredTime, setPreferredTime] = useState('Morning (10:00 AM - 1:00 PM)');
  const [productType, setProductType] = useState('Terracotta Pottery & Hand-thrown Vases');
  const [approxProducts, setApproxProducts] = useState(3);
  const [message, setMessage] = useState('I want to list 3 new blue pottery plates with peacock motifs before the Diwali festival.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newRequest = dataStore.createCallbackRequest({
        artisan_id: currentArtisan.id,
        artisan_name: currentArtisan.name,
        phone,
        preferred_language: preferredLanguage,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        product_type: productType,
        approximate_products: Number(approxProducts),
        message,
      });

      setIsSubmitting(false);
      onSuccess(newRequest);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-auto bg-white rounded-3xl shadow-2xl border border-[#DFD5C4] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE9DE] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2E4B3D]/10 text-[#2E4B3D] flex items-center justify-center">
              <Phone className="w-5 h-5 text-[#2E4B3D]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D241E]">
                Request Free Listing Call Support
              </h3>
              <p className="text-[11px] text-[#8C7A6B]">
                A KalaSetu onboarding operator will call you and list your crafts over the phone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C7A6B] hover:text-[#2D241E] hover:bg-white rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#2D241E] mb-1">
              Your Phone / WhatsApp Number *
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Preferred Spoken Language *
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] bg-[#FAF7F2]"
              >
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Marathi">मराठी (Marathi)</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Number of Products
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={approxProducts}
                onChange={(e) => setApproxProducts(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Preferred Time Slot
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] bg-[#FAF7F2]"
              >
                <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2D241E] mb-1">
              What Crafts / Products do you want to list?
            </label>
            <input
              type="text"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DFD5C4]"
              placeholder="e.g. Handwoven Pashmina Shawls or Brass Statues"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2D241E] mb-1">
              Optional Note for the Operator
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DFD5C4]"
            />
          </div>

          <div className="pt-2 border-t border-[#EFE9DE] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DFD5C4] text-[#5A3924]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white font-semibold cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Booking Call...' : 'Schedule Listing Call'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
