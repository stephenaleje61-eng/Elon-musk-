import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  Firestore,
  updateDoc,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { AUTHORIZED_ADMIN_EMAIL } from './firebaseAuth';

// Initialize Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const firestore: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Data Interfaces
export interface ConversationDoc {
  conversationId: string;
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  lastMessage: string;
  lastMessageAt: any;
  unreadForAdmin: number;
  unreadForVisitor: number;
  status: 'active' | 'closed' | 'blocked';
  createdAt: any;
  updatedAt: any;
}

export interface MessageDoc {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderRole: 'visitor' | 'admin';
  text: string;
  imageUrl?: string;
  createdAt: any;
  deliveryStatus: 'sent' | 'delivered' | 'read';
}

/**
 * Remove all undefined values before passing to Firestore
 */
export function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (Array.isArray(obj)) return obj.map(cleanPayload) as any;
  if (typeof obj === 'object') {
    if ('_methodName' in (obj as any) || '_delegate' in (obj as any)) return obj;
    const clean: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) clean[k] = cleanPayload(v);
    }
    return clean;
  }
  return obj;
}

/**
 * 1. Ensure Anonymous Authentication for Visitor
 * Returns the authenticated User with real immutable Firebase UID.
 */
export async function ensureVisitorAuth(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // Wait for initial auth state if initializing
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          console.warn('Anonymous auth failed, trying local fallback:', err);
          // If anonymous auth is disabled in Firebase console, provide a fallback mock user
          const fallbackUid =
            localStorage.getItem('elon_auth_visitor_uid') ||
            'anon_' + Math.random().toString(36).substring(2, 12);
          localStorage.setItem('elon_auth_visitor_uid', fallbackUid);
          resolve({
            uid: fallbackUid,
            isAnonymous: true,
            email: null,
          } as unknown as User);
        }
      }
    }, (error) => {
      unsub();
      reject(error);
    });
  });
}

/**
 * 2. Get or Create Private Conversation for the authenticated visitor
 */
