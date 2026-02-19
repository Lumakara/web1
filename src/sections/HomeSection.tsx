import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Zap, Headphones, Palette, Shield, ShoppingCart, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';
import type { Product } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// Mock products data (directly in component for reliability)
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'wifi',
    title: 'Wi-Fi Installation',
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
  }
];

// Banner slides
const BANNER_SLIDES = [
  { title: 'Layanan Digital Profesional', subtitle: 'Solusi lengkap untuk kebutuhan teknologi Anda', icon: Zap, color: 'from-blue-600 to-purple-600' },
  { title: 'Instalasi Wi-Fi & CCTV', subtitle: 'Jaringan aman dan terpercaya', icon: Shield, color: 'from-green-600 to-teal-600' },
  { title: 'Editing Kreatif', subtitle: 'Photo & video editing profesional', icon: Palette, color: 'from-pink-600 to-rose-600' },
  { title: 'Support Teknis 24/7', subtitle: 'Tim ahli siap membantu', icon: Headphones, color: 'from-orange-600 to-amber-600' },
  { title: 'Kualitas Terbaik', subtitle: 'Kepuasan pelanggan prioritas kami', icon: Star, color: 'from-indigo-600 to-blue-600' },
];

export function HomeSection() {
  const navigate = useNavigate();
  const { cart, addToCart, addRecentlyViewed, isDarkMode, setNotification } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleProductClick = (product: Product) => {
    audioService.playClick();
    addRecentlyViewed(product.id);
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const tier = product.tiers[0];
    if (tier) {
      addToCart(product, tier.name);
      setNotification({
        message: `${product.title} ditambahkan ke keranjang`,
        type: 'success'
      });
      audioService.playSuccess();
    }
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.productId === productId);
  };

  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      )}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen pb-24 transition-colors duration-300",
      isDarkMode ? "bg-gray-950" : "bg-gray-50"
    )}>
      {/* Hero Banner */}
      <div className="relative h-56 overflow-hidden">
        <AnimatePresence mode="wait">
          {BANNER_SLIDES.map((slide, index) => {
            const Icon = slide.icon;
            if (currentSlide !== index) return null;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-gradient-to-br",
                  slide.color
                )}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                </div>
                
                <div className="relative text-center text-white px-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold"
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 text-sm mt-1"
                  >
                    {slide.subtitle}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {BANNER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={cn(
                "h-2 rounded-full transition-all",
                currentSlide === idx ? "w-6 bg-white" : "w-2 bg-white/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className={cn(
        "sticky top-0 z-30 px-4 py-3 border-b",
        isDarkMode 
          ? "bg-gray-950/95 border-gray-800" 
          : "bg-white/95 border-gray-200"
      )}>
        <div className="relative max-w-lg mx-auto">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )} />
          <Input
            placeholder="Cari layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-10 h-11 rounded-xl",
              isDarkMode 
                ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                : "bg-gray-100 border-0"
            )}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4",
                isDarkMode ? "bg-gray-800" : "bg-gray-100"
              )}
            >
              <Search className={cn(
                "w-8 h-8",
                isDarkMode ? "text-gray-600" : "text-gray-400"
              )} />
            </motion.div>
            <p className={cn(
              "text-lg font-medium",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>
              Tidak ada hasil
            </p>
            <p className={cn(
              "text-sm mt-1",
              isDarkMode ? "text-gray-500" : "text-gray-500"
            )}>
              Coba kata kunci lain
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleProductClick(product)}
                className={cn(
                  "group relative rounded-2xl overflow-hidden cursor-pointer",
                  "border transition-all duration-300",
                  isDarkMode 
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600" 
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg"
                )}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Discount Badge */}
                  {product.discount_price && product.discount_price < product.base_price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round((1 - product.discount_price / product.base_price) * 100)}%
                    </div>
                  )}

                  {/* Rating */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {product.rating}
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleAddToCart(e, product)}
                    className={cn(
                      "absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-colors",
                      isInCart(product.id)
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {isInCart(product.id) ? (
                      <ShoppingCart className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className={cn(
                    "font-semibold text-sm line-clamp-1",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    {product.title}
                  </h3>
                  <p className={cn(
                    "text-xs mt-0.5 line-clamp-1",
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {product.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "font-bold text-sm",
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    )}>
                      Rp {(product.discount_price || product.base_price).toLocaleString('id-ID')}
                    </span>
                    {product.discount_price && product.discount_price < product.base_price && (
                      <span className={cn(
                        "text-xs line-through",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )}>
                        Rp {product.base_price.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className={cn(
                    "flex items-center gap-1 mt-2 text-xs",
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {product.duration}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeSection;
