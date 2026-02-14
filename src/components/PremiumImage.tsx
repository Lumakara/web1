import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Container additional CSS classes */
  containerClassName?: string;
  /** Image aspect ratio */
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto' | string;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Placeholder blur hash or color */
  placeholder?: string;
  /** Whether to use WebP format with fallback */
  useWebP?: boolean;
  /** WebP source URL (if different from src) */
  webpSrc?: string;
  /** Loading mode */
  loading?: 'lazy' | 'eager';
  /** Trigger animation on viewport intersection */
  animateOnView?: boolean;
  /** Custom fallback component */
  fallbackComponent?: React.ReactNode;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Source set for responsive images */
  srcSet?: string;
}

/**
 * PremiumImage Component
 * 
 * A premium image component with lazy loading, blur placeholder effect,
 * smooth fade-in animation, error handling, and WebP support.
 * 
 * @example
 * <PremiumImage
 *   src="/images/product.jpg"
 *   alt="Product Image"
 *   aspectRatio="square"
 *   useWebP
 *   webpSrc="/images/product.webp"
 * />
 */
export function PremiumImage({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'auto',
  objectFit = 'cover',
  placeholder,
  useWebP = false,
  webpSrc,
  loading = 'lazy',
  animateOnView = true,
  fallbackComponent,
  onLoad,
  onError,
  sizes,
  srcSet,
}: PremiumImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (loading === 'eager' || !animateOnView) {
      setIsInView(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading, animateOnView]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  // Generate aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-video';
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'auto':
        return '';
      default:
        return aspectRatio.startsWith('aspect-') ? aspectRatio : '';
    }
  };

  // Generate object fit class
  const getObjectFitClass = () => {
    return `object-${objectFit}`;
  };

  // Retry loading
  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    if (imageRef.current) {
      imageRef.current.src = imageRef.current.src;
    }
  }, []);

  // Render fallback on error
  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden bg-muted flex items-center justify-center',
          getAspectRatioClass(),
          containerClassName
        )}
      >
        {fallbackComponent || (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs">Gagal memuat gambar</span>
            <button
              onClick={handleRetry}
              className="text-xs text-primary hover:underline focus-ring px-2 py-1 rounded"
            >
              Coba lagi
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        getAspectRatioClass(),
        containerClassName
      )}
    >
      {/* Skeleton Loading State */}
      {isLoading && !isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse">
          <div className="absolute inset-0 skeleton" />
        </div>
      )}

      {/* Placeholder Blur */}
      {placeholder && !isLoaded && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            backgroundColor: placeholder.startsWith('#') ? placeholder : undefined,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {/* Main Image with WebP Support */}
      {isInView && (
        <picture className="contents">
          {useWebP && webpSrc && (
            <source srcSet={webpSrc || src.replace(/\.(jpe?g|png)$/i, '.webp')} type="image/webp" />
          )}
          {useWebP && srcSet && (
            <source
              srcSet={srcSet.replace(/\.(jpe?g|png)\s/g, '.webp ')}
              type="image/webp"
              sizes={sizes}
            />
          )}
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            sizes={sizes}
            srcSet={srcSet}
            className={cn(
              'w-full h-full transition-all duration-500 ease-out',
              getObjectFitClass(),
              isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm',
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            loading={loading}
            decoding="async"
          />
        </picture>
      )}

      {/* Loading Indicator */}
      {isLoading && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      )}

      {/* Gradient Overlay (optional enhancement) */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}

/**
 * PremiumAvatar Component
 * 
 * A specialized version of PremiumImage for avatar/profile pictures.
 */
interface PremiumAvatarProps extends Omit<PremiumImageProps, 'aspectRatio' | 'objectFit'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  border?: boolean;
  borderColor?: string;
  fallbackText?: string;
}

export function PremiumAvatar({
  size = 'md',
  border = false,
  borderColor = 'white',
  fallbackText,
  className,
  ...props
}: PremiumAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  const sizeClass = typeof size === 'number' ? '' : sizeClasses[size];
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : undefined;
  const textSize = typeof size === 'number' ? 'text-sm' : textSizes[size];

  const getInitials = () => {
    if (!fallbackText) return '?';
    return fallbackText
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (hasError || !props.src) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-semibold',
          sizeClass,
          border && 'ring-2 ring-offset-2',
          className
        )}
        style={{
          ...sizeStyle,
          ...(border && { '--tw-ring-color': borderColor } as React.CSSProperties),
        }}
      >
        <span className={textSize}>{getInitials()}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden',
        sizeClass,
        border && 'ring-2 ring-offset-2',
        className
      )}
      style={{
        ...sizeStyle,
        ...(border && { '--tw-ring-color': borderColor } as React.CSSProperties),
      }}
    >
      <PremiumImage
        {...props}
        aspectRatio="square"
        objectFit="cover"
        onError={() => setHasError(true)}
        containerClassName="w-full h-full"
      />
    </div>
  );
}

export default PremiumImage;
