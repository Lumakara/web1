/**
 * Firebase Authentication Hook
 * 
 * Sistem autentikasi yang bersih menggunakan Firebase Auth
 * TIDAK menggunakan Supabase untuk auth sama sekali
 */

import { useState, useCallback } from 'react';
import { 
  auth, 
  type AuthUser 
} from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
  signOut,
  type User
} from 'firebase/auth';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';

// ============================================
// Helper Functions
// ============================================

/**
 * Convert Firebase User ke AuthUser format kita
 */
function convertFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Pengguna',
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
  };
}

/**
 * Error handler yang user-friendly
 */
function handleAuthError(error: any): string {
  const errorCode = error?.code || '';
  
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Format email tidak valid',
    'auth/user-disabled': 'Akun ini telah dinonaktifkan',
    'auth/user-not-found': 'Email tidak terdaftar',
    'auth/wrong-password': 'Password salah',
    'auth/email-already-in-use': 'Email sudah terdaftar',
    'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter)',
    'auth/invalid-credential': 'Email atau password salah',
    'auth/popup-closed-by-user': 'Login dibatalkan',
    'auth/popup-blocked': 'Popup diblokir browser. Izinkan popup untuk login.',
    'auth/cancelled-popup-request': 'Permintaan login dibatalkan',
    'auth/account-exists-with-different-credential': 'Akun sudah ada dengan metode login berbeda',
    'auth/network-request-failed': 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
    'auth/unauthorized-domain': 'Domain tidak diizinkan untuk login.',
  };

  return errorMessages[errorCode] || error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
}

// ============================================
// Main Hook
// ============================================

export const useAuth = () => {
  const { user, setUser, logout: storeLogout, isAuthenticated } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Sign in dengan Google (Popup)
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const authUser = convertFirebaseUser(result.user);
      
      setUser(authUser);
      toast.success('Berhasil masuk dengan Google!');
      
      return authUser;
    } catch (error: any) {
      const message = handleAuthError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Sign in dengan Email dan Password
   */
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const authUser = convertFirebaseUser(result.user);
      
      setUser(authUser);
      toast.success('Berhasil masuk!');
      
      return authUser;
    } catch (error: any) {
      const message = handleAuthError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Register dengan Email dan Password
   */
  const registerWithEmail = useCallback(async (
    email: string, 
    password: string, 
    displayName: string
  ) => {
    try {
      setIsLoading(true);
      
      // 1. Create user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Update profile dengan displayName
      await updateFirebaseProfile(result.user, { displayName });
      
      // 3. Reload user untuk mendapatkan data terbaru
      await result.user.reload();
      
      // 4. Convert dan set user
      const authUser = convertFirebaseUser(auth.currentUser || result.user);
      
      setUser(authUser);
      toast.success('Akun berhasil dibuat! Selamat datang!');
      
      return authUser;
    } catch (error: any) {
      const message = handleAuthError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Sign Out
   */
  const signOutUser = useCallback(async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      storeLogout();
      toast.success('Berhasil keluar');
    } catch (error: any) {
      const message = handleAuthError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

  /**
   * Update Profile
   */
  const updateProfile = useCallback(async (updates: { 
    displayName?: string; 
    photoURL?: string;
  }) => {
    try {
      setIsLoading(true);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Tidak ada user yang login');
      }
      
      await updateFirebaseProfile(currentUser, updates);
      await currentUser.reload();
      
      // Update local state
      const updatedUser = convertFirebaseUser(auth.currentUser || currentUser);
      setUser(updatedUser);
      
      toast.success('Profil berhasil diperbarui');
      return updatedUser;
    } catch (error: any) {
      const message = handleAuthError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Reset Password
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.success('Email reset password telah dikirim. Silakan cek inbox Anda.');
    } catch (error: any) {
      const message = handleAuthError(error);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    signOut: signOutUser,
    updateProfile,
    resetPassword,
  };
};

export default useAuth;
