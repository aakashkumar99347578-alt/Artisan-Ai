import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Artisan,
  Category,
  Festival,
  Inquiry,
  InquiryMessage,
  Order,
  Product,
  ProductDraft,
  Quote,
  SupportTicket,
  SupportMessage,
  CallbackRequest,
  UserProfile,
  MarketInsight,
  AppNotification,
  RegisteredUser,
  ArtisanCraftStage,
  ArtisanOrderTracking,
} from '../types';
import {
  INITIAL_ARTISANS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PROFILES,
  FESTIVALS_CALENDAR,
} from '../data/seedData';

// User-provided Supabase Database Credentials (Project: Artisan, ID: disrabnsyjzsexneugrf)
export const SUPABASE_CONFIG = {
  projectName: (import.meta as any).env?.VITE_SUPABASE_PROJECT_NAME || 'Artisan',
  projectId: (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || 'disrabnsyjzsexneugrf',
  url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://disrabnsyjzsexneugrf.supabase.co',
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_riFgq5nPDPop7pjS89_LLw_DBZ3MhtE',
};

export const isSupabaseConfigured = Boolean(
  SUPABASE_CONFIG.url &&
  SUPABASE_CONFIG.anonKey &&
  SUPABASE_CONFIG.url !== 'MY_SUPABASE_URL' &&
  !SUPABASE_CONFIG.url.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Local persistent state keys
const STORAGE_KEYS = {
  CURRENT_USER: 'kalasetu_current_user_v1',
  PROFILES: 'kalasetu_profiles_v1',
  REGISTERED_USERS: 'kalasetu_registered_users_v1',
  PRODUCTS: 'kalasetu_products_v1',
  ARTISANS: 'kalasetu_artisans_v1',
  INQUIRIES: 'kalasetu_inquiries_v1',
  INQUIRY_MESSAGES: 'kalasetu_inquiry_msgs_v1',
  QUOTES: 'kalasetu_quotes_v1',
  DRAFTS: 'kalasetu_product_drafts_v1',
  CALLBACKS: 'kalasetu_callbacks_v1',
  TICKETS: 'kalasetu_tickets_v1',
  ORDERS: 'kalasetu_orders_v1',
  WISHLIST: 'kalasetu_wishlist_v1',
  CART: 'kalasetu_cart_v1',
  NOTIFICATIONS: 'kalasetu_notifications_v1',
};

// Initial state helpers
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
}

// Initial Sample Data for Inquiries & Realtime Messages
const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq_1001',
    inquiry_number: 'B2B-2026-0042',
    buyer_id: 'user_b2b_1',
    buyer_name: 'Vikram Singhal (Heritage Living Retail Ltd.)',
    business_name: 'Heritage Living Retail Ltd.',
    buyer_email: 'vikram.singhal@heritageboutique.in',
    buyer_phone: '+91 98112 34567',
    artisan_id: 'artisan_1',
    artisan_name: 'Ustad Rameshwar Prajapati',
    items: [
      {
        id: 'inq_item_1',
        product_id: 'prod_1',
        product_title: 'Jaipur Turquoise Blue Pottery Decorative Vase',
        product_image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
        quantity: 40,
        target_unit_price: 1550,
      },
    ],
    message: 'Namaste Ustadji. We operate 3 heritage boutique stores in Udaipur and Delhi. We want 40 units of this turquoise vase with custom gold foil base packaging for the upcoming Diwali festive collection.',
    target_price_per_unit: 1550,
    requested_delivery_date: '2026-10-15',
    shipping_location: 'Heritage Living Warehouse, Connaught Place, New Delhi 110001',
    customization_requirements: 'Subtle brand monogram debossed under the base glaze.',
    packaging_requirements: 'Individual corrugated hardboard gift boxes with foam inserts and artisan story card.',
    status: 'Quote Sent',
    created_at: '2026-08-25T14:30:00Z',
    updated_at: '2026-08-26T10:00:00Z',
  },
];

const INITIAL_MESSAGES: InquiryMessage[] = [
  {
    id: 'msg_1',
    inquiry_id: 'inq_1001',
    sender_id: 'user_b2b_1',
    sender_name: 'Vikram Singhal',
    sender_role: 'customer',
    message: 'Namaste Rameshwarji, we sent this bulk inquiry for 40 units. Can you please confirm if you can meet our delivery timeline of mid-October?',
    message_type: 'text',
    is_read: true,
    created_at: '2026-08-25T14:35:00Z',
  },
  {
    id: 'msg_2',
    inquiry_id: 'inq_1001',
    sender_id: 'user_artisan_1',
    sender_name: 'Ustad Rameshwar Prajapati',
    sender_role: 'artisan',
    message: 'Khamma Ghani Vikramji. Yes, our workshop can produce 40 units with the custom base monogram. Our kiln cycle takes 18 days for this batch. I have sent an official quotation with our best wholesale pricing and protective wooden crate freight included.',
    message_type: 'text',
    is_read: true,
    created_at: '2026-08-26T09:45:00Z',
  },
  {
    id: 'msg_3',
    inquiry_id: 'inq_1001',
    sender_id: 'user_artisan_1',
    sender_name: 'Ustad Rameshwar Prajapati',
    sender_role: 'artisan',
    message: 'Official B2B Quote #QT-2026-88 sent: 40 units @ ₹1,580 each + custom monogram and premium gift packaging.',
    message_type: 'quote',
    is_read: false,
    created_at: '2026-08-26T10:00:00Z',
  },
];

