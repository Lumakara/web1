import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { AuthService } from '@/lib/supabase-auth';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';
import type { AuthUser } from '@/lib/firebase';
import type { UserProfile } from '@/lib/supabase';
import { UserService } from '@/lib/supabase';

/**
 * OAuth Callback Handler Component
 * 
 * This component handles the OAuth callback from providers like Google, GitHub, etc.
 * It's called when the user is redirected back from the OAuth provider after authentication.
 */
export function AuthCallback() {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing OAuth callback...');
        
        // Check if there's a hash fragment or query params (OAuth token)
        const query = window.location.search;
        
        // Handle error from OAuth provider
        if (query.includes('error=')) {
          const params = new URLSearchParams(query);
          const error = params.get('error');
          const errorDescription = params.get('error_description');
          throw new Error(errorDescription || error || 'Authentication failed');
        }

        // Wait a moment for Supabase to process the session from URL
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Handle the OAuth callback
        const response = await AuthService.handleOAuthCallback();
        
        if (response.error) {
          throw response.error;
        }

        if (response.data) {
          const authData = response.data;
          
          // Convert to store format
          const authUser: AuthUser = {
            uid: authData.id,
            email: authData.email || '',
            displayName: authData.full_name || authData.email?.split('@')[0] || 'User',
            photoURL: authData.avatar_url || null,
            phoneNumber: authData.user_metadata?.phone as string || null,
          };
          
          // Update the store
          setUser(authUser);
          
          // Get or create profile
          let profile = await UserService.getProfile(authData.id);
          if (!profile) {
            const newProfile: UserProfile = {
              id: authData.id,
              email: authData.email || '',
              full_name: authUser.displayName || '',
              avatar_url: authUser.photoURL || undefined,
            };
            await UserService.createProfile(newProfile);
            profile = newProfile;
          }
          setProfile(profile);
          
          console.log('[AuthCallback] OAuth authentication successful:', authUser.email);
          setStatus('success');
          toast.success('Berhasil masuk!');
          
          // Redirect after a short delay to show success state
          setTimeout(() => {
            navigate('/profile');
          }, 1500);
        } else {
          throw new Error('No user data received');
        }
      } catch (error: any) {
        console.error('[AuthCallback] OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Gagal masuk dengan OAuth');
        toast.error(error.message || 'Gagal masuk dengan OAuth');
        
        // Redirect to auth page after a delay
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, setUser, setProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center"
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Loader2 className="w-16 h-16 text-blue-600" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Memproses Login
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Mohon tunggu sebentar...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Berhasil Masuk!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Mengalihkan ke halaman profil...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <XCircle className="w-16 h-16 text-red-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Login Gagal
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {errorMessage}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mengalihkan ke halaman login...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default AuthCallback;
