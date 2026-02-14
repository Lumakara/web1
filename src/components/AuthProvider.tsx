/**
 * Firebase Auth Provider Component
 * 
 * Provider untuk mengelola state autentikasi Firebase
 */

import { useState, useEffect, createContext } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAppStore } from '@/store/appStore';
import type { AuthUser } from '@/lib/firebase';

// ============================================
// Auth Context
// ============================================

interface AuthContextType {
  isInitialized: boolean;
}

export const AuthContext = createContext<AuthContextType>({ isInitialized: false });

// ============================================
// Helper
// ============================================

function convertFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Pengguna',
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
  };
}

// ============================================
// Provider Component
// ============================================

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, logout } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('[FirebaseAuth] Auth state changed:', firebaseUser?.email || 'null');
      
      if (firebaseUser) {
        const authUser = convertFirebaseUser(firebaseUser);
        setUser(authUser);
      } else {
        logout();
      }
      
      setIsInitialized(true);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [setUser, logout]);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {isInitialized ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export default FirebaseAuthProvider;