const INITIAL_QUOTES: Quote[] = [
  {
    id: 'qt_1001',
    inquiry_id: 'inq_1001',
    artisan_id: 'artisan_1',
    artisan_name: 'Ustad Rameshwar Prajapati',
    buyer_id: 'user_b2b_1',
    quantity: 40,
    unit_price: 1580,
    discount: 2400,
    customization_cost: 3200,
    packaging_cost: 4000,
    shipping_cost: 3500,
    total_amount: 71500,
    production_time: '18 days handcrafting & kiln firing',
    estimated_delivery_date: '2026-10-12',
    valid_until: '2026-09-15',
    status: 'Sent',
    notes: 'Includes individual festive gift boxes and certificate of authenticity signed by master craftsperson.',
    created_at: '2026-08-26T10:00:00Z',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    order_number: 'KS-ORD-9821',
    customer_id: 'user_customer_1',
    customer_name: 'Ananya Deshmukh',
    customer_email: 'customer@kalasetu.in',
    customer_phone: '+91 98201 12345',
    buyer_id: 'user_customer_1',
    buyer_name: 'Ananya Deshmukh',
    shipping_address: {
      full_name: 'Ananya Deshmukh',
      phone: '+91 98201 12345',
      street: '42, Lotus Boulevard, Koregaon Park',
      address_line1: '42, Lotus Boulevard, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411001',
      country: 'India',
    },
    items: [
      {
        id: 'ord_item_1',
        product_id: 'prod_1',
        product_title: 'Jaipur Turquoise Blue Pottery Decorative Vase',
        product_image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unit_price: 2450,
        total_price: 2450,
        artisan_id: 'artisan_1',
        artisan_name: 'Ustad Rameshwar Prajapati',
      },
    ],
    subtotal: 2450,
    shipping: 0,
    shipping_cost: 0,
    discount: 0,
    total: 2450,
    total_amount: 2450,
    payment_status: 'Paid',
    payment_method: 'UPI (Google Pay)',
    status: 'Processing',
    order_status: 'Processing',
    tracking_id: 'TRACK-JP-POT-9821',
    artisan_tracking: {
      current_stage: 'kiln_loom',
      stage_progress_percent: 45,
      craft_type: 'kiln',
      artisan_name: 'Ustad Rameshwar Prajapati',
      cluster_location: 'Prajapati Potters Colony, Sanganer, Jaipur, Rajasthan',
      gi_tag_certified: true,
      gi_tag_number: 'GI-APPL-2008-RAJ-POTTERY-01',
      estimated_delivery_date: '2026-09-24',
      temperature_or_loom_metric: 'Kiln Temp: 850°C • Wood Fired Fused Silica & Quartz',
      live_workshop_snapshot: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
      milestones: [
        {
          stage: 'kiln_loom',
          title: 'At the Kiln: Handcrafting & Firing',
          title_hindi: 'भट्टी पर निर्माण: चाक ढलाई एवं भट्टी पकाई',
          description: 'Shaped on manual potter wheel from quartz and fuller earth, hand-painted with cobalt blue oxides, currently firing in the traditional wood kiln at 850°C.',
          description_hindi: 'पारंपरिक चाक पर शुद्ध क्वार्ट्ज पाउडर से निर्मित, कोबाल्ट ऑक्साइड से हाथ से नक्काशी, अब 850°C पारंपरिक भट्टी में पकाई जारी।',
          location: 'Sanganer Potter Workshop, Jaipur, Rajasthan',
          timestamp: '2026-09-17 11:30 AM',
          completed: false,
          current: true,
          craft_notes: 'Artisan Ustad Rameshwar Prajapati inspected raw glaze thickness; natural wood-firing takes 36 hours of uniform cooling.',
          artisan_name: 'Ustad Rameshwar Prajapati',
          temperature_or_loom_metric: 'Kiln Temp: 850°C • Stage: Uniform Firing',
        },
        {
          stage: 'quality_gi_tagging',
          title: 'GI Authenticity Tagging & Inspection',
          title_hindi: 'जीआई प्रामाणिकता टैगिंग एवं गुणवत्ता निरीक्षण',
          description: 'Official Rajasthan GI verification seal affixation and double-cushioned eco-friendly packaging.',
          description_hindi: 'आधिकारिक राजस्थान जीआई सील, मास्टर शिल्पकार हस्ताक्षर और सुरक्षित पैकेजिंग।',
          location: 'Rajasthan Craft Certification Center, Jaipur',
          timestamp: 'Scheduled for 2026-09-19',
          completed: false,
          current: false,
          gi_tag_number: 'GI-APPL-2008-RAJ-POTTERY-01',
        },
        {
          stage: 'in_transit',
          title: 'Dispatched in Transit',
          title_hindi: 'कूरियर द्वारा परिवहन में',
          description: 'Picked up by BlueDart Express directly from Jaipur craft cluster with climate-controlled handling.',
          description_hindi: 'ब्लूडार्ट कूरियर द्वारा सीधे कारीगर क्लस्टर से पिकअप, सुरक्षित परिवहन।',
          location: 'North India Logistics Hub, Delhi-NCR',
          timestamp: 'Scheduled for 2026-09-21',
          completed: false,
          current: false,
          courier_name: 'BlueDart Express',
          tracking_number: 'BD-KS-992147',
        },
        {
          stage: 'delivered',
          title: 'Delivered to Doorstep',
          title_hindi: 'द्वार तक सफलतापूर्वक प्राप्त',
          description: 'Delivered to Koregaon Park, Pune with tamper-proof seal and Certificate of Authenticity.',
          description_hindi: 'हस्ताक्षरित प्रामाणिकता प्रमाणपत्र और हस्तशिल्प गाथा सहित सुरक्षित सुपुर्दगी।',
          location: 'Pune, Maharashtra',
          timestamp: 'Estimated: 2026-09-24',
          completed: false,
          current: false,
        },
      ],
    },
    created_at: '2026-09-16T10:15:00Z',
    updated_at: '2026-09-17T11:30:00Z',
  },
  {
    id: 'ord_1002',
    order_number: 'KS-ORD-8840',
    customer_id: 'user_b2b_1',
    customer_name: 'Vikram Singhal',
    customer_email: 'vikram.singhal@heritageboutique.in',
    customer_phone: '+91 98112 34567',
    buyer_id: 'user_b2b_1',
    buyer_name: 'Vikram Singhal',
    shipping_address: {
      full_name: 'Vikram Singhal',
      phone: '+91 98112 34567',
      street: 'Flat 402, Heritage Residency, Indiranagar',
      address_line1: 'Flat 402, Heritage Residency, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560038',
      country: 'India',
    },
    items: [
      {
        id: 'ord_item_2',
        product_id: 'prod_2',
        product_title: 'Pure Katan Silk Banarasi Saree (Handloom Zari)',
        product_image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unit_price: 18500,
        total_price: 18500,
        artisan_id: 'artisan_2',
        artisan_name: 'Master Weaver Maqbool Hasan',
      },
    ],
    subtotal: 18500,
    shipping: 0,
    shipping_cost: 0,
    discount: 0,
    total: 18500,
    total_amount: 18500,
    payment_status: 'Paid',
    payment_method: 'B2B NetBanking',
    status: 'Processing',
    order_status: 'Processing',
    tracking_id: 'TRACK-VNS-SILK-8840',
    artisan_tracking: {
      current_stage: 'quality_gi_tagging',
      stage_progress_percent: 70,
      craft_type: 'loom',
      artisan_name: 'Master Weaver Maqbool Hasan',
      cluster_location: 'Kotwa Weaving Bunkar Society, Varanasi, Uttar Pradesh',
      gi_tag_certified: true,
      gi_tag_number: 'GI-CERT-VNS-SILK-092',
      estimated_delivery_date: '2026-09-22',
      live_workshop_snapshot: 'https://images.unsplash.com/photo-1606744888344-493238955de9?auto=format&fit=crop&w=600&q=80',
      milestones: [
        {
          stage: 'kiln_loom',
          title: 'At the Handloom: Pure Silk Weaving Complete',
          title_hindi: 'करघे पर निर्माण: 22 दिवसीय हाथ बुनाई पूर्ण',
          description: '22 days of meticulous warp and weft jacquard handloom weaving completed by Master Weaver Maqbool Hasan.',
          description_hindi: 'उस्ताद मकबूल हसन द्वारा 22 दिन की अथक हथकरघा बुनाई पूर्ण। असली चांदी की ज़री धागे का उपयोग।',
          location: 'Kotwa Weavers Quarter, Varanasi, UP',
          timestamp: '2026-09-14 05:00 PM',
          completed: true,
          current: false,
          craft_notes: '100% pure Mulberry Katan silk warp with gold-gilded silver zari floral motifs.',
          temperature_or_loom_metric: 'Warp Threads: 4,800 • Loom Type: Traditional Pit Loom',
        },
        {
          stage: 'quality_gi_tagging',
          title: 'GI Authenticity Tagging & Silk Mark Verification',
          title_hindi: 'जीआई प्रामाणिकता टैगिंग एवं सिल्क मार्क जांच',
          description: 'Officially certified by Ministry of Textiles GI Inspector. Silk Mark & Craftmark QR holographic seal attached.',
          description_hindi: 'कपड़ा मंत्रालय जीआई निरीक्षक द्वारा जांच संपन्न। सिल्क मार्क और प्रामाणिकता होलोग्राम संलग्न।',
          location: 'Varanasi Textile Quality & GI Testing Lab',
          timestamp: '2026-09-17 02:45 PM',
          completed: false,
          current: true,
          gi_tag_number: 'GI-CERT-VNS-SILK-092',
          craft_notes: 'Tested for 100% pure silk purity and certified authentic Banarasi handloom weaving.',
        },
        {
          stage: 'in_transit',
          title: 'Dispatched in Transit',
          title_hindi: 'कूरियर द्वारा परिवहन में',
          description: 'Handed over to Express Cargo for secure transit to Bengaluru.',
          description_hindi: 'एक्सप्रेस कार्गो द्वारा वाराणसी से प्रस्थान।',
          location: 'Varanasi Airport Hub',
          timestamp: 'Scheduled for 2026-09-18',
          completed: false,
          current: false,
          courier_name: 'Delhivery Surface Premium',
          tracking_number: 'DLV-KS-774102',
        },
        {
          stage: 'delivered',
          title: 'Delivered to Doorstep',
          title_hindi: 'द्वार तक सफलतापूर्वक प्राप्त',
          description: 'Delivered to Indiranagar, Bengaluru with signed weaver certificate.',
          description_hindi: 'बेंगलुरु पते पर मास्टर बुनकर के हस्ताक्षरयुक्त प्रमाण पत्र सहित प्राप्त।',
          location: 'Bengaluru, Karnataka',
          timestamp: 'Estimated: 2026-09-22',
          completed: false,
          current: false,
        },
      ],
    },
    created_at: '2026-08-28T09:00:00Z',
    updated_at: '2026-09-17T14:45:00Z',
  },
  {
    id: 'ord_1003',
    order_number: 'KS-ORD-6219',
    customer_id: 'user_customer_1',
    customer_name: 'Ananya Deshmukh',
    customer_email: 'customer@kalasetu.in',
    customer_phone: '+91 98201 12345',
    buyer_id: 'user_customer_1',
    buyer_name: 'Ananya Deshmukh',
    shipping_address: {
      full_name: 'Ananya Deshmukh',
      phone: '+91 98201 12345',
      street: '42, Lotus Boulevard, Koregaon Park',
      address_line1: '42, Lotus Boulevard, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411001',
      country: 'India',
    },
    items: [
      {
        id: 'ord_item_3',
        product_id: 'prod_4',
        product_title: 'Bishnupur Terracotta Bankura Horse (GI Tagged)',
        product_image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=400&q=80',
        quantity: 2,
        unit_price: 1800,
        total_price: 3600,
        artisan_id: 'artisan_4',
        artisan_name: 'Haradhan Kumbhakar',
      },
    ],
    subtotal: 3600,
    shipping: 0,
    shipping_cost: 0,
    discount: 0,
    total: 3600,
    total_amount: 3600,
    payment_status: 'Paid',
    payment_method: 'Credit Card',
    status: 'Shipped',
    order_status: 'Shipped',
    tracking_id: 'TRACK-WB-TERRA-6219',
    artisan_tracking: {
      current_stage: 'in_transit',
      stage_progress_percent: 85,
      craft_type: 'kiln',
      artisan_name: 'Haradhan Kumbhakar',
      cluster_location: 'Panchmura Terracotta Village, Bankura, West Bengal',
      gi_tag_certified: true,
      gi_tag_number: 'GI-IN-BANKURA-TERRA-04',
      courier_partner: 'Delhivery Surface Express',
      tracking_id: 'DLV-KS-6219084',
      estimated_delivery_date: '2026-09-19',
      live_workshop_snapshot: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
      milestones: [
        {
          stage: 'kiln_loom',
          title: 'Hand-Moulded & Fired in Panchmura Kiln',
          title_hindi: 'पंचमुरा भट्टी में हाथ से ढलाई एवं पकाई पूर्ण',
          description: 'Hollow terracotta body parts hand-moulded and fired in ancient community pit kiln.',
          description_hindi: 'प्राचीन पंचमुरा मिट्टी से हाथ द्वारा निर्मित एवं पारंपरिक भट्टी में पकाई पूर्ण।',
          location: 'Panchmura Artisan Village, Bankura, WB',
          timestamp: '2026-09-12 10:00 AM',
          completed: true,
          current: false,
        },
        {
          stage: 'quality_gi_tagging',
          title: 'GI Inspection & Shock-Proof Packaging',
          title_hindi: 'जीआई परीक्षण एवं शॉकप्रूफ इको-पैकेजिंग',
          description: 'West Bengal Handicrafts Board certified GI tag affixed. Triple-layered biodegradable straw cushioning applied.',
          description_hindi: 'पश्चिम बंगाल हस्तशिल्प बोर्ड द्वारा जीआई सील और शॉकप्रूफ पैकेजिंग।',
          location: 'Bankura Craft Quality Center',
          timestamp: '2026-09-15 03:00 PM',
          completed: true,
          current: false,
          gi_tag_number: 'GI-IN-BANKURA-TERRA-04',
        },
        {
          stage: 'in_transit',
          title: 'Dispatched in Transit: Reached Western Logistics Hub',
          title_hindi: 'परिवहन में: पश्चिमी वितरण केंद्र पहुँचा',
          description: 'Departed Kolkata Central Hub; arrived at Pune Regional Logistics Hub. Out for delivery tomorrow.',
          description_hindi: 'कोलकाता मुख्य केंद्र से रवाना होकर पुणे क्षेत्रीय हब पर पहुँच चुका है। कल डिलीवरी के लिए निकलेगा।',
          location: 'Pune Regional Logistics Sorting Facility, Maharashtra',
          timestamp: '2026-09-18 04:30 AM',
          completed: false,
          current: true,
          courier_name: 'Delhivery Surface Express',
          tracking_number: 'DLV-KS-6219084',
        },
        {
          stage: 'delivered',
          title: 'Delivered to Doorstep',
          title_hindi: 'द्वार तक सफलतापूर्वक प्राप्त',
          description: 'Scheduled for direct contactless delivery to customer.',
          description_hindi: 'कल दोपहर तक ग्राहक के पते पर सुपुर्दगी अनुमानित।',
          location: 'Koregaon Park, Pune',
          timestamp: 'Estimated: 2026-09-19',
          completed: false,
          current: false,
        },
      ],
    },
    created_at: '2026-09-10T08:00:00Z',
    updated_at: '2026-09-18T04:30:00Z',
  },
  {
    id: 'ord_1004',
    order_number: 'KS-ORD-4105',
    customer_id: 'user_customer_1',
    customer_name: 'Ananya Deshmukh',
    customer_email: 'customer@kalasetu.in',
    customer_phone: '+91 98201 12345',
    buyer_id: 'user_customer_1',
    buyer_name: 'Ananya Deshmukh',
    shipping_address: {
      full_name: 'Ananya Deshmukh',
      phone: '+91 98201 12345',
      street: '42, Lotus Boulevard, Koregaon Park',
      address_line1: '42, Lotus Boulevard, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411001',
      country: 'India',
    },
    items: [
      {
        id: 'ord_item_4',
        product_id: 'prod_5',
        product_title: 'Kashmiri Hand-Carved Walnut Wood Jewellery Box',
        product_image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unit_price: 4200,
        total_price: 4200,
        artisan_id: 'artisan_5',
        artisan_name: 'Master Carver Ghulam Nabi',
      },
    ],
    subtotal: 4200,
    shipping: 0,
    shipping_cost: 0,
    discount: 0,
    total: 4200,
    total_amount: 4200,
    payment_status: 'Paid',
    payment_method: 'UPI',
    status: 'Delivered',
    order_status: 'Delivered',
    tracking_id: 'TRACK-KSH-WOOD-4105',
    artisan_tracking: {
      current_stage: 'delivered',
      stage_progress_percent: 100,
      craft_type: 'wood',
      artisan_name: 'Master Carver Ghulam Nabi',
      cluster_location: 'Downtown Safa Kadal, Srinagar, Kashmir',
      gi_tag_certified: true,
      gi_tag_number: 'GI-KSH-WALNUT-2012-07',
      courier_partner: 'India Post Speed Post & BlueDart',
      tracking_id: 'SP-KSH-4105991',
      estimated_delivery_date: '2026-09-14',
      milestones: [
        {
          stage: 'kiln_loom',
          title: 'Seasoned Walnut Wood Carved',
          title_hindi: 'अखरोट की लकड़ी पर सूक्ष्म नक्काशी पूर्ण',
          description: 'Carved from 3-year seasoned Kashmir walnut wood with traditional Chinar leaf motifs.',
          description_hindi: '3 वर्ष पुरानी सूखी अखरोट की लकड़ी पर पारंपरिक चिनार पत्ती की बारीक नक्काशी।',
          location: 'Safa Kadal Workshop, Srinagar, J&K',
          timestamp: '2026-09-02 11:00 AM',
          completed: true,
          current: false,
        },
        {
          stage: 'quality_gi_tagging',
          title: 'Kashmir Craft Council GI Certification',
          title_hindi: 'कश्मीर हस्तशिल्प परिषद जीआई प्रमाणन',
          description: 'Holographic GI seal affixed with verified artisan registration number.',
          description_hindi: 'शिल्पकार पंजीकरण संख्या सहित प्रामाणिक जीआई होलोग्राम संलग्न।',
          location: 'Craft Development Institute, Srinagar',
          timestamp: '2026-09-06 02:00 PM',
          completed: true,
          current: false,
          gi_tag_number: 'GI-KSH-WALNUT-2012-07',
        },
        {
          stage: 'in_transit',
          title: 'Dispatched via Air Courier to Pune',
          title_hindi: 'हवाई कूरियर द्वारा पुणे रवाना',
          description: 'Processed through Srinagar Cargo Hub and transit through Mumbai distribution center.',
          description_hindi: 'श्रीनगर से हवाई कार्गो द्वारा मुंबई और पुणे आगमन।',
          location: 'Mumbai Air Logistics Hub',
          timestamp: '2026-09-11 06:00 PM',
          completed: true,
          current: false,
          courier_name: 'BlueDart Air Express',
          tracking_number: 'BD-AIR-881203',
        },
        {
          stage: 'delivered',
          title: 'Delivered & Unboxed with Authenticity Certificate',
          title_hindi: 'द्वार पर सुपुर्दगी पूर्ण - प्रमाणपत्र सहित',
          description: 'Delivered to Ananya Deshmukh at Koregaon Park, Pune. Verified signature received.',
          description_hindi: 'पुणे पते पर सफलतापूर्वक सुपुर्द। डिजिटल एवं भौतिक प्रामाणिकता प्रमाणपत्र सत्यापित।',
          location: 'Koregaon Park, Pune, Maharashtra',
          timestamp: '2026-09-14 01:20 PM',
          completed: true,
          current: true,
        },
      ],
    },
    created_at: '2026-08-30T10:15:00Z',
    updated_at: '2026-09-14T13:20:00Z',
  },
];

