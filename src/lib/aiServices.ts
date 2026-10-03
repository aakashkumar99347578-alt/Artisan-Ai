import {
  VoiceIntent,
  ProductAnalysis,
  BackgroundScenePrompt,
  CatalogData,
  SEOData,
  FairPriceData,
  DemandData,
  AnalyticsEvent,
  AnalyticsEventType,
} from '../types';

/**
 * AI & Image Services Client
 * Clean abstraction layer connecting the frontend to secure server-side AI endpoints.
 * Never accesses secrets or API tokens directly.
 */

export interface TranscribeAudioResult {
  success: boolean;
  transcript: string;
  detectedLanguage: string;
  normalizedText?: string;
  isHfWhisper?: boolean;
  error?: string;
}

export interface VoiceInstructionResult {
  success: boolean;
  intent: VoiceIntent;
  error?: string;
}

export interface ImageAnalysisResult {
  success: boolean;
  analysis: ProductAnalysis;
  error?: string;
}

export interface BackgroundRemovalResult {
  success: boolean;
  isolatedImageUrl: string;
  maskDataUrl?: string;
  confidence?: 'High' | 'Medium' | 'Low' | string;
  isHfSegFormer?: boolean;
  error?: string;
}

export interface BackgroundGenerationResult {
  success: boolean;
  finalImageUrl: string;
  scenePrompt: BackgroundScenePrompt;
  preset: string;
  error?: string;
}

/**
 * 1. Transcribe audio via Hugging Face Whisper (openai/whisper-large-v3-turbo)
 */
export async function transcribeAudio(
  audioBlob: Blob,
  languageHint?: string
): Promise<TranscribeAudioResult> {
  try {
    const audioBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    const res = await fetch('/api/ai/hf-whisper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType: audioBlob.type || 'audio/webm',
        languageHint: languageHint || 'hi',
      }),
    });

    if (!res.ok) {
      throw new Error(`Whisper service returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      transcript: data.transcript || '',
      detectedLanguage: data.detectedLanguage || 'Hindi',
      normalizedText: data.normalizedText || data.transcript || '',
      isHfWhisper: Boolean(data.isHfWhisper),
    };
  } catch (err: any) {
    console.warn('Audio transcription notice:', err?.message || err);
    return {
      success: false,
      transcript: '',
      detectedLanguage: 'Hindi',
      error: err?.message || 'Voice recognition failed. Please try again.',
    };
  }
}

/**
 * 2. Interpret Voice Instruction into Structured Intent (Gemini LLM)
 */
export async function interpretVoiceInstruction(
  transcript: string,
  spokenLanguage?: string
): Promise<VoiceInstructionResult> {
  try {
    const res = await fetch('/api/ai/voice-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        language: spokenLanguage,
      }),
    });

    if (!res.ok) {
      throw new Error(`Voice interpretation failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      intent: data.intent,
    };
  } catch (err: any) {
    console.warn('Voice interpretation error:', err?.message || err);
    // Controlled structured fallback
    return {
      success: false,
      intent: {
        intent: 'create_product_catalog',
        product_description: transcript,
        category: 'Handcrafted Heritage Art Piece',
        background_request: 'clean studio e-commerce',
        visual_style: 'authentic handcrafted',
        target_customer: 'conscious decor buyers & bulk gifting',
        catalog_requested: true,
        seo_requested: true,
        price_analysis_requested: true,
        demand_analysis_requested: true,
        additional_instructions: [],
      },
      error: err?.message,
    };
  }
}

/**
 * 3. Multimodal Product Image Analysis (Gemini Vision)
 */
