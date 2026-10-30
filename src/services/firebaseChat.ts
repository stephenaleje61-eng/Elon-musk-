import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { ChatMessage, VisitorConversation, AdminPresence, UserIntent, MessageSender, FriendRequest } from '../types/chat';

export const OWNER_ID = 'elon_musk_owner';
const LOCAL_MESSAGES_KEY = 'elonverse_private_messages_v5';
const LOCAL_REQUEST_KEY = 'elonverse_friend_request_v5';
const LOCAL_PRESENCE_KEY = 'elonverse_admin_presence_v5';

// Multi-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('elonverse_private_bus_v5');
  } catch (e) {}
}

// Firebase Firestore initialization
let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let isConfiguredFirebase = false;

export function initFirebaseService() {
  if (firestoreDb) return { db: firestoreDb, isConnected: isConfiguredFirebase };

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

      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApps()[0];
      }
      firestoreDb = getFirestore(firebaseApp);
      isConfiguredFirebase = true;
      console.log('Firebase Firestore private room connected!');
    } catch (err) {
      console.warn('Firebase init fallback:', err);
    }
  }

  return { db: firestoreDb, isConnected: isConfiguredFirebase };
}

/**
 * Register visitor in 'conversations' & 'visitors' collections permanently (no TTL, never auto deleted)
 */
export async function registerVisitor(visitor: {
  visitorId: string;
  name: string;
  location: string;
  intent?: string;
  lastMessage?: string;
}) {
  // 1. Central Server Registration
  try {
    await fetch('/api/chat/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitor),
    });
  } catch (err) {}

  // 2. Firestore Document Registration - Permanent
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const convRef = doc(db, 'conversations', visitor.visitorId);
      await setDoc(
        convRef,
        {
          visitorId: visitor.visitorId,
          userId: visitor.visitorId,
          name: visitor.name,
          location: visitor.location,
          intent: visitor.intent || '',
          timestamp: serverTimestamp(),
          lastMessage: visitor.lastMessage || 'Connected to private chat',
        },
        { merge: true }
      );

      const visitorRef = doc(db, 'visitors', visitor.visitorId);
      await setDoc(
        visitorRef,
        {
          visitorId: visitor.visitorId,
          name: visitor.name,
          location: visitor.location,
          intent: visitor.intent || '',
          timestamp: serverTimestamp(),
          lastMessage: visitor.lastMessage || 'Connected to private chat',
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not register visitor in Firestore:', e);
    }
  }
}

/**
 * Utility to convert an image file to base64 Data URL for real instant chat delivery
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Subscribe to a visitor's PRIVATE chat room:
 * Listens to permanent collection: conversations/{userId}/messages
 * Also merges with privateChats/{userId}/messages and local cache.
 * Data is NEVER deleted on refresh or page reload.
 */
