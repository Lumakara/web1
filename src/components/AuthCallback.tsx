import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { AuthService } from '@/lib/supabase-auth';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { AuthUser } from '@/lib/firebase';
import type { UserProfile } from '@/lib/supabase';
import { UserService } from '@/lib/supabase';

/**
 * OAuth Callback Handler Component - ULTRA ENHANCED VERSION
 * 
 * This component handles the OAuth callback from providers like Google, GitHub, etc.
 * It's called when the user is redirected back from the OAuth provider after authentication.
 * 
 * IMPORTANT: Supabase OAuth returns tokens in the URL hash fragment (#access_token=...)
 * not in query parameters (?access_token=...). This component handles both cases.
 * 
 * Fixed Issues:
 * - 404 error on auth/callback page
 * - Session not being extracted from URL hash
 * - Profile not being created for new users
 * - Better error handling and user feedback
 */

// Debug logger
const debugLog = (label: string, data?: unknown) => {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log(`[AuthCallback] ${label}`, data || '');
  }
};

export function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setProfile } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'retrying'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double processing
    if (processedRef.current) {
      debugLog('Already processed, skipping...');
      return;
    }

    const handleCallback = async () => {
      try {
        processedRef.current = true;
        debugLog('=== STARTING OAUTH CALLBACK PROCESSING ===');
        debugLog('Full URL:', window.location.href);
        debugLog('Hash:', window.location.hash);
        debugLog('Search:', window.location.search);
        debugLog('Pathname:', window.location.pathname);
        
        setDebugInfo(`Processing OAuth callback...`);

        // Check for error in query params
        const query = window.location.search;
        if (query.includes('error=')) {
          const params = new URLSearchParams(query);
          const error = params.get('error');
          const errorDescription = params.get('error_description');
          throw new Error(errorDescription || error || 'Authentication failed');
        }

        // Check for error in hash fragment
        const hash = window.location.hash;
        if (hash.includes('error=')) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          throw new Error(errorDescription || error || 'Authentication failed');
        }

        // CRITICAL FIX: Wait for Supabase to process the session from URL hash
        // Supabase auth client automatically extracts tokens from URL hash
        // We need to give it time to process
        debugLog('Waiting for Supabase to process session...');
        
        // Try to get session multiple times with increasing delays
        let session = null;
        let sessionError = null;
        
        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 500 + (attempt * 200)));
          
          const result = await supabase.auth.getSession();
          session = result.data.session;
          sessionError = result.error;
          
          debugLog(`Session attempt ${attempt + 1}:`, session ? 'Found' : 'Not found');
          
          if (session?.user) {
            break;
          }
        }
        
        if (sessionError) {
          debugLog('Session error:', sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        if (session?.user) {
          debugLog('Session found for user:', session.user.email);
          
          const user = session.user;
          const fullName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.email?.split('@')[0] || 
                          'Pengguna';
          const avatarUrl = user.user_metadata?.avatar_url || 
                           user.user_metadata?.picture;
          
          // Convert to store format
          const authUser: AuthUser = {
            uid: user.id,
            email: user.email || '',
            displayName: fullName,
            photoURL: avatarUrl || null,
            phoneNumber: user.user_metadata?.phone as string || null,
          };
          
          // Update the store
          setUser(authUser);
          
          // Get or create profile with better error handling
          let profile: UserProfile | null = null;
          let profileRetries = 0;
          
          while (profileRetries < 3) {
            try {
              profile = await UserService.getProfile(user.id);
              
              if (!profile) {
                debugLog('Creating new profile for user:', user.id);
                const newProfile: UserProfile = {
                  id: user.id,
                  email: user.email || '',
                  full_name: fullName,
                  avatar_url: avatarUrl || undefined,
                };
                await UserService.createProfile(newProfile);
                profile = newProfile;
                debugLog('Profile created successfully');
              } else {
                // Update profile with latest OAuth data
                debugLog('Updating existing profile');
                await UserService.updateProfile(user.id, {
                  full_name: fullName,
                  avatar_url: avatarUrl || undefined,
                });
              }
              
              setProfile(profile);
              break;
            } catch (profileError: any) {
              profileRetries++;
              debugLog(`Profile operation failed (attempt ${profileRetries}):`, profileError);
              
              if (profileRetries >= 3) {
                console.warn('[AuthCallback] Failed to create/update profile after retries');
                // Continue anyway - user can still use the app
              } else {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
          }
          
          debugLog('OAuth authentication successful:', authUser.email);
          setStatus('success');
          toast.success('Berhasil masuk dengan Google!');
          
          // Redirect after a short delay to show success state
          setTimeout(() => {
            // Clear the URL hash to remove sensitive tokens
            if (window.history.replaceState) {
              window.history.replaceState(
                {}, 
                document.title, 
                window.location.pathname + window.location.search
              );
            }
            navigate('/profile', { replace: true });
          }, 1500);
          return;
        }
        
        // If we reach here, there's no session
        debugLog('No session found after all attempts');
        
        // Check if there's an access_token in the URL hash
        const hasAccessToken = hash.includes('access_token=');
        if (hasAccessToken) {
          debugLog('Access token found in URL but session not established');
          throw new Error('Token ditemukan tapi sesi tidak berhasil dibuat. Silakan coba login lagi.');
        }
        
        throw new Error('Tidak ada informasi autentikasi yang ditemukan. Silakan coba login lagi.');
        
      } catch (error: any) {
        console.error('[AuthCallback] OAuth callback error:', error);
        debugLog('Error details:', error);
        
        setStatus('error');
        const errorMsg = error.message || 'Gagal masuk dengan OAuth';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        
        // Auto-retry if it's a network error
        if (retryCount < maxRetries && 
            (error.message?.includes('network') || error.message?.includes('timeout'))) {
          setStatus('retrying');
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            processedRef.current = false;
            handleCallback();
          }, 2000);
          return;
        }
        
        // Redirect to auth page after a delay
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 4000);
      }
    };

    handleCallback();
  }, [navigate, setUser, setProfile, retryCount, location]);

  const handleManualRetry = () => {
    processedRef.current = false;
    setStatus('loading');
    setErrorMessage('');
    setRetryCount(0);
    window.location.reload();
  };

  const handleGoToAuth = () => {
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700"
      >
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <Loader2 className="w-20 h-20 text-blue-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                Memproses Login
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Mohon tunggu sebentar, kami sedang menghubungkan akun Anda...
              </p>
              <div className="flex justify-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              </div>
              {debugInfo && (
                <p className="text-xs text-gray-400 mt-4 break-all font-mono">
                  {debugInfo}
                </p>
              )}
            </motion.div>
          )}

          {status === 'retrying' && (
            <motion.div
              key="retrying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <RefreshCw className="w-20 h-20 text-orange-500" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                Mencoba Ulang...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Percobaan ke {retryCount + 1} dari {maxRetries}
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-gray-800 dark:text-white mb-3"
              >
                Berhasil Masuk! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 dark:text-gray-400"
              >
                Selamat datang kembali! Mengalihkan ke halaman profil...
              </motion.p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6"
              >
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                Login Gagal
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage}
              </p>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="text-left text-sm text-orange-800 dark:text-orange-200">
                    <p className="font-semibold mb-1">Solusi yang bisa dicoba:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Periksa koneksi internet Anda</li>
                      <li>Pastikan popup tidak diblokir</li>
                      <li>Coba login dengan metode lain</li>
                      <li>Bersihkan cache browser</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Coba Lagi
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoToAuth}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Ke Login
                </motion.button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Mengalihkan ke halaman login dalam 4 detik...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default AuthCallback;
