import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Menu,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Plus,
  Edit3,
  Trash2,
  Check,
  RefreshCw,
  Bell,
  Moon,
  Sun,
  Music,
  Volume2,
  VolumeX,
  BarChart3,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/useProducts';
import { OrderService, TicketService, type Product, type Order, type SupportTicket } from '@/lib/supabase';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from 'recharts';

// Admin credentials
const ADMIN_EMAIL = 'admin@lumakara.com';
const ADMIN_PASSWORD = 'admin123';



function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);


  // Check if already logged in
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession === 'true') {
      setIsLoggedIn(true);
    }
    const savedTheme = localStorage.getItem('admin_dark_mode');
    if (savedTheme === 'true') setIsDarkMode(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      localStorage.setItem('admin_session', 'true');
      setIsLoggedIn(true);
      toast.success('Login berhasil! Selamat datang di Admin Dashboard');
    } else {
      setLoginError('Email atau password salah');
      toast.error('Login gagal! Periksa kredensial Anda');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsLoggedIn(false);
    setLoginEmail('');
    setLoginPassword('');
    toast.success('Logout berhasil');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('admin_dark_mode', (!isDarkMode).toString());
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20" />
        <Card className="w-full max-w-md relative z-10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl font-bold">A</span>
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-gray-500">Layanan Digital Dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="admin@lumakara.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
                Masuk
              </Button>
            </form>
            <div className="mt-4 text-center">
              <a href="/" className="text-sm text-blue-600 hover:underline">
                ← Kembali ke Website
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent isDarkMode={isDarkMode} />;
      case 'products':
        return <ProductsContent isDarkMode={isDarkMode} />;
      case 'orders':
        return <OrdersContent isDarkMode={isDarkMode} />;
      case 'tickets':
        return <TicketsContent isDarkMode={isDarkMode} />;
      case 'analytics':
        return <AnalyticsContent isDarkMode={isDarkMode} />;
      case 'settings':
        return <SettingsContent isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
      default:
        return <DashboardContent isDarkMode={isDarkMode} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'orders', label: 'Pesanan', icon: ShoppingCart },
    { id: 'tickets', label: 'Tiket', icon: AlertCircle },
    { id: 'analytics', label: 'Analitik', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const sidebarClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgClass} flex`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${sidebarClass} shadow-lg transform transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static border-r`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div>
              <h2 className={`font-bold ${textClass}`}>Admin Panel</h2>
              <p className="text-xs text-gray-500">Layanan Digital</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Header */}
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm p-4 flex items-center justify-between border-b`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className={`p-2 rounded-lg relative ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className={`hidden sm:block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Dashboard Content
function DashboardContent({ isDarkMode }: { isDarkMode: boolean }) {
  const { products } = useProducts();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalTickets: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    newTickets: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [orders, tickets] = await Promise.all([
        OrderService.getAll(),
        TicketService.getAll(),
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at || '');
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }).length;
      const newTickets = tickets.filter(t => t.status === 'open').length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalTickets: tickets.length,
        pendingOrders,
        completedOrders,
        todayOrders,
        newTickets,
      });

      setRecentOrders(orders.slice(0, 5));

      // Generate chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const chartData = last7Days.map(date => {
        const dayOrders = orders.filter(o => {
          const orderDate = new Date(o.created_at || '');
          return orderDate.toDateString() === date.toDateString();
        });
        return {
          name: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + o.total_amount, 0),
        };
      });
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Pendapatan', value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, icon: DollarSign, color: 'from-green-500 to-emerald-500', change: '+12%' },
    { title: 'Total Pesanan', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'from-blue-500 to-cyan-500', change: '+5%' },
    { title: 'Produk', value: stats.totalProducts.toString(), icon: Package, color: 'from-purple-500 to-violet-500', change: '0%' },
    { title: 'Tiket Baru', value: stats.newTickets.toString(), icon: AlertCircle, color: 'from-orange-500 to-red-500', change: stats.newTickets > 0 ? '!' : '' },
  ];

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>Dashboard</h1>
          <p className={subTextClass}>Selamat datang kembali, Admin!</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className={`${bgCard} overflow-hidden`}>
            <CardContent className="p-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <p className={`text-2xl font-bold ${textClass}`}>{stat.value}</p>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${subTextClass}`}>{stat.title}</p>
                {stat.change && stat.change !== '0%' && (
                  <span className={`text-xs ${stat.change.includes('+') ? 'text-green-500' : stat.change === '!' ? 'text-red-500' : 'text-gray-500'}`}>
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Grafik Pesanan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Pendapatan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Order Status & Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-2xl font-bold text-yellow-500">{stats.pendingOrders}</p>
                <p className="text-sm text-yellow-600">Menunggu</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">
                  {recentOrders.filter(o => o.status === 'processing').length}
                </p>
                <p className="text-sm text-blue-600">Diproses</p>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-500">{stats.completedOrders}</p>
                <p className="text-sm text-green-600">Selesai</p>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                <p className="text-2xl font-bold text-purple-500">{stats.todayOrders}</p>
                <p className="text-sm text-purple-600">Hari Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={bgCard}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={textClass}>Pesanan Terbaru</CardTitle>
            <Button variant="ghost" size="sm">Lihat Semua</Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-12 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className={`text-center py-4 ${subTextClass}`}>Belum ada pesanan</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div>
                      <p className={`font-medium text-sm ${textClass}`}>#{order.id.slice(0, 8)}</p>
                      <p className={`text-xs ${subTextClass}`}>
                        {new Date(order.created_at || '').toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${textClass}`}>
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Products Content
function ProductsContent({ isDarkMode }: { isDarkMode: boolean }) {
  const { products, isLoading, updateProduct, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);


  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveProduct = async (updates: Partial<Product>) => {
    if (editingProduct) {
      try {
        await updateProduct(editingProduct.id, updates);
        toast.success('Produk berhasil diupdate');
        setShowEditDialog(false);
        setEditingProduct(null);
      } catch (error) {
        toast.error('Gagal mengupdate produk');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(id);
        toast.success('Produk berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus produk');
      }
    }
  };

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className={`text-2xl font-bold ${textClass}`}>Kelola Produk</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => toast.info('Fitur tambah produk segera hadir!')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-40 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Tidak ada produk</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`${bgCard} overflow-hidden group`}>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setEditingProduct(product); setShowEditDialog(true); }}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {product.discount_price && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      -{Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)}%
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className={`font-medium ${textClass}`}>{product.title}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-blue-600 font-bold">
                      Rp {(product.discount_price || product.base_price).toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className={product.stock > 10 ? 'text-green-600' : 'text-red-600'}>
                      Stok: {product.stock}
                    </span>
                    <span className="text-gray-500">{product.reviews} ulasan</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className={`max-w-lg ${isDarkMode ? 'bg-gray-900 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Edit Produk</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input defaultValue={editingProduct.title} id="edit-title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Harga</Label>
                  <Input type="number" defaultValue={editingProduct.base_price} id="edit-price" />
                </div>
                <div className="space-y-2">
                  <Label>Harga Diskon</Label>
                  <Input type="number" defaultValue={editingProduct.discount_price || ''} id="edit-discount" placeholder="Opsional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stok</Label>
                  <Input type="number" defaultValue={editingProduct.stock} id="edit-stock" />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Input type="number" step="0.1" min="0" max="5" defaultValue={editingProduct.rating} id="edit-rating" />
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => handleSaveProduct({
                  title: (document.getElementById('edit-title') as HTMLInputElement).value,
                  base_price: Number((document.getElementById('edit-price') as HTMLInputElement).value),
                  discount_price: Number((document.getElementById('edit-discount') as HTMLInputElement).value) || undefined,
                  stock: Number((document.getElementById('edit-stock') as HTMLInputElement).value),
                  rating: Number((document.getElementById('edit-rating') as HTMLInputElement).value),
                })}
              >
                Simpan Perubahan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Orders Content
function OrdersContent({ isDarkMode }: { isDarkMode: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await OrderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await OrderService.updateStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Status pesanan diupdate');
    } catch (error) {
      toast.error('Gagal mengupdate status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className={`text-2xl font-bold ${textClass}`}>Kelola Pesanan</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Cari pesanan..."
            className="w-full sm:w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="paid">Dibayar</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-20 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className={bgCard}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <p className={`font-medium ${textClass}`}>#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at || '').toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.items.length} item • Rp {order.total_amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleUpdateStatus(order.id, value as Order['status'])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="paid">Dibayar</SelectItem>
                        <SelectItem value="processing">Diproses</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Tickets Content
function TicketsContent({ isDarkMode }: { isDarkMode: boolean }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await TicketService.getAll();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      await TicketService.updateStatus(ticketId, status);
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status } : t));
      toast.success('Status tiket diupdate');
    } catch (error) {
      toast.error('Gagal mengupdate status');
    }
  };

  const filteredTickets = tickets.filter(t => 
    statusFilter === 'all' || t.status === statusFilter
  );

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
  };

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${textClass}`}>Tiket Dukungan</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-24 rounded-lg animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className={`h-12 w-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Belum ada tiket</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className={bgCard}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${textClass}`}>{ticket.subject}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{ticket.category}</p>
                    <p className="text-sm text-gray-600 mt-1">{ticket.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ticket.created_at || '').toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => handleUpdateStatus(ticket.id, value as SupportTicket['status'])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Analytics Content
function AnalyticsContent({ isDarkMode }: { isDarkMode: boolean }) {
  const [salesData] = useState([
    { name: 'Instalasi', value: 35, color: '#3B82F6' },
    { name: 'Kreatif', value: 25, color: '#F97316' },
    { name: 'Teknis', value: 40, color: '#10B981' },
  ]);

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${textClass}`}>Analitik</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Penjualan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {salesData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-500">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Performa Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className={`font-medium ${textClass}`}>Pendapatan Bulan Ini</p>
                  <p className="text-2xl font-bold text-green-600">Rp 12.450.000</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className={`font-medium ${textClass}`}>Total Pesanan</p>
                  <p className="text-2xl font-bold text-blue-600">156</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <p className={`font-medium ${textClass}`}>Pelanggan Baru</p>
                  <p className="text-2xl font-bold text-purple-600">24</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Settings Content
function SettingsContent({ isDarkMode, toggleDarkMode }: { isDarkMode: boolean; toggleDarkMode: () => void }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);

  const bgCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold ${textClass}`}>Pengaturan</h1>
      
      <div className="grid gap-6">
        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Tampilan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <div>
                  <p className={`font-medium ${textClass}`}>Mode Gelap</p>
                  <p className="text-sm text-gray-500">Ubah tampilan ke mode gelap</p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Audio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                <div>
                  <p className={`font-medium ${textClass}`}>Efek Suara</p>
                  <p className="text-sm text-gray-500">Aktifkan efek suara klik</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5" />
                <div>
                  <p className={`font-medium ${textClass}`}>Musik Latar</p>
                  <p className="text-sm text-gray-500">Aktifkan musik latar</p>
                </div>
              </div>
              <Switch checked={musicEnabled} onCheckedChange={setMusicEnabled} />
            </div>
          </CardContent>
        </Card>

        <Card className={bgCard}>
          <CardHeader>
            <CardTitle className={textClass}>Integrasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Supabase', desc: 'Database & Storage', status: 'connected' },
              { name: 'Firebase Auth', desc: 'Authentication', status: 'connected' },
              { name: 'Pakasir Payment', desc: 'Payment Gateway', status: 'connected' },
              { name: 'Telegram Bot', desc: 'Notifications', status: 'connected' },
              { name: 'EmailJS', desc: 'Email Service', status: 'connected' },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div>
                  <p className={`font-medium ${textClass}`}>{integration.name}</p>
                  <p className="text-sm text-gray-500">{integration.desc}</p>
                </div>
                <span className="text-green-600 text-sm flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Terhubung
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminApp;
