# 🔥 FIREBASE AUTH SETUP - ULTRA DETAILED GUIDE

Panduan setup lengkap untuk migrasi dari Supabase Auth ke Firebase Auth.

---

## 📋 DAFTAR ISI

1. [Overview Perubahan](#overview-perubahan)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Firebase Project](#step-1-create-firebase-project)
4. [Step 2: Enable Authentication](#step-2-enable-authentication)
5. [Step 3: Get Firebase Config](#step-3-get-firebase-config)
6. [Step 4: Setup Environment Variables](#step-4-setup-environment-variables)
7. [Step 5: Install Dependencies](#step-5-install-dependencies)
8. [Step 6: Verify Setup](#step-6-verify-setup)
9. [Troubleshooting](#troubleshooting)
10. [Perubahan File](#perubahan-file)

---

## 🔍 OVERVIEW PERUBAHAN

### Apa yang berubah?

| Fitur | Sebelum (Supabase) | Sesudah (Firebase) |
|-------|-------------------|-------------------|
| Auth Provider | Supabase Auth | Firebase Auth |
| OAuth Method | Redirect | Popup |
| Callback URL | `/auth/callback` | Tidak diperlukan |
| User Storage | Supabase `profiles` table | Firebase Auth + local state |
| Session | Supabase session | Firebase ID Token |

### File yang dimodifikasi:

1. `src/hooks/useAuth.ts` - Rewrite total untuk Firebase
2. `src/lib/firebase.ts` - Konfigurasi Firebase
3. `src/App.tsx` - Ganti AuthProvider
4. `src/sections/AuthSection.tsx` - Update login UI
5. `src/components/AuthCallback.tsx` - Simplified
6. `src/hooks/useProducts.ts` - Mock data only
7. `src/hooks/useSupport.ts` - localStorage based

---

## 📦 PREREQUISITES

Pastikan Anda memiliki:

- [ ] Node.js 18+ terinstall
- [ ] Akun Google (Gmail)
- [ ] Project ini sudah di-clone
- [ ] Terminal/Command Prompt

---

## 🚀 STEP 1: CREATE FIREBASE PROJECT

### 1.1 Buka Firebase Console

1. Buka browser dan kunjungi: https://console.firebase.google.com
2. Login dengan akun Google Anda

### 1.2 Buat Project Baru

1. Klik tombol **"Create a project"** (atau "Add project")
2. **Step 1: Name your project**
   - Masukkan nama project: `layanan-digital-auth` (atau nama lain)
   - Klik **Continue**
   
3. **Step 2: Google Analytics (Optional)**
   - Pilih **"Enable Google Analytics for this project"** (opsional)
   - Atau matikan centang jika tidak perlu
   - Klik **Continue**
   
4. **Step 3: Configure Google Analytics** (jika di-enable)
   - Pilih akun Google Analytics
   - Klik **Create project**
   
5. Tunggu sampai project selesai dibuat
6. Klik **Continue**

---

## 🔐 STEP 2: ENABLE AUTHENTICATION

### 2.1 Buka Authentication Section

1. Di Firebase Console, klik menu **"Build"** di sidebar kiri
2. Klik **"Authentication"**
3. Klik tab **"Sign-in method"**
4. Klik **"Get started"** (jika muncul)

### 2.2 Enable Email/Password Provider

1. Di daftar providers, cari **"Email/Password"**
2. Klik pada **"Email/Password"**
3. Toggle switch **"Enable"** ke posisi ON
4. Untuk **"Email link (passwordless sign-in)"** biarkan OFF
5. Klik **Save**

### 2.3 Enable Google Provider

1. Klik **"Add new provider"**
2. Pilih **"Google"**
3. Toggle **"Enable"** ke posisi ON
4. Masukkan **Support email**: pilih email Anda dari dropdown
5. Klik **Save**

### 2.4 (Opsional) Enable Providers Lain

Jika ingin menggunakan provider lain:

- **Facebook**: Butuh Facebook App ID & Secret
- **GitHub**: Butuh GitHub OAuth App
- **Twitter**: Butuh Twitter API Keys

---

## ⚙️ STEP 3: GET FIREBASE CONFIG

### 3.1 Buka Project Settings

1. Di Firebase Console, klik ikon **gear (⚙️)** di sebelah "Project Overview"
2. Klik **"Project settings"**

### 3.2 Get Config Values

1. Di tab **"General"**, scroll ke bawah ke section **"Your apps"**
2. Klik ikon **"</>"** (Web) untuk menambahkan aplikasi web
3. **Register app**:
   - Masukkan **App nickname**: `layanan-digital-web`
   - Biarkan **"Also set up Firebase Hosting"** unchecked
   - Klik **Register app**
   
4. Copy config values yang muncul:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // <-- COPY INI
  authDomain: "your-project.firebaseapp.com",  // <-- COPY INI
  projectId: "your-project-id",     // <-- COPY INI
  storageBucket: "your-project.appspot.com",   // <-- COPY INI
  messagingSenderId: "123456789",   // <-- COPY INI
  appId: "1:123456789:web:abcdef"   // <-- COPY INI
};
```

5. Klik **"Continue to console"**

---

## 📝 STEP 4: SETUP ENVIRONMENT VARIABLES

### 4.1 Edit File .env

1. Buka file `.env` di root project
2. Tambahkan Firebase config:

```env
# ============================================
# FIREBASE CONFIGURATION (WAJIB)
# ============================================
# Ganti dengan values dari Firebase Console
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4.2 Contoh Lengkap .env

```env
# ============================================
# WEBSITE CONFIGURATION
# ============================================
VITE_SITE_NAME=Layanan Digital
VITE_SITE_DESCRIPTION="Solusi Digital untuk Kebutuhan Anda"
VITE_SITE_URL=https://web1-two-nu.vercel.app

# Owner Information
VITE_OWNER_NAME=Fakhul
VITE_OWNER_EMAIL=fakhulrohman2@gmail.com
VITE_OWNER_PHONE=085183518016

# ============================================
# FIREBASE CONFIGURATION (WAJIB)
# ============================================
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=layanan-digital-auth.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=layanan-digital-auth
VITE_FIREBASE_STORAGE_BUCKET=layanan-digital-auth.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# ============================================
# SUPABASE CONFIGURATION (TIDAK DIGUNAKAN LAGI)
# ============================================
# Hapus atau biarkan saja, tidak digunakan untuk auth
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# ============================================
# EMAILJS CONFIGURATION (OPSIONAL)
# ============================================
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# ============================================
# TELEGRAM BOT CONFIGURATION (OPSIONAL)
# ============================================
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_PAYMENT=true
VITE_ENABLE_LIVE_CHAT=true
```

---

## 📦 STEP 5: INSTALL DEPENDENCIES

### 5.1 Install Firebase SDK

```bash
cd /root/web1
npm install firebase
```

### 5.2 Verify Installation

```bash
npm list firebase
```

Harus menampilkan versi firebase yang terinstall, contoh:
```
└── firebase@10.x.x
```

---

## ✅ STEP 6: VERIFY SETUP

### 6.1 Build Project

```bash
npm run build
```

Pastikan tidak ada error.

### 6.2 Run Development Server

```bash
npm run dev
```

Buka browser di http://localhost:5173

### 6.3 Test Authentication

1. **Test Login dengan Google**:
   - Buka halaman `/auth`
   - Klik "Lanjutkan dengan Google"
   - Pilih akun Google
   - Harus berhasil login dan redirect ke beranda

2. **Test Register dengan Email**:
   - Buka halaman `/auth`
   - Klik tab "Daftar"
   - Isi form dengan data valid
   - Klik "Daftar"
   - Harus berhasil register dan login otomatis

3. **Test Login dengan Email**:
   - Logout terlebih dahulu
   - Buka halaman `/auth`
   - Isi email dan password yang sudah diregister
   - Klik "Masuk"
   - Harus berhasil login

### 6.4 Check Browser Console

Buka Developer Tools (F12) → Console:

- Harus ada log: `[Firebase] Configured: true`
- Tidak ada error merah terkait Firebase

---

## 🔧 TROUBLESHOOTING

### Error: "Firebase Belum Dikonfigurasi"

**Penyebab**: Environment variables belum di-set

**Solusi**:
```bash
# 1. Cek file .env ada
cat .env | grep FIREBASE

# 2. Pastikan semua values terisi
# 3. Restart dev server
npm run dev
```

### Error: "auth/invalid-api-key"

**Penyebab**: API Key salah atau tidak valid

**Solusi**:
1. Buka Firebase Console → Project Settings
2. Copy ulang API Key
3. Paste ke .env
4. Restart server

### Error: "auth/popup-closed-by-user"

**Penyebab**: User menutup popup Google selesai

**Solusi**: Ini normal, user perlu mencoba lagi dan menyelesaikan login

### Error: "auth/popup-blocked"

**Penyebab**: Browser memblokir popup

**Solusi**:
1. Allow popup untuk domain ini
2. Atau ubah browser settings untuk mengizinkan popup

### Error: "auth/account-exists-with-different-credential"

**Penyebab**: Email sudah terdaftar dengan provider lain

**Solusi**: User harus login dengan method yang sama saat pertama kali mendaftar

### Error Build: "Cannot find module 'firebase/auth'"

**Penyebab**: Firebase belum terinstall

**Solusi**:
```bash
npm install firebase
```

---

## 📁 PERUBAHAN FILE

### File Baru/Terupdate:

1. **src/hooks/useAuth.ts** (838 baris)
   - Hook authentication lengkap dengan Firebase
   - Support Google OAuth, Email/Password
   - Error handling dalam Bahasa Indonesia

2. **src/lib/firebase.ts** (194 baris)
   - Konfigurasi Firebase
   - Helper functions
   - Error code mapping

3. **src/App.tsx**
   - Menggunakan `FirebaseAuthProvider`
   - Menghapus dependency Supabase Auth

4. **src/sections/AuthSection.tsx**
   - UI login/register
   - Integrasi dengan useAuth baru

5. **src/components/AuthCallback.tsx**
   - Simplified (Firebase pakai popup)

6. **src/hooks/useProducts.ts**
   - Mock data sebagai primary source
   - Tidak bergantung ke Supabase

7. **src/hooks/useSupport.ts**
   - localStorage untuk tiket
   - Notifikasi Telegram/Email opsional

---

## 🔒 KEAMANAN

### Rules yang Penting:

1. **Jangan commit file .env ke git**
   ```bash
   # Pastikan .env ada di .gitignore
   echo ".env" >> .gitignore
   ```

2. **API Key Firebase aman untuk client-side**
   - Firebase API Key boleh di-expose ke client
   - Security menggunakan Firebase Security Rules
   - Domain restriction sudah diatur di Firebase Console

3. **Enable Domain Restriction** (Production)
   - Firebase Console → Authentication → Settings
   - Authorized domains → Add your domain

---

## 📞 SUPPORT

Jika mengalami masalah:

1. Cek browser console untuk error detail
2. Verifikasi semua environment variables terisi
3. Pastikan Firebase Auth sudah di-enable
4. Coba hard refresh (Ctrl+Shift+R)

---

**Versi Dokumen**: 1.0  
**Terakhir Update**: 2026-02-14  
**Firebase Version**: ^10.x.x