export function subscribeToUserChat(
  visitorId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  let isMounted = true;
  const messagesMap = new Map<string, ChatMessage>();

  // 1. Load cached history immediately so reload never shows a blank screen
  try {
    const savedLocal = localStorage.getItem('elonverse_chat_' + visitorId);
    if (savedLocal) {
      const parsed: ChatMessage[] = JSON.parse(savedLocal);
      parsed.forEach((m) => messagesMap.set(m.id, m));
      onUpdate(Array.from(messagesMap.values()).sort((a, b) => a.timestamp - b.timestamp));
    }
  } catch (e) {}

  const emitMerged = (incomingMsgs: ChatMessage[]) => {
    if (!isMounted) return;
    incomingMsgs.forEach((m) => messagesMap.set(m.id, m));
    const sorted = Array.from(messagesMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    try {
      localStorage.setItem('elonverse_chat_' + visitorId, JSON.stringify(sorted));
    } catch (e) {}
    onUpdate(sorted);
  };

  // 2. Firestore Real-time onSnapshot on conversations/{userId}/messages (Permanent)
  let unsubConv: (() => void) | null = null;
  let unsubPrivate: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const convMessagesSub = collection(db, 'conversations', visitorId, 'messages');
      const q1 = query(convMessagesSub, orderBy('timestamp', 'asc'));
      unsubConv = onSnapshot(
        q1,
        (snapshot) => {
          if (!isMounted) return;
          const list: ChatMessage[] = [];
          snapshot.forEach((docItem) => {
            const data = docItem.data();
            const rawSender = data.sender;
            const sender: 'admin' | 'visitor' = (rawSender === 'admin' || rawSender === 'owner') ? 'admin' : 'visitor';
            list.push({
              id: docItem.id,
              userId: visitorId,
              visitorId: visitorId,
              name: data.senderName || data.name || (sender === 'admin' ? 'Elon Musk (Admin)' : 'Visitor'),
              senderName: data.senderName || data.name || (sender === 'admin' ? 'Elon Musk (Admin)' : 'Visitor'),
              city: data.city || data.location || 'Texas',
              message: data.text || data.message || '',
              text: data.text || data.message || '',
              imageUrl: data.imageUrl || data.image || undefined,
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (typeof data.timestamp === 'number' ? data.timestamp : Date.now()),
              timeString: new Date(data.timestamp?.toMillis ? data.timestamp.toMillis() : (typeof data.timestamp === 'number' ? data.timestamp : Date.now())).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isElon: false,
              isAdmin: sender === 'admin',
              sender,
              read: Boolean(data.read),
              isSystem: Boolean(data.isSystem),
              isVerified: true,
            });
          });
          emitMerged(list);
        },
        (err) => console.warn('Firestore conversations listener error:', err)
      );

      const privateSub = collection(db, 'privateChats', visitorId, 'messages');
      const q2 = query(privateSub, orderBy('timestamp', 'asc'));
      unsubPrivate = onSnapshot(
        q2,
        (snapshot) => {
          if (!isMounted) return;
          const list: ChatMessage[] = [];
          snapshot.forEach((docItem) => {
            const data = docItem.data();
            const rawSender = data.sender;
            const sender: 'admin' | 'visitor' = (rawSender === 'admin' || rawSender === 'owner') ? 'admin' : 'visitor';
            list.push({
              id: docItem.id,
              userId: visitorId,
              visitorId: visitorId,
              name: data.senderName || data.name || (sender === 'admin' ? 'Elon Musk (Admin)' : 'Visitor'),
              senderName: data.senderName || data.name || (sender === 'admin' ? 'Elon Musk (Admin)' : 'Visitor'),
              city: data.city || data.location || 'Texas',
              message: data.text || data.message || '',
              text: data.text || data.message || '',
              imageUrl: data.imageUrl || data.image || undefined,
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (typeof data.timestamp === 'number' ? data.timestamp : Date.now()),
              timeString: new Date(data.timestamp?.toMillis ? data.timestamp.toMillis() : (typeof data.timestamp === 'number' ? data.timestamp : Date.now())).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isElon: false,
              isAdmin: sender === 'admin',
              sender,
              read: Boolean(data.read),
              isSystem: Boolean(data.isSystem),
              isVerified: true,
            });
          });
          emitMerged(list);
        },
        (err) => console.warn('Firestore privateChats listener error:', err)
      );
    } catch (e) {
      console.warn('Firestore listener setup fallback:', e);
    }
  }

  // 3. Central Server REST fetch strictly scoped to visitorId
  const fetchThread = async () => {
    try {
      const res = await fetch(`/api/chat/messages?visitorId=${encodeURIComponent(visitorId)}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        emitMerged(data);
      }
    } catch (err) {}
  };
  fetchThread();

  // 4. Real-time Push via SSE strictly scoped to visitorId
  let eventSource: EventSource | null = null;
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      eventSource = new EventSource(`/api/chat/stream?visitorId=${encodeURIComponent(visitorId)}`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'new_message' && payload.message) {
            const incoming: ChatMessage = payload.message;
            if (incoming.userId === visitorId || incoming.visitorId === visitorId || payload.visitorId === visitorId) {
              emitMerged([incoming]);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  // 5. Polling fallback every 1.5s for instant two-way sync
  const pollInterval = setInterval(() => {
    if (isMounted) fetchThread();
  }, 1500);

  // 6. Multi-tab channel
  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'MSG_UPDATE' && (e.data?.userId === visitorId || e.data?.visitorId === visitorId)) {
      fetchThread();
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    isMounted = false;
    clearInterval(pollInterval);
    if (unsubConv) unsubConv();
    if (unsubPrivate) unsubPrivate();
    if (eventSource) eventSource.close();
    if (broadcastChannel) broadcastChannel.removeEventListener('message', handleBroadcast);
  };
}

/**
 * Subscribe for Owner to see ALL visitor cards permanently:
 * Listens to permanent collection 'conversations' (and merges with 'visitors')
 * Shows all chats forever until Admin clicks DELETE manually.
 */
export function subscribeToAllConversations(
  onUpdate: (conversations: VisitorConversation[]) => void
): () => void {
  let isMounted = true;
  const convsMap = new Map<string, VisitorConversation>();

  const emitConversations = (incomingList: VisitorConversation[]) => {
    if (!isMounted) return;
    incomingList.forEach((c) => {
      convsMap.set(c.userId, { ...convsMap.get(c.userId), ...c });
    });
    const sorted = Array.from(convsMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    onUpdate(sorted);
  };

  // 1. Firestore Real-time onSnapshot for 'conversations' collection
  let unsubConv: (() => void) | null = null;
  let unsubVisitors: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const convRef = collection(db, 'conversations');
      const q1 = query(convRef, orderBy('timestamp', 'desc'));
      unsubConv = onSnapshot(
        q1,
        (snapshot) => {
          if (!isMounted) return;
          const list: VisitorConversation[] = [];
          snapshot.forEach((docItem) => {
            const data = docItem.data();
            list.push({
              userId: docItem.id,
              visitorId: docItem.id,
              userName: data.name || 'Visitor',
              name: data.name || 'Visitor',
              userCity: data.location || data.city || 'USA',
              location: data.location || data.city || 'USA',
              lastMessage: data.lastMessage || '',
              lastTimestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
              intent: data.intent,
              unreadCount: data.unreadCount || 0,
            });
          });
          emitConversations(list);
        },
        (err) => console.warn('Firestore conversations collection listener error:', err)
      );

      const visitorsRef = collection(db, 'visitors');
      const q2 = query(visitorsRef, orderBy('timestamp', 'desc'));
      unsubVisitors = onSnapshot(
        q2,
        (snapshot) => {
          if (!isMounted) return;
          const list: VisitorConversation[] = [];
          snapshot.forEach((docItem) => {
            const data = docItem.data();
            list.push({
              userId: docItem.id,
              visitorId: docItem.id,
              userName: data.name || 'Visitor',
              name: data.name || 'Visitor',
              userCity: data.location || data.city || 'USA',
              location: data.location || data.city || 'USA',
              lastMessage: data.lastMessage || '',
              lastTimestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
              timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
              intent: data.intent,
              unreadCount: data.unreadCount || 0,
            });
          });
          emitConversations(list);
        },
        (err) => console.warn('Firestore visitors collection listener error:', err)
      );
    } catch (e) {}
  }

  // 2. Central Server REST fetch for all visitor rooms
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/visitors');
      if (res.ok) {
        const list: VisitorConversation[] = await res.json();
        if (isMounted) emitConversations(list);
      }
    } catch (err) {}
  };
  fetchConversations();

  // 3. Real-time SSE for Owner
  let eventSource: EventSource | null = null;
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      eventSource = new EventSource('/api/chat/stream?role=owner');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.type === 'new_message' ||
            payload.type === 'visitor_updated' ||
            payload.type === 'conversation_deleted'
          ) {
            fetchConversations();
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  const pollTimer = setInterval(() => {
    if (isMounted) fetchConversations();
  }, 2500);

  return () => {
    isMounted = false;
    clearInterval(pollTimer);
    if (unsubConv) unsubConv();
    if (unsubVisitors) unsubVisitors();
    if (eventSource) eventSource.close();
  };
}

/**
 * Send message to:
 * - Permanent Collection: conversations/{userId}/messages
 * - Also mirrors to privateChats/{userId}/messages & visitors/{userId}/messages
 * - Updates lastMessage permanently in 'conversations' and 'visitors' docs
 * Never auto deletes anything.
 */
export async function sendChatMessage(msg: {
  name: string;
  city: string;
  message: string;
  isElon?: boolean;
  isAdmin?: boolean;
  isVerified?: boolean;
  isSystem?: boolean;
  userId: string;
  visitorId?: string;
  sender?: MessageSender;
  intent?: UserIntent;
  image?: string;
  imageUrl?: string;
  senderName?: string;
  voiceDuration?: number;
}): Promise<ChatMessage> {
  const targetVisitorId = msg.visitorId || msg.userId;
  const newTimestamp = Date.now();
  const timeString = new Date(newTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const normalizedSender: 'admin' | 'visitor' =
    msg.isAdmin || msg.sender === 'owner' || msg.sender === 'admin' ? 'admin' : 'visitor';
  const imgUrl = msg.imageUrl || msg.image || undefined;
  const senderDisplayName =
    msg.senderName || msg.name || (normalizedSender === 'admin' ? 'Elon Musk (Admin)' : 'Visitor');

  const tempMessage: ChatMessage = {
    ...msg,
    id: 'msg-' + newTimestamp + '-' + Math.random().toString(36).substring(2, 7),
    userId: targetVisitorId,
    visitorId: targetVisitorId,
    sender: normalizedSender,
    senderName: senderDisplayName,
    name: senderDisplayName,
    text: msg.message,
    message: msg.message,
    imageUrl: imgUrl,
    image: imgUrl,
    timestamp: newTimestamp,
    timeString,
    isElon: false,
    isAdmin: normalizedSender === 'admin',
    isSystem: Boolean(msg.isSystem),
    isVerified: true,
    read: false,
    reactions: {},
  };

  // 1. Immediate local cache update
  try {
    const existingRaw = localStorage.getItem('elonverse_chat_' + targetVisitorId);
    const existingList: ChatMessage[] = existingRaw ? JSON.parse(existingRaw) : [];
    existingList.push(tempMessage);
    localStorage.setItem('elonverse_chat_' + targetVisitorId, JSON.stringify(existingList));
  } catch (err) {}

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'MSG_UPDATE', visitorId: targetVisitorId, userId: targetVisitorId, message: tempMessage });
  }

  // 2. Real Central Server Post
  try {
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...tempMessage,
        visitorId: targetVisitorId,
        sender: normalizedSender,
        senderName: senderDisplayName,
        text: msg.message,
        imageUrl: imgUrl,
      }),
    });
  } catch (err) {
    console.warn('Server chat post error, cached locally:', err);
  }

  // 3. Write to Firestore collections PERMANENTLY:
  // - conversations/{targetVisitorId}/messages
  // - privateChats/{targetVisitorId}/messages
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const lastSummary = msg.message || (imgUrl ? '[Picture]' : '');

      // Permanent conversations collection message
      const convMessagesSub = collection(db, 'conversations', targetVisitorId, 'messages');
      await addDoc(convMessagesSub, {
        id: tempMessage.id,
        text: msg.message || '',
        message: msg.message || '',
        imageUrl: imgUrl || null,
        sender: normalizedSender,
        senderName: senderDisplayName,
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update parent document in 'conversations'
      const convDocRef = doc(db, 'conversations', targetVisitorId);
      await setDoc(
        convDocRef,
        {
          visitorId: targetVisitorId,
          userId: targetVisitorId,
          lastMessage: lastSummary,
          timestamp: serverTimestamp(),
          ...(normalizedSender === 'visitor' ? { name: msg.name, location: msg.city } : {}),
        },
        { merge: true }
      );

      // Mirror to privateChats and visitors for backward compatibility
      const privateChatsSub = collection(db, 'privateChats', targetVisitorId, 'messages');
      await addDoc(privateChatsSub, {
        id: tempMessage.id,
        text: msg.message || '',
        imageUrl: imgUrl || null,
        sender: normalizedSender,
        senderName: senderDisplayName,
        timestamp: serverTimestamp(),
        read: false,
      });

      const visitorDocRef = doc(db, 'visitors', targetVisitorId);
      await setDoc(
        visitorDocRef,
        {
          visitorId: targetVisitorId,
          lastMessage: lastSummary,
          timestamp: serverTimestamp(),
          ...(normalizedSender === 'visitor' ? { name: msg.name, location: msg.city } : {}),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not write to Firestore subcollection:', err);
    }
  }

  return tempMessage;
}

/**
 * Permanently Delete a Conversation & its messages (MANUAL Admin Action Only)
 */
export async function deleteConversation(visitorId: string): Promise<void> {
  // 1. Delete on Server
  try {
    await fetch(`/api/chat/conversations/${encodeURIComponent(visitorId)}`, {
      method: 'DELETE',
    });
  } catch (err) {}

  // 2. Delete on Firestore
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      await deleteDoc(doc(db, 'conversations', visitorId));
      await deleteDoc(doc(db, 'visitors', visitorId));
      await deleteDoc(doc(db, 'privateChats', visitorId));
    } catch (err) {}
  }

  // 3. Delete from localStorage
  try {
    localStorage.removeItem('elonverse_chat_' + visitorId);
  } catch (e) {}

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'CONV_DELETED', visitorId });
  }
}

/**
 * Permanently Delete a Friend Request (MANUAL Admin Action Only)
 */
export async function deleteFriendRequest(visitorId: string): Promise<void> {
  // 1. Delete on Server
  try {
    await fetch(`/api/requests/${encodeURIComponent(visitorId)}`, {
      method: 'DELETE',
    });
  } catch (err) {}

  // 2. Delete on Firestore
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      await deleteDoc(doc(db, 'requests', visitorId));
      await deleteDoc(doc(db, 'friendRequests', visitorId));
    } catch (err) {}
  }

  // 3. Clear localStorage
  try {
    localStorage.removeItem(LOCAL_REQUEST_KEY + '_' + visitorId);
    localStorage.removeItem('elonverse_request_' + visitorId);
  } catch (e) {}
}

/**
 * Admin Real Online Presence
 */
export async function setAdminPresence(isOnline: boolean, adminName = 'Elon Musk (Owner)', adminCity = 'Starbase, TX') {
  const presence: AdminPresence = {
    isOnline,
    adminName,
    adminCity,
    lastSeen: Date.now(),
  };

  try {
    localStorage.setItem(LOCAL_PRESENCE_KEY, JSON.stringify(presence));
  } catch (e) {}

  try {
    await fetch('/api/chat/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(presence),
    });
  } catch (err) {}

  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const presDoc = doc(db, 'presence', 'admin');
      await setDoc(presDoc, {
        ...presence,
        timestamp: serverTimestamp(),
      });
    } catch (e) {}
  }
}

export function subscribeToAdminPresence(
  onUpdate: (presence: AdminPresence) => void
): () => void {
  let isMounted = true;

  try {
    const cached = localStorage.getItem(LOCAL_PRESENCE_KEY);
    if (cached) onUpdate(JSON.parse(cached));
  } catch (e) {}

  let unsubFirestore: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const presDoc = doc(db, 'presence', 'admin');
      unsubFirestore = onSnapshot(presDoc, (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          const data = snap.data();
          onUpdate({
            isOnline: Boolean(data.isOnline),
            adminName: data.adminName || 'Elon Musk (Owner)',
            adminCity: data.adminCity || 'Starbase, TX',
            lastSeen: data.lastSeen || Date.now(),
          });
        }
      });
    } catch (e) {}
  }

  const pollPresence = async () => {
    try {
      const res = await fetch('/api/chat/presence');
      if (res.ok) {
        const pres = await res.json();
        if (isMounted) onUpdate(pres);
      }
    } catch (e) {}
  };
  pollPresence();

  const timer = setInterval(() => {
    if (isMounted) pollPresence();
  }, 10000);

  return () => {
    isMounted = false;
    clearInterval(timer);
    if (unsubFirestore) unsubFirestore();
  };
}

/**
 * Send request to join space:
 * Saves permanently in:
 * - Collection 'requests' -> never auto delete
 * - Collection 'conversations' -> never auto delete
 * - Collection 'friendRequests'
 */
export async function sendFriendRequest(data: {
  visitorId: string;
  name: string;
  email: string;
  location: string;
}): Promise<FriendRequest> {
  const reqObj: FriendRequest = {
    id: 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    visitorId: data.visitorId,
    name: data.name.trim(),
    email: data.email.trim(),
    location: data.location.trim(),
    status: 'pending',
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(LOCAL_REQUEST_KEY + '_' + data.visitorId, JSON.stringify(reqObj));
    localStorage.setItem('elonverse_request_' + data.visitorId, JSON.stringify(reqObj));
  } catch (e) {}

  // 1. Post to Server
  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.request) return json.request;
    }
  } catch (err) {}

  // 2. Post to Firestore 'requests' & 'conversations' collections permanently
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      // Permanent requests collection
      const reqDoc = doc(db, 'requests', data.visitorId);
      await setDoc(
        reqDoc,
        {
          ...reqObj,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );

      // Legacy mirror
      const legacyReqDoc = doc(db, 'friendRequests', data.visitorId);
      await setDoc(
        legacyReqDoc,
        {
          ...reqObj,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );

      // Initial entry in conversations collection
      const convDoc = doc(db, 'conversations', data.visitorId);
      await setDoc(
        convDoc,
        {
          visitorId: data.visitorId,
          userId: data.visitorId,
          name: data.name.trim(),
          location: data.location.trim(),
          email: data.email.trim(),
          status: 'pending',
          lastMessage: 'Requested to join Elon Musk Space',
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore requests write error:', e);
    }
  }

  return reqObj;
}

/**
 * Subscribe to real requests:
 * Listens to permanent collection 'requests' and 'friendRequests'
 * Shows all requests forever until Admin manually deletes or acts on them.
 */
export function subscribeToFriendRequests(
  onUpdate: (requests: FriendRequest[]) => void
): () => void {
  let isMounted = true;
  const requestsMap = new Map<string, FriendRequest>();

  const emitRequests = (incomingList: FriendRequest[]) => {
    if (!isMounted) return;
    incomingList.forEach((r) => requestsMap.set(r.visitorId, { ...requestsMap.get(r.visitorId), ...r }));
    const sorted = Array.from(requestsMap.values()).sort((a, b) => b.timestamp - a.timestamp);
    onUpdate(sorted);
  };

  // 1. Firestore listener if connected
  let unsubReq: (() => void) | null = null;
  let unsubFriend: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const q1 = query(collection(db, 'requests'), orderBy('timestamp', 'desc'));
      unsubReq = onSnapshot(q1, (snapshot) => {
        if (!isMounted) return;
        const list: FriendRequest[] = [];
        snapshot.forEach((docItem) => {
          const d = docItem.data();
          list.push({
            id: docItem.id,
            visitorId: d.visitorId || docItem.id,
            name: d.name || 'Visitor',
            email: d.email || '',
            location: d.location || '',
            status: d.status || 'pending',
            timestamp: d.timestamp?.toMillis ? d.timestamp.toMillis() : (d.timestamp || Date.now()),
          });
        });
        emitRequests(list);
      });

      const q2 = query(collection(db, 'friendRequests'), orderBy('timestamp', 'desc'));
      unsubFriend = onSnapshot(q2, (snapshot) => {
        if (!isMounted) return;
        const list: FriendRequest[] = [];
        snapshot.forEach((docItem) => {
          const d = docItem.data();
          list.push({
            id: docItem.id,
            visitorId: d.visitorId || docItem.id,
            name: d.name || 'Visitor',
            email: d.email || '',
            location: d.location || '',
            status: d.status || 'pending',
            timestamp: d.timestamp?.toMillis ? d.timestamp.toMillis() : (d.timestamp || Date.now()),
          });
        });
        emitRequests(list);
      });
    } catch (e) {}
  }

  // 2. Server fetch & SSE
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const list: FriendRequest[] = await res.json();
        if (isMounted) emitRequests(list);
      }
    } catch (e) {}
  };

  fetchRequests();

  let eventSource: EventSource | null = null;
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      eventSource = new EventSource('/api/chat/stream?role=owner');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.type === 'new_request' ||
            payload.type === 'request_updated' ||
            payload.type === 'request_deleted'
          ) {
            fetchRequests();
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  const pollTimer = setInterval(() => {
    if (isMounted) fetchRequests();
  }, 3000);

  return () => {
    isMounted = false;
    clearInterval(pollTimer);
    if (unsubReq) unsubReq();
    if (unsubFriend) unsubFriend();
    if (eventSource) eventSource.close();
  };
}

export function subscribeToVisitorRequestStatus(
  visitorId: string,
  onUpdate: (request: FriendRequest | null) => void
): () => void {
  let isMounted = true;

  // Check local cache first
  try {
    const cached =
      localStorage.getItem('elonverse_request_' + visitorId) ||
      localStorage.getItem(LOCAL_REQUEST_KEY + '_' + visitorId);
    if (cached) onUpdate(JSON.parse(cached));
  } catch (e) {}

  // 1. Firestore single doc listener on 'requests' and 'friendRequests'
  let unsubReq: (() => void) | null = null;
  let unsubLegacy: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const docRef1 = doc(db, 'requests', visitorId);
      unsubReq = onSnapshot(docRef1, (snapshot) => {
        if (!isMounted) return;
        if (snapshot.exists()) {
          const d = snapshot.data();
          const reqObj: FriendRequest = {
            id: snapshot.id,
            visitorId: d.visitorId || snapshot.id,
            name: d.name || '',
            email: d.email || '',
            location: d.location || '',
            status: d.status || 'pending',
            timestamp: d.timestamp?.toMillis ? d.timestamp.toMillis() : (d.timestamp || Date.now()),
          };
          try {
            localStorage.setItem('elonverse_request_' + visitorId, JSON.stringify(reqObj));
          } catch (e) {}
          onUpdate(reqObj);
        }
      });

      const docRef2 = doc(db, 'friendRequests', visitorId);
      unsubLegacy = onSnapshot(docRef2, (snapshot) => {
        if (!isMounted) return;
        if (snapshot.exists()) {
          const d = snapshot.data();
          const reqObj: FriendRequest = {
            id: snapshot.id,
            visitorId: d.visitorId || snapshot.id,
            name: d.name || '',
            email: d.email || '',
            location: d.location || '',
            status: d.status || 'pending',
            timestamp: d.timestamp?.toMillis ? d.timestamp.toMillis() : (d.timestamp || Date.now()),
          };
          try {
            localStorage.setItem('elonverse_request_' + visitorId, JSON.stringify(reqObj));
          } catch (e) {}
          onUpdate(reqObj);
        }
      });
    } catch (e) {}
  }

  // 2. Server fetch & SSE
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/requests/status?visitorId=${encodeURIComponent(visitorId)}`);
      if (res.ok) {
        const json = await res.json();
        if (isMounted) {
          if (json.request) {
            try {
              localStorage.setItem('elonverse_request_' + visitorId, JSON.stringify(json.request));
            } catch (e) {}
          }
          onUpdate(json.request);
        }
      }
    } catch (e) {}
  };

  fetchStatus();

  let eventSource: EventSource | null = null;
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      eventSource = new EventSource(`/api/chat/stream?visitorId=${encodeURIComponent(visitorId)}`);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'request_updated') {
            fetchStatus();
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  const pollTimer = setInterval(() => {
    if (isMounted) fetchStatus();
  }, 3000);

  return () => {
    isMounted = false;
    clearInterval(pollTimer);
    if (unsubReq) unsubReq();
    if (unsubLegacy) unsubLegacy();
    if (eventSource) eventSource.close();
  };
}

export async function updateFriendRequestStatus(
  visitorId: string,
  status: 'accepted' | 'declined'
) {
  // 1. Server patch
  try {
    await fetch(`/api/requests/${encodeURIComponent(visitorId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (e) {}

  // 2. Firestore update
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const reqRef = doc(db, 'requests', visitorId);
      await setDoc(reqRef, { status }, { merge: true });

      const legacyReqRef = doc(db, 'friendRequests', visitorId);
      await setDoc(legacyReqRef, { status }, { merge: true });

      const convRef = doc(db, 'conversations', visitorId);
      await setDoc(convRef, { visitorId, status, timestamp: serverTimestamp() }, { merge: true });

      const visitorRef = doc(db, 'visitors', visitorId);
      await setDoc(visitorRef, { visitorId, status, timestamp: serverTimestamp() }, { merge: true });
    } catch (e) {}
  }
}

export function isFirebaseConnected(): boolean {
  const { isConnected } = initFirebaseService();
  return isConnected;
}
