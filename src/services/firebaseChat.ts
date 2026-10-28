import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import { ChatMessage, VisitorConversation, AdminPresence, UserIntent } from '../types/chat';

const LOCAL_MESSAGES_KEY = 'elonverse_direct_messages_v4';
const LOCAL_PRESENCE_KEY = 'elonverse_admin_presence_v4';

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
    broadcastChannel = new BroadcastChannel('elonverse_chat_bus_v4');
  } catch (e) {}
}

// Optional Firebase initialization
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
      console.log('Firebase Firestore direct chat connected!');
    } catch (err) {
      console.warn('Firebase init fallback:', err);
    }
  }

  return { db: firestoreDb, isConnected: isConfiguredFirebase };
}

// ==============================================================
// REAL LIVE SERVER SYNCHRONIZATION (CROSS-DEVICE & CROSS-USER)
// ==============================================================

/**
 * Subscribe to a 1-on-1 direct conversation with Admin & Elon AI.
 * Uses real backend server API + Server-Sent Events (SSE) + fast polling fallback.
 * Works across completely different devices, phones, and computers in real-time.
 */
export function subscribeToUserChat(
  userId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  let isMounted = true;
  let activeMessages: ChatMessage[] = [];

  // Helper to deduplicate and update
  const emitMerged = (serverMsgs: ChatMessage[]) => {
    if (!isMounted) return;
    const map = new Map<string, ChatMessage>();
    // Insert local cache first
    localMessages.filter((m) => m.userId === userId).forEach((m) => map.set(m.id, m));
    // Overwrite with authoritative server messages
    serverMsgs.forEach((m) => map.set(m.id, m));

    const sorted = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
    activeMessages = sorted;
    onUpdate(sorted);
  };

  // 1. Initial REST Fetch from centralized Express backend
  const fetchThread = async () => {
    try {
      const res = await fetch(`/api/chat/messages?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        emitMerged(data);
      }
    } catch (err) {
      // Fallback to local cache if network blip
      const cached = localMessages.filter((m) => m.userId === userId);
      if (activeMessages.length === 0) onUpdate(cached);
    }
  };

  fetchThread();

  // 2. Real-time Push via Server-Sent Events (SSE)
  let eventSource: EventSource | null = null;
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      eventSource = new EventSource(`/api/chat/stream?userId=${encodeURIComponent(userId)}`);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'new_message' && payload.message) {
            const incoming: ChatMessage = payload.message;
            if (incoming.userId === userId) {
              const exists = activeMessages.some((m) => m.id === incoming.id);
              if (!exists) {
                const next = [...activeMessages, incoming].sort((a, b) => a.timestamp - b.timestamp);
                activeMessages = next;
                onUpdate(next);
              }
            }
          } else if (payload.type === 'cleared') {
            if (payload.userId === userId || !payload.userId) {
              activeMessages = [];
              onUpdate([]);
            }
          }
        } catch (e) {}
      };

      eventSource.onerror = () => {
        // SSE error, polling below will keep connection active seamlessly
      };
    } catch (e) {
      console.warn('SSE initialization error:', e);
    }
  }

  // 3. Fallback Periodic Polling (every 2.5s) to guarantee updates on mobile browsers
  const pollInterval = setInterval(() => {
    if (isMounted) {
      fetchThread();
    }
  }, 2500);

  // 4. Multi-tab broadcast channel
  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'MSG_UPDATE' && e.data?.userId === userId) {
      fetchThread();
    }
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    isMounted = false;
    clearInterval(pollInterval);
    if (eventSource) {
      eventSource.close();
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

/**
 * Subscribe for Admin to see all active incoming visitor conversation threads.
 * Receives incoming visitor transmissions from any user worldwide in real-time.
 */
export function subscribeToAllConversations(
  onUpdate: (conversations: VisitorConversation[]) => void
): () => void {
  let isMounted = true;

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const list: VisitorConversation[] = await res.json();
        if (isMounted) {
          onUpdate(list);
        }
      }
    } catch (err) {
      // Local fallback
      buildLocalConversations();
    }
  };

  const buildLocalConversations = () => {
    const map = new Map<string, VisitorConversation>();
    localMessages.forEach((msg) => {
      if (!msg.userId || msg.userId === 'general') return;
      const existing = map.get(msg.userId);
      const isVisitor = !msg.isAdmin && !msg.isElon && !msg.isSystem;

      if (!existing) {
        map.set(msg.userId, {
          userId: msg.userId,
          userName: isVisitor ? msg.name : 'Visitor',
          userCity: isVisitor ? msg.city : 'USA',
          lastMessage: msg.message,
          lastTimestamp: msg.timestamp,
          intent: msg.intent,
          unreadCount: isVisitor ? 1 : 0,
        });
      } else {
        if (isVisitor) {
          existing.userName = msg.name;
          existing.userCity = msg.city;
          if (msg.intent) existing.intent = msg.intent;
        }
        if (msg.timestamp >= existing.lastTimestamp) {
          existing.lastMessage = msg.message;
          existing.lastTimestamp = msg.timestamp;
        }
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
    if (isMounted) onUpdate(sorted);
  };

  // Initial fetch
  fetchConversations();

  // Real-time SSE for Admin
  let eventSource: EventSource | null = null;
  if (typeof window !== 'undefined' && 'EventSource' in window) {
    try {
      eventSource = new EventSource('/api/chat/stream?role=admin');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'new_message' || payload.type === 'cleared') {
            fetchConversations();
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  // Periodic poll every 2.5s for instant updates
  const pollTimer = setInterval(() => {
    if (isMounted) {
      fetchConversations();
    }
  }, 2500);

  // Broadcast channel for multi-tab
  const handleBroadcast = () => {
    fetchConversations();
  };
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    isMounted = false;
    clearInterval(pollTimer);
    if (eventSource) eventSource.close();
    if (broadcastChannel) broadcastChannel.removeEventListener('message', handleBroadcast);
  };
}

/**
 * Send a chat message. Posts directly to the central server so all other devices
 * receive it instantly, and updates local cache.
 */
export async function sendChatMessage(msg: {
  name: string;
  city: string;
  message: string;
  isElon: boolean;
  isAdmin: boolean;
  isVerified?: boolean;
  isSystem?: boolean;
  userId: string;
  intent?: UserIntent;
  image?: string;
  voiceDuration?: number;
}): Promise<ChatMessage> {
  const newTimestamp = Date.now();
  const timeString = new Date(newTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const tempMessage: ChatMessage = {
    ...msg,
    id: 'msg-' + newTimestamp + '-' + Math.random().toString(36).substring(2, 7),
    timestamp: newTimestamp,
    timeString,
    isVerified: Boolean(msg.isAdmin || msg.isElon || msg.isVerified),
    reactions: {},
  };

  // 1. Immediate local cache update for snappy UI feedback
  localMessages = [...localMessages, tempMessage];
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(localMessages));
  } catch (err) {}

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'MSG_UPDATE', userId: msg.userId, message: tempMessage });
  }

  // 2. Real Central Server Post (Persists to server disk & broadcasts to all devices)
  try {
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempMessage),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.message) {
        return data.message;
      }
    }
  } catch (err) {
    console.warn('Server chat post error, message saved locally:', err);
  }

  // 3. Optional Firestore write if configured
  const { db, isConnected } = initFirebaseService();
  if (db && isConnected) {
    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        name: tempMessage.name,
        city: tempMessage.city,
        message: tempMessage.message,
        timestamp: serverTimestamp(),
        isElon: tempMessage.isElon,
        isAdmin: tempMessage.isAdmin,
        isVerified: tempMessage.isVerified,
        isSystem: tempMessage.isSystem || false,
        userId: tempMessage.userId,
        intent: tempMessage.intent || null,
        image: tempMessage.image || null,
        reactions: {},
      });
    } catch (err) {
      console.warn('Could not write to Firestore:', err);
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

  // Post to central server
  try {
    await fetch('/api/chat/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(presence),
    });
  } catch (e) {}

  // Optional Firestore
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

  // Poll presence every 5s
  const timer = setInterval(() => {
    if (isMounted) fetchPresence();
  }, 5000);

  // Broadcast channel
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

export function isFirebaseConnected(): boolean {
  const { isConnected } = initFirebaseService();
  return isConnected;
}
