import React from 'react';
import { Artisan, Product } from '../types';
import {
  X,
  MapPin,
  Award,
  Calendar,
  ShieldCheck,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ArtisanProfileModalProps {
  artisan: Artisan | null;
  artisanProducts: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSendDirectInquiry: (artisan: Artisan) => void;
}

export const ArtisanProfileModal: React.FC<ArtisanProfileModalProps> = ({
  artisan,
  artisanProducts,
  onClose,
  onSelectProduct,
  onSendDirectInquiry,
}) => {
  if (!artisan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-auto bg-white rounded-3xl shadow-2xl border border-[#DFD5C4] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Banner with Close Button */}
        <div className="relative h-44 sm:h-56 bg-gradient-to-r from-[#3E2415] to-[#C85A32] overflow-hidden">
          {artisan.banner_image_url && (
            <img
              src={artisan.banner_image_url}
              alt={artisan.craft_name}
              className="w-full h-full object-cover opacity-45"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer"
            aria-label="Close artisan profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E27D26] text-white text-[11px] font-bold uppercase tracking-wider">
                {artisan.craft_name}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                {artisan.name}
              </h2>
            </div>

            <button
              onClick={() => onSendDirectInquiry(artisan)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#3E2415] hover:bg-[#FAF7F2] font-semibold text-xs transition-all cursor-pointer shadow-md"
            >
              <span>Connect with Artisan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Bio and Key Stats Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFE9DE]">
            <div className="flex items-center gap-4">
              <img
                src={artisan.profile_image_url}
                alt={artisan.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md -mt-10 relative z-10"
              />
              <div>
                <p className="text-xs text-[#5A3924] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{artisan.region}, {artisan.state}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E4B3D] bg-[#2E4B3D]/10 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Master Artisan
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DFD5C4] text-center">
                <span className="block font-serif font-bold text-base text-[#2D241E]">{artisan.years_of_experience} yrs</span>
                <span className="text-[10px] text-[#8C7A6B]">Experience</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DFD5C4] text-center">
                <span className="block font-serif font-bold text-base text-[#C85A32]">{artisan.total_sales || 500}+</span>
                <span className="text-[10px] text-[#8C7A6B]">Orders Fulfilled</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DFD5C4] text-center">
                <span className="block font-serif font-bold text-base text-[#E27D26]">{artisan.rating || 4.9} ★</span>
                <span className="text-[10px] text-[#8C7A6B]">Buyer Rating</span>
              </div>
            </div>
          </div>

          {/* Artisan Heritage Story */}
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-lg text-[#2D241E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              <span>The Artisan's Lineage & Story</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#5A3924] leading-relaxed">
              {artisan.story}
            </p>

            {artisan.awards && artisan.awards.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {artisan.awards.map((award, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E27D26]/10 text-[#C85A32] text-xs font-semibold"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{award}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5-Step Craft Process (Raw Material -> Preparation -> Handcrafting -> Finishing -> Final Product) */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#2D241E]">
              The 5-Stage Traditional Craft Process
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {artisan.process_steps.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C4] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#C85A32] mb-1">
                      <span>STEP 0{idx + 1}</span>
                      <span className="text-[10px] text-[#8C7A6B]">{p.step}</span>
                    </div>
                    <h4 className="font-serif font-bold text-xs text-[#2D241E] line-clamp-2">
                      {p.title}
                    </h4>
                    <p className="text-[11px] text-[#5A3924] mt-1 line-clamp-4">
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Products by this Artisan */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif font-bold text-lg text-[#2D241E] flex items-center justify-between">
              <span>Handcrafted by {artisan.name}</span>
              <span className="text-xs text-[#8C7A6B] font-sans font-normal">
                {artisanProducts.length} items listed
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {artisanProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="group rounded-xl border border-[#DFD5C4] overflow-hidden bg-white hover:border-[#C85A32] transition-all cursor-pointer shadow-2xs"
                >
                  <div className="aspect-square bg-[#F4EFE6] overflow-hidden">
                    <img
                      src={prod.images[0]?.image_url}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-serif font-bold text-xs text-[#2D241E] line-clamp-1 group-hover:text-[#C85A32]">
                      {prod.title}
                    </h4>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-bold text-xs text-[#2D241E]">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {prod.b2b_price && (
                        <span className="text-[10px] text-[#2E4B3D] font-medium">
                          B2B: ₹{prod.b2b_price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
