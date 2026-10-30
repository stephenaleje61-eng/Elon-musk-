import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs,
  Firestore,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App & Firestore using provisioned database ID
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// CRITICAL: Bind to configured firestoreDatabaseId
export const firestore: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface JoinRequestDoc {
  id: string;
  name: string;
  location: string;
  message?: string;
  date: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
  email?: string;
}

export interface ChatMessageItem {
  id: string;
  from: 'admin' | 'visitor';
  senderName?: string;
  text: string;
  date: string;
  time: string;
  imageUrl?: string;
  timestamp: number;
}

export interface ActiveChatDoc {
  id: string;
  name: string;
  location: string;
  date: string;
  lastMessage?: string;
  timestamp: number;
  messages: ChatMessageItem[];
  email?: string;
}

/**
 * Seed initial permanent records (Rita from Australia, Elon Musk from Texas)
 * if Firestore collections are empty or missing them.
 */
export async function seedInitialFirestoreData() {
  try {
    // 1. Seed Rita (Australia) in joinRequests if not exists
    const ritaRef = doc(firestore, 'joinRequests', 'req-rita-australia');
    const ritaSnap = await getDoc(ritaRef);
    if (!ritaSnap.exists()) {
      await setDoc(ritaRef, {
        id: 'req-rita-australia',
        name: 'RITA',
        location: 'AUSTRALIA',
        message: 'Requesting secure uplink with Elon Musk Space Starbase terminal.',
        date: '10/30/2026',
        status: 'pending',
        timestamp: Date.now() - 3600000,
        email: 'rita.aus@space.net',
      });
      console.log('Seeded Rita (Australia) in joinRequests Firestore collection');
    }

    // 2. Seed Elon Musk (Texas) in activeChats if not exists
    const elonRef = doc(firestore, 'activeChats', 'chat-elon-musk-texas');
    const elonSnap = await getDoc(elonRef);
    if (!elonSnap.exists()) {
      await setDoc(elonRef, {
        id: 'chat-elon-musk-texas',
        name: 'ELON MUSK',
        location: 'TEXAS',
        date: '10/29/2026',
        lastMessage: 'Telemetry check',
        timestamp: Date.now() - 7200000,
        email: 'elonmuskspace241@gmail.com',
        messages: [
          {
            id: 'msg-seed-1',
            from: 'admin',
            senderName: 'Elon Musk (Admin)',
            text: 'Space transmission channel verified and accepted. Direct encrypted link established.',
            date: '10/29/2026',
            time: '04:54 PM',
            timestamp: Date.now() - 7200000,
          },
          {
            id: 'msg-seed-2',
            from: 'visitor',
            senderName: 'Elon Musk',
            text: 'Telemetry check',
            date: '10/30/2026',
            time: '07:51 AM',
            timestamp: Date.now() - 3600000,
          },
        ],
      });
      console.log('Seeded Elon Musk (Texas) in activeChats Firestore collection');
    }
  } catch (err) {
    console.warn('Initial Firestore seed check:', err);
  }
}

// Automatically trigger seed on startup
seedInitialFirestoreData();

/**
 * Real-time subscription to joinRequests collection
 */
export function subscribeToJoinRequests(
  onUpdate: (requests: JoinRequestDoc[]) => void
): () => void {
  const reqCol = collection(firestore, 'joinRequests');
  const unsubscribe = onSnapshot(
    reqCol,
    (snapshot) => {
      const list: JoinRequestDoc[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name || 'ANONYMOUS',
          location: d.location || 'EARTH',
          message: d.message || '',
          date: d.date || '10/30/2026',
          status: d.status || 'pending',
          timestamp: d.timestamp || Date.now(),
          email: d.email || '',
        });
      });
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore subscribeToJoinRequests error:', err);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription to activeChats collection
 */
export function subscribeToActiveChats(
  onUpdate: (chats: ActiveChatDoc[]) => void
): () => void {
  const chatCol = collection(firestore, 'activeChats');
  const unsubscribe = onSnapshot(
    chatCol,
    (snapshot) => {
      const list: ActiveChatDoc[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name || 'CALLSIGN',
          location: d.location || 'EARTH',
          date: d.date || '10/30/2026',
          lastMessage: d.lastMessage || '',
          timestamp: d.timestamp || Date.now(),
          messages: Array.isArray(d.messages) ? d.messages : [],
          email: d.email || '',
        });
      });
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate(list);
    },
    (err) => {
      console.error('Firestore subscribeToActiveChats error:', err);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription to single active chat doc
 */
export function subscribeToSingleActiveChat(
  chatId: string,
  onUpdate: (chat: ActiveChatDoc | null) => void
): () => void {
  const chatDocRef = doc(firestore, 'activeChats', chatId);
  const unsubscribe = onSnapshot(
    chatDocRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        onUpdate(null);
        return;
      }
      const d = docSnap.data();
      onUpdate({
        id: docSnap.id,
        name: d.name || 'CALLSIGN',
        location: d.location || 'EARTH',
        date: d.date || '10/30/2026',
        lastMessage: d.lastMessage || '',
        timestamp: d.timestamp || Date.now(),
        messages: Array.isArray(d.messages) ? d.messages : [],
        email: d.email || '',
      });
    },
    (err) => {
      console.error('Firestore subscribeToSingleActiveChat error:', err);
    }
  );

  return unsubscribe;
}

