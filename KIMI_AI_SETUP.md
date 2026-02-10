# Panduan Setup Kimi AI / OpenAI

Panduan lengkap untuk mengintegrasikan Kimi AI (Moonshot AI) atau OpenAI dengan aplikasi Layanan Digital untuk fitur Live Chat AI.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Pilih Provider AI](#step-1-pilih-provider-ai)
- [Step 2: Dapatkan API Key](#step-2-dapatkan-api-key)
- [Step 3: Konfigurasi Model](#step-3-konfigurasi-model)
- [Step 4: Environment Variables](#step-4-environment-variables)
- [Step 5: Test Integration](#step-5-test-integration)
- [Configuration Options](#configuration-options)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

Kimi AI digunakan untuk menyediakan customer service otomatis yang pintar dengan kemampuan:
- **Intent Detection**: Mengenali maksud pengguna (product inquiry, order status, support)
- **Product Recommendations**: Merekomendasikan produk sesuai kebutuhan
- **Troubleshooting**: Membantu masalah teknis dasar
- **FAQ Responses**: Menjawab pertanyaan umum
- **Multilingual Support**: Bahasa Indonesia dan Inggris

### Dukungan Provider

Aplikasi ini mendukung berbagai AI provider:

| Provider | Base URL | Models |
|----------|----------|--------|
| **OpenAI** | `https://api.openai.com/v1` | gpt-4o, gpt-4o-mini, gpt-3.5-turbo |
| **Kimi (Moonshot)** | `https://api.moonshot.cn/v1` | moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k |
| **Azure OpenAI** | `https://your-resource.openai.azure.com` | deployment-specific |
| **OpenRouter** | `https://openrouter.ai/api/v1` | Various models |

---

## Prerequisites

- Akun di salah satu provider AI (OpenAI atau Kimi)
- API Key yang aktif
- Kredit/billing yang cukup untuk API calls

---

## Step 1: Pilih Provider AI

### Option A: OpenAI (Recommended)

**Keuntungan:**
- Model yang paling matang dan reliable
- Dokumentasi lengkap
- Community support besar

**Cocok untuk:** Production environment

### Option B: Kimi (Moonshot AI)

**Keuntungan:**
- Optimized untuk bahasa Asia (termasuk Indonesia)
- Harga kompetitif
- Context window besar (up to 128k tokens)

**Cocok untuk:** Budget-conscious, Asian market focus

### Option C: OpenRouter

**Keuntungan:**
- Akses ke multiple models dengan satu API key
- Fallback otomatis
- Pay-as-you-go

**Cocok untuk:** Development, testing multiple models

---

## Step 2: Dapatkan API Key

### 2.1 OpenAI API Key

1. Kunjungi [OpenAI Platform](https://platform.openai.com)
2. Login atau buat akun baru
3. Klik **API Keys** di sidebar
4. Klik **Create new secret key**
5. Beri nama: `Layanan Digital Production`
6. **COPY API KEY** (hanya ditampilkan sekali!)
7. Paste ke `.env`

**Format:** `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2.2 Kimi (Moonshot AI) API Key

1. Kunjungi [Moonshot AI Platform](https://platform.moonshot.cn)
2. Buat akun dengan email/nomor telepon
3. Complete verifikasi identitas
4. Klik **API Keys** di dashboard
5. Klik **Create API Key**
6. Beri nama: `Layanan Digital`
7. **COPY API KEY**
8. Paste ke `.env`

**Format:** `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2.3 OpenRouter API Key

1. Kunjungi [OpenRouter](https://openrouter.ai)
2. Login dengan Google/GitHub
3. Klik **Keys** di dashboard
4. Klik **Create Key**
5. Beri nama: `Layanan Digital`
6. **COPY API KEY**
7. Paste ke `.env`

**Format:** `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 3: Konfigurasi Model

### 3.1 OpenAI Models

| Model | Context | Harga (Input) | Harga (Output) | Best For |
|-------|---------|---------------|----------------|----------|
| `gpt-4o` | 128k | $2.50/1M | $10/1M | High accuracy |
| `gpt-4o-mini` | 128k | $0.15/1M | $0.60/1M | **Recommended** |
| `gpt-3.5-turbo` | 16k | $0.50/1M | $1.50/1M | Budget option |

**Recommended:** `gpt-4o-mini` - best balance of performance and cost

### 3.2 Kimi (Moonshot) Models

| Model | Context | Harga (Input) | Harga (Output) | Best For |
|-------|---------|---------------|----------------|----------|
| `moonshot-v1-8k` | 8k | ¥0.012/1K | ¥0.012/1K | Simple queries |
| `moonshot-v1-32k` | 32k | ¥0.024/1K | ¥0.024/1K | Medium context |
| `moonshot-v1-128k` | 128k | ¥0.060/1K | ¥0.060/1K | Large context |

### 3.3 Model Selection Guide

```
Budget Terbatas → gpt-4o-mini atau moonshot-v1-8k
General Purpose → gpt-4o-mini (recommended)
High Accuracy → gpt-4o
Bahasa Indonesia → moonshot-v1-8k/32k
Complex Reasoning → gpt-4o atau moonshot-v1-128k
```

---

## Step 4: Environment Variables

Tambahkan ke file `.env`:

### Untuk OpenAI

```env
# ============================================
# OPENAI / Kimi AI CONFIGURATION
# ============================================

# API Key dari OpenAI
VITE_KIMI_API_KEY=sk-your-openai-api-key-here

# Base URL (default OpenAI)
VITE_KIMI_BASE_URL=https://api.openai.com/v1

# Model configuration
VITE_KIMI_MODEL=gpt-4o-mini

# Optional: Temperature (0.0 - 1.0)
VITE_KIMI_TEMPERATURE=0.7

# Optional: Max tokens
VITE_KIMI_MAX_TOKENS=2000
```

### Untuk Kimi (Moonshot AI)

```env
# ============================================
# KIMI (MOONSHOT) AI CONFIGURATION
# ============================================

# API Key dari Moonshot
VITE_KIMI_API_KEY=sk-your-moonshot-api-key-here

# Base URL untuk Kimi
VITE_KIMI_BASE_URL=https://api.moonshot.cn/v1

# Model configuration
VITE_KIMI_MODEL=moonshot-v1-8k

# Optional settings
VITE_KIMI_TEMPERATURE=0.7
VITE_KIMI_MAX_TOKENS=2000
```

### Untuk OpenRouter

```env
# ============================================
# OPENROUTER CONFIGURATION
# ============================================

# API Key dari OpenRouter
VITE_KIMI_API_KEY=sk-or-v1-your-openrouter-key-here

# Base URL untuk OpenRouter
VITE_KIMI_BASE_URL=https://openrouter.ai/api/v1

# Model (contoh: anthropic/claude-3.5-sonnet)
VITE_KIMI_MODEL=openai/gpt-4o-mini

# Optional settings
VITE_KIMI_TEMPERATURE=0.7
VITE_KIMI_MAX_TOKENS=2000
```

---

## Step 5: Test Integration

### 5.1 Quick Test

Buat file test sederhana:

```typescript
// test-ai.ts
import { KimiService } from './src/lib/kimi-ai';

async function testAI() {
  try {
    // Configure service
    KimiService.configure({
      apiKey: import.meta.env.VITE_KIMI_API_KEY,
      baseURL: import.meta.env.VITE_KIMI_BASE_URL,
      model: import.meta.env.VITE_KIMI_MODEL,
    });

    // Test simple message
    const response = await KimiService.sendMessage(
      'Halo, apa itu VPS Hosting?'
    );

    console.log('AI Response:', response.message);
    console.log('Intent:', response.intent);
    
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

testAI();
```

### 5.2 Test via Browser Console

```javascript
// Buka browser dev console di aplikasi
const response = await KimiService.sendMessage('Apa produk yang tersedia?');
console.log(response);
```

### 5.3 Expected Response

```json
{
  "message": "Halo! VPS Hosting adalah Virtual Private Server...",
  "products": [...],
  "intent": {
    "type": "product_inquiry",
    "confidence": 0.95,
    "mentionedProducts": ["vps"],
    "keywords": ["apa", "itu", "hosting"]
  },
  "timestamp": 1704067200000
}
```

---

## Configuration Options

### Default Configuration

File: `src/lib/kimi-ai.ts`

```typescript
const DEFAULT_CONFIG: KimiConfig = {
  apiKey: import.meta.env.VITE_KIMI_API_KEY || '',
  baseURL: import.meta.env.VITE_KIMI_BASE_URL || 'https://api.openai.com/v1',
  model: import.meta.env.VITE_KIMI_MODEL || 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
};
```

### Advanced Configuration

```typescript
// Configure dengan options custom
KimiService.configure({
  apiKey: 'your-api-key',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  temperature: 0.5,    // Lower = more focused, Higher = more creative
  maxTokens: 4000,     // Maximum response length
});
```

### Parameter Guide

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `temperature` | 0.0 - 2.0 | 0.7 | Controls randomness. Lower = deterministic |
| `maxTokens` | 1 - 128000 | 2000 | Maximum tokens in response |
| `topP` | 0.0 - 1.0 | 1.0 | Nucleus sampling |
| `frequencyPenalty` | -2.0 - 2.0 | 0 | Reduce repetition |
| `presencePenalty` | -2.0 - 2.0 | 0 | Encourage new topics |

---

## Usage Examples

### Basic Chat

```typescript
import { KimiService } from '@/lib/kimi-ai';

// Simple message
const response = await KimiService.sendMessage('Halo!');
console.log(response.message);
```

### With Product Context

```typescript
import { KimiService } from '@/lib/kimi-ai';
import { useProducts } from '@/hooks/useProducts';

const { products } = useProducts();

// Chat dengan product context
const response = await KimiService.sendMessage(
  'Rekomendasikan VPS untuk website e-commerce',
  products
);

// Response akan include produk yang relevan
console.log(response.products); // Array of matching products
```

### Product Recommendation

```typescript
const response = await KimiService.getProductRecommendation(
  'Butuh server untuk Minecraft 50 player',
  products,
  'technical'  // Filter by category
);
```

### Troubleshooting Help

```typescript
const response = await KimiService.getTroubleshootingHelp(
  'VPS saya tidak bisa diakses via SSH',
  'vps-product-id',
  products
);
```

### Detect Intent Only

```typescript
import { detectIntent } from '@/lib/kimi-ai';

const intent = detectIntent('Berapa harga VPS?');
console.log(intent);
// {
//   type: 'pricing_inquiry',
//   confidence: 0.92,
//   mentionedProducts: ['vps'],
//   keywords: ['harga', 'berapa']
// }
```

### Check if Configured

```typescript
const isReady = KimiService.isConfigured();
if (!isReady) {
  console.warn('AI service not configured');
}
```

### Clear Conversation History

```typescript
// Reset conversation context
KimiService.clearHistory();
```

---

## System Prompt Customization

System prompt mendefinisikan personality dan kemampuan AI.

### Default System Prompt

File: `src/lib/kimi-ai.ts`

```typescript
const SYSTEM_PROMPT = `Kamu adalah Customer Service AI yang sangat pintar...

## Kemampuan Utama:
1. **Penjelasan Produk**: Detail, fitur, keunggulan
2. **Troubleshooting**: Masalah teknis umum
3. **Rekomendasi**: Sesuai kebutuhan customer
4. **Perbandingan**: Membandingkan produk
5. **Informasi Umum**: Pemesanan, pembayaran

## Aturan Penting:
- JANGAN membuat janji palsu
- Jika tidak tahu, arahkan ke support manusia
- Gunakan emoji dengan bijak 😊
- Format harga dalam Rupiah (Rp)`;
```

### Custom System Prompt

```typescript
// Extend atau modify untuk kebutuhan spesifik
const customPrompt = `${SYSTEM_PROMPT}

## Informasi Tambahan:
- Jam operasional: 09:00 - 21:00 WIB
- WhatsApp: 08123456789
- Email: support@yourdomain.com`;

// Use dengan sendMessage custom
const response = await KimiService.sendMessage(message, products, {
  // Options
});
```

---

## Intent Detection

### Supported Intents

| Intent | Description | Example Query |
|--------|-------------|---------------|
| `product_inquiry` | Tanya tentang produk | "Apa itu VPS?" |
| `order_status` | Cek status pesanan | "Pesanan saya sudah sampai?" |
| `support_request` | Minta bantuan | "Saya butuh bantuan" |
| `pricing_inquiry` | Tanya harga | "Berapa harga VPS?" |
| `recommendation` | Minta rekomendasi | "Rekomendasikan server" |
| `comparison` | Bandingkan produk | "VPS vs Shared Hosting?" |
| `greeting` | Sapaan | "Halo", "Hi" |
| `goodbye` | Perpisahan | "Terima kasih", "Dadah" |
| `general_question` | Pertanyaan umum | "Cara order?" |
| `technical_help` | Bantuan teknis | "Error saat install" |

### Using Intent for UI Logic

```typescript
import { detectIntent, shouldShowProductCards } from '@/lib/kimi-ai';

const intent = detectIntent(userMessage);

// Show product cards untuk product inquiries
if (shouldShowProductCards(intent)) {
  showProductRecommendations(intent.mentionedProducts);
}

// Escalate to human untuk support requests
if (intent.type === 'support_request') {
  showHumanSupportOption();
}
```

---

## Troubleshooting

### API Key Issues

**Problem**: `API key tidak dikonfigurasi`

**Solutions**:
1. Cek `.env` file memiliki `VITE_KIMI_API_KEY`
2. Restart dev server setelah mengubah `.env`
3. Pastikan key format benar (diawali `sk-`)

### Rate Limiting

**Problem**: `429 Too Many Requests`

**Solutions**:
```typescript
// Implement exponential backoff
const response = await KimiService.sendMessage(message, products, {
  maxRetries: 3,
  retryDelay: 2000,
});
```

### Timeout Errors

**Problem**: Request timeout

**Solutions**:
1. Cek koneksi internet
2. Reduce `maxTokens` untuk response lebih cepat
3. Gunakan model yang lebih cepat (gpt-4o-mini)

### CORS Issues

**Problem**: `CORS error`

**Solutions**:
- OpenAI/Kimi API harus dipanggil dari server-side untuk production
- Untuk development, gunakan Vite proxy:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api/ai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, ''),
      },
    },
  },
});
```

### Cost Management

**Problem**: Biaya API tinggi

**Solutions**:
1. Gunakan `gpt-4o-mini` untuk cost efficiency
2. Implement response caching
3. Set `maxTokens` limit
4. Gunakan intent detection untuk skip API call untuk queries sederhana

```typescript
// Cache responses
const cache = new Map();

async function getCachedResponse(message: string) {
  const key = hashMessage(message);
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const response = await KimiService.sendMessage(message);
  cache.set(key, response);
  return response;
}
```

---

## Pricing Estimation

### OpenAI Pricing (per 1M tokens)

| Model | Input | Output | Est. Cost/1000 chats* |
|-------|-------|--------|----------------------|
| gpt-4o | $2.50 | $10.00 | ~$5-15 |
| gpt-4o-mini | $0.15 | $0.60 | ~$0.50-2 |
| gpt-3.5-turbo | $0.50 | $1.50 | ~$1-5 |

*Assuming average 500 tokens per conversation

### Kimi Pricing (per 1K tokens)

| Model | Input/Output | Est. Cost/1000 chats* |
|-------|--------------|----------------------|
| moonshot-v1-8k | ¥0.012 | ~¥3-8 |
| moonshot-v1-32k | ¥0.024 | ~¥6-16 |
| moonshot-v1-128k | ¥0.060 | ~¥15-40 |

### Cost Optimization Tips

1. **Use gpt-4o-mini** untuk 90% use cases
2. **Implement caching** untuk FAQ umum
3. **Set maxTokens** limit (1500 cukup untuk most responses)
4. **Pre-filter** dengan keyword matching sebelum API call
5. **Monitor usage** dengan OpenAI dashboard

---

## Security Best Practices

1. **Never expose API key** di client-side untuk production
2. **Use server-side proxy** untuk API calls
3. **Implement rate limiting** per user
4. **Log API usage** untuk monitoring
5. **Rotate API keys** secara berkala
6. **Use environment variables** jangan hardcode key

### Server-Side Implementation (Recommended for Production)

```typescript
// server/api/chat.ts (Express example)
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  // Rate limiting check
  // Auth check
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message },
    ],
  });
  
  res.json({ message: response.choices[0].message.content });
});
```

---

## Additional Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Moonshot AI Documentation](https://platform.moonshot.cn/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Pricing Calculator](https://openai.com/pricing)
