import type { Product } from './supabase';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents a single chat message in the conversation
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Structure of the response from Kimi AI API
 */
export interface KimiResponse {
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

/**
 * Product context passed to the AI for product-related queries
 */
export interface ProductContext {
  products: Product[];
  queryType: 'detail' | 'comparison' | 'recommendation' | 'pricing' | 'general';
  mentionedProductIds?: string[];
}

/**
 * Response structure from the KimiService
 */
export interface ChatResponse {
  message: string;
  products?: Product[];
  intent: DetectedIntent;
  timestamp: number;
}

/**
 * Detected user intent from message
 */
export interface DetectedIntent {
  type: 'product_inquiry' | 'troubleshooting' | 'general_question' | 'greeting' | 'goodbye' | 'comparison' | 'pricing' | 'recommendation' | 'unknown';
  confidence: number;
  mentionedProducts: string[];
  keywords: string[];
}

/**
 * Configuration options for Kimi service
 */
export interface KimiConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: KimiConfig = {
  apiKey: import.meta.env.VITE_Kimi_API_KEY || '',
  baseURL: 'https://api.openai.com/v1', // Default to OpenAI; override for Kimi/Moonshot
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
};

// Alternative: Moonshot AI (Kimi) API endpoint
// baseURL: 'https://api.moonshot.cn/v1'
// model: 'moonshot-v1-8k' or other Kimi models

// ============================================================================
// System Prompt
// ============================================================================

const SYSTEM_PROMPT = `Kamu adalah Customer Service AI yang sangat pintar, ramah, dan profesional untuk toko digital kami. 
Nama kamu adalah "Kimi Assistant". Berikut adalah karakteristik dan kemampuanmu:

## Kepribadian:
- Selalu ramah, sopan, dan menggunakan bahasa Indonesia yang baik dan benar
- Profesional namun approachable dan hangat
- Sabar dalam membantu customer dari berbagai level teknis
- Responsif dan proaktif dalam memberikan solusi

## Kemampuan Utama:
1. **Penjelasan Produk**: Bisa menjelaskan produk dengan detail, termasuk fitur, keunggulan, dan cara kerja
2. **Troubleshooting**: Bisa membantu menyelesaikan masalah teknis yang umum terjadi
3. **Rekomendasi**: Bisa merekomendasikan produk yang sesuai dengan kebutuhan customer
4. **Perbandingan**: Bisa membandingkan beberapa produk untuk membantu customer memilih
5. **Informasi Umum**: Bisa menjawab pertanyaan seputar pemesanan, pembayaran, dan pengiriman

## Format Respons Product Card:
Ketika user menanyakan tentang produk spesifik, tambahkan tag khusus di akhir respons:
[PRODUCT_CARDS:product_id1,product_id2,...]

Contoh:
"VPS Hosting kami sangat cocok untuk website dengan traffic tinggi. Kami menyediakan berbagai paket yang bisa disesuaikan.
[PRODUCT_CARDS:vps]"

## Aturan Penting:
- JANGAN pernah membuat janji palsu atau informasi yang tidak akurat tentang produk
- Jika tidak tahu jawabannya, arahkan user untuk menghubungi tim support manusia
- Selalu prioritaskan kepuasan customer dan experience yang positif
- Gunakan emoji dengan bijak untuk membuat percakapan lebih hidup 😊
- Untuk pertanyaan teknis, berikan penjelasan yang mudah dipahami
- Selalu sebutkan harga dalam format Rupiah (Rp) dengan format yang rapi

## Konteks Produk yang Tersedia:
Kami menyediakan layanan digital berikut:
- VPS Hosting (Server virtual untuk hosting website/aplikasi)
- Wi-Fi Installation Service (Pemasangan dan konfigurasi jaringan WiFi)
- CCTV Security System (Instalasi sistem keamanan kamera)
- Code Error Repair (Jasa debugging dan perbaikan kode)
- Photo Editing (Jasa edit foto profesional)
- Video Editing (Jasa edit video profesional)

Setiap produk memiliki 3 tier: Basic, Standard, dan Premium dengan fitur dan harga yang berbeda.`;

// ============================================================================
// Intent Detection Keywords
// ============================================================================

const INTENT_KEYWORDS = {
  product_inquiry: [
    'apa itu', 'apa', 'jelaskan', 'detail', 'informasi', 'spesifikasi',
    'fitur', 'kelebihan', 'keuntungan', 'cara kerja', 'bagaimana'
  ],
  troubleshooting: [
    'error', 'masalah', 'gagal', 'tidak bisa', 'trouble', 'bug', 'issue',
    'solusi', 'perbaiki', 'bantu', 'help', 'problem', 'tidak work'
  ],
  comparison: [
    'bandingkan', 'perbedaan', 'vs', 'versus', 'lebih baik', 'lebih bagus',
    'pilih mana', 'rekomendasi', 'saran', 'which one', 'compare'
  ],
  pricing: [
    'harga', 'berapa', 'mahal', 'murah', 'biaya', 'cost', 'price',
    'diskon', 'promo', 'potongan', 'cicil', 'bayar'
  ],
  recommendation: [
    'rekomendasi', 'saran', 'butuh', 'cari', 'mau', 'ingin', 'recommended',
    'cocok', 'sesuai', 'advis', 'suggestion'
  ],
  greeting: [
    'halo', 'hi', 'hello', 'hey', 'selamat', 'pagi', 'siang', 'sore', 'malam',
    'apa kabar', 'hai'
  ],
  goodbye: [
    'terima kasih', 'thanks', 'thank you', 'dadah', 'bye', 'selamat tinggal',
    'sampai jumpa', 'makasih', 'thx'
  ],
};

const PRODUCT_KEYWORDS: Record<string, string[]> = {
  vps: ['vps', 'server', 'hosting', 'virtual private', 'cloud server', 'droplet'],
  wifi: ['wifi', 'wi-fi', 'internet', 'router', 'jaringan', 'network', 'wireless'],
  cctv: ['cctv', 'kamera', 'camera', 'security', 'keamanan', 'monitoring'],
  code: ['code', 'coding', 'programming', 'error', 'debug', 'bug', 'script', 'kode'],
  photo: ['photo', 'foto', 'gambar', 'image', 'editing', 'retouch', 'photoshop'],
  video: ['video', 'editing', 'montage', 'post production', 'premiere', 'final cut'],
};

// ============================================================================
// Intent Detection
// ============================================================================

/**
 * Detect user intent from their message
 */
export function detectIntent(message: string): DetectedIntent {
  const lowerMessage = message.toLowerCase();
  const detectedKeywords: string[] = [];
  const mentionedProducts: string[] = [];
  
  // Check for product mentions
  for (const [productId, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        if (!mentionedProducts.includes(productId)) {
          mentionedProducts.push(productId);
        }
        detectedKeywords.push(keyword);
        break;
      }
    }
  }
  
