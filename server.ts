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

interface StoredChatMessage {
  id: string;
  name: string;
  city: string;
  message: string;
  timestamp: number;
  timeString: string;
  isElon: boolean;
  isAdmin: boolean;
  isVerified?: boolean;
  isSystem?: boolean;
  userId: string;
  intent?: string;
  image?: string;
  voiceDuration?: number;
}

const DATA_DIR = path.resolve(__dirname, 'data');
const CHAT_DATA_FILE = path.join(DATA_DIR, 'elonverse_chat.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data dir:', err);
  }
}

// Load messages from disk or initialize
let messagesStore: StoredChatMessage[] = [];
try {
  if (fs.existsSync(CHAT_DATA_FILE)) {
    const raw = fs.readFileSync(CHAT_DATA_FILE, 'utf-8');
    messagesStore = JSON.parse(raw);
    console.log(`Loaded ${messagesStore.length} real persistent messages from disk.`);
  }
} catch (e) {
  console.warn('Failed to parse chat data file, starting fresh:', e);
  messagesStore = [];
}

function persistMessages() {
  try {
    fs.writeFileSync(CHAT_DATA_FILE, JSON.stringify(messagesStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write chat messages to disk:', err);
  }
}

// Admin Live Presence
let currentAdminPresence = {
  isOnline: true,
  adminName: 'Elon Musk (Owner)',
  adminCity: 'Starbase, TX',
  lastSeen: Date.now(),
};

// SSE Active Connections for Instant Cross-Device Real-time Broadcast
interface SseClient {
  id: string;
  userId?: string;
  isAdmin: boolean;
  res: express.Response;
}
const sseClients: SseClient[] = [];

function broadcastToClients(payload: any, targetUserId?: string) {
  const dataString = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    // Send to admins OR matching user thread
    if (client.isAdmin || !targetUserId || client.userId === targetUserId) {
      try {
        client.res.write(dataString);
      } catch (err) {
        // Socket closed
      }
    }
  }
}

// GET /api/chat/stream - Server-Sent Events (SSE) for Real-Time Instant Push
app.get('/api/chat/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const clientId = 'sse-' + Math.random().toString(36).substring(2, 9);
  const userId = req.query.userId ? String(req.query.userId) : undefined;
  const isAdmin = req.query.role === 'admin' || req.query.isAdmin === 'true';

  const client: SseClient = { id: clientId, userId, isAdmin, res };
  sseClients.push(client);

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'handshake', clientId, connectedAt: Date.now() })}\n\n`);

  // Heartbeat every 15s to keep mobile connection alive
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

// GET /api/chat/messages - Fetch real messages for a thread or all
app.get('/api/chat/messages', (req, res) => {
  const userId = req.query.userId ? String(req.query.userId) : null;
  if (userId && userId !== 'all') {
    const thread = messagesStore.filter((m) => m.userId === userId);
    res.json(thread);
    return;
  }
  res.json(messagesStore);
});

// POST /api/chat/messages - Post a real message (Visitor or Owner or Elon)
app.post('/api/chat/messages', (req, res) => {
  const { name, city, message, isElon, isAdmin, isSystem, isVerified, userId, intent, image, voiceDuration } = req.body;

  if (!message && !image && !voiceDuration) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  const now = Date.now();
  const timeString = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMessage: StoredChatMessage = {
    id: 'msg-' + now + '-' + Math.random().toString(36).substring(2, 7),
    name: name || (isAdmin ? 'Admin' : isElon ? 'Elon Musk' : 'Visitor'),
    city: city || 'Austin, TX',
    message: String(message || ''),
    timestamp: now,
    timeString,
    isElon: Boolean(isElon),
    isAdmin: Boolean(isAdmin),
    isSystem: Boolean(isSystem),
    isVerified: Boolean(isVerified || isAdmin || isElon),
    userId: userId || 'general',
    intent: intent || undefined,
    image: image || undefined,
    voiceDuration: voiceDuration || undefined,
  };

  messagesStore.push(newMessage);
  persistMessages();

  // Instant real-time push to all matching devices
  broadcastToClients({ type: 'new_message', message: newMessage }, newMessage.userId);

  res.json({ success: true, message: newMessage });
});

// GET /api/chat/conversations - List all real visitor threads for Owner /admin dashboard
app.get('/api/chat/conversations', (_req, res) => {
  const conversationMap = new Map<string, {
    userId: string;
    userName: string;
    userCity: string;
    lastMessage: string;
    lastTimestamp: number;
    intent?: string;
    unreadCount: number;
  }>();

  for (const m of messagesStore) {
    if (!m.userId || m.userId === 'general') continue;

    const existing = conversationMap.get(m.userId);
    const isVisitor = !m.isAdmin && !m.isElon && !m.isSystem;

    if (!existing) {
      conversationMap.set(m.userId, {
        userId: m.userId,
        userName: isVisitor ? m.name : 'Visitor',
        userCity: isVisitor ? m.city : 'USA',
        lastMessage: m.message,
        lastTimestamp: m.timestamp,
        intent: m.intent,
        unreadCount: isVisitor ? 1 : 0,
      });
    } else {
      if (isVisitor) {
        existing.userName = m.name;
        existing.userCity = m.city;
        if (m.intent) existing.intent = m.intent;
      }
      if (m.timestamp >= existing.lastTimestamp) {
        existing.lastMessage = m.message;
        existing.lastTimestamp = m.timestamp;
      }
    }
  }

  const list = Array.from(conversationMap.values()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  res.json(list);
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

// DELETE /api/chat/messages - Admin clear thread
app.delete('/api/chat/messages', (req, res) => {
  const userId = req.query.userId ? String(req.query.userId) : null;
  if (userId) {
    messagesStore = messagesStore.filter((m) => m.userId !== userId);
  } else {
    messagesStore = [];
  }
  persistMessages();
  broadcastToClients({ type: 'cleared', userId });
  res.json({ success: true });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ELONVERSE Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
