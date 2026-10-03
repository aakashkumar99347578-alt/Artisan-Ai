import React, { useState } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Bell,
  Mic,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Compass,
  Store,
  Layers,
  HelpCircle,
  TrendingUp,
  Database,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { useLanguage } from '../lib/i18n';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  activeNav: string;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistCount: number;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAiStudio: () => void;
  unreadNotifications: number;
  onOpenSignPage?: () => void;
  onReplay3DIntro?: () => void;
  onOpenSupabaseHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  activeNav,
  onNavigate,
  searchQuery,
  onSearchChange,
  wishlistCount,
  cartCount,
  onOpenCart,
  onOpenAiStudio,
  unreadNotifications,
  onOpenSignPage,
  onReplay3DIntro,
  onOpenSupabaseHub,
}) => {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t('nav.home', 'HOME') },
    { id: 'shop', label: t('nav.shop', 'SHOP') },
    { id: 'artisans', label: t('nav.artisans', 'ARTISANS') },
    { id: 'trending', label: t('nav.trending', 'TRENDING') },
    { id: 'customer_dashboard', label: t('nav.track_orders', 'TRACK ORDER') },
    { id: 'about', label: t('nav.about', 'ABOUT') },
    { id: 'help', label: t('nav.help', 'HELP & SUPPORT') },
  ];

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'customer', title: 'Customer / B2B Buyer', desc: 'Browse, buy retail or request bulk quotes' },
    { role: 'artisan', title: 'Artisan (Rameshwarji)', desc: 'AI Voice listing, quotes, products' },
    { role: 'support_operator', title: 'Support Operator', desc: 'Call requests & artisan onboarding' },
    { role: 'admin', title: 'Platform Admin', desc: 'Full marketplace & catalog management' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE9DE] shadow-xs">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-[#3E2415] hover:bg-[#F4EFE6] rounded-lg cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#3E2415] flex items-center justify-center text-white shadow-md shadow-[#C85A32]/20 group-hover:scale-105 transition-transform">
            <span className="font-serif text-2xl font-bold tracking-wider">क</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2D241E]">
                KalaSetu
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-[#E27D26]/15 text-[#C85A32] border border-[#E27D26]/30">
                INDIA
              </span>
            </div>
            <p className="text-[11px] text-[#5A3924] font-medium tracking-wide">
              Crafted by Hands • Rooted in Heritage
            </p>
          </div>
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-2 relative">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A6B]" />
            <input
              type="text"
              placeholder="Search crafts, artisans, states (e.g. Blue Pottery, Jaipur, Indigo, Brass)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-24 py-2 text-sm bg-white rounded-full border border-[#DFD5C4] focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 focus:outline-none placeholder-[#8C7A6B] text-[#2D241E] shadow-xs"
            />
            <button
              onClick={() => {
                onNavigate('shop');
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold rounded-full bg-[#FAF7F2] text-[#3E2415] hover:bg-[#F4EFE6] border border-[#DFD5C4] cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Voice Creation button */}
          <button
            onClick={onOpenAiStudio}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#C85A32] to-[#E27D26] text-white text-xs font-semibold hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer shadow-xs"
            title="Create product listing with 1 voice note + 1 photo"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">AI Voice + Photo</span>
            <span className="sm:hidden">AI List</span>
          </button>

          {/* Supabase Database Hub Status Pill */}
          {onOpenSupabaseHub && (
            <button
              onClick={onOpenSupabaseHub}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#1B7F53] hover:bg-[#3ECF8E]/20 text-xs font-semibold transition-colors cursor-pointer"
              title="Supabase Database Connected (Project: Artisan)"
            >
              <Database className="w-3.5 h-3.5 text-[#2BB377]" />
              <span className="text-[11px] font-mono">DB: Artisan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
            </button>
          )}

          {/* Wishlist */}
          <button
            onClick={() => onNavigate('wishlist')}
            className="relative p-2 text-[#3E2415] hover:bg-[#F4EFE6] rounded-full transition-colors cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C85A32] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-[#3E2415] hover:bg-[#F4EFE6] rounded-full transition-colors cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2E4B3D] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Real Multi-Language Selector */}
          <LanguageSelector compact={true} className="hidden sm:inline-block" />

          {/* Role Switcher / Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white border border-[#DFD5C4] hover:border-[#C85A32] text-left transition-all cursor-pointer shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#DFD5C4] flex items-center justify-center text-[#C85A32]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-[#2D241E] leading-tight">
                  {currentUser.role === 'customer'
                    ? 'Customer (Retail/B2B)'
                    : currentUser.role === 'artisan'
                    ? 'Artisan Portal'
                    : currentUser.role === 'support_operator'
                    ? 'Support Operator'
                    : 'Admin'}
                </p>
                <p className="text-[10px] text-[#8C7A6B] capitalize">{currentUser.full_name.split(' ')[0]}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7A6B]" />
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#DFD5C4] shadow-xl z-50 p-2 text-sm divide-y divide-[#F4EFE6]">
                  <div className="px-3 py-2">
                    <p className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                      Switch Role Mode
                    </p>
                    <p className="text-xs text-[#5A3924] mt-0.5">
                      Experience KalaSetu as different user personas:
                    </p>
                  </div>

                  <div className="py-1 space-y-1">
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          onRoleChange(r.role);
                          setIsRoleDropdownOpen(false);
                          if (r.role === 'artisan') onNavigate('artisan_dashboard');
                          else if (r.role === 'support_operator') onNavigate('support_dashboard');
                          else if (r.role === 'admin') onNavigate('admin_dashboard');
                          else onNavigate('customer_dashboard');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all flex flex-col cursor-pointer ${
                          currentUser.role === r.role
                            ? 'bg-[#C85A32]/10 border border-[#C85A32]/30 text-[#C85A32]'
                            : 'hover:bg-[#FAF7F2] text-[#2D241E]'
                        }`}
                      >
                        <span className="font-semibold text-xs flex items-center justify-between">
                          {r.title}
                          {currentUser.role === r.role && (
                            <span className="text-[10px] font-bold text-[#C85A32]">ACTIVE</span>
                          )}
                        </span>
                        <span className="text-[11px] text-[#8C7A6B]">{r.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 px-1 space-y-1">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        if (currentUser.role === 'artisan') onNavigate('artisan_dashboard');
                        else if (currentUser.role === 'support_operator') onNavigate('support_dashboard');
                        else if (currentUser.role === 'admin') onNavigate('admin_dashboard');
                        else onNavigate('customer_dashboard');
                      }}
                      className="w-full py-2 px-3 text-center text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3E2415] rounded-xl cursor-pointer"
                    >
                      Open Current Dashboard →
                    </button>

                    {onOpenSupabaseHub && (
                      <button
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          onOpenSupabaseHub();
                        }}
                        className="w-full py-1.5 px-3 text-center text-xs font-medium text-[#1B7F53] bg-[#3ECF8E]/10 hover:bg-[#3ECF8E]/20 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Database className="w-3.5 h-3.5 text-[#2BB377]" />
                        <span>Supabase DB Hub (Artisan)</span>
                      </button>
                    )}

                    {onReplay3DIntro && (
                      <button
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          onReplay3DIntro();
                        }}
                        className="w-full py-1.5 px-3 text-center text-xs font-medium text-[#C85A32] hover:bg-[#C85A32]/10 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Replay 3D KalaSetu Motion</span>
                      </button>
                    )}

                    {onOpenSignPage && (
                      <button
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          onOpenSignPage();
                        }}
                        className="w-full py-1.5 px-3 text-center text-xs font-medium text-[#8C7A6B] hover:text-[#C85A32] hover:bg-[#FAF7F2] rounded-xl cursor-pointer transition-colors"
                      >
                        Sign Out / Change Account
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links Bar (Desktop) */}
      <nav className="hidden lg:block border-t border-[#EFE9DE]/80 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-1 py-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3.5 py-2 text-xs font-semibold tracking-wider rounded-lg transition-colors cursor-pointer ${
                  activeNav === link.id
                    ? 'text-[#C85A32] bg-[#C85A32]/10 font-bold'
                    : 'text-[#5A3924] hover:text-[#C85A32] hover:bg-[#F4EFE6]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#5A3924]">
            <button
              onClick={() => onNavigate('regional')}
              className="flex items-center gap-1.5 font-medium hover:text-[#C85A32] cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#E27D26]" />
              <span>Explore India's Crafts</span>
            </button>
            <span className="text-[#DFD5C4]">|</span>
            <button
              onClick={() => onNavigate('trending')}
              className="flex items-center gap-1.5 font-medium hover:text-[#C85A32] cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#2E4B3D]" />
              <span>Diwali Festive Trending</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#EFE9DE] p-4 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search crafts, artisans, states..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] rounded-xl border border-[#DFD5C4] focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
                  activeNav === link.id ? 'bg-[#C85A32]/10 text-[#C85A32]' : 'text-[#3E2415]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#F4EFE6] flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAiStudio();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-[#C85A32] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Create Product with Voice + Photo</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
