/**
 * Products Hook
 * 
 * Hook untuk mengelola data produk.
 * Menggunakan mock data sebagai primary source (tidak bergantung ke Supabase)
 */

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';

// ============================================
// Types
// ============================================

export interface Tier {
  name: string;
  price: number;
  features: string[];
}

export interface Product {
  id: string;
  title: string;
  category: 'installation' | 'creative' | 'technical';
  base_price: number;
  discount_price?: number;
  stock: number;
  image: string;
  icon: string;
  rating: number;
  reviews: number;
  duration: string;
  description: string;
  tags: string[];
  tiers: Tier[];
  related: string[];
  benefits?: string[];
  terms_conditions?: string;
  form_fields?: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

// ============================================
// MOCK DATA - Data Produk Lengkap
// ============================================

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'wifi',
    title: 'Wi-Fi Installation Service',
    category: 'installation',
    base_price: 89000,
    discount_price: 79000,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
    icon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200',
    rating: 4.8,
    reviews: 156,
    duration: '2-3 jam',
    description: 'Pemasangan dan konfigurasi jaringan wireless profesional untuk rumah dan kantor.',
    tags: ['network', 'internet', 'setup'],
    tiers: [
      { name: 'Basic', price: 89000, features: ['Setup 1 router', 'Konfigurasi dasar', 'Optimasi kecepatan', 'Garansi 1 tahun'] },
      { name: 'Standard', price: 149000, features: ['Setup mesh network', 'Keamanan advanced', 'Optimasi multi device', 'Guest network', 'Garansi 2 tahun'] },
      { name: 'Premium', price: 249000, features: ['Enterprise mesh system', 'Security suite', 'IoT management', 'Priority support', 'Garansi 3 tahun'] }
    ],
    related: ['vps', 'code']
  },
  {
    id: 'cctv',
    title: 'CCTV Security System',
    category: 'installation',
    base_price: 199000,
    discount_price: 179000,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400',
    icon: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=200',
    rating: 4.7,
    reviews: 89,
    duration: '4-6 jam',
    description: 'Instalasi kamera keamanan lengkap dengan monitoring dan akses mobile.',
    tags: ['security', 'camera', 'monitoring'],
    tiers: [
      { name: 'Basic', price: 199000, features: ['2 kamera HD', 'Recording dasar', 'Akses mobile app', 'Storage 1 TB'] },
      { name: 'Standard', price: 399000, features: ['4 kamera 4K', 'Night vision', 'Motion detection', 'Cloud backup', 'Storage 2 TB'] },
      { name: 'Premium', price: 699000, features: ['8 kamera 4K', 'AI detection', '24/7 monitoring', 'Professional monitoring', 'Storage 4 TB'] }
    ],
    related: ['wifi', 'vps']
  },
  {
    id: 'code',
    title: 'Code Error Repair',
    category: 'technical',
    base_price: 59000,
    discount_price: 49000,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
    icon: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200',
    rating: 4.9,
    reviews: 234,
    duration: '1-4 jam',
    description: 'Debugging dan optimasi kode expert untuk website dan aplikasi.',
    tags: ['debugging', 'coding', 'development'],
    tiers: [
      { name: 'Basic', price: 59000, features: ['Identifikasi bug', 'Fix sederhana', 'Code review', 'Dokumentasi'] },
      { name: 'Standard', price: 129000, features: ['Complex debugging', 'Performance optimization', 'Security audit', 'Testing'] },
      { name: 'Premium', price: 249000, features: ['Full code refactoring', 'Architecture review', 'Performance tuning', 'Long-term support'] }
    ],
    related: ['vps', 'wifi']
  },
  {
    id: 'photo',
    title: 'Photo Editing',
    category: 'creative',
    base_price: 29000,
    discount_price: 25000,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400',
    icon: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200',
    rating: 4.6,
    reviews: 120,
    duration: '1-2 hari',
    description: 'Retouching dan enhancement gambar profesional.',
    tags: ['photo', 'editing', 'creative'],
    tiers: [
      { name: 'Basic', price: 29000, features: ['Color correction', 'Basic retouching', 'Format conversion', '5 revisi'] },
      { name: 'Standard', price: 79000, features: ['Advanced retouching', 'Background removal', 'Skin smoothing', 'Unlimited revisi'] },
      { name: 'Premium', price: 149000, features: ['High-end editing', 'Composite work', 'RAW processing', 'Priority delivery'] }
    ],
    related: ['video', 'code']
  },
  {
    id: 'video',
    title: 'Video Editing',
    category: 'creative',
    base_price: 79000,
    discount_price: 69000,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400',
    icon: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200',
    rating: 4.8,
    reviews: 95,
    duration: '2-5 hari',
    description: 'Editing video dan post-production profesional.',
    tags: ['video', 'editing', 'production'],
    tiers: [
      { name: 'Basic', price: 79000, features: ['Basic cuts', 'Transitions', 'Audio sync', 'Output 1080p'] },
      { name: 'Standard', price: 199000, features: ['Color grading', 'Motion graphics', 'Sound mixing', 'Output 4K'] },
      { name: 'Premium', price: 399000, features: ['VFX', 'Animation', 'Professional sound design', 'Cinema quality'] }
    ],
    related: ['photo', 'code']
  },
  {
    id: 'vps',
    title: 'VPS Hosting',
    category: 'technical',
    base_price: 49000,
    discount_price: 39000,
    stock: 500,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    icon: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200',
    rating: 4.5,
    reviews: 180,
    duration: 'Instant',
    description: 'Solusi hosting Virtual Private Server.',
    tags: ['hosting', 'server', 'infrastructure'],
    tiers: [
      { name: 'Basic', price: 49000, features: ['2 CPU cores', '4GB RAM', '50GB SSD', '1TB bandwidth'] },
      { name: 'Standard', price: 99000, features: ['4 CPU cores', '8GB RAM', '100GB SSD', '2TB bandwidth'] },
      { name: 'Premium', price: 199000, features: ['8 CPU cores', '16GB RAM', '200GB SSD', 'Unlimited bandwidth'] }
    ],
    related: ['wifi', 'code']
  },
  {
    id: 'pterodactyl',
    title: 'Pterodactyl Panel',
    category: 'technical',
    base_price: 50000,
    discount_price: 50000,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    icon: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200',
    rating: 4.9,
    reviews: 89,
    duration: 'Instant',
    description: 'Panel hosting game server profesional dengan antarmuka yang mudah digunakan',
    tags: ['hosting', 'game-server', 'panel'],
    tiers: [
      { name: '5GB', price: 50000, features: ['1 CPU Core', '2GB RAM', '5GB SSD', 'Unlimited Bandwidth', 'DDoS Protection', 'Auto Backup', '24/7 Support'] },
      { name: '10GB', price: 100000, features: ['2 CPU Cores', '4GB RAM', '10GB SSD', 'Unlimited Bandwidth', 'DDoS Protection', 'Auto Backup', 'Priority Support', 'Custom Domain'] },
      { name: 'Unlimited', price: 200000, features: ['4 CPU Cores', '8GB RAM', 'Unlimited SSD', 'Unlimited Bandwidth', 'Advanced DDoS', 'Auto Backup', 'Priority Support 24/7', 'Custom Domain & SSL', 'Dedicated IP'] }
    ],
    related: ['vps', 'code'],
    benefits: [
      'Panel mudah digunakan untuk semua game populer',
      'Support Minecraft, CS:GO, Valheim, dan lainnya',
      'Backup otomatis harian',
      'Jaminan uptime 99.9%',
      'Migrasi gratis dari provider lain'
    ],
    terms_conditions: 'Minimum kontrak 1 bulan. Pembatalan dapat dilakukan kapan saja. Refund tersedia dalam 7 hari pertama.',
    form_fields: [
      { name: 'game_type', label: 'Jenis Game', type: 'select', required: true },
      { name: 'server_name', label: 'Nama Server', type: 'text', required: true },
      { name: 'additional_notes', label: 'Catatan Tambahan', type: 'textarea', required: false }
    ]
  },
  {
    id: 'wifi-installasi',
    title: 'WiFi Instalasi ION Network',
    category: 'installation',
    base_price: 235997,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
    icon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200',
    rating: 4.8,
    reviews: 156,
    duration: '1-3 hari',
    description: 'Layanan instalasi WiFi profesional dari ION Network dengan berbagai paket kecepatan',
    tags: ['wifi', 'internet', 'instalasi'],
    tiers: [
      { name: 'FLASH 60Mbps', price: 235997, features: ['Kecepatan 60Mbps', 'Upload 30Mbps', 'Support hingga 5 device', 'Router included', 'Instalasi gratis', 'Support 24/7'] },
      { name: 'LIGHT 100Mbps', price: 285630, features: ['Kecepatan 100Mbps', 'Upload 50Mbps', 'Support hingga 10 device', 'Dual-band router', 'Instalasi gratis', 'Support 24/7'] },
      { name: 'AMAZING 150Mbps', price: 358651, features: ['Kecepatan 150Mbps', 'Upload 75Mbps', 'Support hingga 15 device', 'WiFi 6 router', 'Instalasi gratis', 'Priority support'] },
      { name: 'BLITZ 300Mbps', price: 526816, features: ['Kecepatan 300Mbps', 'Upload 150Mbps', 'Support hingga 25 device', 'Mesh WiFi system', 'Instalasi premium', 'Dedicated support'] },
      { name: 'UNIVERSE 500Mbps', price: 650770, features: ['Kecepatan 500Mbps', 'Upload 250Mbps', 'Support hingga 40 device', 'Enterprise mesh system', 'Instalasi premium', 'VIP support 24/7'] },
      { name: 'INFINITE 1Gbps', price: 1120999, features: ['Kecepatan 1Gbps', 'Upload 500Mbps', 'Unlimited device', 'Enterprise grade equipment', 'Premium instalasi + setup', 'VIP support 24/7', 'SLA 99.9%'] }
    ],
    related: ['wifi', 'cctv'],
    benefits: [
      'Jaringan fiber optic berkecepatan tinggi',
      'Instalasi oleh teknisi berpengalaman',
      'Garansi perangkat 1 tahun',
      'Support teknis 24/7',
      'Upgrade paket kapan saja',
      'Tidak ada kuota limit'
    ],
    terms_conditions: 'Minimum kontrak 12 bulan. Biaya pemasangan dapat dikenakan untuk area tertentu. Pembatalan sebelum masa kontrak dikenakan biaya penalti.',
    form_fields: [
      { name: 'installation_address', label: 'Alamat Instalasi', type: 'textarea', required: true },
      { name: 'contact_person', label: 'Nama Penanggung Jawab', type: 'text', required: true },
      { name: 'contact_phone', label: 'Nomor Telepon', type: 'text', required: true },
      { name: 'preferred_date', label: 'Tanggal Instalasi yang Diinginkan', type: 'date', required: false },
      { name: 'additional_requests', label: 'Permintaan Tambahan', type: 'textarea', required: false }
    ]
  }
];

