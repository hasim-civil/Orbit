/**
 * Browser Notification permission handling.
 *
 * IMPORTANT — scope of what this actually does:
 * This module only manages the browser's Notification permission prompt.
 * It does NOT send push notifications, and it CANNOT schedule "check-out
 * reminder at 6pm"-style alerts that fire while the app isn't open — that
 * requires Firebase Cloud Messaging with a server-side sender (a Cloud
 * Function or backend using the FCM Admin SDK and a service-account
 * credential), which this project does not currently have.
 *
 * Building that sender in the browser would mean shipping a service-account
 * private key to every client, which is exactly the insecure pattern this
 * phase's brief warns against. So this stays intentionally scoped to what
 * a client can safely do on its own: ask for permission, remember the
 * answer, and (once a backend exists) register the resulting token with it.
 *
 * When a backend is added later, `getFcmToken()` is the integration point:
 * it already does everything up to requesting the token, and only needs a
 * `messaging()` call once `firebase/messaging` + a VAPID key are configured.
 */

export type NotificationPermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

export function getNotificationSupport(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionState(): NotificationPermissionState {
  if (!getNotificationSupport()) return 'unsupported';
  return Notification.permission;
}

/** Requests browser notification permission. Must only be called from a
 * direct user action (e.g. toggling a setting on), never automatically on
 * page load — the brief is explicit about this, and browsers increasingly
 * auto-deny or ignore permission prompts not triggered by a real gesture. */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!getNotificationSupport()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;

  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (error) {
    console.error('Notification permission request failed:', error);
    return 'denied';
  }
}
