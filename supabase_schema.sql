-- =============================================================================
-- KalaSetu Marketplace: Complete Supabase PostgreSQL Schema
-- Project Name: Artisan (disrabnsyjzsexneugrf)
-- Compatible with Supabase SQL Editor & Migration Engine
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- SECTION 1: CORE TABLES (MVP)
-- =============================================================================

-- 1. Profiles (Customer, Artisan, Admin basic profile synced with auth.users)
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

-- 2. Artisans (Artisan-specific master craftsmanship profile)
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

-- 3. Categories (Hierarchical product categories)
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

-- 4. Products (Main product data with retail, B2B wholesale, stock & craft origin)
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

-- 5. Product Images (Photos, processed studio photos, 360-degree rotation frames)
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

-- =============================================================================
-- SECTION 2: CUSTOMER / SHOPPING TABLES
-- =============================================================================

-- 6. Addresses (Customer shipping & billing addresses)
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

-- 7. Wishlists (Customer favorites list)
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

-- 9. Orders (Direct customer and retail purchase orders)
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

-- 10. Order Items (Products inside an order mapped to artisans for escrow payout)
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

-- 11. Reviews (Customer product ratings & cultural appraisal)
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

-- =============================================================================
-- SECTION 3: B2B INQUIRY + MESSAGING TABLES
-- =============================================================================

-- 12. Inquiries (Main B2B wholesale / export request)
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

-- 13. Inquiry Items (Products and target bulk rates for the inquiry)
CREATE TABLE IF NOT EXISTS public.inquiry_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    target_unit_price NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Inquiry Messages (Real-time Buyer ↔ Artisan chat with image attachments)
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

-- 15. Quotes (Artisan's formal B2B quotation / proforma invoice)
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

-- =============================================================================
-- SECTION 4: ARTISAN AI PRODUCT CREATION TABLES
-- =============================================================================

-- 16. Product Drafts (Voice recording + photo input to AI-generated craft catalog)
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

-- 17. AI Generation Logs (Audit trail for Gemini AI prompt tracking)
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

-- 18. Product Attributes (Flexible EAV attributes like kiln type, dye source, dimensions)
CREATE TABLE IF NOT EXISTS public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- SECTION 5: HELP & CALL SUPPORT TABLES
-- =============================================================================

-- 19. Callback Requests (Artisan phone call booking for cataloging assistance)
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

-- 20. Call Sessions (Live telephone-assisted product listing session)
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

-- =============================================================================
-- SECTION 6: TRENDING / FESTIVAL / DEMAND TABLES
-- =============================================================================

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

-- =============================================================================
-- SECTION 7: NOTIFICATIONS TABLE
-- =============================================================================

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

-- =============================================================================
-- SECTION 8: PERFORMANCE INDEXES
-- =============================================================================

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

-- =============================================================================
-- SECTION 9: ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

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
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read for catalog items
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Public read artisans" ON public.artisans FOR SELECT USING (true);
CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

-- User-scoped access policies
CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can manage own wishlist" ON public.wishlists
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = user_id));

CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT auth_user_id FROM public.profiles WHERE id = buyer_id));

CREATE POLICY "Inquiry participants can view chat" ON public.inquiry_messages
    FOR ALL USING (
        sender_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR
        inquiry_id IN (
            SELECT id FROM public.inquiries WHERE
            buyer_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR
            artisan_id IN (SELECT id FROM public.artisans WHERE profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
        )
    );

-- =============================================================================
-- SECTION 10: AUTOMATIC PROFILE CREATION TRIGGER (AUTH.USERS HOOK)
-- =============================================================================

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

-- Trigger upon auth.users insertion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
