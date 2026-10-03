export type UserRole = 'customer' | 'artisan' | 'support_operator' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  preferred_language?: string;
  state?: string;
  city?: string;
  business_name?: string;
  gst_number?: string;
  created_at: string;
}

export interface CraftProcessStep {
  step: 'Raw Material' | 'Preparation' | 'Handcrafting' | 'Finishing' | 'Final Product';
  title: string;
  description: string;
}

export interface Artisan {
  id: string;
  profile_id: string;
  name: string;
  craft_name: string;
  bio: string;
  region: string;
  state: string;
  city: string;
  profile_image_url: string;
  banner_image_url?: string;
  story: string;
  years_of_experience: number;
  verification_status: 'verified' | 'pending' | 'unverified';
  process_steps: CraftProcessStep[];
  awards?: string[];
  total_sales?: number;
  rating?: number;
  reviews_count?: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  description: string;
  image_url: string;
  craft_count?: number;
}

export interface ProductImage {
  id: string;
  image_url: string;
  image_type: 'original' | 'bg_removed' | 'lifestyle' | 'natural_studio' | '360_frame';
  alt_text?: string;
  is_primary?: boolean;
}

export interface Product {
  id: string;
  artisan_id: string;
  artisan_name: string;
  artisan_region: string;
  artisan_image_url: string;
  category_id: string;
  category_name: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  b2b_price?: number;
  bulk_price?: number;
  bulk_min_units?: number;
  stock: number;
  material: string;
  craft_type: string;
  colour: string;
  dimensions?: string;
  weight?: string;
  production_time: string;
  region: string;
  state: string;
  care_instructions?: string;
  customization_available?: boolean;
  tags: string[];
  search_keywords?: string[];
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
  images: ProductImage[];
  is_featured?: boolean;
  is_trending?: boolean;
  festival_tags?: string[];
  views_count?: number;
  wishlist_count?: number;
  inquiry_count?: number;
  rating?: number;
  review_count?: number;
  created_at: string;
}

export interface ProductDraft {
  id: string;
  artisan_id: string;
  artisan_name?: string;
  source_type: 'manual' | 'voice' | 'call_operator';
  source_language?: string;
  original_text?: string;
  transcript?: string;
  image_url?: string;
  bg_removed_url?: string;
  lifestyle_image_url?: string;
  ai_title?: string;
  ai_short_title?: string;
  ai_short_description?: string;
  ai_description?: string;
  ai_category?: string;
  ai_material?: string;
  ai_craft_type?: string;
  ai_colour?: string;
  ai_dimensions?: string;
  ai_weight?: string;
  ai_production_time?: string;
  ai_tags?: string[];
  ai_keywords?: string[];
  suggested_retail_price?: number;
  suggested_b2b_price?: number;
  suggested_bulk_price?: number;
  price_reasoning?: string;
  price_confidence?: string;
  demand_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'Low' | 'Medium' | 'High';
  demand_confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
  demand_reasoning?: string;
  observed_signals?: string;
  festival_relevance?: Array<{ festival: string; score: number; reason: string }>;
  status: 'draft' | 'ready_for_review' | 'published' | 'pending_approval' | 'approved' | 'rejected';
  missing_fields?: string[];
  created_at: string;
  updated_at?: string;
}

export type InquiryStatus =
  | 'New'
  | 'Viewed'
  | 'Responded'
  | 'Negotiating'
  | 'Quote Sent'
  | 'Accepted'
  | 'Rejected'
  | 'Cancelled'
  | 'Closed';

export interface InquiryItem {
  id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  quantity: number;
  target_unit_price?: number;
}

export interface Inquiry {
  id: string;
  inquiry_number: string;
  buyer_id: string;
  buyer_name: string;
  business_name?: string;
  buyer_email: string;
  buyer_phone: string;
  artisan_id: string;
  artisan_name: string;
  items: InquiryItem[];
  message: string;
  target_price_per_unit?: number;
  requested_delivery_date?: string;
  shipping_location: string;
  customization_requirements?: string;
  packaging_requirements?: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message: string;
  attachment_url?: string;
  message_type: 'text' | 'quote' | 'action_update';
  is_read: boolean;
  created_at: string;
}

