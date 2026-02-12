import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  LogOut,
  Edit2,
  Camera,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { OrderService } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';
import { SettingsTab } from '@/components/SettingsTab';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/lib/animations';

// Animated counter component
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const { count, startAnimation } = useCountUp(value, duration);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      startAnimation();
    }
  }, [hasStarted, startAnimation]);

  useEffect(() => {
    setHasStarted(false);
  }, [value]);

  return <span>{count}</span>;
}

// Pull to refresh simulation
function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useState<{ current: number }>({ current: 0 })[0];

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [startYRef]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startYRef.current);
    const dampedDistance = Math.min(distance * 0.5, 100);
    setPullDistance(dampedDistance);
  }, [isPulling, startYRef]);

  const onTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);
    
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [isPulling, pullDistance, onRefresh]);

  return { isPulling, pullDistance, isRefreshing, onTouchStart, onTouchMove, onTouchEnd };
}

// Stat Card Component
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  delay = 0,
  isDarkMode,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  delay?: number;
  isDarkMode: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <Card
        className={cn(
          'border-0 shadow-lg overflow-hidden transition-all duration-200',
          isDarkMode
            ? 'bg-gray-800/80 border border-white/10'
            : 'bg-white/90 border border-black/5',
          isPressed && 'scale-[0.98]'
        )}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              color
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <p className={cn(
              'text-2xl font-bold',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              <AnimatedCounter value={value} />
            </p>
            <p className={cn(
              'text-xs',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              {label}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Order Detail Dialog
function OrderDetailDialog({
  order,
  isOpen,
  onClose,
  isDarkMode,
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}) {
  if (!order) return null;

  const statusConfig = {
    pending: { color: 'bg-yellow-500', label: 'Menunggu', icon: Clock },
    paid: { color: 'bg-blue-500', label: 'Dibayar', icon: CreditCard },
    processing: { color: 'bg-purple-500', label: 'Diproses', icon: RefreshCw },
    completed: { color: 'bg-green-500', label: 'Selesai', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-500', label: 'Dibatalkan', icon: X },
  };

  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-lg p-0 overflow-hidden border-0',
          isDarkMode
            ? 'bg-gray-900 border border-white/10'
            : 'bg-white'
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div
            className={cn(
              'p-6 pb-4',
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={cn(
                  'text-sm',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                )}>
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <h2 className={cn(
                  'text-xl font-bold mt-1',
                  isDarkMode ? 'text-white' : 'text-gray-900'
                )}>
                  Detail Pesanan
                </h2>
              </div>
              <Badge
                className={cn(
                  'px-3 py-1 text-xs font-medium text-white border-0',
                  config.color
                )}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Items */}
            <div className="space-y-3">
              <h3 className={cn(
                'text-sm font-semibold',
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              )}>
                Item Pesanan
              </h3>
              {order.items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl',
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  )}
                >
                  <div>
                    <p className={cn(
                      'font-medium text-sm',
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.title}
                    </p>
                    <p className={cn(
                      'text-xs',
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      Tier: {item.tier}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'font-semibold text-sm',
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    )}>
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                    <p className={cn(
                      'text-xs',
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      x{item.quantity}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div className={cn(
              'h-px',
              isDarkMode ? 'bg-white/10' : 'bg-gray-200'
            )} />

            {/* Order Info */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Tanggal
                </span>
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                  {new Date(order.created_at || '').toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Metode Pembayaran
                </span>
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                  {order.payment_method.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Subtotal
                </span>
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                  Rp {(order.total_amount * 0.9).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  PPN (10%)
                </span>
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
                  Rp {(order.total_amount * 0.1).toLocaleString('id-ID')}
                </span>
              </div>
              <div className={cn(
                'h-px',
                isDarkMode ? 'bg-white/10' : 'bg-gray-200'
              )} />
              <div className="flex justify-between">
                <span className={cn(
                  'font-semibold',
                  isDarkMode ? 'text-white' : 'text-gray-900'
                )}>
                  Total
                </span>
                <span className={cn(
                  'font-bold text-lg',
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                )}>
                  Rp {order.total_amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Order Card Component
function OrderCard({
  order,
  onClick,
  isDarkMode,
  index,
}: {
  order: Order;
  onClick: () => void;
  isDarkMode: boolean;
  index: number;
}) {
  const statusConfig: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
    pending: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-500/20',
      label: 'Menunggu',
      icon: Clock,
    },
    paid: {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-500/20',
      label: 'Dibayar',
      icon: CreditCard,
    },
    processing: {
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-500/20',
      label: 'Diproses',
      icon: RefreshCw,
    },
    completed: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-500/20',
      label: 'Selesai',
      icon: CheckCircle2,
    },
    cancelled: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-500/20',
      label: 'Dibatalkan',
      icon: X,
    },
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
    >
      <Card
        className={cn(
          'border-0 shadow-md cursor-pointer overflow-hidden transition-all duration-200 group',
          isDarkMode
            ? 'bg-gray-800/80 border border-white/10 hover:bg-gray-800'
            : 'bg-white/90 border border-black/5 hover:bg-white'
        )}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className={cn(
                'text-sm font-medium',
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              )}>
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className={cn(
                'text-xs mt-0.5',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )}>
                {new Date(order.created_at || '').toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                'px-2.5 py-1 text-xs font-medium border-0 flex items-center gap-1',
                config.bg,
                config.color
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>
          </div>

          <div className="space-y-1.5 mb-3">
            {order.items.slice(0, 2).map((item, idx) => (
              <p
                key={idx}
                className={cn(
                  'text-sm truncate',
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                )}
              >
                {item.title}{' '}
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                  ({item.tier}) x{item.quantity}
                </span>
              </p>
            ))}
            {order.items.length > 2 && (
              <p className={cn(
                'text-xs',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )}>
                +{order.items.length - 2} item lainnya
              </p>
            )}
          </div>

          <div className={cn(
            'flex justify-between items-center pt-3 border-t',
            isDarkMode ? 'border-white/10' : 'border-gray-100'
          )}>
            <span className={cn(
              'text-xs',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Total
            </span>
            <div className="flex items-center gap-2">
              <span className={cn(
                'font-bold',
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              )}>
                Rp {order.total_amount.toLocaleString('id-ID')}
              </span>
              <ChevronRight className={cn(
                'w-4 h-4 transition-transform group-hover:translate-x-1',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Empty State Animation
function EmptyOrdersState({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'w-24 h-24 rounded-full flex items-center justify-center mb-6',
          isDarkMode
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
            : 'bg-gradient-to-br from-blue-100 to-purple-100'
        )}
      >
        <Package className={cn(
          'w-12 h-12',
          isDarkMode ? 'text-blue-400' : 'text-blue-500'
        )} />
      </motion.div>
      <h3 className={cn(
        'text-lg font-semibold mb-2',
        isDarkMode ? 'text-white' : 'text-gray-900'
      )}>
        Belum Ada Pesanan
      </h3>
      <p className={cn(
        'text-sm text-center max-w-xs mb-6',
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      )}>
        Anda belum memiliki riwayat pesanan. Mulai berbelanja untuk melihat pesanan Anda di sini.
      </p>
      <Link to="/">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className={cn(
              'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg',
              'hover:shadow-xl transition-shadow'
            )}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Mulai Berbelanja
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// Loading Skeleton
function OrdersSkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            'h-32 rounded-xl animate-pulse',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          )}
        />
      ))}
    </div>
  );
}

// Loading State for Auth Check
function AuthLoadingState({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-4',
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        )}
      >
        <Loader2 className={cn(
          'h-8 w-8',
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        )} />
      </motion.div>
      <p className={cn(
        'text-sm',
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      )}>
        Memuat...
      </p>
    </motion.div>
  );
}

// Main Profile Section Component
export function ProfileSectionUltra() {
  const { user, profile, isAuthenticated, isDarkMode } = useAppStore();
  const { isInitialized } = useAuth();
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('orders');

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    if (user?.uid) {
      const userOrders = await OrderService.getByUser(user.uid);
      setOrders(userOrders);
    }
  }, [user?.uid]);

  const { isPulling, pullDistance, isRefreshing, onTouchStart, onTouchMove, onTouchEnd } =
    usePullToRefresh(handleRefresh);

  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
    }
  }, [user?.uid]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const userOrders = await OrderService.getByUser(user!.uid);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const processingOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing'
  ).length;

  // Show loading state while auth is not yet initialized
  // The AuthProvider in App.tsx handles the actual auth initialization
  // We wait until isInitialized is true before showing any auth-related UI
  if (!isInitialized) {
    return <AuthLoadingState isDarkMode={isDarkMode} />;
  }

  // Show not logged in state only when auth is initialized and user is not authenticated
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center mb-4',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          )}
        >
          <User className={cn(
            'h-12 w-12',
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          )} />
        </motion.div>
        <h2 className={cn(
          'text-xl font-semibold mb-2',
          isDarkMode ? 'text-white' : 'text-gray-800'
        )}>
          Belum Masuk
        </h2>
        <p className={cn(
          'text-center mt-2 mb-6 max-w-xs',
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        )}>
          Silakan masuk untuk melihat profil dan riwayat pesanan Anda
        </p>
        <Link to="/auth">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
              Masuk / Daftar
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        'pb-24 px-4 pt-4 min-h-screen transition-colors duration-300',
        isDarkMode ? 'bg-gray-950' : 'bg-gray-50/50'
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: Math.max(pullDistance, isRefreshing ? 60 : 0) }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }}
              transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0 }}
            >
              <RefreshCw className={cn(
                'w-6 h-6',
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              )} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header with Animated Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
        className={cn(
          'rounded-3xl p-6 text-white mb-6 relative overflow-hidden',
          'bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500'
        )}
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 8s ease infinite',
        }}
      >
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, 100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Avatar className="w-24 h-24 border-4 border-white/30 shadow-2xl">
                <AvatarImage
                  src={profile?.avatar_url || user?.photoURL || ''}
                  className="object-cover"
                />
                <AvatarFallback className="bg-white/20 text-white text-3xl font-bold backdrop-blur-sm">
                  {(profile?.full_name || user?.displayName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEditDialog(true)}
              className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera className="h-4 w-4 text-gray-700" />
            </motion.button>
          </div>

          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold"
            >
              {profile?.full_name || user?.displayName}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/70 text-sm"
            >
              {profile?.email || user?.email}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 mt-2"
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span className="text-xs text-white/60">Member Premium</span>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEditDialog(true)}
            className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors"
          >
            <Edit2 className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={ShoppingBag}
          value={orders.length}
          label="Total Pesanan"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0.1}
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={CheckCircle2}
          value={completedOrders}
          label="Selesai"
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          delay={0.2}
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={Clock}
          value={processingOrders}
          label="Diproses"
          color="bg-gradient-to-br from-orange-500 to-amber-600"
          delay={0.3}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={cn(
            'grid w-full grid-cols-2 p-1 rounded-2xl h-auto',
            isDarkMode ? 'bg-gray-800/80' : 'bg-gray-200/50'
          )}
        >
          <TabsTrigger
            value="orders"
            className={cn(
              'rounded-xl py-3 text-sm font-medium transition-all duration-200',
              'data-[state=active]:shadow-lg',
              isDarkMode
                ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-white'
                : 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
            )}
          >
            <Package className="w-4 h-4 mr-2" />
            Pesanan
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className={cn(
              'rounded-xl py-3 text-sm font-medium transition-all duration-200',
              'data-[state=active]:shadow-lg',
              isDarkMode
                ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-white'
                : 'data-[state=active]:bg-white data-[state=active]:text-gray-900'
            )}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Pengaturan
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="orders" className="mt-4">
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoadingOrders ? (
                <OrdersSkeleton isDarkMode={isDarkMode} />
              ) : orders.length === 0 ? (
                <EmptyOrdersState isDarkMode={isDarkMode} />
              ) : (
                <div className="space-y-3">
                  {orders.map((order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => setSelectedOrder(order)}
                      isDarkMode={isDarkMode}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsTab />
              
              {/* Logout Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-6 px-4"
              >
                <Button
                  variant="outline"
                  className={cn(
                    'w-full py-6 rounded-2xl font-medium transition-all duration-200',
                    'border-2 hover:scale-[1.02] active:scale-[0.98]',
                    isDarkMode
                      ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50'
                      : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                  )}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </motion.div>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className={cn(
            'border-0 shadow-2xl',
            isDarkMode
              ? 'bg-gray-900 border border-white/10'
              : 'bg-white'
          )}
        >
          <DialogHeader>
            <DialogTitle className={cn(
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}>
              Edit Profil
            </DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5 mt-4"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-blue-500/20">
                  <AvatarImage
                    src={profile?.avatar_url || user?.photoURL || ''}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                    {(profile?.full_name || user?.displayName || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Nama Lengkap
              </Label>
              <Input
                defaultValue={profile?.full_name || ''}
                className={cn(
                  'rounded-xl h-12',
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                    : 'bg-gray-50 border-gray-200'
                )}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Email
              </Label>
              <Input
                defaultValue={profile?.email || ''}
                disabled
                className={cn(
                  'rounded-xl h-12',
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 text-gray-500'
                    : 'bg-gray-100 border-gray-200 text-gray-500'
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Nomor Telepon
              </Label>
              <Input
                placeholder="Masukkan nomor telepon"
                className={cn(
                  'rounded-xl h-12',
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'
                    : 'bg-gray-50 border-gray-200'
                )}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className={cn(
                  'flex-1 rounded-xl h-12',
                  isDarkMode
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-200'
                )}
                onClick={() => setShowEditDialog(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 rounded-xl h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                onClick={() => setShowEditDialog(false)}
              >
                Simpan
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default ProfileSectionUltra;
