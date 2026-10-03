import React, { useState } from 'react';
import { Product, Inquiry } from '../types';
import { dataStore } from '../lib/supabase';
import {
  X,
  Building2,
  Calendar,
  Send,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Package,
} from 'lucide-react';

interface BulkInquiryModalProps {
  initialProduct: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onSuccess: (inquiry: Inquiry) => void;
}

export const BulkInquiryModal: React.FC<BulkInquiryModalProps> = ({
  initialProduct,
  allProducts,
  onClose,
  onSuccess,
}) => {
  const currentUser = dataStore.getCurrentUser();

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProduct?.id || allProducts[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(initialProduct?.bulk_min_units || 25);
  const [targetPrice, setTargetPrice] = useState<number>(initialProduct?.b2b_price || 1500);
  const [buyerName, setBuyerName] = useState(currentUser.full_name || '');
  const [businessName, setBusinessName] = useState(currentUser.business_name || 'Boutique & Heritage Retailers');
  const [buyerEmail, setBuyerEmail] = useState(currentUser.email || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser.phone || '+91 98112 34567');
  const [deliveryDate, setDeliveryDate] = useState('2026-10-20');
  const [shippingLocation, setShippingLocation] = useState('Mumbai, Maharashtra 400001');
  const [customization, setCustomization] = useState('Custom brand logo debossed under base glaze');
  const [packaging, setPackaging] = useState('Individual eco-friendly rigid boxes with foam cushioning');
  const [message, setMessage] = useState(
    'Namaste. We are planning our festive corporate gifting and boutique store inventory. Please provide your best quote and estimated delivery schedule.'
  );
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = allProducts.find((p) => p.id === selectedProductId) || initialProduct;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newInquiry = dataStore.createInquiry({
        buyer_id: currentUser.id,
        buyer_name: buyerName,
        business_name: businessName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        artisan_id: selectedProduct.artisan_id,
        artisan_name: selectedProduct.artisan_name,
        items: [
          {
            id: `item_${Date.now()}`,
            product_id: selectedProduct.id,
            product_title: selectedProduct.title,
            product_image: selectedProduct.images[0]?.image_url || '',
            quantity: Number(quantity),
            target_unit_price: Number(targetPrice),
          },
        ],
        message,
        target_price_per_unit: Number(targetPrice),
        requested_delivery_date: deliveryDate,
        shipping_location: shippingLocation,
        customization_requirements: customization,
        packaging_requirements: packaging,
      });

      setIsSubmitting(false);
      onSuccess(newInquiry);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto bg-white rounded-3xl shadow-2xl border border-[#DFD5C4] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE9DE] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E4B3D]/10 text-[#2E4B3D] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D241E]">
                B2B Bulk Purchase & Custom Quote
              </h3>
              <p className="text-[11px] text-[#8C7A6B]">
                Direct wholesale inquiry sent directly to master artisan workshop
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C7A6B] hover:text-[#2D241E] hover:bg-white rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Product Picker */}
          <div>
            <label className="block font-semibold text-[#2D241E] mb-1">
              Selected Handmade Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const p = allProducts.find((item) => item.id === e.target.value);
                if (p && p.b2b_price) setTargetPrice(p.b2b_price);
              }}
              className="w-full p-2.5 rounded-xl border border-[#DFD5C4] bg-[#FAF7F2] focus:outline-none focus:border-[#C85A32] font-medium text-xs text-[#2D241E]"
            >
              {allProducts.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.title} (Artisan: {prod.artisan_name}) — Retail ₹{prod.price} | B2B ₹{prod.b2b_price || prod.price * 0.7}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Target Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Required Units (Quantity) *
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Target Unit Price (₹ INR)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Buyer & Business info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Buyer Contact Name *
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Business / Organization Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Phone / WhatsApp *
              </label>
              <input
                type="text"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Delivery & Shipping location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Preferred Delivery By *
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2D241E] mb-1">
                Shipping Destination *
              </label>
              <input
                type="text"
                value={shippingLocation}
                onChange={(e) => setShippingLocation(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Customization & Packaging Requirements */}
          <div>
            <label className="block font-semibold text-[#2D241E] mb-1">
              Customization Requirements (Motifs, Colors, Monograms)
            </label>
            <input
              type="text"
              value={customization}
              onChange={(e) => setCustomization(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              placeholder="e.g. Debossed brand logo under base or specific Pantone thread color"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#2D241E] mb-1">
              Packaging Requirements
            </label>
            <input
              type="text"
              value={packaging}
              onChange={(e) => setPackaging(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
              placeholder="e.g. Individual festive gift boxes with foam inserts and artisan story card"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block font-semibold text-[#2D241E] mb-1">
              Additional Details / Message to Artisan
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#DFD5C4] focus:outline-none focus:border-[#C85A32]"
            />
          </div>

          {/* Attachment (Mock upload) */}
          <div className="pt-1 flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 font-medium text-[#5A3924] cursor-pointer hover:text-[#C85A32]">
              <Paperclip className="w-4 h-4" />
              <span>{attachmentName || 'Attach Design Specs or Logo (PDF/PNG)'}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAttachmentName(e.target.files[0].name);
                  }
                }}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#EFE9DE] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#5A3924] border border-[#DFD5C4] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white font-semibold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Send Bulk Inquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