export interface Quote {
  id: string;
  inquiry_id: string;
  artisan_id: string;
  artisan_name: string;
  buyer_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  customization_cost: number;
  packaging_cost: number;
  shipping_cost: number;
  total_amount: number;
  production_time: string;
  estimated_delivery_date: string;
  valid_until: string;
  status: 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  notes?: string;
  created_at: string;
}

export interface CallbackRequest {
  id: string;
  artisan_id: string;
  artisan_name: string;
  phone: string;
  preferred_language: string;
  preferred_date: string;
  preferred_time: string;
  product_type: string;
  approximate_products: number;
  message?: string;
  assigned_operator_id?: string;
  status: 'Pending' | 'Assigned' | 'Calling' | 'In Progress' | 'Completed' | 'Cancelled';
  session_notes?: string;
  draft_product_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Waiting for User' | 'Resolved' | 'Closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  message: string;
  created_at: string;
}

export interface Festival {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  states: string[];
  relevant_categories: string[];
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_customization?: string;
}

export interface OrderItem {
  id?: string;
  product_id: string;
  product_title: string;
  product_image: string;
  artisan_name: string;
  artisan_id?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

export type ArtisanCraftStage = 'kiln_loom' | 'quality_gi_tagging' | 'in_transit' | 'delivered';

export interface ArtisanTrackingMilestone {
  stage: ArtisanCraftStage;
  title: string;
  title_hindi: string;
  description: string;
  description_hindi: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  craft_notes?: string;
  artisan_name?: string;
  gi_tag_number?: string;
  courier_name?: string;
  tracking_number?: string;
  temperature_or_loom_metric?: string;
}

export interface ArtisanOrderTracking {
  current_stage: ArtisanCraftStage;
  stage_progress_percent: number;
  craft_type: 'kiln' | 'loom' | 'metal' | 'wood' | 'painting' | 'leather';
  artisan_name: string;
  cluster_location: string;
  gi_tag_certified: boolean;
  gi_tag_number: string;
  courier_partner?: string;
  tracking_id?: string;
  estimated_delivery_date: string;
  milestones: ArtisanTrackingMilestone[];
  live_workshop_snapshot?: string;
  last_sensor_update?: string;
  temperature_or_loom_metric?: string;
}

export interface RegisteredUser extends UserProfile {
  password?: string;
  registered_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  buyer_id?: string;
  buyer_name?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  shipping_cost?: number;
  discount: number;
  total: number;
  total_amount?: number;
  shipping_address: {
    full_name: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    phone: string;
    address_line1?: string;
    country?: string;
  };
  payment_method: string;
  payment_status: 'Paid' | 'Pending' | 'COD';
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  order_status?: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  tracking_id?: string;
  artisan_tracking?: ArtisanOrderTracking;
  created_at: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
  verified_purchase: boolean;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'inquiry' | 'quote' | 'order' | 'message' | 'support' | 'system';
  read: boolean;
  link?: string;
  created_at: string;
}

export interface MarketInsight {
  id: string;
  artisan_id: string;
  product_id?: string;
  insight_type: 'demand_rise' | 'bulk_surge' | 'regional_interest' | 'festival_prep';
  demand_level: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  observed_metric: string;
  supporting_data?: Record<string, any>;
  created_at: string;
}

// ==========================================
// AI Product Studio & Analytics Data Contracts
// ==========================================

export interface VoiceIntent {
  language?: string;
  intent: string;
  product_description: string;
  category?: string;
  background_request?: string;
  visual_style?: string;
  target_customer?: string;
  catalog_requested: boolean;
  seo_requested: boolean;
  price_analysis_requested: boolean;
  demand_analysis_requested: boolean;
  additional_instructions?: string[];
}

export interface ProductAnalysis {
  product_name: string | null;
  short_title?: string | null;
  category: string | null;
  subcategory: string | null;
  material: string | null;
  color: string | null;
  style: string | null;
  craft_technique?: string | null;
  short_description?: string | null;
  detailed_description?: string | null;
  craft_story?: string | null;
  highlights?: string[];
  features?: string[];
  benefits?: string[];
  care_instructions?: string | null;
  tags?: string[];
  keywords?: string[];
  seo_title?: string | null;
  meta_description?: string | null;
  hindi_translation?: {
    title?: string;
    short_description?: string;
    craft_story?: string;
  } | null;
  visible_features: string[];
  text_visible_in_image: string[];
  brand_visible: string | null;
  likely_use_cases: string[];
  visual_description: string;
  confidence?: 'High' | 'Medium' | 'Low' | string;
  // Legacy compatibility fields
  mainObject?: string;
  visibleMaterial?: string;
  visibleColour?: string;
  shape?: string;
  craftTechnique?: string;
  lightingAssessment?: string;
  backgroundStatus?: string;
  recommendedBackgrounds?: any[];
}

export interface BackgroundScenePrompt {
  scene_type: string;
  environment: string;
  lighting: string;
  surface: string;
  camera_style: string;
  mood: string;
  color_palette: string;
  commercial_style: string;
}

export interface CatalogData {
  title: string;
  shortTitle?: string;
  shortDescription: string;
  detailedDescription: string;
  marketingDescription?: string;
  craftStory?: string;
  category: string;
  subcategory?: string;
  material: string;
  color?: string;
  style?: string;
  features: string[];
  benefits: string[];
  useCases: string[];
  targetAudience: string;
  highlights: string[];
  careInstructions: string;
  tags: string[];
  keywords: string[];
  translations?: {
    hindi?: {
      title: string;
      shortDescription: string;
      craftStory: string;
    };
    [lang: string]: any;
  };
}

export interface SEOData {
  seoTitle: string;
  metaDescription: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchTags: string[];
  productTags: string[];
  semanticKeywords: string[];
  faq: Array<{ question: string; answer: string }>;
  suggestedSchema?: Record<string, any>;
}

export interface FairPriceData {
  estimated_price: number | null;
  minimum_fair_price: number | null;
  maximum_fair_price: number | null;
  currency: string;
  confidence: 'High' | 'Medium' | 'Low' | string;
  reasoning: string[];
  suggestedRetailPrice?: number;
  suggestedB2BPrice?: number;
  suggestedBulkPrice?: number;
  breakdown?: {
    materialEstimate?: number;
    laborAndCraftsmanship?: number;
    packagingAndFinishing?: number;
    artisanFairMargin?: number;
  };
}

export interface DemandSignalBreakdown {
  internalViews: { score: number; max: 25; raw: number; label: string };
  searchInterest: { score: number; max: 25; raw: number; label: string };
  addToCart: { score: number; max: 20; raw: number; label: string };
  wishlist: { score: number; max: 15; raw: number; label: string };
  seasonality: { score: number; max: 10; raw: number; festivalName?: string; label: string };
  recentTrend: { score: number; max: 5; raw: number; label: string };
}

export interface DemandData {
  demandScore: number;
  demandLevel: 'High' | 'Medium' | 'Low';
  trend: 'Increasing' | 'Stable' | 'Decreasing';
  confidence: 'High' | 'Medium' | 'Low';
  signals: DemandSignalBreakdown;
  explanation: string;
  festivalRelevance: Array<{ festival: string; score: number; reason: string }>;
  actionableTips: string[];
  isInsufficientData?: boolean;
}

export type AnalyticsEventType =
  | 'product_view'
  | 'product_search'
  | 'recently_viewed'
  | 'add_to_cart'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'purchase'
  | 'order_completed';

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  product_id?: string;
  event_type: AnalyticsEventType;
  timestamp: string;
  session_id?: string;
  source?: string;
  device?: string;
  metadata?: Record<string, any>;
}

export type JobStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

export interface WorkflowJobState {
  voice_transcription: { status: JobStatus; error?: string };
  voice_interpretation: { status: JobStatus; error?: string };
  product_analysis: { status: JobStatus; error?: string };
  background_removal: { status: JobStatus; error?: string };
  background_generation: { status: JobStatus; error?: string };
  catalog_generation: { status: JobStatus; error?: string };
  seo_generation: { status: JobStatus; error?: string };
  price_analysis: { status: JobStatus; error?: string };
  demand_analysis: { status: JobStatus; error?: string };
}

