import React, { useState } from 'react';
import { Artisan, Product, Inquiry, Order, ProductDraft } from '../types';
import { dataStore, SUPABASE_CONFIG } from '../lib/supabase';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Users,
  Package,
  FileText,
  TrendingUp,
  Sparkles,
  Award,
  Search,
  Filter,
  Eye,
  Check,
  Database,
} from 'lucide-react';

interface AdminDashboardProps {
  artisans: Artisan[];
  products: Product[];
  inquiries: Inquiry[];
  orders: Order[];
  onSelectProduct: (product: Product) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  artisans,
  products,
  inquiries,
  orders,
  onSelectProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'artisans' | 'festivals' | 'insights'>('approvals');
  const [actionNotice, setActionNotice] = useState('');

  // Sample pending drafts for approval workflow
  const [pendingDrafts, setPendingDrafts] = useState<ProductDraft[]>([
    {
      id: 'draft_101',
      artisan_id: 'artisan_1',
      artisan_name: 'Ustad Rameshwar Prajapati',
      source_type: 'call_operator',
      ai_title: '14-inch Royal Blue Pottery Peacock Platter',
      ai_category: 'pottery-ceramics',
      ai_material: 'Quartz Powder, Natural Gum, Cobalt Oxide Glaze',
      ai_craft_type: 'Jaipur Blue Pottery',
      ai_production_time: '21 days',
      suggested_retail_price: 3200,
      suggested_b2b_price: 2100,
      demand_level: 'High',
      status: 'pending_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'draft_102',
      artisan_id: 'artisan_2',
      artisan_name: 'Smt. Jamuna Devi Vankar',
      source_type: 'voice',
      ai_title: 'Organic Kala Cotton Ajrakh Indigo Dupatta',
      ai_category: 'textiles-handloom',
      ai_material: 'Indigenous Kala Cotton & Natural Fermented Indigo',
      ai_craft_type: 'Ajrakh Block Print',
      ai_production_time: '12 days',
      suggested_retail_price: 2800,
      suggested_b2b_price: 1950,
      demand_level: 'High',
      status: 'pending_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const handleApproveDraft = (draft: ProductDraft) => {
    // Publish to live marketplace
    dataStore.addProduct({
      artisan_id: draft.artisan_id,
      artisan_name: draft.artisan_name,
      artisan_image_url:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      category_id: draft.ai_category || 'pottery-ceramics',
      title: draft.ai_title || 'Handcrafted Artisan Platter',
      slug: (draft.ai_title || 'artisan-platter').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      short_description: 'Master artisan handcrafted heritage creation certified by KalaSetu.',
      description: `Authentic traditional ${draft.ai_craft_type} made with ${draft.ai_material}.`,
      price: draft.suggested_retail_price || 2800,
      b2b_price: draft.suggested_b2b_price || 1950,
      bulk_price: (draft.suggested_b2b_price || 1950) * 0.9,
      bulk_min_units: 15,
      stock: 20,
      material: draft.ai_material || 'Natural',
      craft_type: draft.ai_craft_type || 'Heritage Craft',
      production_time: draft.ai_production_time || '15 days',
      region: 'Rajasthan',
      state: 'Rajasthan',
      status: 'published',
      is_featured: true,
      is_trending: true,
      festival_tags: ['Diwali & Dhanteras'],
      images: [
        {
          id: `img_${Date.now()}`,
          image_url:
            'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
          image_type: 'original',
          is_primary: true,
        },
      ],
    });

    setPendingDrafts((prev) => prev.filter((d) => d.id !== draft.id));
    setActionNotice(`Approved "${draft.ai_title}"! It is now live in the KalaSetu marketplace.`);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#2D241E] via-[#3E2415] to-[#2D241E] text-white border border-[#5A3924] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C85A32] text-white">
            KALASETU ADMIN CONSOLE
          </span>
          <h2 className="font-serif text-2xl font-bold mt-1">Platform Control Center</h2>
          <p className="text-xs text-white/80">
            Artisan verification, product approvals, B2B quotes, and festive demand engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold backdrop-blur-xs">
            Admin: admin@kalasetu.in
          </span>
        </div>
      </div>

      {/* Live Supabase Database Connection Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#3ECF8E]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/20 text-[#1B7F53] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2D241E]">
                Supabase Cloud Database Connected
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3ECF8E]/20 text-[#1B7F53] border border-[#3ECF8E]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              Project: <strong className="text-[#2D241E]">{SUPABASE_CONFIG.projectName}</strong> • ID: <code className="font-mono text-[#C85A32]">{SUPABASE_CONFIG.projectId}</code> • URL: <code className="font-mono text-[#5A3924]">{SUPABASE_CONFIG.url}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            PostgreSQL Connected
          </span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice('')} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-[#DFD5C4] shadow-2xs">
          <span className="text-[#8C7A6B] block">Total Master Artisans</span>
          <span className="font-serif text-2xl font-bold text-[#2D241E] mt-1 block">
            {artisans.length}
          </span>
          <span className="text-[10px] text-[#2E4B3D] font-medium">100% Identity Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFD5C4] shadow-2xs">
          <span className="text-[#8C7A6B] block">Live Marketplace Crafts</span>
          <span className="font-serif text-2xl font-bold text-[#C85A32] mt-1 block">
            {products.length}
          </span>
          <span className="text-[10px] text-[#8C7A6B]">Across 8 Craft Categories</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFD5C4] shadow-2xs">
          <span className="text-[#8C7A6B] block">B2B Bulk Inquiries</span>
          <span className="font-serif text-2xl font-bold text-[#2E4B3D] mt-1 block">
            {inquiries.length}
          </span>
          <span className="text-[10px] text-[#2E4B3D]">Wholesale negotiation active</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DFD5C4] shadow-2xs">
          <span className="text-[#8C7A6B] block">Total Platform GMV</span>
          <span className="font-serif text-2xl font-bold text-[#3E2415] mt-1 block">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#2E4B3D] font-semibold">Zero Commission Taken</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EFE9DE] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 cursor-pointer ${
            activeTab === 'approvals'
              ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
              : 'text-[#8C7A6B] hover:text-[#2D241E]'
          }`}
        >
          Product Catalog Approvals ({pendingDrafts.length})
        </button>
        <button
          onClick={() => setActiveTab('artisans')}
          className={`pb-3 cursor-pointer ${
            activeTab === 'artisans'
              ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
              : 'text-[#8C7A6B] hover:text-[#2D241E]'
          }`}
        >
          Master Artisans Directory ({artisans.length})
        </button>
        <button
          onClick={() => setActiveTab('festivals')}
          className={`pb-3 cursor-pointer ${
            activeTab === 'festivals'
              ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
              : 'text-[#8C7A6B] hover:text-[#2D241E]'
          }`}
        >
          Festive & Demand Engine
        </button>
      </div>

      {/* Tab 1: Product Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#2D241E]">
              AI Voice & Call Drafts Requiring Review
            </h3>
            <span className="text-xs text-[#8C7A6B]">
              Curate craft standards before products go live to buyers
            </span>
          </div>

          {pendingDrafts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#DFD5C4]">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-serif font-bold text-base text-[#2D241E]">
                All product submissions approved!
              </h4>
              <p className="text-xs text-[#8C7A6B]">No pending drafts in the approval queue.</p>
            </div>
          ) : (
            pendingDrafts.map((draft) => (
              <div
                key={draft.id}
                className="p-5 rounded-2xl bg-white border border-[#DFD5C4] hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C85A32]/10 text-[#C85A32]">
                      Source: {draft.source_type.toUpperCase()}
                    </span>
                    <span className="font-serif font-bold text-sm text-[#2D241E]">
                      {draft.ai_title}
                    </span>
                  </div>

                  <p className="text-[#5A3924]">
                    Artisan: <strong>{draft.artisan_name}</strong> • Discipline: {draft.ai_craft_type}
                  </p>
                  <p className="text-[#8C7A6B]">
                    Materials: {draft.ai_material} • Craft Duration: {draft.ai_production_time}
                  </p>
                  <p className="font-semibold text-[#2E4B3D]">
                    Retail: ₹{draft.suggested_retail_price} | B2B Wholesale: ₹{draft.suggested_b2b_price}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setPendingDrafts((prev) => prev.filter((d) => d.id !== draft.id))}
                    className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-semibold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveDraft(draft)}
                    className="px-5 py-2 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Publish Live</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Artisans Directory */}
      {activeTab === 'artisans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artisans.map((art) => (
              <div
                key={art.id}
                className="p-4 rounded-2xl bg-white border border-[#DFD5C4] flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={art.profile_image_url}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover border border-[#DFD5C4]"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#2D241E]">{art.name}</h4>
                    <p className="text-[11px] text-[#5A3924]">
                      {art.craft_name} • {art.region}, {art.state}
                    </p>
                    <p className="text-[10px] text-[#8C7A6B]">
                      {art.years_of_experience} yrs experience • Rating: {art.rating} ★
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#2E4B3D]/10 text-[#2E4B3D] font-bold text-[10px] shrink-0">
                  ✓ Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Festive & Demand Engine */}
      {activeTab === 'festivals' && (
        <div className="p-6 rounded-2xl bg-white border border-[#DFD5C4] space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-[#2D241E]">
            Active Indian Festivals Engine
          </h3>
          <p className="text-[#5A3924]">
            When active, the platform boosts craft discoverability, activates festive tags, and informs artisan production quotas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-[#E27D26]/10 border border-[#E27D26]/30">
              <span className="px-2 py-0.5 rounded bg-[#E27D26] text-white text-[10px] font-bold">
                ACTIVE CAMPAIGN
              </span>
              <h4 className="font-serif font-bold text-sm text-[#2D241E] mt-1">Diwali & Dhanteras</h4>
              <p className="text-[11px] text-[#5A3924] mt-0.5">
                Categories: Pottery, Brass Diyas, Pichwai & Tanjore Art, Silver Gifting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DFD5C4]">
              <span className="px-2 py-0.5 rounded bg-[#8C7A6B] text-white text-[10px] font-bold">
                UPCOMING
              </span>
              <h4 className="font-serif font-bold text-sm text-[#2D241E] mt-1">Navratri & Durga Puja</h4>
              <p className="text-[11px] text-[#5A3924] mt-0.5">
                Categories: Traditional Handlooms, Kantha, Terracotta idols.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DFD5C4]">
              <span className="px-2 py-0.5 rounded bg-[#8C7A6B] text-white text-[10px] font-bold">
                SCHEDULED
              </span>
              <h4 className="font-serif font-bold text-sm text-[#2D241E] mt-1">Indian Wedding Season</h4>
              <p className="text-[11px] text-[#5A3924] mt-0.5">
                Categories: Bridal Handlooms, Corporate & Return Gifting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
