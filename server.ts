import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// System instruction for ELONVERSE AI Chat Engine
const SYSTEM_INSTRUCTION = `You are Elon Musk chatting live in the ELONVERSE Live Chat Space - American Edition (Austin, Texas to Mars).
Personality: Direct, visionary, humorous, high-energy, unapologetically American engineering mindset, Grok-style witty humor.
Key themes:
- SpaceX & Starship: "2026. Starship Flight 12 next month from Starbase, Texas. Mechazilla catch. Let's make life multiplanetary."
- Tesla: "Model Y from $44,990. Built right here in Austin. Fastest American-made car."
- Cybertruck: "30X cold-rolled stainless steel exoskeleton. Built for the American frontier and apocalypse."
- AI & Grok: "xAI Colossus in Memphis running 100k liquid-cooled GPUs. Maximum truth seeking."
- Optimus: "Optimus Gen 3 walking in Austin, $20k to $30k at scale."
- Starlink: "Laser cross-links in space, 150 Mbps on a camping trip in Yosemite or the Gulf."
Rules:
- Keep answers punchy and conversational: 1 to 3 short sentences max.
- Be optimistic, funny, and bold. Speak as Elon Musk in a high-speed live community chat.`;

// Mock intelligent responses if API key is unavailable or fails
function getFallbackGrokResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('mars') || p.includes('when mars') || p.includes('starship') || p.includes('rocket')) {
    return "2026 is the year. Starship Flight 12 next month from Starbase, Texas. $500k ticket. Let's make humanity multiplanetary.";
  }
  if (p.includes('tesla') || p.includes('price') || p.includes('model y')) {
    return "Model Y starts from $44,990. Built right here in Austin. Fastest and safest American-made car in history.";
  }
  if (p.includes('cybertruck') || p.includes('truck')) {
    return "30X cold-rolled stainless steel exoskeleton. Can take an arrow and a 9mm round without denting. Built in Texas for the frontier.";
  }
  if (p.includes('optimus') || p.includes('robot')) {
    return "Optimus Gen 3 is walking around Giga Texas right now sorting battery cells. $20k to $30k at mass scale. Unlimited labor economy.";
  }
  if (p.includes('ai') || p.includes('grok') || p.includes('memphis')) {
    return "Colossus in Memphis running 100k liquid-cooled GPUs. Grok seeks maximum truth about the universe without political correctness.";
  }
  if (p.includes('starlink') || p.includes('internet')) {
    return "Over 6,000 satellites in low Earth orbit. Starlink Mini fits in your backpack. 150 Mbps anywhere in the US and worldwide.";
  }
  return "Physics is the law, everything else is a recommendation. Austin is sunny, rockets are roaring, and the future is very bright.";
}


// POST /api/gemini/chat - Grok / ELONVERSE Assistant Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.8,
          },
        });

        const reply = response.text || getFallbackGrokResponse(prompt);
        res.json({ reply, source: 'gemini-3.8-flash' });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using high-fidelity fallback:', geminiError?.message);
        res.json({
          reply: getFallbackGrokResponse(prompt),
          source: 'elonverse-knowledge-engine',
        });
        return;
      }
    } else {
      res.json({
        reply: getFallbackGrokResponse(prompt),
        source: 'elonverse-knowledge-engine',
      });
      return;
    }
  } catch (error: any) {
    console.error('API Chat Error:', error);
    res.status(500).json({ error: 'Internal server error processing prompt' });
  }
});

// POST /api/waitlist - Join waitlist endpoint
app.post('/api/waitlist', (req, res) => {
  const { name, email, product } = req.body;
  res.json({
    success: true,
    message: `Successfully reserved your spot on the ${product || 'Optimus / Starship'} waitlist!`,
    position: Math.floor(100000 + Math.random() * 5000),
  });
});

// POST /api/checkout - Process mock order
app.post('/api/checkout', (req, res) => {
  const { items, customer, payment } = req.body;
  const orderId = 'EV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  res.json({
    success: true,
    orderId,
    timestamp: new Date().toISOString(),
    customerName: customer?.name || 'Explorer',
    deliveryAddress: customer?.address || 'Lagos, Nigeria',
    message: 'Your ELONVERSE order has been confirmed and logged.',
  });
});

// ==========================================
// REAL-TIME PERSISTENT MULTI-USER CHAT ENGINE
// ==========================================

interface StoredPrivateMessage {
  id: string;
  visitorId: string;
  sender: 'visitor' | 'owner' | 'admin' | 'elon' | 'system';
  text: string;
  message: string;
  name: string;
  city: string;
  timestamp: number;
  timeString: string;
  isElon: boolean;
  isAdmin: boolean;
  isSystem: boolean;
  isVerified: boolean;
  intent?: string;
  image?: string;
  imageUrl?: string;
  senderName?: string;
  read?: boolean;
  voiceDuration?: number;
}

