/**
 * Firebase initialization.
 * Same project/config as the original vanilla-JS app (js/firebase.js),
 * so this dashboard reads and writes the exact same Firestore data.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCV5s37swaoIizaNeZfz-89pJsMMsLhQtM',
  authDomain: 'attendance-af550.firebaseapp.com',
  projectId: 'attendance-af550',
  storageBucket: 'attendance-af550.firebasestorage.app',
  messagingSenderId: '323294791225',
  appId: '1:323294791225:web:79901032c281d22b342fe8',
  measurementId: 'G-8HX40K5M6E',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function watchAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
