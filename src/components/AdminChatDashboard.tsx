import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  Bell,
  Search,
  Send,
  Radio,
  MapPin,
  CheckCircle2,
  Trash2,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, VisitorConversation } from '../types/chat';
import {
  subscribeToAllConversations,
  subscribeToUserChat,
  sendChatMessage,
  setAdminPresence,
} from '../services/firebaseChat';
import { sounds } from '../utils/audio';
import { VerifiedBadge } from './VerifiedBadge';

interface AdminChatDashboardProps {
  onBackToUserChat: () => void;
}

export const AdminChatDashboard: React.FC<AdminChatDashboardProps> = ({ onBackToUserChat }) => {
  const [conversations, setConversations] = useState<VisitorConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [adminName, setAdminName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('elonverse_admin_name') || 'Elon Musk (Owner)';
    }
    return 'Elon Musk (Owner)';
  });
  const [adminCity, setAdminCity] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('elonverse_admin_city') || 'Starbase, TX';
    }
    return 'Starbase, TX';
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNameInput, setEditNameInput] = useState(adminName);
  const [editCityInput, setEditCityInput] = useState(adminCity);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  const prevConversationsCount = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 120), 200)}px`;
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newName = editNameInput.trim() || 'Elon Musk (Owner)';
    const newCity = editCityInput.trim() || 'Starbase, TX';
    setAdminName(newName);
    setAdminCity(newCity);
    setIsEditingProfile(false);
    try {
      localStorage.setItem('elonverse_admin_name', newName);
      localStorage.setItem('elonverse_admin_city', newCity);
    } catch (err) {}
    setAdminPresence(true, newName, newCity);
  };

  const handleClearThread = async () => {
    if (!selectedUserId) return;
    if (window.confirm(`Clear chat history with ${activeConv?.userName || 'this visitor'}?`)) {
      try {
        await fetch(`/api/chat/messages?userId=${encodeURIComponent(selectedUserId)}`, {
          method: 'DELETE',
        });
        setThreadMessages([]);
      } catch (err) {}
    }
  };

  // Set Admin Presence as Online while in /admin
  useEffect(() => {
    setAdminPresence(true, adminName, adminCity);

    const interval = setInterval(() => {
      setAdminPresence(true, adminName, adminCity);
    }, 15000);

    return () => {
      clearInterval(interval);
      setAdminPresence(false, adminName, adminCity);
    };
  }, [adminName, adminCity]);

  // Request browser notification permission if available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Listen to all real-time conversations
  useEffect(() => {
    const unsubscribe = subscribeToAllConversations((list) => {
      // Check if new visitor arrived
      if (list.length > prevConversationsCount.current && prevConversationsCount.current > 0) {
        const newest = list[0];
        sounds.playDingSound();
        const alertMsg = `🔔 New visitor: ${newest.userName} from ${newest.userCity} - Wants: ${newest.intent || 'Info'}`;
        setNotificationBanner(alertMsg);
        setTimeout(() => setNotificationBanner(null), 5000);

        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Elonverse Alert', { body: alertMsg });
          } catch (e) {}
        }
      }
      prevConversationsCount.current = list.length;
      setConversations(list);

      // Select first conversation if none selected
      if (!selectedUserId && list.length > 0) {
        setSelectedUserId(list[0].userId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedUserId]);

  // Subscribe to the selected user's thread
  useEffect(() => {
    if (!selectedUserId) {
      setThreadMessages([]);
      return;
    }

    const unsubscribe = subscribeToUserChat(selectedUserId, (msgs) => {
      setThreadMessages(msgs);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedUserId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  const activeConv = conversations.find((c) => c.userId === selectedUserId);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = replyText.trim();
    if (!clean || !selectedUserId) return;

    sounds.playSentSound();
    setReplyText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '120px';
    }

    await sendChatMessage({
      name: adminName,
      city: adminCity,
      message: clean,
      sender: 'owner',
      isElon: false,
      isAdmin: true,
      userId: selectedUserId,
      visitorId: selectedUserId,
    });
  };

  const handleQuickSnippet = (snippet: string) => {
    setReplyText(snippet);
    setTimeout(() => {
      adjustTextareaHeight();
      textareaRef.current?.focus();
    }, 10);
  };

  return (
    <div className="flex flex-col h-screen bg-[#060606] text-white select-none">
      {/* Admin Top Navigation */}
      <header className="h-16 px-6 bg-[#0a0a0a] border-b border-amber-500/30 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Crown className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                STARBASE OWNER LIVE CONSOLE
              </h1>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 ml-1">
                <span>{adminName} 👑</span>
                <VerifiedBadge type="owner" size="md" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                1-on-1 Direct Mode
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              Direct line to incoming visitors &bull; Real-time Firebase Sync
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">Presence: Online in Starbase</span>
          </div>

          <button
            onClick={onBackToUserChat}
            className="px-3.5 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
          >
            <span>Open Visitor /chat</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Big Verified Owner Account Card matching specification */}
      <div className="bg-gradient-to-r from-[#0d2238] via-[#081729] to-[#0a0a0a] border-b border-[#1D9BF0]/40 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(29,155,240,0.18)]">
        <div className="flex items-center gap-3.5">
          <VerifiedBadge type="owner" size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-wide">
                ✓ Verified Owner Account
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/50 font-bold uppercase tracking-wider">
                Owner &bull; Verified Admin
              </span>
            </div>
            <p className="text-xs text-sky-300 font-mono mt-0.5">
              Elonverse Admin &bull; Blue Verified since 2026 &bull; Austin &amp; Starbase Supervised
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono">Current Profile:</span>
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="flex items-center gap-1.5">
              <input
                type="text"
                value={editNameInput}
                onChange={(e) => setEditNameInput(e.target.value)}
                placeholder="Your Name (Owner)"
                className="px-2 py-1 rounded bg-neutral-900 border border-amber-400 text-xs text-amber-300 font-mono focus:outline-none w-36"
                autoFocus
              />
              <input
                type="text"
                value={editCityInput}
                onChange={(e) => setEditCityInput(e.target.value)}
                placeholder="City"
                className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 font-mono focus:outline-none w-28 hidden sm:inline-block"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-amber-400 text-black text-xs font-bold font-mono hover:bg-amber-300"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-2 py-1 rounded bg-neutral-800 text-neutral-400 text-xs font-mono"
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-sm">
                <span className="text-amber-300">{adminName} 👑</span>
                <VerifiedBadge type="owner" size="sm" showTooltip={false} />
              </span>
              <button
                onClick={() => {
                  setEditNameInput(adminName);
                  setEditCityInput(adminCity);
                  setIsEditingProfile(true);
                }}
                className="px-2 py-1 rounded text-[11px] font-mono text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-800/40 hover:bg-sky-900/40 transition-colors"
                title="Edit Owner Display Name & City"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Visitor Notification Toast */}
      {notificationBanner && (
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-bold font-mono text-center flex items-center justify-center gap-2 animate-bounce">
          <Bell className="w-4 h-4 fill-black" />
          <span>{notificationBanner}</span>
        </div>
      )}

      {/* Main Admin Workspace: 2 Columns (30% Visitors / 70% Chat on mobile) */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Left: Incoming Visitors List (30% on mobile, fixed w-72 or w-80 on desktop) */}
        <aside className="w-[30%] sm:w-72 md:w-80 bg-[#090909] border-r border-neutral-800 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="p-2 sm:p-3 border-b border-neutral-800 text-[10px] sm:text-xs font-mono text-neutral-300 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PRIVATE INBOX</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[10px] text-neutral-400 font-bold">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
            {conversations.length === 0 ? (
              <div className="p-4 sm:p-8 text-center text-[10px] sm:text-xs text-neutral-500 font-mono">
                No active visitors yet.
                <br />
                Open /chat to test private room!
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = selectedUserId === c.userId;
                const isOrder = Boolean(
                  c.intent?.toLowerCase().includes('order') ||
                  c.lastMessage?.toLowerCase().includes('order') ||
                  c.lastMessage?.toLowerCase().includes('i want to order')
                );
                return (
                  <button
                    key={c.userId}
                    onClick={() => setSelectedUserId(c.userId)}
                    className={`w-full p-2 sm:p-3.5 text-left transition-colors flex flex-col gap-0.5 sm:gap-1 ${
                      isSelected
                        ? 'bg-neutral-900 border-l-2 sm:border-l-4 border-amber-400'
                        : 'hover:bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {c.unreadCount > 0 ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" title="New message" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
                        )}
                        <span className="text-[11px] sm:text-xs font-bold text-white truncate">{c.userName || c.name}</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-neutral-500 font-mono hidden md:inline">
                        {new Date(c.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-neutral-400 font-mono">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-500 shrink-0" />
                      <span className="truncate">{c.userCity || c.location}</span>
                      {isOrder && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] sm:text-[9px] font-bold uppercase shrink-0">
                          🛒
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] sm:text-xs text-neutral-300 truncate mt-0.5">
                      {c.lastMessage}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-2 sm:p-3 bg-neutral-950 border-t border-neutral-800 text-[10px] sm:text-xs font-mono text-neutral-400 text-center truncate">
            Owner ID: <span className="text-amber-400 font-bold">elon_musk_owner</span>
          </div>
        </aside>

        {/* Center: Selected Visitor 1-on-1 Chat Thread (70% on mobile, flex-1 on desktop) */}
        <main className="w-[70%] sm:flex-1 flex flex-col bg-[#050505] relative overflow-hidden h-full">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="h-16 px-4 sm:px-6 bg-[#090909] border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-base font-extrabold text-white truncate">
                      Private chat with {activeConv.userName || activeConv.name} - {activeConv.userCity || activeConv.location}
                    </span>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Private 1-on-1
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Room: visitors/{activeConv.userId}/messages
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden md:inline">Private &amp; Encrypted</span>
                  </div>

                  <button
                    onClick={handleClearThread}
                    className="p-1 px-2.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-900 border border-neutral-800 hover:border-rose-900/50 text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              </div>

              {/* Active Order Consultation Strip for Elon Musk (Owner) */}
              {(activeConv.intent?.toLowerCase().includes('order') || activeConv.lastMessage?.toLowerCase().includes('order')) && (
                <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-sky-950/40 border-b border-amber-500/30 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🛒</span>
                    <span className="text-amber-300 font-bold uppercase">Customer Order Inquiry:</span>
                    <span className="text-white font-semibold">{activeConv.intent?.replace(/^order:\s*/i, '') || activeConv.lastMessage}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-neutral-400 text-[11px] hidden sm:inline">1-Click Replies:</span>
                    <button
                      onClick={() => handleQuickSnippet(`Hello ${activeConv.userName}! Elon here (Owner 👑). I received your order! Let's get your delivery location and finalize payment.`)}
                      className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-[11px] font-bold transition-colors"
                    >
                      Delivery &amp; Details
                    </button>
                    <button
                      onClick={() => handleQuickSnippet(`Your order has been logged! How would you prefer to complete payment (Bank Wire, Card, or Crypto)?`)}
                      className="px-2.5 py-1 rounded bg-sky-950 text-sky-300 hover:bg-sky-500 hover:text-black border border-sky-800 text-[11px] font-bold transition-colors"
                    >
                      Payment Options
                    </button>
                  </div>
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {threadMessages.map((m) => {
                  if (m.isSystem) {
                    return (
                      <div key={m.id} className="flex justify-center my-2">
                        <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full">
                          {m.message}
                        </span>
                      </div>
                    );
                  }

                  if (m.isElon) {
                    return (
                      <div key={m.id} className="flex flex-col items-start max-w-xl text-left my-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 mb-1">
                          <span className="text-white font-bold">Elon Musk</span>
                          <VerifiedBadge type="elon" size="sm" />
                          <span>&bull; {m.timeString}</span>
                        </div>
                        <div className="rounded-xl px-4 py-2.5 bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs">
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                      </div>
                    );
                  }

                  if (m.isAdmin) {
                    return (
                      <div key={m.id} className="flex flex-col items-end max-w-xl ml-auto text-right my-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 mb-1 font-bold">
                          <span>{adminName} 👑</span>
                          <VerifiedBadge type="owner" size="sm" />
                          <span className="text-neutral-500 font-normal">&bull; {m.timeString}</span>
                        </div>
                        <div className="rounded-xl px-4 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#E6C200] text-black font-semibold text-xs shadow-md">
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                      </div>
                    );
                  }

                  // Visitor
                  return (
                    <div key={m.id} className="flex flex-col items-start max-w-xl text-left my-2">
                      <span className="text-[11px] font-mono text-sky-400 mb-1 font-semibold">
                        {m.name} ({m.city}) &bull; {m.timeString}
                      </span>
                      <div className="rounded-xl px-4 py-2.5 bg-[#1D9BF0] text-white text-xs font-medium shadow-md">
                        <p className="whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Sticky Bottom WhatsApp-style Admin Reply Area */}
              <div
                className="sticky bottom-0 z-50 p-3 sm:p-4 bg-zinc-950/95 backdrop-blur-md border-t-2 border-yellow-500/70 shadow-2xl"
                style={{ position: 'sticky', bottom: 0, zIndex: 50 }}
              >
                {/* Snippets Toolbar (Above Textarea so it never covers what you type) */}
                <div className="mb-2.5 flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
                  <span className="text-yellow-400 font-bold shrink-0 flex items-center gap-1">
                    <span>⚡</span>
                    <span>Snippets:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickSnippet("Hello! I am the Starbase Owner. I saw you're interested in our investment plan. How much capital are you considering allocating?")}
                    className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white transition-colors"
                  >
                    💼 Investment Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSnippet("Hi! I can assist with placing your Tesla vehicle or Cybertruck order directly from Austin. Which trim do you prefer?")}
                    className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white transition-colors"
                  >
                    🚘 Vehicle Order Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSnippet("Great to meet you! What is your engineering background and resume link for our Starbase team?")}
                    className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white transition-colors"
                  >
                    🚀 Job Reply
                  </button>
                </div>

                {/* Big WhatsApp-style Chat Textarea */}
                <form onSubmit={handleSendAdminReply} className="flex flex-col gap-2.5">
                  <div className="relative w-full">
                    <textarea
                      ref={textareaRef}
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        adjustTextareaHeight();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (replyText.trim()) {
                            handleSendAdminReply(e);
                          }
                        }
                      }}
                      placeholder={`Type your reply to ${activeConv.userName || 'Alex'}...`}
                      rows={3}
                      className="w-full min-h-[120px] max-h-[200px] p-4 text-[16px] sm:text-lg bg-zinc-900 border-2 border-yellow-500 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-500/40 transition-all leading-relaxed shadow-inner resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] sm:text-xs text-zinc-400 font-mono flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="truncate">Replying to <strong className="text-white">{activeConv.userName || 'Alex'}</strong></span>
                      <span className="hidden md:inline text-zinc-500">&bull; Press Enter to send, Shift+Enter for new line</span>
                    </div>

                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="ml-auto px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-extrabold text-sm sm:text-base hover:from-yellow-400 hover:to-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                    >
                      <span>SEND REPLY</span>
                      <Send className="w-4 h-4 fill-black" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-neutral-500 text-xs font-mono">
              Select a visitor conversation on the left to start chatting 1-on-1.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
