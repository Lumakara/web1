# 📘 Panduan Setup Manual Ultra Detail

> **Project:** Layanan Digital  
> **Version:** 1.0.0  
> **Last Updated:** 13 Februari 2026

---

## 📋 Daftar Isi

1. [Setup Environment Variables](#1-setup-environment-variables)
2. [Konfigurasi Supabase Auth](#2-konfigurasi-supabase-auth)
3. [Setup OAuth Providers](#3-setup-oauth-providers)
4. [Konfigurasi Telegram Bot](#4-konfigurasi-telegram-bot)
5. [Setup EmailJS](#5-setup-emailjs)
6. [Konfigurasi Payment Gateway](#6-konfigurasi-payment-gateway)
7. [Security Fixes](#7-security-fixes)
8. [Deployment](#8-deployment)

---

## 1. 🔐 Setup Environment Variables

### 1.1 Copy Environment File

```bash
# Copy file environment
cp .env.example .env

# Atau langsung edit file .env yang sudah ada
nano .env
```

### 1.2 Variabel Wajib

| Variable | Deskripsi | Contoh Value |
|----------|-----------|--------------|
| `VITE_SITE_URL` | URL website production | `https://web1-two-nu.vercel.app` |
| `VITE_SUPABASE_URL` | URL Supabase project | `https://ojwbrhxdencqqrexezhe.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase | `eyJhbGciOiJIUzI1NiIs...` |

### 1.3 Site URL Configuration (KRITIS!)

> ⚠️ **PERHATIAN:** Ini adalah penyebab utama redirect ke localhost!

**Langkah-langkah:**

1. **Buka Supabase Dashboard:**
   - Kunjungi: https://supabase.com/dashboard
   - Login dengan akun Anda
   - Pilih project: `ojwbrhxdencqqrexezhe`

2. **Konfigurasi Site URL:**
   ```
   Navigation: Authentication > URL Configuration
   
   Site URL: https://web1-two-nu.vercel.app
   
   Redirect URLs (tambahkan semua):
   - https://web1-two-nu.vercel.app/auth/callback
   - https://web1-two-nu.vercel.app
   - http://localhost:5173/auth/callback (untuk development)
   ```

3. **Screenshot:**
   ```
   ┌─────────────────────────────────────────┐
   │  URL Configuration                      │
   ├─────────────────────────────────────────┤
   │                                         │
   │  Site URL *                             │
   │  ┌─────────────────────────────────┐   │
   │  │ https://web1-two-nu.vercel.app  │   │
   │  └─────────────────────────────────┘   │
   │                                         │
   │  Redirect URLs                          │
   │  ┌─────────────────────────────────┐   │
   │  │ /auth/callback                  │   │
   │  └─────────────────────────────────┘   │
   │  [+ Add URL]                            │
   │                                         │
   └─────────────────────────────────────────┘
   ```

---

## 2. 🔥 Konfigurasi Supabase Auth

### 2.1 Enable Auth Providers

**Langkah-langkah Detail:**

1. **Akses Auth Settings:**
   ```
   Dashboard > Authentication > Providers
   ```

2. **Enable Email Provider:**
   ```yaml
   Provider: Email
   Status: Enabled ✅
   
   Confirm Email: Enabled (recommended)
   Secure Email Change: Enabled
   Mailer OTP Expiration: 3600 seconds
   ```

### 2.2 Setup Email Templates

**Template: Confirm Signup**

```html
<h2>Konfirmasi Email Anda</h2>

<p>Halo {{ .Data.name }},</p>

<p>Terima kasih telah mendaftar di Layanan Digital. Klik tombol di bawah untuk mengaktifkan akun Anda:</p>

<a href="{{ .ConfirmationURL }}" 
   style="background: #2563eb; color: white; padding: 12px 24px; 
          text-decoration: none; border-radius: 8px; display: inline-block;">
  Konfirmasi Email
</a>

<p>Atau salin link berikut:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Link ini berlaku selama 24 jam.</p>

<hr>
<p><small>Layanan Digital - Solusi Digital untuk Kebutuhan Anda</small></p>
```

**Template: Reset Password**

```html
<h2>Reset Password</h2>

<p>Halo,</p>

<p>Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah:</p>

<a href="{{ .ConfirmationURL }}"
   style="background: #f97316; color: white; padding: 12px 24px;
          text-decoration: none; border-radius: 8px; display: inline-block;">
  Reset Password
</a>

<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
```

---

## 3. 🔗 Setup OAuth Providers

### 3.1 Google OAuth Setup (Ultra Detail)

#### Step 1: Google Cloud Console

1. **Buka:** https://console.cloud.google.com/
2. **Login** dengan akun Google Anda
3. **Buat Project Baru** atau pilih project existing

```
┌─────────────────────────────────────────┐
│  Select a project ▼                      │
│  ─────────────────────────────────────  │
│  [+ New Project]                         │
│                                         │
│  My Projects                             │
│  ○ layanan-digital-123                   │
│  ○ project-lain                          │
└─────────────────────────────────────────┘
```

#### Step 2: Enable Google+ API

```
Navigation: APIs & Services > Library

Search: "Google+ API" atau "Google Identity Toolkit"
Click: [ENABLE]
```

#### Step 3: Configure OAuth Consent Screen

```
Navigation: APIs & Services > OAuth consent screen

1. Pilih User Type:
   [●] External (Untuk umum)
   
2. Klik [CREATE]

3. Isi App Information:
   ┌────────────────────────────────────────┐
   │ App name:        Layanan Digital       │
   │ User support     fakhulrohman2@        │
   │ email:           gmail.com             │
   │                                        │
   │ App domain:                            │
   │ Application      https://web1-two-nu.  │
   │ home page:       vercel.app            │
   │                                        │
   │ Authorized       https://web1-two-nu.  │
   │ domains:         vercel.app            │
   │                                        │
   │ Developer          Fakhul              │
   │ contact info:                          │
   └────────────────────────────────────────┘

4. Klik [SAVE AND CONTINUE]

5. Scopes (Add Scope):
   - email
   - profile
   - openid
   
6. Klik [SAVE AND CONTINUE]

7. Test Users (Optional untuk development)
   - Add your email
   
8. Klik [SAVE AND CONTINUE] > [BACK TO DASHBOARD]
```

#### Step 4: Create OAuth Credentials

```
Navigation: APIs & Services > Credentials

1. Click: [+ CREATE CREDENTIALS] > [OAuth client ID]

2. Application type: Web application

3. Configure OAuth Client:
   ┌────────────────────────────────────────┐
   │ Name: Layanan Digital Web              │
   │                                        │
   │ Authorized JavaScript origins:         │
   │ • https://web1-two-nu.vercel.app       │
   │ • http://localhost:5173                │
   │                                        │
   │ Authorized redirect URIs:              │
   │ • https://ojwbrhxdencqqrexezhe.        │
   │   supabase.co/auth/v1/callback         │
   │                                        │
   │ [+ ADD URI] untuk tambahan             │
   └────────────────────────────────────────┘

4. Klik [CREATE]

5. Simpan Client ID dan Client Secret yang muncul!
```

#### Step 5: Configure di Supabase

```
Dashboard: https://supabase.com/dashboard
Project: ojwbrhxdencqqrexezhe
Navigate: Authentication > Providers > Google

Enabled: ✅ ON
Client ID: [paste dari Google Cloud]
Client Secret: [paste dari Google Cloud]

Redirect URL (akan otomatis):
https://ojwbrhxdencqqrexezhe.supabase.co/auth/v1/callback

[Save]
```

### 3.2 GitHub OAuth Setup

#### Step 1: GitHub Developer Settings

```
1. Login ke GitHub
2. Click foto profil (kanan atas) > Settings
3. Scroll bawah > Developer settings
4. OAuth Apps > [New OAuth App]
```

#### Step 2: Register New OAuth Application

```
┌─────────────────────────────────────────┐
│ Register a new OAuth application        │
├─────────────────────────────────────────┤
│                                         │
│ Application name *                      │
│ ┌─────────────────────────────────┐    │
│ │ Layanan Digital                 │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Homepage URL *                          │
│ ┌─────────────────────────────────┐    │
│ │ https://web1-two-nu.vercel.app  │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Application description                 │
│ ┌─────────────────────────────────┐    │
│ │ Solusi Digital Profesional      │    │
│ └─────────────────────────────────┘    │
│                                         │
│ Authorization callback URL *            │
│ ┌─────────────────────────────────┐    │
│ │ https://ojwbrhxdencqqrexezhe.   │    │
│ │ supabase.co/auth/v1/callback    │    │
│ └─────────────────────────────────┘    │
│                                         │
│           [Register application]        │
└─────────────────────────────────────────┘
```

#### Step 3: Get Client ID & Secret

```
Setelah register, akan muncul:

Client ID:     Iv23lixxxxxxxxxxxxxx
Client Secret: [Generate dengan klik button]

Simpan keduanya!
```

#### Step 4: Configure di Supabase

```
Dashboard > Authentication > Providers > GitHub

Enabled: ✅ ON
Client ID: [paste dari GitHub]
Client Secret: [paste dari GitHub]

[Save]
```

### 3.3 Facebook OAuth Setup

#### Step 1: Facebook Developers

```
1. Buka: https://developers.facebook.com/
2. Login dengan akun Facebook
3. My Apps > [Create App]
```

#### Step 2: Create App

```
Select app type: Consumer
[Next]

Basic Information:
- App Display Name: Layanan Digital
- App Contact Email: fakhulrohman2@gmail.com
- App Purpose: Yourself or your own business

[Create App]
```

#### Step 3: Add Facebook Login Product

```
1. Di Dashboard App, scroll ke "Add a Product"
2. Cari "Facebook Login" > [Set Up]
3. Pilih platform: Web
```

#### Step 4: Configure Facebook Login

```
Settings > Basic

┌─────────────────────────────────────────┐
│ Valid OAuth Redirect URIs               │
├─────────────────────────────────────────┤
│ https://ojwbrhxdencqqrexezhe.           │
│ supabase.co/auth/v1/callback            │
└─────────────────────────────────────────┘

Save Changes
```

#### Step 5: Get App ID & Secret

```
Settings > Basic

App ID:     123456789012345
App Secret: [Klik Show]

Simpan keduanya!
```

#### Step 6: Configure di Supabase

```
Dashboard > Authentication > Providers > Facebook

Enabled: ✅ ON
Client ID: [App ID dari Facebook]
Client Secret: [App Secret dari Facebook]

[Save]
```

---

## 4. 🤖 Konfigurasi Telegram Bot

### 4.1 Create Bot dengan BotFather

```
1. Buka Telegram
2. Cari: @BotFather
3. Start chat
4. Kirim perintah: /newbot
```

**Percakapan dengan BotFather:**

```
You: /newbot

BotFather: Alright, a new bot. How are we going to call it? 
           Please choose a name for your bot.

You: Layanan Digital Notifier

BotFather: Good. Now let's choose a username for your bot. 
           It must end in `bot`. Like this, for example: 
           TetrisBot or tetris_bot.

You: layanandigital_bot

BotFather: Done! Congratulations on your new bot. 
           You will find it at t.me/layanandigital_bot. 
           You can now add a description, about section 
           and profile picture for your bot.
           
           Use this token to access the HTTP API:
           8010136953:AAHnKUy_0jgJN5grZIgSDzbtTJznfqq5was
           
           Keep your token secure and store it safely, 
           it can be used by anyone to control your bot.
```

**Simpan token yang diberikan!**

### 4.2 Get Chat ID

#### Method 1: Via @userinfobot

```
1. Cari: @userinfobot di Telegram
2. Start chat
3. Bot akan mengirimkan ID Anda

Contoh response:
@yourusername
Id: 1841202339
First: Nama
Last: Anda
```

#### Method 2: Via API (Setelah bot aktif)

```bash
# Kirim pesan ke bot terlebih dahulu
# Kemudian:
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates

# Cari di response:
# "chat":{"id":1841202339,"first_name":"...","type":"private"}
```

### 4.3 Update Environment Variables

```bash
# Edit .env file
nano .env

# Tambahkan:
VITE_TELEGRAM_BOT_TOKEN=8010136953:AAHnKUy_0jgJN5grZIgSDzbtTJznfqq5was
VITE_TELEGRAM_CHAT_ID=1841202339
```

### 4.4 Test Bot Connection

```bash
# Test via curl
curl -X POST \
  https://api.telegram.org/bot8010136953:AAHnKUy_0jgJN5grZIgSDzbtTJznfqq5was/sendMessage \
  -d "chat_id=1841202339" \
  -d "text=🚀 Bot Telegram berhasil dikonfigurasi!"
```

---

## 5. 📧 Setup EmailJS

### 5.1 Register & Create Service

```
1. Buka: https://www.emailjs.com/
2. Sign up dengan email
3. Verifikasi email
4. Login ke dashboard
```

### 5.2 Add Email Service

```
Dashboard > Email Services > Add New Service

Pilih: Gmail (atau service lainnya)
Name: Layanan Digital Gmail

[Connect Account]
→ Akan redirect ke Google OAuth
→ Pilih akun Gmail Anda
→ Beri izin
```

### 5.3 Create Email Templates

#### Template 1: Welcome Email

```
Dashboard > Email Templates > Create New Template

Template Name: welcome_email
Template ID: template_wde52ji (otomatis)

Subject: Selamat Datang di Layanan Digital!

Body (HTML):
```

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #f97316); 
              color: white; padding: 30px; text-align: center; 
              border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .button { background: #2563eb; color: white; padding: 12px 30px; 
              text-decoration: none; border-radius: 5px; 
              display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Selamat Datang!</h1>
    </div>
    <div class="content">
      <h2>Halo {{to_name}},</h2>
      <p>Terima kasih telah bergabung dengan <strong>Layanan Digital</strong>!</p>
      <p>Akun Anda telah berhasil dibuat dengan email: <strong>{{user_email}}</strong></p>
      <p>Tanggal registrasi: {{registration_date}}</p>
      <br>
      <a href="https://web1-two-nu.vercel.app" class="button">Kunjungi Website</a>
    </div>
    <div class="footer">
      <p>© 2026 Layanan Digital. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 5.4 Get Public Key

```
Dashboard > Account > General

Public Key: LAT-HrbHtUzHZ9J3W
```

### 5.5 Update .env

```bash
VITE_EMAILJS_SERVICE_ID=service_r2acb9x
VITE_EMAILJS_WELCOME_TEMPLATE_ID=template_wde52ji
VITE_EMAILJS_OWNER_TEMPLATE_ID=template_izz3hk6
VITE_EMAILJS_PAYMENT_TEMPLATE_ID=template_izz3hk6
VITE_EMAILJS_PUBLIC_KEY=LAT-HrbHtUzHZ9J3W
```

---

## 6. 💳 Konfigurasi Payment Gateway (Pakasir)

### 6.1 Register Pakasir Account

```
1. Buka: https://pakasir.com/
2. Klik: Daftar
3. Isi form pendaftaran:
   - Nama Lengkap
   - Email
   - Nomor WhatsApp
   - Password
4. Verifikasi email
```

### 6.2 Get API Credentials

```
Dashboard > Pengaturan > API & Integrasi

Merchant Slug: layanandigitalfakhul
API Key: sF3zElSEcXhp2wAhGitx35VmQk5dovpv

Simpan dengan aman!
```

### 6.3 Konfigurasi Callback URL

```
Dashboard > Pengaturan > Callback URL

Callback URL: https://web1-two-nu.vercel.app/api/payment/callback
Return URL: https://web1-two-nu.vercel.app/payment/success
```

### 6.4 Update .env

```bash
VITE_PAKASIR_SLUG=layanandigitalfakhul
VITE_PAKASIR_API_KEY=sF3zElSEcXhp2wAhGitx35VmQk5dovpv
```

---

## 7. 🔒 Security Fixes

### 7.1 Apply SQL Fixes

```bash
# Buka Supabase SQL Editor
# Dashboard > SQL Editor > New Query

# Copy semua isi file: supabase-security-fixes.sql
# Paste ke SQL Editor
# Klik: Run
```

### 7.2 Enable Leaked Password Protection

```
Dashboard > Authentication > Policies > Security & Protection

[✅] Prevent use of leaked passwords

Save
```

### 7.3 Configure CORS

```
Dashboard > Settings > API > CORS (Cross-Origin Resource Sharing)

Allowed Origins:
- https://web1-two-nu.vercel.app
- http://localhost:5173 (development)
```

---

## 8. 🚀 Deployment

### 8.1 Build Project

```bash
# Install dependencies
npm install

# Build untuk production
npm run build

# Hasil build ada di folder /dist
```

### 8.2 Deploy ke Vercel

#### Method 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Ikuti instruksi yang muncul
```

#### Method 2: Via Git Integration

```
1. Push code ke GitHub/GitLab/Bitbucket
2. Buka: https://vercel.com/
3. Import Project
4. Pilih repository
5. Configure:
   
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   
6. Environment Variables:
   Copy semua dari file .env
   
7. Deploy
```

### 8.3 Post-Deployment Checklist

- [ ] Website dapat diakses di https://web1-two-nu.vercel.app
- [ ] Login dengan Google berfungsi
- [ ] Login dengan GitHub berfungsi
- [ ] Login dengan Facebook berfungsi
- [ ] Login dengan Email berfungsi
- [ ] Notifikasi Telegram masuk
- [ ] Email notifikasi terkirim
- [ ] Payment gateway berfungsi
- [ ] Form ticket support berfungsi

---

## 🆘 Troubleshooting

### Masalah: OAuth redirect ke localhost

**Solusi:**
1. Cek `VITE_SITE_URL` di .env
2. Cek Site URL di Supabase Auth Settings
3. Cek Redirect URLs di OAuth provider (Google/GitHub/Facebook)
4. Rebuild dan redeploy

### Masalah: Invalid API Key (Supabase)

**Solusi:**
1. Cek `VITE_SUPABASE_ANON_KEY` di .env
2. Pastikan menggunakan `anon` key, bukan `service_role` key
3. Cek di Supabase: Settings > API > Project API keys

### Masalah: Telegram notif tidak masuk

**Solusi:**
1. Cek `VITE_TELEGRAM_BOT_TOKEN` dan `VITE_TELEGRAM_CHAT_ID`
2. Pastikan sudah chat ke bot terlebih dahulu
3. Test dengan curl (lihat section 4.4)
4. Cek console browser untuk error

### Masalah: EmailJS tidak mengirim email

**Solusi:**
1. Cek `VITE_EMAILJS_PUBLIC_KEY`
2. Pastikan email service terhubung
3. Cek template ID benar
4. Cek console untuk error detail

---

## 📞 Support

Jika mengalami masalah, hubungi:

- Email: fakhulrohman2@gmail.com
- WhatsApp: https://wa.me/6285183518016
- Telegram: @fakhulxc

---

<p align="center">
  <strong>Layanan Digital</strong> - Solusi Digital untuk Kebutuhan Anda<br>
  © 2026 All Rights Reserved
</p>
