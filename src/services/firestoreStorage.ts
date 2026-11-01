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
  Firestore,
  updateDoc,
  arrayUnion,
  serverTimestamp,
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

/**
 * Remove all undefined values from an object before passing to Firestore
 */
export function cleanFirestorePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestorePayload(item)) as any;
  }
  if (typeof obj === 'object') {
    // Preserve Firestore sentinels (serverTimestamp, arrayUnion, etc.)
    if ('_methodName' in (obj as any) || '_delegate' in (obj as any)) {
      return obj;
    }
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = cleanFirestorePayload(value);
      }
    }
    return result;
  }
  return obj;
}

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
  type?: 'text' | 'image';
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
 * in Firestore activeChats and joinRequests so they are immediately available.
 */
export async function seedInitialFirestoreData() {
  try {
    const today = '10/30/2026';

    // 1. Seed Rita (Australia) in activeChats collection
    const ritaChatRef = doc(firestore, 'activeChats', 'req-rita-australia');
    const ritaChatSnap = await getDoc(ritaChatRef);
    if (!ritaChatSnap.exists()) {
      const initRitaMsg: ChatMessageItem = {
        id: 'msg-rita-seed-1',
        from: 'admin',
        senderName: 'ELON MUSK [ADMIN]',
        text: 'Space transmission channel verified and accepted. Uplink established with Starbase, Texas.',
        date: today,
        time: '07:45 AM',
        type: 'text',
        timestamp: Date.now() - 3600000,
      };

      await setDoc(
        ritaChatRef,
        cleanFirestorePayload({
          id: 'req-rita-australia',
          name: 'RITA',
          location: 'AUSTRALIA',
          date: today,
          lastMessage: initRitaMsg.text,
          timestamp: Date.now() - 3600000,
          email: 'rita.aus@space.net',
          messages: [initRitaMsg],
        })
      );

      // Subcollection entry
      const ritaSubCol = collection(firestore, 'activeChats', 'req-rita-australia', 'messages');
      await addDoc(
        ritaSubCol,
        cleanFirestorePayload({
          id: initRitaMsg.id,
          from: 'ELON MUSK [ADMIN]',
          sender: 'admin',
          text: initRitaMsg.text,
          date: today,
          time: '07:45 AM',
          type: 'text',
          timestamp: serverTimestamp(),
        })
      ).catch(() => {});
    }

    // 2. Seed Elon Musk (Texas) in activeChats if not exists
    const elonRef = doc(firestore, 'activeChats', 'chat-elon-musk-texas');
    const elonSnap = await getDoc(elonRef);
    if (!elonSnap.exists()) {
      const elonMsg1: ChatMessageItem = {
        id: 'msg-elon-seed-1',
        from: 'admin',
        senderName: 'ELON MUSK [ADMIN]',
        text: 'Space transmission channel verified and accepted. Direct encrypted link established.',
        date: '10/29/2026',
        time: '04:54 PM',
        timestamp: Date.now() - 7200000,
      };
      const elonMsg2: ChatMessageItem = {
        id: 'msg-elon-seed-2',
        from: 'visitor',
        senderName: 'ELON MUSK',
        text: 'Telemetry check',
        date: today,
        time: '07:51 AM',
        timestamp: Date.now() - 3600000,
      };

      await setDoc(elonRef, {
        id: 'chat-elon-musk-texas',
        name: 'ELON MUSK',
        location: 'TEXAS',
        date: '10/29/2026',
        lastMessage: 'Telemetry check',
        timestamp: Date.now() - 3600000,
        email: 'elonmuskspace241@gmail.com',
        messages: [elonMsg1, elonMsg2],
      });
    }

    // 3. Seed pending join request for Rita (Australia) in joinRequests if not exists
    const ritaReqRef = doc(firestore, 'joinRequests', 'req-rita-australia');
    const ritaReqSnap = await getDoc(ritaReqRef);
    if (!ritaReqSnap.exists() && !ritaChatSnap.exists()) {
      await setDoc(ritaReqRef, {
        id: 'req-rita-australia',
        name: 'RITA',
        location: 'AUSTRALIA',
        message: 'Requesting secure uplink with Elon Musk Space Starbase terminal.',
        date: today,
        status: 'pending',
        timestamp: Date.now() - 3600000,
        email: 'rita.aus@space.net',
      });
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
 * Real-time subscription to single active chat doc and its messages subcollection
 * Combines parent doc messages array and activeChats/{chatId}/messages subcollection
 */
export function subscribeToSingleActiveChat(
  chatId: string,
  onUpdate: (chat: ActiveChatDoc | null) => void
): () => void {
  const chatDocRef = doc(firestore, 'activeChats', chatId);
  const messagesSubCol = collection(firestore, 'activeChats', chatId, 'messages');

  let currentParentDoc: any = null;
  let subColMessages: ChatMessageItem[] = [];

  const mergeAndEmit = () => {
    if (!currentParentDoc && subColMessages.length === 0) {
      return;
    }

    const parentArrayMessages: ChatMessageItem[] = Array.isArray(currentParentDoc?.messages)
      ? currentParentDoc.messages
      : [];

    // Combine both subcollection messages and parent array messages, deduplicating by id
    const messageMap = new Map<string, ChatMessageItem>();

    parentArrayMessages.forEach((m) => {
      const key = m.id || `${m.timestamp}-${m.text}`;
      messageMap.set(key, m);
    });

    subColMessages.forEach((m) => {
      const key = m.id || `${m.timestamp}-${m.text}`;
      messageMap.set(key, m);
    });

    const combinedMessages = Array.from(messageMap.values()).sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    );

    const docName =
      currentParentDoc?.name || (chatId.toLowerCase().includes('rita') ? 'RITA' : 'VISITOR');
    const docLoc =
      currentParentDoc?.location ||
      (chatId.toLowerCase().includes('australia') ? 'AUSTRALIA' : 'EARTH');

    onUpdate({
      id: chatId,
      name: docName,
      location: docLoc,
      date: currentParentDoc?.date || '10/30/2026',
      lastMessage:
        combinedMessages[combinedMessages.length - 1]?.text ||
        currentParentDoc?.lastMessage ||
        '',
      timestamp: currentParentDoc?.timestamp || Date.now(),
      messages: combinedMessages,
      email: currentParentDoc?.email || '',
    });
  };

  // 1. Listen to parent doc
  const unsubDoc = onSnapshot(
    chatDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        currentParentDoc = docSnap.data();
      }
      mergeAndEmit();
    },
    (err) => {
      console.warn('subscribeToSingleActiveChat doc error:', err);
    }
  );

  // 2. Listen to subcollection "messages"
  const unsubSubCol = onSnapshot(
    messagesSubCol,
    (snapshot) => {
      const list: ChatMessageItem[] = [];
      snapshot.forEach((snapItem) => {
        const d = snapItem.data();
        const isAdmin =
          d.from === 'ELON MUSK [ADMIN]' ||
          d.from === 'admin' ||
          d.sender === 'admin' ||
          d.isAdmin === true;
        list.push({
          id: snapItem.id,
          from: isAdmin ? 'admin' : 'visitor',
          senderName: d.from || d.senderName || (isAdmin ? 'ELON MUSK [ADMIN]' : 'Visitor'),
          text: d.text || d.message || '',
          date: d.date || '10/30/2026',
          time: d.time || '12:00 PM',
          imageUrl: d.imageUrl || undefined,
          type: d.type || (d.imageUrl ? 'image' : 'text'),
          timestamp: d.timestamp?.toMillis ? d.timestamp.toMillis() : d.timestamp || Date.now(),
        });
      });
      subColMessages = list;
      mergeAndEmit();
    },
    (err) => {
      console.warn('subscribeToSingleActiveChat subCol error:', err);
    }
  );

  return () => {
    unsubDoc();
    unsubSubCol();
  };
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

  // Sync to server JSON storage
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
    senderName: 'ELON MUSK [ADMIN]',
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

  // 1. Write to activeChats parent collection
  await setDoc(doc(firestore, 'activeChats', chatId), cleanFirestorePayload(newChatDoc));

  // 2. Write to subcollection activeChats/{chatId}/messages
  try {
    const subColRef = collection(firestore, 'activeChats', chatId, 'messages');
    await addDoc(
      subColRef,
      cleanFirestorePayload({
        id: initialMessage.id,
        from: 'ELON MUSK [ADMIN]',
        sender: 'admin',
        text: initialMessage.text,
        date: dateStr,
        time: timeStr,
        type: 'text',
        timestamp: serverTimestamp(),
      })
    );
  } catch (e) {}

  // 3. Delete from joinRequests collection
  await deleteDoc(doc(firestore, 'joinRequests', request.id));

  // 4. Sync to server backend
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
  await deleteDoc(doc(firestore, 'joinRequests', requestId));
  try {
    await fetch(`/api/requests/${encodeURIComponent(requestId)}`, {
      method: 'DELETE',
    });
  } catch (e) {}
}