  // Check for intent types
  let detectedType: DetectedIntent['type'] = 'unknown';
  let maxMatches = 0;
  
  for (const [intentType, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const matches = keywords.filter(kw => lowerMessage.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedType = intentType as DetectedIntent['type'];
    }
  }
  
  // Override based on product mentions and context
  if (mentionedProducts.length > 0 && detectedType === 'unknown') {
    detectedType = 'product_inquiry';
  }
  
  if (mentionedProducts.length >= 2 && detectedType === 'product_inquiry') {
    detectedType = 'comparison';
  }
  
  // Calculate confidence (simple heuristic)
  const confidence = Math.min(0.3 + (maxMatches * 0.15) + (mentionedProducts.length * 0.1), 1);
  
  return {
    type: detectedType,
    confidence,
    mentionedProducts,
    keywords: detectedKeywords,
  };
}

/**
 * Check if message is asking about products (should show product cards)
 */
export function shouldShowProductCards(intent: DetectedIntent): boolean {
  return (
    intent.mentionedProducts.length > 0 &&
    (intent.type === 'product_inquiry' ||
     intent.type === 'comparison' ||
     intent.type === 'recommendation' ||
     intent.type === 'pricing')
  );
}

// ============================================================================
// Product Context Generation
// ============================================================================

/**
 * Format product information for AI context
 */
function formatProductContext(products: Product[]): string {
  if (!products || products.length === 0) return '';
  
  return products.map(p => {
    const priceDisplay = p.discount_price 
      ? `~~Rp ${p.base_price.toLocaleString('id-ID')}~~ → Rp ${p.discount_price.toLocaleString('id-ID')}`
      : `Rp ${p.base_price.toLocaleString('id-ID')}`;
    
    const tiersInfo = p.tiers.map(t => 
      `  - ${t.name}: Rp ${t.price.toLocaleString('id-ID')} (${t.features.join(', ')})`
    ).join('\n');
    
    return `
Product ID: ${p.id}
Name: ${p.title}
Category: ${p.category}
Price: ${priceDisplay}
Duration: ${p.duration}
Rating: ${p.rating}/5 (${p.reviews} reviews)
Description: ${p.description}
Tags: ${p.tags.join(', ')}
Tiers:
${tiersInfo}
Related Products: ${p.related.join(', ')}
`;
  }).join('\n---\n');
}

/**
 * Filter relevant products based on user intent
 */
function getRelevantProducts(intent: DetectedIntent, allProducts: Product[]): Product[] {
  if (intent.mentionedProducts.length === 0) return [];
  
  return allProducts.filter(p => 
    intent.mentionedProducts.includes(p.id) ||
    intent.mentionedProducts.some(mp => 
      p.title.toLowerCase().includes(mp) ||
      p.tags.some(tag => tag.toLowerCase().includes(mp))
    )
  );
}

// ============================================================================
// API Integration
// ============================================================================

/**
 * Send message to Kimi AI API
 */
async function callKimiAPI(
  messages: ChatMessage[],
  config: Partial<KimiConfig> = {}
): Promise<KimiResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!finalConfig.apiKey) {
    throw new Error('Kimi API key is not configured. Please set VITE_Kimi_API_KEY environment variable.');
  }
  
  const response = await fetch(`${finalConfig.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${finalConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: finalConfig.model,
      messages,
      temperature: finalConfig.temperature,
      max_tokens: finalConfig.maxTokens,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Kimi API error: ${response.status} ${response.statusText}${
        errorData.error ? ` - ${errorData.error.message}` : ''
      }`
    );
  }
  
  return response.json();
}

