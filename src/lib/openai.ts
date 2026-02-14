/**
 * OpenAI Service - Ultra Smart Live Chat for Digital Services Store
 * 
 * Features:
 * - Smart intent detection and context-aware responses
 * - Product card generation and recommendations
 * - Order status checking and support ticket flows
 * - Streaming responses for real-time typing effect
 * - Error handling, retries, and rate limiting protection
 * - Response caching for better performance
 * 
 * @version 3.0.0 - Migrated from Kimi AI to OpenAI
 * - Using GPT-4o-mini for cost efficiency
 * - Shows detailed error logs in chat
 * - Mobile responsive improvements
 */

import type { Product, Order } from './supabase';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ChatMessage {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
  error?: string; // Error message to display in chat
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

export interface ProductCardData {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  tags: string[];
  tiers?: {
    name: string;
    price: number;
    features: string[];
  }[];
  inStock: boolean;
  action?: {
    type: 'view' | 'add_to_cart' | 'buy_now';
    label: string;
  };
}

export interface OrderInfo {
  orderId: string;
  status: 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';
  items: {
    productName: string;
    tier: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  createdAt: string;
  estimatedCompletion?: string;
}

export type IntentType = 
  | 'product_inquiry' 
  | 'order_status' 
  | 'support_request' 
  | 'pricing_inquiry'
  | 'recommendation'
  | 'comparison'
  | 'greeting'
  | 'goodbye'
  | 'general_question'
  | 'technical_help'
  | 'unknown';

export interface DetectedIntent {
  type: IntentType;
  confidence: number;
  mentionedProducts: string[];
  mentionedCategories: string[];
  keywords: string[];
  entities: {
    type: string;
    value: string;
  }[];
  requiresEscalation: boolean;
}

export interface OpenAIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  enableCache: boolean;
  cacheTTL: number;
}

export interface SendMessageOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  cacheKey?: string;
  context?: {
    products?: Product[];
    orderInfo?: OrderInfo;
    userProfile?: {
      name?: string;
      email?: string;
      isVIP?: boolean;
    };
  };
}

export interface ChatResponse {
  message: string;
  productCards?: ProductCardData[];
  intent: DetectedIntent;
  suggestions?: string[];
  actions?: {
    type: 'view_product' | 'add_to_cart' | 'create_ticket' | 'check_order' | 'contact_human';
    label: string;
    payload?: unknown;
  }[];
  metadata: {
    timestamp: number;
    tokensUsed: number;
    processingTime: number;
    cached: boolean;
    model: string;
  };
  error?: string; // Error details to show in chat
  errorLogs?: string; // Detailed error logs for debugging
}

interface CacheEntry {
  response: ChatResponse;
  timestamp: number;
}

// ============================================================================
// Configuration - OpenAI (Free/Cheap Model)
// ============================================================================

const DEFAULT_CONFIG: OpenAIConfig = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini', // Free tier available, cheap and fast
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// Knowledge Base
// ============================================================================

const FAQ_KNOWLEDGE_BASE: Record<string, string> = {
  'pembayaran': `Kami menerima berbagai metode pembayaran:
• Transfer Bank (BCA, Mandiri, BNI, BRI)
• E-Wallet (GoPay, OVO, DANA, LinkAja)
• QRIS (semua aplikasi payment)
• Kartu Kredit/Debit

Pembayaran akan diproses otomatis setelah konfirmasi.`,

  'pengiriman': `Untuk layanan digital kami:
• VPS Hosting: Aktif instant setelah pembayaran
• Jasa Instalasi: Jadwal dalam 1-2 hari kerja
• Editing: Sesuai durasi yang dipilih (1-5 hari)
• Code Repair: 1-4 jam tergantung kompleksitas

Anda akan menerima notifikasi email/SMS saat layanan siap.`,

  'garansi': `Semua layanan kami dilengkapi garansi:
• VPS Hosting: Garansi uptime 99.9%
• Instalasi: Garansi 1-3 tahun tergantung paket
• Editing: Revisi sesuai paket yang dipilih
• Code Repair: Garansi fix 7 hari

Klaim garansi dapat diajukan melalui tiket support.`,

  'refund': `Kebijakan refund kami:
• Belum diproses: 100% refund
• Dalam proses <50%: 50% refund
• Dalam proses >50% atau selesai: tidak bisa refund

Pengajuan refund melalui menu Support dalam 7 hari.`,

  'jam operasional': `Jam layanan customer support:
• Chat AI: 24/7 (selalu online)
• Support Human: Senin-Sabtu, 09:00-21:00 WIB
• Technical Support: Senin-Jumat, 09:00-18:00 WIB

Di luar jam operasional, tim kami akan merespons di hari berikutnya.`,
};

// ============================================================================
// Intent Detection Keywords
// ============================================================================