/**
 * Send request to join space -> saves to collection "joinRequests"
 */
export async function submitJoinRequestToFirestore(data: {
  name: string;
  location: string;
  message?: string;
  email?: string;
  customId?: string;
}): Promise<JoinRequestDoc> {
  const id = data.customId || 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const now = new Date();
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;

  const docData: JoinRequestDoc = {
    id,
    name: data.name.trim().toUpperCase(),
    location: (data.location || 'EARTH').trim().toUpperCase(),
    message: data.message || 'Request to join Elon Musk Space',
    date: dateStr,
    status: 'pending',
    timestamp: Date.now(),
    email: data.email || '',
  };

  await setDoc(doc(firestore, 'joinRequests', id), docData);

  // Also sync to server JSON storage
  try {
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: id,
        name: docData.name,
        email: docData.email,
        location: docData.location,
      }),
    });
  } catch (e) {}

  return docData;
}

/**
 * ACCEPT & OPEN CHAT:
 * Moves document from joinRequests to activeChats collection and deletes from joinRequests.
 */
export async function acceptAndOpenChatInFirestore(request: JoinRequestDoc): Promise<ActiveChatDoc> {
  const chatId = request.id;
  const now = new Date();
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const initialMessage: ChatMessageItem = {
    id: 'msg-' + Date.now(),
    from: 'admin',
    senderName: 'Elon Musk (Admin)',
    text: 'Space transmission channel verified and accepted. Uplink established.',
    date: dateStr,
    time: timeStr,
    timestamp: Date.now(),
  };

  const newChatDoc: ActiveChatDoc = {
    id: chatId,
    name: request.name.toUpperCase(),
    location: request.location.toUpperCase(),
    date: request.date || dateStr,
    lastMessage: initialMessage.text,
    timestamp: Date.now(),
    messages: [initialMessage],
    email: request.email || '',
  };

  // 1. Write to activeChats collection
  await setDoc(doc(firestore, 'activeChats', chatId), newChatDoc);

  // 2. Delete from joinRequests collection
  await deleteDoc(doc(firestore, 'joinRequests', request.id));

  // 3. Sync to server backend
  try {
    await fetch(`/api/requests/${encodeURIComponent(request.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });
  } catch (e) {}

  return newChatDoc;
}

/**
 * DECLINE:
 * Deletes document from joinRequests collection.
 */
export async function declineJoinRequestInFirestore(requestId: string): Promise<void> {
  // 1. Delete from Firestore
  await deleteDoc(doc(firestore, 'joinRequests', requestId));

  // 2. Delete from server backend
  try {
    await fetch(`/api/requests/${encodeURIComponent(requestId)}`, {
      method: 'DELETE',
    });
  } catch (e) {}
}

/**
 * Send chat message in activeChats:
 * Appends to messages array in activeChats/{chatId} doc and updates lastMessage.
 */
export async function sendChatMessageToFirestore(params: {
  chatId: string;
  from: 'admin' | 'visitor';
  senderName?: string;
  text: string;
  imageUrl?: string;
}): Promise<ChatMessageItem> {
  const now = new Date();
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const newMsg: ChatMessageItem = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    from: params.from,
    senderName: params.senderName || (params.from === 'admin' ? 'Elon Musk (Admin)' : 'Visitor'),
    text: params.text || '',
    date: dateStr,
    time: timeStr,
    imageUrl: params.imageUrl,
    timestamp: Date.now(),
  };

  const chatDocRef = doc(firestore, 'activeChats', params.chatId);
  const summary = params.text || (params.imageUrl ? '[Image Payload]' : '');

  // Add message to messages array and update lastMessage
  await updateDoc(chatDocRef, {
    messages: arrayUnion(newMsg),
    lastMessage: summary,
    timestamp: Date.now(),
  }).catch(async (err) => {
    // If doc was missing or needs setDoc fallback:
    const snap = await getDoc(chatDocRef);
    if (!snap.exists()) {
      await setDoc(chatDocRef, {
        id: params.chatId,
        name: params.senderName || 'VISITOR',
        location: 'EARTH',
        date: dateStr,
        lastMessage: summary,
        timestamp: Date.now(),
        messages: [newMsg],
      });
    } else {
      throw err;
    }
  });

  // Also sync to server backend for maximum multi-layer redundancy
  try {
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: params.chatId,
        userId: params.chatId,
        sender: params.from,
        senderName: newMsg.senderName,
        message: newMsg.text,
        imageUrl: newMsg.imageUrl,
      }),
    });
  } catch (e) {}

  return newMsg;
}

/**
 * Permanently Delete active chat from activeChats
 */
export async function deleteActiveChatInFirestore(chatId: string): Promise<void> {
  await deleteDoc(doc(firestore, 'activeChats', chatId));
  try {
    await fetch(`/api/chat/conversations/${encodeURIComponent(chatId)}`, {
      method: 'DELETE',
    });
  } catch (e) {}
}

/**
 * Convert file to Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
