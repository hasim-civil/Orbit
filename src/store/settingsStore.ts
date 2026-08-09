import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'glass';

interface SettingsState {
  theme: Theme;
  reducedMotion: boolean;
  notifications: {
    checkInReminder: boolean;
    checkOutReminder: boolean;
    lateAlert: boolean;
  };
  setTheme: (theme: Theme) => void;
  setReducedMotion: (value: boolean) => void;
  setNotification: (key: keyof SettingsState['notifications'], value: boolean) => void;
}

/** Persisted to localStorage under 'sa-settings', replacing the original
 * app's separate 'sa-theme' / 'sa-motion' keys with one typed store. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      reducedMotion: false,
      notifications: {
        checkInReminder: true,
        checkOutReminder: true,
        lateAlert: true,
      },
      setTheme: (theme) => set({ theme }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setNotification: (key, value) =>
        set((state) => ({ notifications: { ...state.notifications, [key]: value } })),
    }),
    { name: 'sa-settings' },
  ),
);
