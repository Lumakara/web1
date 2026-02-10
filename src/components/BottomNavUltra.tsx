import { useState, useRef, useEffect, useCallback } from 'react';
import { Home, ShoppingBag, User, Headphones } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { audioService } from '@/lib/audio';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform, type Transition, type Variants } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  color: string;
}

interface RippleEffect {
  id: number;
  x: number;
  y: number;
  size: number;
}

// Spring transition config
const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

const iconSpringTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};

const labelSpringTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

export function BottomNavUltra() {
  const location = useLocation();
  const { isAuthenticated, isDarkMode, soundEnabled, cart } = useAppStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [ripples, setRipples] = useState<Record<string, RippleEffect[]>>({});
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Spring-based motion values for ultra smooth animations
  const indicatorX = useMotionValue(0);
  const springX = useSpring(indicatorX, { stiffness: 450, damping: 32, mass: 0.9 });
  const springScale = useMotionValue(1);
  const springScaleSpring = useSpring(springScale, { stiffness: 500, damping: 25 });
  
  // Transform for subtle squash effect during transition
  const indicatorWidth = useTransform(springScaleSpring, [0.85, 1], [60, 56]);
  const indicatorHeight = useTransform(springScaleSpring, [0.85, 1], [44, 48]);

  // Calculate cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Beranda', icon: Home, path: '/', color: '#3B82F6' },
    { id: 'cart', label: 'Keranjang', icon: ShoppingBag, path: '/cart', badge: cartCount > 0 ? cartCount : undefined, color: '#10B981' },
    { id: 'support', label: 'Bantuan', icon: Headphones, path: '/support', color: '#8B5CF6' },
    { id: 'profile', label: 'Profil', icon: User, path: isAuthenticated ? '/profile' : '/auth', color: '#F59E0B' },
  ];

  // Update active index based on current path
  useEffect(() => {
    const index = navItems.findIndex((item) => item.path === location.pathname);
    if (index !== -1) {
      setActiveIndex(index);
    }
  }, [location.pathname, navItems]);

  // Update indicator position with spring animation
  useEffect(() => {
    if (containerRef.current) {
      const itemWidth = containerRef.current.offsetWidth / navItems.length;
      const centerOffset = itemWidth / 2 - 28; // 28 is half of indicator width
      indicatorX.set(activeIndex * itemWidth + centerOffset);
    }
  }, [activeIndex, indicatorX, navItems.length]);

  // Handle ripple effect with dynamic sizing
  const createRipple = useCallback((e: React.MouseEvent | React.TouchEvent, index: number) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 1.2;
    const id = Date.now() + Math.random();

    setRipples((prev) => ({
      ...prev,
      [index]: [...(prev[index] || []), { id, x, y, size }],
    }));

    setTimeout(() => {
      setRipples((prev) => ({
        ...prev,
        [index]: prev[index]?.filter((r) => r.id !== id) || [],
      }));
    }, 700);
  }, []);

  // Handle tab click with haptic visual feedback
  const handleTabClick = useCallback((e: React.MouseEvent | React.TouchEvent, index: number) => {
    createRipple(e, index);
    setPressedIndex(index);
    
    // Trigger squash effect
    springScale.set(0.85);
    setTimeout(() => springScale.set(1), 150);
    
    if (soundEnabled) {
      audioService.playClick();
    }

    setTimeout(() => setPressedIndex(null), 200);
  }, [createRipple, soundEnabled, springScale]);

  // Icon animation variants
  const iconVariants: Variants = {
    inactive: { 
      scale: 1, 
      rotate: 0,
      y: 0,
    },
    active: { 
      scale: 1.2, 
      rotate: [0, -10, 10, -5, 5, 0],
      y: -2,
      transition: {
        scale: iconSpringTransition,
        rotate: { duration: 0.5, ease: 'easeInOut' },
        y: { type: 'spring', stiffness: 300, damping: 20 }
      }
    },
    hover: {
      scale: 1.1,
      y: -1,
      transition: springTransition
    },
    press: {
      scale: 0.85,
      transition: { duration: 0.1 }
    }
  };

  // Label animation variants
  const labelVariants: Variants = {
    inactive: { 
      opacity: 0.7, 
      y: 0,
      scale: 0.95,
    },
    active: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: labelSpringTransition
    }
  };

  // Floating bubble animation for active state
  const floatingBubbleVariants: Variants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: springTransition
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 25,
        delay: 0.2
      }}
      className={`fixed bottom-0 left-0 right-0 z-50 ${
        isDarkMode
          ? 'bg-gray-900/75 border-gray-700/30'
          : 'bg-white/75 border-white/30'
      } backdrop-blur-2xl border-t`}
      style={{
        boxShadow: isDarkMode
          ? '0 -10px 40px -10px rgba(0, 0, 0, 0.5), 0 -1px 0 rgba(255, 255, 255, 0.05)'
          : '0 -10px 40px -10px rgba(0, 0, 0, 0.15), 0 -1px 0 rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Top gradient line for premium feel */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[1px] ${
          isDarkMode 
            ? 'bg-gradient-to-r from-transparent via-gray-600/50 to-transparent' 
            : 'bg-gradient-to-r from-transparent via-gray-300/50 to-transparent'
        }`}
      />

      {/* Main content container with safe area */}
      <div className="h-[76px] pb-[env(safe-area-inset-bottom,0px)] relative">
        <div 
          ref={containerRef}
          className="relative flex justify-around items-center h-full px-2"
        >
          {/* Animated Background Indicator - The Morphing Blob */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 rounded-3xl pointer-events-none"
            style={{
              x: springX,
              width: indicatorWidth,
              height: indicatorHeight,
              left: 0,
            }}
          >
            {/* Main gradient background */}
            <motion.div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              animate={{
                background: isDarkMode
                  ? `linear-gradient(135deg, ${navItems[activeIndex].color}30 0%, ${navItems[activeIndex].color}15 100%)`
                  : `linear-gradient(135deg, ${navItems[activeIndex].color}20 0%, ${navItems[activeIndex].color}08 100%)`,
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Inner glow */}
              <motion.div
                className="absolute inset-0 opacity-50"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${navItems[activeIndex].color}40 0%, transparent 70%)`,
                }}
              />
            </motion.div>
            
            {/* Border glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-3xl -z-10"
              animate={{
                background: `linear-gradient(135deg, ${navItems[activeIndex].color}50 0%, transparent 50%, ${navItems[activeIndex].color}30 100%)`,
                opacity: pressedIndex === activeIndex ? 0.8 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Floating shadow */}
            <motion.div
              className="absolute inset-0 rounded-3xl -z-20 blur-xl"
              animate={{
                background: navItems[activeIndex].color,
                opacity: pressedIndex === activeIndex ? 0.3 : 0.15,
                scale: pressedIndex === activeIndex ? 1.1 : 1.05,
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Nav Items */}
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeIndex;
            const isPressed = pressedIndex === index;
            const isHovered = isHovering === index;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => handleTabClick(e, index)}
                onTouchStart={(e) => handleTabClick(e, index)}
                onMouseEnter={() => setIsHovering(index)}
                onMouseLeave={() => setIsHovering(null)}
                className="relative flex-1 h-full flex items-center justify-center"
              >
                {/* Ripple Effects */}
                <AnimatePresence>
                  {ripples[index]?.map((ripple) => (
                    <motion.span
                      key={ripple.id}
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 3, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        left: ripple.x - ripple.size / 2,
                        top: ripple.y - ripple.size / 2,
                        width: ripple.size,
                        height: ripple.size,
                        background: isDarkMode 
                          ? `radial-gradient(circle, ${item.color}40 0%, transparent 70%)`
                          : `radial-gradient(circle, ${item.color}30 0%, transparent 70%)`,
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Tab Content Container */}
                <motion.div
                  className="relative flex flex-col items-center justify-center gap-1"
                  variants={iconVariants}
                  initial="inactive"
                  animate={isPressed ? 'press' : isActive ? 'active' : isHovered ? 'hover' : 'inactive'}
                >
                  {/* Icon Container with floating effect */}
                  <motion.div
                    className="relative"
                    animate={{
                      y: isActive ? -4 : 0,
                      filter: isActive ? `drop-shadow(0 4px 8px ${item.color}50)` : 'none',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  >
                    {/* Glow effect behind icon when active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          variants={floatingBubbleVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="absolute inset-0 -m-2 rounded-full blur-md"
                          style={{ background: `${item.color}40` }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Icon with enhanced animations */}
                    <motion.div
                      animate={{
                        scale: isActive ? [1, 1.1, 1] : 1,
                      }}
                      transition={{ 
                        duration: 0.4, 
                        ease: 'easeOut',
                      }}
                    >
                      <Icon
                        className="h-[22px] w-[22px] transition-colors duration-300"
                        style={{
                          color: isActive ? item.color : isDarkMode ? '#9CA3AF' : '#6B7280',
                        }}
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </motion.div>

                    {/* Badge with pulse animation */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                        className="absolute -top-1.5 -right-2 flex items-center justify-center"
                      >
                        {/* Animated pulse ring */}
                        <motion.span
                          className="absolute inset-0 rounded-full"
                          style={{ background: item.color }}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                        {/* Badge background */}
                        <span 
                          className="relative flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full shadow-lg"
                          style={{ 
                            background: item.color,
                            boxShadow: `0 2px 8px ${item.color}60`
                          }}
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Label with animated color */}
                  <motion.span
                    className="text-[10px] font-semibold tracking-wide"
                    variants={labelVariants}
                    initial="inactive"
                    animate={isActive ? 'active' : 'inactive'}
                    style={{
                      color: isActive ? item.color : isDarkMode ? '#9CA3AF' : '#6B7280',
                    }}
                  >
                    {item.label}
                  </motion.span>

                  {/* Active indicator dot */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: item.color }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Haptic feedback visual - expanding circle */}
                <AnimatePresence>
                  {isPressed && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="absolute inset-4 rounded-2xl pointer-events-none"
                      style={{
                        background: isDarkMode 
                          ? `radial-gradient(circle, ${item.color}20 0%, transparent 70%)`
                          : `radial-gradient(circle, ${item.color}15 0%, transparent 70%)`,
                      }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom gradient for seamless blend */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[env(safe-area-inset-bottom,0px)] pointer-events-none ${
          isDarkMode
            ? 'bg-gradient-to-t from-gray-900/80 to-transparent'
            : 'bg-gradient-to-t from-white/60 to-transparent'
        }`}
      />
    </motion.nav>
  );
}

export default BottomNavUltra;
