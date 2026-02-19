import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Package,
  LogOut,
  Edit2,
  Camera,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
  Sparkles,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield,
  Award,
  TrendingUp,
  Heart,
  Settings,
  Bell,
  Lock,
  Trash2,
  ChevronLeft,
  QrCode,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { OrderService } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

// Quick Stats Card
function QuickStatCard({ 
  icon: Icon, 
  value, 
  label, 
  trend,
  color,
  delay = 0,
  isDarkMode 
}: { 
  icon: React.ElementType; 
  value: string | number; 
  label: string;
  trend?: string;
  color: string;
  delay?: number;
  isDarkMode: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring' }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        "p-4 rounded-2xl border transition-all cursor-pointer",
        isDarkMode 
          ? "bg-gray-800/50 border-gray-700 hover:border-gray-600" 
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.startsWith('+') 
              ? "bg-green-100 text-green-700" 
              : "bg-gray-100 text-gray-600"
          )}>
            {trend}
          </span>
        )}
      </div>
      <p className={cn(
        "text-2xl font-bold mt-3",
        isDarkMode ? "text-white" : "text-gray-900"
      )}>
        {value}
      </p>
      <p className={cn(
        "text-sm",
        isDarkMode ? "text-gray-400" : "text-gray-500"
      )}>
        {label}
      </p>
    </motion.div>
  );
}

// Order Status Badge
function OrderStatusBadge({ status, isDarkMode }: { status: string; isDarkMode: boolean }) {
  const configs: Record<string, { color: string; bg: string; label: string; icon: React.ElementType }> = {
    pending: { 
      color: 'text-yellow-700', 
      bg: 'bg-yellow-100', 
      label: 'Menunggu',
      icon: Clock 
    },
    paid: { 
      color: 'text-blue-700', 
      bg: 'bg-blue-100', 
      label: 'Dibayar',
      icon: CreditCard 
    },
    processing: { 
      color: 'text-purple-700', 
      bg: 'bg-purple-100', 
      label: 'Diproses',
      icon: Loader2 
    },
    completed: { 
      color: 'text-green-700', 
      bg: 'bg-green-100', 
      label: 'Selesai',
      icon: CheckCircle2 
    },
    cancelled: { 
      color: 'text-red-700', 
      bg: 'bg-red-100', 
      label: 'Dibatalkan',
      icon: X 
    },
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
      config.bg,
      config.color
    )}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}

// Order Card Component
function OrderCard({ 
  order, 
  onClick, 
  isDarkMode,
  index 
}: { 
  order: Order; 
  onClick: () => void; 
  isDarkMode: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border cursor-pointer transition-all",
        isDarkMode 
          ? "bg-gray-800/50 border-gray-700 hover:border-gray-600" 
          : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={cn(
            "text-sm font-medium",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className={cn(
            "text-xs mt-0.5",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )}>
            {new Date(order.created_at || '').toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} isDarkMode={isDarkMode} />
      </div>

      <div className="space-y-2 mb-3">
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            )}>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                {item.title}
              </p>
              <p className={cn(
                "text-xs",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}>
                {item.tier} × {item.quantity}
              </p>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className={cn(
            "text-xs pl-13",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )}>
            +{order.items.length - 2} item lainnya
          </p>
        )}
      </div>

      <div className={cn(
        "flex items-center justify-between pt-3 border-t",
        isDarkMode ? "border-gray-700" : "border-gray-100"
      )}>
        <span className={cn(
          "text-sm",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          Total
        </span>
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold",
            isDarkMode ? "text-blue-400" : "text-blue-600"
          )}>
            Rp {order.total_amount.toLocaleString('id-ID')}
          </span>
          <ChevronRight className={cn(
            "w-4 h-4",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )} />
        </div>
      </div>
    </motion.div>
  );
}