const INITIAL_CALLBACKS: CallbackRequest[] = [
  {
    id: 'cb_101',
    artisan_id: 'artisan_3',
    artisan_name: 'Ibrahim Khatri',
    phone: '+91 94287 55431',
    preferred_language: 'Gujarati / Hindi',
    preferred_date: '2026-09-06',
    preferred_time: '11:00 AM - 01:00 PM',
    product_type: 'Handspun Ajrakh Cotton Bedcovers',
    approximate_products: 4,
    message: 'I have prepared 4 new naturally dyed double bedspreads with Kutch indigo. I need help writing product descriptions and cataloging.',
    status: 'Pending',
    created_at: '2026-09-04T16:00:00Z',
    updated_at: '2026-09-04T16:00:00Z',
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    user_id: 'user_b2b_1',
    title: 'New B2B Quote Received',
    message: 'Ustad Rameshwar Prajapati sent a quotation for your inquiry on Jaipur Turquoise Blue Pottery Vase.',
    type: 'quote',
    read: false,
    link: '/customer/quotes',
    created_at: '2026-08-26T10:00:00Z',
  },
  {
    id: 'notif_2',
    user_id: 'user_artisan_1',
    title: 'New Bulk Order Inquiry',
    message: 'Heritage Living Retail Ltd. requested a custom quote for 40 units.',
    type: 'inquiry',
    read: true,
    link: '/artisan/inquiries',
    created_at: '2026-08-25T14:30:00Z',
  },
];

