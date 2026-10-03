import React, { useState, useEffect, useRef } from 'react';
import { Inquiry, InquiryMessage, Quote, UserProfile } from '../types';
import { dataStore } from '../lib/supabase';
import {
  X,
  Send,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Paperclip,
  Check,
  CheckCheck,
  Calendar,
  IndianRupee,
} from 'lucide-react';

interface InquiryChatModalProps {
  inquiry: Inquiry | null;
  currentUser: UserProfile;
  onClose: () => void;
  onOrderQuote?: (quote: Quote) => void;
}

export const InquiryChatModal: React.FC<InquiryChatModalProps> = ({
  inquiry,
  currentUser,
  onClose,
  onOrderQuote,
}) => {
  if (!inquiry) return null;

  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Structured Quote Creation Form fields (Artisan side)
  const [quoteQuantity, setQuoteQuantity] = useState(inquiry.items[0]?.quantity || 40);
  const [quoteUnitPrice, setQuoteUnitPrice] = useState(inquiry.target_price_per_unit || 1580);
  const [quoteDiscount, setQuoteDiscount] = useState(2000);
  const [quoteCustomization, setQuoteCustomization] = useState(3000);
  const [quotePackaging, setQuotePackaging] = useState(3500);
  const [quoteShipping, setQuoteShipping] = useState(3000);
  const [quoteProductionTime, setQuoteProductionTime] = useState('18 days handcrafting & slow kiln firing');
  const [quoteDeliveryDate, setQuoteDeliveryDate] = useState('2026-10-15');
  const [quoteValidity, setQuoteValidity] = useState('2026-09-30');
  const [quoteNotes, setQuoteNotes] = useState('Includes individual festive gift boxes and certificate of authenticity signed by master craftsperson.');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages & quotes from store
  useEffect(() => {
    const update = () => {
      setMessages(dataStore.getInquiryMessages(inquiry.id));
      setQuotes(dataStore.getQuotes().filter((q) => q.inquiry_id === inquiry.id));
    };
    update();
    const unsub = dataStore.subscribe(update);
    return unsub;
  }, [inquiry.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    dataStore.addInquiryMessage({
      inquiry_id: inquiry.id,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.role,
      message: newMessageText.trim(),
      message_type: 'text',
      is_read: false,
    });

    setNewMessageText('');
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = quoteQuantity * quoteUnitPrice;
    const total = subtotal - quoteDiscount + quoteCustomization + quotePackaging + quoteShipping;

    dataStore.createQuote({
      inquiry_id: inquiry.id,
      artisan_id: inquiry.artisan_id,
      artisan_name: inquiry.artisan_name,
      buyer_id: inquiry.buyer_id,
      quantity: Number(quoteQuantity),
      unit_price: Number(quoteUnitPrice),
      discount: Number(quoteDiscount),
      customization_cost: Number(quoteCustomization),
      packaging_cost: Number(quotePackaging),
      shipping_cost: Number(quoteShipping),
      total_amount: Math.max(0, total),
      production_time: quoteProductionTime,
      estimated_delivery_date: quoteDeliveryDate,
      valid_until: quoteValidity,
      status: 'Sent',
      notes: quoteNotes,
    });

    setShowQuoteForm(false);
  };

  const latestQuote = quotes[0];
  const isArtisan = currentUser.role === 'artisan' || currentUser.role === 'admin';
  const isBuyer = currentUser.role === 'customer' || currentUser.id === inquiry.buyer_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-auto bg-white rounded-3xl shadow-2xl border border-[#DFD5C4] overflow-hidden flex flex-col h-[90vh]">
        {/* Header with Inquiry Details */}
        <div className="px-6 py-3.5 border-b border-[#EFE9DE] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-[#2D241E]">
                  Inquiry #{inquiry.inquiry_number}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">
                  {inquiry.status}
                </span>
              </div>
              <p className="text-[11px] text-[#8C7A6B]">
                {inquiry.buyer_name} ↔ {inquiry.artisan_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isArtisan && !showQuoteForm && (
              <button
                onClick={() => setShowQuoteForm(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#2E4B3D] text-white text-xs font-semibold hover:bg-[#253D32] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Create Formal Quote</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#8C7A6B] hover:text-[#2D241E] hover:bg-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inquiry Summary Mini-Bar */}
        <div className="px-6 py-2 bg-[#F4EFE6] border-b border-[#EFE9DE] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5A3924]">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#2D241E]">
              Product: {inquiry.items[0]?.product_title}
            </span>
            <span>•</span>
            <span>Target Qty: {inquiry.items[0]?.quantity} units</span>
            <span>•</span>
            <span>Target: ₹{inquiry.target_price_per_unit || 'Negotiable'}</span>
          </div>
          <span className="text-[11px] text-[#8C7A6B]">
            Destination: {inquiry.shipping_location}
          </span>
        </div>

        {/* Body: Split chat + Quote viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF7F2]">
          {/* If there's an active quote, highlight it prominently at the top */}
          {latestQuote && (
            <div className="p-4 rounded-2xl bg-white border-2 border-[#2E4B3D]/30 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EFE9DE] gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2E4B3D] text-white">
                    OFFICIAL QUOTE #{latestQuote.id}
                  </span>
                  <span className="text-xs font-semibold text-[#5A3924]">
                    Status: <span className="text-[#2E4B3D]">{latestQuote.status}</span>
                  </span>
                </div>
                <span className="text-xs text-[#8C7A6B]">
                  Valid Until: {latestQuote.valid_until}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                <div>
                  <span className="text-[#8C7A6B] block">Quantity</span>
                  <span className="font-bold text-[#2D241E]">{latestQuote.quantity} units</span>
                </div>
                <div>
                  <span className="text-[#8C7A6B] block">Unit Price</span>
                  <span className="font-bold text-[#2D241E]">₹{latestQuote.unit_price}</span>
                </div>
                <div>
                  <span className="text-[#8C7A6B] block">Production Time</span>
                  <span className="font-medium text-[#2D241E]">{latestQuote.production_time}</span>
                </div>
                <div>
                  <span className="text-[#8C7A6B] block">Grand Total</span>
                  <span className="font-serif font-bold text-base text-[#2E4B3D]">
                    ₹{latestQuote.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {latestQuote.notes && (
                <p className="text-[11px] text-[#5A3924] bg-[#FAF7F2] p-2 rounded-lg border border-[#EFE9DE]">
                  <strong>Notes:</strong> {latestQuote.notes}
                </p>
              )}

              {/* Buyer Acceptance / Rejection actions */}
              {isBuyer && latestQuote.status === 'Sent' && (
                <div className="mt-3 pt-3 border-t border-[#EFE9DE] flex items-center justify-end gap-3">
                  <button
                    onClick={() => dataStore.updateQuoteStatus(latestQuote.id, 'Rejected')}
                    className="px-4 py-1.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                  >
                    Reject Quote
                  </button>
                  <button
                    onClick={() => {
                      dataStore.updateQuoteStatus(latestQuote.id, 'Accepted');
                      if (onOrderQuote) onOrderQuote(latestQuote);
                    }}
                    className="px-5 py-1.5 rounded-xl bg-[#2E4B3D] hover:bg-[#253D32] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept Quote & Prepare Order</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat Messages List */}
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-[#8C7A6B] mb-0.5 px-1">
                    {msg.sender_name} ({msg.sender_role})
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-[#C85A32] text-white rounded-br-xs'
                        : msg.message_type === 'quote'
                        ? 'bg-[#2E4B3D]/10 border border-[#2E4B3D]/30 text-[#2E4B3D] font-medium'
                        : 'bg-white text-[#2D241E] border border-[#DFD5C4] rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Modal Quote Creation Slide-over / Overlay (for artisan) */}
        {showQuoteForm && (
          <div className="absolute inset-x-0 bottom-0 bg-white border-t-2 border-[#C85A32] shadow-2xl p-6 z-20 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DE] mb-4">
              <h4 className="font-serif font-bold text-sm text-[#2D241E]">
                Generate Structured B2B Quotation
              </h4>
              <button
                onClick={() => setShowQuoteForm(false)}
                className="text-[#8C7A6B] hover:text-[#2D241E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendQuote} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">Quantity</label>
                <input
                  type="number"
                  value={quoteQuantity}
                  onChange={(e) => setQuoteQuantity(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DFD5C4]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  value={quoteUnitPrice}
                  onChange={(e) => setQuoteUnitPrice(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DFD5C4]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">Customization (₹)</label>
                <input
                  type="number"
                  value={quoteCustomization}
                  onChange={(e) => setQuoteCustomization(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DFD5C4]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">Packaging (₹)</label>
                <input
                  type="number"
                  value={quotePackaging}
                  onChange={(e) => setQuotePackaging(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DFD5C4]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">Shipping Cost (₹)</label>
                <input
                  type="number"
                  value={quoteShipping}
                  onChange={(e) => setQuoteShipping(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DFD5C4]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">Production Time</label>
                <input
                  type="text"
                  value={quoteProductionTime}
                  onChange={(e) => setQuoteProductionTime(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DFD5C4]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">Estimated Delivery</label>
                <input
                  type="date"
                  value={quoteDeliveryDate}
                  onChange={(e) => setQuoteDeliveryDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DFD5C4]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D241E] mb-1">Quote Valid Until</label>
                <input
                  type="date"
                  value={quoteValidity}
                  onChange={(e) => setQuoteValidity(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DFD5C4]"
                />
              </div>

              <div className="col-span-2 sm:col-span-4 flex items-center justify-between pt-2">
                <span className="font-bold text-sm text-[#2E4B3D]">
                  Estimated Grand Total: ₹
                  {(
                    quoteQuantity * quoteUnitPrice -
                    quoteDiscount +
                    quoteCustomization +
                    quotePackaging +
                    quoteShipping
                  ).toLocaleString('en-IN')}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuoteForm(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#DFD5C4] text-[#5A3924]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-[#2E4B3D] text-white font-semibold cursor-pointer"
                  >
                    Send Formal Quotation
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Message Input Footer */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#EFE9DE] bg-white flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your reply, negotiate quantities, or ask craft questions..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#DFD5C4] text-xs focus:outline-none focus:border-[#C85A32] bg-[#FAF7F2]"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B04924] text-white transition-colors cursor-pointer shadow-xs"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
