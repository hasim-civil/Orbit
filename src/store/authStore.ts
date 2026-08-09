import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserData } from '@/types/attendance';
import { fetchUserData, watchAuthState } from '@/services/authService';

interface AuthState {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  /** Call once at app root. Returns the unsubscribe function. */
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  isLoading: true,

  init: () => {
    const unsubscribe = watchAuthState(async (user) => {
      if (user) {
        try {
          const userData = await fetchUserData(user.uid);
          set({ user, userData, isLoading: false });
        } catch (error) {
          // A transient Firestore error (or a user doc that hasn't been
          // created yet right after registration) must not leave the app
          // stuck on isLoading forever — fall back to "signed in, profile
          // unknown" so RequireAuth still lets them through and pages can
          // handle userData being null.
          console.error('Failed to load user profile:', error);
          set({ user, userData: null, isLoading: false });
        }
      } else {
        set({ user: null, userData: null, isLoading: false });
      }
    });
    return unsubscribe;
  },
}));
