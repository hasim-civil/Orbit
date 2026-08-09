import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Palette, Bell, LogOut, Accessibility, ChevronRight, BellOff } from 'lucide-react';
import { SettingsSection, SettingsRow } from '@/components/SettingsSection';
import { Toggle } from '@/components/Toggle';
import { ThemePicker } from '@/components/ThemePicker';
import { SpringButton } from '@/components/SpringButton';
import { ToastStack, type ToastState } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useSettingsStore } from '@/store/settingsStore';
import { logout } from '@/services/authService';
import { trackEvent } from '@/lib/analytics';
import {
  getNotificationPermissionState,
  getNotificationSupport,
  requestNotificationPermission,
} from '@/lib/notifications';

let toastId = 0;

export default function Profile() {
  const { userData } = useAuth();
  const { theme, setTheme, reducedMotion, setReducedMotion, notifications, setNotification } = useSettingsStore();
  const [permissionState, setPermissionState] = useState(getNotificationPermissionState());

  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  const pushToast = (message: string, type: ToastState['type']) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  // Enabling any reminder toggle for the first time asks for notification
  // permission — but only from this direct tap, never automatically. See
  // lib/notifications.ts for why this stops at "permission granted" and
  // doesn't attempt to actually schedule/send anything: that needs a
  // backend this project doesn't have.
  const handleNotificationToggle = async (key: 'checkInReminder' | 'checkOutReminder' | 'lateAlert', value: boolean) => {
    if (!value) {
      setNotification(key, false);
      return;
    }
    if (!getNotificationSupport()) {
      pushToast('Notifications are not supported in this browser.', 'warning');
      return;
    }
    const result = await requestNotificationPermission();
    setPermissionState(result);
    if (result === 'denied') {
      pushToast('Notifications are blocked. Enable them in your browser settings to use reminders.', 'warning');
      return;
    }
    setNotification(key, true);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      trackEvent('logout');
    } catch {
      pushToast('Failed to log out. Please try again.', 'error');
      setLoggingOut(false);
    }
  };

  return (
    <>
      <ToastStack toasts={toasts} />

      <motion.header
        className="sticky top-0 z-10 -mx-4 bg-neutral-50/82 px-4 py-4 backdrop-blur-xl"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="m-0 text-lg font-bold">Profile</h2>
      </motion.header>

      <main className="pt-1 pb-6">
        {/* Identity card */}
        <motion.div
          className="mb-5 flex items-center gap-4 rounded-[var(--radius-xl)] bg-neutral-0 p-5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        >
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-2xl font-bold text-white">
            {(userData?.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="m-0 truncate text-md font-bold text-neutral-900">{userData?.name || '—'}</p>
            <p className="m-0 truncate text-sm text-neutral-500">{userData?.email || '—'}</p>
            {userData?.role && (
              <span className="mt-1.5 inline-block rounded-full bg-brand-subtle px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wide text-brand">
                {userData.role}
              </span>
            )}
          </div>
        </motion.div>

        <SettingsSection title="Appearance" icon={<Palette size={16} />}>
          <div className="px-5 py-4">
            <ThemePicker
              value={theme}
              onChange={(t) => {
                setTheme(t);
                trackEvent('theme_changed', { theme: t });
              }}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="Accessibility" icon={<Accessibility size={16} />}>
          <SettingsRow
            label="Reduce Motion"
            description="Turns off decorative animation across the app"
            control={<Toggle checked={reducedMotion} onChange={setReducedMotion} label="Reduce motion" />}
          />
        </SettingsSection>

        <SettingsSection title="Notifications" icon={<Bell size={16} />}>
          <div className="px-5 pt-4 pb-1">
            <p className="m-0 text-xs text-muted-text">
              Reminders use your browser's notification permission. We'll ask the first time you turn one on —
              nothing is sent until you do.
            </p>
            {permissionState === 'denied' && (
              <p className="m-0 mt-2 flex items-center gap-1.5 text-xs font-semibold text-danger">
                <BellOff size={13} /> Notifications are blocked for this site in your browser.
              </p>
            )}
            {permissionState === 'unsupported' && (
              <p className="m-0 mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-text">
                <BellOff size={13} /> Not supported in this browser.
              </p>
            )}
          </div>
          <SettingsRow
            label="Check-in Reminder"
            description="Nudge if you haven't checked in by mid-morning"
            control={
              <Toggle
                checked={notifications.checkInReminder}
                onChange={(v) => handleNotificationToggle('checkInReminder', v)}
                label="Check-in reminder"
              />
            }
          />
          <SettingsRow
            label="Check-out Reminder"
            description="Nudge if you're still checked in after hours"
            control={
              <Toggle
                checked={notifications.checkOutReminder}
                onChange={(v) => handleNotificationToggle('checkOutReminder', v)}
                label="Check-out reminder"
              />
            }
          />
          <SettingsRow
            label="Late Arrival Alert"
            description="Notify when a check-in is marked late"
            control={
              <Toggle
                checked={notifications.lateAlert}
                onChange={(v) => handleNotificationToggle('lateAlert', v)}
                label="Late arrival alert"
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Account" icon={<User size={16} />}>
          <Link
            to="/leave"
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-neutral-900"
          >
            My Leaves
            <ChevronRight size={16} className="text-neutral-300" />
          </Link>
          <Link
            to="/holidays"
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-neutral-900"
          >
            Holidays
            <ChevronRight size={16} className="text-neutral-300" />
          </Link>
          {userData?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-neutral-900"
            >
              Admin Dashboard
              <ChevronRight size={16} className="text-neutral-300" />
            </Link>
          )}
          <button
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-muted-text"
            disabled
          >
            Edit Profile
            <ChevronRight size={16} className="text-neutral-300" />
          </button>
        </SettingsSection>

        <SpringButton variant="secondary" fullWidth onClick={handleLogout} disabled={loggingOut}>
          <LogOut size={16} />
          {loggingOut ? 'Logging out…' : 'Log Out'}
        </SpringButton>
      </main>
    </>
  );
}