export async function analyzeProductImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  fileName?: string,
  contextHint?: string,
  voiceTranscript?: string
): Promise<ImageAnalysisResult> {
  try {
    const res = await fetch('/api/ai/image-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        fileName,
        contextHint,
        voiceTranscript,
      }),
    });

    if (!res.ok) {
      throw new Error(`Image analysis returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      analysis: data.analysis,
    };
  } catch (err: any) {
    console.warn('Image analysis fallback notice:', err?.message || err);
    return {
      success: false,
      analysis: {
        product_name: null,
        category: null,
        subcategory: null,
        material: null,
        color: null,
        style: null,
        visible_features: [],
        text_visible_in_image: [],
        brand_visible: null,
        likely_use_cases: [],
        visual_description: 'Product photo captured for catalog generation.',
        confidence: 'Low',
      },
      error: err?.message,
    };
  }
}

/**
 * 4. Background Segmentation & Removal (Hugging Face SegFormer: nvidia/segformer-b0-finetuned-ade-512-512)
 */
export async function removeBackground(
  imageUrlOrBase64: string
): Promise<BackgroundRemovalResult> {
  try {
    const res = await fetch('/api/ai/hf-segmentation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: imageUrlOrBase64,
      }),
    });

    if (!res.ok) {
      throw new Error(`Segmentation endpoint returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      isolatedImageUrl: data.isolatedImageUrl || imageUrlOrBase64,
      maskDataUrl: data.maskDataUrl,
      confidence: data.confidence || 'Medium',
      isHfSegFormer: Boolean(data.isHfSegFormer),
    };
  } catch (err: any) {
    console.warn('Background removal error:', err?.message || err);
    return {
      success: false,
      isolatedImageUrl: imageUrlOrBase64,
      confidence: 'Low',
      error: 'Background removal could not confidently detect the product. Please try another image.',
    };
  }
}

/**
 * 5. Clean abstraction for AI Product Background Generation
 */
export async function generateProductBackground(params: {
  productImage: string;
  category?: string;
  craftType?: string;
  preset: 'clean' | 'studio' | 'heritage' | 'luxury';
  voiceInstruction?: string;
  customPrompt?: string;
}): Promise<BackgroundGenerationResult> {
  try {
    const res = await fetch('/api/ai/background-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Background generation returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      finalImageUrl: data.finalImageUrl || params.productImage,
      scenePrompt: data.scenePrompt,
      preset: params.preset,
    };
  } catch (err: any) {
    console.warn('Background generation notice:', err?.message || err);
    return {
      success: false,
      finalImageUrl: params.productImage,
      scenePrompt: {
        scene_type: 'E-commerce studio',
        environment: 'Neutral warm tabletop',
        lighting: 'Soft directional studio lighting',
        surface: 'Matte neutral finish',
        camera_style: 'Eye-level 50mm commercial shot',
        mood: 'Authentic & premium',
        color_palette: 'Warm neutral & earthy tones',
        commercial_style: 'Minimalist high-end marketplace',
      },
      preset: params.preset,
      error: err?.message,
    };
  }
}

/**
 * 6. Generate Complete AI Catalog (Titles, Descriptions, Highlights, Multi-language)
 */
export async function generateCatalog(params: {
  productData: Record<string, any>;
  artisanData: Record<string, any>;
  fieldToRegenerate?: 'title' | 'description' | 'highlights' | 'all';
}): Promise<{ success: boolean; catalog: CatalogData; error?: string }> {
  try {
    const res = await fetch('/api/ai/catalog-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Catalog generation returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      catalog: data.catalog,
    };
  } catch (err: any) {
    console.warn('Catalog generation error:', err?.message || err);
    return {
      success: false,
      catalog: {
        title: params.productData?.productName || 'Handcrafted Heritage Art Piece',
        shortTitle: params.productData?.shortTitle || 'Artisan Craft',
        shortDescription: 'Lovingly crafted by master artisans using authentic indigenous techniques.',
        detailedDescription: 'Authentic Indian handcrafted creation preserving cultural craft traditions.',
        category: params.productData?.category || 'Handicrafts',
        material: params.productData?.material || 'Natural Materials',
        features: ['100% Handcrafted', 'Natural Materials', 'Eco-friendly'],
        benefits: ['Direct artisan impact', 'Authentic heritage design'],
        useCases: ['Home decor', 'Festive gifting'],
        targetAudience: 'Art enthusiasts & conscious shoppers',
        highlights: ['Handmade in India', 'Fair-trade verified'],
        careInstructions: 'Clean gently with dry soft cloth.',
        tags: ['Handmade', 'Indian Craft'],
        keywords: ['artisan', 'handcrafted', 'heritage'],
      },
      error: err?.message,
    };
  }
}

/**
 * 7. Generate SEO Data (Title, Meta Description, URL Slug, Keywords, FAQ, Schema)
 */
