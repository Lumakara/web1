import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  blurEffect?: boolean;
}

/**
 * Premium Lazy Image Component
 * 
 * Features:
 * - Intersection Observer-based lazy loading
 * - Smooth fade-in animation
 * - Blur placeholder effect
 * - Error handling with fallback
 * - Loading skeleton
 * - Priority loading option for above-the-fold images
 */
export function LazyImage({
  src,
  alt,
  className,
  containerClassName,
  placeholderColor = 'bg-gray-200 dark:bg-gray-700',
  onLoad,
  onError,
  priority = false,
  objectFit = 'cover',
  blurEffect = true,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Retry loading
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setIsLoaded(false);
    // Force reload by changing src temporarily
    if (imgRef.current) {
      const currentSrc = imgRef.current.src;
      imgRef.current.src = '';
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = currentSrc;
        }
      }, 100);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
    >
      {/* Loading Skeleton */}
      <AnimatePresence>
        {(isLoading || !isLoaded) && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              placeholderColor
            )}
          >
            <motion.div
              animate={{
                background: [
                  'rgba(255,255,255,0)',
                  'rgba(255,255,255,0.1)',
                  'rgba(255,255,255,0)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0"
            />
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800"
          >
            <ImageOff className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 mb-2">Gagal memuat gambar</span>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Image */}
      {isInView && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0, scale: blurEffect ? 1.05 : 1 }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : blurEffect ? 1.05 : 1,
            filter: isLoaded ? 'blur(0px)' : blurEffect ? 'blur(10px)' : 'blur(0px)',
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'w-full h-full transition-transform duration-500',
            className
          )}
          style={{ objectFit }}
        />
      )}
    </div>
  );
}

interface LazyBackgroundImageProps {
  src: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
}

/**
 * Lazy Background Image Component
 * For hero sections and banner backgrounds
 */
export function LazyBackgroundImage({
  src,
  children,
  className,
  overlayClassName,
  priority = false,
}: LazyBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
      )}

      {/* Background image */}
      {isInView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
          onLoad={() => setIsLoaded(true)}
        >
          <img
            src={src}
            alt=""
            className="hidden"
            onLoad={() => setIsLoaded(true)}
          />
        </motion.div>
      )}

      {/* Overlay */}
      {overlayClassName && (
        <div className={cn('absolute inset-0', overlayClassName)} />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default LazyImage;
