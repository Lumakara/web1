import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';
import type { Product, Tier } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Star,
  ShoppingCart,
  Check,
  Clock,
  Package,
  Shield,
  Zap,
  Sparkles,
  TrendingUp,
  Users,
  ThumbsUp,
  MessageCircle,
  Heart,
  Share2,
  Minus,
  Plus,
  Award,
  Crown,
  Gem,
} from 'lucide-react';

interface ProductModalUltraProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, tier: string) => void;
}

// Mock reviews data generator
const generateMockReviews = (productId: string) => [
  {
    id: '1',
    productId,
    userId: 'user1',
    userName: 'Ahmad Rizki',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    rating: 5,
    comment: 'Layanan sangat memuaskan! Tim profesional dan hasil kerja berkualitas tinggi. Sangat recommended!',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    productId,
    userId: 'user2',
    userName: 'Siti Nurhaliza',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    rating: 4,
    comment: 'Bagus sekali, pengerjaan cepat dan rapi. Hanya saja komunikasi agak lambat di awal.',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    productId,
    userId: 'user3',
    userName: 'Budi Santoso',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    rating: 5,
    comment: 'Sudah 3x order di sini dan selalu puas. Harga terjangkau dengan kualitas premium.',
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    productId,
    userId: 'user4',
    userName: 'Dewi Kusuma',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    rating: 5,
    comment: 'Support team sangat helpful dan responsif. Solusi diberikan dengan cepat.',
    createdAt: '2023-12-28',
  },
  {
    id: '5',
    productId,
    userUser: 'user5',
    userName: 'Rudi Hartono',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rudi',
    rating: 4,
    comment: 'Overall bagus, sesuai ekspektasi. Akan order lagi di lain waktu.',
    createdAt: '2023-12-20',
  },
];

// Feature icons mapping
const featureIcons: Record<string, React.ReactNode> = {
  'router': <Zap className="w-4 h-4" />,
  'network': <Zap className="w-4 h-4" />,
  'wifi': <Zap className="w-4 h-4" />,
  'mesh': <Zap className="w-4 h-4" />,
  'kamera': <Shield className="w-4 h-4" />,
  'security': <Shield className="w-4 h-4" />,
  'cctv': <Shield className="w-4 h-4" />,
  'monitoring': <Shield className="w-4 h-4" />,
  'garansi': <Award className="w-4 h-4" />,
  'support': <Users className="w-4 h-4" />,
  'backup': <Package className="w-4 h-4" />,
  'cloud': <Package className="w-4 h-4" />,
  'storage': <Package className="w-4 h-4" />,
  'detection': <Sparkles className="w-4 h-4" />,
  'optimasi': <TrendingUp className="w-4 h-4" />,
  'speed': <TrendingUp className="w-4 h-4" />,
  'cpu': <Zap className="w-4 h-4" />,
  'ram': <Zap className="w-4 h-4" />,
  'bandwidth': <TrendingUp className="w-4 h-4" />,
};

const getFeatureIcon = (feature: string): React.ReactNode => {
  const lowerFeature = feature.toLowerCase();
  for (const [key, icon] of Object.entries(featureIcons)) {
    if (lowerFeature.includes(key)) return icon;
  }
  return <Check className="w-4 h-4" />;
};

// Tier badge icons
const tierIcons: Record<string, React.ReactNode> = {
  'Basic': <Package className="w-5 h-5" />,
  'Standard': <Award className="w-5 h-5" />,
  'Premium': <Crown className="w-5 h-5" />,
};

const tierGradients: Record<string, string> = {
  'Basic': 'from-slate-500 to-slate-600',
  'Standard': 'from-blue-500 to-blue-600',
  'Premium': 'from-amber-500 to-amber-600',
};

