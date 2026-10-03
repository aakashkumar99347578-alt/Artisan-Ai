import React from 'react';
import { ShieldCheck, HeartHandshake, Truck, Leaf, Phone, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onRequestCallback: () => void;
  onOpenAiStudio: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onRequestCallback,
  onOpenAiStudio,
}) => {
  return (
    <footer className="bg-[#2D241E] text-[#F7F4EE] border-t border-[#4A382A]">
      {/* Trust Pillars Banner */}
      <div className="border-b border-[#4A382A]/70 bg-[#251D18] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32]/20 text-[#C85A32] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-white">Direct from Artisans</p>
                <p className="text-xs text-[#DFD5C4]">Zero middleman markups</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[#2E4B3D]/30 text-[#4E8B6D] flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-white">100% Sustainable</p>
                <p className="text-xs text-[#DFD5C4]">Natural dyes & quartz clay</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[#E27D26]/20 text-[#E27D26] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-white">Insured Pan-India Transit</p>
                <p className="text-xs text-[#DFD5C4]">5-ply shock absorbent crating</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-xl bg-[#C85A32]/20 text-[#C85A32] flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-white">B2B Wholesale Hub</p>
                <p className="text-xs text-[#DFD5C4]">Direct custom quotations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#E27D26] flex items-center justify-center text-white font-serif text-2xl font-bold shadow-md">
                क
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-white tracking-tight">
                  KalaSetu
                </span>
                <span className="text-[10px] uppercase tracking-widest font-bold ml-2 px-1.5 py-0.5 rounded bg-[#C85A32] text-white">
                  INDIA
                </span>
              </div>
            </div>

            <p className="text-xs text-[#DFD5C4] leading-relaxed max-w-sm">
              Empowering Indian master craftspersons through direct consumer commerce, transparent B2B wholesale quotations, and voice-assisted AI listing technology in regional mother tongues.
            </p>

            <div className="pt-2">
              <button
                onClick={onRequestCallback}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer border border-white/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#E27D26]" />
                <span>Artisan Helpline: +91 80000 12345</span>
              </button>
            </div>
          </div>

          {/* Col 2: Shop Disciplines */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Traditional Crafts
            </h4>
            <ul className="space-y-2 text-xs text-[#DFD5C4]">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Jaipur Blue Pottery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Kutch Ajrakh Indigo Handlooms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Kashmiri Walnut Wood Carving
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Odisha Pattachitra Art
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Dhokra Brass Metalcraft
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For Artisans & B2B */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              For Artisans & B2B
            </h4>
            <ul className="space-y-2 text-xs text-[#DFD5C4]">
              <li>
                <button onClick={onOpenAiStudio} className="hover:text-white transition-colors cursor-pointer text-[#E27D26] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Voice Product Studio</span>
                </button>
              </li>
              <li>
                <button onClick={onRequestCallback} className="hover:text-white transition-colors cursor-pointer">
                  Publish Product by Phone Call
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer_dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  B2B Corporate & Retail Quotations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('regional')} className="hover:text-white transition-colors cursor-pointer">
                  Regional Craft Provenance Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  Master Artisan Certification Criteria
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#DFD5C4]">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  About KalaSetu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('stories')} className="hover:text-white transition-colors cursor-pointer">
                  Artisan Stories & Lineages
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-white transition-colors cursor-pointer">
                  Help & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin_dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Admin Console
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#4A382A]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C7A6B]">
          <p>© {new Date().getFullYear()} KalaSetu Indian Artisan Marketplace. Rooted in India.</p>
          <p className="flex items-center gap-1">
            <span>Crafted with reverence for India's 400+ indigenous craft guilds.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
