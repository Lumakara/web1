import { useState, useEffect, useRef, useCallback, createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Image Lazy Loading Context
// ============================================

interface LazyLoadContextType {
  rootMargin: string;
  threshold: number;
}

const LazyLoadContext = createContext<LazyLoadContextType>({
  rootMargin: '50px',
  threshold: 0.01,
});

interface ImageLazyLoadProviderProps {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

/**
 * ImageLazyLoadProvider
 * 
 * Provides configuration for lazy loading images throughout the app.
 * Wrap your app or specific sections with this provider.
 * 
 * @example
 * <ImageLazyLoadProvider rootMargin="100px" threshold={0.1}>
 *   <App />
 * </ImageLazyLoadProvider>
 */
export function ImageLazyLoadProvider({
  children,
  rootMargin = '50px',
  threshold = 0.01,
}: ImageLazyLoadProviderProps) {
  return (
    <LazyLoadContext.Provider value={{ rootMargin, threshold }}>
      {children}
    </LazyLoadContext.Provider>
  );
}

// ============================================
// useLazyLoad Hook
// ============================================

interface UseLazyLoadOptions {
  triggerOnce?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
}

/**
 * useLazyLoad Hook
 * 
 * Custom hook for observing element visibility in viewport.
 * Useful for lazy loading images, triggering animations, etc.
 * 
 * @example
 * const { ref, isInView, hasEntered } = useLazyLoad({ triggerOnce: true });
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const { triggerOnce = true, onEnter, onLeave } = options;
  const [isInView, setIsInView] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const context = useContext(LazyLoadContext);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);

        if (inView) {
          setHasEntered(true);
          onEnter?.();
          if (triggerOnce) {
            observerRef.current?.disconnect();
          }
        } else if (!triggerOnce) {
          onLeave?.();
        }
      },
      {
        rootMargin: context.rootMargin,
        threshold: context.threshold,
      }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [triggerOnce, onEnter, onLeave, context.rootMargin, context.threshold]);

  return { ref: elementRef, isInView, hasEntered };
}

// ============================================
// ImageLazyLoad Component
// ============================================

interface ImageLazyLoadProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes for the image */
  className?: string;
  /** Additional CSS classes for the container */
  containerClassName?: string;
  /** Placeholder while loading (can be a URL or color) */
  placeholder?: string;
  /** Whether to fade in when loaded */
  fadeIn?: boolean;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Image aspect ratio */
  aspectRatio?: string;
  /** Object fit style */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Callback when image enters viewport */
  onEnter?: () => void;
  /** Callback when image leaves viewport (only if triggerOnce is false) */
  onLeave?: () => void;
  /** Custom placeholder component */
  placeholderComponent?: ReactNode;
  /** Whether to trigger only once */
  triggerOnce?: boolean;
  /** Image sizes attribute */
  sizes?: string;
  /** Image srcSet attribute */
  srcSet?: string;
  /** Loading priority */
  priority?: 'high' | 'low' | 'auto';
  /** Whether image is decorative (no alt needed) */
  decorative?: boolean;
}

/**
 * ImageLazyLoad Component
 * 
 * A wrapper component that lazy loads images when they enter the viewport.
 * Supports fade-in effects, custom placeholders, and various aspect ratios.
 * 
 * @example
 * <ImageLazyLoad
 *   src="/images/product.jpg"
 *   alt="Product"
 *   aspectRatio="16/9"
 *   fadeIn
 * />
 */
export function ImageLazyLoad({
  src,
  alt,
  className,
  containerClassName,
  placeholder,
  fadeIn = true,
  rootMargin,
  threshold,
  aspectRatio,
  objectFit = 'cover',
  onEnter,
  onLeave,
  placeholderComponent,
  triggerOnce = true,
  sizes,
  srcSet,
  priority = 'auto',
  decorative = false,
}: ImageLazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const context = useContext(LazyLoadContext);

  const { ref: containerRef, isInView } = useLazyLoad({
    triggerOnce,
    onEnter,
    onLeave,
  });

  // Override context values if provided as props
  const effectiveRootMargin = rootMargin ?? context.rootMargin;
  const effectiveThreshold = threshold ?? context.threshold;

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Handle image error
  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Generate placeholder style
  const getPlaceholderStyle = (): React.CSSProperties => {
    if (!placeholder) return {};
    
    if (placeholder.startsWith('#') || placeholder.startsWith('rgb')) {
      return { backgroundColor: placeholder };
    }
    if (placeholder.startsWith('http') || placeholder.startsWith('/')) {
      return { backgroundImage: `url(${placeholder})`, backgroundSize: 'cover' };
    }
    return {};
  };

  // Generate aspect ratio style
  const getAspectRatioStyle = (): React.CSSProperties => {
    if (!aspectRatio) return {};
    return { aspectRatio };
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={getAspectRatioStyle()}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={getPlaceholderStyle()}
        >
          {placeholderComponent || (
            <div className="w-full h-full bg-muted animate-pulse" />
          )}
        </div>
      )}

      {/* Lazy Loaded Image */}
      {isInView && !hasError && (
        <img
          ref={imageRef}
          src={src}
          alt={decorative ? '' : alt}
          sizes={sizes}
          srcSet={srcSet}
          className={cn(
            'w-full h-full',
            `object-${objectFit}`,
            fadeIn && 'transition-opacity duration-500',
            fadeIn && !isLoaded ? 'opacity-0' : 'opacity-100',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          decoding={priority === 'high' ? 'sync' : 'async'}
          role={decorative ? 'presentation' : undefined}
          aria-hidden={decorative ? 'true' : undefined}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// LazyLoadWrapper Component
// ============================================

interface LazyLoadWrapperProps {
  children: ReactNode;
  className?: string;
  placeholder?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  /** Animation class to apply when in view */
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'none';
  /** Animation duration in ms */
  duration?: number;
  /** Animation delay in ms */
  delay?: number;
}

/**
 * LazyLoadWrapper Component
 * 
 * A generic wrapper that triggers animations or renders children
 * only when they enter the viewport.
 * 
 * @example
 * <LazyLoadWrapper animation="slideUp" delay={200}>
 *   <ExpensiveComponent />
 * </LazyLoadWrapper>
 */
export function LazyLoadWrapper({
  children,
  className,
  placeholder,
  rootMargin,
  threshold,
  triggerOnce = true,
  onEnter,
  onLeave,
  animation = 'fadeIn',
  duration = 500,
  delay = 0,
}: LazyLoadWrapperProps) {
  const { ref, hasEntered } = useLazyLoad({
    triggerOnce,
    onEnter,
    onLeave,
  });

  const getAnimationStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transitionProperty: 'opacity, transform',
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: `${delay}ms`,
    };

    if (!hasEntered) {
      switch (animation) {
        case 'fadeIn':
          return { ...base, opacity: 0 };
        case 'slideUp':
          return { ...base, opacity: 0, transform: 'translateY(30px)' };
        case 'slideDown':
          return { ...base, opacity: 0, transform: 'translateY(-30px)' };
        case 'slideLeft':
          return { ...base, opacity: 0, transform: 'translateX(30px)' };
        case 'slideRight':
          return { ...base, opacity: 0, transform: 'translateX(-30px)' };
        case 'scaleIn':
          return { ...base, opacity: 0, transform: 'scale(0.9)' };
        case 'none':
        default:
          return base;
      }
    }

    return { ...base, opacity: 1, transform: 'none' };
  };

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={getAnimationStyles()}
    >
      {hasEntered ? children : placeholder}
    </div>
  );
}

// ============================================
// StaggeredLazyLoad Component
// ============================================

interface StaggeredLazyLoadProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  baseDelay?: number;
  animation?: LazyLoadWrapperProps['animation'];
  placeholder?: ReactNode;
}

/**
 * StaggeredLazyLoad Component
 * 
 * Renders children with staggered animations as they enter the viewport.
 * Useful for lists, grids, or any sequential content.
 * 
 * @example
 * <StaggeredLazyLoad staggerDelay={100} animation="slideUp">
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </StaggeredLazyLoad>
 */
export function StaggeredLazyLoad({
  children,
  className,
  itemClassName,
  staggerDelay = 100,
  baseDelay = 0,
  animation = 'slideUp',
  placeholder,
}: StaggeredLazyLoadProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <LazyLoadWrapper
          key={index}
          className={itemClassName}
          animation={animation}
          delay={baseDelay + index * staggerDelay}
          placeholder={placeholder}
        >
          {child}
        </LazyLoadWrapper>
      ))}
    </div>
  );
}

