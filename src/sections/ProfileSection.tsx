import { useState, useEffect } from 'react';
import { User, MapPin, Package, CreditCard, LogOut, Edit2, Camera, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { OrderService } from '@/lib/supabase';
import type { Order } from '@/lib/supabase';
import { Link } from 'react-router-dom';

export function ProfileSection() {
  const { user, profile, isAuthenticated } = useAppStore();
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <User className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Belum Masuk</h2>
        <p className="text-gray-500 text-center mt-2 mb-6">
          Silakan masuk untuk melihat profil dan riwayat pesanan Anda
        </p>
        <Link to="/auth">
          <Button className="bg-gradient-to-r from-blue-600 to-orange-500">
            Masuk / Daftar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-white">
              <AvatarImage src={profile?.avatar_url || user?.photoURL || ''} />
              <AvatarFallback className="bg-white text-blue-600 text-2xl font-bold">
                {(profile?.full_name || user?.displayName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button 
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
              onClick={() => setShowEditDialog(true)}
            >
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{profile?.full_name || user?.displayName}</h2>
            <p className="text-white/80 text-sm">{profile?.email || user?.email}</p>

          </div>
          <button 
            onClick={() => setShowEditDialog(true)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            <p className="text-xs text-gray-500">Total Pesanan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'completed').length}
            </p>
            <p className="text-xs text-gray-500">Selesai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
            </p>
            <p className="text-xs text-gray-500">Diproses</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Pesanan Saya</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          {isLoadingOrders ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada pesanan</p>
              <Link to="/">
                <Button variant="outline" className="mt-3">
                  Mulai Berbelanja
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-3">
          <Card>
            <CardContent className="p-0">
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Edit Profil</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
              <div className="h-px bg-gray-100 mx-4" />
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <span>Metode Pembayaran</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
              <div className="h-px bg-gray-100 mx-4" />
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <span>Alamat</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input defaultValue={profile?.full_name || ''} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={profile?.email || ''} disabled />
            </div>

            <Button className="w-full bg-blue-600">Simpan Perubahan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    paid: 'Dibayar',
    processing: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm text-gray-500">#{order.id.slice(0, 8)}</p>
            <p className="text-xs text-gray-400">
              {new Date(order.created_at || '').toLocaleDateString('id-ID')}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>
        
        <div className="space-y-1 mb-3">
          {order.items.slice(0, 2).map((item, idx) => (
            <p key={idx} className="text-sm truncate">
              {item.title} ({item.tier}) x{item.quantity}
            </p>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-gray-500">+{order.items.length - 2} item lainnya</p>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t">
          <p className="text-sm text-gray-500">Total</p>
          <p className="font-bold text-blue-600">
            Rp {order.total_amount.toLocaleString('id-ID')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
