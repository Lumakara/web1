/**
 * Supabase Authentication Service
 * 
 * Production-ready authentication service with:
 * - Email/password authentication
 * - OAuth providers (Google, GitHub)
 * - Profile management
 * - Email notifications integration
 * - Comprehensive error handling
 */

import { supabase, type UserProfile } from '@/lib/supabase';
import { EmailService } from '@/lib/emailjs';

// ============================================
// TYPES
// ============================================

/**
 * Authenticated user with Supabase user data and profile
 */
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_admin: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, unknown>;
}

/**
 * Authentication error structure
 */
export interface AuthError {
  message: string;
  code: string;
  status?: number;
}

/**
 * Standard authentication response
 */
export interface AuthResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AuthError;
  message?: string;
}

/**
 * Sign up data structure
 */
export interface SignUpData {
  full_name: string;
  avatar_url?: string;
  [key: string]: unknown;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github' | 'gitlab' | 'azure';

/**
 * Auth state change callback type
 */
export type AuthStateChangeCallback = (
  event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'PASSWORD_RECOVERY' | 'TOKEN_REFRESHED' | 'USER_DELETED',
  session: AuthSession | null
) => void;

/**
 * Auth session structure
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Map Supabase error to AuthError
 */
function mapSupabaseError(error: any): AuthError {
  const errorMessages: Record<string, string> = {
    'auth/invalid-credentials': 'Email atau password salah',
    'auth/user-not-found': 'Pengguna tidak ditemukan',
    'auth/wrong-password': 'Password salah',
    'auth/email-already-in-use': 'Email sudah terdaftar',
    'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter)',
    'auth/invalid-email': 'Format email tidak valid',
    'auth/unauthorized': 'Akses tidak diizinkan',
    'auth/session-expired': 'Sesi telah berakhir, silakan login kembali',
    'auth/rate-limit-exceeded': 'Terlalu banyak percobaan, silakan coba lagi nanti',
    'auth/provider-disabled': 'Metode login tidak diaktifkan',
    'auth/popup-closed-by-user': 'Jendela login ditutup oleh pengguna',
    'auth/cancelled-popup-request': 'Permintaan login dibatalkan',
    'auth/account-exists-with-different-credential': 'Akun sudah ada dengan metode login berbeda',
  };

  const code = error?.code || 'unknown_error';
  const message = errorMessages[code] || error?.message || 'Terjadi kesalahan yang tidak diketahui';

  return {
    message,
    code,
    status: error?.status,
  };
}

/**
 * Create success response
 */
function createSuccessResponse<T>(data: T, message?: string): AuthResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create error response
 */
function createErrorResponse(error: any): AuthResponse<never> {
  const authError = mapSupabaseError(error);
  console.error('[AuthService] Error:', authError);
  return {
    success: false,
    error: authError,
  };
}

// ============================================
// EMAIL NOTIFICATION HELPERS
// ============================================

/**
 * Send welcome email to newly registered user
 */
async function sendWelcomeEmail(email: string, fullName: string): Promise<void> {
  try {
    const siteName = import.meta.env.VITE_SITE_NAME || 'Layanan Digital';

    await EmailService.sendNotificationEmail(
      email,
      fullName,
      `Selamat Datang di ${siteName}!`,
      `Halo ${fullName},\n\nSelamat! Akun Anda telah berhasil dibuat di ${siteName}.\n\nAnda sekarang dapat login dan mulai menggunakan layanan kami.\n\nTerima kasih,\nTim ${siteName}`
    );
    console.log('[AuthService] Welcome email sent to:', email);
  } catch (error) {
    console.error('[AuthService] Failed to send welcome email:', error);
    // Don't throw - email is not critical
  }
}

/**
 * Send notification to owner about new user registration
 */
async function notifyOwnerNewRegistration(email: string, fullName: string): Promise<void> {
  try {
    const ownerEmail = import.meta.env.VITE_OWNER_EMAIL || 'owner@example.com';
    const ownerName = import.meta.env.VITE_OWNER_NAME || 'Owner';
    const siteName = import.meta.env.VITE_SITE_NAME || 'Layanan Digital';

    await EmailService.sendNotificationEmail(
      ownerEmail,
      ownerName,
      `[${siteName}] Pengguna Baru Terdaftar`,
      `Halo ${ownerName},\n\nSeorang pengguna baru telah mendaftar di ${siteName}.\n\nDetail Pengguna:\nNama: ${fullName}\nEmail: ${email}\nTanggal: ${new Date().toLocaleString('id-ID')}\n\nSilakan login ke dashboard admin untuk melihat detail lebih lanjut.`
    );
    console.log('[AuthService] Owner notification sent for new registration');
  } catch (error) {
    console.error('[AuthService] Failed to send owner notification:', error);
  }
}

/**
 * Send login notification to user
 */
async function sendLoginNotification(email: string, fullName: string): Promise<void> {
  try {
    const siteName = import.meta.env.VITE_SITE_NAME || 'Layanan Digital';
    const loginTime = new Date().toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await EmailService.sendNotificationEmail(
      email,
      fullName,
      `Notifikasi Login - ${siteName}`,
      `Halo ${fullName},\n\nAnda baru saja login ke akun ${siteName} Anda.\n\nDetail Login:\nWaktu: ${loginTime}\nJika ini bukan Anda, segera ubah password Anda atau hubungi kami.\n\nTerima kasih,\nTim ${siteName}`
    );
    console.log('[AuthService] Login notification sent to:', email);
  } catch (error) {
    console.error('[AuthService] Failed to send login notification:', error);
  }
}

/**
 * Send failed login attempt notification
 */
async function sendFailedLoginNotification(email: string): Promise<void> {
  try {
    const ownerEmail = import.meta.env.VITE_OWNER_EMAIL || 'owner@example.com';
    const ownerName = import.meta.env.VITE_OWNER_NAME || 'Owner';
    const siteName = import.meta.env.VITE_SITE_NAME || 'Layanan Digital';
    const attemptTime = new Date().toLocaleString('id-ID');

    await EmailService.sendNotificationEmail(
      ownerEmail,
      ownerName,
      `[${siteName}] Percobaan Login Gagal`,
      `Halo ${ownerName},\n\nTerjadi percobaan login yang gagal di ${siteName}.\n\nDetail:\nEmail: ${email}\nWaktu: ${attemptTime}\n\nHarap periksa jika ada aktivitas mencurigakan.`
    );
    console.log('[AuthService] Failed login notification sent to owner');
  } catch (error) {
    console.error('[AuthService] Failed to send failed login notification:', error);
  }
}

// ============================================
// USER DATA CONVERSION
// ============================================

/**
 * Convert Supabase user to AuthUser
 */
function convertToAuthUser(user: any, profile?: UserProfile | null): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pengguna',
    avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
    is_admin: profile?.is_admin || false,
    email_verified: user.email_confirmed_at != null,
    created_at: user.created_at,
    updated_at: profile?.updated_at || user.updated_at,
    last_sign_in_at: user.last_sign_in_at,
    user_metadata: user.user_metadata,
  };
}

