import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import type { Product, Tier } from '@/lib/supabase';
import { cn } from '@/lib/utils';
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
  X,
} from 'lucide-react';

interface ProductModalUltraProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, tier: string) => void;
}

// Tier configuration
const tierIcons: Record<string, React.ReactNode> = {
  Basic: <Package className="w-5 h-5" />,
  Standard: <Award className="w-5 h-5" />,
  Premium: <Crown className="w-5 h-5" />,
};

const tierStyles: Record<string, { bg: string; border: string; badge: string }> = {
  Basic: {
    bg: 'bg-slate-50 dark:bg-slate-900/30',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  Standard: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  Premium: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
};

// Static price display - no animation for better performance
const PriceDisplay: React.FC<{ price: number; className?: string }> = ({ price, className }) => (
  <span className={cn('font-bold tabular-nums', className)}>
    Rp{price.toLocaleString('id-ID')}
  </span>
);

// Star rating component - simplified
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
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
  const { isDarkMode } = useAppStore();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Initialize data when product changes
  useEffect(() => {
    if (product) {
      setSelectedTier(product.tiers[0] || null);
      setQuantity(1);
      setIsAdding(false);
    }
  }, [product]);

  // Handle tier selection
  const handleTierSelect = useCallback((tier: Tier) => {
    setSelectedTier(tier);
  }, []);

  // Handle quantity change
  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, 99)));
  }, []);

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedTier) return;
    setIsAdding(true);
    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300));
    onAddToCart(product, selectedTier.name);
    setIsAdding(false);
  }, [product, selectedTier, onAddToCart]);

  if (!product) return null;

  const discountPercent = product.discount_price
    ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-2xl w-[95vw] max-h-[90vh] p-0 overflow-hidden border-0 gap-0',
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        )}
      >
        {/* Scrollable Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-[calc(90vh-120px)]">
          {/* Header */}
          <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Category & Discount Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'capitalize text-xs font-medium',
                      isDarkMode ? 'bg-primary/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                    )}
                  >
                    {product.category}
                  </Badge>
                  {discountPercent > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      -{discountPercent}%
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <DialogTitle
                  className={cn(
                    'text-xl sm:text-2xl font-bold leading-tight',
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  )}
                >
                  {product.title}
                </DialogTitle>

                {/* Rating & Duration */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={product.rating} />
                    <span className={cn('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {product.rating}
                    </span>
                  </div>
                  <span className={cn('text-sm', isDarkMode ? 'text-gray-600' : 'text-gray-300')}>|</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className={cn('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                      {product.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close button for mobile - visible on small screens */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 sm:hidden h-8 w-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Main Content - Single Column Layout */}
          <div className="px-4 sm:px-6 pb-4 space-y-5">
            {/* Product Image - Simplified */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              {/* Stock indicator overlay */}
              <div className="absolute bottom-3 left-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs font-medium shadow-sm',
                    product.stock > 50
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300'
                      : product.stock > 10
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                  )}
                >
                  {product.stock > 50 ? 'Stok Tersedia' : product.stock > 10 ? `Stok: ${product.stock}` : 'Stok Terbatas'}
                </Badge>
              </div>
            </div>

            {/* Product Description */}
            <DialogDescription
              className={cn(
                'text-sm sm:text-base leading-relaxed',
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              )}
            >
              {product.description}
            </DialogDescription>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.slice(0, 6).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      'text-xs capitalize',
                      isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-600'
                    )}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Tier Selection - Prominent Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={cn('font-semibold text-sm sm:text-base', isDarkMode ? 'text-gray-200' : 'text-gray-800')}>
                  Pilih Paket
                </h3>
                <Gem className="w-4 h-4 text-primary" />
              </div>

              <div className="space-y-2.5">
                {product.tiers.map((tier) => {
                  const isSelected = selectedTier?.name === tier.name;
                  const styles = tierStyles[tier.name] || tierStyles.Basic;

                  return (
                    <button
                      key={tier.name}
                      onClick={() => handleTierSelect(tier)}
                      className={cn(
                        'w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50',
                        isSelected
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : cn(styles.bg, styles.border, 'hover:border-gray-300 dark:hover:border-gray-600')
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Radio indicator */}
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300 dark:border-gray-600'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        {/* Tier info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                'font-semibold text-sm sm:text-base',
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              )}
                            >
                              {tier.name}
                            </span>
                            {tierIcons[tier.name] && (
                              <span className={cn('p-1 rounded', styles.badge)}>
                                {tierIcons[tier.name]}
                              </span>
                            )}
                          </div>

                          <PriceDisplay
                            price={tier.price}
                            className={cn(
                              'text-lg sm:text-xl mt-1 block',
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            )}
                          />

                          {/* Features - Collapsed on mobile, expanded on desktop */}
                          <ul className="mt-2 space-y-1">
                            {tier.features.slice(0, 4).map((feature, idx) => (
                              <li
                                key={idx}
                                className={cn(
                                  'flex items-center gap-2 text-xs sm:text-sm',
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                )}
                              >
                                <span className="text-green-500 shrink-0">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                                <span className="truncate">{feature}</span>
                              </li>
                            ))}
                            {tier.features.length > 4 && (
                              <li
                                className={cn(
                                  'text-xs pl-5.5',
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                )}
                              >
                                +{tier.features.length - 4} fitur lainnya
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky Add to Cart Section */}
        <div
          className={cn(
            'border-t p-4 sm:p-6',
            isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
          )}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Price Info */}
            <div className="flex-1 min-w-0">
              <span className={cn('text-xs sm:text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                Total Harga
              </span>
              <div className="flex items-baseline gap-2">
                {selectedTier && (
                  <PriceDisplay
                    price={selectedTier.price * quantity}
                    className={cn('text-2xl sm:text-3xl', isDarkMode ? 'text-white' : 'text-gray-900')}
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
                <span className={cn('text-xs', isDarkMode ? 'text-gray-500' : 'text-gray-500')}>
                  {selectedTier.name} × {quantity}
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div
              className={cn(
                'flex items-center justify-between sm:justify-start gap-1 p-1 rounded-lg',
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-9 w-9 rounded-md"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span
                className={cn(
                  'w-10 text-center font-semibold text-base',
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
                className="h-9 w-9 rounded-md"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || !selectedTier}
              className={cn(
                'h-12 px-6 rounded-xl font-semibold text-sm sm:text-base',
                'bg-primary hover:bg-primary/90',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {isAdding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menambahkan...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Tambah ke Keranjang</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModalUltra;