/**
 * Send chat message in activeChats:
 * 1. Adds document to Firestore subcollection activeChats/{chatId}/messages with:
 *    { from: "ELON MUSK [ADMIN]", text, timestamp: serverTimestamp(), date, time, type }
 * 2. Updates parent document activeChats/{chatId} with lastMessage and arrayUnion
 * 3. Syncs with backend for multi-tier redundancy
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

  const senderLabel =
    params.from === 'admin'
      ? 'ELON MUSK [ADMIN]'
      : params.senderName || 'VISITOR';

  // Construct message item strictly WITHOUT any undefined properties
  const newMsg: ChatMessageItem = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    from: params.from,
    senderName: senderLabel,
    text: params.text || '',
    date: dateStr,
    time: timeStr,
    type: params.imageUrl ? 'image' : 'text',
    timestamp: Date.now(),
    ...(params.imageUrl ? { imageUrl: params.imageUrl } : {}),
  };

  const chatDocRef = doc(firestore, 'activeChats', params.chatId);
  const summary = params.text || (params.imageUrl ? '[Image]' : '');

  // 1. Add new document to Firestore collection "activeChats" / {chatId} document / subcollection "messages"
  try {
    const subColRef = collection(firestore, 'activeChats', params.chatId, 'messages');
    const subColPayload: any = {
      id: newMsg.id,
      from: senderLabel,
      sender: params.from,
      senderName: senderLabel,
      text: params.text || '',
      date: dateStr,
      time: timeStr,
      type: newMsg.type,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    };
    if (params.imageUrl) {
      subColPayload.imageUrl = params.imageUrl;
    }
    await addDoc(subColRef, cleanFirestorePayload(subColPayload));
  } catch (subErr) {
    console.warn('Subcollection write fallback:', subErr);
  }

  // 2. Also update parent document: lastMessage and messages array
  const sanitizedMsg = cleanFirestorePayload(newMsg);
  try {
    await updateDoc(chatDocRef, {
      messages: arrayUnion(sanitizedMsg),
      lastMessage: summary,
      timestamp: Date.now(),
    });
  } catch (err) {
    const fallbackDoc = cleanFirestorePayload({
      id: params.chatId,
      name: params.chatId.replace('req-', '').replace('chat-', '').replace(/-/g, ' ').toUpperCase(),
      location: 'EARTH',
      date: dateStr,
      lastMessage: summary,
      timestamp: Date.now(),
      messages: [sanitizedMsg],
    });
    await setDoc(chatDocRef, fallbackDoc, { merge: true });
  }

  // 3. Multi-layer redundancy server sync
  try {
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: params.chatId,
        userId: params.chatId,
        sender: params.from,
        senderName: senderLabel,
        message: newMsg.text,
        imageUrl: newMsg.imageUrl || '',
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