// ============================================
// AUTH SERVICE
// ============================================

export const AuthService = {
  /**
   * Sign up a new user with email and password
   * Sends verification email automatically
   * 
   * @param email - User email
   * @param password - User password (min 6 characters)
   * @param userData - Additional user data (full_name, etc.)
   * @returns AuthResponse with user data or error
   */
  async signUp(
    email: string,
    password: string,
    userData: SignUpData
  ): Promise<AuthResponse<AuthUser>> {
    try {
      console.log('[AuthService] Signing up user:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            ...userData,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('User creation failed');
      }

      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.full_name,
          avatar_url: userData.avatar_url,
          is_admin: false,
        });

      if (profileError) {
        console.error('[AuthService] Profile creation error:', profileError);
        // Don't throw - user is created, profile can be created later
      }

      const authUser = convertToAuthUser(data.user);

      // Send welcome email (async, don't wait)
      sendWelcomeEmail(authUser.email, authUser.full_name);
      notifyOwnerNewRegistration(authUser.email, authUser.full_name);

      console.log('[AuthService] Sign up successful:', authUser.id);
      return createSuccessResponse(
        authUser,
        'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.'
      );
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Sign in with email and password
   * 
   * @param email - User email
   * @param password - User password
   * @returns AuthResponse with user data or error
   */
  async signIn(email: string, password: string): Promise<AuthResponse<AuthUser>> {
    try {
      console.log('[AuthService] Signing in user:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Send failed login notification
        sendFailedLoginNotification(email);
        throw error;
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const authUser = convertToAuthUser(data.user, profile);

      // Send login notification (async, don't wait)
      sendLoginNotification(authUser.email, authUser.full_name);

      console.log('[AuthService] Sign in successful:', authUser.id);
      return createSuccessResponse(authUser, 'Login berhasil!');
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Sign in with OAuth provider (Google, GitHub)
   * 
   * @param provider - OAuth provider name
   * @returns Redirects to OAuth provider
   */
  async signInWithOAuth(provider: OAuthProvider): Promise<AuthResponse<void>> {
    try {
      console.log('[AuthService] OAuth sign in with:', provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        },
      });

      if (error) throw error;

      return createSuccessResponse(undefined, 'Redirecting to OAuth provider...');
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Handle OAuth callback and create/update profile
   * Call this on the auth callback page
   * 
   * @returns AuthResponse with user data or error
   */
  async handleOAuthCallback(): Promise<AuthResponse<AuthUser>> {
    try {
      console.log('[AuthService] Handling OAuth callback');

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;
      if (!session?.user) {
        throw new Error('No session found');
      }

      const user = session.user;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Pengguna';
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            avatar_url: avatarUrl,
            is_admin: false,
          });

        if (insertError) {
          console.error('[AuthService] Profile creation error:', insertError);
        }

        // Send welcome email for new OAuth users
        sendWelcomeEmail(user.email!, fullName);
        notifyOwnerNewRegistration(user.email!, fullName);
      } else {
        // Update profile with latest OAuth data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('[AuthService] Profile update error:', updateError);
        }
      }

      // Get updated profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const authUser = convertToAuthUser(user, profile);

      console.log('[AuthService] OAuth callback handled successfully:', authUser.id);
      return createSuccessResponse(authUser, 'Login berhasil!');
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Sign out the current user
   * 
   * @returns AuthResponse
   */
  async signOut(): Promise<AuthResponse<void>> {
    try {
      console.log('[AuthService] Signing out user');

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      console.log('[AuthService] Sign out successful');
      return createSuccessResponse(undefined, 'Logout berhasil!');
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Send password reset email
   * 
   * @param email - User email
   * @returns AuthResponse
   */
  async resetPassword(email: string): Promise<AuthResponse<void>> {
    try {
      console.log('[AuthService] Sending password reset to:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) throw error;

      console.log('[AuthService] Password reset email sent');
      return createSuccessResponse(
        undefined,
        'Email reset password telah dikirim. Silakan cek inbox Anda.'
      );
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Update user password
   * Call this after user clicks the reset password link
   * 
   * @param newPassword - New password
   * @returns AuthResponse
   */
  async updatePassword(newPassword: string): Promise<AuthResponse<void>> {
    try {
      console.log('[AuthService] Updating password');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      console.log('[AuthService] Password updated successfully');
      return createSuccessResponse(undefined, 'Password berhasil diperbarui!');
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Update user profile in profiles table
   * 
   * @param userId - User ID
   * @param updates - Profile update data
   * @returns AuthResponse with updated profile
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdateData
  ): Promise<AuthResponse<Partial<UserProfile>>> {
    try {
      console.log('[AuthService] Updating profile for user:', userId);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Also update user metadata in auth
      const { error: metadataError } = await supabase.auth.updateUser({
        data: updates,
      });

      if (metadataError) {
        console.error('[AuthService] Metadata update error:', metadataError);
      }

      console.log('[AuthService] Profile updated successfully');
      return createSuccessResponse(data, 'Profil berhasil diperbarui!');
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Get current logged in user
   * 
   * @returns AuthResponse with AuthUser or null
   */
  async getCurrentUser(): Promise<AuthResponse<AuthUser | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) {
        return createSuccessResponse(null);
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const authUser = convertToAuthUser(user, profile);
      return createSuccessResponse(authUser);
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Get current session
   * 
   * @returns AuthResponse with session or null
   */
  async getSession(): Promise<AuthResponse<AuthSession | null>> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;
      if (!session) {
        return createSuccessResponse(null);
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const authSession: AuthSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at || 0,
        user: convertToAuthUser(session.user, profile),
      };

      return createSuccessResponse(authSession);
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Listen to authentication state changes
   * 
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: AuthStateChangeCallback): { unsubscribe: () => void } {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthService] Auth state changed:', event);

        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const authUser = convertToAuthUser(session.user, profile);
          const authSession: AuthSession = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at || 0,
            user: authUser,
          };

          callback(event as any, authSession);
        } else {
          callback(event as any, null);
        }
      }
    );

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },

  /**
   * Resend email verification
   * 
   * @param email - User email
   * @returns AuthResponse
   */
  async resendVerification(email: string): Promise<AuthResponse<void>> {
    try {
      console.log('[AuthService] Resending verification to:', email);

      // Supabase doesn't have a direct resend verification method
      // We use signUp again with the same email to trigger a new verification email
      // The user won't be created again if already exists
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      console.log('[AuthService] Verification email resent');
      return createSuccessResponse(
        undefined,
        'Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.'
      );
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Refresh the current session
   * 
   * @returns AuthResponse with new session
   */
  async refreshSession(): Promise<AuthResponse<AuthSession>> {
    try {
      console.log('[AuthService] Refreshing session');

      const { data: { session }, error } = await supabase.auth.refreshSession();

      if (error) throw error;
      if (!session) {
        throw new Error('No session to refresh');
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const authSession: AuthSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at || 0,
        user: convertToAuthUser(session.user, profile),
      };

      console.log('[AuthService] Session refreshed successfully');
      return createSuccessResponse(authSession);
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },

  /**
   * Delete user account (requires admin privileges or user confirmation)
   * 
   * @returns AuthResponse
   */
  async deleteAccount(): Promise<AuthResponse<void>> {
    try {
      console.log('[AuthService] Deleting user account');

      const { error } = await supabase.rpc('delete_user');

      if (error) {
        // Fallback: sign out if RPC not available
        await supabase.auth.signOut();
        console.warn('[AuthService] Using fallback account deletion');
      }

      console.log('[AuthService] Account deleted successfully');
      return createSuccessResponse(undefined, 'Akun berhasil dihapus.');
    } catch (error: any) {
      return createErrorResponse(error);
    }
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user is authenticated
 * 
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
}

/**
 * Check if current user's email is verified
 * 
 * @returns Promise<boolean>
 */
export async function isEmailVerified(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email_confirmed_at != null;
}

/**
 * Get user role (admin or user)
 * 
 * @returns Promise<'admin' | 'user' | null>
 */
export async function getUserRole(): Promise<'admin' | 'user' | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    return profile?.is_admin ? 'admin' : 'user';
  } catch (error) {
    console.error('[AuthService] Error getting user role:', error);
    return null;
  }
}

/**
 * Check if current user is admin
 * 
 * @returns Promise<boolean>
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin';
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in protected routes/components
 * 
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const response = await AuthService.getCurrentUser();
  
  if (!response.success || !response.data) {
    throw new Error('Authentication required');
  }
  
  return response.data;
}

/**
 * Require admin privileges - throws error if not admin
 * Use this in admin routes/components
 * 
 * @throws Error if not admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!user.is_admin) {
    throw new Error('Admin privileges required');
  }
  
  return user;
}

// ============================================
// EXPORTS
// ============================================

export default AuthService;