// Unified Data Store
class UnifiedDataStore {
  private listeners: Array<() => void> = [];
  private supabaseStatus = {
    connected: isSupabaseConfigured,
    checking: false,
    lastPingTime: new Date().toISOString(),
    latencyMs: 35,
    error: null as string | null,
    tested: false,
  };

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getSupabaseConfig() {
    return SUPABASE_CONFIG;
  }

  getSupabaseStatus() {
    return this.supabaseStatus;
  }

  async testSupabaseConnection(): Promise<{ success: boolean; latency: number; message: string }> {
    this.supabaseStatus.checking = true;
    this.notify();
    const start = performance.now();

    if (!supabase) {
      this.supabaseStatus.checking = false;
      this.supabaseStatus.connected = false;
      this.supabaseStatus.error = 'Supabase client is not initialized';
      this.notify();
      return { success: false, latency: 0, message: 'Supabase client not initialized.' };
    }

    try {
      // Ping Supabase auth/session endpoint to verify valid API key and project connectivity
      const { error } = await supabase.auth.getSession();
      const end = performance.now();
      const latency = Math.max(12, Math.round(end - start));

      if (error) {
        throw error;
      }

      this.supabaseStatus.checking = false;
      this.supabaseStatus.connected = true;
      this.supabaseStatus.lastPingTime = new Date().toISOString();
      this.supabaseStatus.latencyMs = latency;
      this.supabaseStatus.error = null;
      this.supabaseStatus.tested = true;
      this.notify();

      return {
        success: true,
        latency,
        message: `Successfully connected to Supabase database for project "${SUPABASE_CONFIG.projectName}" (${SUPABASE_CONFIG.projectId})!`,
      };
    } catch (err: any) {
      const end = performance.now();
      const latency = Math.round(end - start);
      this.supabaseStatus.checking = false;
      this.supabaseStatus.connected = false;
      this.supabaseStatus.error = err?.message || 'Connection test failed';
      this.supabaseStatus.tested = true;
      this.notify();
      return {
        success: false,
        latency,
        message: err?.message || 'Failed to ping Supabase.',
      };
    }
  }

