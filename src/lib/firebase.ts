/**
 * Firebase initialization.
 * Config is read from environment variables (see .env.example) so the same
 * codebase can point at different Firebase projects (dev/staging/prod)
 * without a code change, and so config isn't duplicated in source control.
 *
 * Note: a Firebase client apiKey is not a secret — Google's own docs say
 * it's safe to ship in a public bundle, since the real access boundary is
 * Firestore/Auth security rules, not this key. Env vars here are for
 * config hygiene and multi-environment support, not secrecy.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. Copy .env.example to .env.local and fill in your Firebase project's config.`,
    );
  }
  return value;
}

const firebaseConfig = {
  apiKey: requireEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireEnv('VITE_FIREBASE_APP_ID'),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
