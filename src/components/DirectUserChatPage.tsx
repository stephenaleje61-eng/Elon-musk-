import React, { useState, useEffect, useRef } from 'react';
import {
  Rocket,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Crown,
  ExternalLink,
  Zap,
  TrendingUp,
  ShoppingBag,
  Briefcase,
  Bot,
  MessageSquare,
  Radio,
} from 'lucide-react';
import { ChatMessage, UserIntent, AdminPresence } from '../types/chat';
import {
  subscribeToUserChat,
  sendChatMessage,
  subscribeToAdminPresence,
  registerVisitor,
} from '../services/firebaseChat';
import { sounds } from '../utils/audio';
import { VerifiedBadge } from './VerifiedBadge';

interface DirectUserChatPageProps {
  userName: string;
  userCity: string;
  userId: string;
  onNavigateAdmin: () => void;
  onBackToHome?: () => void;
}

export const DirectUserChatPage: React.FC<DirectUserChatPageProps> = ({
  userName,
  userCity,
  userId,
  onNavigateAdmin,
  onBackToHome,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [hasTriggeredAutoWelcome, setHasTriggeredAutoWelcome] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<UserIntent | null>(null);
  const [adminPresence, setAdminPresence] = useState<AdminPresence>({
    isOnline: true,
    adminName: 'Admin',
    adminCity: 'Starbase, TX',
    lastSeen: Date.now(),
  });
  const [elonIsTyping, setElonIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to this user's private 1-on-1 thread
  useEffect(() => {
    // 1. Create document in 'visitors' collection
    registerVisitor({
      visitorId: userId,
      name: userName || 'Visitor',
      location: userCity || 'USA',
      intent: currentIntent || '',
      lastMessage: 'Opened private chat',
    });

    // 2. ONLY listen to: visitors/{his_visitorId}/messages
    const unsubscribeChat = subscribeToUserChat(userId, (msgs) => {
      setMessages(msgs);
      // Check if auto welcome was already sent in this thread
      const hasWelcome = msgs.some((m) => m.isSystem || m.isElon);
      if (hasWelcome) {
        setHasTriggeredAutoWelcome(true);
      }
    });

    const unsubscribePresence = subscribeToAdminPresence((presence) => {
      setAdminPresence(presence);
    });

    return () => {
      unsubscribeChat();
      unsubscribePresence();
    };
  }, [userId, userName, userCity]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, elonIsTyping]);

  // Trigger the 2 Auto-Messages on first message or program selection
  const triggerAutoWelcomeDrop = async (firstUserText: string) => {
    setHasTriggeredAutoWelcome(true);

    // MESSAGE 1 (instant, from SYSTEM):
    await sendChatMessage({
      name: 'System',
      city: 'Starbase, TX',
      message: '🚀 Welcome to Elon Musk New Space Website, you are welcome! 🇺🇸',
      isElon: false,
      isAdmin: false,
      isSystem: true,
      userId,
    });
    sounds.playMessagePopSound();

    // MESSAGE 2 (1 second later, from Elon AI with Elon picture):
    setTimeout(async () => {
      setElonIsTyping(true);
      setTimeout(async () => {
        const welcomeElonText = `Hello ${userName}! Welcome to my new Space. What did you want from SpaceX?

Please select program:

1️⃣ INVESTMENT PLAN - Invest in SpaceX, Tesla Stock (TSLA), xAI, Starlink
2️⃣ BUY - Tesla Model Y/3/S/X from $44,990, Cybertruck from $79,990, Starship Ticket $500k, Starlink $120/mo
3️⃣ JOB - Career at Tesla Austin, SpaceX Starbase, Fremont, xAI - Engineering, AI, Manufacturing
4️⃣ GROK / OPTIMUS / ENERGY - Grok AI, Optimus Robot $20k-$30k, Solar Roof, Powerwall
5️⃣ DIRECT CHAT - Talk to me about Mars, Business, Future

Reply with number 1-5 or tap the buttons below, and I will connect you directly.`;

        await sendChatMessage({
          name: 'Elon Musk',
          city: 'Starbase, TX',
          message: welcomeElonText,
          isElon: true,
          isAdmin: false,
          userId,
        });

        sounds.playElonNotification();
        setElonIsTyping(false);
      }, 1000);
    }, 400);
  };

  // Program selection handler (1 to 5)
  const handleSelectProgram = async (programNumber: number) => {
    let intent: UserIntent = 'chat';
    let intentLabel = '';
    let responseText = '';

    if (programNumber === 1) {
      intent = 'investment';
      intentLabel = '1️⃣ INVESTMENT PLAN';
      responseText = `📈 Program Selected: SpaceX & Tesla Investment Syndicate
We are prioritizing capital allocation for pre-IPO Starlink orbital nodes, TSLA long-term equity, and xAI Memphis compute infrastructure.

The Starbase Owner & Admin is reviewing your investor inquiry now and will reply directly below. How much capital are you considering allocating ($500 - $100k+)?`;
    } else if (programNumber === 2) {
      intent = 'buy';
      intentLabel = '2️⃣ BUY HARDWARE & VEHICLES';
      responseText = `🚘 Program Selected: Purchasing & Vehicle Delivery
• Tesla Model Y (AWD): From $44,990
• Tesla Cybertruck (Cyberbeast): From $79,990
• Starlink Mini Satellite Kit: $199
• Starship Mars 2026 Passenger Deposit: $500,000

The Admin has received your delivery request and is ready to assist with ordering. Which product do you need?`;
    } else if (programNumber === 3) {
      intent = 'job';
      intentLabel = '3️⃣ JOB & CAREERS';
      responseText = `🚀 Program Selected: Engineering & Manufacturing Careers
We are hiring exceptional talent for:
• Starbase (Boca Chica, TX): Raptor 3 rocket propulsion & Mechazilla tower ops
• Giga Texas (Austin): Full Self-Driving AI & 4680 battery cell architecture
• xAI (Memphis): Frontier GPU cluster infrastructure

Owner / Admin will review your background below. What is your engineering discipline?`;
    } else if (programNumber === 4) {
      intent = 'ai';
      intentLabel = '4️⃣ GROK / OPTIMUS / ENERGY';
      responseText = `🤖 Program Selected: Grok 4, Optimus & Powerwall
• Grok AI: Running on 100k GPUs with maximum truth seeking.
• Optimus Gen 3: $20k - $30k humanoid assistant.
• Powerwall 3: Whole-home whole-estate battery backup.

Admin is online to answer your questions and coordinate reservation queues!`;
    } else {
      intent = 'chat';
      intentLabel = '5️⃣ DIRECT CHAT';
      responseText = `👑 Program Selected: Direct 1-on-1 Chat with Owner
You are connected directly to the Starbase command desk. The Owner / Admin is online now and will reply to your messages in real time below.`;
    }

    setCurrentIntent(intent);

    // If first time, trigger welcome drop first
    if (!hasTriggeredAutoWelcome) {
      await triggerAutoWelcomeDrop(`Selected ${intentLabel}`);
    }

    // Send user selection message
    await sendChatMessage({
      name: userName,
      city: userCity,
      message: `I selected: ${intentLabel}`,
      isElon: false,
      isAdmin: false,
      userId,
      intent,
    });
    sounds.playSentSound();

    // Send Elon AI follow-up
    setTimeout(async () => {
      setElonIsTyping(true);
      setTimeout(async () => {
        await sendChatMessage({
          name: 'Elon Musk',
          city: 'Starbase, TX',
          message: responseText,
          isElon: true,
          isAdmin: false,
          userId,
          intent,
        });
        sounds.playElonNotification();
        setElonIsTyping(false);
      }, 1200);
    }, 600);
  };

  // User sends text
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    if (!cleanText) return;

    sounds.playSentSound();
    setInputText('');

    // Check if user replied with number 1-5
    const trimmed = cleanText.trim();
    if (['1', '2', '3', '4', '5'].includes(trimmed)) {
      handleSelectProgram(parseInt(trimmed, 10));
      return;
    }

    // If this is user's first message, trigger auto welcome drop!
    const isFirst = !hasTriggeredAutoWelcome && messages.length === 0;

    await sendChatMessage({
      name: userName,
      city: userCity,
      message: cleanText,
      sender: 'visitor',
      isElon: false,
      isAdmin: false,
      userId,
      visitorId: userId,
      intent: currentIntent || undefined,
    });

    if (isFirst) {
      await triggerAutoWelcomeDrop(cleanText);
    } else {
      // If visitor addresses Elon or asks questions, provide a real AI response via Gemini API
      const lower = cleanText.toLowerCase();
      const isAddressingElon =
        lower.includes('elon') ||
        lower.includes('spacex') ||
        lower.includes('tesla') ||
        lower.includes('starship') ||
        lower.includes('cybertruck') ||
        lower.includes('grok') ||
        lower.includes('optimus') ||
        lower.includes('starlink') ||
        lower.includes('mars') ||
        lower.includes('?') ||
        lower.startsWith('@elon');

      if (isAddressingElon) {
        setElonIsTyping(true);
        setTimeout(async () => {
          try {
            const res = await fetch('/api/gemini/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: cleanText }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.reply) {
                await sendChatMessage({
                  name: 'Elon Musk',
                  city: 'Starbase, TX',
                  message: data.reply,
                  isElon: true,
                  isAdmin: false,
                  userId,
                  intent: currentIntent || undefined,
                });
                sounds.playElonNotification();
              }
            }
          } catch (e) {
            console.warn('Elon AI response error:', e);
          } finally {
            setElonIsTyping(false);
          }
        }, 1100);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#070707] text-white select-none">
      {/* 1. Top Bar matching specification */}
      <header className="h-16 px-4 sm:px-6 bg-[#0a0a0a] border-b border-neutral-800/90 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          {/* Circular Elon Musk Photo + Verified Badge */}
          <div className="relative w-10 h-10 shrink-0">
            <img
              src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
              alt="Elon Musk"
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-sky-500 text-white shadow">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold tracking-wide text-white uppercase">
                ELON MUSK
              </span>
              <VerifiedBadge type="elon" size="sm" />
              <span className="text-[10px]">🇺🇸</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Live from Starbase, Texas
            </p>
          </div>
        </div>

        {/* Center Tag: Elon Musk Space - Private & Encrypted */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-4 py-1.5 rounded-full border border-emerald-500/40 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold tracking-wider uppercase text-emerald-300">
            Elon Musk Space - Private &amp; Encrypted 🔒
          </span>
        </div>

        {/* Right: Live Admin Online Presence Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                adminPresence.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
              }`}
            />
            <span className={adminPresence.isOnline ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
              {adminPresence.isOnline ? 'Admin Online 🟢' : 'Admin Away'}
            </span>
            <VerifiedBadge type="owner" size="sm" />
            <span className="hidden sm:inline text-neutral-400">&bull; Ready to reply</span>
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
              title="Return to Elonverse Empire Platform"
            >
              <span>&larr; Hub</span>
            </button>
          )}

          <button
            onClick={onNavigateAdmin}
            className="p-1.5 px-2.5 rounded-lg bg-neutral-800 text-amber-400 hover:bg-neutral-700 text-xs font-mono flex items-center gap-1.5 border border-neutral-700 group transition-all"
            title="Open Admin Dashboard"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-400" />
            <span className="hidden sm:inline font-bold">Owner</span>
            <VerifiedBadge type="owner" size="sm" showTooltip={false} />
          </button>
        </div>
      </header>

      {/* Active Order Consultation Banner */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('order') && (
        <div className="bg-gradient-to-r from-amber-950/70 via-neutral-900 to-sky-950/70 border-b border-amber-500/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-amber-300 font-bold uppercase tracking-wide">
              🛒 Private Order Consultation:
            </span>
            <span className="text-white font-semibold underline decoration-amber-500/50">
              {new URLSearchParams(window.location.search).get('order')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-300 text-[11px]">
            <span>Connected with Elon Musk 👑 (Verified Owner)</span>
            <span className="text-emerald-400 font-bold">&bull; 1-on-1 Ready</span>
          </div>
        </div>
      )}

      {/* 2. Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Elon Companies */}
        <aside className="w-64 bg-[#090909] border-r border-neutral-800/80 p-4 hidden md:flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">
              ELON MUSK ECOSYSTEM
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Tesla Motors</span>
                </div>
                <p className="text-[11px] text-neutral-400">Model Y from $44,990 &bull; Cybertruck from $79,990 &bull; Austin Giga</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Rocket className="w-4 h-4 text-sky-400" />
                  <span>SpaceX</span>
                </div>
                <p className="text-[11px] text-neutral-400">Starship Flight 12 &bull; Mechazilla Catch &bull; Mars 2026</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Radio className="w-4 h-4 text-purple-400" />
                  <span>Starlink</span>
                </div>
                <p className="text-[11px] text-neutral-400">Residential $120/mo &bull; Mini $199 &bull; Global Low Earth Orbit</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>xAI &amp; Grok</span>
                </div>
                <p className="text-[11px] text-neutral-400">Memphis Colossus 100k GPUs &bull; Maximum Truth AI</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[10px] font-mono text-neutral-400 text-left">
            <span className="text-neutral-300 font-bold block mb-0.5">Visitor Session:</span>
            <span>{userName} &bull; {userCity}</span>
          </div>
        </aside>

        {/* Center: REAL LIVE 1-ON-1 CHAT */}
        <main className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="my-10 text-center max-w-md mx-auto p-6 rounded-2xl bg-neutral-950/70 border border-neutral-800/80">
                <Rocket className="w-10 h-10 text-sky-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  Connected to Starbase Command
                </h3>
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                  Send your first message or select a program below to connect directly with Elon AI and the Starbase Owner.
                </p>
              </div>
            )}

            {messages.map((m) => {
              // 1. System Welcome Drop
              if (m.isSystem) {
                return (
                  <div key={m.id} className="flex justify-center my-3">
                    <div className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 font-mono shadow-md flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-sky-400" />
                      <span>{m.message}</span>
                    </div>
                  </div>
                );
              }

              // 2. Elon AI Message (White with red border + circular photo)
              if (m.isElon) {
                return (
                  <div key={m.id} className="flex flex-col items-start max-w-2xl my-2 animate-fade-in text-left">
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <img
                        src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
                        alt="Elon Musk"
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover border border-white"
                      />
                      <span className="text-xs font-bold text-white">Elon Musk</span>
                      <VerifiedBadge type="elon" size="md" />
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                        CEO &amp; Chief Engineer
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">{m.timeString}</span>
                    </div>

                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white text-black border-2 border-red-600 shadow-xl text-xs sm:text-sm font-medium leading-relaxed">
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>

                    {/* 5 Big Clickable Program Buttons matching key specification */}
                    {m.message.includes('Please select program') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 w-full">
                        <button
                          onClick={() => handleSelectProgram(1)}
                          className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition-all hover:scale-[1.01] group"
                        >
                          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>1️⃣ INVESTMENT PLAN</span>
                          </div>
                          <span className="text-[11px] text-neutral-300">
                            Invest in SpaceX, Tesla (TSLA), xAI &amp; Starlink
                          </span>
                        </button>

                        <button
                          onClick={() => handleSelectProgram(2)}
                          className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition-all hover:scale-[1.01] group"
                        >
                          <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5 mb-1">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>2️⃣ BUY VEHICLES &amp; TECH</span>
                          </div>
                          <span className="text-[11px] text-neutral-300">
                            Model Y $44,990 &bull; Cybertruck $79,990 &bull; Starlink
                          </span>
                        </button>

                        <button
                          onClick={() => handleSelectProgram(3)}
                          className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition-all hover:scale-[1.01] group"
                        >
                          <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>3️⃣ JOB &amp; CAREERS</span>
                          </div>
                          <span className="text-[11px] text-neutral-300">
                            Engineering at Giga Austin &amp; Starbase Texas
                          </span>
                        </button>

                        <button
                          onClick={() => handleSelectProgram(4)}
                          className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-left transition-all hover:scale-[1.01] group"
                        >
                          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                            <Bot className="w-3.5 h-3.5" />
                            <span>4️⃣ GROK / OPTIMUS / ENERGY</span>
                          </div>
                          <span className="text-[11px] text-neutral-300">
                            Grok 4 &bull; Optimus Robot $20k-$30k &bull; Powerwall
                          </span>
                        </button>

                        <button
                          onClick={() => handleSelectProgram(5)}
                          className="sm:col-span-2 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-600/60 text-left transition-all hover:scale-[1.01] group"
                        >
                          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>5️⃣ DIRECT 1-ON-1 CHAT WITH OWNER</span>
                          </div>
                          <span className="text-[11px] text-neutral-300">
                            Talk directly to the Starbase Founder about Mars, Deals &amp; Future
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              // 3. Admin / Owner Reply (Gold Badge #FFD700)
              if (m.isAdmin) {
                return (
                  <div key={m.id} className="flex flex-col items-start max-w-xl my-2 text-left">
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-amber-300">{m.name} 👑</span>
                      <VerifiedBadge type="owner" size="md" />
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                        ADMIN • Starbase, TX
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">{m.timeString}</span>
                    </div>

                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#E6C200] text-black font-semibold text-xs sm:text-sm shadow-xl border border-amber-300">
                      <p className="whitespace-pre-wrap">{m.message}</p>
                    </div>
                  </div>
                );
              }

              // 4. Visitor Message (User Blue #1D9BF0)
              return (
                <div key={m.id} className="flex flex-col items-end max-w-lg ml-auto my-1.5 text-right">
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono text-neutral-400">
                    <span className="text-white font-medium">{m.name}</span>
                    <span>&bull;</span>
                    <span className="text-neutral-500">{m.city}</span>
                    <span>&bull;</span>
                    <span className="text-neutral-500">{m.timeString}</span>
                  </div>

                  <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 bg-[#1D9BF0] text-white text-xs sm:text-sm font-medium shadow-md">
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>
                </div>
              );
            })}

            {elonIsTyping && (
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 py-1 px-2 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Elon is typing from Starbase, Texas...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Program Action Bar */}
          <div className="px-4 py-2 bg-neutral-950/90 border-t border-neutral-900 flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
            <span className="text-neutral-500 shrink-0">Quick Programs:</span>
            <button
              onClick={() => handleSelectProgram(1)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600"
            >
              1️⃣ Investment Plan
            </button>
            <button
              onClick={() => handleSelectProgram(2)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600"
            >
              2️⃣ Buy Products
            </button>
            <button
              onClick={() => handleSelectProgram(3)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600"
            >
              3️⃣ Careers
            </button>
            <button
              onClick={() => handleSelectProgram(4)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600"
            >
              4️⃣ Grok / Optimus
            </button>
            <button
              onClick={() => handleSelectProgram(5)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-800/80 text-amber-300 hover:text-white"
            >
              5️⃣ Direct Owner
            </button>
          </div>

          {/* Chat Input Bar (Sticky at bottom, 16px font for easy mobile typing) */}
          <div className="sticky bottom-0 z-40 p-3 sm:p-4 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80 shadow-xl">
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message Elon AI &amp; Starbase Owner... (or reply 1-5)"
                className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-2xl px-4 py-3 text-[16px] sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-2xl bg-white text-black hover:bg-neutral-200 disabled:opacity-40 transition-all shrink-0 shadow-lg hover:scale-105 active:scale-95"
                aria-label="Send message"
              >
                <Rocket className="w-4 h-4 fill-black" />
              </button>
            </form>
          </div>
        </main>

        {/* Right Column: Online Users & Live Presence */}
        <aside className="w-72 bg-[#090909] border-l border-neutral-800/80 p-4 hidden lg:flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Online Users Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800/80">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                ONLINE USERS (3 LIVE)
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>REAL-TIME</span>
              </div>
            </div>

            {/* Online Users List */}
            <div className="space-y-2.5 mb-5">
              {/* 1. YOU [Owner / Admin] with Crown + BIG BLUE VERIFIED TICK */}
              <div className="p-3 rounded-xl bg-gradient-to-br from-sky-950/40 via-neutral-900 to-neutral-950 border border-sky-500/40 text-left relative overflow-hidden group">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-sky-400 flex items-center justify-center text-black font-extrabold text-sm shadow-md border-2 border-white">
                      {(adminPresence.adminName || 'O').charAt(0).toUpperCase()}
                    </div>
                    {/* Crown on avatar */}
                    <Crown className="w-4 h-4 text-amber-300 fill-amber-400 absolute -top-1.5 -right-1.5 drop-shadow" />
                    {/* Small blue verified dot at bottom-right */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1D9BF0] border border-white flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white fill-white" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  </div>

                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {adminPresence.adminName || 'Owner'} 👑
                      </span>
                      <VerifiedBadge type="owner" size="md" />
                    </div>
                    <p className="text-[10px] text-sky-400 font-mono truncate">
                      Founder @ Starbase, TX
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Admin Online &bull; Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Elon Musk AI with Gold Seal + Blue Check */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-red-900/40 text-left group">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <img
                      src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
                      alt="Elon Musk"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                  </div>

                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Elon Musk</span>
                      <VerifiedBadge type="elon" size="md" />
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono truncate">
                      CEO @ Austin, TX
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Online &bull; Starbase AI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Normal Visitor (NO verify badge) */}
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 font-bold text-xs shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-neutral-200 truncate">
                        {userName}
                      </span>
                      {/* NO verify badge for visitors */}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono truncate">
                      Visitor &bull; {userCity}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-neutral-500 font-mono mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Connected now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {currentIntent && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-sky-800/60 mb-4 text-left">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                  Active Intent
                </span>
                <span className="text-xs font-bold text-sky-400 uppercase font-mono">
                  {currentIntent}
                </span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-left">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-2">
                Official Channels
              </span>
              <div className="space-y-2 text-xs">
                <a
                  href="https://x.com/elonmusk"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-neutral-300 hover:text-white"
                >
                  <span>@elonmusk on X</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                </a>
                <a
                  href="https://www.spacex.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between text-neutral-300 hover:text-white"
                >
                  <span>SpaceX Starbase</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                </a>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-500 font-mono text-center">
            Elonverse Live 1-on-1 &bull; Austin to Mars
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="h-9 px-4 bg-[#050505] border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
        <span>Elonverse Live Chat &bull; Real-time Sync &bull; Built in Austin, Texas</span>
        <span>USA Live Operations</span>
      </footer>
    </div>
  );
};
