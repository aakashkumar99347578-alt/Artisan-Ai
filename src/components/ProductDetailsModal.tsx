import React, { useState } from 'react';
import { Product, Artisan } from '../types';
import { Product360Viewer } from './Product360Viewer';
import {
  X,
  Heart,
  ShoppingBag,
  Building2,
  MessageSquare,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Truck,
  RotateCcw,
  Eye,
} from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  artisan: Artisan | null;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBulkInquiry: (product: Product) => void;
  onMessageArtisan: (product: Product) => void;
  onViewArtisanProfile: (artisanId: string) => void;
  onDirectBuy: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  artisan,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onBulkInquiry,
  onMessageArtisan,
  onViewArtisanProfile,
  onDirectBuy,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [show360Modal, setShow360Modal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'craft' | 'specs' | 'artisan' | 'shipping'>('craft');

  const images = product.images || [
    {
      id: 'default',
      image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      image_type: 'original',
    },
  ];

  const currentImage = images[activeImageIndex]?.image_url || images[0].image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl my-auto bg-white rounded-3xl shadow-2xl border border-[#DFD5C4] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#EFE9DE] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C85A32]/15 text-[#C85A32] text-xs font-bold uppercase tracking-wider">
              {product.craft_type}
            </span>
            <span className="text-xs text-[#8C7A6B]">•</span>
            <span className="text-xs text-[#5A3924] flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              {product.region}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C7A6B] hover:text-[#2D241E] hover:bg-white rounded-full transition-all cursor-pointer"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gallery & 360 Viewer */}
          <div className="lg:col-span-6 space-y-4">
            {show360Modal ? (
              <div>
                <Product360Viewer
                  baseImageUrl={currentImage}
                  productTitle={product.title}
                  craftType={product.craft_type}
                />
                <button
                  onClick={() => setShow360Modal(false)}
                  className="mt-2 text-xs font-bold text-[#C85A32] hover:underline cursor-pointer flex items-center gap-1"
                >
                  ← Return to Photographic Gallery
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Main Active Image with 360 Overlay Trigger */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F4EFE6] border border-[#DFD5C4] group">
                  <img
                    src={currentImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* 360 degree viewer button */}
                  <button
                    onClick={() => setShow360Modal(true)}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#3E2415] text-xs font-bold shadow-md border border-[#DFD5C4] flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-transform hover:scale-105"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>360° Studio View</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md ${
                      isWishlisted
                        ? 'bg-[#C85A32] text-white'
                        : 'bg-white/90 text-[#3E2415] hover:bg-white hover:text-[#C85A32]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20'
                            : 'border-[#DFD5C4] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Artisan Information Card ("Made by") */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C4] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={product.artisan_image_url}
                  alt={product.artisan_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#C85A32]"
                />
                <div>
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                    Made by Artisan
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#2D241E]">
                    {product.artisan_name}
                  </h4>
                  <p className="text-xs text-[#5A3924] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2E4B3D]" />
                    <span>Certified Master Craftsperson</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => onViewArtisanProfile(product.artisan_id)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F4EFE6] text-[#C85A32] border border-[#DFD5C4] text-xs font-bold cursor-pointer"
              >
                View Story →
              </button>
            </div>
          </div>

          {/* Right Column: Title, Prices, Specifications, Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Product Title & Reviews */}
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D241E] leading-snug">
                  {product.title}
                </h1>

                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 font-bold text-[#3E2415]">
                    <Star className="w-4 h-4 text-[#E27D26] fill-[#E27D26]" />
                    <span>{product.rating || 4.9}</span>
                    <span className="text-[#8C7A6B] font-normal">({product.review_count || 24} reviews)</span>
                  </div>
                  <span className="text-[#DFD5C4]">•</span>
                  <span className="text-[#2E4B3D] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In Stock ({product.stock} available)
                  </span>
                </div>
              </div>

              {/* Price Container (Retail + B2B Wholesale Quote Option) */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE9DE] space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-[#8C7A6B] block">Retail Price (Inc. all taxes)</span>
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2D241E]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {product.b2b_price && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#2E4B3D] flex items-center justify-end gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        B2B Wholesale Price
                      </span>
                      <span className="font-serif text-xl font-bold text-[#2E4B3D]">
                        ₹{product.b2b_price.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-[#5A3924]"> / unit</span>
                      </span>
                      <p className="text-[10px] text-[#8C7A6B]">
                        Eligible on {product.bulk_min_units || 10}+ units with custom packaging
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#DFD5C4]/60 flex items-center justify-between text-xs text-[#5A3924]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                    Production Time: {product.production_time}
                  </span>
                  <span className="text-[11px] text-[#2E4B3D] font-medium">
                    {product.customization_available ? '✓ Customization available' : ''}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-[#EFE9DE] gap-4 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('craft')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'craft'
                      ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
                      : 'text-[#8C7A6B] hover:text-[#2D241E]'
                  }`}
                >
                  Craft Story
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'specs'
                      ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
                      : 'text-[#8C7A6B] hover:text-[#2D241E]'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 transition-colors cursor-pointer ${
                    activeTab === 'shipping'
                      ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
                      : 'text-[#8C7A6B] hover:text-[#2D241E]'
                  }`}
                >
                  Shipping & Returns
                </button>
              </div>

              {/* Tab Contents */}
              <div className="text-xs text-[#5A3924] leading-relaxed min-h-[100px]">
                {activeTab === 'craft' && (
                  <div className="space-y-2">
                    <p>{product.description}</p>
                    <p className="text-[#8C7A6B] italic font-serif mt-2">
                      “Every curve, glaze, and thread reflects generations of familial mastery, ensuring that cultural heritage remains alive in modern spaces.”
                    </p>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#FAF7F2]">
                      <span className="text-[#8C7A6B] block">Material</span>
                      <span className="font-semibold text-[#2D241E]">{product.material}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FAF7F2]">
                      <span className="text-[#8C7A6B] block">Colour</span>
                      <span className="font-semibold text-[#2D241E]">{product.colour || 'Natural'}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FAF7F2]">
                      <span className="text-[#8C7A6B] block">Dimensions</span>
                      <span className="font-semibold text-[#2D241E]">{product.dimensions || 'Standard artisanal size'}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FAF7F2]">
                      <span className="text-[#8C7A6B] block">Weight</span>
                      <span className="font-semibold text-[#2D241E]">{product.weight || 'Hand-measured'}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FAF7F2] col-span-2">
                      <span className="text-[#8C7A6B] block">Care Instructions</span>
                      <span className="text-[#2D241E]">{product.care_instructions || 'Clean with dry soft muslin cloth.'}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Truck className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#2D241E]">Fragile & Insured Pan-India Transit</p>
                        <p className="text-[#8C7A6B]">Dispatched securely from artisan kiln/workshop within 48 hours in biodegradable 5-ply shock absorbent crating.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <RotateCcw className="w-4 h-4 text-[#2E4B3D] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#2D241E]">Artisan Authentic Guarantee</p>
                        <p className="text-[#8C7A6B]">7-day hassle-free replacement in the rare event of transit damage with photo verification.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Add to Cart, Buy Now, Send Bulk Inquiry, Message Artisan */}
            <div className="pt-4 border-t border-[#EFE9DE] space-y-3">
              {/* Quantity selector & Retail Cart buttons */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#DFD5C4] rounded-xl bg-[#FAF7F2]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-sm font-bold text-[#5A3924] hover:bg-[#EFE9DE] rounded-l-xl cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-[#2D241E]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-sm font-bold text-[#5A3924] hover:bg-[#EFE9DE] rounded-r-xl cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3E2415] border border-[#DFD5C4] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C85A32]" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => onDirectBuy(product)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#C85A32] hover:bg-[#B04924] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              {/* B2B Bulk Inquiry & Direct Message Bar */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => onBulkInquiry(product)}
                  className="py-2.5 px-3 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Send Bulk Inquiry (B2B)</span>
                </button>

                <button
                  onClick={() => onMessageArtisan(product)}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#3E2415] border border-[#DFD5C4] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#C85A32]" />
                  <span>Message Artisan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
