import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Firebase configuration - prefers env vars, falls back to safe demo values for offline/dev
const hasEnvConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'demo-sender',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id'
};

let app: ReturnType<typeof initializeApp> | null = null;

try {
  // Initialize Firebase even with demo values so UI can render without backend connectivity
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.warn('Firebase initialization failed; running in offline mode.', error);
}

export const firebaseConfigured = hasEnvConfig && Boolean(app);

// Initialize Firebase services (may be null in offline mode)
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Initialize Analytics (only in browser environment)
let analytics = null;
try {
  analytics = typeof window !== 'undefined' && app ? getAnalytics(app) : null;
} catch (error) {
  // Analytics might fail in some environments - continue without it
  console.warn('Analytics initialization failed (non-critical)');
}
export { analytics };
export default app;
