/**
 * Firebase Configuration & Auth Service
 * 
 * Konfigurasi Firebase untuk:
 * - Authentication (Email/Password, Google)
 * - Firestore (opsional, untuk data tambahan)
 * 
 * TIDAK menggunakan Supabase untuk auth
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  type User
} from 'firebase/auth';

// ============================================
// Firebase Configuration
// ============================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// ============================================
// Initialize Firebase
// ============================================

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable emulator untuk development (opsional)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

// ============================================
// Auth User Interface
// ============================================

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert Firebase User ke AuthUser
 */
export function convertFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Pengguna',
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    emailVerified: user.emailVerified,
    createdAt: user.metadata?.creationTime,
    lastLoginAt: user.metadata?.lastSignInTime,
  };
}

// ============================================
// Firebase Auth Service
// ============================================

export const FirebaseAuth = {
  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  },

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  },

  /**
   * Get auth token
   */
  async getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  },

  /**
   * Check if email is verified
   */
  isEmailVerified(): boolean {
    return auth.currentUser?.emailVerified || false;
  },

  /**
   * Reload current user
   */
  async reloadUser(): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
    }
  },
};

// ============================================
// Google Provider Setup
// ============================================

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add scopes jika diperlukan
googleProvider.addScope('profile');
googleProvider.addScope('email');

// ============================================
// Error Handling Helpers
// ============================================

export const FirebaseErrorCodes = {
  // Auth Errors
  INVALID_EMAIL: 'auth/invalid-email',
  USER_DISABLED: 'auth/user-disabled',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  INVALID_CREDENTIAL: 'auth/invalid-credential',
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  POPUP_BLOCKED: 'auth/popup-blocked',
  NETWORK_ERROR: 'auth/network-request-failed',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  
  // Custom error messages dalam Bahasa Indonesia
  getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      [this.INVALID_EMAIL]: 'Format email tidak valid',
      [this.USER_DISABLED]: 'Akun ini telah dinonaktifkan',
      [this.USER_NOT_FOUND]: 'Email tidak terdaftar',
      [this.WRONG_PASSWORD]: 'Password salah',
      [this.EMAIL_ALREADY_IN_USE]: 'Email sudah terdaftar',
      [this.WEAK_PASSWORD]: 'Password terlalu lemah (minimal 6 karakter)',
      [this.INVALID_CREDENTIAL]: 'Email atau password salah',
      [this.POPUP_CLOSED]: 'Login dibatalkan',
      [this.POPUP_BLOCKED]: 'Popup diblokir browser',
      [this.NETWORK_ERROR]: 'Gagal terhubung ke server',
      [this.TOO_MANY_REQUESTS]: 'Terlalu banyak percobaan, coba lagi nanti',
    };
    return messages[code] || 'Terjadi kesalahan';
  }
};

// ============================================
// Check Configuration
// ============================================

export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

// Log configuration status
if (import.meta.env.DEV) {
  console.log('[Firebase] Configured:', isFirebaseConfigured());
}

export default FirebaseAuth;
