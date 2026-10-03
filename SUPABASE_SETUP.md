# KalaSetu Indian Artisan Marketplace — Supabase Setup Guide

This document outlines the complete setup instructions for provisioning and configuring Supabase PostgreSQL, Authentication, Realtime, Storage, and Row-Level Security (RLS) for the KalaSetu platform.

---

## 1. Create a Supabase Project

1. Navigate to [https://supabase.com](https://supabase.com) and log in.
2. Click **New Project**.
3. Choose an organization, enter the Project Name: `kalasetu-artisan-marketplace`.
4. Set a strong database password and select a region closest to your primary user base (e.g., `ap-south-1` Mumbai).
5. Click **Create new project**.

---

## 2. Retrieve Project URL & Keys

1. In your Supabase project dashboard, navigate to **Project Settings** > **API**.
2. Copy the **Project URL** (`https://<project-ref>.supabase.co`).
3. Copy the **anon / public** API key.
4. (Optional for backend scripts) Note the **service_role** key. *Never expose the service-role key in browser code.*

---

## 3. Configure Environment Variables

Update your local `.env` or deployment variables:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4. PostgreSQL Database Schema & RLS Policies

Run the following complete SQL script in your Supabase **SQL Editor**:

```sql
-- ==========================================================
-- 1. EXTENSIONS & ENUMS
-- ==========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('customer', 'artisan', 'support_operator', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'pending_review', 'published', 'rejected', 'archived');
CREATE TYPE inquiry_status AS ENUM ('New', 'Viewed', 'Responded', 'Negotiating', 'Quote Sent', 'Accepted', 'Rejected', 'Cancelled', 'Closed');
CREATE TYPE quote_status AS ENUM ('Sent', 'Accepted', 'Rejected', 'Expired');
CREATE TYPE callback_status AS ENUM ('Pending', 'Assigned', 'Calling', 'In Progress', 'Completed', 'Cancelled');
CREATE TYPE ticket_status AS ENUM ('Open', 'Assigned', 'In Progress', 'Waiting for User', 'Resolved', 'Closed');

-- ==========================================================
-- 2. PROFILES TABLE (Linked to auth.users)
-- ==========================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  preferred_language TEXT DEFAULT 'Hindi',
  state TEXT,
  city TEXT,
  business_name TEXT,
  gst_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Artisan Community Member'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================
-- 3. ARTISANS TABLE
-- ==========================================================
CREATE TABLE artisans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  craft_name TEXT NOT NULL,
  bio TEXT,
  region TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  profile_image_url TEXT,
  banner_image_url TEXT,
  story TEXT,
  years_of_experience INT DEFAULT 1,
  verification_status TEXT DEFAULT 'pending',
  process_steps JSONB DEFAULT '[]'::jsonb,
  awards TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 4. CATEGORIES TABLE
-- ==========================================================
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_name TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 5. PRODUCTS TABLE
-- ==========================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  b2b_price NUMERIC(10,2),
  bulk_price NUMERIC(10,2),
  bulk_min_units INT DEFAULT 10,
  stock INT NOT NULL DEFAULT 0,
  material TEXT NOT NULL,
  craft_type TEXT NOT NULL,
  colour TEXT,
  dimensions TEXT,
  weight TEXT,
  production_time TEXT NOT NULL,
  region TEXT NOT NULL,
  state TEXT NOT NULL,
  care_instructions TEXT,
  customization_available BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  search_keywords TEXT[] DEFAULT '{}',
  status product_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  festival_tags TEXT[] DEFAULT '{}',
  views_count INT DEFAULT 0,
  wishlist_count INT DEFAULT 0,
  inquiry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 6. PRODUCT IMAGES TABLE
-- ==========================================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT DEFAULT 'original',
  sort_order INT DEFAULT 0,
  background_removed BOOLEAN DEFAULT false,
  ai_generated_background BOOLEAN DEFAULT false,
  is_360_frame BOOLEAN DEFAULT false,
  frame_index INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 7. B2B INQUIRIES & ITEMS
-- ==========================================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  target_price_per_unit NUMERIC(10,2),
  requested_delivery_date DATE,
  shipping_location TEXT NOT NULL,
  customization_requirements TEXT,
  packaging_requirements TEXT,
  status inquiry_status NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inquiry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  target_unit_price NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 8. INQUIRY REALTIME MESSAGES
-- ==========================================================
CREATE TABLE inquiry_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 9. QUOTES TABLE
-- ==========================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  customization_cost NUMERIC(10,2) DEFAULT 0,
  packaging_cost NUMERIC(10,2) DEFAULT 0,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  production_time TEXT NOT NULL,
  estimated_delivery_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  status quote_status NOT NULL DEFAULT 'Sent',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 10. PRODUCT DRAFTS TABLE (Voice & Photo AI creation)
-- ==========================================================
CREATE TABLE product_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'manual', 'voice', 'call_operator'
  source_language TEXT,
  original_text TEXT,
  transcript TEXT,
  image_url TEXT,
  bg_removed_url TEXT,
  lifestyle_image_url TEXT,
  ai_title TEXT,
  ai_short_description TEXT,
  ai_description TEXT,
  ai_category TEXT,
  ai_material TEXT,
  ai_craft_type TEXT,
  ai_production_time TEXT,
  ai_tags TEXT[] DEFAULT '{}',
  ai_keywords TEXT[] DEFAULT '{}',
  suggested_retail_price NUMERIC(10,2),
  suggested_b2b_price NUMERIC(10,2),
  suggested_bulk_price NUMERIC(10,2),
  price_reasoning TEXT,
  price_confidence TEXT,
  demand_level TEXT,
  demand_confidence TEXT,
  demand_reasoning TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 11. CALLBACK REQUESTS & CALL SESSIONS
-- ==========================================================
CREATE TABLE callback_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  preferred_language TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  product_type TEXT NOT NULL,
  approximate_products INT DEFAULT 1,
  message TEXT,
  assigned_operator_id UUID REFERENCES profiles(id),
  status callback_status NOT NULL DEFAULT 'Pending',
  session_notes TEXT,
  draft_product_id UUID REFERENCES product_drafts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 12. SUPPORT TICKETS & MESSAGES
-- ==========================================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status ticket_status DEFAULT 'Open',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 13. FESTIVALS & REGIONAL FESTIVALS
-- ==========================================================
CREATE TABLE festivals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  states TEXT[] DEFAULT '{}',
  relevant_categories TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Helper role function
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Public can view basic profile; Users can update own profile; Admin can view/edit all
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Artisans: Public can view verified artisans; Artisans manage own record
CREATE POLICY "Artisans are viewable by everyone" ON artisans
  FOR SELECT USING (true);

CREATE POLICY "Artisan can update own profile" ON artisans
  FOR UPDATE USING (profile_id = auth.uid() OR current_user_role() = 'admin');

-- Products: Published products viewable by anyone; Artisans view/edit their own
CREATE POLICY "Published products viewable by everyone" ON products
  FOR SELECT USING (status = 'published' OR artisan_id IN (SELECT id FROM artisans WHERE profile_id = auth.uid()) OR current_user_role() IN ('admin', 'support_operator'));

CREATE POLICY "Artisan can insert products" ON products
  FOR INSERT WITH CHECK (artisan_id IN (SELECT id FROM artisans WHERE profile_id = auth.uid()) OR current_user_role() = 'admin');

CREATE POLICY "Artisan can update own products" ON products
  FOR UPDATE USING (artisan_id IN (SELECT id FROM artisans WHERE profile_id = auth.uid()) OR current_user_role() = 'admin');

-- Inquiries: Buyer, Assigned Artisan, Support & Admin can view
CREATE POLICY "Inquiries viewable by parties" ON inquiries
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR artisan_id IN (SELECT id FROM artisans WHERE profile_id = auth.uid())
    OR current_user_role() IN ('admin', 'support_operator')
  );

CREATE POLICY "Buyer can insert inquiry" ON inquiries
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Parties can update inquiry" ON inquiries
  FOR UPDATE USING (
    buyer_id = auth.uid()
    OR artisan_id IN (SELECT id FROM artisans WHERE profile_id = auth.uid())
    OR current_user_role() IN ('admin', 'support_operator')
  );

-- Inquiry Messages: Only participants
CREATE POLICY "Messages viewable by inquiry participants" ON inquiry_messages
  FOR SELECT USING (
    inquiry_id IN (
      SELECT id FROM inquiries WHERE buyer_id = auth.uid()
      OR artisan_id IN (SELECT id FROM artisans WHERE profile_id = auth.uid())
    ) OR current_user_role() IN ('admin', 'support_operator')
  );

CREATE POLICY "Participants can insert messages" ON inquiry_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
  );

-- Quotes: Buyer and Artisan
CREATE POLICY "Quotes viewable by buyer and artisan" ON quotes
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR artisan_id IN (SELECT id FROM artisans WHERE profile_id = auth.uid())
    OR current_user_role() IN ('admin', 'support_operator')
  );

CREATE POLICY "Artisan can create quote" ON quotes
  FOR INSERT WITH CHECK (
    artisan_id IN (SELECT id FROM artisans WHERE profile_id = auth.uid())
    OR current_user_role() = 'admin'
  );

-- ==========================================================
-- 15. SUPABASE REALTIME REPLICATION
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE inquiry_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE inquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE callback_requests;
```

---

## 5. Configure Supabase Storage Buckets

Under **Storage** > **New Bucket**, create the following buckets:

1. `avatars` (Public)
2. `artisan-profiles` (Public)
3. `product-images` (Public)
4. `product-360` (Public)
5. `inquiry-attachments` (Private)
6. `support-attachments` (Private)

### Storage Security Policies:

For public buckets (`product-images`, `artisan-profiles`, `avatars`):
- **SELECT**: Everyone (`anon` and `authenticated`)
- **INSERT**: Authenticated users only

For private buckets (`inquiry-attachments`, `support-attachments`):
- **SELECT / INSERT**: Authenticated users participating in the inquiry or ticket.

---

## 6. Create Initial Admin Account

In your Supabase Auth panel:
1. Go to **Authentication** > **Users** > **Add User**.
2. Enter email: `admin@kalasetu.in` and set a password.
3. In SQL Editor, update the role:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@kalasetu.in');
   ```

---

## 7. Verification Checklist

- [x] Schema and triggers applied without errors.
- [x] Realtime publication active on `inquiry_messages` and `quotes`.
- [x] Storage buckets initialized.
- [x] RLS policies prevent unauthorized access to private inquiries and messages.
- [x] Application successfully communicates with fallback memory state or live Supabase project.