// ============================================
// PreloadImage Component
// ============================================

interface PreloadImageProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * PreloadImage Component
 * 
 * Invisible component that preloads an image.
 * Useful for preloading images that will be shown soon.
 * 
 * @example
 * <PreloadImage src="/images/hero.jpg" onLoad={() => setReady(true)} />
 */
export function PreloadImage({ src, onLoad, onError }: PreloadImageProps) {
  useEffect(() => {
    const img = new Image();
    img.onload = () => onLoad?.();
    img.onerror = () => onError?.();
    img.src = src;
  }, [src, onLoad, onError]);

  return null;
}

// ============================================
// ImagePreloader Hook
// ============================================

interface UseImagePreloaderOptions {
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: () => void;
  onError?: (src: string) => void;
}

/**
 * useImagePreloader Hook
 * 
 * Hook for preloading multiple images with progress tracking.
 * 
 * @example
 * const { preload, isLoading, progress } = useImagePreloader({
 *   onProgress: (loaded, total) => console.log(`${loaded}/${total}`),
 *   onComplete: () => console.log('All loaded!'),
 * });
 * 
 * useEffect(() => {
 *   preload(['/img1.jpg', '/img2.jpg', '/img3.jpg']);
 * }, []);
 */
export function useImagePreloader(options: UseImagePreloaderOptions = {}) {
  const { onProgress, onComplete, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const preload = useCallback(
    async (sources: string[]) => {
      setIsLoading(true);
      setProgress(0);

      let loaded = 0;
      const total = sources.length;

      const loadImage = (src: string): Promise<void> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            const newProgress = Math.round((loaded / total) * 100);
            setProgress(newProgress);
            onProgress?.(loaded, total);
            resolve();
          };
          img.onerror = () => {
            loaded++;
            onError?.(src);
            resolve(); // Resolve anyway to continue loading others
          };
          img.src = src;
        });
      };

      await Promise.all(sources.map(loadImage));
      setIsLoading(false);
      onComplete?.();
    },
    [onProgress, onComplete, onError]
  );

  return { preload, isLoading, progress };
}

export default ImageLazyLoad;
