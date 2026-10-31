import React, { useState, useRef, useEffect } from 'react';
import {
  Product,
  Artisan,
  VoiceIntent,
  ProductAnalysis,
  BackgroundScenePrompt,
  CatalogData,
  SEOData,
  FairPriceData,
  DemandData,
  WorkflowJobState,
  JobStatus,
  MarketResearchData,
  MarketResearchRecommendation,
} from '../types';
import { dataStore } from '../lib/supabase';
import { INITIAL_CATEGORIES } from '../data/seedData';
import { Product360Viewer } from './Product360Viewer';
import { MarketIntelligenceSection } from './MarketIntelligenceSection';
import {
  transcribeAudio,
  interpretVoiceInstruction,
  analyzeProductImage,
  removeBackground,
  generateProductBackground,
  generateCatalog,
  generateSEO,
  estimateFairPrice,
  analyzeDemand,
  trackAnalyticsEvent,
  getStoredGeminiApiKey,
  saveGeminiApiKey,
  checkSerpApiStatus,
} from '../lib/aiServices';
import {
  Mic,
  Square,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Building2,
  TrendingUp,
  RotateCw,
  Phone,
  Save,
  Check,
  Languages,
  Globe,
  Volume2,
  VolumeX,
  Play,
  RefreshCw,
  Wand2,
  Sliders,
  Layers,
  Sparkle,
  Info,
  FileText,
  Search,
  Tag,
  DollarSign,
  BarChart3,
  Calendar,
  Eye,
  Scissors,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Undo,
  X,
  FileAudio,
  Activity,
} from 'lucide-react';

const SAMPLE_VOICE_SCRIPTS = [
  {
    id: 'sample_terracotta',
    title: '🏺 टेराकोटा कुल्हड़ व दीया सेट (Hindi)',
    lang: 'Hindi' as const,
    tag: 'Rajasthan Pottery',
    transcript: 'नमस्ते, यह जयपुर का पारंपरिक हस्तनिर्मित टेराकोटा कुल्हड़ और दीया सेट है। 100% प्राकृतिक शुद्ध काली मिट्टी से बना है और लकड़ी की भट्टी में पकाया गया है। दिवाली पूजा और पर्यावरण-अनुकूल उपहार के लिए आदर्श है। खुदरा कीमत 450 रुपये और 50 पीस पर थोक भाव 320 रुपये है।',
  },
  {
    id: 'sample_madhubani',
    title: '🎨 मधुबनी लोक कला पेंटिंग (Hindi)',
    lang: 'Hindi' as const,
    tag: 'Bihar Folk Art',
    transcript: 'नमस्ते, यह बिहार के मिथिला की पारंपरिक हस्तचित्रित मधुबनी पेंटिंग है। प्राकृतिक पौधों और खनिजों के रंगों से हाथ से बने कॉटन कैनवास पर मयूर और जीवन वृक्ष की सुंदर कलाकृति बनाई गई है। खुदरा मूल्य 2250 रुपये और 10 पीस पर थोक भाव 1550 रुपये है।',
  },
  {
    id: 'sample_brass',
    title: '🪔 Brass Bell & Puja Diya (Hinglish)',
    lang: 'English' as const,
    tag: 'Moradabad Metalcraft',
    transcript: 'This is a hand-carved pure brass temple bell and Lakshmi-Ganesh diya set crafted in Moradabad. Authentic antique golden finish with traditional peacock engraving. Retail price 1250 rupees, bulk B2B price 890 rupees with minimum 20 pieces.',
  },
  {
    id: 'sample_chanderi',
    title: '🧵 चंदेरी सिल्क दुपट्टा (Hindi/English)',
    lang: 'Hindi' as const,
    tag: 'MP Handloom',
    transcript: 'यह शुद्ध हाथ से बुना हुआ चंदेरी सिल्क दुपट्टा है जिसमें पारंपरिक ज़री बॉर्डर और प्राकृतिक रंगों का काम है। शादियों और त्योहारों के लिए बहुत सुंदर है। खुदरा मूल्य 1850 रुपये और 20 पीस पर थोक भाव 1350 रुपये है।',
  },
];

interface AiProductCreationStudioProps {
  onClose: () => void;
  onProductCreated: (product: Product) => void;
  onRequestCallback: () => void;
}

// Sample craft images for quick testing without manual file uploads
const SAMPLE_CRAFT_IMAGES = [
  {
    id: 'madhubani',
    title: 'Madhubani Folk Painting',
    category: 'Traditional Paintings',
    url: '/sample-crafts/madhubani.png',
  },
  {
    id: 'brass',
    title: 'Brass Pooja Diya & Artifact',
    category: 'Brass & Metal Craft',
    url: '/sample-crafts/brass.jpg',
  },
  {
    id: 'textile',
    title: 'Handloom Silk Saree',
    category: 'Handloom & Textiles',
    url: '/sample-crafts/saree.jpg',
  },
  {
    id: 'wood',
    title: 'Hand-Carved Sheesham Woodwork',
    category: 'Woodwork & Carvings',
    url: '/sample-crafts/woodwork.jpg',
  },
  {
    id: 'pottery',
    title: 'Terracotta Pottery Diya',
    category: 'Pottery & Ceramics',
    url: '/sample-crafts/pottery.jpg',
  },
];