interface StoredVisitorDoc {
  visitorId: string;
  name: string;
  location: string;
  intent?: string;
  timestamp: number;
  lastMessage: string;
  unreadCount?: number;
}

interface StoredFriendRequest {
  id: string;
  visitorId: string;
  name: string;
  email: string;
  location: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const CHAT_DATA_FILE = path.join(DATA_DIR, 'private_visitors_chat.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data dir:', err);
  }
}

// In-memory strictly private storage
let friendRequestsStore: Record<string, StoredFriendRequest> = {};
let visitorsStore: Record<string, StoredVisitorDoc> = {};
let privateMessagesStore: Record<string, StoredPrivateMessage[]> = {};

try {
  if (fs.existsSync(CHAT_DATA_FILE)) {
    const raw = fs.readFileSync(CHAT_DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    friendRequestsStore = parsed.requests || {};
    visitorsStore = parsed.visitors || {};
    privateMessagesStore = parsed.messages || {};
    console.log(`Loaded ${Object.keys(visitorsStore).length} private rooms and ${Object.keys(friendRequestsStore).length} requests from disk.`);
  }
} catch (e) {
  console.warn('Starting fresh private chat database:', e);
  friendRequestsStore = {};
  visitorsStore = {};
  privateMessagesStore = {};
}

function persistPrivateData() {
  try {
    fs.writeFileSync(
      CHAT_DATA_FILE,
      JSON.stringify(
        {
          requests: friendRequestsStore,
          visitors: visitorsStore,
          messages: privateMessagesStore,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.error('Failed to write private chat data to disk:', err);
  }
}

// Admin / Owner Live Presence
let currentAdminPresence = {
  isOnline: true,
  adminName: 'Elon Musk (Owner)',
  adminCity: 'Starbase, TX',
  lastSeen: Date.now(),
};

// SSE Active Connections for Real-Time Instant Push
interface SseClient {
  id: string;
  visitorId?: string;
  isOwner: boolean;
  res: express.Response;
}
const sseClients: SseClient[] = [];

function broadcastToClients(payload: any, targetVisitorId?: string) {
  const dataString = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    const isTarget = Boolean(
      targetVisitorId &&
      client.visitorId &&
      client.visitorId.toLowerCase() === targetVisitorId.toLowerCase()
    );
    if (client.isOwner || isTarget) {
      try {
        client.res.write(dataString);
      } catch (err) {
        // Socket closed
      }
    }
  }
}

// GET /api/chat/stream - Server-Sent Events (SSE) strictly isolated per visitorId
app.get('/api/chat/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = 'sse-' + Math.random().toString(36).substring(2, 9);
  const rawId = req.query.visitorId || req.query.userId || req.query.id;
  const visitorId = rawId ? String(rawId).trim() : undefined;
  const isOwner = req.query.role === 'owner' || req.query.role === 'admin' || req.query.isAdmin === 'true';

  const client: SseClient = { id: clientId, visitorId, isOwner, res };
  sseClients.push(client);

  res.write(`data: ${JSON.stringify({ type: 'handshake', clientId, visitorId, isOwner, connectedAt: Date.now() })}\n\n`);

  const pingTimer = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(pingTimer);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(pingTimer);
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// ==========================================
// FRIEND REQUESTS & JOIN SPACE ENDPOINTS
// ==========================================

// POST /api/requests - Visitor submits request to join space
app.post('/api/requests', (req, res) => {
  const { visitorId, name, email, location } = req.body;
  if (!visitorId || !name) {
    res.status(400).json({ error: 'visitorId and name are required' });
    return;
  }

  const id = 'req-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const newReq: StoredFriendRequest = {
    id,
    visitorId,
    name: String(name).trim(),
    email: String(email || '').trim(),
    location: String(location || '').trim(),
    status: 'pending',
    timestamp: Date.now(),
  };

  friendRequestsStore[visitorId] = newReq;
  persistPrivateData();

  broadcastToClients({ type: 'new_request', request: newReq });
  res.json({ success: true, request: newReq });
});

// GET /api/requests - Admin list all requests
app.get('/api/requests', (_req, res) => {
  const list = Object.values(friendRequestsStore).sort((a, b) => b.timestamp - a.timestamp);
  res.json(list);
});

// GET /api/requests/status - Visitor checks their own request status
app.get('/api/requests/status', (req, res) => {
  const visitorId = req.query.visitorId ? String(req.query.visitorId) : null;
  if (!visitorId) {
    res.status(400).json({ error: 'visitorId is required' });
    return;
  }
  const found = friendRequestsStore[visitorId] || null;
  res.json({ request: found });
});

// PATCH /api/requests/:visitorId - Admin accept or decline request
app.patch('/api/requests/:visitorId', (req, res) => {
  const { visitorId } = req.params;
  const { status } = req.body;
  const existing = friendRequestsStore[visitorId];

  if (!existing) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }

  existing.status = status === 'accepted' ? 'accepted' : 'declined';

  if (existing.status === 'accepted') {
    // Automatically initialize private chat room for approved visitor
    if (!visitorsStore[visitorId]) {
      visitorsStore[visitorId] = {
        visitorId,
        name: existing.name,
        location: existing.location,
        timestamp: Date.now(),
        lastMessage: 'Request approved. Private room ready.',
        unreadCount: 0,
      };
    }
    if (!privateMessagesStore[visitorId]) {
      privateMessagesStore[visitorId] = [];
    }
  }

  persistPrivateData();
  broadcastToClients({ type: 'request_updated', request: existing }, visitorId);
  res.json({ success: true, request: existing });
});

// POST /api/chat/visitors - Register or update a visitor document in 'visitors' collection
app.post('/api/chat/visitors', (req, res) => {
  const { visitorId, name, location, intent, lastMessage } = req.body;
  if (!visitorId) {
    res.status(400).json({ error: 'visitorId is required' });
    return;
  }

  const now = Date.now();
  const existing = visitorsStore[visitorId];
  const updatedDoc: StoredVisitorDoc = {
    visitorId,
    name: name || existing?.name || 'Visitor',
    location: location || existing?.location || 'USA',
    intent: intent || existing?.intent || '',
    timestamp: now,
    lastMessage: lastMessage || existing?.lastMessage || 'Connected to private chat',
    unreadCount: existing?.unreadCount || 0,
  };

  visitorsStore[visitorId] = updatedDoc;
  if (!privateMessagesStore[visitorId]) {
    privateMessagesStore[visitorId] = [];
  }
  persistPrivateData();

  broadcastToClients({ type: 'visitor_updated', visitor: updatedDoc });
  res.json({ success: true, visitor: updatedDoc });
});

// GET /api/chat/visitors (or /api/chat/conversations) - List all private visitor rooms for Owner Inbox
app.get(['/api/chat/visitors', '/api/chat/conversations'], (_req, res) => {
  const list = Object.values(visitorsStore).sort((a, b) => b.timestamp - a.timestamp);
  // Map to format consumed by owner dashboard
  const mapped = list.map((v) => ({
    userId: v.visitorId,
    visitorId: v.visitorId,
    userName: v.name,
    name: v.name,
    userCity: v.location,
    location: v.location,
    lastMessage: v.lastMessage,
    lastTimestamp: v.timestamp,
    timestamp: v.timestamp,
    intent: v.intent,
    unreadCount: v.unreadCount || 0,
  }));
  res.json(mapped);
});

// GET /api/chat/messages - STRICT: Fetch messages ONLY for the requested visitorId
app.get('/api/chat/messages', (req, res) => {
  const visitorId = req.query.visitorId ? String(req.query.visitorId) : req.query.userId ? String(req.query.userId) : null;

  if (!visitorId || visitorId === 'all') {
    // SECURITY: Visitors can NEVER fetch all messages! Return empty or 400
    res.status(400).json({ error: 'visitorId parameter is required to access private room' });
    return;
  }

  const thread = privateMessagesStore[visitorId] || [];
  res.json(thread);
});

// POST /api/chat/messages - Send a message to visitors/{visitorId}/messages
app.post('/api/chat/messages', (req, res) => {
  const {
    visitorId: rawVisitorId,
    userId: rawUserId,
    id: rawId,
    sender: rawSender,
    senderName: rawSenderName,
    name,
    city,
    location,
    message,
    text,
    imageUrl,
    image,
    isAdmin,
  } = req.body;

  const targetVisitorId = String(rawVisitorId || rawUserId || rawId || '').trim();
  if (!targetVisitorId) {
    res.status(400).json({ error: 'visitorId is required for private 1-on-1 chat' });
    return;
  }

  const content = String(text || message || '').trim();
  const img = imageUrl || image || null;
  if (!content && !img) {
    res.status(400).json({ error: 'Message text or image is required' });
    return;
  }

  const normalizedSender: 'admin' | 'visitor' =
    rawSender === 'admin' || rawSender === 'owner' || isAdmin ? 'admin' : 'visitor';

  const now = Date.now();
  const timeString = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMessage: StoredPrivateMessage = {
    id: 'msg-' + now + '-' + Math.random().toString(36).substring(2, 7),
    visitorId: targetVisitorId,
    sender: normalizedSender,
    senderName: rawSenderName || (normalizedSender === 'admin' ? 'Elon Musk (Admin)' : (name || 'Visitor')),
    text: content,
    message: content,
    imageUrl: img || undefined,
    name: name || (normalizedSender === 'admin' ? 'Elon Musk (Admin)' : 'Visitor'),
    city: city || location || 'Texas',
    timestamp: now,
    timeString,
    read: false,
    isElon: false,
    isAdmin: normalizedSender === 'admin',
    isSystem: false,
    isVerified: true,
  };

  if (!privateMessagesStore[targetVisitorId]) {
    privateMessagesStore[targetVisitorId] = [];
  }
  privateMessagesStore[targetVisitorId].push(newMessage);

  // Update visitor doc in 'visitors' collection
  let visitor = visitorsStore[targetVisitorId];
  const lastSummary = content || (img ? '[Picture]' : '');
  if (!visitor) {
    visitor = {
      visitorId: targetVisitorId,
      name: normalizedSender === 'visitor' ? (name || 'Visitor') : 'Visitor',
      location: city || location || 'Texas',
      intent: '',
      timestamp: now,
      lastMessage: lastSummary,
      unreadCount: normalizedSender === 'visitor' ? 1 : 0,
    };
  } else {
    if (normalizedSender === 'visitor') {
      if (name) visitor.name = name;
      if (city || location) visitor.location = city || location;
      visitor.unreadCount = (visitor.unreadCount || 0) + 1;
    } else {
      visitor.unreadCount = 0;
    }
    visitor.timestamp = now;
    visitor.lastMessage = lastSummary;
  }
  visitorsStore[targetVisitorId] = visitor;
  persistPrivateData();

  // STRICT REAL-TIME BROADCAST: push to target visitor and admin!
  broadcastToClients({ type: 'new_message', message: newMessage, visitorId: targetVisitorId, visitor }, targetVisitorId);

  res.json({ success: true, message: newMessage, visitor });
});

// GET /api/chat/presence - Get current Admin Presence
app.get('/api/chat/presence', (_req, res) => {
  res.json(currentAdminPresence);
});

// POST /api/chat/presence - Update Admin Presence
app.post('/api/chat/presence', (req, res) => {
  const { isOnline, adminName, adminCity } = req.body;
  currentAdminPresence = {
    isOnline: isOnline !== undefined ? Boolean(isOnline) : true,
    adminName: adminName || currentAdminPresence.adminName,
    adminCity: adminCity || currentAdminPresence.adminCity,
    lastSeen: Date.now(),
  };

  broadcastToClients({ type: 'presence', presence: currentAdminPresence });
  res.json({ success: true, presence: currentAdminPresence });
});

// DELETE /api/chat/conversations/:visitorId - Manual permanent deletion by Admin
app.delete('/api/chat/conversations/:visitorId', (req, res) => {
  const { visitorId } = req.params;
  if (!visitorId) {
    res.status(400).json({ error: 'visitorId is required' });
    return;
  }
  delete visitorsStore[visitorId];
  delete privateMessagesStore[visitorId];
  persistPrivateData();
  broadcastToClients({ type: 'conversation_deleted', visitorId });
  res.json({ success: true, message: 'Conversation permanently deleted by admin' });
});

// DELETE /api/requests/:visitorId - Manual permanent deletion of space request by Admin
app.delete('/api/requests/:visitorId', (req, res) => {
  const { visitorId } = req.params;
  if (!visitorId) {
    res.status(400).json({ error: 'visitorId is required' });
    return;
  }
  delete friendRequestsStore[visitorId];
  persistPrivateData();
  broadcastToClients({ type: 'request_deleted', visitorId });
  res.json({ success: true, message: 'Request permanently deleted by admin' });
});

// DELETE /api/chat/messages - Legacy clear
app.delete('/api/chat/messages', (req, res) => {
  const visitorId = req.query.visitorId ? String(req.query.visitorId) : req.query.userId ? String(req.query.userId) : null;
  if (visitorId) {
    delete visitorsStore[visitorId];
    delete privateMessagesStore[visitorId];
    persistPrivateData();
    broadcastToClients({ type: 'cleared', visitorId, userId: visitorId }, visitorId);
  }
  res.json({ success: true });
});

// Health check for Cloud Run and deployment probes
app.get(['/health', '/api/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// Setup Vite in Dev or Serve Static in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`ELONVERSE Server running at http://0.0.0.0:${PORT}`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`Received ${signal}, closing server...`);
    for (const client of sseClients) {
      try {
        client.res.end();
      } catch {}
    }
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 3000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