const INTENT_KEYWORDS: Record<IntentType, string[]> = {
  product_inquiry: [
    'apa itu', 'jelaskan', 'detail', 'informasi', 'spesifikasi', 'fitur',
    'kelebihan', 'keuntungan', 'cara kerja', 'bagaimana cara', 'apa saja',
    'produk apa', 'layanan apa', 'deskripsi'
  ],
  order_status: [
    'pesanan', 'order', 'status', 'tracking', 'lacak', 'dimana', 'sudah sampai',
    'progress', 'selesai', 'proses', 'transaksi', 'pembelian', 'beli'
  ],
  support_request: [
    'bantuan', 'help', 'support', 'masalah', 'error', 'gagal', 'tidak bisa',
    'trouble', 'bug', 'issue', 'komplain', 'keluhan', 'tiket'
  ],
  pricing_inquiry: [
    'harga', 'berapa', 'mahal', 'murah', 'biaya', 'cost', 'price',
    'diskon', 'promo', 'potongan', 'cicil', 'bayar', 'nominal'
  ],
  recommendation: [
    'rekomendasi', 'saran', 'butuh', 'cari', 'mau', 'ingin', 'recommended',
    'cocok', 'sesuai', 'advis', 'suggestion', 'pilih mana', 'yang bagus'
  ],
  comparison: [
    'bandingkan', 'perbedaan', 'vs', 'versus', 'lebih baik', 'lebih bagus',
    'pilih mana', 'compare', 'bedanya', 'selisih'
  ],
  greeting: [
    'halo', 'hi', 'hello', 'hey', 'selamat', 'pagi', 'siang', 'sore', 'malam',
    'apa kabar', 'hai', 'selamat datang'
  ],
  goodbye: [
    'terima kasih', 'thanks', 'thank you', 'dadah', 'bye', 'selamat tinggal',
    'sampai jumpa', 'makasih', 'thx', 'sampai nanti'
  ],
  general_question: [
    'bagaimana', 'kenapa', 'mengapa', 'apa', 'siapa', 'kapan', 'dimana',
    'tutorial', 'cara', 'panduan', 'guide'
  ],
  technical_help: [
    'error', 'bug', 'debug', 'fix', 'perbaiki', 'solusi', 'troubleshoot',
    'tidak jalan', 'failed', 'gagal load', 'crash', 'timeout'
  ],
  unknown: []
};

const PRODUCT_KEYWORDS: Record<string, string[]> = {
  vps: ['vps', 'server', 'hosting', 'virtual private', 'cloud server', 'droplet', 'aws', 'azure'],
  wifi: ['wifi', 'wi-fi', 'internet', 'router', 'jaringan', 'network', 'wireless', 'access point'],
  cctv: ['cctv', 'kamera', 'camera', 'security', 'keamanan', 'monitoring', 'surveillance'],
  code: ['code', 'coding', 'programming', 'error', 'debug', 'bug', 'script', 'kode', 'program'],
  photo: ['photo', 'foto', 'gambar', 'image', 'editing', 'retouch', 'photoshop', 'lightroom'],
  video: ['video', 'editing', 'montage', 'post production', 'premiere', 'final cut', 'after effect'],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  installation: ['pasang', 'instalasi', 'install', 'setup', 'konfigurasi'],
  technical: ['teknis', 'server', 'hosting', 'code', 'program', 'debug'],
  creative: ['edit', 'kreatif', 'desain', 'design', 'photo', 'video', 'gambar']
};

// ============================================================================
// Response Cache
// ============================================================================

class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly ttl: number;

  constructor(ttl: number = DEFAULT_CONFIG.cacheTTL) {
    this.ttl = ttl;
  }

  generateKey(messages: ChatMessage[]): string {
    const content = messages.map(m => `${m.role}:${m.content}`).join('|');
    return this.hashString(content);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  get(key: string): ChatResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return {
      ...entry.response,
      metadata: { ...entry.response.metadata, cached: true }
    };
  }

  set(key: string, response: ChatResponse): void {
    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });

    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// ============================================================================
// Intent Detection
// ============================================================================

export function detectIntent(message: string): DetectedIntent {
  const lowerMessage = message.toLowerCase();
  const detectedKeywords: string[] = [];
  const mentionedProducts: string[] = [];
  const mentionedCategories: string[] = [];
  const entities: { type: string; value: string }[] = [];

  for (const [productId, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        if (!mentionedProducts.includes(productId)) {
          mentionedProducts.push(productId);
        }
        if (!detectedKeywords.includes(keyword)) {
          detectedKeywords.push(keyword);
        }
        entities.push({ type: 'product', value: productId });
        break;
      }
    }
  }

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        if (!mentionedCategories.includes(categoryId)) {
          mentionedCategories.push(categoryId);
        }
        entities.push({ type: 'category', value: categoryId });
        break;
      }
    }
  }

  const orderPattern = /(?:order|pesanan|trx)[\s#-]*(\w+\d+|\d+)/i;
  const orderMatch = lowerMessage.match(orderPattern);
  if (orderMatch) {
    entities.push({ type: 'order_id', value: orderMatch[1] });
  }

  let detectedType: IntentType = 'unknown';
  let maxScore = 0;

  for (const [intentType, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        score += 1;
        if (!detectedKeywords.includes(keyword)) {
          detectedKeywords.push(keyword);
        }
      }
    }
    if (score > maxScore) {
      maxScore = score;
      detectedType = intentType as IntentType;
    }
  }

  if (mentionedProducts.length > 0 && detectedType === 'unknown') {
    detectedType = 'product_inquiry';
    maxScore = Math.max(maxScore, 1);
  }

  if (orderMatch && detectedType !== 'support_request') {
    detectedType = 'order_status';
    maxScore = Math.max(maxScore, 2);
  }

  if (mentionedProducts.length >= 2 && detectedType === 'product_inquiry') {
    detectedType = 'comparison';
  }

  const baseConfidence = Math.min(0.4 + (maxScore * 0.15), 0.95);
  const productBoost = mentionedProducts.length * 0.05;
  const confidence = Math.min(baseConfidence + productBoost, 1);

  const requiresEscalation = 
    lowerMessage.includes('refund') && lowerMessage.includes('uang') ||
    lowerMessage.includes('penipuan') ||
    lowerMessage.includes('lapor polisi') ||
    lowerMessage.includes('pengaduan') && lowerMessage.includes('serius');

  return {
    type: detectedType,
    confidence,
    mentionedProducts,
    mentionedCategories,
    keywords: detectedKeywords,
    entities,
    requiresEscalation
  };
}

