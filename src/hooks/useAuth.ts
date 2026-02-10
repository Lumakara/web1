import { useEffect, useState } from 'react';
import { FirebaseAuth, type AuthUser } from '@/lib/firebase';
import { UserService } from '@/lib/supabase';
import { useAppStore } from '@/store/appStore';
import { EmailService } from '@/lib/emailjs';

export const useAuth = () => {
  const { user, setUser, setProfile, logout, isAuthenticated } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
        };
        setUser(authUser);

        // Fetch or create user profile in Supabase
        try {
          let profile = await UserService.getProfile(firebaseUser.uid);
          if (!profile) {
            // Create new profile
            const newProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              full_name: firebaseUser.displayName || 'User',
              avatar_url: firebaseUser.photoURL || '',
            };
            await UserService.createProfile(newProfile);
            profile = newProfile;
          }
          setProfile(profile);
        } catch (error) {
          console.error('Error fetching/creating profile:', error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile]);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const user = await FirebaseAuth.signInWithGoogle();
      setUser(user);
      
      // Create profile if doesn't exist
      let profile = await UserService.getProfile(user.uid);
      if (!profile) {
        const newProfile = {
          id: user.uid,
          email: user.email || '',
          full_name: user.displayName || 'User',
          avatar_url: user.photoURL || '',
        };
        await UserService.createProfile(newProfile);
        profile = newProfile;
        
        // Send welcome email
        await EmailService.sendRegistrationEmail({
          to_email: user.email || '',
          to_name: user.displayName || 'User',
          user_email: user.email || '',
          registration_date: new Date().toLocaleDateString('id-ID'),
        });
      }
      setProfile(profile);
      return user;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await FirebaseAuth.signInWithEmail(email, password);
      setUser(user);
      
      const profile = await UserService.getProfile(user.uid);
      if (profile) {
        setProfile(profile);
      }
      return user;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string, displayName: string, _phone?: string) => {
    try {
      setIsLoading(true);
      const user = await FirebaseAuth.registerWithEmail(email, password, displayName);
      setUser(user);

      // Create profile in Supabase
      const newProfile = {
        id: user.uid,
        email: email,
        full_name: displayName,
        avatar_url: '',
      };
      await UserService.createProfile(newProfile);
      setProfile(newProfile);

      // Send welcome email
      await EmailService.sendRegistrationEmail({
        to_email: email,
        to_name: displayName,
        user_email: email,
        registration_date: new Date().toLocaleDateString('id-ID'),
      });

      return user;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await FirebaseAuth.signOut();
      logout();
    } catch (error: any) {
      throw error;
    }
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      await FirebaseAuth.updateProfile(updates);
      if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        // Update in Supabase
        await UserService.updateProfile(user.uid, {
          full_name: updates.displayName,
          avatar_url: updates.photoURL,
        });
        
        const profile = await UserService.getProfile(user.uid);
        if (profile) setProfile(profile);
      }
    } catch (error: any) {
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    signOut,
    updateProfile,
  };
};