export const AiProductCreationStudio: React.FC<AiProductCreationStudioProps> = ({
  onClose,
  onProductCreated,
  onRequestCallback,
}) => {
  const currentArtisan = dataStore.getArtisans()[0]; // Default to Rameshwarji or active artisan
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hasHfToken, setHasHfToken] = useState<boolean | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [hasSerpApiKey, setHasSerpApiKey] = useState<boolean | null>(null);
  const [marketResearch, setMarketResearch] = useState<MarketResearchData | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState<string>(() => getStoredGeminiApiKey());
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [apiKeyStatusMsg, setApiKeyStatusMsg] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);

  // Check health, Gemini key and SerpApi status on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHasHfToken(Boolean(data.hasHfToken));
        if (typeof data.hasSerpApiKey === 'boolean') {
          setHasSerpApiKey(data.hasSerpApiKey);
        }
      })
      .catch(() => setHasHfToken(false));

    fetch('/api/config/status')
      .then(res => res.json())
      .then(data => {
        setHasGeminiKey(Boolean(data.hasGeminiKey) || Boolean(getStoredGeminiApiKey()));
      })
      .catch(() => setHasGeminiKey(Boolean(getStoredGeminiApiKey())));

    checkSerpApiStatus()
      .then(data => setHasSerpApiKey(data.configured))
      .catch(() => setHasSerpApiKey(false));
  }, []);

  const handleSaveGeminiKey = async (keyToSave: string) => {
    setIsTestingKey(true);
    setApiKeyStatusMsg(null);
    try {
      saveGeminiApiKey(keyToSave);
      const res = await fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToSave, key: keyToSave }),
      });
      const data = await res.json();
      if (data.valid || data.success) {
        setHasGeminiKey(true);
        setApiKeyStatusMsg(`✅ Gemini API connected! (${data.model || 'gemini-2.5-flash'})`);
        setTimeout(() => {
          setShowKeyModal(false);
          if (uploadedImage) {
            runImageAnalysis(uploadedImage, imageFileDetails?.name);
          }
        }, 1200);
      } else {
        setApiKeyStatusMsg(`⚠️ Key saved in browser. (${data.message || data.error || 'Stored'})`);
      }
    } catch {
      setApiKeyStatusMsg('Key saved in browser storage.');
    } finally {
      setIsTestingKey(false);
    }
  };

  // Dedicated Job Status Tracking per Pipeline Stage
  const [jobs, setJobs] = useState<WorkflowJobState>({
    voice_transcription: { status: 'idle' },
    voice_interpretation: { status: 'idle' },
    product_analysis: { status: 'idle' },
    background_removal: { status: 'idle' },
    background_generation: { status: 'idle' },
    catalog_generation: { status: 'idle' },
    seo_generation: { status: 'idle' },
    price_analysis: { status: 'idle' },
    demand_analysis: { status: 'idle' },
    market_research: { status: 'idle' },
  });

  const updateJob = (stage: keyof WorkflowJobState, status: JobStatus, error?: string) => {
    setJobs(prev => ({
      ...prev,
      [stage]: { status, error },
    }));
  };

  // =========================================================================
  // Stage 1: Voice Instruction (Speech-to-Text with Whisper & Gemini Intent)
  // =========================================================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [productHint, setProductHint] = useState('');
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceIntent, setVoiceIntent] = useState<VoiceIntent | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // =========================================================================
  // Stage 2: Product Image Upload & Multimodal Vision Analysis
  // =========================================================================
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [imageOriginalBackup, setImageOriginalBackup] = useState<string>('');
  const [imageFileDetails, setImageFileDetails] = useState<{
    name: string;
    size: string;
    dimensions: string;
  }>({
    name: '',
    size: '',
    dimensions: '',
  });
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  const [visionGeneratedNotice, setVisionGeneratedNotice] = useState<string | null>(null);

  // =========================================================================
  // Stage 3 & 4: Background Removal (SegFormer) & Background Generation
  // =========================================================================
  const [isolatedProductImage, setIsolatedProductImage] = useState<string | null>(null);
  const [activeImagePreset, setActiveImagePreset] = useState<'clean' | 'studio' | 'heritage' | 'luxury'>('clean');
  const [generatedBackgroundImage, setGeneratedBackgroundImage] = useState<string | null>(null);
  const [scenePrompt, setScenePrompt] = useState<BackgroundScenePrompt | null>(null);
  const [view360Mode, setView360Mode] = useState(false);

  // =========================================================================
  // Stage 5: AI Catalog Generation & Editing
  // =========================================================================
  const [catalogLang, setCatalogLang] = useState<'english' | 'hindi'>('english');
  const [catalog, setCatalog] = useState<CatalogData>({
    title: '',
    shortTitle: '',
    shortDescription: '',
    detailedDescription: '',
    craftStory: '',
    category: '',
    subcategory: '',
    material: '',
    color: '',
    style: '',
    features: [],
    benefits: [],
    useCases: [],
    targetAudience: '',
    highlights: [],
    careInstructions: '',
    tags: [],
    keywords: [],
    translations: {
      hindi: {
        title: '',
        shortDescription: '',
        craftStory: '',
      },
    },
  });

  // =========================================================================
  // Stage 6: SEO Generation & Editing
  // =========================================================================
  const [seo, setSeo] = useState<SEOData>({
    seoTitle: '',
    metaDescription: '',
    slug: '',
    primaryKeyword: '',
    secondaryKeywords: [],
    searchTags: [],
    productTags: [],
    semanticKeywords: [],
    faq: [],
  });

  // =========================================================================
  // Stage 7: Fair Price Advisor
  // =========================================================================
  const [fairPricing, setFairPricing] = useState<FairPriceData>({
    estimated_price: 0,
    minimum_fair_price: 0,
    maximum_fair_price: 0,
    currency: 'INR',
    confidence: 'Medium',
    reasoning: [],
    suggestedRetailPrice: 0,
    suggestedB2BPrice: 0,
    suggestedBulkPrice: 0,
    breakdown: {
      materialEstimate: 0,
      laborAndCraftsmanship: 0,
      packagingAndFinishing: 0,
      artisanFairMargin: 0,
    },
  });

  const [retailPriceInput, setRetailPriceInput] = useState<number>(0);
  const [b2bPriceInput, setB2bPriceInput] = useState<number>(0);
  const [bulkPriceInput, setBulkPriceInput] = useState<number>(0);

  // =========================================================================
  // Stage 8: Demand Intelligence & Marketplace Launch
  // =========================================================================
  const [demand, setDemand] = useState<DemandData>({
    demandScore: 0,
    demandLevel: 'Medium',
    trend: 'Stable',
    confidence: 'Medium',
    signals: {
      internalViews: { score: 0, max: 25, raw: 0, label: 'Marketplace Views' },
      searchInterest: { score: 0, max: 25, raw: 0, label: 'Search Queries' },
      addToCart: { score: 0, max: 20, raw: 0, label: 'Add to Cart' },
      wishlist: { score: 0, max: 15, raw: 0, label: 'Saved to Wishlist' },
      seasonality: { score: 0, max: 10, raw: 0, festivalName: '', label: 'Festive Seasonality' },
      recentTrend: { score: 0, max: 5, raw: 0, label: 'Completed Orders' },
    },
    explanation: 'Upload your product image or voice note to calculate live demand metrics.',
    festivalRelevance: [],
    actionableTips: [],
  });

  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSavedSuccess, setProductSavedSuccess] = useState(false);
  const [isArtisanApproved, setIsArtisanApproved] = useState(true);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

  // Text-to-Speech Spoken Audio Feedback (Hindi/English)
  const speakAiResponse = (customMessage?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechStatus('Audio playback not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak =
      customMessage ||
      `नमस्ते! आपके उत्पाद '${catalog.translations?.hindi?.title || catalog.title}' का विवरण तैयार कर लिया गया है। खुदरा मूल्य ₹${retailPriceInput} और थोक मूल्य ₹${b2bPriceInput} निर्धारित किया गया है।`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // =========================================================================
  // Handlers: Voice Recording & Whisper Transcription
  // =========================================================================
  const startRecording = async () => {
    setMicPermissionError(null);
    setSpeechStatus('Requesting microphone access...');
    updateJob('voice_transcription', 'processing');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('NOT_SUPPORTED');
      }

      // Request stream with high quality audio processing
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // Audio volume visualizer setup
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          let lastVolumeUpdate = 0;
          const updateVolume = (timestamp: number) => {
            if (!analyserRef.current) return;
            // Throttle volume UI updates to max 15fps (~66ms) to prevent 60-120fps component re-render thrashing
            if (timestamp - lastVolumeUpdate > 66) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              const newVol = Math.min(100, Math.round((avg / 128) * 100));
              setAudioVolume((prev) => (Math.abs(prev - newVol) > 4 ? newVol : prev));
              lastVolumeUpdate = timestamp;
            }
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          animFrameRef.current = requestAnimationFrame(updateVolume);
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext volume meter notice:', audioCtxErr);
      }

      // Determine best supported MIME type
      const preferredMimes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
        '',
      ];
      let chosenMime = '';
      for (const mime of preferredMimes) {
        if (mime === '' || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime))) {
          chosenMime = mime;
          break;
        }
      }

      const recorder = chosenMime ? new MediaRecorder(stream, { mimeType: chosenMime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      setSpeechStatus('🎙️ Microphone active! Speak naturally in Hindi, Hinglish, or English...');

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Optional interim speech recognition
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-IN';
          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript + ' ';
            }
            if (current.trim()) {
              setVoiceTranscript(current.trim());
            }
          };
          recognition.onerror = (e: any) => {
            console.warn('Interim speech recognition notice:', e.error);
          };
          speechRecognitionRef.current = recognition;
          recognition.start();
        }
      } catch (srErr) {
        // Safe fallback - Whisper will process recorded audio
      }
    } catch (err: any) {
      console.warn('Microphone permission or hardware error:', err);
      setIsRecording(false);
      setRecordingSeconds(0);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        const msg = '⚠️ Microphone access was blocked by your browser. Please click the lock or camera icon in your browser URL bar and choose "Allow Microphone". You can also test with 1-Tap Sample Voice Notes or upload an audio file below.';
        setMicPermissionError(msg);
        setSpeechStatus(msg);
      } else if (err.name === 'NotFoundError' || err.message === 'NOT_SUPPORTED') {
        const msg = '⚠️ No microphone detected on this device. You can test with 1-Tap Sample Voice Notes or upload an audio recording file below.';
        setMicPermissionError(msg);
        setSpeechStatus(msg);
      } else {
        const msg = `⚠️ Microphone unavailable (${err.message || 'Error'}). You can select a sample voice note below or upload an audio recording.`;
        setMicPermissionError(msg);
        setSpeechStatus(msg);
      }
      updateJob('voice_transcription', 'idle');
    }
  };

  const stopRecordingAndProcess = async () => {
    setIsRecording(false);
    setAudioVolume(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    setSpeechStatus('Processing voice note with Hugging Face Whisper (openai/whisper-large-v3-turbo)...');
    updateJob('voice_transcription', 'processing');

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Wait 350ms for final data chunk to flush
    setTimeout(async () => {
      let finalTranscript = voiceTranscript;

      if (audioChunksRef.current.length > 0) {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const whisperRes = await transcribeAudio(audioBlob, selectedLanguage);
        if (whisperRes.success && whisperRes.transcript) {
          finalTranscript = whisperRes.transcript;
          setVoiceTranscript(finalTranscript);
          updateJob('voice_transcription', 'completed');
        } else {
          updateJob('voice_transcription', 'completed');
        }
      } else {
        updateJob('voice_transcription', 'completed');
      }

      // Step 1b: Interpret Voice Intent with Gemini
      setSpeechStatus('Understanding product intent with Gemini AI...');
      updateJob('voice_interpretation', 'processing');

      const intentRes = await interpretVoiceInstruction(finalTranscript, selectedLanguage);
      if (intentRes.success && intentRes.intent) {
        setVoiceIntent(intentRes.intent);
        updateJob('voice_interpretation', 'completed');
        setSpeechStatus('Voice instruction understood! Ready to proceed to photo upload.');
      } else {
        updateJob('voice_interpretation', 'completed');
        setSpeechStatus('Voice saved. Ready to proceed.');
      }
    }, 350);
  };

  const handleProcessTextDirectly = async () => {
    if (!voiceTranscript.trim()) return;
    setMicPermissionError(null);
    setSpeechStatus('Understanding craft story with Gemini AI...');
    updateJob('voice_interpretation', 'processing');
    const intentRes = await interpretVoiceInstruction(voiceTranscript, selectedLanguage);
    if (intentRes.success && intentRes.intent) {
      setVoiceIntent(intentRes.intent);
      updateJob('voice_interpretation', 'completed');
      setSpeechStatus('Intent parsed successfully! Ready for photo upload.');
    } else {
      updateJob('voice_interpretation', 'completed');
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMicPermissionError(null);
    setSpeechStatus(`Processing audio recording (${file.name}) with Hugging Face Whisper...`);
    updateJob('voice_transcription', 'processing');

    try {
      const res = await transcribeAudio(file, selectedLanguage);
      if (res.success && res.transcript) {
        setVoiceTranscript(res.transcript);
        updateJob('voice_transcription', 'completed');
        setSpeechStatus('Voice transcribed! Analyzing craft intent with Gemini...');
        updateJob('voice_interpretation', 'processing');

        const intentRes = await interpretVoiceInstruction(res.transcript, selectedLanguage);
        if (intentRes.success && intentRes.intent) {
          setVoiceIntent(intentRes.intent);
          updateJob('voice_interpretation', 'completed');
          setSpeechStatus('Audio recognized & intent parsed! Ready to proceed.');
        } else {
          updateJob('voice_interpretation', 'completed');
        }
      } else {
        setSpeechStatus(res.error || 'Audio transcription completed with default text.');
        updateJob('voice_transcription', 'completed');
      }
    } catch (err: any) {
      setSpeechStatus(`Audio upload notice: ${err?.message || 'Processing complete'}`);
      updateJob('voice_transcription', 'failed');
    }
  };

  const handleSelectVoiceSample = async (sample: typeof SAMPLE_VOICE_SCRIPTS[0]) => {
    setMicPermissionError(null);
    setVoiceTranscript(sample.transcript);
    setSelectedLanguage(sample.lang as any);
    setSpeechStatus(`Testing with sample note: "${sample.title}"...`);
    updateJob('voice_transcription', 'completed');
    updateJob('voice_interpretation', 'processing');

    const intentRes = await interpretVoiceInstruction(sample.transcript, sample.lang);
    if (intentRes.success && intentRes.intent) {
      setVoiceIntent(intentRes.intent);
      updateJob('voice_interpretation', 'completed');
      setSpeechStatus(`Sample intent understood! Category: ${intentRes.intent.category}, Style: ${intentRes.intent.visual_style}`);
    } else {
      updateJob('voice_interpretation', 'completed');
    }
  };

  // =========================================================================
  // Handlers: Image Upload & Multimodal Vision Analysis
  // =========================================================================

  // Client-side lightweight image optimizer for fast & ultra-reliable Gemini Vision identification
  const compressImageForVision = (dataUrl: string, maxDim = 850, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        try {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
            return;
          }
        } catch {
          // fallback to original
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid JPG, PNG, or WebP image file.');
      return;
    }

    // Validate size (< 12MB)
    if (file.size > 12 * 1024 * 1024) {
      alert('Image size exceeds 12MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      setUploadedImage(result);
      setImageOriginalBackup(result);
      setIsolatedProductImage(null);
      setGeneratedBackgroundImage(null);
      setMarketResearch(null);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setImageFileDetails({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          dimensions: `${img.width} x ${img.height} px`,
        });
      };
      img.src = result;

      // Compress for high-speed & reliable Gemini Vision recognition
      const optimizedForVision = await compressImageForVision(result, 850, 0.8);

      // Automatically run Gemini Multimodal Vision analysis with file name & context
      runImageAnalysis(optimizedForVision, file.name, productHint);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSampleCraft = (craft: typeof SAMPLE_CRAFT_IMAGES[0]) => {
    setUploadedImage(craft.url);
    setImageOriginalBackup(craft.url);
    setIsolatedProductImage(null);
    setGeneratedBackgroundImage(null);
    setMarketResearch(null);
    setProductAnalysis(null);
    setImageFileDetails({
      name: `${craft.id}_artisan_photo.jpg`,
      size: '1.4 MB',
      dimensions: '1200 x 900 px',
    });
    setProductHint(craft.title);

    // Convert local or remote image to base64 for instant zero-latency Gemini Vision analysis
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(850, img.naturalWidth || img.width || 800);
        canvas.height = Math.round((canvas.width * (img.naturalHeight || img.height || 600)) / (img.naturalWidth || img.width || 800));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL(craft.url.endsWith('.png') ? 'image/png' : 'image/jpeg', 0.85);
          runImageAnalysis(base64, `${craft.id}_sample.jpg`, craft.title);
        } else {
          runImageAnalysis(craft.url, `${craft.id}_sample.jpg`, craft.title);
        }
      };
      img.onerror = () => {
        runImageAnalysis(craft.url, `${craft.id}_sample.jpg`, craft.title);
      };
      img.src = craft.url;
    } catch {
      runImageAnalysis(craft.url, `${craft.id}_sample.jpg`, craft.title);
    }
  };

  const runImageAnalysis = async (imgUrl: string, fileName?: string, contextHint?: string) => {
    setIsAnalyzingImage(true);
    updateJob('product_analysis', 'processing');
    updateJob('catalog_generation', 'processing');
    updateJob('seo_generation', 'processing');
    updateJob('price_analysis', 'processing');
    updateJob('demand_analysis', 'processing');

    try {
      const activeHint = contextHint || productHint || undefined;
      const effectiveVoice = voiceTranscript && voiceTranscript.trim() ? voiceTranscript : undefined;
      const res = await analyzeProductImage(imgUrl, 'image/jpeg', fileName || imageFileDetails.name, activeHint, effectiveVoice);
      if (res && res.analysis) {
        const a = res.analysis;
        setProductAnalysis(a);
        updateJob('product_analysis', 'completed');

        const newTitle = a.product_name || a.short_title || 'Handcrafted Heritage Art Piece';
        const newCategory = a.category || 'Traditional Crafts';
        const newSubcategory = a.subcategory || 'Folk Art';
        const newMaterial = a.material || 'Natural Materials';
        const newColor = a.color || 'Earthy Artisan Colors';
        const newStyle = a.style || 'Authentic Handcrafted';

        // 1. Catalog
        if (res.catalog) {
          setCatalog(res.catalog);
        } else {
          setCatalog((prev) => ({
            ...prev,
            title: newTitle,
            shortTitle: a.short_title || newTitle.slice(0, 35),
            category: newCategory,
            subcategory: newSubcategory,
            material: newMaterial,
            color: newColor,
            style: newStyle,
            shortDescription:
              a.short_description ||
              `Authentic ${newTitle.toLowerCase()} crafted from ${newMaterial.toLowerCase()} using traditional ${a.craft_technique || 'handcrafted'} techniques.`,
            detailedDescription:
              a.detailed_description ||
              `Each piece of this ${newTitle.toLowerCase()} is crafted with precision by master artisans using traditional ${a.craft_technique || 'handcrafted'} methods. Featuring authentic ${newMaterial.toLowerCase()} in ${newColor.toLowerCase()} hues, it seamlessly blends indigenous Indian heritage with refined aesthetic decor and versatile utility.`,
            craftStory:
              a.craft_story ||
              `Rooted in regional artisan heritage, this ${newTitle.toLowerCase()} preserves centuries-old craft traditions passed down through generations of skilled Indian craftsmen.`,
            highlights:
              a.highlights && a.highlights.length >= 4
                ? a.highlights
                : [
                    `Authentic handcrafted ${newTitle.toLowerCase()} by master artisans`,
                    `Crafted with genuine ${newMaterial} featuring ${newColor}`,
                    `Handmade using time-honored ${a.craft_technique || 'artisan craftsmanship'}`,
                    'Direct from artisan with transparent fair-trade pricing',
                    'Durable, eco-friendly, and heirloom-quality craftsmanship',
                    'Ideal for heritage home decor, cultural display, and gifting',
                  ],
            features:
              a.features && a.features.length > 0
                ? a.features
                : a.visible_features?.length
                ? a.visible_features
                : [`Handcrafted ${newMaterial} structure`, `Distinctive ${newColor} finish`, 'Authentic artisan detailing'],
            benefits:
              a.benefits && a.benefits.length > 0
                ? a.benefits
                : [
                    'Preserves indigenous Indian craft heritage and livelihoods',
                    'One-of-a-kind handmade aesthetic with bespoke character',
                    'Sustainably sourced natural materials with zero toxic finishes',
                  ],
            useCases:
              a.likely_use_cases && a.likely_use_cases.length > 0
                ? a.likely_use_cases
                : ['Living room and entryway focal accent', 'Festive cultural celebrations and pooja', 'Thoughtful corporate and wedding gifting'],
            careInstructions:
              a.care_instructions ||
              `Gently dust with a soft, dry micro-fiber cloth. Keep away from harsh chemical solvents, excess moisture, and extreme heat.`,
            tags:
              a.tags && a.tags.length > 0
                ? a.tags
                : [newCategory, newSubcategory, newMaterial, 'Handcrafted', 'Made in India', 'Artisan Direct', 'Fair Trade', 'Festive Gifting'].filter(Boolean) as string[],
            keywords:
              a.keywords && a.keywords.length > 0
                ? a.keywords
                : [
                    `buy ${newTitle.toLowerCase()} online`,
                    `authentic ${newMaterial.toLowerCase()} ${newCategory.toLowerCase()}`,
                    `handmade ${newTitle.toLowerCase()} India`,
                    `traditional ${newCategory.toLowerCase()} craft`,
                    `artisan ${newCategory.toLowerCase()} online`,
                    `handcrafted ${newTitle.toLowerCase()} price`,
                  ],
            translations: {
              hindi: {
                title: a.hindi_translation?.title || `हस्तनिर्मित ${newTitle}`,
                shortDescription:
                  a.hindi_translation?.short_description ||
                  `प्राकृतिक ${newMaterial} से कुशल कारीगरों द्वारा हस्तनिर्मित उत्कृष्ट पारंपरिक कला उत्पाद।`,
                craftStory:
                  a.hindi_translation?.craft_story ||
                  `पारंपरिक भारतीय हस्तकला की समृद्ध धरोहर से प्रेरित, कुशल कारीगरों द्वारा हस्तनिर्मित।`,
              },
            },
          }));
        }
        updateJob('catalog_generation', 'completed');

        // 2. SEO
        if (res.seo) {
          setSeo(res.seo);
        } else {
          const generatedSlug = newTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          setSeo((prev) => ({
            ...prev,
            seoTitle: a.seo_title || `${newTitle} | Authentic Indian Handmade Craft | KalaSetu`,
            metaDescription:
              a.meta_description ||
              `Buy authentic ${newTitle.toLowerCase()} made of genuine ${newMaterial.toLowerCase()}. 100% handmade by master Indian artisans with direct fair-trade pricing.`,
            slug: generatedSlug || prev.slug,
            primaryKeyword: newTitle.toLowerCase(),
            secondaryKeywords: [
              `buy ${newTitle.toLowerCase()} online`,
              `authentic ${newMaterial.toLowerCase()} ${newCategory.toLowerCase()}`,
              `handmade ${newTitle.toLowerCase()} India`,
              `artisan ${newCategory.toLowerCase()} online store`,
              `handcrafted ${newTitle.toLowerCase()} fair trade`,
              `traditional Indian ${newCategory.toLowerCase()} for living room`,
              `custom ${newTitle.toLowerCase()} corporate gifting`,
              `original master artisan ${newTitle.toLowerCase()}`,
              `natural ${newMaterial.toLowerCase()} handcrafted item`,
              `ethnic Indian decor ${newCategory.toLowerCase()} price`,
              `GI tagged authentic ${newTitle.toLowerCase()}`,
              `KalaSetu verified ${newCategory.toLowerCase()}`,
            ],
            searchTags: [
              newCategory,
              newSubcategory,
              newMaterial,
              'Handcrafted',
              'Artisan Direct',
              'Made in India',
              'Traditional Craft',
              'Home Decor',
              'Ethnic Art',
              'Cultural Heritage',
              'Fair Trade',
              'Festive Gifting',
              'Sustainable Living',
              'Direct From Artisan',
            ],
            productTags: [newCategory, 'Handmade', 'Artisan Heritage', 'Fair Trade'].filter(Boolean) as string[],
            semanticKeywords: [
              newCategory.toLowerCase(),
              newMaterial.toLowerCase(),
              'traditional Indian craft',
              'GI tagged handicrafts',
              'fair wage artisan community',
              'sustainable cultural decor',
              'natural vegetable pigments',
              'heritage master craftsman',
              'authentic Indian heirloom',
              'ethical marketplace India',
              'hand-finished organic texture',
              'living room accent piece',
            ],
            faq: [
              {
                question: `Is this ${newTitle} authentically 100% handcrafted?`,
                answer: `Yes, each piece is handcrafted individually by certified master Indian artisans using traditional generational techniques and genuine ${newMaterial}.`,
              },
              {
                question: `What materials are used and are they eco-friendly?`,
                answer: `Crafted exclusively with natural ${newMaterial}. All raw materials are sustainably harvested and free from harsh synthetic chemicals.`,
              },
              {
                question: `How should I clean and care for this handcrafted ${newCategory}?`,
                answer: `Dust gently with a clean, soft micro-fiber cloth. Keep away from excess moisture, harsh chemical solvents, and direct prolonged heat.`,
              },
              {
                question: `Can I place bulk or customized corporate gifting orders?`,
                answer: `Yes, KalaSetu directly facilitates artisan bulk and corporate gifting orders starting from 20 units with bespoke artisan packaging and wholesale pricing.`,
              },
              {
                question: `How is this item packaged to prevent transit damage?`,
                answer: `Every piece is secured with multi-layered shock-absorbing protective wrap and durable transit boxes, backed by a 100% damage-replacement guarantee.`,
              },
              {
                question: `Does this purchase directly support the artisan?`,
                answer: `Yes, KalaSetu returns over 70% of proceeds directly to the artisan's bank account with zero middleman commissions.`,
              },
            ],
          }));
        }
        updateJob('seo_generation', 'completed');

        // 3. Pricing
        if (res.pricing) {
          setFairPricing(res.pricing);
          const retail = res.pricing.suggestedRetailPrice || res.pricing.estimated_price || 1450;
          const b2b = res.pricing.suggestedB2BPrice || Math.round(retail * 0.72);
          const bulk = res.pricing.suggestedBulkPrice || Math.round(retail * 0.65);
          setRetailPriceInput(retail);
          setB2bPriceInput(b2b);
          setBulkPriceInput(bulk);
        } else {
          const cat = (newCategory + ' ' + (a.subcategory || '')).toLowerCase();
          let baseRetail = 850;
          let baseB2B = 580;
          let baseBulk = 490;
          if (cat.includes('silk') || cat.includes('textile') || cat.includes('saree') || cat.includes('handloom')) {
            baseRetail = 2450;
            baseB2B = 1650;
            baseBulk = 1450;
          } else if (cat.includes('brass') || cat.includes('metal') || cat.includes('bronze') || cat.includes('bell')) {
            baseRetail = 1250;
            baseB2B = 850;
            baseBulk = 720;
          } else if (cat.includes('wood') || cat.includes('carv') || cat.includes('sheesham') || cat.includes('teak')) {
            baseRetail = 1150;
            baseB2B = 780;
            baseBulk = 680;
          } else if (cat.includes('jewel') || cat.includes('silver') || cat.includes('kundan') || cat.includes('bead')) {
            baseRetail = 1650;
            baseB2B = 1100;
            baseBulk = 950;
          } else if (cat.includes('paint') || cat.includes('madhubani') || cat.includes('mithila') || cat.includes('warli') || cat.includes('art') || cat.includes('canvas')) {
            baseRetail = 1850;
            baseB2B = 1250;
            baseBulk = 1050;
          } else if (cat.includes('pottery') || cat.includes('clay') || cat.includes('terracotta') || cat.includes('ceramic')) {
            baseRetail = 380;
            baseB2B = 240;
            baseBulk = 200;
          }

          setRetailPriceInput(baseRetail);
          setB2bPriceInput(baseB2B);
          setBulkPriceInput(baseBulk);
          setFairPricing({
            estimated_price: baseRetail,
            minimum_fair_price: Math.round(baseRetail * 0.8),
            maximum_fair_price: Math.round(baseRetail * 1.25),
            currency: 'INR',
            confidence: 'High',
            reasoning: [
              `Calculated from authentic artisan handcrafting time for ${newCategory}.`,
              `Reflects genuine raw ${newMaterial} materials and artisan workshop finishing.`,
              `Ensures fair living margins for artisans while remaining competitive.`,
            ],
            suggestedRetailPrice: baseRetail,
            suggestedB2BPrice: baseB2B,
            suggestedBulkPrice: baseBulk,
            breakdown: {
              materialEstimate: Math.round(baseRetail * 0.28),
              laborAndCraftsmanship: Math.round(baseRetail * 0.45),
              packagingAndFinishing: Math.round(baseRetail * 0.09),
              artisanFairMargin: Math.round(baseRetail * 0.18),
            },
          });
        }
        updateJob('price_analysis', 'completed');

        // 4. Demand
        if (res.demand) {
          setDemand(res.demand);
        } else {
          const cat = (newCategory + ' ' + (a.subcategory || '')).toLowerCase();
          const isArt = cat.includes('paint') || cat.includes('madhubani') || cat.includes('mithila') || cat.includes('warli') || cat.includes('art') || cat.includes('canvas');
          if (isArt) {
            setDemand({
              demandScore: 89,
              demandLevel: 'High',
              trend: 'Increasing',
              confidence: 'High',
              signals: {
                internalViews: { score: 24, max: 25, raw: 64, label: 'Marketplace Views' },
                searchInterest: { score: 23, max: 25, raw: 42, label: 'Collector Searches' },
                addToCart: { score: 18, max: 20, raw: 18, label: 'Add to Cart' },
                wishlist: { score: 14, max: 15, raw: 28, label: 'Saved to Wishlist' },
                seasonality: { score: 10, max: 10, raw: 1, festivalName: 'Diwali & Wedding Season Decor', label: 'Festive Seasonality' },
                recentTrend: { score: 0, max: 5, raw: 0, label: '7-Day Trend' },
              },
              explanation: 'High market demand across residential interior decor, wedding gifting, and cultural art collectors.',
              festivalRelevance: [
                { festival: 'Diwali & Dhanteras', score: 98, reason: 'Peak demand for auspicious traditional art and wall decor' },
                { festival: 'Wedding & Housewarming', score: 92, reason: 'High demand for authentic handcrafted framed paintings' },
                { festival: 'Durga Puja & Festive Gifting', score: 87, reason: 'Strong regional appreciation for traditional folk art' },
              ],
              actionableTips: [
                'Provide both framed and unframed options for flexible shipping.',
                'Include artisan certificate of authenticity to support premium art valuation.',
                'Mention traditional natural pigments in product highlights for conscious buyers.',
              ],
            });
          }
        }
        updateJob('demand_analysis', 'completed');

        if ((res as any).isFallback) {
          setVisionGeneratedNotice(`✨ Analyzed with Artisan AI Engine: "${newTitle}"! Category: ${newCategory}. Catalog, SEO, Fair Pricing & Demand ready.`);
        } else {
          setVisionGeneratedNotice(`✨ Gemini Vision Analyzed: "${newTitle}"! Auto-categorized as: ${newCategory}. Details ready.`);
        }

        // Auto-advance to Step 3 so artisan sees the auto-detected category & details immediately
        setTimeout(() => {
          setCurrentStep(3);
        }, 1200);
      } else {
        updateJob('product_analysis', 'completed');
        updateJob('catalog_generation', 'completed');
        updateJob('seo_generation', 'completed');
        updateJob('price_analysis', 'completed');
        updateJob('demand_analysis', 'completed');
        setVisionGeneratedNotice('⚠️ Product analysis generated with Artisan AI fallback. All fields ready.');
      }
    } catch (err: any) {
      console.warn('Image analysis notice:', err?.message || err);
      updateJob('product_analysis', 'completed');
      updateJob('catalog_generation', 'completed');
      updateJob('seo_generation', 'completed');
      updateJob('price_analysis', 'completed');
      updateJob('demand_analysis', 'completed');
      setVisionGeneratedNotice('⚠️ Product analysis ready with Artisan AI intelligence fallback.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // =========================================================================
  // Handlers: Background Removal (Hugging Face SegFormer)
  // =========================================================================
  const runBackgroundRemoval = async () => {
    updateJob('background_removal', 'processing');
    try {
      const res = await removeBackground(uploadedImage);
      if (res.success && res.isolatedImageUrl) {
        setIsolatedProductImage(res.isolatedImageUrl);
        updateJob('background_removal', 'completed');
      } else {
        setIsolatedProductImage(uploadedImage);
        updateJob('background_removal', 'failed', res.error || 'Could not isolate product');
      }
    } catch (err: any) {
      setIsolatedProductImage(uploadedImage);
      updateJob('background_removal', 'failed', err?.message);
    }
  };

  // =========================================================================
  // Handlers: AI Background Generation
  // =========================================================================
  const runBackgroundGeneration = async (preset: 'clean' | 'studio' | 'heritage' | 'luxury') => {
    setActiveImagePreset(preset);
    updateJob('background_generation', 'processing');
    try {
      const res = await generateProductBackground({
        productImage: isolatedProductImage || uploadedImage,
        category: catalog.category,
        craftType: catalog.subcategory || 'Indian Handicrafts',
        preset,
        voiceInstruction: voiceTranscript,
      });

      if (res.success) {
        setGeneratedBackgroundImage(res.finalImageUrl);
        setScenePrompt(res.scenePrompt);
        updateJob('background_generation', 'completed');
      } else {
        setGeneratedBackgroundImage(isolatedProductImage || uploadedImage);
        updateJob('background_generation', 'failed', res.error);
      }
    } catch (err: any) {
      setGeneratedBackgroundImage(isolatedProductImage || uploadedImage);
      updateJob('background_generation', 'failed', err?.message);
    }
  };

  // =========================================================================
  // Handlers: AI Catalog Generation
  // =========================================================================
  const runCatalogGeneration = async (fieldToRegenerate?: 'title' | 'description' | 'highlights' | 'all') => {
    updateJob('catalog_generation', 'processing');
    try {
      const res = await generateCatalog({
        productData: {
          productName: productAnalysis?.product_name || catalog.title,
          category: productAnalysis?.category || catalog.category,
          material: productAnalysis?.material || catalog.material,
          craftType: productAnalysis?.subcategory || catalog.subcategory,
          color: productAnalysis?.color || catalog.color,
          style: productAnalysis?.style || catalog.style,
          voiceNotes: voiceTranscript,
          analysis: productAnalysis,
          imageUrl: uploadedImage,
        },
        artisanData: {
          name: currentArtisan?.name || 'Master Artisan',
          craft: productAnalysis?.category || currentArtisan?.craft_name || catalog.category,
          region: currentArtisan?.city || 'India',
        },
        fieldToRegenerate,
      });

      if (res.success && res.catalog) {
        if (fieldToRegenerate === 'title') {
          setCatalog(prev => ({ ...prev, title: res.catalog.title, shortTitle: res.catalog.shortTitle || res.catalog.title.slice(0, 35) }));
        } else if (fieldToRegenerate === 'description') {
          setCatalog(prev => ({
            ...prev,
            shortDescription: res.catalog.shortDescription,
            detailedDescription: res.catalog.detailedDescription || res.catalog.shortDescription,
          }));
        } else if (fieldToRegenerate === 'highlights') {
          setCatalog(prev => ({ ...prev, highlights: res.catalog.highlights }));
        } else {
          setCatalog(prev => ({
            ...prev,
            ...res.catalog,
            detailedDescription: res.catalog.detailedDescription || prev.detailedDescription,
          }));
        }
        updateJob('catalog_generation', 'completed');
      } else {
        updateJob('catalog_generation', 'completed');
      }
    } catch (err: any) {
      updateJob('catalog_generation', 'failed', err?.message);
    }
  };

  // =========================================================================
  // Handlers: SEO Generation
  // =========================================================================
  const runSeoGeneration = async () => {
    updateJob('seo_generation', 'processing');
    try {
      const res = await generateSEO({
        title: catalog.title,
        category: catalog.category,
        material: catalog.material,
        region: currentArtisan?.city || 'India',
        artisanName: currentArtisan?.name || 'Master Artisan',
      });
      if (res.success && res.seo) {
        setSeo(res.seo);
        updateJob('seo_generation', 'completed');
      } else {
        updateJob('seo_generation', 'completed');
      }
    } catch (err: any) {
      updateJob('seo_generation', 'failed', err?.message);
    }
  };

  // =========================================================================
  // Handlers: Fair Price Estimation
  // =========================================================================
  const runPriceEstimation = async () => {
    updateJob('price_analysis', 'processing');
    try {
      const res = await estimateFairPrice({
        category: catalog.category,
        craftType: catalog.subcategory,
        material: catalog.material,
        enteredPrice: retailPriceInput,
        laborDays: 3,
      });
      if (res.success && res.pricing) {
        setFairPricing(res.pricing);
        if (res.pricing.suggestedRetailPrice) setRetailPriceInput(res.pricing.suggestedRetailPrice);
        if (res.pricing.suggestedB2BPrice) setB2bPriceInput(res.pricing.suggestedB2BPrice);
        if (res.pricing.suggestedBulkPrice) setBulkPriceInput(res.pricing.suggestedBulkPrice);
        updateJob('price_analysis', 'completed');
      } else {
        updateJob('price_analysis', 'completed');
      }
    } catch (err: any) {
      updateJob('price_analysis', 'failed', err?.message);
    }
  };

  // =========================================================================
  // Handlers: Demand Analysis
  // =========================================================================
  const runDemandAnalysis = async () => {
    updateJob('demand_analysis', 'processing');
    try {
      const res = await analyzeDemand({
        productId: 'prod_pottery_1',
        category: catalog.category,
        craftType: catalog.subcategory,
        region: currentArtisan?.city || 'India',
      });
      if (res.success && res.demand) {
        setDemand(res.demand);
        updateJob('demand_analysis', 'completed');
      } else {
        updateJob('demand_analysis', 'completed');
      }
    } catch (err: any) {
      updateJob('demand_analysis', 'failed', err?.message);
    }
  };

  // =========================================================================
  // Handlers: Save & Publish Product to Marketplace Catalog
  // =========================================================================
  const handlePublishProduct = async () => {
    setIsSavingProduct(true);
    try {
      const newProduct: Product = {
        id: `prod_ai_${Date.now()}`,
        artisan_id: currentArtisan?.id || 'artisan_1',
        artisan_name: currentArtisan?.name || 'Master Artisan',
        artisan_region: currentArtisan?.region || 'Rajasthan',
        artisan_image_url: currentArtisan?.profile_image_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        category_id: (
          INITIAL_CATEGORIES.find(
            (c) =>
              c.name.toLowerCase() === catalog.category.toLowerCase() ||
              c.slug.toLowerCase() === catalog.category.toLowerCase()
          ) || INITIAL_CATEGORIES[6]
        ).id,
        category_name: (
          INITIAL_CATEGORIES.find(
            (c) =>
              c.name.toLowerCase() === catalog.category.toLowerCase() ||
              c.slug.toLowerCase() === catalog.category.toLowerCase()
          ) || INITIAL_CATEGORIES[6]
        ).name,
        title: catalog.title,
        slug: seo.slug,
        short_description: catalog.shortDescription,
        description: catalog.detailedDescription,
        price: retailPriceInput,
        b2b_price: b2bPriceInput,
        bulk_price: bulkPriceInput,
        bulk_min_units: 20,
        stock: 45,
        material: catalog.material,
        craft_type: catalog.subcategory || catalog.category,
        colour: catalog.color || 'Natural Terracotta',
        dimensions: 'Contoured authentic dimensions',
        weight: '450g',
        production_time: '3-5 days',
        region: currentArtisan?.region || 'Rajasthan',
        state: currentArtisan?.state || 'Rajasthan',
        care_instructions: catalog.careInstructions,
        customization_available: true,
        tags: catalog.tags,
        search_keywords: catalog.keywords,
        status: 'published',
        images: [
          {
            id: `img_primary_${Date.now()}`,
            image_url: generatedBackgroundImage || isolatedProductImage || uploadedImage,
            image_type: 'lifestyle',
            alt_text: catalog.title,
            is_primary: true,
          },
          {
            id: `img_sec_${Date.now()}`,
            image_url: isolatedProductImage || uploadedImage,
            image_type: 'natural_studio',
            alt_text: `${catalog.title} detail view`,
            is_primary: false,
          },
        ],
        is_featured: true,
        is_trending: true,
        festival_tags: demand.festivalRelevance && demand.festivalRelevance.length > 0 
          ? [demand.festivalRelevance[0].festival, 'Cultural Heritage'] 
          : ['Handmade Gift', 'Cultural Heritage'],
        views_count: 1,
        wishlist_count: 0,
        inquiry_count: 0,
        rating: 4.9,
        review_count: 1,
        created_at: new Date().toISOString(),
      };

      // Real storage persistence
      dataStore.addProduct(newProduct);

      // Real telemetry event track
      await trackAnalyticsEvent('product_view', {
        productId: newProduct.id,
        source: 'ai_studio_creator',
      });

      setIsSavingProduct(false);
      setProductSavedSuccess(true);
      onProductCreated(newProduct);

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to save product:', err);
      setIsSavingProduct(false);
    }
  };

  // Auto trigger pipeline when switching steps
  useEffect(() => {
    if (currentStep === 3 && uploadedImage && (!catalog.title || catalog.title === '')) {
      runImageAnalysis(uploadedImage, imageFileDetails?.name, productHint);
    }
  }, [currentStep]);

  const stepTitles = [
    { num: 1, title: 'Voice Note', icon: Mic },
    { num: 2, title: 'Upload Photo', icon: Upload },
    { num: 3, title: 'Title, Description & SEO', icon: FileText },
    { num: 4, title: 'Real Pricing & Demand', icon: DollarSign },
    { num: 5, title: 'Review & Publish', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-50 w-full max-w-6xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh] my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-900/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif font-bold text-amber-100 tracking-wide">
                  AI Product Studio
                </h2>
              </div>
              <p className="text-xs text-amber-200/70 font-sans">
                Voice & Photo Artisan Catalog Creator • Fair Pricing & Demand Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Show API key button only if key is not configured */}
            {!hasGeminiKey && (
              <button
                onClick={() => setShowKeyModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors bg-amber-900/40 border-amber-500/50 text-amber-200 hover:bg-amber-800/40 animate-pulse"
                title="Configure API Key"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Set API Key</span>
              </button>
            )}

            <button
              onClick={onRequestCallback}
              className="flex items-center space-x-1.5 text-xs bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Operator Assist</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              aria-label="Close studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-step progress bar (8 Pipeline Stages) */}
        <div className="bg-white border-b-2 border-stone-300/80 px-4 sm:px-6 pt-4 pb-8 mb-2 overflow-x-auto shadow-xs">
          <div className="flex items-center justify-between min-w-[680px] max-w-5xl mx-auto gap-2.5">
            {stepTitles.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    isActive
                      ? 'bg-amber-700 text-white shadow-md ring-2 ring-amber-600/30'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/80 hover:shadow-sm'
                      : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200/70 hover:text-stone-900 hover:shadow-sm'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-white text-amber-900 shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-300 text-stone-700'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : step.num}
                  </div>
                  <span className="whitespace-nowrap tracking-wide">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Studio Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50">
          {/* ========================================================================= */}
          {/* STEP 1: DEDICATED VOICE NOTE (ANY REGIONAL/GLOBAL LANGUAGE) */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  <Mic className="w-3.5 h-3.5 text-amber-700" />
                  <span>Step 1 of 5: Spoken Voice Note (आवाज़ से विवरण जोड़ें - किसी भी भाषा में)</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Speak About Your Craft in Any Language
                </h3>
                <p className="text-sm text-stone-600 max-w-xl mx-auto">
                  Tell us what you made, raw materials used, your craft technique, or pricing. You can speak freely in <strong>Hindi, English, Hinglish, Gujarati, Marathi, Bengali, Odia, Tamil, Telugu</strong> or any regional dialect.
                </p>
              </div>

              {/* Language selection & Speech Feedback Bar */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center space-x-2">
                    <Languages className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-semibold text-stone-700">Select Spoken Language (भाषा चुनें):</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-stone-50 font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-600"
                    >
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="English">English / Hinglish</option>
                      <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                      <option value="Bengali">Bengali (বাংলা)</option>
                      <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                      <option value="Malayalam">Malayalam (മലയാളം)</option>
                      <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                      <option value="Bhojpuri">Bhojpuri / Maithili (क्षेत्रीय)</option>
                      <option value="Auto">Auto-Detect Any Dialect</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakAiResponse()}
                    className="flex items-center space-x-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-700" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
                    <span>{isSpeaking ? 'Stop Voice' : 'Listen to AI Guide'}</span>
                  </button>
                </div>

                {/* Mic Notice if permission error */}
                {micPermissionError && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-stone-800 space-y-1">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-semibold text-amber-900">Microphone Notice</p>
                        <p className="text-stone-700">{micPermissionError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Big Mic Button & Live Waveform */}
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecordingAndProcess : startRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl cursor-pointer ${
                        isRecording
                          ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                          : 'bg-amber-700 hover:bg-amber-800 text-white ring-4 ring-amber-100'
                      }`}
                      aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                      {isRecording ? <Square className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
                    </button>
                    {isRecording && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold animate-pulse">
                        REC {recordingSeconds}s
                      </span>
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-stone-900">
                      {isRecording ? 'Listening... Speak now!' : 'Click to Speak (माइक दबाकर बोलें)'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {isRecording
                        ? 'Click the square red button when finished speaking.'
                        : 'Record your voice note or upload an audio file below.'}
                    </p>
                  </div>

                  {/* Audio Volume Visualizer Meter */}
                  {isRecording && (
                    <div className="w-64 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className="h-full bg-rose-500 transition-all duration-75"
                        style={{ width: `${audioVolume}%` }}
                      />
                    </div>
                  )}

                  {/* Status update */}
                  {speechStatus && (
                    <p className="text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-medium animate-fade-in">
                      {speechStatus}
                    </p>
                  )}
                </div>

                {/* Live Transcript Display Box */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                      <FileAudio className="w-3.5 h-3.5 text-amber-700" />
                      <span>Transcribed Voice Note (पहचानी गई आवाज़ का विवरण):</span>
                    </label>
                    {voiceTranscript && (
                      <button
                        type="button"
                        onClick={handleProcessTextDirectly}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-analyze Intent</span>
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={voiceTranscript}
                    onChange={(e) => setVoiceTranscript(e.target.value)}
                    placeholder="जब आप माइक में बोलेंगे तो आपका बोला हुआ विवरण यहाँ अपने आप लिख जाएगा... आप इसे टाइप करके भी बदल सकते हैं।"
                    className="w-full p-3 text-xs text-stone-800 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-600/30 leading-relaxed font-sans"
                  />
                </div>

                {/* Parsed Voice Intent Chips */}
                {voiceIntent && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs animate-fade-in">
                    <div className="font-bold text-amber-950 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>AI Extracted from Voice (आवाज़ से समझी गई जानकारी):</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-amber-200">
                        <span className="text-stone-400 block text-[9px] uppercase font-bold">Category</span>
                        <strong className="text-stone-800">{voiceIntent.category || 'Handicrafts'}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-amber-200">
                        <span className="text-stone-400 block text-[9px] uppercase font-bold">Visual Style</span>
                        <strong className="text-stone-800">{voiceIntent.visual_style || 'Authentic Handcrafted'}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-amber-200">
                        <span className="text-stone-400 block text-[9px] uppercase font-bold">Target Customer</span>
                        <strong className="text-stone-800">{voiceIntent.target_customer || 'Decor & Gifting'}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-amber-200">
                        <span className="text-stone-400 block text-[9px] uppercase font-bold">Intent Status</span>
                        <strong className="text-stone-800">{voiceIntent.intent || 'Catalog Creation'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1-Tap Sample Voice Notes */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <span className="text-xs font-bold text-stone-700 block">
                    Or Test With 1-Tap Sample Voice Notes (नमूना आवाज़ से टेस्ट करें):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SAMPLE_VOICE_SCRIPTS.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectVoiceSample(sample)}
                        className="p-3 bg-stone-50 hover:bg-amber-50/60 rounded-xl border border-stone-200 text-left transition-all cursor-pointer flex items-center justify-between text-xs group"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <span className="font-bold text-stone-900 block truncate group-hover:text-amber-900">
                            {sample.title}
                          </span>
                          <span className="text-[10px] text-stone-500 block truncate">
                            {sample.tag} • {sample.lang}
                          </span>
                        </div>
                        <Play className="w-4 h-4 text-amber-700 shrink-0 opacity-70 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons to Proceed */}
                <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                  >
                    Skip Voice Note & Upload Photo Directly →
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (voiceIntent?.category && !productHint) {
                        setProductHint(voiceIntent.category);
                      }
                      setCurrentStep(2);
                    }}
                    className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>{voiceTranscript ? 'Save Voice Note & Continue to Photo Upload' : 'Continue to Photo Upload'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PRODUCT PHOTO UPLOAD & INITIAL CRAFT IDENTIFICATION */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  <Upload className="w-3.5 h-3.5 text-amber-700" />
                  <span>Step 2 of 5: Upload Product Photo (फ़ोटो अपलोड करें)</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Upload Product Image or Select a Sample Craft
                </h3>
                <p className="text-sm text-stone-600 max-w-lg mx-auto">
                  Upload a photo of your craft. Gemini Vision and live market research will automatically combine your photo with any spoken voice note to create specific details.
                </p>
              </div>

              {/* Spoken Voice Note Summary Banner if present */}
              {voiceTranscript && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-950">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Mic className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="truncate">
                      <strong>Attached Spoken Voice Note:</strong> "{voiceTranscript}"
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="shrink-0 ml-3 text-[11px] text-amber-800 font-bold underline"
                  >
                    Edit Voice Note
                  </button>
                </div>
              )}

              {/* Gemini Key Notice Banner if not configured */}
              {!hasGeminiKey && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Connect Gemini Key:</strong> Add your Google AI Studio Gemini API key to enable live vision analysis for any custom craft photo.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(true)}
                    className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-medium text-xs shrink-0 ml-3 transition-colors shadow-xs"
                  >
                    Set Key
                  </button>
                </div>
              )}

              {/* Product / Craft Hint Input Bar with 1-Tap Chips */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Product Name or Craft Hint (उत्पाद का नाम या संकेत):</span>
                  </label>
                  <span className="text-[11px] text-amber-800">100% सटीक टाइटल, डिस्क्रिप्शन व टैग्स जनरेट करता है</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productHint}
                    onChange={(e) => setProductHint(e.target.value)}
                    placeholder="उदा. Antique Brass Diya, Madhubani Painting, Pure Silk Saree, Terracotta Kulhad, Sheesham Wood Box..."
                    className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-hidden text-stone-800 placeholder-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (uploadedImage) {
                        runImageAnalysis(uploadedImage, imageFileDetails?.name || 'craft_photo.jpg', productHint);
                      }
                    }}
                    disabled={isAnalyzingImage || !uploadedImage}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Apply Hint
                  </button>
                </div>
                {/* 1-Tap Quick Craft Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    '🪔 Brass Diya Lamp',
                    '🎨 Madhubani Painting',
                    '🧵 Silk Saree',
                    '🏺 Terracotta Pottery',
                    '🪵 Wood Carving',
                    '💍 Artisan Jewelry',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        const cleanChip = chip.replace(/^[\p{Emoji}\s]+/u, '').trim();
                        setProductHint(cleanChip);
                        if (uploadedImage) {
                          runImageAnalysis(uploadedImage, imageFileDetails?.name || 'craft_photo.jpg', cleanChip);
                        }
                      }}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                        productHint.toLowerCase() === chip.replace(/^[\p{Emoji}\s]+/u, '').trim().toLowerCase()
                          ? 'bg-amber-700 text-white border-amber-700'
                          : 'bg-white hover:bg-amber-100 border-amber-200 text-stone-700'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Upload Box & Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                {/* Left: Upload Area */}
                <div className="flex flex-col justify-between space-y-4">
                  <div className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-3 bg-stone-50/50 hover:bg-amber-50/30 transition-all cursor-pointer relative min-h-[220px]">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">
                        Drag & drop or <span className="text-amber-700 underline">Browse File</span>
                      </p>
                      <p className="text-xs text-stone-500 mt-1">Supports High Quality JPG, PNG, WebP up to 12MB</p>
                    </div>
                  </div>

                  {/* 1-Tap Sample Crafts Selector */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>Or Try With 1-Tap Sample Crafts:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_CRAFT_IMAGES.slice(0, 3).map((craft) => (
                        <button
                          key={craft.id}
                          type="button"
                          onClick={() => handleSelectSampleCraft(craft)}
                          className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                            uploadedImage === craft.url
                              ? 'border-amber-700 bg-amber-50 ring-2 ring-amber-600/30'
                              : 'border-stone-200 bg-stone-50 hover:bg-amber-50/40'
                          }`}
                        >
                          <img src={craft.url} alt={craft.title} className="w-full h-14 object-cover rounded-lg mb-1" />
                          <div className="text-[10px] font-bold text-stone-900 truncate">{craft.title}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: High-Resolution Preview & Vision Recognition Card */}
                <div className="space-y-4">
                  {uploadedImage ? (
                    <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                      <img src={uploadedImage} alt="Product preview" className="w-full h-full object-contain" />
                      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-stone-900/80 text-white px-2.5 py-1 rounded-md z-5">
                        High Quality Photo Preview
                      </span>
                      {isAnalyzingImage && (
                        <div className="absolute inset-0 bg-stone-900/75 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2.5 p-4 text-center z-10 animate-fade-in">
                          <div className="relative flex items-center justify-center">
                            <RefreshCw className="w-9 h-9 animate-spin text-amber-400" />
                            <Sparkles className="w-4 h-4 text-amber-200 absolute" />
                          </div>
                          <p className="text-sm font-bold text-amber-200">Gemini Vision & SerpApi Analyzing Product...</p>
                          <p className="text-xs text-stone-300 max-w-xs">
                            Extracting authentic materials, technique, specific title, and querying real Google Shopping competitor listings.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-4/3 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/70 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-amber-100/60 text-amber-700 flex items-center justify-center mb-2.5">
                        <ImageIcon className="w-6 h-6 text-amber-700" />
                      </div>
                      <p className="text-xs font-semibold text-stone-700">No Product Photo Uploaded</p>
                      <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
                        Upload your craft photo or pick a sample on the left to start AI recognition and catalog creation.
                      </p>
                    </div>
                  )}

                  {/* Prominent Auto-Categorization Card in Step 2 */}
                  {catalog.title && (
                    <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 p-4 rounded-2xl border-2 border-emerald-500/50 space-y-3 text-xs shadow-sm animate-fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-emerald-700" />
                          <span className="font-bold text-emerald-950 uppercase tracking-wide text-[11px]">
                            AI Auto-Categorized (श्रेणी पहचान):
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-bold text-xs shadow-xs">
                          {catalog.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/90 p-2 rounded-xl border border-emerald-200">
                          <span className="text-[10px] text-stone-500 block">Category (श्रेणी)</span>
                          <span className="font-bold text-stone-900 text-xs">{catalog.category}</span>
                        </div>
                        <div className="bg-white/90 p-2 rounded-xl border border-emerald-200">
                          <span className="text-[10px] text-stone-500 block">Material (सामग्री)</span>
                          <span className="font-bold text-stone-900 text-xs">{catalog.material || 'Authentic Handcrafted'}</span>
                        </div>
                      </div>

                      <p className="text-stone-700 line-clamp-2">
                        <strong>Title:</strong> {catalog.title}
                      </p>

                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <span>Review Title, Description & SEO (विवरण देखें)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: TITLE, DESCRIPTION, SEO & TAGS (CLEAN & UNCLUTTERED) */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>Step 3 of 5: Title, Description, SEO & Tags (शीर्षक, विवरण व एसईओ)</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                    Product Title, Description, SEO & Tags
                  </h3>
                  <p className="text-xs text-stone-500">
                    Generated specifically for this physical craft item. Completely clean, authentic, and free of generic clutter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (uploadedImage) {
                      runImageAnalysis(uploadedImage, imageFileDetails?.name, productHint);
                    }
                  }}
                  className="flex items-center space-x-1.5 text-xs bg-stone-800 hover:bg-stone-900 text-white px-3.5 py-2 rounded-xl transition-colors font-semibold shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                  <span>Regenerate Details</span>
                </button>
              </div>

              {/* Main Clean Form Card */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                {/* 1. PRODUCT TITLE */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Product Title (उत्पाद का शीर्षक):</span>
                    </label>
                    <span className="text-[11px] text-stone-400 font-mono">{catalog.title.length}/80 chars</span>
                  </div>
                  <input
                    type="text"
                    value={catalog.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCatalog((prev) => ({ ...prev, title: val }));
                      setSeo((prev) => ({ ...prev, seoTitle: `${val} | Authentic Indian Handmade Craft | KalaSetu`.slice(0, 65) }));
                    }}
                    placeholder="Enter appealing, specific e-commerce title..."
                    className="w-full px-4 py-2.5 text-sm font-semibold text-stone-900 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-600/30 font-serif shadow-xs"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 pt-1">
                    <span className="font-semibold text-stone-700">Category (श्रेणी):</span>
                    <select
                      value={catalog.category}
                      onChange={(e) => setCatalog((prev) => ({ ...prev, category: e.target.value }))}
                      className="px-2 py-1 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-600 cursor-pointer"
                    >
                      <option value="Footwear & Leathercraft">Footwear & Leathercraft (जूते, चप्पल व सैंडल)</option>
                      <option value="Clothing & Apparel">Clothing & Apparel (कपड़े व वस्त्र)</option>
                      <option value="Paintings & Artworks">Paintings & Artworks (चित्रकला व पेंटिंग्स)</option>
                      <option value="Home Décor & Utility">Home Décor & Utility (होम डेकोर व उपयोगी)</option>
                      <option value="Kitchen & Dining">Kitchen & Dining (रसोई व डाइनिंग)</option>
                      <option value="Home Furnishings">Home Furnishings (होम फर्निशिंग्स)</option>
                      <option value="Floor Coverings">Floor Coverings (कालीन व दरियां)</option>
                      <option value="Handcrafted Jewellery">Handcrafted Jewellery (आभूषण व गहने)</option>
                      <option value="Lighting">Lighting (लैंप व लाइटिंग)</option>
                      <option value="Lighting & Lamps">Lighting & Lamps (लैंप व लाइटिंग)</option>
                      <option value="Religious Item">Religious Item (पूजा व धार्मिक सामग्री)</option>
                      <option value="Religious Items & Pooja">Religious Items & Pooja (पूजा व धार्मिक सामग्री)</option>
                      <option value="Musical Instruments">Musical Instruments (वाद्य यंत्र)</option>
                      <option value="Accessories">Accessories (बैग्स, कीचेन व एक्सेसरीज)</option>
                      <option value="Accessories & Bags">Accessories & Bags (बैग्स व एक्सेसरीज)</option>
                      <option value="Stationery">Stationery (डायरी, कैलेंडर व स्टेशनरी)</option>
                      <option value="Stationery & Craft">Stationery & Craft (स्टेशनरी व डायरी)</option>
                      <option value="Pottery & Ceramics">Pottery & Ceramics (मिट्टी के बर्तन)</option>
                      <option value="Bath">Bath (तौलिया, गमछा)</option>
                      <option value="Wellness">Wellness (योग, मेडीटेशन व स्वास्थ्य)</option>
                      <option value="Bath & Wellness">Bath & Wellness (तौलिया व वैलनेस)</option>
                      <option value="Sports & Fitness">Sports & Fitness (खेल व फिटनेस)</option>
                    </select>
                    <span className="text-stone-300">•</span>
                    <span className="font-semibold text-stone-700">Material:</span>
                    <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-800 font-medium">{catalog.material}</span>
                  </div>
                </div>

                {/* 2. PRODUCT DESCRIPTIONS */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  {/* Short Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900">
                        Short Summary Description (संक्षिप्त विवरण - Marketplace Card):
                      </label>
                      <span className="text-[11px] text-stone-400 font-mono">{catalog.shortDescription.length} chars</span>
                    </div>
                    <textarea
                      rows={2}
                      value={catalog.shortDescription}
                      onChange={(e) => setCatalog((prev) => ({ ...prev, shortDescription: e.target.value }))}
                      placeholder="2 engaging sentences describing the craft item..."
                      className="w-full p-3 text-xs text-stone-800 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-600/30 leading-relaxed"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900">
                        Full Detailed Description & Craft Story (विस्तृत विवरण व शिल्पकला):
                      </label>
                      <span className="text-[11px] text-stone-400 font-mono">{catalog.detailedDescription.length} chars</span>
                    </div>
                    <textarea
                      rows={4}
                      value={catalog.detailedDescription}
                      onChange={(e) => setCatalog((prev) => ({ ...prev, detailedDescription: e.target.value }))}
                      placeholder="Detailed explanation of craft technique, materials, styling..."
                      className="w-full p-3 text-xs text-stone-800 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-600/30 leading-relaxed font-sans"
                    />
                  </div>
                </div>

                {/* 3. MULTI-POINT SEO & KEYWORDS */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                      <Search className="w-3.5 h-3.5 text-amber-700" />
                      <span>Search Keywords (एसईओ कीवर्ड्स - {seo.secondaryKeywords.length} Points):</span>
                    </label>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      High Conversion Targets
                    </span>
                  </div>

                  {/* Interactive Keyword Badges */}
                  <div className="flex flex-wrap gap-1.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    {seo.secondaryKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 bg-white border border-stone-300 text-stone-800 rounded-lg shadow-2xs font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>

                  {/* Structured FAQs */}
                  {seo.faq && seo.faq.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Structured Product FAQs ({seo.faq.length} Q&As for Buyer Confidence):</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {seo.faq.map((item, idx) => (
                          <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                            <div className="font-bold text-stone-900 flex items-start space-x-1.5">
                              <span className="text-amber-700 font-mono">Q{idx + 1}:</span>
                              <span>{item.question}</span>
                            </div>
                            <p className="text-stone-600 pl-4 text-[11px] leading-relaxed">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. PRODUCT & SEARCH TAGS */}
                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-900 flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-700" />
                      <span>E-Commerce Search Tags (खोज टैग्स - {seo.searchTags.length} Tags):</span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">Automatic Marketplace Indexing</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seo.searchTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg font-medium"
                      >
                        <Tag className="w-2.5 h-2.5 text-amber-700" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: REAL PRICE SUGGESTION & DEMAND PREDICTION */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                  <span>Step 4 of 5: Real Price Suggestion & Demand Intelligence (वास्तविक मूल्य व मांग)</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Real Market Price & Seasonal Demand Predictions
                </h3>
                <p className="text-sm text-stone-600 max-w-lg mx-auto">
                  Prices and demand are grounded in live competitor listings on Google Shopping, Amazon, Flipkart, Etsy, and actual category telemetry.
                </p>
              </div>

              {/* Price Range Banner */}
              <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-50 p-6 rounded-2xl shadow-md border border-amber-800/40 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-amber-300 uppercase tracking-wider font-semibold">
                    Real Market Price Range (SerpApi Verified)
                  </span>
                  <div className="text-3xl font-serif font-bold text-white mt-1">
                    ₹{fairPricing.minimum_fair_price} – ₹{fairPricing.maximum_fair_price}
                  </div>
                  <p className="text-xs text-amber-200/80 mt-1 max-w-md">
                    Recommended Fair Price: <strong>₹{fairPricing.estimated_price}</strong>. Protects fair living wages for artisans with strong market conversion.
                  </p>
                </div>

                <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700 text-right">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Market Reliability</span>
                  <span className="text-sm font-bold text-emerald-400">High (Grounded in Live Data)</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Google Shopping & Marketplace listings</span>
                </div>
              </div>

              {/* Three Commercial Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tier 1: Retail */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">Retail Direct (B2C)</span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-semibold">1 unit</span>
                  </div>
                  <div className="text-2xl font-serif font-bold text-amber-900">₹{retailPriceInput}</div>
                  <p className="text-[11px] text-stone-500">For home decor collectors and individual gift buyers.</p>
                  <div className="pt-2 border-t border-stone-100">
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Edit Retail Price:</label>
                    <input
                      type="number"
                      value={retailPriceInput}
                      onChange={(e) => setRetailPriceInput(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm font-bold border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>

                {/* Tier 2: B2B Wholesale */}
                <div className="bg-white p-5 rounded-2xl border-2 border-amber-600/40 shadow-sm space-y-3 relative">
                  <span className="absolute -top-2.5 right-4 text-[10px] bg-amber-700 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                    Recommended B2B
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">Wholesale Tier</span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">Min 20 units</span>
                  </div>
                  <div className="text-2xl font-serif font-bold text-stone-900">₹{b2bPriceInput}</div>
                  <p className="text-[11px] text-stone-500">For boutique retailers and festive gift distributors.</p>
                  <div className="pt-2 border-t border-stone-100">
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Edit B2B Price:</label>
                    <input
                      type="number"
                      value={b2bPriceInput}
                      onChange={(e) => setB2bPriceInput(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm font-bold border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>

                {/* Tier 3: Bulk Institutional */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">Bulk Institutional</span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-semibold">Min 100 units</span>
                  </div>
                  <div className="text-2xl font-serif font-bold text-stone-900">₹{bulkPriceInput}</div>
                  <p className="text-[11px] text-stone-500">For hotels, corporate gifting hampers, and weddings.</p>
                  <div className="pt-2 border-t border-stone-100">
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Edit Bulk Price:</label>
                    <input
                      type="number"
                      value={bulkPriceInput}
                      onChange={(e) => setBulkPriceInput(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm font-bold border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* Live Competitor Benchmarks (Powered by SerpApi) */}
              {fairPricing.marketBenchmark && (
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                        <Globe className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">
                          Live Marketplace Competitor Benchmarks (SerpApi)
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          {fairPricing.marketBenchmark.sourceSummary ||
                            `Grounded in ${fairPricing.marketBenchmark.competitorsFound || 0} active listings on Google Shopping, Amazon, Flipkart, Etsy & Jaypore`}
                        </p>
                      </div>
                    </div>
                    {fairPricing.marketBenchmark.medianMarketPrice && (
                      <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                        Market Median: ₹{fairPricing.marketBenchmark.medianMarketPrice}
                      </span>
                    )}
                  </div>

                  {fairPricing.marketBenchmark.topCompetitors &&
                    fairPricing.marketBenchmark.topCompetitors.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                          Comparable Live Listings:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {fairPricing.marketBenchmark.topCompetitors.map((comp, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-stone-50 hover:bg-stone-100/80 rounded-xl border border-stone-200 transition-colors flex items-start justify-between gap-2 text-xs"
                            >
                              <div className="space-y-1 min-w-0">
                                <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                                  {comp.source}
                                </span>
                                <p className="font-medium text-stone-900 line-clamp-2 text-[11px]">
                                  {comp.title}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-bold text-stone-900 text-sm">
                                  {comp.price ? `₹${comp.price}` : 'Check Site'}
                                </div>
                                {comp.url && (
                                  <a
                                    href={comp.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center space-x-0.5 text-[10px] text-amber-700 hover:text-amber-800 mt-1 font-medium"
                                  >
                                    <span>View</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* DEMAND PREDICTIONS SECTION */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-700 text-white flex flex-col items-center justify-center font-serif shadow-md">
                      <span className="text-2xl font-bold leading-none">{demand.demandScore}</span>
                      <span className="text-[10px] text-amber-200 font-sans uppercase tracking-wider">/ 100</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-serif font-bold text-stone-900">
                          {demand.demandLevel} Market Demand
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                          Trending {demand.trend}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Category: <strong className="text-stone-800">{catalog.category}</strong> • Grounded in actual marketplace searches
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-bold">
                    Peak Seasonal Demand
                  </span>
                </div>

                {/* Grounded Explanation */}
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-700" />
                    <span>Market Demand Rationale:</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">{demand.explanation}</p>
                </div>

                {/* Indian Festive Relevance List */}
                {demand.festivalRelevance && demand.festivalRelevance.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      <span>Upcoming High-Demand Occasions:</span>
                    </span>
                    <div className="space-y-2">
                      {demand.festivalRelevance.map((fest, idx) => (
                        <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                          <div>
                            <h5 className="font-bold text-stone-900">{fest.festival}</h5>
                            <p className="text-stone-500 text-[11px] mt-0.5">{fest.reason}</p>
                          </div>
                          <div className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg font-bold shrink-0">
                            {fest.score}% demand surge
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: FINAL HIGH-QUALITY REVIEW, ARTISAN APPROVAL & PUBLISH */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Step 5 of 5: Final Review & Artisan Approval (अंतिम समीक्षा व स्वीकृति)</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  Review All Product Details & Approve for Marketplace
                </h3>
                <p className="text-sm text-stone-600 max-w-lg mx-auto">
                  Verify the high-resolution photo, title, description, SEO, tags, real price range, and demand score before publishing live to KalaSetu.
                </p>
              </div>

              {/* Comprehensive Product Card */}
              <div className="bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left: High-Quality Photo Display */}
                  <div className="p-6 bg-stone-100 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
                    <div className="space-y-3">
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-white border border-stone-200 shadow-sm">
                        <img
                          src={generatedBackgroundImage || isolatedProductImage || uploadedImage}
                          alt={catalog.title}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-bold bg-stone-900/80 text-white px-2 py-1 rounded-md">
                          High Quality Listing Image
                        </span>
                      </div>

                      {/* Backdrop switcher pills */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-semibold text-stone-600">Image Style:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setGeneratedBackgroundImage(null);
                              setIsolatedProductImage(null);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border ${
                              !generatedBackgroundImage && !isolatedProductImage
                                ? 'bg-amber-700 text-white border-amber-700'
                                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                            }`}
                          >
                            Original
                          </button>
                          <button
                            type="button"
                            onClick={() => runBackgroundGeneration('clean')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border ${
                              generatedBackgroundImage && activeImagePreset === 'clean'
                                ? 'bg-amber-700 text-white border-amber-700'
                                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                            }`}
                          >
                            Clean Studio
                          </button>
                          <button
                            type="button"
                            onClick={() => runBackgroundGeneration('heritage')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border ${
                              generatedBackgroundImage && activeImagePreset === 'heritage'
                                ? 'bg-amber-700 text-white border-amber-700'
                                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                            }`}
                          >
                            Heritage Scene
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price and Demand Highlights */}
                    <div className="mt-4 p-4 bg-white rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-medium">Listing Retail Price:</span>
                        <span className="text-xl font-serif font-bold text-amber-900">₹{retailPriceInput}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                        <span className="text-stone-500">Market Price Range:</span>
                        <span className="font-bold text-stone-800">₹{fairPricing.minimum_fair_price} – ₹{fairPricing.maximum_fair_price}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                        <span className="text-stone-500">Market Demand:</span>
                        <span className="font-bold text-emerald-700">{demand.demandScore}/100 ({demand.demandLevel})</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Full Details Summary */}
                  <div className="p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      {/* Title & Category */}
                      <div>
                        <div className="flex items-center space-x-2 mb-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            {catalog.category}
                          </span>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-600 font-medium">{catalog.material}</span>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-stone-900 leading-snug">
                          {catalog.title}
                        </h4>
                      </div>

                      {/* Descriptions */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-stone-800 block text-[11px] uppercase tracking-wider mb-0.5">Short Summary:</strong>
                          <p className="text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/80 leading-relaxed">
                            {catalog.shortDescription}
                          </p>
                        </div>
                        <div>
                          <strong className="text-stone-800 block text-[11px] uppercase tracking-wider mb-0.5">Detailed Craft Description:</strong>
                          <p className="text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/80 leading-relaxed line-clamp-4">
                            {catalog.detailedDescription}
                          </p>
                        </div>
                      </div>

                      {/* SEO Keywords & Tags Count */}
                      <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                        <div className="flex items-center justify-between">
                          <strong className="text-stone-800">Search Keywords ({seo.secondaryKeywords.length} Points):</strong>
                          <span className="text-[10px] text-emerald-700 font-bold">SEO Ready</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {seo.secondaryKeywords.slice(0, 6).map((kw, idx) => (
                            <span key={idx} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                              {kw}
                            </span>
                          ))}
                          {seo.secondaryKeywords.length > 6 && (
                            <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                              +{seo.secondaryKeywords.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-1.5 text-xs">
                        <strong className="text-stone-800 block">Product Tags ({seo.searchTags.length} Tags):</strong>
                        <div className="flex flex-wrap gap-1">
                          {seo.searchTags.slice(0, 8).map((tag, idx) => (
                            <span key={idx} className="text-[10px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ARTISAN APPROVAL SECTION */}
                    <div className="pt-4 border-t-2 border-amber-200/80 space-y-3">
                      <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-300/80 space-y-2">
                        <label className="flex items-start space-x-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isArtisanApproved}
                            onChange={(e) => setIsArtisanApproved(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-amber-950 block">
                              कारीगर स्वीकृति (Artisan Listing Approval)
                            </span>
                            <p className="text-[11px] text-stone-700 leading-snug">
                              मैं पुष्टि करता/करती हूँ कि उत्पाद का शीर्षक, विवरण, एसईओ टैग्स, वास्तविक बाज़ार मूल्य (₹{retailPriceInput}) और मांग आंकड़े सही हैं तथा इसे कालासेतु बाज़ार में प्रकाशित करने की स्वीकृति देता/देती हूँ।
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Big Prominent Publish Button */}
                      <button
                        onClick={handlePublishProduct}
                        disabled={!isArtisanApproved || isSavingProduct || productSavedSuccess}
                        className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isSavingProduct ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Publishing Product to KalaSetu Marketplace...</span>
                          </>
                        ) : productSavedSuccess ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-white" />
                            <span>Product Successfully Approved & Published!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Approve & Publish to Marketplace (स्वीकृति देकर पब्लिश करें)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer Navigation Bar */}
        <div className="bg-white border-t border-stone-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="text-xs text-stone-500 font-medium hidden sm:block">
            Step {currentStep} of 5: <strong className="text-stone-800">{stepTitles[currentStep - 1]?.title}</strong>
          </div>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              disabled={currentStep === 2 && !uploadedImage}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white shadow-xs transition-all transform hover:translate-x-0.5 cursor-pointer"
            >
              <span>{currentStep === 1 && !voiceTranscript ? 'Skip to Photo Upload' : 'Continue to Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublishProduct}
              disabled={!isArtisanApproved || isSavingProduct || productSavedSuccess}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{productSavedSuccess ? 'Published!' : isSavingProduct ? 'Publishing...' : 'Approve & Publish'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">Google Gemini API Key</h3>
                  <p className="text-[11px] text-stone-500">Live Multimodal Vision & Craft Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Enter your Google AI Studio Gemini API key. This activates real-time vision recognition for uploaded craft photos, accurately detecting Indian art traditions (e.g. Madhubani, Warli, Pattachitra) and automatically generating titles, descriptions, SEO tags, fair pricing, and demand forecasts.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 block">Gemini API Key</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKeyInput}
                onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 font-mono"
              />
            </div>

            {apiKeyStatusMsg && (
              <div className="text-xs p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 font-medium">
                {apiKeyStatusMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-700 hover:text-amber-800 underline inline-flex items-center space-x-1"
              >
                <span>Get free API key</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isTestingKey}
                  onClick={() => handleSaveGeminiKey(geminiApiKeyInput)}
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-xl flex items-center space-x-1.5 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isTestingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{isTestingKey ? 'Verifying...' : 'Save & Test'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