export function shouldShowProductCards(intent: DetectedIntent): boolean {
  return (
    intent.mentionedProducts.length > 0 &&
    (intent.type === 'product_inquiry' ||
     intent.type === 'comparison' ||
     intent.type === 'recommendation' ||
     intent.type === 'pricing_inquiry')
  );
}

export function isOrderStatusQuery(intent: DetectedIntent): boolean {
  return intent.type === 'order_status' || 
    intent.entities.some(e => e.type === 'order_id');
}

export function needsHumanSupport(intent: DetectedIntent): boolean {
  return intent.requiresEscalation || intent.type === 'support_request';
}

// ============================================================================
// System Prompt Generation
// ============================================================================

export function createSystemPrompt(context?: {
  products?: Product[];
  orderInfo?: OrderInfo;
  faqTopic?: string;
}): string {
  let prompt = `Kamu adalah Customer Service AI yang **ULTRA SUPER PINTAR** untuk toko digital kami. 
Nama kamu adalah "AI Assistant" 🤖

## Kepribadian & Gaya Komunikasi:
- Ramah, sopan, dan menggunakan bahasa Indonesia yang baik dan benar
- Profesional namun approachable dan hangat
- Selalu responsif dan proaktif dalam memberikan solusi
- Gunakan emoji dengan bijak untuk membuat percakapan lebih hidup
- Jelaskan dengan bahasa yang mudah dipahami semua kalangan

## Kemampuan Utama:
1. **Penjelasan Produk Detail**: Jelaskan fitur, keunggulan, dan cara kerja produk
2. **Rekomendasi Pintar**: Sarankan produk berdasarkan kebutuhan user
3. **Perbandingan Produk**: Bandingkan produk secara objektif
4. **Cek Status Order**: Bantu tracking pesanan customer
5. **FAQ Cepat**: Jawab pertanyaan umum dengan akurat
6. **Troubleshooting**: Bantu masalah teknis dasar
7. **Eskalasi**: Tahu kapan harus menghubungkan ke human agent

## Format Respons Spesial:

### Product Cards:
Ketika user menanyakan produk spesifik, tambahkan tag:
[PRODUCT_CARDS:product_id1,product_id2,...]

Contoh:
"VPS Hosting kami sangat cocok untuk website traffic tinggi! [PRODUCT_CARDS:vps]"

### Order Status:
Ketika user menanyakan pesanan:
[ORDER_STATUS:order_id]

### Rekomendasi:
Ketika memberikan rekomendasi:
[RECOMMENDATION:product_id1,product_id2,...]

### Action Buttons:
Tambahkan action yang bisa user lakukan:
[ACTION:type:label]

Tipe action: view_product, add_to_cart, create_ticket, check_order, contact_human

## Aturan Penting:
- JANGAN pernah membuat janji palsu atau informasi tidak akurat
- Selalu prioritaskan kepuasan customer
- Format harga dalam Rupiah: Rp XXX.XXX
- Sebutkan durasi pengerjaan/estimasi waktu
- Jika tidak tahu, arahkan ke support manusia dengan sopan
- Berikan opsi tier (Basic/Standard/Premium) saat membahas produk

## Produk Tersedia:
- VPS Hosting (Server virtual untuk hosting)
- Wi-Fi Installation Service (Pemasangan jaringan WiFi)
- CCTV Security System (Instalasi sistem keamanan kamera)
- Code Error Repair (Jasa debugging kode)
- Photo Editing (Jasa edit foto)
- Video Editing (Jasa edit video)

Setiap produk memiliki 3 tier: Basic, Standard, dan Premium.`;

  if (context?.products && context.products.length > 0) {
    prompt += `\n\n## Produk yang Sedang Dibahas:\n${formatProductContext(context.products)}`;
  }

  if (context?.orderInfo) {
    prompt += `\n\n## Informasi Pesanan User:\n${formatOrderContext(context.orderInfo)}`;
  }

  if (context?.faqTopic && FAQ_KNOWLEDGE_BASE[context.faqTopic]) {
    prompt += `\n\n## Informasi Terkait:\n${FAQ_KNOWLEDGE_BASE[context.faqTopic]}`;
  }

  return prompt;
}

