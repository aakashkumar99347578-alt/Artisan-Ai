import React, { useState } from 'react';
import { CartItem } from '../types';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Sparkles,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'DIWALI2026' || couponCode.toUpperCase() === 'HANDMADE10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setCouponApplied(true);
    } else {
      alert('Invalid coupon. Try using DIWALI2026 for 10% festive artisan discount!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 border-l border-[#DFD5C4]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EFE9DE] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C85A32]" />
            <h3 className="font-serif font-bold text-base text-[#2D241E]">
              Artisan Shopping Bag
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32]">
              {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C7A6B] hover:text-[#2D241E] hover:bg-white rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#F4EFE6]">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#DFD5C4] flex items-center justify-center mx-auto text-[#8C7A6B]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#2D241E]">
                Your bag is empty
              </h4>
              <p className="text-xs text-[#8C7A6B] max-w-xs mx-auto">
                Explore handloom textiles, blue pottery, and brass sculptures created by verified master artisans.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-semibold cursor-pointer"
              >
                Discover Indian Crafts
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} className="py-3.5 flex gap-3.5">
                <img
                  src={item.product.images[0]?.image_url}
                  alt={item.product.title}
                  className="w-20 h-20 rounded-xl object-cover border border-[#DFD5C4] bg-[#FAF7F2] shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif font-bold text-[#2D241E] line-clamp-1">
                        {item.product.title}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-[#8C7A6B] hover:text-red-600 p-0.5 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#8C7A6B]">
                      By {item.product.artisan_name} • {item.product.region.split(',')[0]}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-serif font-bold text-sm text-[#2D241E]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#DFD5C4] rounded-lg bg-[#FAF7F2]">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                        }
                        className="px-2 py-0.5 text-xs font-bold text-[#5A3924] hover:bg-[#EFE9DE] rounded-l-lg cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-[11px] font-bold text-[#2D241E]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold text-[#5A3924] hover:bg-[#EFE9DE] rounded-r-lg cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Order Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EFE9DE] bg-[#FAF7F2] space-y-3 text-xs">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Festive code (e.g. DIWALI2026)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-[#DFD5C4] bg-white uppercase text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-[#3E2415] text-white text-xs font-semibold cursor-pointer"
              >
                Apply
              </button>
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 pt-1 text-[#5A3924]">
              <div className="flex justify-between">
                <span>Craft Subtotal</span>
                <span className="font-semibold text-[#2D241E]">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-[#2E4B3D] font-medium">
                  <span>Festive Artisan Discount (10%)</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Pan-India Insured Transit</span>
                <span className="font-semibold text-[#2D241E]">
                  {shipping === 0 ? (
                    <span className="text-[#2E4B3D] font-bold">FREE (Over ₹1,999)</span>
                  ) : (
                    `₹${shipping}`
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-[#DFD5C4] flex justify-between items-baseline text-sm">
                <span className="font-serif font-bold text-[#2D241E]">Total Amount</span>
                <span className="font-serif font-bold text-lg text-[#C85A32]">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full py-3 rounded-xl bg-[#C85A32] hover:bg-[#B04924] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
            >
              <span>Proceed to Insured Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#8C7A6B] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E4B3D]" />
              <span>100% fair artisan payment guaranteed</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
