import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNavUltra } from '@/components/BottomNavUltra';
import { Sidebar } from '@/components/Sidebar';
import { HomeSection } from '@/sections/HomeSection';
import { CartSection } from '@/sections/CartSection';
import { AuthSection } from '@/sections/AuthSection';
import { SupportSectionUltra } from '@/sections/SupportSectionUltra';
import { ProfileSectionUltra } from '@/sections/ProfileSectionUltra';
import { CheckoutSection } from '@/sections/CheckoutSection';
import { ProductDetailSection } from '@/sections/ProductDetailSection';
import { WelcomeModalUltra } from '@/components/WelcomeModalUltra';
import { AuthCallback } from '@/components/AuthCallback';
import { useAppStore } from '@/store/appStore';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { audioService } from '@/lib/audio';
import { AuthService } from '@/lib/supabase-auth';
import { UserService } from '@/lib/supabase';
import { AuthContext } from '@/hooks/useAuth';
import type { AuthUser } from '@/lib/firebase';
import type { UserProfile } from '@/lib/supabase';
import './App.css';

// Search Modal Component
function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { products, addToCart, isDarkMode, soundEnabled } = useAppStore();

  const filtered = products.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddToCart = useCallback((product: any) => {
    addToCart(product, product.tiers[0]?.name || '');
    if (soundEnabled) audioService.playSuccess();
    toast.success(`${product.title} ditambahkan ke keranjang`);
    onClose();
  }, [addToCart, soundEnabled, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 backdrop-blur-sm transition-all duration-300 ${
        isDarkMode ? 'bg-black/70' : 'bg-black/50'
      }`} 
      onClick={onClose}
    >
      <div 
        className={`absolute top-20 left-4 right-4 rounded-2xl shadow-2xl p-4 max-h-[70vh] overflow-auto transform transition-all duration-300 scale-100 ${
          isDarkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="Cari layanan..."
          className={`w-full p-4 border-2 rounded-xl mb-4 text-base transition-all focus:ring-4 focus:ring-blue-500/20 ${
            isDarkMode 
              ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-gray-50 border-gray-200'
          }`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="space-y-2">
          {query && filtered.map(product => (
            <div 
              key={product.id} 
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleAddToCart(product)}
            >
              <img src={product.icon} alt={product.title} className="w-14 h-14 object-cover rounded-lg shadow-md" />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : ''}`}>{product.title}</p>
                <p className="text-xs text-blue-500 font-semibold">Rp {product.base_price.toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))}
          {query && filtered.length === 0 && (
            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
  const { isDarkMode, animationLevel, effectLevel } = useAppStore();
  
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Apply animation level
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--animation-level', animationLevel);
    
    // Apply CSS variables based on animation level
    if (animationLevel === 'off') {
      root.style.setProperty('--transition-duration', '0ms');
      root.style.setProperty('--animation-duration', '0ms');
    } else if (animationLevel === 'v1') {
      root.style.setProperty('--transition-duration', '150ms');
      root.style.setProperty('--animation-duration', '300ms');
    } else if (animationLevel === 'v2') {
      root.style.setProperty('--transition-duration', '300ms');
      root.style.setProperty('--animation-duration', '500ms');
    } else if (animationLevel === 'v3') {
      root.style.setProperty('--transition-duration', '500ms');
      root.style.setProperty('--animation-duration', '800ms');
    }
  }, [animationLevel]);

  // Apply effect level
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--effect-level', effectLevel);
  }, [effectLevel]);

  return <>{children}</>;
}

// Background Music Controller
function BackgroundMusicController() {
  const { musicEnabled } = useAppStore();

  useEffect(() => {
    if (musicEnabled) {
      audioService.playBackgroundMusic();
    } else {
      audioService.stopBackgroundMusic();
    }

    return () => {
      audioService.stopBackgroundMusic();
    };
  }, [musicEnabled]);

  return null;
}

// Auth Provider - Initializes and syncs auth state from Supabase
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, logout } = useAppStore();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  // Initialize auth state on app mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Initializing auth state...');
        
        // Check for existing session
        const response = await AuthService.getSession();
        
        if (response.success && response.data?.user) {
          const session = response.data;
          const supabaseUser = session.user;
          
          console.log('[AuthProvider] Session found:', supabaseUser.email);
          
          // Convert AuthUser from supabase-auth to the format expected by the store
          const authUser: AuthUser = {
            uid: supabaseUser.id,
            email: supabaseUser.email,
            displayName: supabaseUser.full_name || supabaseUser.email?.split('@')[0] || 'User',
            photoURL: supabaseUser.avatar_url || null,
            phoneNumber: supabaseUser.user_metadata?.phone as string || null,
          };
          
          setUser(authUser);

          // Fetch user profile from database
          try {
            const profile = await UserService.getProfile(supabaseUser.id);
            if (profile) {
              setProfile(profile);
            } else {
              // Create profile if doesn't exist
              const newProfile: UserProfile = {
                id: supabaseUser.id,
                email: supabaseUser.email,
                full_name: authUser.displayName || '',
                avatar_url: authUser.photoURL || undefined,
              };
              await UserService.createProfile(newProfile);
              setProfile(newProfile);
            }
          } catch (error) {
            console.error('[AuthProvider] Error fetching/creating profile:', error);
          }
        } else {
          console.log('[AuthProvider] No session found');
        }
      } catch (error) {
        console.error('[AuthProvider] Error initializing auth:', error);
      } finally {
        setIsAuthInitialized(true);
        console.log('[AuthProvider] Auth initialization complete');
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { unsubscribe } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const supabaseUser = session.user;
        
        const authUser: AuthUser = {
          uid: supabaseUser.id,
          email: supabaseUser.email,
          displayName: supabaseUser.full_name || supabaseUser.email?.split('@')[0] || 'User',
          photoURL: supabaseUser.avatar_url || null,
          phoneNumber: supabaseUser.user_metadata?.phone as string || null,
        };
        setUser(authUser);

        // Fetch or create profile
        try {
          let profile = await UserService.getProfile(supabaseUser.id);
          if (!profile) {
            const newProfile: UserProfile = {
              id: supabaseUser.id,
              email: supabaseUser.email,
              full_name: authUser.displayName || '',
              avatar_url: authUser.photoURL || undefined,
            };
            await UserService.createProfile(newProfile);
            profile = newProfile;
          }
          setProfile(profile);
        } catch (error) {
          console.error('[AuthProvider] Error syncing profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      } else if (event === 'USER_UPDATED' && session?.user) {
        const supabaseUser = session.user;
        const authUser: AuthUser = {
          uid: supabaseUser.id,
          email: supabaseUser.email,
          displayName: supabaseUser.full_name || supabaseUser.email?.split('@')[0] || 'User',
          photoURL: supabaseUser.avatar_url || null,
          phoneNumber: supabaseUser.user_metadata?.phone as string || null,
        };
        setUser(authUser);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Update user on token refresh to ensure session stays valid
        const supabaseUser = session.user;
        const authUser: AuthUser = {
          uid: supabaseUser.id,
          email: supabaseUser.email,
          displayName: supabaseUser.full_name || supabaseUser.email?.split('@')[0] || 'User',
          photoURL: supabaseUser.avatar_url || null,
          phoneNumber: supabaseUser.user_metadata?.phone as string || null,
        };
        setUser(authUser);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, setProfile, logout]);

  // Provide auth context to children
  return (
    <AuthContext.Provider value={{ isInitialized: isAuthInitialized }}>
      {isAuthInitialized ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// Main App Component
function App() {
  const { notification, setNotification, isDarkMode, soundEnabled } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  // Don't show header/bottom nav on checkout
  const isCheckout = location.pathname === '/checkout';

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Background Music */}
          <BackgroundMusicController />
          
          {/* Welcome Modal */}
          <WelcomeModalUltra />

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
          <main className={`min-h-screen ${!isCheckout ? 'pt-14 pb-20' : ''}`}>
            <Routes>
              <Route path="/" element={<HomeSection />} />
              <Route path="/product/:productId" element={<ProductDetailSection />} />
              <Route path="/cart" element={<CartSection />} />
              <Route path="/auth" element={<AuthSection />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/support" element={<SupportSectionUltra />} />
              <Route path="/profile" element={<ProfileSectionUltra />} />
              <Route path="/checkout" element={<CheckoutSection />} />
            </Routes>
          </main>

          {/* Bottom Navigation */}
          {!isCheckout && <BottomNavUltra />}

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
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