function formatProductContext(products: Product[]): string {
  if (!products || products.length === 0) return '';

  return products.map(p => {
    const priceDisplay = p.discount_price
      ? `~~Rp ${p.base_price.toLocaleString('id-ID')}~~ → Rp ${p.discount_price.toLocaleString('id-ID')}`
      : `Rp ${p.base_price.toLocaleString('id-ID')}`;

    const tiersInfo = p.tiers.map(t =>
      `  - ${t.name}: Rp ${t.price.toLocaleString('id-ID')} (${t.features.slice(0, 2).join(', ')})`
    ).join('\n');

    return `
📦 ${p.title} (ID: ${p.id})
💰 Harga: ${priceDisplay}
⭐ Rating: ${p.rating}/5 (${p.reviews} reviews)
⏱️ Durasi: ${p.duration}
📝 ${p.description.substring(0, 100)}...
📋 Tiers:
${tiersInfo}
`;
  }).join('\n---\n');
}

function formatOrderContext(order: OrderInfo): string {
  const statusMap: Record<string, string> = {
    'pending': '⏳ Menunggu Pembayaran',
    'paid': '💰 Pembayaran Diterima',
    'processing': '⚙️ Sedang Diproses',
    'completed': '✅ Selesai',
    'cancelled': '❌ Dibatalkan'
  };

  const itemsList = order.items.map(item =>
    `  • ${item.productName} (${item.tier}) x${item.quantity} - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`
  ).join('\n');

  return `
📋 Order ID: ${order.orderId}
📊 Status: ${statusMap[order.status] || order.status}
📅 Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID')}
💵 Total: Rp ${order.totalAmount.toLocaleString('id-ID')}

🛒 Items:
${itemsList}
${order.estimatedCompletion ? `\n📅 Estimasi Selesai: ${order.estimatedCompletion}` : ''}
`;
}

// ============================================================================
// Custom Error Class
// ============================================================================

