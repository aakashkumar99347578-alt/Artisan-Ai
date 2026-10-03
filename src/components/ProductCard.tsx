import React from 'react';
import { Product } from '../types';
import { Heart, ShoppingBag, Star, Sparkles, MapPin, Building2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onBulkInquiry: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onBulkInquiry,
}) => {
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group rounded-2xl bg-white border border-[#DFD5C4] hover:border-[#C85A32]/60 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-square overflow-hidden bg-[#F4EFE6] cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-[#C85A32] text-white shadow-md'
              : 'bg-white/80 text-[#3E2415] hover:bg-white hover:text-[#C85A32]'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Dynamic Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.is_trending && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-[#C85A32] text-white shadow-xs">
              Trending
            </span>
          )}
          {product.festival_tags && product.festival_tags.length > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-[#E27D26] text-white shadow-xs">
              {product.festival_tags[0]}
            </span>
          )}
          {product.b2b_price && product.inquiry_count && product.inquiry_count > 15 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-[#2E4B3D] text-white shadow-xs">
              B2B Popular
            </span>
          )}
        </div>

        {/* Quick View overlay hint */}
        <div className="absolute inset-x-0 bottom-0 py-2 bg-black/40 backdrop-blur-xs text-white text-[11px] font-semibold text-center opacity-0 group-hover:opacity-100 transition-opacity">
          Click to View Details & 360° Preview
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1">
        {/* Artisan & Region info */}
        <div className="flex items-center justify-between gap-1 text-[11px] text-[#8C7A6B] mb-1">
          <span className="font-medium text-[#5A3924] truncate">{product.artisan_name}</span>
          <span className="flex items-center gap-0.5 shrink-0 text-[#8C7A6B]">
            <MapPin className="w-3 h-3 text-[#C85A32]" />
            {product.region.split(',')[0]}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelectProduct(product)}
          className="font-serif font-bold text-sm text-[#2D241E] hover:text-[#C85A32] cursor-pointer transition-colors line-clamp-2 min-h-[2.5rem]"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Rating & Craft Type */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F4EFE6] text-xs">
          <span className="text-[11px] text-[#8C7A6B] font-medium truncate max-w-[65%]">
            {product.craft_type}
          </span>
          <div className="flex items-center gap-1 font-bold text-[#3E2415]">
            <Star className="w-3.5 h-3.5 text-[#E27D26] fill-[#E27D26]" />
            <span>{product.rating || 4.9}</span>
            <span className="text-[10px] text-[#8C7A6B] font-normal">({product.review_count || 18})</span>
          </div>
        </div>

        {/* Pricing Block: Retail + B2B Wholesale Tier */}
        <div className="mt-3 pt-2 border-t border-[#F4EFE6]">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[#8C7A6B] block">Retail Price</span>
              <span className="font-serif text-lg font-bold text-[#2D241E]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>

            {product.b2b_price && (
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#2E4B3D] flex items-center justify-end gap-1">
                  <Building2 className="w-3 h-3" />
                  B2B Bulk Price
                </span>
                <span className="text-xs font-bold text-[#2E4B3D]">
                  ₹{product.b2b_price.toLocaleString('en-IN')}
                  <span className="text-[10px] font-normal text-[#8C7A6B]"> ({product.bulk_min_units || 10}+ pcs)</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart & Send Bulk Inquiry */}
        <div className="mt-4 pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="w-full py-2 px-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#C85A32] text-[#3E2415] hover:text-white border border-[#DFD5C4] hover:border-[#C85A32] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>

          <button
            onClick={() => onBulkInquiry(product)}
            className="w-full py-2 px-2.5 rounded-xl bg-[#2E4B3D]/10 hover:bg-[#2E4B3D] text-[#2E4B3D] hover:text-white border border-[#2E4B3D]/20 hover:border-[#2E4B3D] font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="Request a custom bulk quotation for retail store or event"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bulk Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};
