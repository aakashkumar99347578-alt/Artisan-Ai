import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../lib/i18n';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DFD5C4] bg-white/90 hover:bg-white text-xs font-semibold text-[#2D241E] shadow-sm hover:border-[#C85A32] transition-all cursor-pointer"
        id="language-selector-btn"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
        <span>{compact ? currentLang.nativeName : `${currentLang.flag} ${currentLang.nativeName}`}</span>
        <ChevronDown className={`w-3 h-3 text-[#8C7A6B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-[#DFD5C4] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-[#F4EFE6] text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
            Choose Language / भाषा चुनें
          </div>
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                    isSelected ? 'text-[#C85A32] font-bold bg-[#FAF7F2]/60' : 'text-[#2D241E]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <div className="text-left">
                      <p className="leading-tight">{lang.nativeName}</p>
                      <p className="text-[10px] text-[#8C7A6B]">{lang.name}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#C85A32]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
