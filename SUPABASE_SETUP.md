# Panduan Setup Supabase Authentication & Database

Panduan lengkap untuk setup Supabase sebagai backend database dan authentication untuk aplikasi Layanan Digital.

## Table of Contents

- [Overview](#overview)
- [Step 1: Create Supabase Project](#step-1-create-supabase-project)
- [Step 2: Get API Keys](#step-2-get-api-keys)
- [Step 3: Database Schema Setup](#step-3-database-schema-setup)
- [Step 4: Authentication Setup](#step-4-authentication-setup)
- [Step 5: Row Level Security (RLS)](#step-5-row-level-security-rls)
- [Step 6: Triggers and Functions](#step-6-triggers-and-functions)
- [Step 7: Environment Variables](#step-7-environment-variables)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview

Supabase menyediakan:
- **PostgreSQL Database** dengan realtime subscriptions
- **Authentication** dengan multiple providers
- **Row Level Security** untuk data protection
- **Auto-generated APIs** untuk database operations
- **Storage** untuk file uploads

---

## Step 1: Create Supabase Project

1. Kunjungi [https://supabase.com](https://supabase.com) dan login/signup
2. Klik **"New Project"**
3. Isi konfigurasi:
   - **Organization**: Pilih atau buat baru
   - **Project Name**: `layanan-digital` (atau nama lain)
   - **Database Password**: Buat password yang kuat (simpan dengan aman!)
   - **Region**: Pilih terdekat dengan target audience
     - Untuk Indonesia: `Southeast Asia (Singapore)`
   - **Pricing Plan**: Free tier (cukup untuk development)
4. Klik **"Create new project"**
5. Tunggu ~2 menit untuk provisioning selesai

---

## Step 2: Get API Keys

1. Di Project Dashboard, klik **Settings** (ikon gear) di sidebar
2. Pilih **API** dari menu
3. Copy nilai berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** API key: `eyJhbG...`

4. Paste ke file `.env`:

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Database Schema Setup

Buka **SQL Editor** di Supabase Dashboard, lalu jalankan query berikut satu per satu:

### 3.1 Profiles Table

```sql
-- Profiles table untuk user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create index untuk performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);
```

### 3.2 Products Table

```sql
-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price INTEGER NOT NULL,
  discount_price INTEGER,
  stock INTEGER DEFAULT 0,
  image TEXT,
  icon TEXT,
  rating DECIMAL(3,2) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  duration TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  tiers JSONB DEFAULT '[]',
  related TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  type TEXT DEFAULT 'service',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_price ON products(base_price);
```

### 3.3 Orders Table

```sql
-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  payment_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
  ON orders FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admin policies
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 3.4 Support Tickets Table

```sql
-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update all tickets"
  ON support_tickets FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Indexes
CREATE INDEX idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_category ON support_tickets(category);
```

### 3.5 Pterodactyl Servers Table

```sql
-- Pterodactyl servers table
CREATE TABLE IF NOT EXISTS pterodactyl_servers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  server_id TEXT,
  panel_username TEXT NOT NULL,
  panel_password TEXT NOT NULL,
  package TEXT NOT NULL,
  domain TEXT,
  status TEXT DEFAULT 'pending',
  node_id INTEGER,
  allocation_id INTEGER,
  egg_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE pterodactyl_servers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own servers"
  ON pterodactyl_servers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own servers"
  ON pterodactyl_servers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all servers"
  ON pterodactyl_servers FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update all servers"
  ON pterodactyl_servers FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Indexes
CREATE INDEX idx_pterodactyl_user_id ON pterodactyl_servers(user_id);
CREATE INDEX idx_pterodactyl_status ON pterodactyl_servers(status);
CREATE INDEX idx_pterodactyl_server_id ON pterodactyl_servers(server_id);
```

### 3.6 WiFi Installations Table (SAMPE SINI)

```sql
-- WiFi installations table
CREATE TABLE IF NOT EXISTS wifi_installations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  package TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  ktp TEXT NOT NULL,
  address TEXT NOT NULL,
  sharelock_link TEXT,
  status TEXT DEFAULT 'pending',
  installation_date TIMESTAMP WITH TIME ZONE,
  technician_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wifi_installations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own installations"
  ON wifi_installations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own installations"
  ON wifi_installations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all installations"
  ON wifi_installations FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update all installations"
  ON wifi_installations FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Indexes
CREATE INDEX idx_wifi_user_id ON wifi_installations(user_id);
CREATE INDEX idx_wifi_status ON wifi_installations(status);
CREATE INDEX idx_wifi_phone ON wifi_installations(phone);
```

---

## Step 4: Authentication Setup

### 4.1 Enable Email Provider

1. Di Supabase Dashboard, klik **Authentication** → **Providers**
2. Enable **Email** provider
3. Konfigurasi:
   - **Confirm email**: Enable (disarankan untuk production)
   - **Secure email change**: Enable
   - **Secure password change**: Enable

### 4.2 Email Templates (Optional)

1. Klik **Email Templates** di sidebar
2. Customize template:
   - **Confirm signup**: Email konfirmasi registrasi
   - **Invite user**: Email undangan
   - **Magic Link**: Login tanpa password
   - **Change Email Address**: Konfirmasi ganti email
   - **Reset Password**: Email reset password

Template variables yang tersedia:
- `{{ .SiteURL }}` - URL aplikasi
- `{{ .Token }}` - Token konfirmasi
- `{{ .Email }}` - Email user
- `{{ .Data }}` - Custom data

### 4.3 Enable OAuth Providers (Optional)

1. Di **Authentication** → **Providers**
2. Enable providers yang diinginkan:
   - Google
   - GitHub
   - Facebook
   - Twitter
   - Discord

3. Untuk setup Google OAuth:
   - Buat project di [Google Cloud Console](https://console.cloud.google.com)
   - Enable Google+ API
   - Buat OAuth 2.0 credentials
   - Copy Client ID dan Client Secret ke Supabase

---

## Step 5: Row Level Security (RLS)

RLS sudah di-setup bersama dengan tabel. Berikut adalah summary policies:

### Profiles
| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | Public | Semua orang bisa lihat |
| INSERT | Own | Hanya insert data sendiri |
| UPDATE | Own | Hanya update data sendiri |

### Products
| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | Public | Semua orang bisa lihat |
| INSERT | Admin | Hanya admin |
| UPDATE | Admin | Hanya admin |
| DELETE | Admin | Hanya admin |

### Orders
| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | Own/Admin | User lihat order sendiri, admin lihat semua |
| INSERT | Own | User insert order sendiri |
| UPDATE | Own/Admin | User update order pending, admin update semua |

### Support Tickets
| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | Own/Admin | User lihat ticket sendiri, admin lihat semua |
| INSERT | Public | Siapapun bisa buat ticket |
| UPDATE | Admin | Hanya admin bisa update |

### Pterodactyl Servers
| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | Own/Admin | User lihat server sendiri |
| INSERT | Own | User insert server sendiri |
| UPDATE | Admin | Admin update status server |

### WiFi Installations
| Operation | Policy | Description |
|-----------|--------|-------------|
| SELECT | Own/Admin | User lihat instalasi sendiri |
| INSERT | Own | User insert instalasi sendiri |
| UPDATE | Admin | Admin update status instalasi |

---

## Step 6: Triggers and Functions

### 6.1 Auto-create Profile on Signup

```sql
-- Function untuk handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6.2 Update Timestamp Function

```sql
-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_pterodactyl_updated_at
  BEFORE UPDATE ON pterodactyl_servers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_wifi_updated_at
  BEFORE UPDATE ON wifi_installations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

## Step 7: Environment Variables

File `.env`:

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## API Reference

### Supabase Client Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'strongpassword',
  options: {
    data: {
      full_name: 'John Doe',
    }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'strongpassword'
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Listen auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

### Database Queries

```typescript
// Get all products
const { data: products } = await supabase
  .from('products')
  .select('*');

// Get product by ID
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single();

// Get user's orders
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', user.id);

// Insert order
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: user.id,
    items: [...],
    total_amount: 100000,
    status: 'pending'
  })
  .select()
  .single();

// Update order
await supabase
  .from('orders')
  .update({ status: 'paid' })
  .eq('id', orderId);

// Realtime subscription
supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

---

## Troubleshooting

### RLS Policy Error

**Error**: `new row violates row-level security policy`

**Solutions**:
1. Pastikan user sudah login (ada session)
2. Cek policy sudah benar dibuat
3. Verify user ID match dengan policy condition

### Trigger Not Working

**Error**: Profile tidak otomatis dibuat saat signup

**Solutions**:
```sql
-- Cek trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### CORS Error

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions**:
1. Tambahkan domain ke **Allowed Origins**:
   - Settings → API → Allowed Origins
   - Add: `https://yourdomain.com`
   - Add: `http://localhost:5173` (untuk development)

### Connection Issues

**Error**: `Failed to fetch`

**Solutions**:
1. Cek URL Supabase benar
2. Verify API key valid
3. Cek network connection
4. Pastikan tidak ada adblocker yang memblokir

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Pricing](https://supabase.com/pricing)