// ============================================
// Storage Key
// ============================================
const PRODUCTS_STORAGE_KEY = 'layanan_digital_products';

// ============================================
// Helper Functions
// ============================================

function getStoredProducts(): Product[] {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('[useProducts] Failed to save products:', error);
  }
}

// ============================================
// Hook
// ============================================

export const useProducts = () => {
  const { products, setProducts } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate network delay untuk UX yang lebih baik
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Load from localStorage atau gunakan mock data
        const storedProducts = getStoredProducts();
        setProducts(storedProducts);
        
        console.log('[useProducts] Loaded', storedProducts.length, 'products');
      } catch (err: any) {
        console.error('[useProducts] Error loading products:', err);
        setError('Gagal memuat produk');
        // Fallback ke mock data
        setProducts(MOCK_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    // Hanya load jika products masih kosong
    if (products.length === 0) {
      loadProducts();
    } else {
      setIsLoading(false);
    }
  }, [products.length, setProducts]);

  const getProductById = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  const getProductsByCategory = useCallback((category: string) => {
    if (category === 'all') return products;
    return products.filter((p) => p.category === category);
  }, [products]);

  const searchProducts = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [products]);

  // Admin functions
  const createProduct = useCallback(async (product: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveProducts(updated);
    return newProduct;
  }, [products, setProducts]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<Product> => {
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setProducts(updated);
    saveProducts(updated);
    const product = updated.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    return product;
  }, [products, setProducts]);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  }, [products, setProducts]);

  const updateStock = useCallback(async (id: string, stock: number): Promise<void> => {
    const updated = products.map(p => p.id === id ? { ...p, stock } : p);
    setProducts(updated);
    saveProducts(updated);
  }, [products, setProducts]);

  const updatePrice = useCallback(async (id: string, basePrice: number, discountPrice?: number): Promise<void> => {
    const updated = products.map(p => 
      p.id === id ? { ...p, base_price: basePrice, discount_price: discountPrice } : p
    );
    setProducts(updated);
    saveProducts(updated);
  }, [products, setProducts]);

  return {
    products,
    isLoading,
    error,
    getProductById,
    getProductsByCategory,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    updatePrice,
  };
};

export default useProducts;
