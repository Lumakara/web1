import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingCart,
  Check,
  Clock,
  Package,
  Award,
  Crown,
  Gem,
  Minus,
  Plus,
  ArrowLeft,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { useProducts } from '@/hooks/useProducts';
import type { Product, Tier } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { audioService } from '@/lib/audio';

// ============================================================================
// Types & Interfaces
// ============================================================================
interface ProductDetailSectionProps {}

interface Review {
  id: string;
  user: string;
  avatar?: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
}

// ============================================================================
// Tier Configuration
// ============================================================================
const tierIcons: Record<string, React.ReactNode> = {
  Basic: <Package className="w-5 h-5" />,
  Standard: <Award className="w-5 h-5" />,
  Premium: <Crown className="w-5 h-5" />,
};

const tierGradients: Record<string, string> = {
  Basic: 'from-slate-500 to-slate-600',
  Standard: 'from-blue-500 to-blue-600',
  Premium: 'from-amber-500 to-orange-500',
};

const tierStyles: Record<string, { bg: string; border: string; badge: string; ring: string }> = {
  Basic: {
    bg: 'bg-slate-50 dark:bg-slate-900/30',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    ring: 'ring-slate-400',
  },
  Standard: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    ring: 'ring-blue-400',
  },
  Premium: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    ring: 'ring-amber-400',
  },
};

// ============================================================================
// Star Rating Component
// ============================================================================
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onRate?: (rating: number) => void }> = ({ 
  rating, 
  size = 'md', 
  interactive = false,
  onRate 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={interactive ? { scale: 1.2 } : {}}
          whileTap={interactive ? { scale: 0.9 } : {}}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          disabled={!interactive}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors duration-200',
              star <= (hoverRating || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
            )}
          />
        </motion.button>
      ))}
    </div>
  );
};

// ============================================================================
// Price Display Component
// ============================================================================
const PriceDisplay: React.FC<{ 
  price: number; 
  originalPrice?: number; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showDiscount?: boolean;
}> = ({ price, originalPrice, size = 'md', className, showDiscount = true }) => {
  const sizes = {
    sm: { price: 'text-lg', original: 'text-sm', discount: 'text-xs' },
    md: { price: 'text-xl', original: 'text-base', discount: 'text-sm' },
    lg: { price: 'text-3xl', original: 'text-lg', discount: 'text-base' },
    xl: { price: 'text-4xl md:text-5xl', original: 'text-xl', discount: 'text-lg' },
  };

  const discountPercent = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span className={cn('font-bold text-primary tabular-nums', sizes[size].price)}>
        Rp {price.toLocaleString('id-ID')}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className={cn('text-gray-400 line-through tabular-nums', sizes[size].original)}>
            Rp {originalPrice.toLocaleString('id-ID')}
          </span>
          {showDiscount && discountPercent > 0 && (
            <Badge variant="destructive" className={cn('font-semibold', sizes[size].discount)}>
              -{discountPercent}%
            </Badge>
          )}
        </>
      )}
    </div>
  );
};

