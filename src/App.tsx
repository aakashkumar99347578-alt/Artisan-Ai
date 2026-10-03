import React, { useState, useEffect } from 'react';
import {
  Product,
  Artisan,
  Category,
  Inquiry,
  Quote,
  Order,
  UserProfile,
  UserRole,
  CallbackRequest,
} from './types';
import { dataStore } from './lib/supabase';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryCarousel } from './components/CategoryCarousel';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { ArtisanProfileModal } from './components/ArtisanProfileModal';
import { BulkInquiryModal } from './components/BulkInquiryModal';
import { InquiryChatModal } from './components/InquiryChatModal';
import { AiProductCreationStudio } from './components/AiProductCreationStudio';
import { CallbackRequestModal } from './components/CallbackRequestModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ArtisanDashboard } from './components/ArtisanDashboard';
import { SupportDashboard } from './components/SupportDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RegionalCraftDiscovery } from './components/RegionalCraftDiscovery';
import { TrendingSection } from './components/TrendingSection';
import { ShopCatalog } from './components/ShopCatalog';
import { Footer } from './components/Footer';
import { AuthScreen } from './components/AuthScreen';
import { Brand3DMotionIntro } from './components/Brand3DMotionIntro';
import { SupabaseModal } from './components/SupabaseModal';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Heart,
  HelpCircle,
  Phone,
  BookOpen,
  MapPin,
} from 'lucide-react';

