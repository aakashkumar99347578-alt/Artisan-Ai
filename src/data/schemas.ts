export interface TableDef {
  name: string;
  category: string;
  columns: string;
  purpose: string;
}

export const SCHEMA_TABLES_LIST: TableDef[] = [
  // Core
  { name: 'profiles', category: 'Core', columns: 'id, auth_user_id, full_name, phone, role, state, city, preferred_language, avatar_url, created_at', purpose: 'Customer, artisan, admin basic profile' },
  { name: 'artisans', category: 'Core', columns: 'id, profile_id, craft_name, bio, story, state, city, years_of_experience, verification_status', purpose: 'Artisan-specific master craftsmanship profile' },
  { name: 'categories', category: 'Core', columns: 'id, name, slug, description, image_url, parent_id', purpose: 'Hierarchical product categories' },
  { name: 'products', category: 'Core', columns: 'id, artisan_id, category_id, title, slug, description, price, b2b_price, bulk_price, stock, material, craft_type, state, status', purpose: 'Main product data with retail & wholesale pricing' },
  { name: 'product_images', category: 'Core', columns: 'id, product_id, image_url, image_type, sort_order, is_360_frame, frame_index', purpose: 'Product photos, processed images, 360 frames' },
  
  // Customer / Shopping
  { name: 'addresses', category: 'Customer / Shopping', columns: 'id, user_id, name, phone, address_line1, city, state, pincode, is_default', purpose: 'Customer delivery addresses' },
  { name: 'wishlists', category: 'Customer / Shopping', columns: 'id, user_id, created_at', purpose: 'Customer wishlist registry' },
  { name: 'wishlist_items', category: 'Customer / Shopping', columns: 'id, wishlist_id, product_id', purpose: 'Products saved to wishlist' },
  { name: 'orders', category: 'Customer / Shopping', columns: 'id, order_number, buyer_id, total_amount, status, payment_status, shipping_address, created_at', purpose: 'Customer and wholesale orders' },
  { name: 'order_items', category: 'Customer / Shopping', columns: 'id, order_id, product_id, artisan_id, quantity, unit_price, total_price', purpose: 'Individual items inside an order with artisan escrow linkage' },
  { name: 'reviews', category: 'Customer / Shopping', columns: 'id, product_id, user_id, rating, comment, image_url, status', purpose: 'Customer ratings & authenticity reviews' },

  // B2B Inquiry + Messaging
  { name: 'inquiries', category: 'B2B Inquiry & Messages', columns: 'id, inquiry_number, buyer_id, artisan_id, message, requested_delivery_date, shipping_location, status', purpose: 'Main B2B wholesale / export inquiry' },
  { name: 'inquiry_items', category: 'B2B Inquiry & Messages', columns: 'id, inquiry_id, product_id, quantity, target_unit_price', purpose: 'Products and target batch quantities requested' },
  { name: 'inquiry_messages', category: 'B2B Inquiry & Messages', columns: 'id, inquiry_id, sender_id, message, attachment_url, message_type, is_read, created_at', purpose: 'Direct Buyer ↔ Artisan negotiation chat' },
  { name: 'quotes', category: 'B2B Inquiry & Messages', columns: 'id, inquiry_id, artisan_id, buyer_id, quantity, unit_price, discount, shipping_cost, total_amount, delivery_date, valid_until, status', purpose: 'Artisan formal quotation & proforma invoice' },

  // Artisan AI Product Creation
  { name: 'product_drafts', category: 'Artisan AI Listing', columns: 'id, artisan_id, source_type, source_language, transcript, original_image_url, processed_image_url, ai_title, ai_description, ai_tags, suggested_retail_price, suggested_b2b_price, demand_level, status', purpose: 'Voice + photo input transformed into AI product draft' },
  { name: 'ai_generation_logs', category: 'Artisan AI Listing', columns: 'id, draft_id, generation_type, model_name, input_reference, output_reference, status, created_at', purpose: 'AI model inference and prompt audit tracking' },
  { name: 'product_attributes', category: 'Artisan AI Listing', columns: 'id, product_id, attribute_name, attribute_value', purpose: 'Dynamic craft attributes (dye source, kiln fire, weave count)' },

  // Help & Call Support
  { name: 'callback_requests', category: 'Assisted Support', columns: 'id, artisan_id, phone, preferred_language, preferred_date, preferred_time, product_type, status, assigned_operator_id', purpose: 'Artisan phone callback request for voice listing' },
  { name: 'call_sessions', category: 'Assisted Support', columns: 'id, callback_request_id, artisan_id, operator_id, product_draft_id, transcript_reference, status, started_at, ended_at', purpose: 'Operator-assisted product creation session' },
  { name: 'support_tickets', category: 'Assisted Support', columns: 'id, user_id, category, subject, description, priority, status, assigned_to', purpose: 'Customer and artisan support ticket' },
  { name: 'support_messages', category: 'Assisted Support', columns: 'id, ticket_id, sender_id, message, attachment_url, created_at', purpose: 'Support ticket thread communication' },
  { name: 'help_articles', category: 'Assisted Support', columns: 'id, title, slug, content, category, language, status', purpose: 'Knowledge base and seller guides' },
  { name: 'faqs', category: 'Assisted Support', columns: 'id, question, answer, category, language, status', purpose: 'Frequently asked questions' },

  // Trending & Festivals
  { name: 'festivals', category: 'Market Demand', columns: 'id, name, start_date, end_date, states, regions, priority', purpose: 'National festive craft demand triggers' },
  { name: 'regional_festivals', category: 'Market Demand', columns: 'id, name, state, district, start_date, end_date, relevant_categories', purpose: 'Hyperlocal cultural fairs (Pushkar, Surajkund)' },
  { name: 'trending_signals', category: 'Market Demand', columns: 'id, product_id, state, city, views, searches, wishlist_count, cart_count, order_count, inquiry_count, quote_count, time_window', purpose: 'Live buyer demand telemetry' },
  { name: 'market_insights', category: 'Market Demand', columns: 'id, artisan_id, product_id, demand_level, demand_confidence, message, supporting_data, created_at', purpose: 'AI-generated inventory recommendations' },

  // Notifications
  { name: 'notifications', category: 'System', columns: 'id, user_id, type, title, message, reference_id, is_read, created_at', purpose: 'Inquiry, order, quotation, and listing alerts' }
];

