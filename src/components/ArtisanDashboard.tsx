import React, { useState } from 'react';
import { Artisan, Product, Inquiry, Quote, Order } from '../types';
import { dataStore } from '../lib/supabase';
import {
  Sparkles,
  Mic,
  Package,
  FileText,
  Building2,
  TrendingUp,
  Phone,
  Plus,
  ArrowRight,
  Eye,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

interface ArtisanDashboardProps {
  artisan: Artisan;
  products: Product[];
  inquiries: Inquiry[];
  quotes: Quote[];
  orders: Order[];
  onOpenAiStudio: () => void;
  onRequestCallback: () => void;
  onOpenInquiryChat: (inquiry: Inquiry) => void;
  onSelectProduct: (product: Product) => void;
}

export const ArtisanDashboard: React.FC<ArtisanDashboardProps> = ({
  artisan,
  products,
  inquiries,
  quotes,
  orders,
  onOpenAiStudio,
  onRequestCallback,
  onOpenInquiryChat,
  onSelectProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'inquiries' | 'orders'>('products');

  const artisanProducts = products.filter((p) => p.artisan_id === artisan.id);
  const artisanInquiries = inquiries.filter((i) => i.artisan_id === artisan.id);
  const artisanQuotes = quotes.filter((q) => q.artisan_id === artisan.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Artisan Profile Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] border border-[#DFD5C4] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={artisan.profile_image_url}
            alt={artisan.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C85A32] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D241E]">
                {artisan.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E4B3D]/10 text-[#2E4B3D]">
                Verified Master Artisan
              </span>
            </div>
            <p className="text-xs text-[#5A3924]">
              {artisan.craft_name} • {artisan.region}, {artisan.state} • {artisan.years_of_experience} Years Experience
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAiStudio}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C85A32] to-[#E27D26] text-white text-xs font-semibold hover:shadow-md transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Mic className="w-4 h-4" />
            <span>AI Voice & Photo Studio</span>
          </button>

          <button
            onClick={onRequestCallback}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#DFD5C4] text-[#3E2415] text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            <Phone className="w-4 h-4 text-[#C85A32]" />
            <span>Request Listing Call</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DFD5C4] shadow-2xs">
          <span className="text-xs text-[#8C7A6B] block">Active Catalog</span>
          <span className="font-serif text-2xl font-bold text-[#2D241E] mt-1 block">
            {artisanProducts.length}
          </span>
          <span className="text-[10px] text-[#2E4B3D] font-medium">Published on Marketplace</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFD5C4] shadow-2xs">
          <span className="text-xs text-[#8C7A6B] block">B2B Inquiries</span>
          <span className="font-serif text-2xl font-bold text-[#C85A32] mt-1 block">
            {artisanInquiries.length}
          </span>
          <span className="text-[10px] text-[#5A3924] font-medium">Wholesale requests</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFD5C4] shadow-2xs">
          <span className="text-xs text-[#8C7A6B] block">Quotes Generated</span>
          <span className="font-serif text-2xl font-bold text-[#2E4B3D] mt-1 block">
            {artisanQuotes.length}
          </span>
          <span className="text-[10px] text-[#2E4B3D] font-medium">
            {artisanQuotes.filter((q) => q.status === 'Accepted').length} Accepted
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFD5C4] shadow-2xs">
          <span className="text-xs text-[#8C7A6B] block">Festive Demand Level</span>
          <span className="font-serif text-2xl font-bold text-[#E27D26] mt-1 block">
            HIGH
          </span>
          <span className="text-[10px] text-[#E27D26] font-medium">Diwali Season Surge (+180%)</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#EFE9DE] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 cursor-pointer ${
            activeTab === 'products'
              ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
              : 'text-[#8C7A6B] hover:text-[#2D241E]'
          }`}
        >
          My Listed Products ({artisanProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 cursor-pointer ${
            activeTab === 'inquiries'
              ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
              : 'text-[#8C7A6B] hover:text-[#2D241E]'
          }`}
        >
          Wholesale B2B Inquiries ({artisanInquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
              : 'text-[#8C7A6B] hover:text-[#2D241E]'
          }`}
        >
          Customer Orders
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#2D241E]">
              Listed Crafts Collection
            </h3>
            <button
              onClick={onOpenAiStudio}
              className="px-3.5 py-1.5 rounded-xl bg-[#C85A32] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>List New Piece</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {artisanProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-2xl bg-white border border-[#DFD5C4] hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF7F2] mb-3 relative">
                    <img
                      src={prod.images[0]?.image_url}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                      Stock: {prod.stock}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-xs text-[#2D241E] line-clamp-1">
                    {prod.title}
                  </h4>
                  <div className="flex items-baseline justify-between mt-1 text-xs">
                    <span className="font-serif font-bold text-[#2D241E]">₹{prod.price}</span>
                    {prod.b2b_price && (
                      <span className="text-[11px] text-[#2E4B3D] font-medium">
                        B2B: ₹{prod.b2b_price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F4EFE6] flex items-center justify-between">
                  <button
                    onClick={() => onSelectProduct(prod)}
                    className="text-xs font-semibold text-[#C85A32] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                  <span className="text-[10px] text-[#8C7A6B]">
                    {prod.inquiry_count || 0} inquiries
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {artisanInquiries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#DFD5C4]">
              <FileText className="w-10 h-10 text-[#8C7A6B] mx-auto mb-2" />
              <h3 className="font-serif font-bold text-base text-[#2D241E]">No B2B inquiries yet</h3>
              <p className="text-xs text-[#8C7A6B] mt-1">When retailers request bulk orders, they will appear here.</p>
            </div>
          ) : (
            artisanInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-5 rounded-2xl bg-white border border-[#DFD5C4] hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F4EFE6] gap-2 text-xs">
                  <div>
                    <span className="font-serif font-bold text-sm text-[#2D241E]">
                      Inquiry #{inq.inquiry_number}
                    </span>
                    <span className="text-[#8C7A6B] ml-2">From: {inq.buyer_name} ({inq.business_name || 'Retailer'})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] font-bold text-[11px]">
                      {inq.status}
                    </span>
                    <button
                      onClick={() => onOpenInquiryChat(inq)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply & Send Quote</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#5A3924] grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[#8C7A6B] block">Product</span>
                    <span className="font-semibold text-[#2D241E]">{inq.items[0]?.product_title}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7A6B] block">Requested Quantity</span>
                    <span className="font-semibold text-[#2D241E]">{inq.items[0]?.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-[#8C7A6B] block">Buyer Target Price</span>
                    <span className="font-semibold text-[#2D241E]">₹{inq.target_price_per_unit || 'Negotiable'}</span>
                  </div>
                  <div>
                    <span className="text-[#8C7A6B] block">Customization</span>
                    <span className="font-semibold text-[#2D241E] truncate block">{inq.customization_requirements || 'Standard'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-12 text-center bg-white rounded-2xl border border-[#DFD5C4]">
            <Package className="w-10 h-10 text-[#8C7A6B] mx-auto mb-2" />
            <h3 className="font-serif font-bold text-base text-[#2D241E]">Customer Orders</h3>
            <p className="text-xs text-[#8C7A6B] mt-1">Confirmed retail and accepted quote orders will show tracking here.</p>
          </div>
        </div>
      )}
    </div>
  );
};
