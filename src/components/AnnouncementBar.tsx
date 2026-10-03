import React from 'react';
import { Sparkles, Phone, ShieldCheck, Database } from 'lucide-react';

interface AnnouncementBarProps {
  onRequestCallback: () => void;
  onOpenSupabase?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  onRequestCallback,
  onOpenSupabase,
}) => {
  return (
    <div id="announcement-bar" className="bg-[#3E2415] text-[#F7F4EE] text-xs py-2 px-4 border-b border-[#5A3924]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#C85A32] text-white">
            DIRECT CRAFT
          </span>
          <span className="font-medium text-[#EFE9DE]">
            100% Authentic Indian Handlooms & Crafts • Fair wages directly to certified artisan families
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-[#DFD5C4]">
          {onOpenSupabase && (
            <button
              onClick={onOpenSupabase}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#3ECF8E] font-medium transition-colors cursor-pointer"
              title="Click to open Supabase Database Hub"
            >
              <Database className="w-3 h-3 text-[#3ECF8E]" />
              <span className="font-mono">DB: Artisan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E27D26]" />
            <span>Verified Master Crafts</span>
          </div>

          <button
            onClick={onRequestCallback}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[#E27D26] font-medium"
            title="Are you an artisan? Request free listing support via phone call"
          >
            <Phone className="w-3.5 h-3.5 animate-pulse" />
            <span>Artisan Call Support: +91 80000 12345</span>
          </button>
        </div>
      </div>
    </div>
  );
};