// Order Detail Modal
function OrderDetailModal({ 
  order, 
  isOpen, 
  onClose, 
  isDarkMode 
}: { 
  order: Order | null; 
  isOpen: boolean; 
  onClose: () => void; 
  isDarkMode: boolean;
}) {
  if (!order) return null;

  const timeline = [
    { status: 'pending', label: 'Pesanan Dibuat', date: order.created_at },
    { status: 'paid', label: 'Pembayaran Diterima', date: order.status !== 'pending' ? order.created_at : null },
    { status: 'processing', label: 'Sedang Diproses', date: ['processing', 'completed'].includes(order.status) ? order.created_at : null },
    { status: 'completed', label: 'Pesanan Selesai', date: order.status === 'completed' ? order.created_at : null },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0",
        isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white"
      )}>
        {/* Header */}
        <div className={cn(
          "p-6 border-b",
          isDarkMode ? "border-gray-800" : "border-gray-100"
        )}>
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <DialogTitle className={cn(
                  "text-xl mt-1",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  Detail Pesanan
                </DialogTitle>
              </div>
              <OrderStatusBadge status={order.status} isDarkMode={isDarkMode} />
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Timeline */}
          <div className="space-y-4">
            <h4 className={cn(
              "text-sm font-semibold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Status Pesanan
            </h4>
            <div className="space-y-0">
              {timeline.map((step, idx) => {
                const isActive = step.date !== null;
                const isLast = idx === timeline.length - 1;
                
                return (
                  <div key={step.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2",
                        isActive 
                          ? "bg-blue-500 border-blue-500" 
                          : isDarkMode ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300"
                      )} />
                      {!isLast && (
                        <div className={cn(
                          "w-0.5 h-8 mt-1",
                          isActive && timeline[idx + 1]?.date
                            ? "bg-blue-500"
                            : isDarkMode ? "bg-gray-700" : "bg-gray-200"
                        )} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={cn(
                        "text-sm font-medium",
                        isActive 
                          ? isDarkMode ? "text-white" : "text-gray-900"
                          : isDarkMode ? "text-gray-500" : "text-gray-400"
                      )}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className={cn(
                          "text-xs mt-0.5",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {new Date(step.date).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className={isDarkMode ? "bg-gray-800" : "bg-gray-100"} />

          {/* Items */}
          <div className="space-y-4">
            <h4 className={cn(
              "text-sm font-semibold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Item Pesanan
            </h4>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl",
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    isDarkMode ? "bg-gray-700" : "bg-white"
                  )}>
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      {item.title}
                    </p>
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {item.tier} × {item.quantity}
                    </p>
                  </div>
                  <p className={cn(
                    "font-semibold",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator className={isDarkMode ? "bg-gray-800" : "bg-gray-100"} />

          {/* Payment Summary */}
          <div className="space-y-3">
            <h4 className={cn(
              "text-sm font-semibold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              Ringkasan Pembayaran
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Subtotal</span>
                <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                  Rp {Math.floor(order.total_amount * 0.9).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>PPN (10%)</span>
                <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                  Rp {Math.floor(order.total_amount * 0.1).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Metode</span>
                <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                  {order.payment_method.toUpperCase()}
                </span>
              </div>
              <Separator className={isDarkMode ? "bg-gray-800" : "bg-gray-100"} />
              <div className="flex justify-between">
                <span className={cn(
                  "font-semibold",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  Total
                </span>
                <span className={cn(
                  "font-bold text-lg",
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                )}>
                  Rp {order.total_amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "p-6 border-t flex gap-3",
          isDarkMode ? "border-gray-800" : "border-gray-100"
        )}>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
          >
            Tutup
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Share2 className="w-4 h-4 mr-2" />
            Bagikan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Empty State
function EmptyOrders({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mb-6",
          isDarkMode 
            ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20" 
            : "bg-gradient-to-br from-blue-100 to-purple-100"
        )}
      >
        <ShoppingBag className={cn(
          "w-12 h-12",
          isDarkMode ? "text-blue-400" : "text-blue-500"
        )} />
      </motion.div>
      <h3 className={cn(
        "text-lg font-semibold mb-2",
        isDarkMode ? "text-white" : "text-gray-900"
      )}>
        Belum Ada Pesanan
      </h3>
      <p className={cn(
        "text-sm text-center max-w-xs mb-6",
        isDarkMode ? "text-gray-400" : "text-gray-500"
      )}>
        Mulai berbelanja untuk melihat riwayat pesanan Anda di sini
      </p>
      <Link to="/">
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Mulai Berbelanja
        </Button>
      </Link>
    </motion.div>
  );
}

// Edit Profile Modal
function EditProfileModal({
  isOpen,
  onClose,
  isDarkMode,
  user,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  user: any;
  onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phone: '',
    bio: '',
    location: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-md",
        isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white"
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            Edit Profil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-blue-500/20">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {(user?.displayName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button className={cn(
                "absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2",
                isDarkMode 
                  ? "bg-gray-800 border-gray-700 text-gray-300" 
                  : "bg-white border-gray-200 text-gray-600"
              )}>
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <p className={cn(
              "text-xs mt-2",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Ketuk untuk ubah foto
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={isDarkMode ? "text-gray-300" : ""}>Nama Lengkap</Label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className={cn(
                  isDarkMode 
                    ? "bg-gray-800 border-gray-700 text-white" 
                    : ""
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? "text-gray-300" : ""}>Nomor Telepon</Label>
              <Input
                placeholder="+62 xxx-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={cn(
                  isDarkMode 
                    ? "bg-gray-800 border-gray-700 text-white" 
                    : ""
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? "text-gray-300" : ""}>Lokasi</Label>
              <Input
                placeholder="Kota, Indonesia"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={cn(
                  isDarkMode 
                    ? "bg-gray-800 border-gray-700 text-white" 
                    : ""
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? "text-gray-300" : ""}>Bio</Label>
              <Input
                placeholder="Ceritakan sedikit tentang Anda"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className={cn(
                  isDarkMode 
                    ? "bg-gray-800 border-gray-700 text-white" 
                    : ""
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export function ProfileSectionUltra() {
  const { user, isAuthenticated, isDarkMode } = useAppStore();
  const { signOut, updateProfile } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.uid) {
      fetchOrders();
    } else {
      setIsLoadingOrders(false);
    }
  }, [user?.uid]);

  const fetchOrders = async () => {
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

  const handleSaveProfile = async (data: any) => {
    try {
      await updateProfile({ displayName: data.displayName });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Stats calculation
  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    processingOrders: orders.filter(o => ['pending', 'processing'].includes(o.status)).length,
    totalSpent: orders.reduce((sum, o) => sum + o.total_amount, 0),
    memberSince: user?.createdAt 
      ? new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      : 'Baru'
  };

  if (!mounted) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDarkMode ? "bg-gray-950" : "bg-gray-50"
      )}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not logged in state
  if (!isAuthenticated) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col items-center justify-center px-4",
        isDarkMode ? "bg-gray-950" : "bg-gray-50"
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className={cn(
            "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6",
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          )}>
            <User className={cn(
              "w-12 h-12",
              isDarkMode ? "text-gray-600" : "text-gray-400"
            )} />
          </div>
          <h2 className={cn(
            "text-2xl font-bold mb-2",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            Belum Masuk
          </h2>
          <p className={cn(
            "mb-6 max-w-xs",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )}>
            Silakan masuk untuk melihat profil dan riwayat pesanan Anda
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Masuk / Daftar
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen pb-24",
      isDarkMode ? "bg-gray-950" : "bg-gray-50"
    )}>
      {/* Hero Profile Header */}
      <div className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500"
      )}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative px-4 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center md:items-end gap-6"
            >
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-white/30 shadow-2xl">
                    <AvatarImage src={user?.photoURL || ''} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold bg-white/20 text-white backdrop-blur-sm">
                      {(user?.displayName || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEditProfile(true)}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Camera className="w-5 h-5 text-gray-700" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Info */}
              <div className="text-center md:text-left flex-1">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center md:justify-start gap-2 mb-1"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-white/80 text-sm font-medium">Member Premium</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white"
                >
                  {user?.displayName || 'Pengguna'}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/70"
                >
                  {user?.email}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-white/60"
                >
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Bergabung {stats.memberSince}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Indonesia
                  </span>
                </motion.div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-2"
              >
                <Button
                  variant="secondary"
                  className="bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-sm"
                  onClick={() => setShowEditProfile(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profil
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <QuickStatCard
              icon={ShoppingBag}
              value={stats.totalOrders}
              label="Total Pesanan"
              trend="+12%"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              delay={0.1}
              isDarkMode={isDarkMode}
            />
            <QuickStatCard
              icon={CheckCircle2}
              value={stats.completedOrders}
              label="Selesai"
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              delay={0.2}
              isDarkMode={isDarkMode}
            />
            <QuickStatCard
              icon={Clock}
              value={stats.processingOrders}
              label="Diproses"
              color="bg-gradient-to-br from-orange-500 to-amber-600"
              delay={0.3}
              isDarkMode={isDarkMode}
            />
            <QuickStatCard
              icon={TrendingUp}
              value={`Rp ${(stats.totalSpent / 1000000).toFixed(1)}M`}
              label="Total Belanja"
              color="bg-gradient-to-br from-purple-500 to-pink-600"
              delay={0.4}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 mt-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={cn(
              "w-full md:w-auto grid grid-cols-3 md:inline-flex p-1 rounded-xl",
              isDarkMode ? "bg-gray-800" : "bg-gray-200/50"
            )}>
              <TabsTrigger 
                value="overview" 
                className={cn(
                  "rounded-lg data-[state=active]:shadow-md",
                  isDarkMode 
                    ? "data-[state=active]:bg-gray-700 data-[state=active]:text-white" 
                    : "data-[state=active]:bg-white"
                )}
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Profil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className={cn(
                  "rounded-lg data-[state=active]:shadow-md",
                  isDarkMode 
                    ? "data-[state=active]:bg-gray-700 data-[state=active]:text-white" 
                    : "data-[state=active]:bg-white"
                )}
              >
                <Package className="w-4 h-4 mr-2" />
                Pesanan
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className={cn(
                  "rounded-lg data-[state=active]:shadow-md",
                  isDarkMode 
                    ? "data-[state=active]:bg-gray-700 data-[state=active]:text-white" 
                    : "data-[state=active]:bg-white"
                )}
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Pengaturan</span>
                <span className="sm:hidden">Setting</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-6 rounded-2xl border",
                    isDarkMode 
                      ? "bg-gray-800/50 border-gray-700" 
                      : "bg-white border-gray-200 shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={cn(
                      "font-semibold",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      Informasi Pribadi
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowEditProfile(true)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      )}>
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>Nama</p>
                        <p className={cn(
                          "font-medium",
                          isDarkMode ? "text-white" : "text-gray-900"
                        )}>{user?.displayName || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      )}>
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>Email</p>
                        <p className={cn(
                          "font-medium",
                          isDarkMode ? "text-white" : "text-gray-900"
                        )}>{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      )}>
                        <Shield className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>Status Akun</p>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-gray-900"
                          )}>
                            Terverifikasi
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "p-6 rounded-2xl border",
                    isDarkMode 
                      ? "bg-gray-800/50 border-gray-700" 
                      : "bg-white border-gray-200 shadow-sm"
                  )}
                >
                  <h3 className={cn(
                    "font-semibold mb-4",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    Pesanan Terbaru
                  </h3>
                  {orders.slice(0, 3).map((order, idx) => (
                    <div 
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors",
                        isDarkMode 
                          ? "hover:bg-gray-700/50" 
                          : "hover:bg-gray-50",
                        idx !== 0 && (isDarkMode ? "border-t border-gray-700" : "border-t border-gray-100")
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      )}>
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium truncate",
                          isDarkMode ? "text-white" : "text-gray-900"
                        )}>
                          {order.items[0]?.title}
                        </p>
                        <p className={cn(
                          "text-xs",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {new Date(order.created_at || '').toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )} />
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className={cn(
                      "text-center py-8",
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      Belum ada pesanan
                    </p>
                  )}
                  {orders.length > 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full mt-3"
                      onClick={() => setActiveTab('orders')}
                    >
                      Lihat Semua
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </motion.div>
              </div>

              {/* Membership Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "p-6 rounded-2xl relative overflow-hidden",
                  "bg-gradient-to-r from-blue-600 to-purple-600"
                )}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-yellow-300" />
                      <span className="text-white/80 text-sm font-medium">Member Premium</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      Level {Math.min(Math.floor(stats.totalSpent / 1000000) + 1, 10)}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {stats.totalSpent > 0 
                        ? `Rp ${(1000000 - (stats.totalSpent % 1000000)).toLocaleString('id-ID')} lagi ke level berikutnya`
                        : 'Mulai berbelanja untuk naik level'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                      <span className="text-2xl font-bold text-white">
                        {Math.min(Math.floor(stats.totalSpent / 1000000) + 1, 10)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${((stats.totalSpent % 1000000) / 1000000) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              {isLoadingOrders ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : orders.length === 0 ? (
                <EmptyOrders isDarkMode={isDarkMode} />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
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
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl border",
                  isDarkMode 
                    ? "bg-gray-800/50 border-gray-700" 
                    : "bg-white border-gray-200 shadow-sm"
                )}
              >
                <h3 className={cn(
                  "font-semibold mb-4",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  Keamanan Akun
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="w-4 h-4 mr-3" />
                    Ubah Password
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 mr-3" />
                    Notifikasi
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "p-4 rounded-2xl border",
                  isDarkMode 
                    ? "bg-gray-800/50 border-gray-700" 
                    : "bg-white border-gray-200 shadow-sm"
                )}
              >
                <h3 className={cn(
                  "font-semibold mb-4 text-red-500",
                  isDarkMode ? "text-red-400" : "text-red-600"
                )}>
                  Zona Berbahaya
                </h3>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar dari Akun
                </Button>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        isDarkMode={isDarkMode}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        isDarkMode={isDarkMode}
        user={user}
        onSave={handleSaveProfile}
      />
    </div>
  );
}

export default ProfileSectionUltra;
