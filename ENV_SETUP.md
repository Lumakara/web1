# Panduan Setup Environment Variables (.env)

## Langkah 1: Buat File .env

Buat file baru di root project dengan nama `.env`:

```bash
touch .env
```

## Langkah 2: Copy Template Berikut

```env
# ============================================
# WEBSITE CONFIGURATION
# ============================================
VITE_SITE_NAME=Layanan Digital
VITE_SITE_DESCRIPTION="Solusi Digital Profesional untuk Kebutuhan Anda"
VITE_SITE_URL=https://yourdomain.com
VITE_SITE_LOGO_URL=https://yourdomain.com/logo.png

# Owner Information
VITE_OWNER_NAME=Nama Owner
VITE_OWNER_EMAIL=owner@example.com
VITE_OWNER_PHONE=081234567890
VITE_OWNER_WHATSAPP=https://wa.me/6281234567890

# Social Media
VITE_INSTAGRAM_URL=https://instagram.com/youraccount
VITE_FACEBOOK_URL=https://facebook.com/yourpage
VITE_TWITTER_URL=https://twitter.com/yourhandle

# ============================================
# SUPABASE CONFIGURATION
# ============================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ============================================
# EMAILJS CONFIGURATION
# ============================================
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_WELCOME_TEMPLATE_ID=welcome_template
VITE_EMAILJS_OWNER_TEMPLATE_ID=owner_notification_template
VITE_EMAILJS_PAYMENT_TEMPLATE_ID=payment_notification_template
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# ============================================
# PAKASIR PAYMENT GATEWAY
# ============================================
VITE_PAKASIR_SLUG=your_project_slug
VITE_PAKASIR_API_KEY=your_api_key

# ============================================
# PTERODACTYL PANEL CONFIGURATION
# ============================================
# API Credentials
VITE_PTERODACTYL_API_URL=https://panel.yourdomain.com/api
VITE_PTERODACTYL_API_KEY=ptlc_your_api_key
VITE_PTERODACTYL_CLIENT_API_KEY=ptla_your_client_key

# Server Configuration
VITE_PTERODACTYL_NODE_ID=1
VITE_PTERODACTYL_LOCATION_ID=1

# Package Configuration (Egg IDs)
VITE_PTERODACTYL_EGG_ID=1
VITE_PTERODACTYL_NEST_ID=1

# ============================================
# Kimi AI CONFIGURATION
# ============================================
VITE_Kimi_API_KEY=your-Kimi-api-key
VITE_Kimi_MODEL=gpt-4o-mini

# ============================================
# FEATURE FLAGS
# ============================================
# Enable/Disable features
VITE_ENABLE_PAYMENT=true
VITE_ENABLE_LIVE_CHAT=true
VITE_ENABLE_PTERODACTYL=true
VITE_ENABLE_WIFI_INSTALLATION=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true

# Development settings
VITE_DEBUG_MODE=false
VITE_MOCK_PAYMENT=false
```

## Langkah 3: Dapatkan API Keys

### Supabase
1. Buat project di [https://supabase.com](https://supabase.com)
2. Pergi ke Project Settings → API
3. Copy `URL` dan `anon public` API key

### EmailJS
1. Daftar di [https://emailjs.com](https://emailjs.com)
2. Buat Email Service
3. Buat Email Templates
4. Copy Service ID, Template IDs, dan Public Key

### Pakasir
1. Daftar di [https://pakasir.com](https://pakasir.com)
2. Buat Proyek baru
3. Copy Slug dan API Key dari detail proyek

### Pterodactyl
1. Login ke panel admin
2. Pergi ke Application API atau Account API
3. Generate API Key
4. Copy API URL dan Key

### Kimi AI
1. Buat akun di [https://platform.openai.com](https://platform.openai.com)
2. Pergi ke API Keys
3. Create new secret key
4. Copy API key

## Langkah 4: Update vite.config.ts

Pastikan vite.config.ts memiliki envPrefix yang benar:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  envPrefix: 'VITE_', // Only env vars starting with VITE_ are exposed
});
```

## Langkah 5: Tambah .env ke .gitignore

Pastikan `.env` tidak di-commit ke repository:

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

## Langkah 6: Buat env.d.ts (TypeScript Support)

Buat file `src/env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_NAME: string;
  readonly VITE_SITE_DESCRIPTION: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_OWNER_NAME: string;
  readonly VITE_OWNER_EMAIL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_PAKASIR_SLUG: string;
  readonly VITE_PAKASIR_API_KEY: string;
  readonly VITE_PTERODACTYL_API_URL: string;
  readonly VITE_PTERODACTYL_API_KEY: string;
  readonly VITE_Kimi_API_KEY: string;
  readonly VITE_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Penggunaan di Code

```typescript
// Mengakses env variable
const siteName = import.meta.env.VITE_SITE_NAME;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Check feature flag
const isPaymentEnabled = import.meta.env.VITE_ENABLE_PAYMENT === 'true';
```

## Environment untuk Production

Untuk production (Vercel, Netlify, dll):

1. **Vercel**:
   - Pergi ke Project Settings → Environment Variables
   - Tambahkan semua VITE_ variables

2. **Netlify**:
   - Pergi ke Site Settings → Build & Deploy → Environment
   - Tambahkan semua variables

3. **Docker**:
   ```dockerfile
   ENV VITE_SUPABASE_URL=https://your-project.supabase.co
   ENV VITE_SUPABASE_ANON_KEY=your-key
   ```

## Keamanan

⚠️ **PENTING**:
- JANGAN commit file `.env` ke repository publik
- Gunakan environment variables di hosting platform
- JANGAN expose API keys di client-side untuk fitur sensitif
- Gunakan server-side functions untuk API calls yang memerlukan secret keys

## Troubleshooting

1. **Env variable undefined**: Pastikan diawali dengan `VITE_`
2. **Changes not reflected**: Restart dev server setelah edit .env
3. **Type error**: Pastikan `env.d.ts` sudah dibuat
4. **Production missing env**: Cek env vars sudah di-set di hosting platform