// Animated number component
const AnimatedPrice: React.FC<{ price: number; isDarkMode: boolean }> = ({ price, isDarkMode }) => {
  const [displayPrice, setDisplayPrice] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const duration = 600;
    const start = 0;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayPrice(Math.floor(start + (price - start) * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [price]);

  return (
    <span
      className={cn(
        'text-3xl font-bold tabular-nums transition-all duration-300',
        isDarkMode ? 'text-white' : 'text-gray-900',
        isAnimating && 'scale-110 text-primary'
      )}
    >
      Rp{displayPrice.toLocaleString('id-ID')}
    </span>
  );
};

// Star rating component
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
  rating, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </div>
  );
};



export const ProductModalUltra: React.FC<ProductModalUltraProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const { isDarkMode, soundEnabled, getProductById } = useAppStore();
  const [activeTab, setActiveTab] = useState('detail');
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Initialize data when product changes
  useEffect(() => {
    if (product) {
      setSelectedTier(product.tiers[0] || null);
      setCurrentImageIndex(0);
      setQuantity(1);
      setActiveTab('detail');
      setReviews(generateMockReviews(product.id));
      
      // Get related products
      const related = product.related
        .map((id) => getProductById(id))
        .filter((p): p is Product => p !== undefined);
      setRelatedProducts(related);
    }
  }, [product, getProductById]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    audioService.playTab(soundEnabled);
    setActiveTab(tab);
  };

  // Handle tier selection
  const handleTierSelect = (tier: Tier) => {
    audioService.playClick(soundEnabled);
    setSelectedTier(tier);
  };

  // Handle image navigation
  const handleImageNav = (direction: 'prev' | 'next') => {
    audioService.playSwipe(soundEnabled);
    if (!product) return;
    const images = [product.image, product.icon];
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || !selectedTier) return;
    
    audioService.playSuccess(soundEnabled);
    setIsAddingToCart(true);
    
    // Simulate add to cart animation
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    onAddToCart(product, selectedTier.name);
    setIsAddingToCart(false);
  };

  // Handle like toggle
  const handleLikeToggle = () => {
    audioService.playPop(soundEnabled);
    setIsLiked(!isLiked);
  };

  // Handle share
  const handleShare = () => {
    audioService.playClick(soundEnabled);
    if (navigator.share && product) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    }
  };

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    audioService.playTick(soundEnabled);
    setQuantity((prev) => Math.max(1, Math.min(prev + change, product?.stock || 99)));
  };

  if (!product) return null;

  const images = [product.image, product.icon];
  const discountPercent = product.discount_price
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-5xl w-[95vw] p-0 overflow-hidden border-0 gap-0',
          'transition-all duration-500 ease-out',
          isDarkMode
            ? 'bg-gray-900/95 backdrop-blur-xl'
            : 'bg-white/95 backdrop-blur-xl'
        )}
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(17,24,39,0.98) 0%, rgba(31,41,55,0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,0.95) 100%)',
        }}
      >
        {/* Header with product title and actions */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn(
                    'capitalize text-xs font-medium',
                    isDarkMode
                      ? 'bg-primary/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  {product.category}
                </Badge>
                {discountPercent > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-xs animate-pulse"
                  >
                    -{discountPercent}%
                  </Badge>
                )}
              </div>
              <DialogTitle
                className={cn(
                  'text-2xl sm:text-3xl font-bold mt-2 leading-tight',
                  isDarkMode ? 'text-white' : 'text-gray-900'
                )}
              >
                {product.title}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <StarRating rating={product.rating} />
                <span
                  className={cn(
                    'text-sm',
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  {product.rating} ({product.reviews} ulasan)
                </span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span
                    className={cn(
                      'text-sm',
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    {product.duration}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLikeToggle}
                className={cn(
                  'rounded-full transition-all duration-300',
                  isLiked && 'text-red-500 bg-red-50 dark:bg-red-950/30'
                )}
              >
                <Heart
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isLiked && 'fill-current scale-110'
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-full"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Custom Tabs */}
        <div className="relative mt-4 px-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList
              className={cn(
                'w-full grid grid-cols-3 p-1 rounded-xl relative',
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'
              )}
            >
              <TabsTrigger
                value="detail"
                className={cn(
                  'relative z-10 rounded-lg transition-all duration-300',
                  'data-[state=active]:shadow-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700',
                  activeTab === 'detail' && 'font-semibold'
                )}
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Detail</span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="paket"
                className={cn(
                  'relative z-10 rounded-lg transition-all duration-300',
                  'data-[state=active]:shadow-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700',
                  activeTab === 'paket' && 'font-semibold'
                )}
              >
                <span className="flex items-center gap-2">
                  <Gem className="w-4 h-4" />
                  <span className="hidden sm:inline">Paket</span>
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="ulasan"
                className={cn(
                  'relative z-10 rounded-lg transition-all duration-300',
                  'data-[state=active]:shadow-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700',
                  activeTab === 'ulasan' && 'font-semibold'
                )}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Ulasan</span>
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content with smooth transitions */}
            <div
              ref={tabContentRef}
              className="mt-4 min-h-[400px] relative overflow-hidden"
            >
              {/* Detail Tab */}
              <TabsContent
                value="detail"
                className={cn(
                  'mt-0 transition-all duration-500 ease-out',
                  activeTab === 'detail'
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-[-20px] absolute inset-0 pointer-events-none'
                )}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image Gallery */}
                  <div className="space-y-3">
                    <div
                      className={cn(
                        'relative aspect-video rounded-2xl overflow-hidden group cursor-zoom-in',
                        'ring-1 ring-gray-200 dark:ring-gray-700',
                        isZoomed && 'cursor-zoom-out'
                      )}
                      onClick={() => setIsZoomed(!isZoomed)}
                    >
                      <img
                        src={images[currentImageIndex]}
                        alt={product.title}
                        className={cn(
                          'w-full h-full object-cover transition-transform duration-700',
                          isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Zoom indicator */}
                      <div className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>

                      {/* Image navigation */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageNav('prev');
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageNav('next');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Image indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(idx);
                            }}
                            className={cn(
                              'w-2 h-2 rounded-full transition-all duration-300',
                              currentImageIndex === idx
                                ? 'w-6 bg-white'
                                : 'bg-white/50 hover:bg-white/80'
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Thumbnail images */}
                    <div className="flex gap-2">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            'relative w-20 h-14 rounded-lg overflow-hidden transition-all duration-300',
                            'ring-2',
                            currentImageIndex === idx
                              ? 'ring-primary'
                              : 'ring-transparent hover:ring-gray-300'
                          )}
                        >
                          <img
                            src={img}
                            alt={`${product.title} ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <DialogDescription
                      className={cn(
                        'text-base leading-relaxed',
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      )}
                    >
                      {product.description}
                    </DialogDescription>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn(
                            'text-xs capitalize transition-all duration-300 hover:scale-105',
                            isDarkMode
                              ? 'border-gray-700 text-gray-400 hover:border-primary'
                              : 'border-gray-300 text-gray-600 hover:border-primary'
                          )}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stock indicator */}
                    <div
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl',
                        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                      )}
                    >
                      <div
                        className={cn(
                          'w-2.5 h-2.5 rounded-full animate-pulse',
                          product.stock > 50
                            ? 'bg-green-500'
                            : product.stock > 10
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        )}
                      >
                        {product.stock > 50
                          ? 'Stok tersedia'
                          : product.stock > 10
                          ? `Stok terbatas (${product.stock})`
                          : `Stok hampir habis (${product.stock})`}
                      </span>
                    </div>

                    {/* Quick tier preview */}
                    <div className="space-y-2">
                      <h4
                        className={cn(
                          'font-semibold text-sm',
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        )}
                      >
                        Paket Tersedia
                      </h4>
                      <div className="flex gap-2">
                        {product.tiers.map((tier) => (
                          <div
                            key={tier.name}
                            onClick={() => handleTierSelect(tier)}
                            className={cn(
                              'flex-1 p-3 rounded-xl cursor-pointer transition-all duration-300',
                              'border-2 text-center',
                              selectedTier?.name === tier.name
                                ? 'border-primary bg-primary/5'
                                : isDarkMode
                                ? 'border-gray-700 hover:border-gray-600'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div
                              className={cn(
                                'text-xs font-medium mb-1',
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              )}
                            >
                              {tier.name}
                            </div>
                            <div
                              className={cn(
                                'text-sm font-bold',
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              )}
                            >
                              Rp{tier.price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Paket Tab */}
              <TabsContent
                value="paket"
                className={cn(
                  'mt-0 transition-all duration-500 ease-out',
                  activeTab === 'paket'
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-[20px] absolute inset-0 pointer-events-none'
                )}
              >
                <ScrollArea className="h-[450px] pr-4">
                  <div className="space-y-4">
                    {product.tiers.map((tier, index) => (
                      <div
                        key={tier.name}
                        onClick={() => handleTierSelect(tier)}
                        className={cn(
                          'relative p-5 rounded-2xl cursor-pointer transition-all duration-500',
                          'border-2 overflow-hidden group',
                          selectedTier?.name === tier.name
                            ? 'border-primary shadow-lg shadow-primary/20'
                            : isDarkMode
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300',
                          'hover:shadow-xl hover:scale-[1.02]'
                        )}
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        {/* Selected indicator */}
                        {selectedTier?.name === tier.name && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Tier badge */}
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={cn(
                              'p-2.5 rounded-xl bg-gradient-to-br',
                              tierGradients[tier.name] || 'from-gray-500 to-gray-600'
                            )}
                          >
                            {tierIcons[tier.name] || <Package className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <h3
                              className={cn(
                                'font-bold text-lg',
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              )}
                            >
                              Paket {tier.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <AnimatedPrice
                                price={tier.price}
                                isDarkMode={isDarkMode}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Features list */}
                        <ul className="space-y-2.5">
                          {tier.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className={cn(
                                'flex items-center gap-3 text-sm',
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex items-center justify-center w-5 h-5 rounded-full',
                                  isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                                )}
                              >
                                <Check className="w-3 h-3 text-green-500" />
                              </span>
                              <span className="flex items-center gap-2">
                                {getFeatureIcon(feature)}
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Hover gradient effect */}
                        <div
                          className={cn(
                            'absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Ulasan Tab */}
              <TabsContent
                value="ulasan"
                className={cn(
                  'mt-0 transition-all duration-500 ease-out',
                  activeTab === 'ulasan'
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-[20px] absolute inset-0 pointer-events-none'
                )}
              >
                <ScrollArea className="h-[450px] pr-4">
                  <div className="space-y-4">
                    {/* Rating summary */}
                    <div
                      className={cn(
                        'p-5 rounded-2xl',
                        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div
                            className={cn(
                              'text-5xl font-bold',
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            )}
                          >
                            {product.rating}
                          </div>
                          <StarRating rating={product.rating} size="lg" />
                          <div
                            className={cn(
                              'text-sm mt-1',
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            )}
                          >
                            {product.reviews} ulasan
                          </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const percentage =
                              star === 5
                                ? 70
                                : star === 4
                                ? 20
                                : star === 3
                                ? 7
                                : star === 2
                                ? 2
                                : 1;
                            return (
                              <div key={star} className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'text-xs w-3',
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  )}
                                >
                                  {star}
                                </span>
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <div
                                  className={cn(
                                    'flex-1 h-1.5 rounded-full overflow-hidden',
                                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                                  )}
                                >
                                  <div
                                    className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    'text-xs w-8 text-right',
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  )}
                                >
                                  {percentage}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Reviews list */}
                    <div className="space-y-3">
                      {reviews.map((review, index) => (
                        <div
                          key={review.id}
                          className={cn(
                            'p-4 rounded-xl transition-all duration-300',
                            'border',
                            isDarkMode
                              ? 'border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          )}
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={review.userAvatar}
                              alt={review.userName}
                              className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4
                                  className={cn(
                                    'font-semibold text-sm truncate',
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  )}
                                >
                                  {review.userName}
                                </h4>
                                <span
                                  className={cn(
                                    'text-xs shrink-0',
                                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                  )}
                                >
                                  {new Date(review.createdAt).toLocaleDateString(
                                    'id-ID',
                                    { year: 'numeric', month: 'short', day: 'numeric' }
                                  )}
                                </span>
                              </div>
                              <StarRating rating={review.rating} size="sm" />
                              <p
                                className={cn(
                                  'text-sm mt-2 leading-relaxed',
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                )}
                              >
                                {review.comment}
                              </p>
                              <div className="flex items-center gap-4 mt-3">
                                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors">
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>Membantu</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="px-6 mt-4">
            <h4
              className={cn(
                'text-sm font-semibold mb-3',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Produk Terkait
            </h4>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {relatedProducts.map((related) => (
                <button
                  key={related.id}
                  onClick={() => {
                    audioService.playClick(soundEnabled);
                    // Navigate to related product would happen here
                  }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl min-w-[200px] transition-all duration-300',
                    'border hover:shadow-md hover:scale-[1.02]',
                    isDarkMode
                      ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  )}
                >
                  <img
                    src={related.icon}
                    alt={related.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="text-left">
                    <div
                      className={cn(
                        'text-sm font-medium line-clamp-1',
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      )}
                    >
                      {related.title}
                    </div>
                    <div className="text-xs text-primary font-semibold">
                      Rp{related.base_price.toLocaleString('id-ID')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer with Add to Cart */}
        <div
          className={cn(
            'p-6 mt-4 border-t',
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          )}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Price display */}
            <div className="flex-1">
              <div
                className={cn(
                  'text-sm',
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                Total Harga
              </div>
              <div className="flex items-baseline gap-2">
                {selectedTier && (
                  <AnimatedPrice
                    price={selectedTier.price * quantity}
                    isDarkMode={isDarkMode}
                  />
                )}
                {product.discount_price && (
                  <span
                    className={cn(
                      'text-sm line-through',
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    )}
                  >
                    Rp{(product.base_price * quantity).toLocaleString('id-ID')}
                  </span>
                )}
              </div>
              {selectedTier && (
                <div
                  className={cn(
                    'text-xs mt-0.5',
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  )}
                >
                  {selectedTier.name} × {quantity}
                </div>
              )}
            </div>

            {/* Quantity selector */}
            <div
              className={cn(
                'flex items-center gap-3 p-1.5 rounded-xl',
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-8 w-8 rounded-lg"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span
                className={cn(
                  'w-8 text-center font-semibold',
                  isDarkMode ? 'text-white' : 'text-gray-900'
                )}
              >
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="h-8 w-8 rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Add to Cart button */}
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !selectedTier}
              className={cn(
                'relative overflow-hidden h-12 px-8 rounded-xl font-semibold',
                'bg-gradient-to-r from-primary to-primary/80',
                'hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]',
                'transition-all duration-300',
                isAddingToCart && 'cursor-not-allowed'
              )}
            >
              <span
                className={cn(
                  'flex items-center gap-2 transition-all duration-300',
                  isAddingToCart && 'opacity-0 translate-y-[-20px]'
                )}
              >
                <ShoppingCart className="w-5 h-5" />
                Tambah ke Keranjang
              </span>
              
              {/* Loading spinner */}
              {isAddingToCart && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
              )}

              {/* Success checkmark */}
              {isAddingToCart && (
                <span
                  className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    'transition-all duration-300',
                    !isAddingToCart && 'opacity-0 scale-50'
                  )}
                >
                  <Check className="w-6 h-6 animate-scale-in" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Dialog>
  );
};

export default ProductModalUltra;