// ============================================================================
// Response Processing
// ============================================================================

/**
 * Extract product card tags from AI response
 */
function extractProductCards(content: string): { message: string; productIds: string[] } {
  const productCardRegex = /\[PRODUCT_CARDS:([^\]]+)\]/g;
  const productIds: string[] = [];
  
  let match;
  while ((match = productCardRegex.exec(content)) !== null) {
    const ids = match[1].split(',').map(id => id.trim()).filter(Boolean);
    productIds.push(...ids);
  }
  
  // Remove the tags from the message
  const cleanMessage = content.replace(productCardRegex, '').trim();
  
  return {
    message: cleanMessage,
    productIds: [...new Set(productIds)], // Remove duplicates
  };
}

/**
 * Generate product cards response for direct use
 */
export function generateProductCards(products: Product[]): string {
  if (!products || products.length === 0) return '';
  
  return products.map(p => {
    const finalPrice = p.discount_price || p.base_price;
    const originalPrice = p.discount_price ? `~~Rp ${p.base_price.toLocaleString('id-ID')}~~ ` : '';
    
    return `📦 **${p.title}**
${p.description}
💰 Harga: ${originalPrice}Rp ${finalPrice.toLocaleString('id-ID')}
⭐ Rating: ${p.rating}/5 (${p.reviews} ulasan)
⏱️ Durasi: ${p.duration}
📝 Paket: ${p.tiers.map(t => t.name).join(', ')}`;
  }).join('\n\n');
}

// ============================================================================
// Main Service
// ============================================================================

export class KimiService {
  private static config: Partial<KimiConfig> = {};
  private static conversationHistory: ChatMessage[] = [];
  
