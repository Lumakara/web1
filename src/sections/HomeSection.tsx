import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, ChevronRight, Sparkles, Zap, Headphones, Palette, Wrench, Code, Video, Globe, Cpu, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProducts } from '@/hooks/useProducts';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';
import { ProductModalUltra } from '@/components/ProductModalUltra';
import type { Product } from '@/lib/supabase';

// 8 Categories with icons (used in filter sheet only)
const categories = [
  { id: 'all', label: 'Semua', icon: Sparkles },
  { id: 'installation', label: 'Instalasi', icon: Wrench },
  { id: 'creative', label: 'Kreatif', icon: Palette },
  { id: 'technical', label: 'Teknis', icon: Code },
  { id: 'network', label: 'Jaringan', icon: Globe },
  { id: 'security', label: 'Keamanan', icon: Shield },
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'multimedia', label: 'Multimedia', icon: Video },
];

// Promo types for notifications
const promoTypes = [
  { type: 'trending', label: '🔥 Trending', color: 'from-orange-500 to-red-500' },
  { type: 'cheap', label: '💰 Termurah', color: 'from-green-500 to-emerald-500' },
  { type: 'new', label: '✨ Baru', color: 'from-blue-500 to-purple-500' },
  { type: 'bestseller', label: '⭐ Best Seller', color: 'from-yellow-500 to-amber-500' },
];

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
  const { products, isLoading } = useProducts();
  const { addToCart, cart, addRecentlyViewed, isDarkMode } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<typeof promoTypes[0] | null>(null);

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get trending/cheap products
  const getPromoProducts = (type: string) => {
    switch (type) {
      case 'trending':
        return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);
      case 'cheap':
        return [...products].sort((a, b) => (a.discount_price || a.base_price) - (b.discount_price || b.base_price)).slice(0, 5);
      case 'new':
        return [...products].slice(0, 5);
      case 'bestseller':
        return [...products].sort((a, b) => b.rating - a.rating).slice(0, 5);
      default:
        return [];
    }
  };

  const handleCategoryClick = (catId: string) => {
    audioService.playClick();
    setSelectedCategory(catId);
  };

  const handleProductClick = (product: Product) => {
    audioService.playClick();
    setSelectedProduct(product);
    setShowProductModal(true);
    addRecentlyViewed(product.id);
  };

  const handleAddToCart = (product: Product, tier: string) => {
    addToCart(product, tier);
    setShowProductModal(false);
  };

  const handlePromoClick = (promo: typeof promoTypes[0]) => {
    audioService.playClick();
    setCurrentPromo(promo);
    setShowPromoModal(true);
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

      {/* Promo Badges */}
      <motion.div 
        className="px-4 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {promoTypes.map((promo, index) => (
            <motion.button
              key={promo.type}
              onClick={() => handlePromoClick(promo)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${promo.color} shadow-lg`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              {promo.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div 
        className={`sticky top-[60px] z-30 px-4 py-3 transition-all duration-500 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm shadow-sm`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex gap-2">
          <motion.div 
            className="relative flex-1"
            whileFocus={{ scale: 1.01 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari layanan..."
              className={`pl-9 transition-all duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-primary' : 'focus:border-primary'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
          <Sheet>
            <SheetTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => audioService.playClick()}
                  className={`transition-all duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent side="bottom" className={`h-[70vh] transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <SheetHeader>
                <SheetTitle className={`transition-colors duration-300 ${isDarkMode ? 'text-white' : ''}`}>Filter Layanan</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className={`font-medium mb-3 transition-colors duration-300 ${isDarkMode ? 'text-white' : ''}`}>Kategori</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, index) => {
                      const Icon = cat.icon;
                      return (
                        <motion.button
                          key={cat.id}
                          onClick={() => {
                            handleCategoryClick(cat.id);
                            audioService.playClick();
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                            selectedCategory === cat.id
                              ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg'
                              : isDarkMode 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * index }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-3 transition-colors duration-300 ${isDarkMode ? 'text-white' : ''}`}>Urutkan</h4>
                  <div className="space-y-2">
                    {['Harga Terendah', 'Harga Tertinggi', 'Rating Tertinggi', 'Paling Banyak Dibeli'].map((sort, index) => (
                      <motion.button
                        key={sort}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {sort}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}
                >
                  Reset Filter
                </Button>
              </motion.div>
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

      {/* Product Detail Modal - Using ProductModalUltra */}
      <ProductModalUltra
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Promo Modal */}
      <Dialog open={showPromoModal} onOpenChange={setShowPromoModal}>
        <DialogContent className={`max-w-md transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={`transition-colors duration-300 ${isDarkMode ? 'text-white' : ''}`}>
              {currentPromo?.label}
            </DialogTitle>
          </DialogHeader>
          <motion.div 
            className="mt-4 space-y-3"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {currentPromo && getPromoProducts(currentPromo.type).map((product) => (
              <motion.div
                key={product.id}
                onClick={() => {
                  handleProductClick(product);
                  setShowPromoModal(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                variants={itemVariants}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <motion.img 
                  src={product.icon} 
                  alt={product.title} 
                  className="w-12 h-12 object-cover rounded-lg"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
                <div className="flex-1">
                  <p className={`font-medium text-sm transition-colors duration-300 ${isDarkMode ? 'text-white' : ''}`}>{product.title}</p>
                  <p className="text-xs text-blue-600">
                    Rp {(product.discount_price || product.base_price).toLocaleString('id-ID')}
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </motion.div>
            ))}
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: 'Layanan Digital Profesional',
      subtitle: 'Solusi lengkap untuk kebutuhan teknologi Anda',
      gradient: 'from-blue-600 via-blue-500 to-cyan-400',
      icon: Zap,
    },
    {
      title: 'Instalasi Wi-Fi & CCTV',
      subtitle: 'Jaringan aman dan terpercaya untuk rumah & kantor',
      gradient: 'from-orange-500 via-orange-400 to-yellow-400',
      icon: Shield,
    },
    {
      title: 'Editing Kreatif',
      subtitle: 'Photo & video editing profesional',
      gradient: 'from-purple-600 via-purple-500 to-pink-400',
      icon: Palette,
    },
    {
      title: 'Support Teknis 24/7',
      subtitle: 'Tim ahli siap membantu kapan saja',
      gradient: 'from-green-600 via-green-500 to-emerald-400',
      icon: Headphones,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-48 overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          if (currentSlide !== index) return null;
          return (
            <motion.div
              key={index}
              className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r px-6 ${slide.gradient}`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            >
              <div className="text-center text-white">
                <motion.div 
                  className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <Icon className="h-8 w-8" />
                </motion.div>
                <motion.h2 
                  className="text-xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {slide.title}
                </motion.h2>
                <motion.p 
                  className="text-white/80 mt-2 text-sm"
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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
      className={`rounded-xl shadow-sm overflow-hidden cursor-pointer transition-shadow duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
      variants={itemVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      layout
    >
      <motion.div 
        className="relative aspect-square"
        variants={cardHoverVariants}
      >
        <motion.img
          src={product.icon}
          alt={product.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
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
