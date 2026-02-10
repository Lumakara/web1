import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Sidebar } from '@/components/Sidebar';
import { HomeSection } from '@/sections/HomeSection';
import { CartSection } from '@/sections/CartSection';
import { AuthSection } from '@/sections/AuthSection';
import { SupportSection } from '@/sections/SupportSection';
import { ProfileSection } from '@/sections/ProfileSection';
import { CheckoutSection } from '@/sections/CheckoutSection';
import { WelcomeModal } from '@/components/WelcomeModal';
import { TutorialModal } from '@/components/TutorialModal';
import { useAppStore } from '@/store/appStore';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { audioService } from '@/lib/audio';
import './App.css';

// Search Modal Component
function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { products, addToCart, isDarkMode, soundEnabled } = useAppStore();

  const filtered = products.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-black/70' : 'bg-black/50'}`} onClick={onClose}>
      <div 
        className={`absolute top-16 left-4 right-4 rounded-xl shadow-2xl p-4 max-h-[70vh] overflow-auto ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="Cari layanan..."
          className={`w-full p-3 border rounded-lg mb-4 ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
          }`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="space-y-2">
          {query && filtered.map(product => (
            <div 
              key={product.id} 
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                addToCart(product, product.tiers[0]?.name || '');
                if (soundEnabled) audioService.playSuccess();
                toast.success(`${product.title} ditambahkan ke keranjang`);
                onClose();
              }}
            >
              <img src={product.icon} alt={product.title} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : ''}`}>{product.title}</p>
                <p className="text-xs text-blue-500">Rp {product.base_price.toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))}
          {query && filtered.length === 0 && (
            <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tidak ada hasil
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Theme Provider Component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useAppStore();
  
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}

// Main App Component
function App() {
  const { notification, setNotification, isDarkMode, soundEnabled, hasSeenTutorial, setHasSeenTutorial } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const location = useLocation();

  // Show notifications
  useEffect(() => {
    if (notification) {
      toast[notification.type](notification.message);
      setNotification(null);
    }
  }, [notification, setNotification]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize audio service
  useEffect(() => {
    audioService.initialize();
  }, []);

  // Show tutorial if not seen
  useEffect(() => {
    if (!hasSeenTutorial && location.pathname === '/') {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial, location.pathname]);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
  };

  // Don't show header/bottom nav on checkout
  const isCheckout = location.pathname === '/checkout';

  return (
    <ThemeProvider>
      <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Welcome Modal */}
        <WelcomeModal />

        {/* Tutorial Modal */}
        <TutorialModal isOpen={showTutorial} onClose={handleTutorialClose} />

        {/* Header */}
        {!isCheckout && (
          <Header 
            onMenuClick={() => {
              if (soundEnabled) audioService.playClick();
              setSidebarOpen(true);
            }} 
            onSearchClick={() => {
              if (soundEnabled) audioService.playClick();
              setSearchOpen(true);
            }}
          />
        )}

        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Search Modal */}
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Main Content */}
        <main className={`min-h-screen ${!isCheckout ? 'pt-14 pb-16' : ''}`}>
          <Routes>
            <Route path="/" element={<HomeSection />} />
            <Route path="/cart" element={<CartSection />} />
            <Route path="/auth" element={<AuthSection />} />
            <Route path="/support" element={<SupportSection />} />
            <Route path="/profile" element={<ProfileSection />} />
            <Route path="/checkout" element={<CheckoutSection />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        {!isCheckout && <BottomNav />}

        {/* Toast notifications */}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: isDarkMode ? '#1f2937' : '#fff',
              color: isDarkMode ? '#fff' : '#000',
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