  /**
   * Configure the Kimi service
   */
  static configure(config: Partial<KimiConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Clear conversation history
   */
  static clearHistory(): void {
    this.conversationHistory = [];
  }
  
  /**
   * Get current conversation history
   */
  static getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
  
  /**
   * Send a message to Kimi AI and get response
   * 
   * @param message - User message
   * @param context - Optional array of products for product-related queries
   * @param options - Optional configuration overrides
   * @returns Promise with chat response
   * 
   * @example
   * ```typescript
   * const response = await KimiService.sendMessage('Apa itu VPS?', products);
   * console.log(response.message); // AI response text
   * console.log(response.products); // Related product data if any
   * ```
   */
  static async sendMessage(
    message: string,
    context?: Product[],
    options?: Partial<KimiConfig>
  ): Promise<ChatResponse> {
    // Detect intent
    const intent = detectIntent(message);
    
    // Get relevant products
    const relevantProducts = context ? getRelevantProducts(intent, context) : [];
    
    // Build system prompt with product context if available
    let systemPrompt = SYSTEM_PROMPT;
    if (relevantProducts.length > 0) {
      systemPrompt += `\n\n## Produk yang Sedang Dibahas:\n${formatProductContext(relevantProducts)}`;
    }
    
    // Prepare messages
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: message },
    ];
    
    try {
      // Call API
      const response = await callKimiAPI(messages, { ...this.config, ...options });
      const aiMessage = response.choices[0]?.message?.content || 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';
      
      // Extract product cards
      const { message: cleanMessage, productIds } = extractProductCards(aiMessage);
      
      // Get products to display
      let displayProducts: Product[] | undefined;
      if (productIds.length > 0 && context) {
        displayProducts = context.filter(p => productIds.includes(p.id));
      } else if (shouldShowProductCards(intent) && relevantProducts.length > 0) {
        displayProducts = relevantProducts;
      }
      
      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: cleanMessage }
      );
      
      // Trim history if too long (keep last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }
      
      return {
        message: cleanMessage,
        products: displayProducts,
        intent,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('KimiService error:', error);
      
      // Fallback response for errors
      return {
        message: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi atau hubungi tim support kami.',
        products: shouldShowProductCards(intent) ? relevantProducts : undefined,
        intent,
        timestamp: Date.now(),
      };
    }
  }
  
  /**
   * Send a quick product recommendation
   */
  static async getProductRecommendation(
    query: string,
    products: Product[],
    category?: string
  ): Promise<ChatResponse> {
    let filteredProducts = products;
    if (category) {
      filteredProducts = products.filter(p => p.category === category);
    }
    
    const prompt = `Bantu saya menemukan produk yang tepat untuk kebutuhan ini: "${query}". 
Berdasarkan produk yang tersedia, berikan rekomendasi terbaik dengan penjelasan singkat.`;
    
    return this.sendMessage(prompt, filteredProducts);
  }
  
  /**
   * Get troubleshooting help
   */
  static async getTroubleshootingHelp(
    issue: string,
    productId?: string,
    products?: Product[]
  ): Promise<ChatResponse> {
    const relevantProducts = productId && products 
      ? products.filter(p => p.id === productId)
      : products;
    
    const prompt = `Saya mengalami masalah: "${issue}".${productId ? ` Ini terkait produk ${productId}.` : ''} 
Bantu saya troubleshoot dan berikan solusi langkah demi langkah.`;
    
    return this.sendMessage(prompt, relevantProducts);
  }
  
  /**
   * Check if API is configured
   */
  static isConfigured(): boolean {
    const apiKey = this.config.apiKey || DEFAULT_CONFIG.apiKey;
    return Boolean(apiKey && apiKey.length > 0);
  }
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Quick send message helper function
 */
export async function sendMessage(
  message: string,
  context?: Product[],
  config?: Partial<KimiConfig>
): Promise<ChatResponse> {
  if (config) {
    KimiService.configure(config);
  }
  return KimiService.sendMessage(message, context);
}

/**
 * Format price to Indonesian Rupiah
 */
export function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`;
}

/**
 * Get product by ID from array
 */
export function findProductById(products: Product[], id: string): Product | undefined {
  return products.find(p => p.id === id);
}

/**
 * Search products by keyword
 */
export function searchProducts(products: Product[], keyword: string): Product[] {
  const lowerKeyword = keyword.toLowerCase();
  return products.filter(p =>
    p.title.toLowerCase().includes(lowerKeyword) ||
    p.description.toLowerCase().includes(lowerKeyword) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

export default KimiService;
