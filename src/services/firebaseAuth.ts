import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';

import firebaseConfig from '../../firebase-applet-config.json';

export const AUTHORIZED_ADMIN_EMAIL = 'elonmuskspace241@gmail.com';
export const ADMIN_SESSION_KEY = 'elon_space_admin_session_v1';

export function getFirebaseAuth(): Auth | null {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    return getAuth(app);
  } catch (e) {
    console.warn('Firebase Auth init fallback:', e);
    return null;
  }
}

/**
 * Check if an admin is currently authenticated in Firebase Auth or session
 */
export function isCurrentAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Check Firebase Auth user if active
  const auth = getFirebaseAuth();
  if (auth && auth.currentUser) {
    return true;
  }

  // 2. Check persistent admin session
  try {
    const rawSession =
      sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed && parsed.email) {
        return true;
      }
    }
  } catch (e) {}

  return false;
}

/**
 * Get the currently authenticated admin's email
 */
export function getCurrentAdminEmail(): string {
  const auth = getFirebaseAuth();
  if (auth?.currentUser?.email) {
    return auth.currentUser.email.toLowerCase().trim();
  }
  try {
    const rawSession =
      sessionStorage.getItem(ADMIN_SESSION_KEY) || localStorage.getItem(ADMIN_SESSION_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed?.email) return parsed.email.toLowerCase().trim();
    }
  } catch (e) {}
  return AUTHORIZED_ADMIN_EMAIL;
}

/**
 * Log in admin:
 * - Convert email to lowercase BEFORE login: email.toLowerCase().trim()
 * - Remove .toUpperCase() anywhere
 * - Use signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password.trim())
 * - Show REAL Firebase error: console.log(error.code, error.message)
 * - Allow any email that exists in Firebase Auth
 */
export async function loginAdmin(emailInput: string, passwordInput: string): Promise<User> {
  const cleanEmail = emailInput.toLowerCase().trim();
  const cleanPassword = passwordInput.trim();

  if (!cleanEmail) {
    throw new Error('Email is required.');
  }

  if (!cleanPassword) {
    throw new Error('Password is required.');
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Auth service not initialized.');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    console.log('Firebase Auth Success:', cred.user.email, cred.user.uid);

    // Set verified secure session
    const sessionData = {
      email: cred.user.email || cleanEmail,
      uid: cred.user.uid,
      authenticatedAt: Date.now(),
      token: 'admin_tok_' + Math.random().toString(36).substring(2, 10),
    };
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {}

    return cred.user;
  } catch (error: any) {
    console.log(error.code, error.message);
    const code = error?.code || 'auth/unknown-error';
    const msg = error?.message || 'Authentication failed';
    throw new Error(`[${code}] ${msg}`);
  }
}

/**
 * Send password reset email:
 * Calls sendPasswordResetEmail with lowercase trimmed email and logs exact Firebase error
 */
export async function sendAdminPasswordReset(emailInput: string): Promise<void> {
  const cleanEmail = emailInput.toLowerCase().trim();

  if (!cleanEmail) {
    throw new Error('Please enter your email address to receive a password reset link.');
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Auth service not initialized.');
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    console.log('sendPasswordResetEmail success:', cleanEmail);
  } catch (error: any) {
    console.log(error.code, error.message);
    const code = error?.code || 'auth/unknown-error';
    const msg = error?.message || 'Failed to dispatch reset email';
    throw new Error(`[${code}] ${msg}`);
  }
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
  const currentEmail = getCurrentAdminEmail();
  callback(isAuth, isAuth ? currentEmail : null);

  const auth = getFirebaseAuth();
  let unsubFb: (() => void) | null = null;
  if (auth) {
    try {
      unsubFb = onAuthStateChanged(auth, (user: User | null) => {
        if (!isMounted) return;
        if (user && user.email) {
          callback(true, user.email.toLowerCase().trim());
        } else {
          // Check session fallback
          const sessionAuth = isCurrentAdminAuthenticated();
          callback(sessionAuth, sessionAuth ? getCurrentAdminEmail() : null);
        }
      });
    } catch (e) {}
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === ADMIN_SESSION_KEY && isMounted) {
      const sessionAuth = isCurrentAdminAuthenticated();
      callback(sessionAuth, sessionAuth ? getCurrentAdminEmail() : null);
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
