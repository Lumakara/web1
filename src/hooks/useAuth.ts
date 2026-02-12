import { useState, useCallback, useContext, createContext } from 'react';
import { AuthService } from '@/lib/supabase-auth';
import { UserService } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import { EmailService } from '@/lib/emailjs';
import { toast } from 'sonner';
import type { AuthUser } from '@/lib/firebase';
import type { UserProfile } from '@/lib/supabase';

// Context to track auth initialization state from AuthProvider
interface AuthContextType {
  isInitialized: boolean;
}

export const AuthContext = createContext<AuthContextType>({ isInitialized: false });

export const useAuth = () => {
  const { user, setUser, setProfile, logout, isAuthenticated } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get initialization state from context (provided by AuthProvider in App.tsx)
  // If context is not available, fall back to checking if auth state has been determined
  const authContext = useContext(AuthContext);
  const isInitialized = authContext?.isInitialized ?? (isAuthenticated || user === null);

  // The auth state is now initialized by AuthProvider in App.tsx
  // This hook provides additional auth operations

  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.signInWithOAuth('google');
      if (response.error) throw response.error;
      // OAuth redirect will handle the rest
    } catch (error: any) {
      toast.error(error.message || 'Gagal masuk dengan Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.signInWithOAuth('github');
      if (response.error) throw response.error;
      // OAuth redirect will handle the rest
    } catch (error: any) {
      toast.error(error.message || 'Gagal masuk dengan GitHub');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithFacebook = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.signInWithOAuth('facebook');
      if (response.error) throw response.error;
      // OAuth redirect will handle the rest
    } catch (error: any) {
      toast.error(error.message || 'Gagal masuk dengan Facebook');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await AuthService.signIn(email, password);
      
      if (response.error) {
        // Send failed login notification to owner
        await EmailService.sendAdminNotification('failed_login', {
          type: 'failed_login',
          user_email: email,
          ip_address: 'unknown',
          device_info: navigator.userAgent,
          failure_reason: response.error.message,
          timestamp: new Date().toISOString(),
        });
        throw response.error;
      }

      if (response.data) {
        const data = response.data;
        const authUser: AuthUser = {
          uid: data.id,
          email: data.email || '',
          displayName: data.full_name || data.email?.split('@')[0] || 'User',
          photoURL: data.avatar_url || null,
          phoneNumber: data.user_metadata?.phone as string || null,
        };
        setUser(authUser);

        // Fetch profile
        const profile = await UserService.getProfile(data.id);
        if (profile) {
          setProfile(profile);
        }

        // Send login notification
        await EmailService.sendLoginNotification(
          { name: authUser.displayName || '', email: authUser.email || '' },
          'unknown',
          navigator.userAgent
        );

        // Send admin notification
        await EmailService.sendAdminNotification('user_login', {
          type: 'user_login',
          user_email: authUser.email || '',
          user_name: authUser.displayName || '',
          ip_address: 'unknown',
          device_info: navigator.userAgent,
          timestamp: new Date().toISOString(),
        });

        toast.success('Berhasil masuk!');
      }
      
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Gagal masuk');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setProfile]);

  const registerWithEmail = useCallback(async (email: string, password: string, displayName: string, phone?: string) => {
    try {
      setIsLoading(true);
      const response = await AuthService.signUp(email, password, {
        full_name: displayName,
        phone: phone || '',
      });
      
      if (response.error) {
        // Send failed registration notification
        await EmailService.sendAdminNotification('failed_login', {
          type: 'failed_login',
          user_email: email,
          failure_reason: response.error.message,
          timestamp: new Date().toISOString(),
        });
        throw response.error;
      }

      if (response.data) {
        const data = response.data;
        const authUser: AuthUser = {
          uid: data.id,
          email: data.email || '',
          displayName: displayName,
          photoURL: null,
          phoneNumber: phone || null,
        };
        setUser(authUser);

        // Create profile
        const newProfile: UserProfile = {
          id: data.id,
          email: email,
          full_name: displayName,
        };
        await UserService.createProfile(newProfile);
        setProfile(newProfile);

        // Send welcome email
        await EmailService.sendWelcomeEmail({
          to_email: email,
          to_name: displayName,
          user_email: email,
          registration_date: new Date().toLocaleDateString('id-ID'),
        });

        // Send admin notification
        await EmailService.sendAdminNotification('new_registration', {
          type: 'new_registration',
          user_email: authUser.email || '',
          user_name: authUser.displayName || '',
          timestamp: new Date().toISOString(),
        });

        toast.success('Akun berhasil dibuat! Silakan verifikasi email Anda.');
      }
      
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Gagal mendaftar');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setProfile]);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.signOut();
      if (response.error) throw response.error;
      logout();
      toast.success('Berhasil keluar');
    } catch (error: any) {
      toast.error(error.message || 'Gagal keluar');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const updateProfile = useCallback(async (updates: { displayName?: string; photoURL?: string; phone?: string }) => {
    try {
      setIsLoading(true);
      
      if (user?.uid) {
        // Update in Supabase Auth
        const response = await AuthService.updateProfile(user.uid, {
          full_name: updates.displayName,
          avatar_url: updates.photoURL,
        });
        
        if (response.error) throw response.error;

        // Update local state
        const updatedUser: AuthUser = { 
          ...user, 
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL,
          phoneNumber: updates.phone || user.phoneNumber,
        };
        setUser(updatedUser);
        
        // Update profile in database
        await UserService.updateProfile(user.uid, {
          full_name: updates.displayName,
          avatar_url: updates.photoURL,
        });
        
        // Fetch updated profile
        const profile = await UserService.getProfile(user.uid);
        if (profile) setProfile(profile);
        
        toast.success('Profil berhasil diperbarui');
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui profil');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, setUser, setProfile]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      const response = await AuthService.resetPassword(email);
      if (response.error) throw response.error;
      toast.success('Email reset password telah dikirim');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim email reset');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      const response = await AuthService.resendVerification(email);
      if (response.error) throw response.error;
      toast.success('Email verifikasi telah dikirim ulang');
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim ulang verifikasi');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    signInWithGoogle,
    signInWithGitHub,
    signInWithFacebook,
    signInWithEmail,
    registerWithEmail,
    signOut,
    updateProfile,
    resetPassword,
    resendVerification,
  };
};