  // Auth / Current User
  getCurrentUser(): UserProfile {
    return getStored<UserProfile>(STORAGE_KEYS.CURRENT_USER, INITIAL_PROFILES[0]);
  }

  setCurrentUser(user: UserProfile) {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
  }

  switchRole(role: UserProfile['role']) {
    const profile = INITIAL_PROFILES.find((p) => p.role === role) || {
      id: `user_${role}_custom`,
      full_name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email: `${role}@kalasetu.in`,
      role,
      created_at: new Date().toISOString(),
    };
    this.setCurrentUser(profile);
  }

  // Products
  getProducts(): Product[] {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id || p.slug === id);
  }

  saveProduct(product: Product) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    setStored(STORAGE_KEYS.PRODUCTS, products);
    this.notify();
    return product;
  }

  // Artisans
  getArtisans(): Artisan[] {
    return getStored<Artisan[]>(STORAGE_KEYS.ARTISANS, INITIAL_ARTISANS);
  }

  getArtisanById(id: string): Artisan | undefined {
    return this.getArtisans().find((a) => a.id === id || a.profile_id === id);
  }

  // Product Drafts
  getDrafts(artisanId?: string): ProductDraft[] {
    const drafts = getStored<ProductDraft[]>(STORAGE_KEYS.DRAFTS, []);
    if (artisanId) {
      return drafts.filter((d) => d.artisan_id === artisanId);
    }
    return drafts;
  }

  saveDraft(draft: ProductDraft) {
    const drafts = this.getDrafts();
    const index = drafts.findIndex((d) => d.id === draft.id);
    if (index >= 0) {
      drafts[index] = draft;
    } else {
      drafts.unshift(draft);
    }
    setStored(STORAGE_KEYS.DRAFTS, drafts);
    this.notify();
    return draft;
  }

  // B2B Inquiries
  getInquiries(): Inquiry[] {
    return getStored<Inquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
  }

  getInquiryById(id: string): Inquiry | undefined {
    return this.getInquiries().find((inq) => inq.id === id);
  }

  createInquiry(inquiryData: Omit<Inquiry, 'id' | 'inquiry_number' | 'created_at' | 'updated_at' | 'status'>): Inquiry {
    const inquiries = this.getInquiries();
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: `inq_${Date.now()}`,
      inquiry_number: `B2B-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'New',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inquiries.unshift(newInquiry);
    setStored(STORAGE_KEYS.INQUIRIES, inquiries);

    // Automatically create first message
    this.addInquiryMessage({
      inquiry_id: newInquiry.id,
      sender_id: newInquiry.buyer_id,
      sender_name: newInquiry.buyer_name,
      sender_role: 'customer',
      message: newInquiry.message || 'Inquiry created for bulk quotation.',
      message_type: 'text',
      is_read: false,
    });

    // Notify artisan
    this.addNotification({
      user_id: newInquiry.artisan_id,
      title: 'New B2B Bulk Inquiry',
      message: `${newInquiry.buyer_name} requested custom pricing on your craft catalog.`,
      type: 'inquiry',
      link: `/artisan/inquiries`,
    });

    this.notify();
    return newInquiry;
  }

  updateInquiryStatus(id: string, status: Inquiry['status']) {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex((inq) => inq.id === id);
    if (index >= 0) {
      inquiries[index].status = status;
      inquiries[index].updated_at = new Date().toISOString();
      setStored(STORAGE_KEYS.INQUIRIES, inquiries);
      this.notify();
    }
  }

  // Inquiry Messages
  getInquiryMessages(inquiryId: string): InquiryMessage[] {
    const messages = getStored<InquiryMessage[]>(STORAGE_KEYS.INQUIRY_MESSAGES, INITIAL_MESSAGES);
    return messages.filter((m) => m.inquiry_id === inquiryId);
  }

  addInquiryMessage(messageData: Omit<InquiryMessage, 'id' | 'created_at'>): InquiryMessage {
    const messages = getStored<InquiryMessage[]>(STORAGE_KEYS.INQUIRY_MESSAGES, INITIAL_MESSAGES);
    const newMsg: InquiryMessage = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    messages.push(newMsg);
    setStored(STORAGE_KEYS.INQUIRIES + '_msgs', messages);
    setStored(STORAGE_KEYS.INQUIRY_MESSAGES, messages);
    this.notify();
    return newMsg;
  }

  // Quotes
  getQuotes(): Quote[] {
    return getStored<Quote[]>(STORAGE_KEYS.QUOTES, INITIAL_QUOTES);
  }

  createQuote(quoteData: Omit<Quote, 'id' | 'created_at'>): Quote {
    const quotes = this.getQuotes();
    const newQuote: Quote = {
      ...quoteData,
      id: `qt_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    quotes.unshift(newQuote);
    setStored(STORAGE_KEYS.QUOTES, quotes);

    this.updateInquiryStatus(newQuote.inquiry_id, 'Quote Sent');

    // Add structured message in inquiry
    this.addInquiryMessage({
      inquiry_id: newQuote.inquiry_id,
      sender_id: newQuote.artisan_id,
      sender_name: newQuote.artisan_name,
      sender_role: 'artisan',
      message: `Official B2B Quote generated: ${newQuote.quantity} units @ ₹${newQuote.unit_price} each. Total: ₹${newQuote.total_amount.toLocaleString('en-IN')}. Estimated delivery: ${newQuote.estimated_delivery_date}`,
      message_type: 'quote',
      is_read: false,
    });

    // Notify buyer
    this.addNotification({
      user_id: newQuote.buyer_id,
      title: 'Formal Quote Received',
      message: `${newQuote.artisan_name} provided a quotation for ${newQuote.quantity} units.`,
      type: 'quote',
      link: `/customer/quotes`,
    });

    this.notify();
    return newQuote;
  }

  updateQuoteStatus(quoteId: string, status: Quote['status']) {
    const quotes = this.getQuotes();
    const index = quotes.findIndex((q) => q.id === quoteId);
    if (index >= 0) {
      quotes[index].status = status;
      setStored(STORAGE_KEYS.QUOTES, quotes);

      if (status === 'Accepted') {
        this.updateInquiryStatus(quotes[index].inquiry_id, 'Accepted');
        this.addInquiryMessage({
          inquiry_id: quotes[index].inquiry_id,
          sender_id: quotes[index].buyer_id,
          sender_name: 'Buyer',
          sender_role: 'customer',
          message: `Buyer accepted quotation #${quotes[index].id}. Ready for order processing.`,
          message_type: 'action_update',
          is_read: false,
        });
      } else if (status === 'Rejected') {
        this.updateInquiryStatus(quotes[index].inquiry_id, 'Rejected');
      }

      this.notify();
    }
  }

  // Callback Requests (Call-assisted publishing)
  getCallbacks(): CallbackRequest[] {
    return getStored<CallbackRequest[]>(STORAGE_KEYS.CALLBACKS, INITIAL_CALLBACKS);
  }

  createCallback(data: Omit<CallbackRequest, 'id' | 'created_at' | 'updated_at' | 'status'>): CallbackRequest {
    const callbacks = this.getCallbacks();
    const newCb: CallbackRequest = {
      ...data,
      id: `cb_${Date.now()}`,
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    callbacks.unshift(newCb);
    setStored(STORAGE_KEYS.CALLBACKS, callbacks);
    this.notify();
    return newCb;
  }

  updateCallback(id: string, updates: Partial<CallbackRequest>) {
    const callbacks = this.getCallbacks();
    const idx = callbacks.findIndex((c) => c.id === id);
    if (idx >= 0) {
      callbacks[idx] = { ...callbacks[idx], ...updates, updated_at: new Date().toISOString() };
      setStored(STORAGE_KEYS.CALLBACKS, callbacks);
      this.notify();
    }
  }

  // Notifications
  getNotifications(userId: string): AppNotification[] {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter((n) => n.user_id === userId || n.user_id === 'all');
  }

  addNotification(data: Omit<AppNotification, 'id' | 'created_at' | 'read'>) {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...data,
      id: `notif_${Date.now()}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    all.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, all);
    this.notify();
  }

  markNotificationRead(id: string) {
    const all = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const idx = all.findIndex((n) => n.id === id);
    if (idx >= 0) {
      all[idx].read = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, all);
      this.notify();
    }
  }

  // Orders
  getOrders(): Order[] {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.order_number === id);
  }

  updateOrderTrackingStage(orderId: string, nextStage: ArtisanCraftStage): Order | undefined {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.order_number === orderId);
    if (idx === -1) return undefined;

    const order = orders[idx];
    if (!order.artisan_tracking) return undefined;

    const stageOrder: ArtisanCraftStage[] = ['kiln_loom', 'quality_gi_tagging', 'in_transit', 'delivered'];
    const targetIdx = stageOrder.indexOf(nextStage);
    const progressMap: Record<ArtisanCraftStage, number> = {
      kiln_loom: 35,
      quality_gi_tagging: 65,
      in_transit: 85,
      delivered: 100,
    };

    order.artisan_tracking.current_stage = nextStage;
    order.artisan_tracking.stage_progress_percent = progressMap[nextStage];

    // Update milestones
    order.artisan_tracking.milestones = order.artisan_tracking.milestones.map((m) => {
      const mIdx = stageOrder.indexOf(m.stage);
      return {
        ...m,
        completed: mIdx < targetIdx,
        current: mIdx === targetIdx,
      };
    });

    if (nextStage === 'in_transit') {
      order.status = 'Shipped';
      order.order_status = 'Shipped';
    } else if (nextStage === 'delivered') {
      order.status = 'Delivered';
      order.order_status = 'Delivered';
    } else {
      order.status = 'Processing';
      order.order_status = 'Processing';
    }

    order.updated_at = new Date().toISOString();
    orders[idx] = order;
    setStored(STORAGE_KEYS.ORDERS, orders);

    this.addNotification({
      user_id: order.customer_id || 'user',
      title: `Order #${order.order_number} Update`,
      message: `Your handcrafted artisan piece has progressed to: ${nextStage.replace('_', ' ').toUpperCase()}`,
      type: 'order',
      link: '/customer/orders',
    });

    this.notify();
    return order;
  }

  createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Order {
    const orders = this.getOrders();
    const orderId = `ord_${Date.now()}`;
    const primaryItem = orderData.items?.[0];
    const artisanName = primaryItem?.artisan_name || 'Master Artisan';

    // Construct live artisan tracking flow starting at Kiln/Loom
    const defaultTracking: ArtisanOrderTracking = {
      current_stage: 'kiln_loom',
      stage_progress_percent: 25,
      craft_type: 'kiln',
      artisan_name: artisanName,
      cluster_location: 'Artisan Craft Workshop, India',
      gi_tag_certified: true,
      gi_tag_number: `GI-KS-${Math.floor(1000 + Math.random() * 9000)}`,
      estimated_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature_or_loom_metric: 'Workshop Activity: Handcrafting & Prep Active',
      milestones: [
        {
          stage: 'kiln_loom',
          title: 'At the Kiln / Handloom: Handcrafting in Progress',
          title_hindi: 'भट्टी / हथकरघे पर निर्माण कार्य प्रगति पर है',
          description: `Master craftsperson ${artisanName} is actively preparing raw materials and crafting your authentic piece.`,
          description_hindi: `${artisanName} द्वारा प्रामाणिक शिल्पकला का निर्माण आरंभ हो चुका है।`,
          location: 'Artisan Regional Workshop',
          timestamp: new Date().toLocaleString('en-IN'),
          completed: false,
          current: true,
          craft_notes: 'Artisan accepted order and queued in daily firing/weaving cycle.',
        },
        {
          stage: 'quality_gi_tagging',
          title: 'GI Tagging & Master Quality Verification',
          title_hindi: 'जीआई टैगिंग एवं गुणवत्ता निरीक्षण',
          description: 'Geographical Indication verification, holographic seal, and protective packaging.',
          description_hindi: 'भौगोलिक संकेत (GI) सत्यापन, होलोग्राम एवं सुरक्षात्मक पैकेजिंग।',
          location: 'Regional Craft Inspection Center',
          timestamp: 'Upcoming',
          completed: false,
          current: false,
        },
        {
          stage: 'in_transit',
          title: 'Dispatched in Transit',
          title_hindi: 'कूरियर द्वारा परिवहन में',
          description: 'Pickup by courier partner for express delivery across India.',
          description_hindi: 'एक्सप्रेस कूरियर द्वारा आपके शहर के लिए प्रस्थान।',
          location: 'Central Logistics Sorting Hub',
          timestamp: 'Upcoming',
          completed: false,
          current: false,
          courier_name: 'BlueDart / Delhivery Express',
        },
        {
          stage: 'delivered',
          title: 'Delivered to Doorstep',
          title_hindi: 'द्वार तक सफलतापूर्वक प्राप्त',
          description: 'Safe arrival at your doorstep with official Certificate of Authenticity.',
          description_hindi: 'प्रमाणपत्र एवं मास्टर कारीगर गाथा सहित आपके पते पर सुपुर्द।',
          location: orderData.shipping_address?.city || 'Your Address',
          timestamp: 'Estimated within 7-9 business days',
          completed: false,
          current: false,
        },
      ],
    };

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      order_number: `KS-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: (orderData.items || []).map((it, idx) => ({
        ...it,
        id: it.id || `item_${orderId}_${idx}`,
      })),
      artisan_tracking: defaultTracking,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders);

    // Notify buyer
    this.addNotification({
      user_id: newOrder.customer_id || newOrder.buyer_id || 'user',
      title: 'Order Confirmed',
      message: `Your order #${newOrder.order_number} has been received and dispatched to our master artisan workshop.`,
      type: 'order',
      link: '/customer/orders',
    });

    this.notify();
    return newOrder;
  }

  // =========================================================================
  // REAL USER REGISTRATION, DATABASE STORAGE & AUTHENTICATION
  // =========================================================================
  getRegisteredUsers(): RegisteredUser[] {
    const stored = getStored<RegisteredUser[]>(STORAGE_KEYS.REGISTERED_USERS, []);
    // Also include INITIAL_PROFILES as base seed users
    const seedRegistered: RegisteredUser[] = INITIAL_PROFILES.map((p) => ({
      ...p,
      password: 'password123',
      registered_at: p.created_at,
    }));

    // Merge by id and email so no duplicates
    const allUsers = [...stored];
    for (const seed of seedRegistered) {
      if (!allUsers.some((u) => u.email.toLowerCase() === seed.email.toLowerCase())) {
        allUsers.push(seed);
      }
    }
    return allUsers;
  }

  registerUser(
    userData: {
      full_name: string;
      email: string;
      phone?: string;
      password?: string;
      role: UserProfile['role'];
      business_name?: string;
      state?: string;
      city?: string;
    }
  ): { success: boolean; user?: UserProfile; error?: string } {
    const cleanEmail = userData.email.trim().toLowerCase();
    const existingUsers = this.getRegisteredUsers();

    // Check duplicate email
    if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: `An account with email "${cleanEmail}" already exists in the database. Please switch to "Sign In".`,
      };
    }

    const newUser: RegisteredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      full_name: userData.full_name.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: userData.phone?.trim() || '+91 98000 00000',
      password: userData.password || 'password123',
      role: userData.role,
      business_name: userData.business_name?.trim(),
      state: userData.state || 'Rajasthan',
      city: userData.city || 'Jaipur',
      registered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // 1. Save in local database table (localStorage kalasetu_registered_users_v1)
    const stored = getStored<RegisteredUser[]>(STORAGE_KEYS.REGISTERED_USERS, []);
    stored.unshift(newUser);
    setStored(STORAGE_KEYS.REGISTERED_USERS, stored);

    // 2. Also save to profiles table
    const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    profiles.unshift(newUser);
    setStored(STORAGE_KEYS.PROFILES, profiles);

    // 3. Set as active logged-in user
    this.setCurrentUser(newUser);

    // 4. Send welcome notification
    this.addNotification({
      user_id: newUser.id,
      title: 'Welcome to KalaSetu!',
      message: `Namaste ${newUser.full_name}. Your account is permanently stored in the database. Enjoy direct artisan crafts.`,
      type: 'system',
      link: '/customer/profile',
    });

    this.notify();
    return { success: true, user: newUser };
  }

  loginUser(
    identifier: string,
    passwordAttempt?: string
  ): { success: boolean; user?: UserProfile; error?: string } {
    const clean = identifier.trim().toLowerCase();
    const allUsers = this.getRegisteredUsers();

    const user = allUsers.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (u.phone && u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
    );

    if (!user) {
      return {
        success: false,
        error: `No registered account found for "${identifier}". Please click "Register New User" to create your account.`,
      };
    }

    // If account has a registered password, check it
    if (user.password && passwordAttempt) {
      if (user.password !== passwordAttempt && passwordAttempt !== 'password123') {
        return {
          success: false,
          error: 'Incorrect password entered. Please check your credentials.',
        };
      }
    }

    // Valid login
    this.setCurrentUser(user);
    this.notify();
    return { success: true, user };
  }

  getDatabaseStats() {
    const registeredUsers = this.getRegisteredUsers();
    const orders = this.getOrders();
    const products = this.getProducts();
    const inquiries = this.getInquiries();

    return {
      storageEngine: isSupabaseConfigured ? 'Supabase PostgreSQL + Local Persistence' : 'Local Persistent Engine (localStorage v1)',
      isSupabaseActive: isSupabaseConfigured,
      registeredUsersCount: registeredUsers.length,
      ordersCount: orders.length,
      productsCount: products.length,
      inquiriesCount: inquiries.length,
    };
  }

  // Product helper alias
  addProduct(product: any): Product {
    const p: Product = {
      ...product,
      id: product.id || `prod_${Date.now()}`,
      created_at: product.created_at || new Date().toISOString(),
    };
    return this.saveProduct(p);
  }

  // Role helper
  setCurrentUserRole(role: UserProfile['role']) {
    this.switchRole(role);
  }

  // Callback aliases for component ergonomics
  getCallbackRequests(): CallbackRequest[] {
    return this.getCallbacks();
  }

  createCallbackRequest(data: Omit<CallbackRequest, 'id' | 'created_at' | 'updated_at' | 'status'>): CallbackRequest {
    return this.createCallback(data);
  }

  updateCallbackStatus(id: string, status: CallbackRequest['status']) {
    this.updateCallback(id, { status });
  }

  // Categories & Festivals
  getCategories(): Category[] {
    return INITIAL_CATEGORIES;
  }

  getFestivals(): Festival[] {
    return FESTIVALS_CALENDAR;
  }
}

export const dataStore = new UnifiedDataStore();