export const MVP_15_TABLES_SQL = `-- =============================================================================
-- KalaSetu MVP (15 Core Tables) for Supabase PostgreSQL
-- Project: Artisan (disrabnsyjzsexneugrf)
-- Run this in Supabase Dashboard -> SQL Editor
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'artisan', 'admin', 'b2b_buyer')),
    state TEXT,
    city TEXT,
    preferred_language TEXT DEFAULT 'hi',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. artisans
CREATE TABLE IF NOT EXISTS public.artisans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    craft_name TEXT NOT NULL,
    bio TEXT,
    story TEXT,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    years_of_experience INTEGER DEFAULT 5,
    verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    b2b_price NUMERIC(12, 2),
    bulk_price NUMERIC(12, 2),
    stock INTEGER DEFAULT 1 CHECK (stock >= 0),
    material TEXT,
    craft_type TEXT NOT NULL,
    state TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold_out', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. product_images
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'gallery',
    sort_order INTEGER DEFAULT 0,
    is_360_frame BOOLEAN DEFAULT false,
    frame_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. addresses
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. wishlist_items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wishlist_id, product_id)
);

-- 9. orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'escrow_held', 'refunded')),
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. order_items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    requested_delivery_date DATE,
    shipping_location TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'quote_sent', 'accepted', 'rejected', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. inquiry_items
CREATE TABLE IF NOT EXISTS public.inquiry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    target_unit_price NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. inquiry_messages
CREATE TABLE IF NOT EXISTS public.inquiry_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'quote_proposal', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0,
    shipping_cost NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    delivery_date DATE,
    valid_until DATE,
    status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. product_drafts
CREATE TABLE IF NOT EXISTS public.product_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    source_type TEXT DEFAULT 'voice' CHECK (source_type IN ('voice', 'photo', 'manual', 'assisted_call')),
    source_language TEXT DEFAULT 'hi',
    transcript TEXT,
    original_image_url TEXT,
    processed_image_url TEXT,
    ai_title TEXT,
    ai_description TEXT,
    ai_tags TEXT[],
    suggested_retail_price NUMERIC(12, 2),
    suggested_b2b_price NUMERIC(12, 2),
    demand_level TEXT DEFAULT 'medium' CHECK (demand_level IN ('low', 'medium', 'high', 'trending')),
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('processing', 'pending_review', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enable
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_drafts ENABLE ROW LEVEL SECURITY;

-- Read policies for public marketplace browsing
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public artisans read" ON public.artisans FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public product_images read" ON public.product_images FOR SELECT USING (true);
`;