export async function getOrCreateVisitorConversation(
  visitorName: string,
  visitorEmail?: string
): Promise<ConversationDoc> {
  const user = await ensureVisitorAuth();
  const visitorId = user.uid;

  // Predictable conversation ID tied to visitor UID
  const conversationId = `conv_${visitorId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const convRef = doc(firestore, 'conversations', conversationId);

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      const data = snap.data() as ConversationDoc;
      // Update name/email if provided
      if (visitorName && visitorName !== data.visitorName) {
        await updateDoc(convRef, cleanPayload({
          visitorName,
          ...(visitorEmail ? { visitorEmail } : {}),
          updatedAt: serverTimestamp(),
        })).catch(() => {});
      }
      return { ...data, conversationId };
    }
  } catch (e) {
    console.warn('Lookup existing conversation error:', e);
  }

  // Create new conversation document
  const initialConv: ConversationDoc = {
    conversationId,
    visitorId,
    visitorName: visitorName || 'Visitor',
    visitorEmail: visitorEmail || '',
    lastMessage: 'Conversation opened',
    lastMessageAt: serverTimestamp(),
    unreadForAdmin: 0,
    unreadForVisitor: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(convRef, cleanPayload(initialConv));
  } catch (err) {
    console.warn('Could not setDoc on conversations:', err);
  }

  // Also mirror to activeChats & joinRequests for complete backward compatibility
  try {
    const activeChatRef = doc(firestore, 'activeChats', conversationId);
    await setDoc(activeChatRef, cleanPayload({
      id: conversationId,
      name: visitorName || 'VISITOR',
      location: 'EARTH',
      date: new Date().toLocaleDateString('en-US'),
      lastMessage: 'Connected to private channel',
      timestamp: Date.now(),
      messages: [],
      ...(visitorEmail ? { email: visitorEmail } : {}),
    }));
  } catch {}

  return initialConv;
}

/**
 * 3. Subscribe to Conversation Metadata
 */
export function subscribeToConversation(
  conversationId: string,
  onUpdate: (conv: ConversationDoc | null) => void
): () => void {
  const convRef = doc(firestore, 'conversations', conversationId);
  return onSnapshot(convRef, (snap) => {
    if (snap.exists()) {
      onUpdate({ ...(snap.data() as ConversationDoc), conversationId: snap.id });
    } else {
      onUpdate(null);
    }
  }, (err) => {
    console.warn('subscribeToConversation error:', err);
  });
}

/**
 * 4. Subscribe to Messages in a Conversation (Subcollection)
 */
export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: MessageDoc[]) => void
): () => void {
  const msgsRef = collection(firestore, 'conversations', conversationId, 'messages');
  const q = query(msgsRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const list: MessageDoc[] = [];
    snapshot.forEach((d) => {
      list.push({ ...(d.data() as MessageDoc), messageId: d.id });
    });
    onUpdate(list);
  }, (err) => {
    console.warn('subscribeToMessages error:', err);
  });
}

/**
 * 5. Send a Message into a Conversation
 */
export async function sendChatMessage(params: {
  conversationId: string;
  text: string;
  imageUrl?: string;
  senderRole: 'visitor' | 'admin';
  senderName?: string;
}): Promise<MessageDoc> {
  const user = auth.currentUser;
  let localUid = 'anon_sender';
  if (typeof window !== 'undefined') {
    localUid =
      localStorage.getItem('elon_auth_visitor_uid') ||
      localStorage.getItem('elonverse_visitor_id') ||
      'vis_' + Date.now().toString(36);
  }
  const senderId = user ? user.uid : localUid;
  const cleanText = params.text.trim();

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const msgRef = doc(firestore, 'conversations', params.conversationId, 'messages', messageId);

  const newMsg: MessageDoc = {
    messageId,
    conversationId: params.conversationId,
    senderId,
    senderRole: params.senderRole,
    text: cleanText,
    ...(params.imageUrl ? { imageUrl: params.imageUrl } : {}),
    createdAt: serverTimestamp(),
    deliveryStatus: 'sent',
  };

  await setDoc(msgRef, cleanPayload(newMsg));

  // Update conversation parent document
  const convRef = doc(firestore, 'conversations', params.conversationId);
  const summary = cleanText || (params.imageUrl ? '[Image Attachment]' : '');

  const updateFields: any = {
    lastMessage: summary,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (params.senderRole === 'visitor') {
    updateFields.unreadForAdmin = increment(1);
    updateFields.unreadForVisitor = 0;
  } else {
    updateFields.unreadForVisitor = increment(1);
    updateFields.unreadForAdmin = 0;
  }

  await updateDoc(convRef, cleanPayload(updateFields)).catch(async () => {
    // If updateDoc fails (e.g. document was deleted), recreate it
    await setDoc(convRef, cleanPayload({
      conversationId: params.conversationId,
      visitorId: senderId,
      visitorName: params.senderName || 'Visitor',
      lastMessage: summary,
      lastMessageAt: serverTimestamp(),
      unreadForAdmin: params.senderRole === 'visitor' ? 1 : 0,
      unreadForVisitor: params.senderRole === 'admin' ? 1 : 0,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }));
  });

  // Mirror to activeChats subcollection for legacy UI compatibility
  try {
    const legacyMsgRef = doc(firestore, 'activeChats', params.conversationId, 'messages', messageId);
    await setDoc(legacyMsgRef, cleanPayload({
      id: messageId,
      from: params.senderRole,
      senderName: params.senderRole === 'admin' ? 'ELON MUSK [ADMIN]' : (params.senderName || 'VISITOR'),
      text: cleanText,
      ...(params.imageUrl ? { imageUrl: params.imageUrl } : {}),
      date: new Date().toLocaleDateString('en-US'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    }));
  } catch {}

  return newMsg;
}

/**
 * 6. Upload Image to Firebase Storage with progress tracking
 */
export async function uploadChatImage(
  file: File,
  conversationId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload a valid image (PNG, JPG, WEBP, GIF).');
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size exceeds the 5MB limit.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `conversations/${conversationId}/${Date.now()}_${safeName}`;

  try {
    const sRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(sRef, file, {
      contentType: file.type,
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          if (onProgress) onProgress(progress);
        },
        async (error) => {
          console.warn('Firebase Storage upload error, using fallback proxy:', error);
          // Fallback to server endpoint or base64
          try {
            const fallbackUrl = await uploadViaServerProxy(file, conversationId);
            resolve(fallbackUrl);
          } catch (fbErr) {
            reject(fbErr);
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (e) {
            const fallbackUrl = await uploadViaServerProxy(file, conversationId);
            resolve(fallbackUrl);
          }
        }
      );
    });
  } catch (err) {
    console.warn('Storage init failed, using server proxy fallback:', err);
    return uploadViaServerProxy(file, conversationId);
  }
}

/**
 * Server upload proxy fallback
 */
async function uploadViaServerProxy(file: File, conversationId: string): Promise<string> {
  const base64 = await fileToBase64(file);
  const res = await fetch('/api/chat/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversationId,
      filename: file.name,
      mimeType: file.type,
      dataUrl: base64,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    return data.url || base64;
  }
  return base64;
}

/**
 * Convert file to Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 7. Mark Conversation Read
 */
export async function markConversationRead(
  conversationId: string,
  role: 'admin' | 'visitor'
): Promise<void> {
  const convRef = doc(firestore, 'conversations', conversationId);
  try {
    const updateData = role === 'admin' ? { unreadForAdmin: 0 } : { unreadForVisitor: 0 };
    await updateDoc(convRef, cleanPayload(updateData));
  } catch {}
}

/**
 * 8. Subscribe to All Conversations (Admin Dashboard)
 */
export function subscribeToAllConversations(
  onUpdate: (conversations: ConversationDoc[]) => void
): () => void {
  const convsRef = collection(firestore, 'conversations');
  const q = query(convsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: ConversationDoc[] = [];
    snapshot.forEach((d) => {
      list.push({ ...(d.data() as ConversationDoc), conversationId: d.id });
    });
    onUpdate(list);
  }, (err) => {
    console.warn('subscribeToAllConversations error:', err);
  });
}

/**
 * 9. Admin Block / Unblock Conversation
 */
export async function adminSetConversationStatus(
  conversationId: string,
  status: 'active' | 'closed' | 'blocked'
): Promise<void> {
  const convRef = doc(firestore, 'conversations', conversationId);
  await updateDoc(convRef, cleanPayload({ status, updatedAt: serverTimestamp() }));
}

/**
 * 10. Admin Delete Conversation
 */
export async function adminDeleteConversation(conversationId: string): Promise<void> {
  // Delete from conversations
  const convRef = doc(firestore, 'conversations', conversationId);
  await deleteDoc(convRef).catch(() => {});

  // Also clean up from activeChats
  const activeChatRef = doc(firestore, 'activeChats', conversationId);
  await deleteDoc(activeChatRef).catch(() => {});
}