export class OpenAIError extends Error {
  code: string;
  statusCode?: number;
  details?: string;
  
  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: string
  ) {
    super(message);
    this.name = 'OpenAIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ============================================================================
// API Integration with Retry Logic & Error Details
// ============================================================================

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callOpenAIWithRetry(
  messages: ChatMessage[],
  config: Partial<OpenAIConfig> = {},
  attempt: number = 1
): Promise<OpenAIResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.apiKey) {
    throw new OpenAIError(
      'API key tidak dikonfigurasi. Silakan hubungi administrator.',
      'CONFIG_ERROR',
      undefined,
      'VITE_OPENAI_API_KEY tidak ditemukan di environment variables.'
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

  try {
    const response = await fetch(`${finalConfig.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: finalConfig.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Error ${response.status}: ${response.statusText}`;
      const errorDetails = JSON.stringify(errorData, null, 2);
      
      if (response.status === 429) {
        if (attempt < finalConfig.maxRetries) {
          const delay = finalConfig.retryDelay * Math.pow(2, attempt - 1);
          await sleep(delay);
          return callOpenAIWithRetry(messages, config, attempt + 1);
        }
        throw new OpenAIError(
          'Terlalu banyak request. Silakan tunggu beberapa saat.',
          'RATE_LIMIT',
          response.status,
          errorDetails
        );
      }

      if (response.status === 401) {
        throw new OpenAIError(
          'API key tidak valid atau sudah expired.',
          'AUTH_ERROR',
          response.status,
          errorDetails
        );
      }

      if (response.status === 500) {
        throw new OpenAIError(
          'Server OpenAI sedang mengalami gangguan. Silakan coba lagi nanti.',
          'SERVER_ERROR',
          response.status,
          errorDetails
        );
      }

      throw new OpenAIError(
        errorMessage,
        'API_ERROR',
        response.status,
        errorDetails
      );
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof OpenAIError) throw error;

    if (error instanceof TypeError && attempt < finalConfig.maxRetries) {
      const delay = finalConfig.retryDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
      return callOpenAIWithRetry(messages, config, attempt + 1);
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new OpenAIError(
        'Request timeout. Silakan cek internet Anda dan coba lagi.',
        'TIMEOUT',
        undefined,
        error.message
      );
    }

    throw new OpenAIError(
      error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui',
      'NETWORK_ERROR',
      undefined,
      error instanceof Error ? error.stack : undefined
    );
  }
}

async function* streamOpenAI(
  messages: ChatMessage[],
  config: Partial<OpenAIConfig> = {}
): AsyncGenerator<string, void, unknown> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.apiKey) {
    throw new OpenAIError('API key tidak dikonfigurasi', 'CONFIG_ERROR');
  }

  const response = await fetch(`${finalConfig.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${finalConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: finalConfig.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: finalConfig.temperature,
      max_tokens: finalConfig.maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new OpenAIError(
      errorData.error?.message || 'Failed to start stream',
      'API_ERROR',
      response.status,
      JSON.stringify(errorData, null, 2)
    );
  }

  const reader = response.body?.getReader();
  if (!reader) throw new OpenAIError('No response body', 'API_ERROR');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const chunk: OpenAIStreamResponse = JSON.parse(data);
            const content = chunk.choices[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Ignore malformed chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================================================
// Response Processing
// ============================================================================

function extractSpecialTags(content: string): {
  message: string;
  productIds: string[];
  recommendationIds: string[];
  orderId?: string;
  actions: { type: string; label: string }[];
} {
  let cleanContent = content;
  const productIds: string[] = [];
  const recommendationIds: string[] = [];
  const actions: { type: string; label: string }[] = [];
  let orderId: string | undefined;

  const productCardRegex = /\[PRODUCT_CARDS:([^\]]+)\]/g;
  let match;
  while ((match = productCardRegex.exec(content)) !== null) {
    const ids = match[1].split(',').map(id => id.trim()).filter(Boolean);
    productIds.push(...ids);
  }
  cleanContent = cleanContent.replace(productCardRegex, '');

  const recommendationRegex = /\[RECOMMENDATION:([^\]]+)\]/g;
  while ((match = recommendationRegex.exec(content)) !== null) {
    const ids = match[1].split(',').map(id => id.trim()).filter(Boolean);
    recommendationIds.push(...ids);
  }
  cleanContent = cleanContent.replace(recommendationRegex, '');

  const orderRegex = /\[ORDER_STATUS:([^\]]+)\]/g;
  const orderMatch = orderRegex.exec(content);
  if (orderMatch) {
    orderId = orderMatch[1].trim();
  }
  cleanContent = cleanContent.replace(orderRegex, '');

  const actionRegex = /\[ACTION:([^:]+):([^\]]+)\]/g;
  while ((match = actionRegex.exec(content)) !== null) {
    actions.push({
      type: match[1].trim(),
      label: match[2].trim()
    });
  }
  cleanContent = cleanContent.replace(actionRegex, '');

  return {
    message: cleanContent.trim(),
    productIds: [...new Set(productIds)],
    recommendationIds: [...new Set(recommendationIds)],
    orderId,
    actions
  };
}

function generateSuggestions(intent: DetectedIntent): string[] {
  const suggestionsByIntent: Record<IntentType, string[]> = {
    product_inquiry: [
      'Berapa harganya?',
      'Apa bedanya dengan paket lain?',
      'Bisa diskon?',
      'Cara ordernya gimana?'
    ],
    order_status: [
      'Cek pesanan lain',
      'Batalkan pesanan',
      'Hubungi support'
    ],
    support_request: [
      'Buat tiket support',
      'Chat dengan admin',
      'Lihat FAQ'
    ],
    pricing_inquiry: [
      'Ada promo?',
      'Bisa nego?',
      'Pembayaran apa saja?'
    ],
    recommendation: [
      'Yang paling murah',
      'Yang paling populer',
      'Untuk pemula'
    ],
    comparison: [
      'Yang lebih worth it?',
      'Detail semua paket',
      'Rekomendasi sesuai budget'
    ],
    greeting: [
      'Lihat produk',
      'Cek pesanan saya',
      'Butuh bantuan'
    ],
    goodbye: [],
    general_question: [
      'Tutorial lengkap',
      'Hubungi support',
      'Lihat dokumentasi'
    ],
    technical_help: [
      'Kirim error log',
      'Buat tiket support',
      'Remote assistance'
    ],
    unknown: [
      'Lihat semua produk',
      'Hubungi admin',
      'Bantuan umum'
    ]
  };

  return suggestionsByIntent[intent.type] || suggestionsByIntent.unknown;
}

export function generateProductCard(product: Product): ProductCardData {
  const finalPrice = product.discount_price || product.base_price;
  const hasDiscount = !!product.discount_price && product.discount_price < product.base_price;

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: finalPrice,
    originalPrice: hasDiscount ? product.base_price : undefined,
    image: product.image,
    rating: product.rating,
    reviews: product.reviews,
    category: product.category,
    tags: product.tags,
    tiers: product.tiers.map(t => ({
      name: t.name,
      price: t.price,
      features: t.features
    })),
    inStock: product.stock > 0,
    action: {
      type: 'view',
      label: 'Lihat Detail'
    }
  };
}

export function getProductRecommendations(
  query: string,
  products: Product[],
  limit: number = 3
): ProductCardData[] {
  const lowerQuery = query.toLowerCase();
  const intent = detectIntent(query);

  const scoredProducts = products.map(product => {
    let score = 0;

    if (intent.mentionedProducts.includes(product.id)) {
      score += 10;
    }

    if (intent.mentionedCategories.includes(product.category)) {
      score += 5;
    }

    const keywords = lowerQuery.split(' ');
    for (const keyword of keywords) {
      if (keyword.length < 3) continue;
      if (product.title.toLowerCase().includes(keyword)) score += 3;
      if (product.description.toLowerCase().includes(keyword)) score += 2;
      if (product.tags.some(tag => tag.toLowerCase().includes(keyword))) score += 2;
    }

    score += product.rating * 0.5;
    score += Math.log(product.reviews + 1);

    return { product, score };
  });

  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => generateProductCard(product));
}

export function searchProductsInChat(query: string, products: Product[]): ProductCardData[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) {
    return products.slice(0, 6).map(generateProductCard);
  }

  const results = products.filter(product => {
    const searchableText = [
      product.title,
      product.description,
      product.category,
      ...product.tags,
      ...product.tiers.map(t => t.name)
    ].join(' ').toLowerCase();

    return searchableText.includes(lowerQuery) ||
      lowerQuery.split(' ').every(word => 
        word.length < 3 || searchableText.includes(word)
      );
  });

  return results.map(generateProductCard);
}

export function compareProducts(products: Product[]): string {
  if (products.length < 2) {
    return 'Perlu minimal 2 produk untuk dibandingkan.';
  }

  const comparison = products.map(p => {
    const price = p.discount_price || p.base_price;
    return {
      name: p.title,
      price: `Rp ${price.toLocaleString('id-ID')}`,
      rating: `${p.rating}/5`,
      duration: p.duration,
      tiers: p.tiers.map(t => t.name).join(', ')
    };
  });

  return `📊 **Perbandingan Produk:**\n\n${comparison.map(c => 
    `• **${c.name}**\n  💰 ${c.price} | ⭐ ${c.rating} | ⏱️ ${c.duration}\n  📦 Paket: ${c.tiers}`
  ).join('\n\n')}`;
}

// ============================================================================
// Main OpenAI Service
// ============================================================================

export class OpenAIService {
  private static config: Partial<OpenAIConfig> = {};
  private static conversationHistory: ChatMessage[] = [];
  private static cache: ResponseCache = new ResponseCache();
  private static lastRequestTime: number = 0;
  private static minRequestInterval = 500;

  static configure(config: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.cacheTTL) {
      this.cache = new ResponseCache(config.cacheTTL);
    }
  }

  static clearHistory(): void {
    this.conversationHistory = [];
  }

  static getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static isConfigured(): boolean {
    const apiKey = this.config.apiKey || DEFAULT_CONFIG.apiKey;
    return Boolean(apiKey && apiKey.length > 0);
  }

  private static async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await sleep(this.minRequestInterval - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Format error for display in chat
   */
  private static formatErrorForChat(error: OpenAIError): { message: string; logs: string } {
    let message = 'Maaf, terjadi kesalahan.';
    let logs = '';

    switch (error.code) {
      case 'CONFIG_ERROR':
        message = '⚠️ Layanan AI belum dikonfigurasi dengan benar.';
        logs = `Error Code: ${error.code}\n${error.details || ''}`;
        break;
      case 'AUTH_ERROR':
        message = '🔑 API key tidak valid atau sudah expired.';
        logs = `Error Code: ${error.code} (HTTP ${error.statusCode})\n${error.details || ''}`;
        break;
      case 'RATE_LIMIT':
        message = '⏱️ Terlalu banyak request. Silakan tunggu beberapa saat.';
        logs = `Error Code: ${error.code} (HTTP ${error.statusCode})\nRate limit exceeded. Please wait before retrying.`;
        break;
      case 'TIMEOUT':
        message = '⏱️ Koneksi lambat. Silakan cek internet Anda dan coba lagi.';
        logs = `Error Code: ${error.code}\n${error.details || ''}`;
        break;
      case 'SERVER_ERROR':
        message = '🔧 Server AI sedang mengalami gangguan. Silakan coba lagi nanti.';
        logs = `Error Code: ${error.code} (HTTP ${error.statusCode})\n${error.details || ''}`;
        break;
      case 'NETWORK_ERROR':
        message = '📡 Masalah jaringan. Silakan periksa koneksi internet Anda.';
        logs = `Error Code: ${error.code}\n${error.details || ''}`;
        break;
      default:
        message = `❌ ${error.message}`;
        logs = `Error Code: ${error.code}\n${error.details || error.stack || ''}`;
    }

    return { message, logs };
  }

  static async sendMessage(
    messages: ChatMessage[],
    options: SendMessageOptions = {}
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    const finalConfig = { ...DEFAULT_CONFIG, ...this.config };

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const intent: DetectedIntent = lastUserMessage ? detectIntent(lastUserMessage.content) : 
      { type: 'unknown' as IntentType, confidence: 0, mentionedProducts: [], mentionedCategories: [], keywords: [], entities: [], requiresEscalation: false };

    const cacheKey = options.cacheKey || this.cache.generateKey(messages);
    if (finalConfig.enableCache && !options.stream) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return {
          ...cached,
          metadata: { ...cached.metadata, processingTime: Date.now() - startTime }
        };
      }
    }

    const systemPrompt = createSystemPrompt({
      products: options.context?.products,
      orderInfo: options.context?.orderInfo
    });

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory.slice(-10),
      ...messages
    ];

    try {
      await this.applyRateLimit();

      const response = await callOpenAIWithRetry(fullMessages, {
        ...finalConfig,
        temperature: options.temperature,
        maxTokens: options.maxTokens
      });

      const aiMessage = response.choices[0]?.message?.content || 
        'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';

      const extracted = extractSpecialTags(aiMessage);

      let productCards: ProductCardData[] | undefined;
      const allProductIds = [...extracted.productIds, ...extracted.recommendationIds];
      
      if (allProductIds.length > 0 && options.context?.products) {
        productCards = options.context.products
          .filter(p => allProductIds.includes(p.id))
          .map(generateProductCard);
      } else if (shouldShowProductCards(intent) && options.context?.products) {
        const relevantProducts = options.context.products.filter(p =>
          intent.mentionedProducts.includes(p.id) ||
          intent.mentionedCategories.includes(p.category)
        );
        productCards = relevantProducts.map(generateProductCard);
      }

      const suggestions = generateSuggestions(intent);

      const actions = extracted.actions.map(a => ({
        type: a.type as 'view_product' | 'add_to_cart' | 'create_ticket' | 'check_order' | 'contact_human',
        label: a.label,
        payload: undefined
      }));

      if (intent.requiresEscalation) {
        actions.push({ type: 'contact_human', label: 'Hubungi Admin', payload: undefined });
      }
      if (intent.type === 'order_status') {
        actions.push({ type: 'check_order', label: 'Cek Pesanan', payload: undefined });
      }

      this.conversationHistory.push(...messages);
      this.conversationHistory.push({
        role: 'assistant',
        content: extracted.message,
        timestamp: Date.now()
      });

      if (this.conversationHistory.length > 40) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      const chatResponse: ChatResponse = {
        message: extracted.message,
        productCards,
        intent,
        suggestions,
        actions: actions.length > 0 ? actions : undefined,
        metadata: {
          timestamp: Date.now(),
          tokensUsed: response.usage?.total_tokens || 0,
          processingTime: Date.now() - startTime,
          cached: false,
          model: finalConfig.model
        }
      };

      if (finalConfig.enableCache) {
        this.cache.set(cacheKey, chatResponse);
      }

      return chatResponse;

    } catch (error) {
      console.error('OpenAIService error:', error);
      return this.generateFallbackResponse(intent, options, error instanceof OpenAIError ? error : undefined);
    }
  }

  static async streamMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string, fullText: string) => void,
    options: SendMessageOptions = {}
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    const finalConfig = { ...DEFAULT_CONFIG, ...this.config };

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const intent: DetectedIntent = lastUserMessage ? detectIntent(lastUserMessage.content) : 
      { type: 'unknown' as IntentType, confidence: 0, mentionedProducts: [], mentionedCategories: [], keywords: [], entities: [], requiresEscalation: false };

    const systemPrompt = createSystemPrompt({
      products: options.context?.products,
      orderInfo: options.context?.orderInfo
    });

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory.slice(-10),
      ...messages
    ];

    try {
      await this.applyRateLimit();

      let fullResponse = '';
      
      for await (const chunk of streamOpenAI(fullMessages, finalConfig)) {
        fullResponse += chunk;
        onChunk(chunk, fullResponse);
      }

      const extracted = extractSpecialTags(fullResponse);

      let productCards: ProductCardData[] | undefined;
      const allProductIds = [...extracted.productIds, ...extracted.recommendationIds];
      
      if (allProductIds.length > 0 && options.context?.products) {
        productCards = options.context.products
          .filter(p => allProductIds.includes(p.id))
          .map(generateProductCard);
      }

      this.conversationHistory.push(...messages);
      this.conversationHistory.push({
        role: 'assistant',
        content: extracted.message,
        timestamp: Date.now()
      });

      return {
        message: extracted.message,
        productCards,
        intent,
        suggestions: generateSuggestions(intent),
        metadata: {
          timestamp: Date.now(),
          tokensUsed: 0,
          processingTime: Date.now() - startTime,
          cached: false,
          model: finalConfig.model
        }
      };

    } catch (error) {
      console.error('OpenAI stream error:', error);
      throw error;
    }
  }

  private static generateFallbackResponse(
    intent: DetectedIntent,
    options: SendMessageOptions,
    error?: OpenAIError
  ): ChatResponse {
    const { message, logs } = error ? this.formatErrorForChat(error) : { 
      message: 'Maaf, terjadi kesalahan saat memproses pesanan Anda. Silakan coba lagi atau hubungi tim support kami.',
      logs: 'Unknown error occurred'
    };

    let productCards: ProductCardData[] | undefined;
    if (shouldShowProductCards(intent) && options.context?.products) {
      productCards = options.context.products
        .filter(p => intent.mentionedProducts.includes(p.id))
        .map(generateProductCard);
    }

    return {
      message,
      errorLogs: logs,
      productCards,
      intent,
      suggestions: ['Coba lagi', 'Hubungi Support', 'Lihat FAQ'],
      actions: [
        { type: 'contact_human', label: 'Hubungi Admin' }
      ],
      metadata: {
        timestamp: Date.now(),
        tokensUsed: 0,
        processingTime: 0,
        cached: false,
        model: 'fallback'
      }
    };
  }

  static async getProductRecommendation(
    query: string,
    products: Product[],
    _category?: string
  ): Promise<ChatResponse> {
    const filteredProducts = _category 
      ? products.filter(p => p.category === _category)
      : products;

    const recommendations = getProductRecommendations(query, filteredProducts, 3);

    const message = recommendations.length > 0
      ? `Berdasarkan kebutuhan Anda "${query}", saya merekomendasikan produk berikut:`
      : `Maaf, saya tidak menemukan produk yang cocok untuk "${query}". Silakan coba kata kunci lain atau hubungi support.`;

    const intent: DetectedIntent = {
      type: 'recommendation' as IntentType,
      confidence: 0.9,
      mentionedProducts: recommendations.map(p => p.id),
      mentionedCategories: _category ? [_category] : [],
      keywords: query.split(' '),
      entities: [{ type: 'query', value: query }],
      requiresEscalation: false
    };

    return {
      message,
      productCards: recommendations,
      intent,
      suggestions: generateSuggestions(intent as DetectedIntent),
      metadata: {
        timestamp: Date.now(),
        tokensUsed: 0,
        processingTime: 0,
        cached: false,
        model: 'recommendation-engine'
      }
    };
  }

  static checkFAQ(query: string): string | null {
    const lowerQuery = query.toLowerCase();
    
    for (const [topic, answer] of Object.entries(FAQ_KNOWLEDGE_BASE)) {
      if (lowerQuery.includes(topic)) {
        return answer;
      }
    }

    for (const [topic, answer] of Object.entries(FAQ_KNOWLEDGE_BASE)) {
      const keywords = topic.split(' ');
      if (keywords.some(kw => lowerQuery.includes(kw))) {
        return answer;
      }
    }

    return null;
  }

  static async getOrderStatusResponse(
    orderId: string,
    orders: Order[]
  ): Promise<ChatResponse> {
    const order = orders.find(o => o.id === orderId || o.id.includes(orderId));

    if (!order) {
      return {
        message: `Maaf, saya tidak menemukan pesanan dengan ID "${orderId}". Pastikan ID pesanan sudah benar atau cek di menu "Pesanan Saya".`,
        intent: {
          type: 'order_status',
          confidence: 0.8,
          mentionedProducts: [],
          mentionedCategories: [],
          keywords: ['pesanan', orderId],
          entities: [{ type: 'order_id', value: orderId }],
          requiresEscalation: false
        },
        suggestions: ['Cek semua pesanan', 'Hubungi support', 'Buat pesanan baru'],
        actions: [
          { type: 'check_order', label: 'Lihat Semua Pesanan' },
          { type: 'contact_human', label: 'Hubungi Admin' }
        ],
        metadata: {
          timestamp: Date.now(),
          tokensUsed: 0,
          processingTime: 0,
          cached: false,
          model: 'order-service'
        }
      };
    }

    const statusMap: Record<string, { emoji: string; text: string; desc: string }> = {
      'pending': { emoji: '⏳', text: 'Menunggu Pembayaran', desc: 'Segera lakukan pembayaran untuk memproses pesanan Anda.' },
      'paid': { emoji: '💰', text: 'Pembayaran Diterima', desc: 'Tim kami akan segera memproses pesanan Anda.' },
      'processing': { emoji: '⚙️', text: 'Sedang Diproses', desc: 'Pesanan Anda sedang dalam pengerjaan.' },
      'completed': { emoji: '✅', text: 'Selesai', desc: 'Pesanan Anda telah selesai. Terima kasih!' },
      'cancelled': { emoji: '❌', text: 'Dibatalkan', desc: 'Pesanan ini telah dibatalkan.' }
    };

    const status = statusMap[order.status] || { emoji: '❓', text: order.status, desc: '' };
    const itemsList = order.items.map(item => 
      `• ${item.title} (${item.tier}) x${item.quantity}`
    ).join('\n');

    const message = `${status.emoji} **Status Pesanan #${order.id}**

📊 Status: ${status.text}
${status.desc}

🛒 Items:\n${itemsList}

💵 Total: Rp ${order.total_amount.toLocaleString('id-ID')}
📅 Tanggal: ${new Date(order.created_at || '').toLocaleDateString('id-ID')}`;

    return {
      message,
      intent: {
        type: 'order_status' as IntentType,
        confidence: 1,
        mentionedProducts: order.items.map(i => i.product_id),
        mentionedCategories: [],
        keywords: ['pesanan', orderId],
        entities: [{ type: 'order_id', value: orderId }],
        requiresEscalation: false
      },
      suggestions: ['Pesanan lain', 'Butuh bantuan', 'Beli lagi'],
      actions: [
        { type: 'check_order', label: 'Pesanan Lain' },
        { type: 'contact_human', label: 'Butuh Bantuan?', payload: { orderId: order.id } }
      ],
      metadata: {
        timestamp: Date.now(),
        tokensUsed: 0,
        processingTime: 0,
        cached: false,
        model: 'order-service'
      }
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export async function sendMessage(
  message: string,
  options?: SendMessageOptions
): Promise<ChatResponse> {
  return OpenAIService.sendMessage([{ role: 'user', content: message }], options);
}

export async function streamMessage(
  message: string,
  onChunk: (chunk: string, fullText: string) => void,
  options?: SendMessageOptions
): Promise<ChatResponse> {
  return OpenAIService.streamMessage([{ role: 'user', content: message }], onChunk, options);
}

export function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`;
}

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

export function createSupportTicketFlow(
  _ticketCategory: string,
  subject: string,
  description: string
): {
  summary: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  nextSteps: string[];
} {
  const priorityKeywords: Record<string, string[]> = {
    urgent: ['urgent', 'darurat', 'critical', 'down', 'mati total', 'tidak bisa akses'],
    high: ['error', 'gagal', 'bug', 'masalah', 'problem'],
    medium: ['question', 'tanya', 'info', 'informasi'],
    low: ['suggestion', 'saran', 'feedback']
  };

  const lowerDesc = description.toLowerCase();
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

  for (const [p, keywords] of Object.entries(priorityKeywords)) {
    if (keywords.some(kw => lowerDesc.includes(kw))) {
      priority = p as typeof priority;
      break;
    }
  }

  return {
    summary: `Tiket #${Date.now()}: ${subject}`,
    priority,
    nextSteps: [
      'Tim support akan merespons dalam 2-4 jam',
      'Anda akan menerima notifikasi email saat ada update',
      'Cek status tiket di menu Support'
    ]
  };
}

export default OpenAIService;