// ============================================================================
// Trust Badges Component
// ============================================================================
const TrustBadges: React.FC = () => {
  const badges = [
    { icon: Shield, label: 'Garansi 100%', sublabel: 'Uang Kembali' },
    { icon: Truck, label: 'Pengerjaan Cepat', sublabel: 'Sesuai Jadwal' },
    { icon: RotateCcw, label: 'Revisi Gratis', sublabel: 'Sesuai Paket' },
    { icon: CheckCircle2, label: 'Terpercaya', sublabel: '1000+ Pelanggan' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <badge.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{badge.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{badge.sublabel}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// Product Gallery Component
// ============================================================================
const ProductGallery: React.FC<{ product: Product; isDarkMode: boolean }> = ({ product, isDarkMode }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Generate additional images from related products or use the main image
  const images = useMemo(() => {
    const baseImages = [product.image];
    // Add variation images if available
    if (product.tiers?.length > 0) {
      return baseImages;
    }
    return baseImages;
  }, [product]);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <motion.div 
        className={cn(
          "relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden cursor-zoom-in",
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        )}
        onClick={() => setIsZoomed(!isZoomed)}
        layout
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedImage}
            src={images[selectedImage]}
            alt={product.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        
        {/* Discount Badge */}
        {product.discount_price && product.discount_price < product.base_price && (
          <motion.div 
            className="absolute top-4 left-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Badge className="bg-red-500 text-white border-0 shadow-lg px-3 py-1 text-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Diskon {Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)}%
            </Badge>
          </motion.div>
        )}

        {/* Stock Badge */}
        <div className="absolute bottom-4 left-4">
          <Badge 
            variant="secondary"
            className={cn(
              'shadow-lg backdrop-blur-sm',
              product.stock > 50
                ? 'bg-green-100/90 text-green-700 dark:bg-green-900/60 dark:text-green-300'
                : product.stock > 10
                ? 'bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300'
                : 'bg-red-100/90 text-red-700 dark:bg-red-900/60 dark:text-red-300'
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className={cn(
                'w-2 h-2 rounded-full animate-pulse',
                product.stock > 50 ? 'bg-green-500' : product.stock > 10 ? 'bg-yellow-500' : 'bg-red-500'
              )} />
              {product.stock > 50 ? 'Stok Tersedia' : product.stock > 10 ? `Stok: ${product.stock}` : 'Stok Terbatas'}
            </div>
          </Badge>
        </div>

        {/* Zoom Hint */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
          Klik untuk {isZoomed ? 'kecilkan' : 'perbesar'}
        </div>
      </motion.div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center">
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                'relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                selectedImage === idx
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={img} alt={`${product.title} - ${idx + 1}`} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Tier Selection Component
// ============================================================================
const TierSelection: React.FC<{
  tiers: Tier[];
  selectedTier: Tier | null;
  onSelect: (tier: Tier) => void;
  isDarkMode: boolean;
}> = ({ tiers, selectedTier, onSelect, isDarkMode }) => {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={cn('font-semibold text-lg', isDarkMode ? 'text-gray-200' : 'text-gray-800')}>
          Pilih Paket
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Gem className="w-4 h-4 text-primary" />
          <span>{tiers.length} pilihan tersedia</span>
        </div>
      </div>

      <div className="space-y-3">
        {tiers.map((tier, index) => {
          const isSelected = selectedTier?.name === tier.name;
          const isExpanded = expandedTier === tier.name;
          const styles = tierStyles[tier.name] || tierStyles.Basic;
          const Icon = tierIcons[tier.name];

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => onSelect(tier)}
                className={cn(
                  'w-full text-left rounded-xl border-2 transition-all duration-300 overflow-hidden',
                  isSelected
                    ? `border-primary bg-primary/5 dark:bg-primary/10 ring-2 ${styles.ring} ring-offset-2 ring-offset-background`
                    : cn(styles.bg, styles.border, 'hover:border-gray-300 dark:hover:border-gray-600')
                )}
              >
                {/* Tier Header */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Radio Button */}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>

                    {/* Tier Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn('font-bold text-lg', isDarkMode ? 'text-white' : 'text-gray-900')}>
                          {tier.name}
                        </span>
                        {Icon && (
                          <span className={cn('p-1.5 rounded-lg', styles.badge)}>
                            {Icon}
                          </span>
                        )}
                        {index === 1 && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                            <Zap className="w-3 h-3 mr-1" />
                            Terpopuler
                          </Badge>
                        )}
                      </div>

                      <PriceDisplay
                        price={tier.price}
                        size="md"
                        className="mt-1"
                      />

                      {/* Short Description */}
                      <p className={cn('text-sm mt-2 line-clamp-2', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                        {`Paket ${tier.name} dengan ${tier.features.length} fitur unggulan`}
                      </p>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedTier(isExpanded ? null : tier.name);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Features */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-4 pt-3">
                        <p className={cn('text-sm font-medium mb-3', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                          Fitur yang didapat:
                        </p>
                        <ul className="space-y-2">
                          {tier.features.map((feature, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={cn(
                                'flex items-start gap-2 text-sm',
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              )}
                            >
                              <span className="text-green-500 shrink-0 mt-0.5">
                                <Check className="w-4 h-4" />
                              </span>
                              <span>{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Features Preview (when not expanded) */}
                {!isExpanded && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {tier.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            'text-xs px-2 py-1 rounded-full flex items-center gap-1',
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          <Check className="w-3 h-3 text-green-500" />
                          {feature.length > 20 ? feature.substring(0, 20) + '...' : feature}
                        </span>
                      ))}
                      {tier.features.length > 3 && (
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full',
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        )}>
                          +{tier.features.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// Reviews Component
// ============================================================================
const ReviewsSection: React.FC<{ product: Product; isDarkMode: boolean }> = ({ product, isDarkMode }) => {
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Mock reviews data - in real app, this would come from API
  const reviews: Review[] = [
    {
      id: '1',
      user: 'Ahmad R.',
      rating: 5,
      date: '2026-02-10',
      content: 'Layanan sangat memuaskan! Proses cepat dan hasil berkualitas. Tim support juga sangat responsif.',
      verified: true,
    },
    {
      id: '2',
      user: 'Maya S.',
      rating: 4,
      date: '2026-02-08',
      content: 'Bagus, sesuai ekspektasi. Hanya saja pengerjaan sedikit lebih lama dari estimasi.',
      verified: true,
    },
    {
      id: '3',
      user: 'Budi K.',
      rating: 5,
      date: '2026-02-05',
      content: 'Recommended! Sudah 3x order dan selalu puas dengan hasilnya.',
      verified: true,
    },
  ];

  const filteredReviews = reviews
    .filter(r => !filterRating || r.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'highest') return b.rating - a.rating;
      return a.rating - b.rating;
    });

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
  }));

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={cn(
          'p-6 rounded-2xl',
          isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
        )}>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white">{product.rating}</div>
              <div className="flex justify-center mt-2">
                <StarRating rating={product.rating} />
              </div>
              <div className="text-sm text-gray-500 mt-1">{product.reviews} ulasan</div>
            </div>
            <div className="flex-1 space-y-1">
              {ratingCounts.map(({ rating, count }) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className="w-full flex items-center gap-2 group"
                >
                  <span className="text-sm font-medium w-3">{rating}</span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / reviews.length) * 100}%` }}
                      className="h-full bg-amber-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h4 className={cn('font-semibold mb-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
            Bagikan Pengalaman Anda
          </h4>
          <p className={cn('text-sm mb-4', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
            Berikan ulasan untuk membantu pelanggan lain menemukan layanan terbaik.
          </p>
          <Button variant="outline" className="w-full sm:w-auto">
            <MessageCircle className="w-4 h-4 mr-2" />
            Tulis Ulasan
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Urutkan:</span>
          <div className="flex gap-1">
            {(['newest', 'highest', 'lowest'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-full transition-colors',
                  sortBy === sort
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                {sort === 'newest' ? 'Terbaru' : sort === 'highest' ? 'Rating Tertinggi' : 'Rating Terendah'}
              </button>
            ))}
          </div>
        </div>
        {filterRating && (
          <Badge 
            variant="secondary"
            className="cursor-pointer"
            onClick={() => setFilterRating(null)}
          >
            Filter: {filterRating} Bintang ✕
          </Badge>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                'p-4 rounded-xl border',
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
                    {review.user.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        {review.user}
                      </span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Terverifikasi
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-gray-400">
                        {new Date(review.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className={cn('mt-3 text-sm', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                {review.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// Related Products Component
// ============================================================================
const RelatedProducts: React.FC<{ 
  currentProduct: Product; 
  products: Product[]; 
  isDarkMode: boolean;
  onNavigate: (productId: string) => void;
}> = ({ currentProduct, products, isDarkMode, onNavigate }) => {
  const relatedProducts = useMemo(() => {
    return products
      .filter(p => 
        p.id !== currentProduct.id && 
        (p.category === currentProduct.category || 
         p.tags.some(tag => currentProduct.tags.includes(tag)))
      )
      .slice(0, 4);
  }, [currentProduct, products]);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className={cn('text-lg font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
        Produk Terkait
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <motion.button
            key={product.id}
            onClick={() => onNavigate(product.id)}
            className={cn(
              'text-left rounded-xl overflow-hidden border transition-all hover:shadow-lg',
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="aspect-square relative">
              <img src={product.icon} alt={product.title} className="w-full h-full object-cover" />
              {product.discount_price && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  -{Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)}%
                </Badge>
              )}
            </div>
            <div className="p-3">
              <h4 className={cn('font-medium text-sm line-clamp-1', isDarkMode ? 'text-white' : 'text-gray-900')}>
                {product.title}
              </h4>
              <p className="text-primary font-bold text-sm mt-1">
                Rp {(product.discount_price || product.base_price).toLocaleString('id-ID')}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Product Detail Section
// ============================================================================
export const ProductDetailSection: React.FC<ProductDetailSectionProps> = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, isLoading: productsLoading } = useProducts();
  const { isDarkMode, addToCart, cart, soundEnabled } = useAppStore();
  
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Find product
  const product = useMemo(() => {
    return products.find(p => p.id === productId) || null;
  }, [products, productId]);

  // Initialize selected tier
  useEffect(() => {
    if (product) {
      setSelectedTier(product.tiers[0] || null);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  // Handle not found
  useEffect(() => {
    if (!productsLoading && !product && products.length > 0) {
      toast.error('Produk tidak ditemukan');
      navigate('/');
    }
  }, [productsLoading, product, products, navigate]);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product?.stock || 99)));
  }, [product?.stock]);

  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedTier) return;
    
    setIsAdding(true);
    if (soundEnabled) audioService.playSuccess();
    
    // Simulate adding delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addToCart(product, selectedTier.name);
    setIsAdding(false);
    
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <div>
          <p className="font-medium">Berhasil ditambahkan!</p>
          <p className="text-sm text-gray-500">{product.title} ({selectedTier.name})</p>
        </div>
      </div>,
      { duration: 3000 }
    );
  }, [product, selectedTier, addToCart, soundEnabled]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link berhasil disalin!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [product]);

  const handleNavigateToProduct = useCallback((newProductId: string) => {
    navigate(`/product/${newProductId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  // Loading state
  if (productsLoading || !product) {
    return (
      <div className={cn(
        'min-h-screen flex items-center justify-center',
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      )}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const isInCart = cart.some(item => item.productId === product.id && item.tier === selectedTier?.name);
  const cartItem = cart.find(item => item.productId === product.id && item.tier === selectedTier?.name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'min-h-screen pb-24 transition-colors duration-300',
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      )}
    >
      {/* Breadcrumb & Navigation */}
      <div className={cn(
        'sticky top-0 z-40 backdrop-blur-md border-b transition-colors',
        isDarkMode 
          ? 'bg-gray-900/90 border-gray-800' 
          : 'bg-white/90 border-gray-200'
      )}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            
            <nav className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="capitalize">{product.category}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white truncate max-w-[200px]">{product.title}</span>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={cn(
                  'p-2 rounded-full transition-all',
                  isWishlisted 
                    ? 'bg-red-50 text-red-500 dark:bg-red-900/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductGallery product={product} isDarkMode={isDarkMode} />
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
                {product.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className={cn(
                'text-2xl md:text-3xl lg:text-4xl font-bold leading-tight',
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}>
                {product.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span className={cn('font-medium', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                    {product.rating}
                  </span>
                  <span className="text-gray-400">({product.reviews} ulasan)</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{product.duration}</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className={cn(
              'p-4 rounded-xl',
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
            )}>
              <PriceDisplay
                price={selectedTier?.price || product.base_price}
                originalPrice={product.discount_price && product.discount_price < product.base_price ? product.base_price : undefined}
                size="xl"
              />
              {selectedTier && (
                <p className={cn('text-sm mt-2', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Paket <span className="font-semibold">{selectedTier.name}</span> • 
                  Rp {selectedTier.price.toLocaleString('id-ID')} per item
                </p>
              )}
            </div>

            {/* Tier Selection */}
            <TierSelection
              tiers={product.tiers}
              selectedTier={selectedTier}
              onSelect={setSelectedTier}
              isDarkMode={isDarkMode}
            />

            {/* Quantity & Add to Cart */}
            <div className={cn(
              'p-4 rounded-xl border-2',
              isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-3">
                  <span className={cn('text-sm font-medium', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                    Jumlah:
                  </span>
                  <div className={cn(
                    'flex items-center gap-1 rounded-lg border',
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                  )}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-none"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className={cn('w-12 text-center font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="h-10 w-10 rounded-none"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex-1">
                  <span className={cn('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>Total:</span>
                  <div className="text-2xl font-bold text-primary">
                    Rp {((selectedTier?.price || product.base_price) * quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || !selectedTier}
                  className={cn(
                    'flex-1 h-12 text-base font-semibold',
                    isInCart ? 'bg-green-600 hover:bg-green-700' : ''
                  )}
                >
                  {isAdding ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : isInCart ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Ditambahkan ({cartItem?.quantity})
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Tambah ke Keranjang
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleAddToCart();
                    setTimeout(() => navigate('/cart'), 500);
                  }}
                  className="h-12 px-6"
                >
                  Beli Langsung
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <TrustBadges />
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={cn(
              'w-full justify-start rounded-xl p-1 mb-6',
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            )}>
              <TabsTrigger value="overview" className="rounded-lg">Deskripsi</TabsTrigger>
              <TabsTrigger value="features" className="rounded-lg">Fitur Lengkap</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg">
                Ulasan ({product.reviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <div className={cn(
                'prose max-w-none p-6 rounded-xl',
                isDarkMode ? 'bg-gray-800/50 text-gray-300' : 'bg-white text-gray-700'
              )}>
                <p className="text-lg leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
                
                <div className="mt-8 grid md:grid-cols-3 gap-4">
                  {[
                    { icon: Clock, label: 'Durasi Pengerjaan', value: product.duration },
                    { icon: Shield, label: 'Garansi', value: '1-3 Tahun' },
                    { icon: Package, label: 'Tipe Layanan', value: product.category },
                  ].map((item) => (
                    <div key={item.label} className={cn(
                      'p-4 rounded-xl flex items-center gap-3',
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    )}>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className={cn('font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-0">
              <div className={cn(
                'p-6 rounded-xl',
                isDarkMode ? 'bg-gray-800/50' : 'bg-white'
              )}>
                <h3 className={cn('text-lg font-bold mb-4', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  Fitur per Paket
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {product.tiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={cn(
                        'p-4 rounded-xl border',
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br',
                          tierGradients[tier.name] || tierGradients.Basic
                        )}>
                          {tierIcons[tier.name]}
                        </div>
                        <div>
                          <h4 className={cn('font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                            {tier.name}
                          </h4>
                          <p className="text-primary font-semibold">
                            Rp {tier.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              <div className={cn(
                'p-6 rounded-xl',
                isDarkMode ? 'bg-gray-800/50' : 'bg-white'
              )}>
                <ReviewsSection product={product} isDarkMode={isDarkMode} />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <RelatedProducts
            currentProduct={product}
            products={products}
            isDarkMode={isDarkMode}
            onNavigate={handleNavigateToProduct}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetailSection;
