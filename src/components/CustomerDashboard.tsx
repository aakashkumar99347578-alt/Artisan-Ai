import React, { useState } from 'react';
import { UserProfile, Order, Inquiry, Quote, Product, ArtisanCraftStage } from '../types';
import { dataStore } from '../lib/supabase';
import { ArtisanOrderTracker } from './ArtisanOrderTracker';
import { useLanguage } from '../lib/i18n';
import {
  Package,
  FileText,
  Heart,
  User,
  Building2,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Flame,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CustomerDashboardProps {
  currentUser: UserProfile;
  orders: Order[];
  inquiries: Inquiry[];
  quotes: Quote[];
  wishlistProducts: Product[];
  onOpenInquiryChat: (inquiry: Inquiry) => void;
  onSelectProduct: (product: Product) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  orders: initialOrders,
  inquiries,
  quotes,
  wishlistProducts,
  onOpenInquiryChat,
  onSelectProduct,
}) => {
  const { t, isHindiOrRegional } = useLanguage();
  const [activeTab, setActiveTab] = useState<'orders' | 'inquiries' | 'wishlist' | 'profile'>('orders');
  const [orderStageFilter, setOrderStageFilter] = useState<'all' | ArtisanCraftStage>('all');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({
    ord_1001: true, // open first one by default for clear visibility
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pull latest orders to capture live simulated updates
  const orders = dataStore.getOrders();

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStageFilter === 'all') return true;
    return o.artisan_tracking?.current_stage === orderStageFilter;
  });

  const handleTrackerUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF7F2] to-[#F4EFE6] border border-[#DFD5C4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            {currentUser.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D241E]">
                {t('dash.welcome', 'Namaste')}, {currentUser.full_name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E4B3D]/10 text-[#2E4B3D]">
                {currentUser.business_name ? 'B2B Retail Partner' : 'Retail Customer'}
              </span>
            </div>
            <p className="text-xs text-[#5A3924] mt-0.5">
              {currentUser.email} • {currentUser.city || 'India'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inquiries')}
            className="px-4 py-2 rounded-xl bg-white border border-[#DFD5C4] text-xs font-semibold text-[#3E2415] hover:border-[#C85A32] cursor-pointer"
          >
            {inquiries.length} {t('dash.inquiries', 'Inquiries')}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B04924] cursor-pointer"
          >
            {orders.length} {t('dash.orders', 'Orders Placed')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EFE9DE] gap-6 text-xs font-bold overflow-x-auto">
        {[
          { id: 'orders', label: t('dash.orders', 'My Orders & Tracking'), icon: Package, count: orders.length },
          { id: 'inquiries', label: t('dash.inquiries', 'B2B Inquiries & Quotes'), icon: FileText, count: inquiries.length },
          { id: 'wishlist', label: t('dash.wishlist', 'Saved Wishlist'), icon: Heart, count: wishlistProducts.length },
          { id: 'profile', label: t('dash.profile', 'Buyer Profile'), icon: User },
        ].map((tabItem) => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              onClick={() => setActiveTab(tabItem.id as any)}
              className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tabItem.id
                  ? 'border-b-2 border-[#C85A32] text-[#C85A32]'
                  : 'text-[#8C7A6B] hover:text-[#2D241E]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tabItem.label}</span>
              {tabItem.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#FAF7F2] border border-[#DFD5C4]">
                  {tabItem.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Orders & Real-time Artisan Tracking */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Tracking Pipeline Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>{t('tracker.title', 'Real-Time Artisan Order Tracking')}</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('tracker.subtitle', 'Watch your unique handmade treasure journey from the artisan’s kiln/loom to your doorstep')}
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { key: 'all', label: 'All Orders', count: orders.length },
                { key: 'kiln_loom', label: 'At Kiln/Loom', icon: Flame },
                { key: 'quality_gi_tagging', label: 'GI Tagging', icon: ShieldCheck },
                { key: 'in_transit', label: 'In-Transit', icon: Truck },
                { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
              ].map((filter) => {
                const isActive = orderStageFilter === filter.key;
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setOrderStageFilter(filter.key as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#DFD5C4]">
              <Package className="w-10 h-10 text-[#8C7A6B] mx-auto mb-2" />
              <h3 className="font-serif font-bold text-base text-[#2D241E]">
                {t('dash.no_orders', 'No orders found matching this filter')}
              </h3>
              <p className="text-xs text-[#8C7A6B] mt-1">
                {t('dash.no_orders_sub', 'Explore our marketplace to acquire authentic crafts.')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((ord, ordIdx) => {
                const isExpanded = Boolean(expandedOrderIds[ord.id]);
                const tracking = ord.artisan_tracking;

                return (
                  <div
                    key={ord.id || ord.order_number || `order-${ordIdx}`}
                    className="space-y-3"
                  >
                    {/* Order Summary Header Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DFD5C4] hover:shadow-sm transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F4EFE6] gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="font-bold text-[#2D241E] text-sm">Order #{ord.order_number}</span>
                            <span className="text-[#8C7A6B] ml-2">Placed on {ord.created_at?.split('T')[0] || 'Recently'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            {tracking?.current_stage ? tracking.current_stage.replace('_', ' ').toUpperCase() : ord.status}
                          </span>
                          <span className="font-serif font-bold text-base text-[#2D241E]">
                            ₹{(ord.total_amount ?? ord.total ?? 0).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => toggleOrderExpand(ord.id)}
                            className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Tracker' : 'View Live Tracker'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Items row */}
                      <div className="pt-3 space-y-2">
                        {ord.items.map((it, itIdx) => (
                          <div
                            key={it.id || `${it.product_id || 'prod'}-${itIdx}`}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={it.product_image}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-[#DFD5C4]"
                              />
                              <div>
                                <p className="font-semibold text-[#2D241E] text-sm">{it.product_title}</p>
                                <p className="text-xs text-[#8C7A6B]">
                                  Qty: {it.quantity} • By {it.artisan_name}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-[#2D241E]">
                              ₹{(it.total_price ?? (it.unit_price * it.quantity)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Integrated Interactive Real-Time Artisan Order Tracker */}
                    {isExpanded && (
                      <div className="pl-0 sm:pl-4 border-l-0 sm:border-l-2 sm:border-amber-400/50">
                        <ArtisanOrderTracker
                          order={ord}
                          onUpdate={handleTrackerUpdate}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: B2B Inquiries & Received Quotes */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#DFD5C4]">
              <FileText className="w-10 h-10 text-[#8C7A6B] mx-auto mb-2" />
              <h3 className="font-serif font-bold text-base text-[#2D241E]">No active B2B inquiries</h3>
              <p className="text-xs text-[#8C7A6B] mt-1">You can request custom wholesale quotes on any product page.</p>
            </div>
          ) : (
            inquiries.map((inq, inqIdx) => {
              const inqQuotes = quotes.filter((q) => q.inquiry_id === inq.id);
              return (
                <div
                  key={inq.id || `inquiry-${inqIdx}`}
                  className="p-5 rounded-2xl bg-white border border-[#DFD5C4] hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F4EFE6] gap-2 text-xs">
                    <div>
                      <span className="font-bold text-[#2D241E]">Inquiry #{inq.inquiry_number}</span>
                      <span className="text-[#8C7A6B] ml-2">Sent to {inq.artisan_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] font-bold text-[11px]">
                        {inq.status}
                      </span>
                      <button
                        onClick={() => onOpenInquiryChat(inq)}
                        className="px-3 py-1 rounded-lg bg-[#FAF7F2] border border-[#DFD5C4] text-[#3E2415] hover:bg-[#F4EFE6] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Live Discussion</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#5A3924] bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE9DE]">
                    "{inq.message}"
                  </p>

                  {/* If quotes exist */}
                  {inqQuotes.length > 0 && (
                    <div className="pt-2 border-t border-[#F4EFE6] space-y-2">
                      <span className="text-[11px] font-bold text-[#2D241E] uppercase tracking-wider">
                        Official Artisan Quotations ({inqQuotes.length})
                      </span>
                      {inqQuotes.map((qt) => (
                        <div
                          key={qt.id}
                          className="p-3 rounded-xl bg-[#2E4B3D]/5 border border-[#2E4B3D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-[#2E4B3D]">
                              Quote #{qt.id} • ₹{qt.unit_price} / unit ({qt.quantity} units)
                            </p>
                            <p className="text-[11px] text-[#5A3924]">
                              Estimated Delivery: {qt.estimated_delivery_date}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-serif font-bold text-sm text-[#2E4B3D]">
                              Total: ₹{qt.total_amount.toLocaleString('en-IN')}
                            </span>
                            {qt.status === 'Sent' && (
                              <button
                                onClick={() => dataStore.updateQuoteStatus(qt.id, 'Accepted')}
                                className="px-3 py-1 rounded-lg bg-[#2E4B3D] text-white font-bold text-xs hover:bg-[#233A2F] cursor-pointer"
                              >
                                Accept Quote
                              </button>
                            )}
                            {qt.status === 'Accepted' && (
                              <span className="text-xs font-bold text-[#2E4B3D] flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Accepted
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#DFD5C4]">
              <Heart className="w-10 h-10 text-[#8C7A6B] mx-auto mb-2" />
              <h3 className="font-serif font-bold text-base text-[#2D241E]">No items in your wishlist</h3>
              <p className="text-xs text-[#8C7A6B] mt-1">Tap the heart icon on any product to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="bg-white rounded-2xl border border-[#DFD5C4] overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                >
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#2D241E]">{prod.title}</h4>
                      <p className="text-xs text-[#8C7A6B] mt-1">{prod.artisan_name} • {prod.craft_cluster}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#F4EFE6]">
                      <span className="font-serif font-bold text-sm text-[#C85A32]">
                        ₹{prod.retail_price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-[#C85A32] flex items-center gap-1">
                        View Item <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-[#DFD5C4] p-6 sm:p-8 max-w-2xl">
          <h3 className="font-serif font-bold text-lg text-[#2D241E] mb-4">Buyer Account Details</h3>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#8C7A6B]">Full Name</label>
                <p className="font-semibold text-[#2D241E] mt-1">{currentUser.full_name}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#8C7A6B]">Email Address</label>
                <p className="font-semibold text-[#2D241E] mt-1">{currentUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#8C7A6B]">Phone</label>
                <p className="font-semibold text-[#2D241E] mt-1">{currentUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#8C7A6B]">Account Type</label>
                <p className="font-semibold text-[#2D241E] mt-1 capitalize">{currentUser.role}</p>
              </div>
            </div>

            {currentUser.business_name && (
              <div>
                <label className="text-[10px] uppercase font-bold text-[#8C7A6B]">Registered Business</label>
                <p className="font-semibold text-[#2D241E] mt-1">{currentUser.business_name}</p>
              </div>
            )}

            <div className="pt-4 border-t border-[#EFE9DE]">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Account verified and active in KalaSetu database.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
