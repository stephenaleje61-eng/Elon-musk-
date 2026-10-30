import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';

export const AUTHORIZED_ADMIN_EMAIL = 'elonmuskspace241@gmail.com';
const ADMIN_SESSION_KEY = 'elon_space_admin_session_v1';

export function getFirebaseAuth(): Auth | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || localStorage.getItem('firebase_api_key');
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || localStorage.getItem('firebase_project_id');

  if (apiKey && projectId && apiKey.trim() !== '' && projectId.trim() !== '') {
    try {
      const config = {
        apiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef',
      };
      const app = !getApps().length ? initializeApp(config) : getApps()[0];
      return getAuth(app);
    } catch (e) {
      console.warn('Firebase Auth init fallback:', e);
    }
  }
  return null;
}

/**
 * Check if the user is currently authenticated as the single authorized administrator
 */
export function isCurrentAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check Firebase Auth user if active
  const auth = getFirebaseAuth();
  if (auth && auth.currentUser) {
    if (auth.currentUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      return true;
    }
  }

  // 2. Check persistent admin session
  try {
    const rawSession =
      sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed && parsed.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        return true;
      }
    }
  } catch (e) {}

  return false;
}

/**
 * Log in admin strictly verifying the email is elonmuskspace241@gmail.com
 */
export async function loginAdmin(emailInput: string, passwordInput: string): Promise<void> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  // Strict check: Only elonmuskspace241@gmail.com can log in as Admin
  if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    throw new Error(`Access Denied: Only ${AUTHORIZED_ADMIN_EMAIL} is authorized to access Admin Control.`);
  }

  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  // Try Firebase Authentication
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    } catch (err: any) {
      // If the admin user has not been registered in Firebase Auth yet, automatically register them
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            throw new Error('Incorrect password for ' + AUTHORIZED_ADMIN_EMAIL);
          }
          throw new Error(createErr.message || 'Firebase Authentication failed');
        }
      } else if (err.code === 'auth/wrong-password') {
        throw new Error('Incorrect password for ' + AUTHORIZED_ADMIN_EMAIL);
      } else {
        throw new Error(err.message || 'Firebase Authentication failed');
      }
    }
  }

  // Set verified secure session
  const sessionData = {
    email: AUTHORIZED_ADMIN_EMAIL,
    authenticatedAt: Date.now(),
    token: 'admin_tok_' + Math.random().toString(36).substring(2, 10),
  };
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
  } catch (e) {}
}

/**
 * Log out admin
 */
export async function logoutAdmin(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
  }
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (e) {}
}

/**
 * Subscribe to admin auth changes
 */
export function subscribeToAdminAuthState(
  callback: (isAuthenticated: boolean, email: string | null) => void
): () => void {
  let isMounted = true;

  // Immediate check
  const isAuth = isCurrentAdminAuthenticated();
  callback(isAuth, isAuth ? AUTHORIZED_ADMIN_EMAIL : null);

  const auth = getFirebaseAuth();
  let unsubFb: (() => void) | null = null;
  if (auth) {
    try {
      unsubFb = onAuthStateChanged(auth, (user: User | null) => {
        if (!isMounted) return;
        if (user && user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          callback(true, AUTHORIZED_ADMIN_EMAIL);
        } else {
          // Check session fallback
          const sessionAuth = isCurrentAdminAuthenticated();
          callback(sessionAuth, sessionAuth ? AUTHORIZED_ADMIN_EMAIL : null);
        }
      });
    } catch (e) {}
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_SESSION_KEY && isMounted) {
      const sessionAuth = isCurrentAdminAuthenticated();
      callback(sessionAuth, sessionAuth ? AUTHORIZED_ADMIN_EMAIL : null);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    isMounted = false;
    if (unsubFb) unsubFb();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}
