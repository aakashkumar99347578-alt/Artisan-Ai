import React, { useState } from 'react';
import {
  Flame,
  Truck,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Package,
  Award,
  Sparkles,
  QrCode,
  Download,
  Play,
  RotateCcw,
  Eye,
  Info
} from 'lucide-react';
import { Order, ArtisanCraftStage } from '../types';
import { dataStore } from '../lib/supabase';
import { useLanguage } from '../lib/i18n';

interface ArtisanOrderTrackerProps {
  order: Order;
  onUpdate?: () => void;
  compact?: boolean;
}

export const ArtisanOrderTracker: React.FC<ArtisanOrderTrackerProps> = ({
  order,
  onUpdate,
  compact = false,
}) => {
  const { t, language, isHindiOrRegional } = useLanguage();
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);

  const tracking = order.artisan_tracking;

  if (!tracking) {
    return (
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        <p className="font-medium">Order tracking details being synchronized with artisan workshop...</p>
      </div>
    );
  }

  const stages: {
    key: ArtisanCraftStage;
    labelEn: string;
    labelHi: string;
    icon: any;
    color: string;
  }[] = [
    {
      key: 'kiln_loom',
      labelEn: tracking.craft_type === 'loom' ? 'Handloom Weaving' : 'At Kiln / Workshop',
      labelHi: tracking.craft_type === 'loom' ? 'करघा बुनाई' : 'भट्टी / कार्यशाला',
      icon: Flame,
      color: 'amber',
    },
    {
      key: 'quality_gi_tagging',
      labelEn: 'GI Certification & Packaging',
      labelHi: 'जीआई टैगिंग एवं गुणवत्ता',
      icon: ShieldCheck,
      color: 'indigo',
    },
    {
      key: 'in_transit',
      labelEn: 'In-Transit Courier',
      labelHi: 'परिवहन में',
      icon: Truck,
      color: 'blue',
    },
    {
      key: 'delivered',
      labelEn: 'Delivered & Certified',
      labelHi: 'प्राप्त व सत्यापित',
      icon: CheckCircle2,
      color: 'emerald',
    },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === tracking.current_stage);

  const handleSimulateAdvance = () => {
    const stageKeys: ArtisanCraftStage[] = ['kiln_loom', 'quality_gi_tagging', 'in_transit', 'delivered'];
    const nextIdx = (currentStageIndex + 1) % stageKeys.length;
    const nextStage = stageKeys[nextIdx];
    dataStore.updateOrderTrackingStage(order.id, nextStage);
    if (onUpdate) onUpdate();
  };

  const getStageBadgeColor = (key: ArtisanCraftStage) => {
    switch (key) {
      case 'kiln_loom':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'quality_gi_tagging':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'in_transit':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3 mr-1 text-amber-300" />
                {t('tracker.title', 'Real-Time Artisan Craft Tracker')}
              </span>
              {tracking.gi_tag_certified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  GI Certified
                </span>
              )}
            </div>
            <h4 className="text-lg sm:text-xl font-serif font-bold text-stone-100 mt-1.5">
              {order.items[0]?.product_title || 'Handcrafted Craft Order'}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-300 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {tracking.cluster_location}
              </span>
              <span>•</span>
              <span>{t('catalog.by_artisan', 'Master Artisan')}: <strong className="text-white">{tracking.artisan_name}</strong></span>
              <span>•</span>
              <span>{t('tracker.est_delivery', 'Est. Delivery')}: <strong className="text-amber-200">{tracking.estimated_delivery_date}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Live simulation advance button */}
            <button
              onClick={handleSimulateAdvance}
              title="Simulate advancing craft order to next stage"
              className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 hover:text-white rounded-lg text-xs font-medium border border-stone-600 flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{t('tracker.simulate_advance', 'Advance Milestone')}</span>
            </button>

            {/* Certificate of Authenticity Button */}
            <button
              onClick={() => setShowCertificate(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t('tracker.certificate_btn', 'GI Certificate')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Stepper / Progress Bar */}
      <div className="p-4 sm:p-6 bg-stone-50/60 border-b border-stone-200">
        <div className="relative">
          {/* Connecting Track Line */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-stone-200 -translate-y-1/2 z-0 hidden sm:block" />
          <div
            className="absolute top-5 left-6 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 -translate-y-1/2 z-0 hidden sm:block transition-all duration-500"
            style={{
              width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
              maxWidth: 'calc(100% - 3rem)',
            }}
          />

          {/* Stepper Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            {stages.map((st, idx) => {
              const Icon = st.icon;
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={st.key}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                    isCurrent ? 'bg-white shadow-sm ring-2 ring-amber-500/20' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-md animate-pulse'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>

                  <span className="text-xs font-semibold text-stone-800 mt-2 line-clamp-1">
                    {isHindiOrRegional ? st.labelHi : st.labelEn}
                  </span>

                  <span className="text-[10px] text-stone-500 mt-0.5">
                    {isPast
                      ? 'Completed'
                      : isCurrent
                      ? 'In Progress (Active)'
                      : 'Upcoming'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Stage Highlight Card */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Active Stage Callout */}
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-stone-50 border border-amber-200/80 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                {stages[currentStageIndex]?.icon ? (
                  React.createElement(stages[currentStageIndex].icon, { className: 'w-5 h-5' })
                ) : (
                  <Flame className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800">
                  {t('tracker.live_status', 'Current Live Stage')}
                </span>
                <h5 className="font-serif font-bold text-stone-900 text-base">
                  {isHindiOrRegional
                    ? stages[currentStageIndex]?.labelHi
                    : stages[currentStageIndex]?.labelEn}
                </h5>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getStageBadgeColor(tracking.current_stage)}`}>
                {tracking.current_stage.replace('_', ' ').toUpperCase()}
              </span>
              {tracking.tracking_id && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                  {tracking.tracking_id}
                </span>
              )}
            </div>
          </div>

          {/* Metric / Temperature / Loom note if available */}
          {tracking.temperature_or_loom_metric && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{tracking.temperature_or_loom_metric}</span>
            </div>
          )}

          {/* Current Milestone Detail text */}
          {tracking.milestones && tracking.milestones[currentStageIndex] && (
            <div className="mt-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <p>
                {isHindiOrRegional && tracking.milestones[currentStageIndex].description_hindi
                  ? tracking.milestones[currentStageIndex].description_hindi
                  : tracking.milestones[currentStageIndex].description}
              </p>
              {tracking.milestones[currentStageIndex].craft_notes && (
                <div className="mt-2 text-xs bg-white/80 border border-stone-200 rounded-lg p-2.5 text-stone-600 italic">
                  <strong>Master Artisan Note:</strong> "{tracking.milestones[currentStageIndex].craft_notes}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detailed Timeline Stages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h6 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('tracker.all_stages', 'All 4 Production Milestones')}
            </h6>
            <span className="text-xs text-stone-400">Order #{order.order_number}</span>
          </div>

          <div className="space-y-3">
            {tracking.milestones.map((m, idx) => {
              const isSelected = selectedMilestoneIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedMilestoneIndex(isSelected ? null : idx)}
                  className={`border rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
                    m.current
                      ? 'border-amber-300 bg-amber-50/40'
                      : m.completed
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-stone-200 bg-stone-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          m.completed
                            ? 'bg-emerald-600 text-white'
                            : m.current
                            ? 'bg-amber-600 text-white animate-pulse'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {m.completed ? '✓' : idx + 1}
                      </div>
                      <div>
                        <h6 className="text-xs sm:text-sm font-bold text-stone-900">
                          {isHindiOrRegional && m.title_hindi ? m.title_hindi : m.title}
                        </h6>
                        <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{m.location}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{m.timestamp}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {m.completed && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                          Done
                        </span>
                      )}
                      {m.current && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded animate-pulse">
                          Current
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 text-stone-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Milestone Details */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-stone-200 text-xs text-stone-600 space-y-2">
                      <p>
                        {isHindiOrRegional && m.description_hindi
                          ? m.description_hindi
                          : m.description}
                      </p>
                      {m.gi_tag_number && (
                        <p className="font-mono text-[11px] text-purple-700 bg-purple-50 p-2 rounded border border-purple-100">
                          GI Registry Tag: <strong>{m.gi_tag_number}</strong>
                        </p>
                      )}
                      {m.courier_name && (
                        <p className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                          Logistics Partner: <strong>{m.courier_name}</strong> {m.tracking_number && `(AWB: ${m.tracking_number})`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Certificate of Authenticity Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-50 max-w-xl w-full rounded-2xl border-4 border-amber-700/60 p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-lg font-bold w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center"
            >
              ✕
            </button>

            {/* Certificate Border & Watermark */}
            <div className="border-2 border-dashed border-amber-900/30 p-6 sm:p-8 rounded-xl bg-white text-center relative overflow-hidden">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 text-amber-800 mb-3 border border-amber-300">
                <Award className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 block">
                GOVERNMENT OF INDIA & KALASETU AUTHENTICITY PLEDGE
              </span>

              <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                Certificate of Authenticity
              </h3>
              <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                प्रमाणिकता एवं जीआई विरासत प्रमाणपत्र
              </p>

              <div className="my-6 border-t border-b border-stone-200 py-4 text-xs sm:text-sm text-stone-700 space-y-2">
                <p>
                  This document officially certifies that the product{' '}
                  <strong className="text-stone-900">{order.items[0]?.product_title}</strong> is a 100% genuine,
                  artisan-crafted masterwork hand-made by:
                </p>
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 my-2">
                  <p className="font-serif font-bold text-base text-amber-950">{tracking.artisan_name}</p>
                  <p className="text-xs text-stone-600">{tracking.cluster_location}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left pt-2">
                  <div className="bg-stone-50 p-2 rounded border border-stone-200">
                    <span className="text-[10px] text-stone-400 block uppercase">GI Tag Registration</span>
                    <strong className="font-mono text-xs text-purple-900">{tracking.gi_tag_number}</strong>
                  </div>
                  <div className="bg-stone-50 p-2 rounded border border-stone-200">
                    <span className="text-[10px] text-stone-400 block uppercase">Order Reference</span>
                    <strong className="font-mono text-xs text-stone-800">{order.order_number}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-left text-xs text-stone-500 pt-2 border-t border-stone-100">
                <div>
                  <p className="font-semibold text-stone-800">Master Crafts Council Seal</p>
                  <p className="text-[10px]">Tamper-Evident Hologram Verified</p>
                </div>
                <div className="text-right">
                  <p className="font-serif italic text-stone-800 font-bold">{tracking.artisan_name}</p>
                  <p className="text-[10px]">Master Artisan Signature</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download / Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
