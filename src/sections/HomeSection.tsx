import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Zap, Headphones, Palette, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';
import { LazyImage, LazyBackgroundImage } from '@/components/LazyImage';
import type { Product } from '@/lib/supabase';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 17,
    },
  },
  tap: { scale: 0.98 },
};

const badgeVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export function HomeSection() {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  const { cart, addRecentlyViewed, isDarkMode } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on search query only
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleProductClick = (product: Product) => {
    audioService.playClick();
    addRecentlyViewed(product.id);
    navigate(`/product/${product.id}`);
  };

  const isInCart = (productId: string, tierName: string) => {
    return cart.some(item => item.productId === productId && item.tier === tierName);
  };

  const getCartQuantity = (productId: string, tierName: string) => {
    const item = cart.find(item => item.productId === productId && item.tier === tierName);
    return item?.quantity || 0;
  };

  return (
    <motion.div 
      className={`pb-20 min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Banner */}
      <HeroBanner />

      {/* Search */}
      <motion.div 
        className={`sticky top-[60px] z-30 px-4 py-3 transition-all duration-500 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm shadow-sm`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari layanan..."
            className={`pl-9 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'focus:border-primary'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <motion.div 
            className="grid grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div 
                key={i} 
                className={`rounded-xl h-64 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                variants={itemVariants}
              >
                <motion.div
                  className="w-full h-full rounded-xl"
                  animate={{
                    background: [
                      isDarkMode ? 'rgba(31, 41, 55, 1)' : 'rgba(243, 244, 246, 1)',
                      isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(229, 231, 235, 1)',
                      isDarkMode ? 'rgba(31, 41, 55, 1)' : 'rgba(243, 244, 246, 1)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search className={`h-8 w-8 transition-colors duration-300 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </motion.div>
            <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tidak ada layanan yang ditemukan</p>
            {searchQuery && (
              <motion.button
                className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSearchQuery('')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset Pencarian
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                  isInCart={isInCart(product.id, product.tiers[0]?.name || '')}
                  cartQuantity={getCartQuantity(product.id, product.tiers[0]?.name || '')}
                  isDarkMode={isDarkMode}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}

function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const slides = [
    {
      title: 'Layanan Digital Profesional',
      subtitle: 'Solusi lengkap untuk kebutuhan teknologi Anda',
      image: '/assets/media/b1.webp',
      icon: Zap,
    },
    {
      title: 'Instalasi Wi-Fi & CCTV',
      subtitle: 'Jaringan aman dan terpercaya untuk rumah & kantor',
      image: '/assets/media/b2.webp',
      icon: Shield,
    },
    {
      title: 'Editing Kreatif',
      subtitle: 'Photo & video editing profesional',
      image: '/assets/media/b3.webp',
      icon: Palette,
    },
    {
      title: 'Support Teknis 24/7',
      subtitle: 'Tim ahli siap membantu kapan saja',
      image: '/assets/media/b4.webp',
      icon: Headphones,
    },
    {
      title: 'Layanan Terbaik',
      subtitle: 'Kualitas terjamin untuk kepuasan pelanggan',
      image: '/assets/media/b5.webp',
      icon: Star,
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-48 overflow-hidden">
      {/* Preload all banner images */}
      <div className="hidden">
        {slides.map((slide, idx) => (
          <img key={idx} src={slide.image} alt="" />
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          if (currentSlide !== index) return null;
          return (
            <motion.div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            >
              {/* Background Image with Lazy Loading */}
              <LazyImage
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0"
                containerClassName="absolute inset-0"
                objectFit="cover"
                priority={index === 0}
                blurEffect={true}
              />
              
              {/* Dark Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/40" />
              
              <div className="relative z-10 text-center text-white px-6">
                <motion.div 
                  className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <Icon className="h-8 w-8" />
                </motion.div>
                <motion.h2 
                  className="text-xl font-bold drop-shadow-lg text-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {slide.title}
                </motion.h2>
                <motion.p 
                  className="text-white/90 mt-2 text-sm drop-shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {slide.subtitle}
                </motion.p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
            animate={{ width: currentSlide === index ? 24 : 8 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isInCart: boolean;
  cartQuantity: number;
  isDarkMode: boolean;
}

function ProductCard({ product, onClick, isInCart, cartQuantity, isDarkMode }: ProductCardProps) {
  const price = product.discount_price || product.base_price;
  const hasDiscount = product.discount_price && product.discount_price < product.base_price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.base_price - (product.discount_price || 0)) / product.base_price) * 100)
    : 0;
  const isLowStock = product.stock < 20;
  const isVeryLowStock = product.stock < 10;

  return (
    <motion.div
      onClick={onClick}
      className={`group rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
      variants={itemVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <motion.div 
        className="relative aspect-square overflow-hidden"
        variants={cardHoverVariants}
      >
        <LazyImage
          src={product.icon}
          alt={product.title}
          containerClassName="w-full h-full"
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
          objectFit="cover"
          blurEffect={true}
        />
        <AnimatePresence>
          {hasDiscount && (
            <motion.div
              className="absolute top-2 left-2"
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              exit={{ scale: 0, rotate: 180 }}
            >
              <Badge className="bg-red-500 text-white border-0 shadow-lg">
                -{discountPercent}%
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isInCart && (
            <motion.div 
              className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              {cartQuantity}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isLowStock && (
            <motion.div
              className="absolute bottom-2 left-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <motion.div
                variants={pulseVariants}
                animate="pulse"
              >
                <Badge 
                  className={`text-xs border-0 shadow-lg ${
                    isVeryLowStock 
                      ? 'bg-red-500 text-white' 
                      : 'bg-orange-500 text-white'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full bg-white ${isVeryLowStock ? 'animate-ping' : ''}`} />
                    Stok {isVeryLowStock ? 'Hampir Habis' : 'Terbatas'}
                  </span>
                </Badge>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Hover overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium"
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Lihat Detail
          </motion.div>
        </motion.div>
      </motion.div>
      <div className="p-3">
        <motion.h3 
          className={`font-medium text-sm line-clamp-1 transition-colors duration-300 ${isDarkMode ? 'text-white' : ''}`}
          layout
        >
          {product.title}
        </motion.h3>
        <p className={`text-xs line-clamp-2 mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <motion.span 
              className="text-blue-600 font-bold text-sm"
              key={price}
              initial={{ scale: 1.2, color: '#f59e0b' }}
              animate={{ scale: 1, color: '#2563eb' }}
              transition={{ duration: 0.3 }}
            >
              Rp {price.toLocaleString('id-ID')}
            </motion.span>
            <AnimatePresence>
              {hasDiscount && (
                <motion.span 
                  className={`text-xs line-through ml-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  Rp {product.base_price.toLocaleString('id-ID')}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <motion.div 
            className="flex items-center text-yellow-500 text-xs"
            whileHover={{ scale: 1.1 }}
          >
            <Star className="h-3 w-3 fill-current" />
            <span className="ml-0.5">{product.rating}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
