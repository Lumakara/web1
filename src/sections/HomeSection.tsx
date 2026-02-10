import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Star, Clock, ShoppingCart, Check, ChevronLeft, ChevronRight, Sparkles, Zap, Headphones, Palette, Code, Wrench, Video, Globe, Cpu, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useProducts } from '@/hooks/useProducts';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';
import type { Product } from '@/lib/supabase';

// 8 Categories with icons
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

export function HomeSection() {
  const { products, isLoading } = useProducts();
  const { addToCart, cart, addRecentlyViewed, isDarkMode } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [currentPromo, setCurrentPromo] = useState<typeof promoTypes[0] | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

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
    setSelectedTier(product.tiers[0]?.name || '');
    setShowProductDialog(true);
    addRecentlyViewed(product.id);
  };

  const handleAddToCart = () => {
    if (selectedProduct && selectedTier) {
      addToCart(selectedProduct, selectedTier);
      audioService.playSuccess();
      setAddedToCart(`${selectedProduct.id}-${selectedTier}`);
      setTimeout(() => setAddedToCart(null), 2000);
    }
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

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`pb-20 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Promo Badges */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {promoTypes.map((promo) => (
            <button
              key={promo.type}
              onClick={() => handlePromoClick(promo)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${promo.color} shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95`}
            >
              {promo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className={`sticky top-[60px] z-30 px-4 py-3 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm shadow-sm`}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari layanan..."
              className={`pl-9 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => audioService.playClick()}
                className={isDarkMode ? 'border-gray-700 bg-gray-800' : ''}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className={`h-[70vh] ${isDarkMode ? 'bg-gray-900' : ''}`}>
              <SheetHeader>
                <SheetTitle className={isDarkMode ? 'text-white' : ''}>Filter Layanan</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : ''}`}>Kategori</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            handleCategoryClick(cat.id);
                            audioService.playClick();
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                            selectedCategory === cat.id
                              ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg'
                              : isDarkMode 
                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : ''}`}>Urutkan</h4>
                  <div className="space-y-2">
                    {['Harga Terendah', 'Harga Tertinggi', 'Rating Tertinggi', 'Paling Banyak Dibeli'].map((sort) => (
                      <button
                        key={sort}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {sort}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Pills - Swipeable */}
        <div className="relative mt-3">
          <button
            onClick={() => scrollCategories('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div 
            ref={categoryScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-10 py-1"
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg scale-105'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => scrollCategories('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white/90 shadow-lg rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`rounded-xl h-64 animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Search className={`h-8 w-8 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Tidak ada layanan yang ditemukan</p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product)}
                isInCart={isInCart(product.id, product.tiers[0]?.name || '')}
                cartQuantity={getCartQuantity(product.id, product.tiers[0]?.name || '')}
                style={{ animationDelay: `${index * 0.05}s` }}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className={`max-w-lg max-h-[90vh] overflow-auto ${isDarkMode ? 'bg-gray-900 border-gray-700' : ''}`}>
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className={isDarkMode ? 'text-white' : ''}>{selectedProduct.title}</DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-medium">{selectedProduct.rating}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedProduct.reviews} ulasan</span>
                  <span className="text-gray-400">•</span>
                  <div className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="h-4 w-4" />
                    <span className="ml-1 text-sm">{selectedProduct.duration}</span>
                  </div>
                </div>

                <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedProduct.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {selectedProduct.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Tier Selection - Scrollable for many options */}
                <div className="mt-4">
                  <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : ''}`}>Pilih Paket ({selectedProduct.tiers.length} pilihan)</h4>
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {selectedProduct.tiers.map((tier) => (
                        <button
                          key={tier.name}
                          onClick={() => {
                            setSelectedTier(tier.name);
                            audioService.playClick();
                          }}
                          className={`flex-shrink-0 p-3 rounded-lg border-2 text-left transition-all min-w-[140px] max-w-[180px] ${
                            selectedTier === tier.name
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : isDarkMode
                                ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : ''}`}>{tier.name}</span>
                            <span className="text-blue-600 font-bold text-sm">
                              Rp {tier.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {tier.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className={`text-xs flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Check className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                                <span className="truncate">{feature}</span>
                              </li>
                            ))}
                            {tier.features.length > 3 && (
                              <li className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                +{tier.features.length - 3} fitur lainnya
                              </li>
                            )}
                          </ul>
                        </button>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>

                {/* Selected Tier Features Detail */}
                {selectedTier && (
                  <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h5 className={`font-medium text-sm mb-2 ${isDarkMode ? 'text-white' : ''}`}>
                      Fitur {selectedTier}:
                    </h5>
                    <ul className="space-y-1">
                      {selectedProduct.tiers.find(t => t.name === selectedTier)?.features.map((feature, idx) => (
                        <li key={idx} className={`text-xs flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Add to Cart */}
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  onClick={handleAddToCart}
                  disabled={addedToCart === `${selectedProduct.id}-${selectedTier}` || !selectedTier}
                >
                  {addedToCart === `${selectedProduct.id}-${selectedTier}` ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Ditambahkan
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Tambah ke Keranjang
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Promo Modal */}
      <Dialog open={showPromoModal} onOpenChange={setShowPromoModal}>
        <DialogContent className={`max-w-md ${isDarkMode ? 'bg-gray-900 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-white' : ''}>
              {currentPromo?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            {currentPromo && getPromoProducts(currentPromo.type).map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  handleProductClick(product);
                  setShowPromoModal(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <img src={product.icon} alt={product.title} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : ''}`}>{product.title}</p>
                  <p className="text-xs text-blue-600">
                    Rp {(product.discount_price || product.base_price).toLocaleString('id-ID')}
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
      {slides.map((slide, index) => {
        const Icon = slide.icon;
        return (
          <div
            key={index}
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r px-6 transition-all duration-700 ${
              slide.gradient
            } ${currentSlide === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
          >
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold">{slide.title}</h2>
              <p className="text-white/80 mt-2 text-sm">{slide.subtitle}</p>
            </div>
          </div>
        );
      })}

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index ? 'bg-white w-6' : 'bg-white/50 w-2'
            }`}
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
  style?: React.CSSProperties;
  isDarkMode: boolean;
}

function ProductCard({ product, onClick, isInCart, cartQuantity, style, isDarkMode }: ProductCardProps) {
  const price = product.discount_price || product.base_price;
  const hasDiscount = product.discount_price && product.discount_price < product.base_price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.base_price - (product.discount_price || 0)) / product.base_price) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] animate-fade-in ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
      style={style}
    >
      <div className="relative aspect-square">
        <img
          src={product.icon}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{discountPercent}%
          </Badge>
        )}
        {isInCart && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce">
            {cartQuantity}
          </div>
        )}
        {product.stock < 20 && (
          <Badge className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs">
            Stok Terbatas
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h3 className={`font-medium text-sm line-clamp-1 ${isDarkMode ? 'text-white' : ''}`}>{product.title}</h3>
        <p className={`text-xs line-clamp-2 mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-blue-600 font-bold text-sm">
              Rp {price.toLocaleString('id-ID')}
            </span>
            {hasDiscount && (
              <span className={`text-xs line-through ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Rp {product.base_price.toLocaleString('id-ID')}
              </span>
            )}
          </div>
          <div className="flex items-center text-yellow-500 text-xs">
            <Star className="h-3 w-3 fill-current" />
            <span className="ml-0.5">{product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
