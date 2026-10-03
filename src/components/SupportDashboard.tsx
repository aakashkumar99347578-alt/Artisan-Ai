import React, { useState } from 'react';
import { CallbackRequest, SupportTicket, ProductDraft } from '../types';
import { dataStore } from '../lib/supabase';
import {
  Phone,
  PhoneCall,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  FileText,
  Mic,
  ArrowRight,
  AlertCircle,
  Headphones,
} from 'lucide-react';

interface SupportDashboardProps {
  callbackRequests: CallbackRequest[];
  onDraftCreated?: (draft: ProductDraft) => void;
}

export const SupportDashboard: React.FC<SupportDashboardProps> = ({
  callbackRequests,
  onDraftCreated,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<CallbackRequest | null>(
    callbackRequests[0] || null
  );
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [callNotes, setCallNotes] = useState(
    'Artisan Rameshwarji explained he has 3 new 14-inch royal blue decorative plates with gold foil embellishments. He requested ₹3,200 retail and ₹2,100 wholesale.'
  );

  // Draft form fields filled during phone call
  const [draftTitle, setDraftTitle] = useState('14-inch Royal Blue Pottery Decorative Platter');
  const [draftMaterial, setDraftMaterial] = useState('Pure Quartz Powder, Glass, Natural Gum, Gold Foil');
  const [draftPrice, setDraftPrice] = useState(3200);
  const [draftB2bPrice, setDraftB2bPrice] = useState(2100);
  const [draftDuration, setDraftDuration] = useState('21 days');
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleStartCall = () => {
    if (!selectedRequest) return;
    dataStore.updateCallbackStatus(selectedRequest.id, 'Calling');
    setCallActive(true);
  };

  const handleFinishCallAndSubmit = () => {
    if (!selectedRequest) return;
    setIsSubmittingDraft(true);

    setTimeout(() => {
      dataStore.updateCallbackStatus(selectedRequest.id, 'Completed');
      setCallActive(false);
      setIsSubmittingDraft(false);
      setSuccessMessage(`Draft created for ${selectedRequest.artisan_name} and submitted for admin catalog approval!`);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF7F2] to-[#F4EFE6] border border-[#DFD5C4] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2E4B3D] text-white flex items-center justify-center shadow-md">
            <Headphones className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D241E]">
              Artisan Onboarding & Call Support Operator
            </h2>
            <p className="text-xs text-[#5A3924] mt-0.5">
              Assisting non-digital Indian craftspersons to list and price their masterworks over phone calls.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#2E4B3D]/10 text-[#2E4B3D] font-bold text-xs">
          {callbackRequests.length} Scheduled Calls
        </span>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Layout: List of Requests + Active Call Session */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requests Queue */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif font-bold text-base text-[#2D241E]">
            Artisan Callback Queue
          </h3>

          <div className="space-y-3">
            {callbackRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedRequest?.id === req.id
                    ? 'bg-white border-[#C85A32] shadow-md ring-2 ring-[#C85A32]/20'
                    : 'bg-white border-[#DFD5C4] hover:border-[#C85A32]/60'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F4EFE6] text-xs">
                  <span className="font-serif font-bold text-[#2D241E]">
                    {req.artisan_name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="mt-2 text-xs text-[#5A3924] space-y-1">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{req.phone}</span>
                    <span className="text-[#8C7A6B]">({req.preferred_language})</span>
                  </p>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Slot: {req.preferred_date} • {req.preferred_time}
                  </p>
                  <p className="text-[11px] text-[#2D241E] line-clamp-1">
                    Craft: {req.product_type} ({req.approximate_products} items)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Operator Session Workstation */}
        <div className="lg:col-span-7">
          {selectedRequest ? (
            <div className="p-6 rounded-3xl bg-white border border-[#DFD5C4] shadow-sm space-y-5 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#EFE9DE]">
                <div>
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                    Selected Artisan Session
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#2D241E]">
                    {selectedRequest.artisan_name}
                  </h3>
                  <p className="text-xs text-[#5A3924]">
                    Language: <strong>{selectedRequest.preferred_language}</strong> • Craft: {selectedRequest.product_type}
                  </p>
                </div>

                {!callActive ? (
                  <button
                    onClick={handleStartCall}
                    className="px-5 py-2 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <PhoneCall className="w-4 h-4 animate-pulse" />
                    <span>Initiate Call ({selectedRequest.phone})</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold text-xs flex items-center gap-2 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span>In Active Call</span>
                  </span>
                )}
              </div>

              {/* Live Operator Note Pad */}
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">
                  Live Conversation Notes & Spoken Details
                </label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DFD5C4] text-xs leading-relaxed"
                  placeholder="Note down dimensions, craft story, motifs mentioned by artisan..."
                />
              </div>

              {/* Operator Product Draft Form (Filled during call) */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C4] space-y-3">
                <h4 className="font-serif font-bold text-xs text-[#2D241E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Fill Catalog Draft on Artisan's Behalf</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-[#2D241E] mb-1">Craft Title</label>
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#DFD5C4] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2D241E] mb-1">Retail Price (₹)</label>
                    <input
                      type="number"
                      value={draftPrice}
                      onChange={(e) => setDraftPrice(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-[#DFD5C4] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2D241E] mb-1">B2B Wholesale Price (₹)</label>
                    <input
                      type="number"
                      value={draftB2bPrice}
                      onChange={(e) => setDraftB2bPrice(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-[#DFD5C4] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2D241E] mb-1">Production Time</label>
                    <input
                      type="text"
                      value={draftDuration}
                      onChange={(e) => setDraftDuration(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#DFD5C4] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#2D241E] mb-1">Materials</label>
                    <input
                      type="text"
                      value={draftMaterial}
                      onChange={(e) => setDraftMaterial(e.target.value)}
                      className="w-full p-2 rounded-lg border border-[#DFD5C4] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Draft Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleFinishCallAndSubmit}
                  disabled={isSubmittingDraft}
                  className="px-6 py-2.5 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingDraft ? 'Saving Draft...' : 'Complete Call & Submit Draft'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#DFD5C4]">
              <Phone className="w-10 h-10 text-[#8C7A6B] mx-auto mb-2" />
              <h4 className="font-serif font-bold text-base text-[#2D241E]">Select an artisan request</h4>
              <p className="text-xs text-[#8C7A6B]">Click any callback request on the left to start phone session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
