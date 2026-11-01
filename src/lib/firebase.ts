import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase with Project "Elon musk 22" (lofty-emitter-blcf1)
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage: FirebaseStorage = getStorage(app);

export {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  firebaseConfig,
};
export type { User, Auth, Firestore, FirebaseStorage };
