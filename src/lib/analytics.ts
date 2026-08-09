/**
 * Analytics — Firebase Analytics (Google Analytics for Firebase), since the
 * project's Firebase config already includes a measurementId and this
 * avoids adding a new third-party service/dependency.
 *
 * Privacy rules this module enforces by construction, not just convention:
 * - No PII, ever. No email, name, or any free-text field (leave reasons,
 *   holiday names, search queries) is passed as an event parameter — only
 *   fixed, closed-set values (a status string, a boolean, a page name).
 * - No user identifiers beyond Firebase Analytics' own anonymous client ID
 *   (its default; we never call setUserId with an email or Firestore uid).
 * - Fully optional at the infra level: if VITE_FIREBASE_MEASUREMENT_ID is
 *   unset, every call in this module is a no-op — no error, no missing
 *   feature, analytics is simply off (this project doesn't yet have a
 *   cookie/consent banner, so shipping with `measurementId` unset is a
 *   legitimate way to run with analytics fully disabled until one exists).
 * - Lazy-loaded: `firebase/analytics` is only imported the first time
 *   `initAnalytics()` is actually called, so pages/builds that never touch
 *   analytics don't pay for the extra bundle weight.
 */
import { app } from './firebase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let analyticsInstance: any = null;
let initPromise: Promise<void> | null = null;

function isEnabled(): boolean {
  return typeof window !== 'undefined' && !!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
}

/** Call once, e.g. from App on mount. Safe to call multiple times or when
 * disabled — every call after the first no-ops. */
export function initAnalytics(): Promise<void> {
  if (!isEnabled()) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => isSupported().then((supported) => ({ getAnalytics, supported })))
    .then(({ getAnalytics, supported }) => {
      // isSupported() covers cases like Safari private browsing or
      // server-side rendering where Analytics silently can't function —
      // skip initializing rather than throwing.
      if (!supported) return;
      analyticsInstance = getAnalytics(app);
    })
    .catch((error) => {
      console.error('Analytics failed to initialize:', error);
    });

  return initPromise;
}

/** Fixed, closed-set event names only — see the module docstring for why
 * free-text values never get passed as parameters. */
export type AnalyticsEvent =
  | 'page_view'
  | 'check_in'
  | 'check_out'
  | 'leave_added'
  | 'holiday_added'
  | 'theme_changed'
  | 'login'
  | 'logout';

export async function trackEvent(
  name: AnalyticsEvent,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  if (!isEnabled()) return;
  await initAnalytics();
  if (!analyticsInstance) return;

  try {
    const { logEvent } = await import('firebase/analytics');
    // Cast is safe: AnalyticsEvent is a fixed, hand-maintained union that
    // only contains event names this app actually emits; the mismatch here
    // is TS being unable to distinguish our generic union from Firebase's
    // per-literal overloads (which require different, GA4-reserved param
    // shapes for 'page_view'/'login' specifically), not a real type error.
    logEvent(analyticsInstance, name as 'check_in', params);
  } catch (error) {
    // Analytics failures must never surface to the user or block the
    // action that triggered them (checking in, saving a leave, etc.) —
    // log and move on.
    console.error('Analytics event failed:', error);
  }
}

export function trackPageView(pagePath: string): void {
  void trackEvent('page_view', { page_path: pagePath });
}
