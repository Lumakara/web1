// iOS-style Ultra Smooth Animation Utilities
import { useEffect, useRef, useCallback, useState } from 'react';

// Spring animation configurations (iOS-style)
export const springConfig = {
  gentle: { tension: 120, friction: 14 },
  bouncy: { tension: 300, friction: 10 },
  stiff: { tension: 400, friction: 30 },
  slow: { tension: 80, friction: 20 },
  wobbly: { tension: 180, friction: 12 },
};

// Easing functions (cubic bezier for iOS feel)
export const easing = {
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  ios: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  iosSpring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// CSS animation keyframes generator
export const generateKeyframes = () => `
  @keyframes ios-fade-in {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  
  @keyframes ios-fade-out {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(20px) scale(0.95); }
  }
  
  @keyframes ios-slide-up {
    from { opacity: 0; transform: translateY(100%); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes ios-slide-down {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(100%); }
  }
  
  @keyframes ios-scale-in {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes ios-scale-out {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.8); }
  }
  
  @keyframes ios-bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  @keyframes ios-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  
  @keyframes ios-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  @keyframes ios-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4); }
  }
  
  @keyframes ios-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes ios-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes ios-ripple {
    0% { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  
  @keyframes ios-spring-pop {
    0% { transform: scale(0.5); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  
  @keyframes ios-elastic {
    0% { transform: scale(0); }
    55% { transform: scale(1.1); }
    70% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes morph {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  
  @keyframes typing {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

// Animation classes
export const animationClasses = {
  fadeIn: 'animate-[ios-fade-in_0.4s_ease-out]',
  fadeOut: 'animate-[ios-fade-out_0.3s_ease-in]',
  slideUp: 'animate-[ios-slide-up_0.5s_ease-out]',
  slideDown: 'animate-[ios-slide-down_0.3s_ease-in]',
  scaleIn: 'animate-[ios-scale-in_0.3s_ease-out]',
  scaleOut: 'animate-[ios-scale-out_0.2s_ease-in]',
  bounce: 'animate-[ios-bounce_0.3s_ease-out]',
  pulse: 'animate-[ios-pulse_2s_ease-in-out_infinite]',
  shake: 'animate-[ios-shake_0.5s_ease-in-out]',
  glow: 'animate-[ios-glow_2s_ease-in-out_infinite]',
  float: 'animate-[ios-float_3s_ease-in-out_infinite]',
  rotate: 'animate-[ios-rotate_1s_linear_infinite]',
  springPop: 'animate-[ios-spring-pop_0.5s_ease-out]',
  elastic: 'animate-[ios-elastic_0.6s_ease-out]',
  gradient: 'animate-[gradient-shift_3s_ease_infinite]',
  shimmer: 'animate-[shimmer_2s_linear_infinite]',
  morph: 'animate-[morph_8s_ease-in-out_infinite]',
};

// Hook for scroll animations
export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Hook for staggered animations
export const useStaggeredAnimation = (_itemCount: number, baseDelay = 50) => {
  return useCallback(
    (index: number) => ({
      animationDelay: `${index * baseDelay}ms`,
    }),
    [baseDelay]
  );
};

// Hook for parallax effect
export const useParallax = (speed = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        void ref.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        setOffset(scrolled * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
};

// Touch gesture handler
export const useTouchGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) < threshold) return;

    if (absX > absY) {
      if (deltaX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    } else {
      if (deltaY > 0) {
        onSwipeUp?.();
      } else {
        onSwipeDown?.();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// Magnetic button effect
export const useMagneticEffect = (strength = 0.3) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return { ref, position };
};

// Smooth number counter

export const useCountUp = (end: number, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return { count, isAnimating, startAnimation };
};

// Effect variants for Framer Motion style animations
export const effectVariants = {
  v1: {
    // Subtle - Minimal animations
    fadeIn: { initial: { opacity: 0.9 }, animate: { opacity: 1 }, transition: { duration: 0.2 } },
    scale: { initial: { scale: 0.98 }, animate: { scale: 1 }, transition: { duration: 0.15 } },
    slide: { initial: { y: 5 }, animate: { y: 0 }, transition: { duration: 0.2 } },
  },
  v2: {
    // Smooth - Balanced animations
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, ease: 'easeOut' } },
    scale: { initial: { scale: 0.95 }, animate: { scale: 1 }, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    slide: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.4, ease: 'easeOut' } },
  },
  v3: {
    // Dynamic - Full animations
    fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] } },
    scale: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] } },
    slide: { initial: { y: 30, opacity: 0, scale: 0.95 }, animate: { y: 0, opacity: 1, scale: 1 }, transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] } },
  },
  off: {
    // No animations
    fadeIn: { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } },
    scale: { initial: { scale: 1 }, animate: { scale: 1 }, transition: { duration: 0 } },
    slide: { initial: { y: 0 }, animate: { y: 0 }, transition: { duration: 0 } },
  },
};
