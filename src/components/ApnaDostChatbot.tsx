import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  RefreshCw,
  Phone,
  ArrowRight,
  HelpCircle,
  Languages,
  CheckCircle2,
  Square,
  Compass,
  ShoppingBag,
} from 'lucide-react';

interface ApnaDostChatbotProps {
  onNavigate: (view: 'home' | 'shop' | 'clusters' | 'ai_studio' | 'b2b' | 'orders' | 'support_dashboard') => void;
  onRequestCallback?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'apna_dost';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    target: 'ai_studio' | 'shop' | 'clusters' | 'b2b' | 'orders' | 'callback';
  }>;
}

interface LanguageItem {
  code: string;
  name: string;
  native: string;
  speechCode: string;
}

const REGIONAL_LANGUAGES: LanguageItem[] = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'en', name: 'English', native: 'English', speechCode: 'en-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechCode: 'gu-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN' },
];

export const ApnaDostChatbot: React.FC<ApnaDostChatbotProps> = ({
  onNavigate,
  onRequestCallback,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageItem>(REGIONAL_LANGUAGES[0]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'apna_dost',
      text: 'नमस्ते जी! 🙏 मैं हूँ आपका "अपना दोस्त" - कलासेतु का 24/7 AI सहायक।\n\nअगर आपको ऐप चलाने, नया सामान बेचने, वॉइस नोट से लिस्टिंग करने, या ऑर्डर ट्रैक करने में कोई भी परेशानी आ रही है, तो मुझे अपनी भाषा में बताएं या माइक दबाकर बोलें!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: '🎨 सामान कैसे बेचें?', target: 'ai_studio' },
        { label: '🎙️ वॉइस नोट लिस्टिंग', target: 'ai_studio' },
        { label: '📦 ऑर्डर ट्रैक करें', target: 'orders' },
        { label: '📞 मुफ़्त कॉल सहायता', target: 'callback' },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Stop speech when closing or unmounting
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Text to Speech
  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Your browser does not support voice playback.');
      return;
    }

    // If already speaking this message, stop
    if (isSpeaking && currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown/symbols for smooth speech
    const cleanSpeech = text
      .replace(/[#*_~`]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/👉|🙏|🎨|🎙️|📦|📞|💰|🤝/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = selectedLang.speechCode;
    utterance.rate = 0.95; // comfortable friendly pace
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentlySpeakingId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop any active speech
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    }
  };

  // Voice Input (Speech-to-Text)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice typing is not supported on this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = selectedLang.speechCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setInputMessage(spoken);
          // Auto submit after voice input
          sendMessage(spoken);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Send message to backend
  const sendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText !== undefined ? overrideText : inputMessage).trim();
    if (!textToSend || isLoading) return;

    stopSpeech();

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/ai/apna-dost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: selectedLang.code,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (data.success && data.reply) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'apna_dost',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: data.suggestedActions || [],
        };

        setMessages((prev) => [...prev, botMsg]);

        // Auto speak if enabled
        if (autoVoiceReply) {
          setTimeout(() => {
            speakText(data.reply, botMsg.id);
          }, 400);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch response');
      }
    } catch (err: any) {
      console.warn('Error in Apna Dost chat:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot_fallback_${Date.now()}`,
        sender: 'apna_dost',
        text: 'नमस्ते! अगर आपको ऐप चलाने में कोई कठिनाई हो रही है, तो आप "AI स्टूडियो" में जाकर अपनी आवाज से सामान अपलोड कर सकते हैं, या हमारी टीम से मुफ़्त कॉल सपोर्ट ले सकते हैं।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: '🎨 AI स्टूडियो खोलें', target: 'ai_studio' },
          { label: '📞 मुफ़्त कॉल सहायता', target: 'callback' },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (autoVoiceReply) {
        setTimeout(() => speakText(fallbackMsg.text, fallbackMsg.id), 400);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (target: string) => {
    if (target === 'callback') {
      if (onRequestCallback) onRequestCallback();
      else alert('Artisan Call Helpline: +91 80000 12345');
    } else {
      onNavigate(target as any);
    }
    // Optionally close chat on mobile
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING WIDGET BUTTON (BOTTOM-RIGHT) */}
      {/* ========================================================================= */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 animate-bounce-subtle">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-[#C85A32] via-[#B04924] to-[#3E2415] hover:shadow-xl hover:scale-105 text-white rounded-full transition-all duration-300 shadow-lg cursor-pointer border-2 border-amber-300/60"
            title="ऐप चलाने में कोई समस्या? अपना दोस्त से बात करें या पूछें!"
          >
            {/* Friendly Avatar Icon */}
            <div className="relative w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 font-bold shadow-inner">
              <Bot className="w-5 h-5 text-[#C85A32]" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>

            <div className="text-left pr-1">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-wide">अपना दोस्त (Apna Dost)</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              </div>
              <span className="text-[10px] text-amber-200 block font-sans">24/7 AI सहायक • बोलकर पूछें</span>
            </div>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHATBOT WINDOW (DIALOG) */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[85vh] sm:h-[620px] max-h-[700px] bg-white rounded-3xl shadow-2xl border-2 border-amber-800/20 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3E2415] via-[#5A3924] to-[#C85A32] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-amber-900/40">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shadow-md border-2 border-amber-300">
                <Bot className="w-6 h-6 text-[#C85A32]" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm sm:text-base leading-tight">अपना दोस्त (Apna Dost)</h3>
                  <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-mono">
                    24/7 Sahayak
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-tight">
                  ऐप गाइड • क्षेत्रीय भाषा व आवाज सहायता
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Auto Speak Toggle */}
              <button
                type="button"
                onClick={() => {
                  setAutoVoiceReply(!autoVoiceReply);
                  if (isSpeaking) stopSpeech();
                }}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  autoVoiceReply
                    ? 'bg-amber-500/30 text-amber-200 hover:bg-amber-500/50'
                    : 'bg-white/10 text-stone-400 hover:bg-white/20'
                }`}
                title={autoVoiceReply ? 'आवाज में जवाब चालू है (क्लिक करके म्यूट करें)' : 'आवाज में जवाब बंद है'}
              >
                {autoVoiceReply ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="बंद करें"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Language Selector Bar */}
          <div className="bg-[#FAF7F2] px-3 py-2 border-b border-stone-200 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
            <div className="flex items-center space-x-1 text-stone-500 shrink-0">
              <Languages className="w-3.5 h-3.5 text-[#C85A32]" />
              <span className="text-[11px] font-semibold">भाषा:</span>
            </div>
            <div className="flex space-x-1">
              {REGIONAL_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setSelectedLang(lang);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                    selectedLang.code === lang.code
                      ? 'bg-[#C85A32] text-white shadow-xs font-bold'
                      : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Guidance Banner */}
          <div className="bg-amber-50/90 px-3.5 py-1.5 border-b border-amber-200/60 flex items-center justify-between text-[11px] text-amber-950">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-[#C85A32]" />
              <span>बोलकर या लिखकर पूछें — अपनी पसंदीदा भाषा में!</span>
            </span>
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeech}
                className="text-[10px] text-red-600 font-bold hover:underline flex items-center space-x-0.5 cursor-pointer"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>आवाज रोकें</span>
              </button>
            )}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-stone-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isCurrentlySpeakingThis = isSpeaking && currentlySpeakingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                      isUser
                        ? 'bg-[#C85A32] text-white rounded-br-none'
                        : isCurrentlySpeakingThis
                        ? 'bg-amber-100 text-stone-900 border-2 border-amber-400 rounded-bl-none ring-2 ring-amber-300'
                        : 'bg-white text-stone-900 border border-stone-200 rounded-bl-none'
                    }`}
                  >
                    {/* Bot Title & Speaker Controls */}
                    {!isUser && (
                      <div className="flex items-center justify-between border-b border-stone-100 pb-1.5 mb-1.5">
                        <span className="font-bold text-[11px] text-[#C85A32] flex items-center space-x-1">
                          <Bot className="w-3 h-3" />
                          <span>अपना दोस्त</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => speakText(msg.text, msg.id)}
                          className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                            isCurrentlySpeakingThis
                              ? 'bg-[#C85A32] text-white animate-pulse'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          }`}
                          title={isCurrentlySpeakingThis ? 'आवाज रोकें' : 'बोलकर सुनें'}
                        >
                          {isCurrentlySpeakingThis ? (
                            <>
                              <Square className="w-2.5 h-2.5 fill-current" />
                              <span>रोकें</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-2.5 h-2.5" />
                              <span>सुनें</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Message Text with simple line breaks */}
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Suggested Action Buttons if any */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-stone-100 flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            type="button"
                            onClick={() => handleActionClick(action.target)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-[11px] transition-all flex items-center space-x-1 cursor-pointer hover:shadow-xs active:scale-95"
                          >
                            <span>{action.label}</span>
                            <ArrowRight className="w-3 h-3 text-[#C85A32]" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-stone-400 px-1 font-mono">{msg.timestamp}</span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-2xl rounded-bl-none border border-stone-200 max-w-[70%] text-xs text-stone-600 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 text-[#C85A32] animate-spin" />
                <span>अपना दोस्त सोच रहा है...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Pills */}
          <div className="px-3 py-1.5 bg-stone-100/90 border-t border-stone-200 flex items-center space-x-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-stone-400 shrink-0 font-medium text-[10px]">सुझाव:</span>
            {[
              'सामान कैसे अपलोड करें?',
              'वॉइस नोट लिस्टिंग कैसे होती है?',
              'सही कीमत कैसे मिलेगी?',
              'B2B ऑर्डर कैसे लें?',
              'ऑर्डर ट्रैक करें',
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={isLoading}
                className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-[#C85A32] hover:border-amber-300 text-stone-700 rounded-full border border-stone-200 shrink-0 transition-colors cursor-pointer text-[10px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-stone-200 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center space-x-1.5"
            >
              {/* Voice Input Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
                    : 'bg-amber-100 hover:bg-amber-200 text-[#C85A32]'
                }`}
                title={isListening ? 'बोलना बंद करें' : 'माइक दबाकर बोलें (Voice Typing)'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isListening
                    ? 'सुन रहा हूँ... बोलिए...'
                    : `अपनी भाषा में पूछें (${selectedLang.native})...`
                }
                disabled={isLoading}
                className={`flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40 text-stone-900 transition-all ${
                  isListening ? 'border-red-400 bg-red-50/30' : 'border-stone-300'
                }`}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B04924] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-xs cursor-pointer shrink-0"
                title="भेजें"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {isListening && (
              <div className="text-center text-[11px] text-red-600 font-medium animate-pulse">
                🎙️ माइक चालू है... आप बोल सकते हैं, AI सुन रहा है!
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