export const FULL_26_TABLES_SQL = `-- =============================================================================
-- KalaSetu Full Database Schema (All 26 Tables + Relationships + Triggers)
-- Project: Artisan (disrabnsyjzsexneugrf)
-- Run this in your Supabase Dashboard -> SQL Editor
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'artisan', 'admin', 'b2b_buyer')),
    state TEXT,
    city TEXT,
    preferred_language TEXT DEFAULT 'hi',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Artisans
CREATE TABLE IF NOT EXISTS public.artisans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    craft_name TEXT NOT NULL,
    bio TEXT,
    story TEXT,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    years_of_experience INTEGER DEFAULT 5,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    gi_tag_certified BOOLEAN DEFAULT false,
    national_award_winner BOOLEAN DEFAULT false,
    banner_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    b2b_price NUMERIC(12, 2) CHECK (b2b_price >= 0),
    bulk_price NUMERIC(12, 2) CHECK (bulk_price >= 0),
    stock INTEGER DEFAULT 1 CHECK (stock >= 0),
    material TEXT,
    craft_type TEXT NOT NULL,
    state TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold_out', 'archived')),
    moq INTEGER DEFAULT 1,
    cultural_provenance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Product Images
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT DEFAULT 'gallery' CHECK (image_type IN ('primary', 'gallery', 'processed', '360_spin', 'raw')),
    sort_order INTEGER DEFAULT 0,
    is_360_frame BOOLEAN DEFAULT false,
    frame_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Wishlist Items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wishlist_id, product_id)
);

-- 9. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'escrow_held', 'released', 'refunded')),
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    requested_delivery_date DATE,
    shipping_location TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'quote_sent', 'accepted', 'rejected', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Inquiry Items
CREATE TABLE IF NOT EXISTS public.inquiry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    target_unit_price NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Inquiry Messages
CREATE TABLE IF NOT EXISTS public.inquiry_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'quote_proposal', 'system')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    discount NUMERIC(12, 2) DEFAULT 0,
    shipping_cost NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    delivery_date DATE,
    valid_until DATE,
    status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Product Drafts (AI Listing)
CREATE TABLE IF NOT EXISTS public.product_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    source_type TEXT DEFAULT 'voice' CHECK (source_type IN ('voice', 'photo', 'manual', 'assisted_call')),
    source_language TEXT DEFAULT 'hi',
    transcript TEXT,
    original_image_url TEXT,
    processed_image_url TEXT,
    ai_title TEXT,
    ai_description TEXT,
    ai_tags TEXT[],
    suggested_retail_price NUMERIC(12, 2),
    suggested_b2b_price NUMERIC(12, 2),
    demand_level TEXT DEFAULT 'medium' CHECK (demand_level IN ('low', 'medium', 'high', 'trending')),
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('processing', 'pending_review', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. AI Generation Logs
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID REFERENCES public.product_drafts(id) ON DELETE CASCADE,
    generation_type TEXT NOT NULL,
    model_name TEXT DEFAULT 'gemini-3.8-flash',
    input_reference TEXT,
    output_reference TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Product Attributes
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Callback Requests
CREATE TABLE IF NOT EXISTS public.callback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID REFERENCES public.artisans(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'Hindi',
    preferred_date DATE,
    preferred_time TEXT,
    product_type TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    assigned_operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Call Sessions
CREATE TABLE IF NOT EXISTS public.call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    callback_request_id UUID REFERENCES public.callback_requests(id) ON DELETE SET NULL,
    artisan_id UUID REFERENCES public.artisans(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    product_draft_id UUID REFERENCES public.product_drafts(id) ON DELETE SET NULL,
    transcript_reference TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 21. Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Support Messages
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Help Articles & FAQs
CREATE TABLE IF NOT EXISTS public.help_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Festivals & Regional Festivals
CREATE TABLE IF NOT EXISTS public.festivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    states TEXT[] DEFAULT '{}',
    regions TEXT[] DEFAULT '{}',
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.regional_festivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    relevant_categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. Trending Signals & Market Insights
CREATE TABLE IF NOT EXISTS public.trending_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    state TEXT,
    city TEXT,
    views INTEGER DEFAULT 0,
    searches INTEGER DEFAULT 0,
    wishlist_count INTEGER DEFAULT 0,
    cart_count INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    quote_count INTEGER DEFAULT 0,
    time_window TEXT DEFAULT '7_days',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES public.artisans(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    demand_level TEXT DEFAULT 'high',
    demand_confidence NUMERIC(4, 2) DEFAULT 0.85,
    message TEXT NOT NULL,
    supporting_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_id TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_artisans_state ON public.artisans(state);
CREATE INDEX IF NOT EXISTS idx_products_artisan ON public.products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer ON public.inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_artisan ON public.inquiries(artisan_id);
CREATE INDEX IF NOT EXISTS idx_quotes_inquiry ON public.quotes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_product_drafts_artisan ON public.product_drafts(artisan_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Automatic Profile Creation Trigger on auth.users Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (auth_user_id, full_name, phone, role, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;