export default function App() {
  // App Lifecycle Stage: 'main' by default for instant zero-latency start, with 'auth' and 'motion_intro' accessible
  const [appStage, setAppStage] = useState<'auth' | 'motion_intro' | 'main'>('main');

  // Navigation & View State
  const [activeNav, setActiveNav] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Synchronized Data Store State
  const [products, setProducts] = useState<Product[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [callbackRequests, setCallbackRequests] = useState<CallbackRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(dataStore.getCurrentUser());

  // Interactive Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [bulkInquiryProduct, setBulkInquiryProduct] = useState<Product | null>(null);
  const [activeChatInquiry, setActiveChatInquiry] = useState<Inquiry | null>(null);
  const [isAiStudioOpen, setIsAiStudioOpen] = useState<boolean>(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod_1', 'prod_3']);
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);

  // Sync with dataStore on mount & subscriptions
  useEffect(() => {
    const update = () => {
      setProducts(dataStore.getProducts());
      setArtisans(dataStore.getArtisans());
      setCategories(dataStore.getCategories());
      setInquiries(dataStore.getInquiries());
      setQuotes(dataStore.getQuotes());
      setOrders(dataStore.getOrders());
      setCallbackRequests(dataStore.getCallbackRequests());
      setCurrentUser(dataStore.getCurrentUser());
    };

    update();
    const unsubscribe = dataStore.subscribe(update);
    return unsubscribe;
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleRoleChange = (newRole: UserRole) => {
    dataStore.setCurrentUserRole(newRole);
    setCurrentUser(dataStore.getCurrentUser());
  };

  const handleAuthSuccess = (user: UserProfile) => {
    dataStore.setCurrentUser(user);
    setCurrentUser(user);
    setAppStage('main');
    setActiveNav('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueAsGuest = () => {
    setAppStage('main');
    setActiveNav('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIntroComplete = () => {
    setAppStage('main');
    setActiveNav('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenArtisanProfile = (artisanId: string) => {
    const art = artisans.find((a) => a.id === artisanId);
    if (art) {
      setSelectedArtisan(art);
    }
  };

  const currentArtisanForProduct = selectedProduct
    ? artisans.find((a) => a.id === selectedProduct.artisan_id) || null
    : null;

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  // STAGE 1: Authentication Screen (Sign In & Sign Up)
  if (appStage === 'auth') {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  // STAGE 2: 3D Motion Effect Sequence with Website Name ("KalaSetu")
  if (appStage === 'motion_intro') {
    return (
      <Brand3DMotionIntro
        currentUser={currentUser}
        onComplete={handleIntroComplete}
      />
    );
  }

  // STAGE 3: Website Home & Full Marketplace Experience
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D241E] font-sans antialiased selection:bg-[#C85A32] selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar
        onRequestCallback={() => setIsCallbackModalOpen(true)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
      />

      {/* Primary Navigation Header */}
      <Header
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        activeNav={activeNav}
        onNavigate={(view) => {
          setActiveNav(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activeNav !== 'shop') setActiveNav('shop');
        }}
        wishlistCount={wishlistIds.length}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiStudio={() => setIsAiStudioOpen(true)}
        unreadNotifications={2}
        onOpenSignPage={() => setAppStage('auth')}
        onReplay3DIntro={() => setAppStage('motion_intro')}
        onOpenSupabaseHub={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1">
        {/* ======================================================== */}
        {/* VIEW: HOME */}
        {/* ======================================================== */}
        {activeNav === 'home' && (
          <div>
            {/* Hero Section */}
            <Hero
              onShopClick={() => {
                setActiveNav('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onArtisansClick={() => {
                setActiveNav('artisans');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onAiVoiceClick={() => setIsAiStudioOpen(true)}
            />

            {/* Category Carousel */}
            <CategoryCarousel
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(catId) => {
                setSelectedCategoryId(catId);
                setActiveNav('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewAll={() => {
                setSelectedCategoryId(null);
                setActiveNav('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Featured Handcrafted Masterworks */}
            <section className="py-14 bg-white border-b border-[#EFE9DE]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#C85A32] uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-[#E27D26]" />
                      <span>Certified Master Crafts</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D241E] mt-1">
                      Featured Artisanal Creations
                    </h2>
                    <p className="text-sm text-[#5A3924] mt-1">
                      Every piece is signed and dispatched directly from verified master artisan kilns and looms.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveNav('shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A32] hover:text-[#B04924] transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>Explore Full Marketplace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.slice(0, 8).map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isWishlisted={wishlistIds.includes(prod.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onBulkInquiry={(p) => setBulkInquiryProduct(p)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Trending Section (Trending Near You + Festive Demand) */}
            <TrendingSection
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onBulkInquiry={(p) => setBulkInquiryProduct(p)}
            />

            {/* Meet the Master Artisans */}
            <section className="py-14 bg-[#FAF7F2] border-b border-[#EFE9DE]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#C85A32] uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2E4B3D]" />
                      <span>Generational Custodians</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D241E] mt-1">
                      Meet India's Master Artisans
                    </h2>
                    <p className="text-sm text-[#5A3924] mt-1">
                      Discover the craftspeople behind each piece, their familial heritage, and traditional methods.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveNav('artisans');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A32] hover:text-[#B04924] transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>View All Artisans</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {artisans.map((art) => (
                    <div
                      key={art.id}
                      className="rounded-3xl bg-white border border-[#DFD5C4] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-48 bg-[#3E2415] overflow-hidden">
                          <img
                            src={art.banner_image_url}
                            alt={art.craft_name}
                            className="w-full h-full object-cover opacity-60"
                          />
                          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#3E2415] text-[10px] font-bold">
                            {art.years_of_experience} yrs mastery
                          </span>
                        </div>

                        <div className="p-6 -mt-12 relative z-10 space-y-3">
                          <img
                            src={art.profile_image_url}
                            alt={art.name}
                            className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                          />

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C85A32]">
                              {art.craft_name}
                            </span>
                            <h3 className="font-serif font-bold text-lg text-[#2D241E]">
                              {art.name}
                            </h3>
                            <p className="text-xs text-[#5A3924] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                              <span>{art.region}, {art.state}</span>
                            </p>
                          </div>

                          <p className="text-xs text-[#5A3924] line-clamp-3 leading-relaxed">
                            {art.story}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 pt-0 flex items-center justify-between border-t border-[#F4EFE6] mt-2">
                        <span className="text-xs font-bold text-[#2E4B3D] flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[#E27D26] text-[#E27D26]" />
                          <span>{art.rating || 4.9} ({art.total_sales || 200}+ orders)</span>
                        </span>

                        <button
                          onClick={() => setSelectedArtisan(art)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#C85A32] text-[#3E2415] hover:text-white border border-[#DFD5C4] hover:border-[#C85A32] text-xs font-bold transition-all cursor-pointer"
                        >
                          View Profile & Story →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Regional Craft Discovery (Interactive Map & State Provenance) */}
            <RegionalCraftDiscovery
              products={products}
              artisans={artisans}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onViewArtisan={handleOpenArtisanProfile}
            />

            {/* Fair-Trade Mission & Craft Custodianship Statement */}
            <section className="py-16 bg-[#2D241E] text-white">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#E27D26] px-3 py-1 rounded-full bg-[#E27D26]/15 border border-[#E27D26]/30">
                  OUR NATIONAL COMMITMENT
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                  “Don't just buy the product. Discover the artisan, craft, region and story behind it.”
                </h2>
                <p className="text-sm sm:text-base text-[#DFD5C4] max-w-2xl mx-auto leading-relaxed">
                  KalaSetu bridges Indian master craftspeople directly to conscious retail buyers and bulk corporate enterprises—eliminating exploitation, preserving ancient hand techniques, and enabling listing with zero digital literacy through Voice AI.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => {
                      setActiveNav('about');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 rounded-full bg-[#C85A32] hover:bg-[#B04924] text-white font-bold text-xs cursor-pointer shadow-md transition-all"
                  >
                    Read Our Artisan Charter
                  </button>
                  <button
                    onClick={() => setIsCallbackModalOpen(true)}
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer border border-white/20 transition-all flex items-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#E27D26]" />
                    <span>Artisan Call Helpline</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: SHOP CATALOG */}
        {/* ======================================================== */}
        {activeNav === 'shop' && (
          <ShopCatalog
            products={products}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(catId) => setSelectedCategoryId(catId)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onBulkInquiry={(p) => setBulkInquiryProduct(p)}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW: ARTISANS DIRECTORY */}
        {/* ======================================================== */}
        {activeNav === 'artisans' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="pb-4 border-b border-[#EFE9DE]">
              <h1 className="font-serif text-3xl font-bold text-[#2D241E]">
                Certified Indian Master Craftspersons
              </h1>
              <p className="text-xs text-[#5A3924] mt-1">
                Explore generations of ancestral lineage across India's traditional craft clusters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map((art) => (
                <div
                  key={art.id}
                  className="rounded-3xl bg-white border border-[#DFD5C4] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-[#3E2415]">
                    <img
                      src={art.banner_image_url}
                      alt={art.craft_name}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 text-[#3E2415] text-[10px] font-bold">
                      {art.years_of_experience} yrs experience
                    </span>
                  </div>

                  <div className="p-6 -mt-12 relative z-10 space-y-3">
                    <img
                      src={art.profile_image_url}
                      alt={art.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                    />

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C85A32]">
                        {art.craft_name}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#2D241E]">
                        {art.name}
                      </h3>
                      <p className="text-xs text-[#5A3924] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{art.region}, {art.state}</span>
                      </p>
                    </div>

                    <p className="text-xs text-[#5A3924] line-clamp-3 leading-relaxed">
                      {art.story}
                    </p>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between border-t border-[#F4EFE6] mt-2">
                    <span className="text-xs font-bold text-[#2E4B3D]">
                      ★ {art.rating} ({art.total_sales || 300}+ orders)
                    </span>
                    <button
                      onClick={() => setSelectedArtisan(art)}
                      className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#C85A32] text-[#3E2415] hover:text-white border border-[#DFD5C4] hover:border-[#C85A32] text-xs font-bold transition-all cursor-pointer"
                    >
                      View Profile & Story →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: TRENDING */}
        {/* ======================================================== */}
        {activeNav === 'trending' && (
          <TrendingSection
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onBulkInquiry={(p) => setBulkInquiryProduct(p)}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW: REGIONAL PROVENANCE */}
        {/* ======================================================== */}
        {activeNav === 'regional' && (
          <RegionalCraftDiscovery
            products={products}
            artisans={artisans}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onViewArtisan={handleOpenArtisanProfile}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW: STORIES */}
        {/* ======================================================== */}
        {activeNav === 'stories' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C85A32]">
                Oral Traditions & Living Craftsmanship
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D241E]">
                Artisan Chronicles of India
              </h1>
              <p className="text-sm text-[#5A3924] max-w-xl mx-auto">
                Behind every weave, brushstroke, and kiln firing lies centuries of sacred oral traditions.
              </p>
            </div>

            <div className="space-y-6">
              {artisans.map((art) => (
                <div
                  key={art.id}
                  className="p-6 rounded-3xl bg-white border border-[#DFD5C4] shadow-sm flex flex-col md:flex-row gap-6 items-start"
                >
                  <img
                    src={art.banner_image_url}
                    alt={art.craft_name}
                    className="w-full md:w-64 h-48 rounded-2xl object-cover shrink-0"
                  />
                  <div className="space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E27D26]/15 text-[#C85A32] text-xs font-bold uppercase">
                      {art.craft_name} • {art.region}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#2D241E]">
                      The Living Lineage of {art.name}
                    </h3>
                    <p className="text-xs text-[#5A3924] leading-relaxed">
                      {art.story}
                    </p>
                    <button
                      onClick={() => setSelectedArtisan(art)}
                      className="text-xs font-bold text-[#C85A32] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Explore {art.name}'s 5-Stage Craft Process →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: ABOUT */}
        {/* ======================================================== */}
        {activeNav === 'about' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C85A32]">
                Rooted in Heritage
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D241E]">
                About KalaSetu
              </h1>
              <p className="text-sm text-[#5A3924] max-w-xl mx-auto">
                Building an authentic bridge between India's traditional artisan clusters and global conscious patrons.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#DFD5C4] shadow-sm space-y-4 text-xs sm:text-sm text-[#5A3924] leading-relaxed">
              <h3 className="font-serif font-bold text-lg text-[#2D241E]">
                The KalaSetu Promise
              </h3>
              <p>
                India is home to over 400 distinct indigenous craft lineages. Yet, for decades, middlemen and commission-heavy aggregators took up to 80% of the value, leaving master craftspeople economically vulnerable and forcing younger generations to abandon their ancestral art forms.
              </p>
              <p>
                <strong>KalaSetu</strong> changes this equation fundamentally. We provide an end-to-end fair trade marketplace where verified craftspeople sell directly to retail customers and receive structured B2B wholesale quotations from boutique hotels, corporate gifting firms, and luxury retailers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#F4EFE6]">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DFD5C4]">
                  <h4 className="font-serif font-bold text-sm text-[#2D241E]">1. Voice-to-Catalog AI</h4>
                  <p className="text-xs text-[#8C7A6B] mt-1">
                    Artisans describe their work in Hindi or regional languages; our AI creates professional e-commerce listings with zero typing.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DFD5C4]">
                  <h4 className="font-serif font-bold text-sm text-[#2D241E]">2. B2B Wholesale Hub</h4>
                  <p className="text-xs text-[#8C7A6B] mt-1">
                    Direct bulk inquiries with real-time price negotiation and formal structured quotations.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#DFD5C4]">
                  <h4 className="font-serif font-bold text-sm text-[#2D241E]">3. Phone Call Onboarding</h4>
                  <p className="text-xs text-[#8C7A6B] mt-1">
                    Support operators assist non-digital rural artisans over a direct phone call.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: HELP & SUPPORT */}
        {/* ======================================================== */}
        {activeNav === 'help' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2E4B3D]">
                Assistance & Support
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#2D241E]">
                How May We Assist You?
              </h1>
              <p className="text-sm text-[#5A3924]">
                Dedicated support for both artisan workshops and conscious buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-[#DFD5C4] shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#2D241E]">
                  Artisan Listing Call Helpline
                </h3>
                <p className="text-xs text-[#5A3924]">
                  Are you an Indian craftsperson or family guild? Schedule a free listing call and our operators will transcribe, photograph, and publish your catalog over the phone.
                </p>
                <button
                  onClick={() => setIsCallbackModalOpen(true)}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B04924] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Schedule Listing Call →
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#DFD5C4] shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#2E4B3D]/10 text-[#2E4B3D] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#2D241E]">
                  Buyer & Corporate Inquiries
                </h3>
                <p className="text-xs text-[#5A3924]">
                  Need assistance with bulk festive orders, bespoke wedding favors, or fragile transit tracking across India?
                </p>
                <a
                  href="mailto:namaste@kalasetu.in"
                  className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Email Support: namaste@kalasetu.in
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: WISHLIST */}
        {/* ======================================================== */}
        {activeNav === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
            <h1 className="font-serif text-3xl font-bold text-[#2D241E]">
              My Saved Wishlist ({wishlistProducts.length})
            </h1>

            {wishlistProducts.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-[#DFD5C4] space-y-3">
                <Heart className="w-12 h-12 text-[#8C7A6B] mx-auto" />
                <h3 className="font-serif font-bold text-lg text-[#2D241E]">Your wishlist is empty</h3>
                <p className="text-xs text-[#8C7A6B]">Save your favorite artisanal creations while exploring.</p>
                <button
                  onClick={() => setActiveNav('shop')}
                  className="px-5 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-semibold"
                >
                  Explore Crafts
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    isWishlisted={true}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onBulkInquiry={(p) => setBulkInquiryProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: ROLE DASHBOARDS */}
        {/* ======================================================== */}
        {activeNav === 'customer_dashboard' && (
          <CustomerDashboard
            currentUser={currentUser}
            orders={orders}
            inquiries={inquiries}
            quotes={quotes}
            wishlistProducts={wishlistProducts}
            onOpenInquiryChat={(inq) => setActiveChatInquiry(inq)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {activeNav === 'artisan_dashboard' && (
          <ArtisanDashboard
            artisan={artisans[0] || {}}
            products={products}
            inquiries={inquiries}
            quotes={quotes}
            orders={orders}
            onOpenAiStudio={() => setIsAiStudioOpen(true)}
            onRequestCallback={() => setIsCallbackModalOpen(true)}
            onOpenInquiryChat={(inq) => setActiveChatInquiry(inq)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {activeNav === 'support_dashboard' && (
          <SupportDashboard callbackRequests={callbackRequests} />
        )}

        {activeNav === 'admin_dashboard' && (
          <AdminDashboard
            artisans={artisans}
            products={products}
            inquiries={inquiries}
            orders={orders}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}
      </main>

      {/* Global Modals & Drawers */}

      {/* Product Details Modal (With 360° Studio Viewer) */}
      <ProductDetailsModal
        product={selectedProduct}
        artisan={currentArtisanForProduct}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBulkInquiry={(p) => {
          setSelectedProduct(null);
          setBulkInquiryProduct(p);
        }}
        onMessageArtisan={(p) => {
          // Find or create inquiry
          const existing = inquiries.find((i) => i.artisan_id === p.artisan_id);
          if (existing) {
            setSelectedProduct(null);
            setActiveChatInquiry(existing);
          } else {
            setSelectedProduct(null);
            setBulkInquiryProduct(p);
          }
        }}
        onViewArtisanProfile={(artId) => {
          setSelectedProduct(null);
          handleOpenArtisanProfile(artId);
        }}
        onDirectBuy={(p) => {
          handleAddToCart(p);
          setSelectedProduct(null);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Artisan Profile Modal */}
      <ArtisanProfileModal
        artisan={selectedArtisan}
        artisanProducts={
          selectedArtisan ? products.filter((p) => p.artisan_id === selectedArtisan.id) : []
        }
        onClose={() => setSelectedArtisan(null)}
        onSelectProduct={(p) => {
          setSelectedArtisan(null);
          setSelectedProduct(p);
        }}
        onSendDirectInquiry={(art) => {
          const firstProduct = products.find((p) => p.artisan_id === art.id);
          setSelectedArtisan(null);
          setBulkInquiryProduct(firstProduct || products[0]);
        }}
      />

      {/* B2B Bulk Purchase Inquiry Modal */}
      {bulkInquiryProduct && (
        <BulkInquiryModal
          initialProduct={bulkInquiryProduct}
          allProducts={products}
          onClose={() => setBulkInquiryProduct(null)}
          onSuccess={(inq) => {
            setBulkInquiryProduct(null);
            setActiveChatInquiry(inq);
          }}
        />
      )}

      {/* Realtime Customer <-> Artisan Chat & Quotation Modal */}
      {activeChatInquiry && (
        <InquiryChatModal
          inquiry={activeChatInquiry}
          currentUser={currentUser}
          onClose={() => setActiveChatInquiry(null)}
          onOrderQuote={(quote) => {
            setActiveChatInquiry(null);
            const inq = inquiries.find((i) => i.id === quote.inquiry_id);
            const p = products.find((pr) => pr.id === inq?.items[0]?.product_id) || products[0];
            setCartItems([{ product: { ...p, price: quote.unit_price }, quantity: quote.quantity }]);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Artisan AI Voice & Photo Studio Modal */}
      {isAiStudioOpen && (
        <AiProductCreationStudio
          onClose={() => setIsAiStudioOpen(false)}
          onProductCreated={(prod) => {
            setIsAiStudioOpen(false);
            setSelectedProduct(prod);
          }}
          onRequestCallback={() => {
            setIsAiStudioOpen(false);
            setIsCallbackModalOpen(true);
          }}
        />
      )}

      {/* Callback Request Modal ("Publish Product by Call") */}
      {isCallbackModalOpen && (
        <CallbackRequestModal
          onClose={() => setIsCallbackModalOpen(false)}
          onSuccess={() => {
            setIsCallbackModalOpen(false);
            alert('Your listing call has been booked! A KalaSetu onboarding operator will call you at your preferred slot.');
          }}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          cartItems={cartItems}
          currentUser={currentUser}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCompleted={() => {
            setCartItems([]);
          }}
        />
      )}

      {/* Supabase Database Hub Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Rich Craft Footer */}
      <Footer
        onNavigate={(view) => {
          setActiveNav(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRequestCallback={() => setIsCallbackModalOpen(true)}
        onOpenAiStudio={() => setIsAiStudioOpen(true)}
      />
    </div>
  );
}