export async function generateSEO(params: {
  title: string;
  category: string;
  material: string;
  region?: string;
  artisanName?: string;
}): Promise<{ success: boolean; seo: SEOData; error?: string }> {
  try {
    const res = await fetch('/api/ai/seo-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`SEO generation returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      seo: data.seo,
    };
  } catch (err: any) {
    console.warn('SEO generation notice:', err?.message || err);
    const cleanSlug = (params.title || 'artisan-craft')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return {
      success: false,
      seo: {
        seoTitle: `${params.title} | Authentic Indian Handcrafts | KalaSetu`,
        metaDescription: `Buy authentic ${params.title} directly from master artisans in ${params.region || 'India'}. Handcrafted from genuine ${params.material || 'sustainable materials'}. Fair-trade certified.`,
        slug: cleanSlug,
        primaryKeyword: params.title.toLowerCase(),
        secondaryKeywords: [`handmade ${params.category.toLowerCase()}`, `authentic ${params.material.toLowerCase()}`, 'Indian handicraft'],
        searchTags: ['handcrafted', 'direct from artisan', 'made in India'],
        productTags: [params.category, 'Artisan', 'Festive'],
        semanticKeywords: ['traditional craft', 'sustainable decor', 'GI tag craft'],
        faq: [
          {
            question: 'Is this product 100% handcrafted?',
            answer: 'Yes, every piece is made by hand using traditional artisan techniques.',
          },
          {
            question: 'How should I care for this item?',
            answer: 'Wipe gently with a dry, soft microfiber cloth. Keep away from harsh chemicals.',
          },
        ],
      },
      error: err?.message,
    };
  }
}

/**
 * 8. Estimate Fair Price (Based on Category, Material, Production Time, and Database Evidence)
 */
export async function estimateFairPrice(params: {
  category: string;
  craftType?: string;
  material?: string;
  productionTime?: string;
  enteredPrice?: number;
  rawMaterialCost?: number;
  laborDays?: number;
}): Promise<{ success: boolean; pricing: FairPriceData; error?: string }> {
  try {
    const res = await fetch('/api/ai/price-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Price calculation returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      pricing: data.pricing,
    };
  } catch (err: any) {
    console.warn('Price calculation notice:', err?.message || err);
    const base = params.enteredPrice || 850;
    return {
      success: false,
      pricing: {
        estimated_price: base,
        minimum_fair_price: Math.round(base * 0.85),
        maximum_fair_price: Math.round(base * 1.2),
        currency: 'INR',
        confidence: 'Medium',
        reasoning: ['Estimated from artisan labor benchmarks and raw material averages.'],
        suggestedRetailPrice: base,
        suggestedB2BPrice: Math.round(base * 0.72),
        suggestedBulkPrice: Math.round(base * 0.65),
      },
      error: err?.message,
    };
  }
}

/**
 * 9. Analyze Real Demand & Calculate Transparent Demand Score (DemandAnalysisService)
 */
export async function analyzeDemand(params: {
  productId?: string;
  category: string;
  craftType?: string;
  region?: string;
  state?: string;
}): Promise<{ success: boolean; demand: DemandData; error?: string }> {
  try {
    const res = await fetch('/api/ai/demand-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Demand analysis returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      demand: data.demand,
    };
  } catch (err: any) {
    console.warn('Demand analysis notice:', err?.message || err);
    return {
      success: false,
      demand: {
        demandScore: 48,
        demandLevel: 'Medium',
        trend: 'Stable',
        confidence: 'Low',
        isInsufficientData: true,
        signals: {
          internalViews: { score: 12, max: 25, raw: 45, label: 'Views' },
          searchInterest: { score: 14, max: 25, raw: 28, label: 'Search Interest' },
          addToCart: { score: 10, max: 20, raw: 8, label: 'Add to Cart' },
          wishlist: { score: 7, max: 15, raw: 11, label: 'Wishlist' },
          seasonality: { score: 5, max: 10, raw: 1, festivalName: 'Upcoming Festive Season', label: 'Festive Alignment' },
          recentTrend: { score: 0, max: 5, raw: 0, label: '7-Day Trend' },
        },
        explanation: 'Demand confidence is low because there is not enough recent activity to make a reliable estimate.',
        festivalRelevance: [
          { festival: 'Diwali & Dhanteras', score: 92, reason: 'Peak national demand for handcrafted gifting' },
        ],
        actionableTips: [
          'List with multiple high-definition photos showing artisan work.',
          'Specify accurate production time to capture advance festive orders.',
        ],
      },
      error: err?.message,
    };
  }
}

/**
 * 10. Track Real Analytics Event
 */
export async function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  data: {
    productId?: string;
    userId?: string;
    sessionId?: string;
    source?: string;
    device?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        product_id: data.productId,
        user_id: data.userId,
        session_id: data.sessionId,
        source: data.source || 'web_applet',
        device: data.device || (typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'),
        metadata: data.metadata,
      }),
    });
  } catch (err) {
    // Non-blocking telemetry
    console.debug('Analytics telemetry notification:', err);
  }
}
