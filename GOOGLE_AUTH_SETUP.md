# Setup Google OAuth dengan Supabase - Panduan Lengkap

Panduan ultra detail untuk mengintegrasikan Google OAuth authentication dengan Supabase di project ini.

## 📋 Daftar Isi

1. [Ringkasan Alur OAuth](#1-ringkasan-alur-oauth)
2. [Konfigurasi Google Cloud Console](#2-konfigurasi-google-cloud-console)
3. [Konfigurasi Supabase](#3-konfigurasi-supabase)
4. [Konfigurasi Aplikasi](#4-konfigurasi-aplikasi)
5. [Troubleshooting](#5-troubleshooting)
6. [Keamanan](#6-keamanan)
7. [FAQ](#7-faq)

---

## 1. Ringkasan Alur OAuth

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   User      │────▶│  Klik "Login    │────▶│   Google    │
│             │     │  with Google"   │     │ Login Page  │
└─────────────┘     └─────────────────┘     └─────────────┘
                                                   │
                                                   ▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   User      │◀────│   Aplikasi      │◀────│  Redirect   │
│  Logged In  │     │  Proses Token   │     │  dengan Token│
└─────────────┘     └─────────────────┘     └─────────────┘
```

**Alur Detail:**
1. User klik "Login with Google"
2. Aplikasi redirect ke Google OAuth
3. User login dan authorize di Google
4. Google redirect kembali ke `https://web1-two-nu.vercel.app/auth/callback#access_token=...`
5. **PENTING:** Token ada di URL hash (setelah `#`), bukan query param
6. Supabase client otomatis membaca token dari hash
7. Aplikasi membuat/memperbarui profil user di database
8. User diarahkan ke halaman profil

---

## 2. Konfigurasi Google Cloud Console

### Step 2.1: Buat Project Baru (atau gunakan existing)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik dropdown project di navbar (sebelah "Google Cloud")
3. Klik "New Project"
4. Isi:
   - **Project name:** `Layanan Digital Auth`
   - **Location:** Pilih organization atau "No organization"
5. Klik "Create"
6. Tunggu project dibuat, lalu pilih project tersebut

### Step 2.2: Enable Google+ API

1. Di sidebar, klik "APIs & Services" > "Library"
2. Cari "Google+ API" atau "Google People API"
3. Klik hasilnya, lalu klik "Enable"
4. Tunggu beberapa saat sampai API enabled

### Step 2.3: Konfigurasi OAuth Consent Screen

1. Di sidebar, klik "APIs & Services" > "OAuth consent screen"
2. Pilih **User Type:**
   - Pilih "External" (untuk production, semua user bisa login)
   - Pilih "Internal" (hanya user dalam organization)
3. Klik "Create"
4. Isi App Information:
   ```
   App name: Layanan Digital
   User support email: fakhulrohman2@gmail.com
   ```
5. Isi App Domain (penting untuk production):
   ```
   Application home page: https://web1-two-nu.vercel.app
   Application privacy policy link: https://web1-two-nu.vercel.app/privacy
   Application terms of service link: https://web1-two-nu.vercel.app/terms
   ```
6. Isi Developer Contact Information:
   ```
   Email addresses: fakhulrohman2@gmail.com
   ```
7. Klik "Save and Continue"
8. Di halaman "Scopes", klik "Add or Remove Scopes"
   - Cari dan pilih:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Klik "Update", lalu "Save and Continue"
9. Di halaman "Test users" (untuk External):
   - Klik "Add Users"
   - Masukkan email untuk testing: `lumakarav3@gmail.com`
   - Klik "Add", lalu "Save and Continue"
10. Review summary, lalu klik "Back to Dashboard"

### Step 2.4: Buat OAuth 2.0 Credentials

1. Di sidebar, klik "APIs & Services" > "Credentials"
2. Klik "+ Create Credentials" > "OAuth client ID"
3. Pilih Application type: "Web application"
4. Isi Name: `Layanan Digital Web Client`
5. **PENTING - Authorized JavaScript origins:**
   ```
   https://web1-two-nu.vercel.app
   http://localhost:5173  (untuk development)
   ```
6. **PENTING - Authorized redirect URIs:**
   ```
   https://web1-two-nu.vercel.app/auth/callback
   https://ojwbrhxdencqqrexezhe.supabase.co/auth/v1/callback  (Supabase URL)
   ```
7. Klik "Create"
8. **SIMPAN CLIENT ID DAN CLIENT SECRET:**
   - Client ID: `xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Klik "Download JSON" untuk backup

---

## 3. Konfigurasi Supabase

### Step 3.1: Buka Supabase Dashboard

1. Buka [Supabase Dashboard](https://app.supabase.io/)
2. Pilih project: `ojwbrhxdencqqrexezhe`
3. Klik "Authentication" di sidebar

### Step 3.2: Enable Google Provider

1. Di Authentication > Providers
2. Cari "Google" dan klik
3. Toggle "Enable Google"
4. Masukkan credentials dari Google Cloud:
   ```
   Client ID: (paste dari Google Cloud Console)
   Client Secret: (paste dari Google Cloud Console)
   ```
5. **Redirect URL (penting):**
   ```
   https://web1-two-nu.vercel.app/auth/callback
   ```
6. Klik "Save"

### Step 3.3: Verifikasi Site URL

1. Di Authentication > URL Configuration
2. Pastikan Site URL:
   ```
   https://web1-two-nu.vercel.app
   ```
3. Tambahkan Additional Redirect URLs jika perlu:
   ```
   https://web1-two-nu.vercel.app/auth/callback
   http://localhost:5173/auth/callback  (untuk dev)
   ```

### Step 3.4: Setup Database Schema

Pastikan tabel `profiles` sudah ada:

```sql
-- Buat tabel profiles jika belum ada
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 4. Konfigurasi Aplikasi

### Step 4.1: Environment Variables

Pastikan `.env` sudah benar:

```env
# ============================================
# WEBSITE CONFIGURATION
# ============================================
VITE_SITE_NAME=Layanan Digital
VITE_SITE_DESCRIPTION="Solusi Digital untuk Kebutuhan Anda"
VITE_SITE_URL=https://web1-two-nu.vercel.app

# ============================================
# SUPABASE CONFIGURATION
# ============================================
VITE_SUPABASE_URL=https://ojwbrhxdencqqrexezhe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4.2: Verifikasi AuthCallback Component

File: `src/components/AuthCallback.tsx`

```tsx
// Sudah diupdate untuk menangani hash fragment dari OAuth
// Token Google ada di: window.location.hash (setelah #)
// Bukan di: window.location.search (setelah ?)
```

### Step 4.3: Verifikasi Routes

File: `src/App.tsx`

```tsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

### Step 4.4: Vercel Configuration

File: `vercel.json`

```json
{
  "rewrites": [
    { "source": "/auth/callback", "destination": "/index.html" },
    ...
  ]
}
```

---

## 5. Troubleshooting

### Error: "404 Not Found" setelah login Google

**Penyebab:** URL callback tidak di-handle oleh React Router

**Solusi:**
1. Pastikan `vercel.json` memiliki rewrite rule untuk `/auth/callback`
2. Pastikan route `/auth/callback` ada di App.tsx
3. Clear browser cache dan coba lagi

### Error: "No session found"

**Penyebab:** Supabase tidak bisa membaca token dari URL hash

**Solusi:**
1. Pastikan redirect URL di Google Cloud Console benar
2. Pastikan Supabase Auth settings > Site URL benar
3. Cek console log untuk debug info

### Error: "redirect_uri_mismatch"

**Penyebab:** Redirect URI tidak cocok dengan yang didaftarkan

**Solusi:**
1. Cek Authorized redirect URIs di Google Cloud Console
2. Pastikan URL sama persis (termasuk http/https)
3. Tambahkan semua kemungkinan URL (www/non-www, trailing slash)

### Error: "This app is not verified"

**Penyebab:** OAuth consent screen belum diverifikasi Google

**Solusi:**
1. Untuk testing: Tambahkan email sebagai "Test users"
2. Untuk production: Submit untuk verification di Google Cloud Console
3. Proses verification bisa memakan waktu 3-5 hari kerja

### Error: "User canceled the login"

**Penyebab:** User menutup popup atau mencancel permission

**Solusi:**
1. Ini normal behavior, tidak perlu fix
2. Tambahkan handling untuk case ini di UI

---

## 6. Keamanan

### Best Practices

1. **Jangan simpan Client Secret di frontend**
   - Client Secret hanya untuk server-side
   - Di frontend hanya perlu Client ID

2. **Gunakan HTTPS untuk production**
   - Google OAuth memerlukan HTTPS untuk production
   - Localhost bisa pakai HTTP untuk development

3. **Validasi state parameter**
   - Cegah CSRF attacks dengan state parameter
   - Sudah ditangani otomatis oleh Supabase

4. **Cek email verified**
   - Pastikan `email_verified` true sebelum proses
   - Google sudah verify email user

5. **Rate limiting**
   - Implement rate limiting untuk login attempts
   - Monitor failed login attempts

---

## 7. FAQ

### Q: Berapa lama session token berlaku?
**A:** Default Supabase session berlaku 1 jam (3600 detik). Refresh token berlaku 30 hari.

### Q: Apakah bisa login dengan multiple providers?
**A:** Ya, user bisa link multiple providers (Google, GitHub, etc) ke satu akun.

### Q: Bagaimana cara logout?
**A:** Panggil `await supabase.auth.signOut()` dan clear local state.

### Q: Apakah perlu verify email untuk Google login?
**A:** Tidak perlu, Google sudah verify email user.

### Q: Bagaimana jika user sudah punya akun email/password?
**A:** Supabase akan otomatis link OAuth login dengan akun existing jika email sama.

### Q: Bisa customize tampilan login Google?
**A:** Tidak bisa, tampilan login dikontrol oleh Google. Hanya bisa customize OAuth consent screen.

---

## Checklist Setup

- [ ] Buat project di Google Cloud Console
- [ ] Enable Google+ API
- [ ] Setup OAuth consent screen
- [ ] Buat OAuth 2.0 credentials
- [ ] Simpan Client ID dan Client Secret
- [ ] Konfigurasi provider di Supabase
- [ ] Verifikasi Site URL di Supabase
- [ ] Setup database schema
- [ ] Test login di development
- [ ] Deploy dan test di production
- [ ] Monitor error logs

---

## Kontak Support

Jika mengalami masalah:
1. Cek browser console untuk error messages
2. Cek Supabase Auth logs di dashboard
3. Cek Google Cloud Console > APIs & Services > Credentials
4. Hubungi: fakhulrohman2@gmail.com

---

**Last Updated:** 2026-02-13
**Version:** 1.0.0
