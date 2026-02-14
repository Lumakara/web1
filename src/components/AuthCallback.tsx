/**
 * Auth Callback Component
 * 
 * Firebase Auth menggunakan popup-based authentication,
 * jadi komponen ini sekarang hanya sebagai redirect handler
 * untuk backward compatibility dengan URL /auth/callback
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Firebase menggunakan popup, jadi tidak perlu callback handling
    // Redirect langsung ke home setelah 1 detik
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Mengalihkan...</p>
      </motion.div>
    </div>
  );
}

export default AuthCallback;
