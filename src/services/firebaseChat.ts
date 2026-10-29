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
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { ChatMessage, VisitorConversation, AdminPresence, UserIntent, MessageSender, FriendRequest } from '../types/chat';

export const OWNER_ID = 'elon_musk_owner';
const LOCAL_MESSAGES_KEY = 'elonverse_private_messages_v5';
const LOCAL_REQUEST_KEY = 'elonverse_friend_request_v5';
const LOCAL_PRESENCE_KEY = 'elonverse_admin_presence_v5';

// Retrieve local messages for ultra-fast instant offline/online cache
let localMessages: ChatMessage[] = [];
try {
  const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
  if (saved) {
    localMessages = JSON.parse(saved);
  }
} catch (e) {
  localMessages = [];
}

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
 * Register visitor in 'visitors' collection:
 * visitors/{visitorId} -> { visitorId, name, location, intent, timestamp, lastMessage }
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

  // 2. Firestore Document Registration
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
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
 * Subscribe to a visitor's PRIVATE chat room:
 * privateChats/{userId}/messages - ordered by timestamp
 * Uses onSnapshot() for LIVE real-time updates on BOTH admin and visitor side!
 */
export function subscribeToUserChat(
  visitorId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  let isMounted = true;
  let activeMessages: ChatMessage[] = [];

  const emitMerged = (incomingMsgs: ChatMessage[]) => {
    if (!isMounted) return;
    const map = new Map<string, ChatMessage>();
    // Cache
    localMessages.filter((m) => m.userId === visitorId || m.visitorId === visitorId).forEach((m) => map.set(m.id, m));
    // Overwrite with incoming
    incomingMsgs.forEach((m) => map.set(m.id, m));

    const sorted = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
    activeMessages = sorted;
    onUpdate(sorted);
  };

  // 1. Firestore Real-time onSnapshot on privateChats/{userId}/messages
  let unsubFirestore: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const chatSubcollection = collection(db, 'privateChats', visitorId, 'messages');
      const q = query(chatSubcollection, orderBy('timestamp', 'asc'));
      unsubFirestore = onSnapshot(
        q,
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

  // 2. Central Server REST fetch strictly scoped to visitorId
  const fetchThread = async () => {
    try {
      const res = await fetch(`/api/chat/messages?visitorId=${encodeURIComponent(visitorId)}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        emitMerged(data);
      }
    } catch (err) {
      const cached = localMessages.filter((m) => m.userId === visitorId || m.visitorId === visitorId);
      if (activeMessages.length === 0) onUpdate(cached);
    }
  };
  fetchThread();

  // 3. Real-time Push via SSE strictly scoped to visitorId
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
          } else if (payload.type === 'cleared') {
            if (payload.visitorId === visitorId || payload.userId === visitorId) {
              activeMessages = [];
              onUpdate([]);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  // 4. Polling fallback every 1.5s for instant two-way sync
  const pollInterval = setInterval(() => {
    if (isMounted) fetchThread();
  }, 1500);

  // 5. Multi-tab channel
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
    if (unsubFirestore) unsubFirestore();
    if (eventSource) eventSource.close();
    if (broadcastChannel) broadcastChannel.removeEventListener('message', handleBroadcast);
  };
}

/**
 * Subscribe for Owner to see ALL visitor cards from 'visitors' collection:
 * visitors collection -> { visitorId, name, location, intent, timestamp, lastMessage }
 */
export function subscribeToAllConversations(
  onUpdate: (conversations: VisitorConversation[]) => void
): () => void {
  let isMounted = true;

  // 1. Firestore Real-time onSnapshot for 'visitors' collection
  let unsubFirestore: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const visitorsRef = collection(db, 'visitors');
      const q = query(visitorsRef, orderBy('timestamp', 'desc'));
      unsubFirestore = onSnapshot(
        q,
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
          onUpdate(list);
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
        if (isMounted) onUpdate(list);
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
          if (payload.type === 'new_message' || payload.type === 'visitor_updated' || payload.type === 'cleared') {
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
    if (unsubFirestore) unsubFirestore();
    if (eventSource) eventSource.close();
  };
}

/**
 * Send message to: visitors/{visitorId}/messages
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
 * Send message to: privateChats/{userId}/messages
 * with { id, text, imageUrl, sender: 'admin' | 'visitor', senderName, timestamp: serverTimestamp(), read: false }
 * Updates lastMessage in 'visitors' and 'privateChats' docs
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
  localMessages = [...localMessages, tempMessage];
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(localMessages));
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

  // 3. Write to Firestore collection: privateChats/{userId}/messages
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
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

      // Backward compatibility subcollection
      const legacySub = collection(db, 'visitors', targetVisitorId, 'messages');
      await addDoc(legacySub, {
        sender: normalizedSender,
        text: msg.message || '',
        message: msg.message || '',
        imageUrl: imgUrl || null,
        image: imgUrl || null,
        name: senderDisplayName,
        city: msg.city || 'Texas',
        location: msg.city || 'Texas',
        timestamp: serverTimestamp(),
        visitorId: targetVisitorId,
        read: false,
      });

      // Update visitor document in 'visitors' and 'privateChats'
      const lastSummary = msg.message || (imgUrl ? '[Picture]' : '');
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

      const privateChatDocRef = doc(db, 'privateChats', targetVisitorId);
      await setDoc(
        privateChatDocRef,
        {
          visitorId: targetVisitorId,
          lastMessage: lastSummary,
          timestamp: serverTimestamp(),
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
  } catch (err) {}

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'ADMIN_PRESENCE', presence });
  }

  try {
    await fetch('/api/chat/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(presence),
    });
  } catch (e) {}

  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const presenceDoc = doc(db, 'presence', 'admin');
      setDoc(presenceDoc, {
        ...presence,
        lastSeen: serverTimestamp(),
      });
    } catch (e) {}
  }
}

/**
 * Subscribe to Admin Presence
 */
export function subscribeToAdminPresence(onUpdate: (presence: AdminPresence) => void): () => void {
  let isMounted = true;

  const fetchPresence = async () => {
    try {
      const res = await fetch('/api/chat/presence');
      if (res.ok) {
        const data: AdminPresence = await res.json();
        if (isMounted) onUpdate(data);
      }
    } catch (e) {
      try {
        const saved = localStorage.getItem(LOCAL_PRESENCE_KEY);
        if (saved && isMounted) onUpdate(JSON.parse(saved));
      } catch (err) {}
    }
  };

  fetchPresence();

  const timer = setInterval(() => {
    if (isMounted) fetchPresence();
  }, 5000);

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'ADMIN_PRESENCE' && isMounted) {
      onUpdate(e.data.presence);
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    isMounted = false;
    clearInterval(timer);
    if (broadcastChannel) broadcastChannel.removeEventListener('message', handleBroadcast);
  };
}

// ==========================================
// FRIEND REQUESTS SERVICE (friendRequests collection)
// ==========================================

export async function sendFriendRequest(data: {
  visitorId: string;
  name: string;
  email: string;
  location: string;
}): Promise<FriendRequest> {
  const reqObj: FriendRequest = {
    id: 'req-' + Date.now(),
    visitorId: data.visitorId,
    name: data.name.trim(),
    email: data.email.trim(),
    location: data.location.trim(),
    status: 'pending',
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(LOCAL_REQUEST_KEY + '_' + data.visitorId, JSON.stringify(reqObj));
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

  // 2. Post to Firestore friendRequests collection
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const reqDoc = doc(db, 'friendRequests', data.visitorId);
      await setDoc(reqDoc, {
        ...reqObj,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Firestore friendRequests write error:', e);
    }
  }

  return reqObj;
}

export function subscribeToFriendRequests(
  onUpdate: (requests: FriendRequest[]) => void
): () => void {
  let isMounted = true;

  // 1. Firestore listener if connected
  let unsubFirestore: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const q = query(collection(db, 'friendRequests'), orderBy('timestamp', 'desc'));
      unsubFirestore = onSnapshot(q, (snapshot) => {
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
        onUpdate(list);
      });
    } catch (e) {}
  }

  // 2. Server fetch & SSE
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const list: FriendRequest[] = await res.json();
        if (isMounted) onUpdate(list);
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
          if (payload.type === 'new_request' || payload.type === 'request_updated') {
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
    if (unsubFirestore) unsubFirestore();
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
    const cached = localStorage.getItem(LOCAL_REQUEST_KEY + '_' + visitorId);
    if (cached) onUpdate(JSON.parse(cached));
  } catch (e) {}

  // 1. Firestore single doc listener
  let unsubFirestore: (() => void) | null = null;
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const docRef = doc(db, 'friendRequests', visitorId);
      unsubFirestore = onSnapshot(docRef, (snapshot) => {
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
              localStorage.setItem(LOCAL_REQUEST_KEY + '_' + visitorId, JSON.stringify(json.request));
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
    if (unsubFirestore) unsubFirestore();
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
      const reqRef = doc(db, 'friendRequests', visitorId);
      await setDoc(reqRef, { status }, { merge: true });

      if (status === 'accepted') {
        const visitorRef = doc(db, 'visitors', visitorId);
        await setDoc(visitorRef, { visitorId, status: 'accepted', timestamp: serverTimestamp() }, { merge: true });
      }
    } catch (e) {}
  }
}

export function isFirebaseConnected(): boolean {
  const { isConnected } = initFirebaseService();
  return isConnected;
}
