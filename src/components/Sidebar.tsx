import { X, Home, ShoppingBag, User, Headphones, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { 
    user, 
    profile, 
    isAuthenticated, 
    isDarkMode, 
  } = useAppStore();
  
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  const handleNavClick = () => {
    onClose();
  };

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home, path: '/' },
    { id: 'cart', label: 'Keranjang', icon: ShoppingBag, path: '/cart' },
    { id: 'support', label: 'Bantuan', icon: Headphones, path: '/support' },
    { id: 'profile', label: 'Profil Saya', icon: User, path: '/profile' },
  ];

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverClass = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 ${bgClass} z-50 shadow-xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className={`font-semibold text-lg ${textClass}`}>Layanan Digital</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className={isDarkMode ? 'text-white' : ''}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        {isAuthenticated && (
          <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-50 to-orange-50'}`}>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow">
                <AvatarImage src={profile?.avatar_url || user?.photoURL || ''} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {(profile?.full_name || user?.displayName || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${textClass}`}>{profile?.full_name || user?.displayName}</p>
                <p className={`text-sm truncate ${subTextClass}`}>{profile?.email || user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 w-full p-3 rounded-lg ${hoverClass} transition-colors text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <Icon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Admin Link */}
          <a
            href="/admin"
            onClick={handleNavClick}
            className={`flex items-center gap-3 w-full p-3 rounded-lg ${hoverClass} transition-colors text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <Shield className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span>Admin Dashboard</span>
          </a>
        </nav>

        {/* Footer */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${borderClass} ${bgClass}`}>
          {isAuthenticated ? (
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          ) : (
            <Link to="/auth" onClick={handleNavClick}>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
                Masuk / Daftar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
