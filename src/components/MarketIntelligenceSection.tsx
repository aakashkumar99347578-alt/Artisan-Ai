import React, { useState } from 'react';
import {
  TrendingUp,
  Globe,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Tag,
  RefreshCw,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { MarketResearchData, MarketResearchRecommendation } from '../types';
import { runMarketResearch } from '../lib/aiServices';

interface MarketIntelligenceSectionProps {
  product: {
    name?: string;
    product_name?: string;
    category?: string;
    material?: string | string[];
    craft?: string;
    style?: string;
    estimated_price?: number;
  };
  imageUrl?: string;
  voiceTranscript?: string;
  marketResearch: MarketResearchData | null;
  onMarketResearchCompleted: (data: MarketResearchData) => void;
  onApplyRecommendation: (rec: MarketResearchRecommendation) => void;
  hasSerpApiKey?: boolean | null;
}

export const MarketIntelligenceSection: React.FC<MarketIntelligenceSectionProps> = ({
  product,
  imageUrl,
  voiceTranscript,
  marketResearch,
  onMarketResearchCompleted,
  onApplyRecommendation,
  hasSerpApiKey = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const handleStartResearch = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setProgressStep(1); // 1: Product identified

    const timer1 = setTimeout(() => setProgressStep(2), 500);  // 2: Image analyzed
    const timer2 = setTimeout(() => setProgressStep(3), 1300); // 3: Searching Google Lens & Shopping
    const timer3 = setTimeout(() => setProgressStep(4), 2400); // 4: Comparing prices & demand
    const timer4 = setTimeout(() => setProgressStep(5), 3600); // 5: Creating optimized listing

    try {
      const res = await runMarketResearch({
        product: {
          name: product.name || product.product_name || 'Indian Handicraft',
          craft: product.craft || 'Traditional Handcraft',
          category: product.category || 'Handicrafts',
          material: product.material,
          estimated_price: product.estimated_price || 999,
        },
        imageUrl: imageUrl && imageUrl.startsWith('http') ? imageUrl : undefined,
        imageBase64: imageUrl && imageUrl.startsWith('data:') ? imageUrl : undefined,
        voiceTranscript: voiceTranscript || undefined,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      if (res.success && res.marketResearch) {
        onMarketResearchCompleted(res.marketResearch);
        setProgressStep(6); // Done!
      } else {
        setErrorMessage(res.error || 'Market research service currently busy. Please try again.');
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setErrorMessage(err?.message || 'Failed to connect to market research.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!marketResearch?.recommendation) return;
    onApplyRecommendation(marketResearch.recommendation);
    setAppliedNotice('✅ AI Market Recommendation successfully applied to Catalog, SEO & Pricing!');
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mt-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-amber-100 font-serif">Market Intelligence</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                SerpApi Lens + Shopping
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Real-time Google Shopping competitor pricing & Indian craft demand signals
            </p>
          </div>
        </div>

        <button
          onClick={handleStartResearch}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning Marketplaces...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>{marketResearch ? 'Re-scan Live Markets' : 'Scan Live Market Competitors'}</span>
            </>
          )}
        </button>
      </div>

      {/* Loading Progress State (Requirement #31) */}
      {isLoading && (
        <div className="p-6 bg-stone-50/80 border-b border-stone-200">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center space-x-2 text-stone-700 font-semibold text-xs mb-2">
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Analyzing live market data for your craft...</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className={`flex items-center space-x-2 ${progressStep >= 1 ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                {progressStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />}
                <span>✓ Product identified: {product.name || product.product_name}</span>
              </div>

              <div className={`flex items-center space-x-2 ${progressStep >= 2 ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                {progressStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <div className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />}
                <span>✓ Product image analyzed via Multimodal Vision</span>
              </div>

              <div className={`flex items-center space-x-2 ${progressStep >= 3 ? 'text-amber-800 font-medium' : 'text-stone-400'}`}>
                {progressStep >= 3 ? <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />}
                <span>⏳ Searching online marketplaces (Google Lens + Google Shopping India)...</span>
              </div>

              <div className={`flex items-center space-x-2 ${progressStep >= 4 ? 'text-amber-800 font-medium' : 'text-stone-400'}`}>
                {progressStep >= 4 ? <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" /> : <div className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />}
                <span>⏳ Comparing competitor prices & review density...</span>
              </div>

              <div className={`flex items-center space-x-2 ${progressStep >= 5 ? 'text-amber-800 font-medium' : 'text-stone-400'}`}>
                {progressStep >= 5 ? <Sparkles className="w-4 h-4 text-amber-600 animate-pulse shrink-0" /> : <div className="w-4 h-4 rounded-full border border-stone-300 shrink-0" />}
                <span>⏳ Creating optimized Artisan listing & fair price recommendation...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Applied Notice */}
      {appliedNotice && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Initial Empty State prompt if not scanned yet */}
      {!isLoading && !marketResearch && (
        <div className="p-8 text-center bg-stone-50/50">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-stone-800 font-serif">Discover Real Competitor Prices & Buyer Demand</h4>
          <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 mb-4">
            Scan Google Lens and Google Shopping to identify verified listings on Amazon, Flipkart, Etsy, and craft stores for "{product.name || 'this product'}".
          </p>
          <button
            onClick={handleStartResearch}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Live Market Intelligence</span>
          </button>
        </div>
      )}

      {/* Main Results Display (Requirements #30, #14, #15, #16, #20, #22) */}
      {!isLoading && marketResearch && (
        <div className="p-5 space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Demand Score */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200/70">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Estimated Demand</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-serif text-stone-900">{marketResearch.demand.score}</span>
                <span className="text-xs text-stone-500 font-medium">/ 100</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 ml-auto">
                  {marketResearch.demand.level}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                Trend: <strong className="text-stone-800">{marketResearch.demand.trend}</strong> • Confidence: {marketResearch.demand.confidence}%
              </p>
            </div>

            {/* Competition Level */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-stone-50 to-amber-50/40 border border-stone-200">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Competition Level</span>
                <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-serif text-stone-900">{marketResearch.competition.level}</span>
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                {marketResearch.sources.length} active marketplace channels discovered
              </p>
            </div>

            {/* Observed Market Price */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-stone-50 border border-emerald-200/70">
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Observed Market Range</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                {marketResearch.priceAnalysis.min ? (
                  <>
                    <span className="text-xl font-bold font-serif text-stone-900">
                      ₹{marketResearch.priceAnalysis.min.toLocaleString('en-IN')} – ₹{marketResearch.priceAnalysis.max?.toLocaleString('en-IN')}
                    </span>
                  </>
                ) : (
                  <span className="text-base font-semibold text-stone-700">Market Benchmark</span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                Median: <strong className="text-stone-800">₹{marketResearch.priceAnalysis.median?.toLocaleString('en-IN') || 'N/A'}</strong> • Suggested: ₹{marketResearch.priceAnalysis.recommendedPrice?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Top Similar Competitor Products Grid (Requirement #14, #22) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                <span>Top Similar Market Listings ({marketResearch.topProducts.length})</span>
              </h4>
              <span className="text-[11px] text-stone-500">Live listings verified via Google Shopping</span>
            </div>

            {marketResearch.topProducts.length === 0 ? (
              <div className="p-4 bg-stone-50 rounded-lg text-center text-xs text-stone-500">
                No direct commercial competitors found. This indicates a high-uniqueness niche for your artisan craft!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {marketResearch.topProducts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-stone-200 hover:border-amber-300 bg-white hover:shadow-sm transition-all flex flex-col justify-between text-xs"
                  >
                    <div className="flex space-x-3">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-md border border-stone-200 bg-stone-50 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 mb-1">
                          {item.source}
                        </span>
                        <h5 className="font-semibold text-stone-900 line-clamp-2 leading-snug">
                          {item.title}
                        </h5>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.price ? (
                          <span className="text-sm font-bold text-stone-900 font-serif">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 italic">Price undisclosed</span>
                        )}
                        {item.rating && (
                          <span className="flex items-center space-x-0.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-medium">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{item.rating}</span>
                            {item.reviews && <span className="text-stone-400">({item.reviews})</span>}
                          </span>
                        )}
                      </div>

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] text-amber-700 hover:text-amber-900 font-medium transition-colors"
                        >
                          <span>View Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Artisan AI Recommendation Card (Requirements #20, #21) */}
          {marketResearch.recommendation && (
            <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-300/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <h4 className="text-sm font-bold text-stone-900 font-serif">Artisan AI Listing & Pricing Recommendation</h4>
                </div>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Apply Insights to Listing</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-stone-500 font-semibold block mb-0.5">Optimized Title:</span>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200/80 font-medium text-stone-900">
                    {marketResearch.recommendation.title}
                  </div>
                </div>

                <div>
                  <span className="text-stone-500 font-semibold block mb-0.5">Buyer Description:</span>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200/80 text-stone-700 leading-relaxed">
                    {marketResearch.recommendation.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-500 font-semibold block mb-1">Target SEO Keywords:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {marketResearch.recommendation.seoKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white text-stone-700 border border-amber-200 text-[11px]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-stone-500 font-semibold block mb-1">Marketplace Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {marketResearch.recommendation.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white text-stone-700 border border-amber-200 text-[11px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-stone-600 font-semibold">AI Recommended Price:</span>
                    <span className="text-base font-bold text-amber-900 font-serif">
                      ₹{marketResearch.recommendation.recommendedPrice?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-stone-500 italic">
                      (Observed median: ₹{marketResearch.priceAnalysis.median?.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-600">
                    Demand Score: <strong className="text-amber-800">{marketResearch.demand.score}/100</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
