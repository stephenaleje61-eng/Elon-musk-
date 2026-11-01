import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  subscribeToJoinRequests,
  subscribeToActiveChats,
  subscribeToSingleActiveChat,
  acceptAndOpenChatInFirestore,
  declineJoinRequestInFirestore,
  sendChatMessageToFirestore,
  deleteActiveChatInFirestore,
  JoinRequestDoc,
  ActiveChatDoc,
  ChatMessageItem,
} from '../services/firestoreStorage';
import {
  subscribeToAllConversations,
  subscribeToMessages,
  sendChatMessage,
  uploadChatImage,
  markConversationRead,
  adminSetConversationStatus,
  adminDeleteConversation,
  ConversationDoc,
  MessageDoc,
} from '../services/firebaseChatSystem';
import { logoutAdmin, AUTHORIZED_ADMIN_EMAIL } from '../services/firebaseAuth';
import { StarfieldCanvas } from './StarfieldCanvas';
import {
  ShieldAlert,
  Trash2,
  Send,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Search,
  Volume2,
  VolumeX,
  UserCheck,
  ExternalLink,
  Radio,
  Clock,
  MapPin,
  Mail,
  Fingerprint,
} from 'lucide-react';

interface ElonMuskSpaceAdminViewProps {
  onBackToVisitor: () => void;
  onLogout: () => void;
}

// Unified conversation model
interface UnifiedConversationItem {
  id: string;
  source: 'conversations' | 'activeChats';
  name: string;
  location: string;
  email?: string;
  visitorId?: string;
  date: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  status: 'active' | 'closed' | 'blocked';
  messageCount: number;
}

// Unified message item
interface UnifiedMessageItem {
  id: string;
  from: 'admin' | 'visitor';
  senderName: string;
  text: string;
  imageUrl?: string;
  date: string;
  time: string;
  timestamp: number;
  deliveryStatus?: 'sent' | 'delivered' | 'read';
}

// Subtle futuristic audio chirp using Web Audio API
function playUplinkChirp() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

export const ElonMuskSpaceAdminView: React.FC<ElonMuskSpaceAdminViewProps> = ({
  onBackToVisitor,
  onLogout,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'conversations' | 'requests'>('conversations');

  // Raw Firebase collections
  const [modernConvs, setModernConvs] = useState<ConversationDoc[]>([]);
  const [legacyActiveChats, setLegacyActiveChats] = useState<ActiveChatDoc[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestDoc[]>([]);

  // Selected chat state
  const [selectedChatId, setSelectedChatId] = useState<string | null>('req-rita-australia');
  const [modernMessages, setModernMessages] = useState<MessageDoc[]>([]);
  const [legacyChatDoc, setLegacyChatDoc] = useState<ActiveChatDoc | null>(null);

  // Composer state
  const [replyText, setReplyText] = useState('');
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreview, setStagedPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [audioNotifications, setAudioNotifications] = useState(true);

  // Zoomed image modal
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevTotalMessagesRef = useRef<number>(0);

  // Live Texas Time
  const [texasTime, setTexasTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Chicago',
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTexasTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Chicago',
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Subscribe to modern "conversations" collection in real-time
  useEffect(() => {
    const unsub = subscribeToAllConversations((list) => {
      setModernConvs(list);
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to legacy "activeChats" collection in real-time
  useEffect(() => {
    const unsub = subscribeToActiveChats((list) => {
      setLegacyActiveChats(list);
    });
    return () => unsub();
  }, []);

  // 3. Subscribe to "joinRequests" collection in real-time
  useEffect(() => {
    const unsub = subscribeToJoinRequests((list) => {
      setJoinRequests(list);
    });
    return () => unsub();
  }, []);

  // Unified list of all active conversations
  const unifiedConversations = useMemo<UnifiedConversationItem[]>(() => {
    const map = new Map<string, UnifiedConversationItem>();

    // Add modern conversations
    modernConvs.forEach((c) => {
      map.set(c.conversationId, {
        id: c.conversationId,
        source: 'conversations',
        name: c.visitorName || 'VISITOR',
        location: 'SECURE STARLINK NODE',
        email: c.visitorEmail,
        visitorId: c.visitorId,
        date: c.updatedAt?.toDate
          ? c.updatedAt.toDate().toLocaleDateString('en-US')
          : new Date().toLocaleDateString('en-US'),
        lastMessage: c.lastMessage || 'Channel established',
        timestamp: c.updatedAt?.toDate ? c.updatedAt.toDate().getTime() : Date.now(),
        unreadCount: c.unreadForAdmin || 0,
        status: c.status || 'active',
        messageCount: 0,
      });
    });

    // Merge legacy activeChats (e.g. Rita from Australia)
    legacyActiveChats.forEach((c) => {
      if (!map.has(c.id)) {
        map.set(c.id, {
          id: c.id,
          source: 'activeChats',
          name: c.name || 'CALLSIGN',
          location: c.location || 'STARBASE EARTH',
          email: c.email,
          visitorId: c.id,
          date: c.date || new Date().toLocaleDateString('en-US'),
          lastMessage: c.lastMessage || 'Active private session',
          timestamp: c.timestamp || Date.now(),
          unreadCount: 0,
          status: 'active',
          messageCount: c.messages?.length || 0,
        });
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [modernConvs, legacyActiveChats]);

  // Auto-select Rita if default, or first conversation if none selected
  useEffect(() => {
    if (!selectedChatId && unifiedConversations.length > 0) {
      const rita = unifiedConversations.find(
        (c) => c.name.toUpperCase().includes('RITA') || c.id.includes('rita')
      );
      setSelectedChatId(rita ? rita.id : unifiedConversations[0].id);
    }
  }, [unifiedConversations, selectedChatId]);

  // Identify currently selected conversation
  const currentSelectedConv = useMemo(() => {
    return unifiedConversations.find((c) => c.id === selectedChatId) || null;
  }, [unifiedConversations, selectedChatId]);

  // Subscribe to messages of selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setModernMessages([]);
      setLegacyChatDoc(null);
      return;
    }

    // Mark as read in modern collection
    markConversationRead(selectedChatId, 'admin').catch(() => {});

    // Always subscribe to modern messages subcollection
    const unsubModern = subscribeToMessages(selectedChatId, (msgs) => {
      setModernMessages(msgs);
    });

    // Also subscribe to legacy activeChats document
    const unsubLegacy = subscribeToSingleActiveChat(selectedChatId, (chat) => {
      setLegacyChatDoc(chat);
    });

    return () => {
      unsubModern();
      unsubLegacy();
    };
  }, [selectedChatId]);

  // Merge unified message history
  const unifiedMessages = useMemo<UnifiedMessageItem[]>(() => {
    const map = new Map<string, UnifiedMessageItem>();

    // 1. From modern subcollection
    modernMessages.forEach((m) => {
      const isAdm = m.senderRole === 'admin';
      const dateObj = m.createdAt?.toDate ? m.createdAt.toDate() : new Date();
      map.set(m.messageId, {
        id: m.messageId,
        from: isAdm ? 'admin' : 'visitor',
        senderName: isAdm ? 'ELON MUSK [ADMIN]' : currentSelectedConv?.name || 'VISITOR',
        text: m.text,
        imageUrl: m.imageUrl,
        date: dateObj.toLocaleDateString('en-US'),
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: dateObj.getTime(),
        deliveryStatus: m.deliveryStatus || 'read',
      });
    });

    // 2. From legacy activeChats messages array
    if (legacyChatDoc?.messages) {
      legacyChatDoc.messages.forEach((m) => {
        if (!map.has(m.id)) {
          const isAdm =
            m.from === 'admin' ||
            (Boolean(m.senderName) && m.senderName!.includes('ADMIN'));
          map.set(m.id, {
            id: m.id,
            from: isAdm ? 'admin' : 'visitor',
            senderName: isAdm ? 'ELON MUSK [ADMIN]' : legacyChatDoc.name || 'VISITOR',
            text: m.text,
            imageUrl: m.imageUrl,
            date: m.date || new Date().toLocaleDateString('en-US'),
            time: m.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: m.timestamp || Date.now(),
            deliveryStatus: 'read',
          });
        }
      });
    }

    const list = Array.from(map.values());
    list.sort((a, b) => a.timestamp - b.timestamp);
    return list;
  }, [modernMessages, legacyChatDoc, currentSelectedConv]);

  // Audio chirp on incoming visitor message
  useEffect(() => {
    const totalCount = unifiedMessages.length;
    if (prevTotalMessagesRef.current > 0 && totalCount > prevTotalMessagesRef.current) {
      const lastMsg = unifiedMessages[unifiedMessages.length - 1];
      if (lastMsg && lastMsg.from === 'visitor' && audioNotifications) {
        playUplinkChirp();
      }
    }
    prevTotalMessagesRef.current = totalCount;
  }, [unifiedMessages, audioNotifications]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [unifiedMessages.length, stagedPreview]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return unifiedConversations;
    const q = searchQuery.toLowerCase();
    return unifiedConversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.lastMessage.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [unifiedConversations, searchQuery]);

  // Accept join request
  const handleAcceptAndOpenChat = async (req: JoinRequestDoc) => {
    try {
      const createdChat = await acceptAndOpenChatInFirestore(req);
      setActiveTab('conversations');
      setSelectedChatId(createdChat.id);
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  // Decline join request
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineJoinRequestInFirestore(requestId);
    } catch (err) {
      console.error('Failed to decline request:', err);
    }
  };

  // Image select
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    setStagedFile(file);
    const reader = new FileReader();
    reader.onload = () => setStagedPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Send message
  const handleSendAdminReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChatId) return;

    const textToSend = replyText.trim();
    if (!textToSend && !stagedFile) return;

    setIsSending(true);
    let uploadedImageUrl: string | undefined = undefined;

    try {
      // 1. Upload image if staged
      if (stagedFile) {
        setUploadProgress(15);
        uploadedImageUrl = await uploadChatImage(stagedFile, selectedChatId, (prog) => {
          setUploadProgress(prog);
        });
      }

      // 2. Clear inputs immediately for instant UI feedback
      setReplyText('');
      setStagedFile(null);
      setStagedPreview(null);
      setUploadProgress(null);

      // 3. Write to modern conversations subcollection
      await sendChatMessage({
        conversationId: selectedChatId,
        senderRole: 'admin',
        text: textToSend,
        imageUrl: uploadedImageUrl,
        senderName: 'ELON MUSK [ADMIN]',
      });

      // 4. Mirror to legacy activeChats subcollection
      await sendChatMessageToFirestore({
        chatId: selectedChatId,
        from: 'admin',
        senderName: 'ELON MUSK [ADMIN]',
        text: textToSend,
        imageUrl: uploadedImageUrl,
      }).catch(() => {});

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error('Failed to dispatch admin reply:', err);
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Toggle Block Visitor
  const handleToggleBlock = async () => {
    if (!currentSelectedConv) return;
    const isCurrentlyBlocked = currentSelectedConv.status === 'blocked';
    const nextStatus = isCurrentlyBlocked ? 'active' : 'blocked';
    const confirmMsg = isCurrentlyBlocked
      ? `Unblock ${currentSelectedConv.name}?`
      : `Block transmissions from ${currentSelectedConv.name}? This disables their message compose input.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminSetConversationStatus(currentSelectedConv.id, nextStatus);
    } catch (err) {
      console.error('Failed to toggle block status:', err);
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string) => {
    if (!window.confirm('Permanently delete this entire conversation and message history from Firestore?')) {
      return;
    }

    try {
      await adminDeleteConversation(convId);
      await deleteActiveChatInFirestore(convId).catch(() => {});
      if (selectedChatId === convId) {
        setSelectedChatId(null);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Live telemetry counts
  const totalTransmissionsCount = useMemo(() => {
    const modernCount = modernConvs.reduce((acc, c) => acc + (c.lastMessage ? 2 : 1), 0);
    const legacyCount = legacyActiveChats.reduce((acc, c) => acc + (c.messages?.length || 0), 0);
    return 1450 + modernCount + legacyCount;
  }, [modernConvs, legacyActiveChats]);

  const activeNodesCount = Math.max(unifiedConversations.length + joinRequests.length, 3);
  const totalUnreadCount = unifiedConversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex flex-col selection:bg-white selection:text-black">
      {/* Animated Starfield Background */}
      <StarfieldCanvas />

      {/* Z-Index Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-[#222222] px-6 py-4 bg-[#000000]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-bold tracking-[2px] uppercase text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
              ELON MUSK SPACE
            </span>
            <span className="hidden sm:inline text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] border-l border-[#222222] pl-3">
              ADMIN CONTROL TERMINAL &bull; STARBASE UPLINK
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888]">
            <span className="select-all text-white font-mono hidden md:inline">
              {AUTHORIZED_ADMIN_EMAIL}
            </span>
            <span className="text-[#333333] hidden md:inline">|</span>

            {/* Audio Toggle */}
            <button
              onClick={() => setAudioNotifications(!audioNotifications)}
              className="text-[#888888] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              title={audioNotifications ? 'Audio notifications enabled' : 'Audio notifications muted'}
            >
              {audioNotifications ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
              <span className="hidden lg:inline">{audioNotifications ? 'CHIRP ON' : 'MUTED'}</span>
            </button>

            <span className="text-[#333333]">|</span>

            <button
              onClick={onBackToVisitor}
              className="text-[#888888] hover:text-white transition-colors cursor-pointer uppercase hover:underline"
            >
              VISITOR VIEW
            </button>

            <span className="text-[#333333]">|</span>

            <button
              onClick={async () => {
                await logoutAdmin();
                onLogout();
              }}
              className="text-[#888888] hover:text-red-400 transition-colors cursor-pointer uppercase hover:underline"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* Telemetry Bar */}
        <div className="border-b border-[#222222] px-6 py-2.5 bg-[#000000]/90 text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] flex flex-wrap items-center justify-between gap-y-1">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>
              TRANSMISSIONS: <strong className="text-white font-normal">{totalTransmissionsCount}</strong>
            </span>
            <span className="text-[#333333]">|</span>
            <span>
              ACTIVE NODES: <strong className="text-white font-normal">{activeNodesCount}</strong>
            </span>
            <span className="text-[#333333]">|</span>
            <span>
              UPLINK:{' '}
              <strong className="text-[#00FF66] font-bold">
                SECURE &bull; PERMANENT STORAGE (FIREBASE)
              </strong>
            </span>
            <span className="text-[#333333]">|</span>
            <span>
              STATION TIME: <strong className="text-white font-normal">{texasTime} CST</strong>
            </span>
          </div>

          {totalUnreadCount > 0 && (
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              {totalUnreadCount} UNREAD VISITOR TRANSMISSION{totalUnreadCount > 1 ? 'S' : ''}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-[#222222] px-6 py-2.5 flex items-center justify-between bg-[#000000]/95 text-[11px] font-mono tracking-[1.5px] uppercase sticky top-[57px] z-20">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActiveTab('conversations');
                if (!selectedChatId && unifiedConversations.length > 0) {
                  setSelectedChatId(unifiedConversations[0].id);
                }
              }}
              className={`pb-1 transition-colors cursor-pointer rounded-none border-b-2 flex items-center gap-2 ${
                activeTab === 'conversations'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-[#888888] hover:text-white'
              }`}
            >
              ACTIVE CONVERSATIONS ({unifiedConversations.length})
              {totalUnreadCount > 0 && (
                <span className="bg-emerald-500 text-black text-[9px] px-1.5 py-0.2 font-bold rounded-full">
                  {totalUnreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('requests');
                setSelectedChatId(null);
              }}
              className={`pb-1 transition-colors cursor-pointer rounded-none border-b-2 flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-[#888888] hover:text-white'
              }`}
            >
              SPACE JOIN REQUESTS ({joinRequests.length})
              {joinRequests.length > 0 && (
                <span className="bg-white text-black text-[9px] px-1.5 py-0.2 font-bold rounded-full">
                  {joinRequests.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
            <span>DATABASE: FIRESTORE PERMANENT</span>
            <span>&bull;</span>
            <span>BUCKET: ACTIVE</span>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'requests' ? (
            /* TAB 1: SPACE JOIN REQUESTS */
            <div className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
              <div className="mb-6 space-y-1">
                <div className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888]">
                  FIREBASE FIRESTORE &bull; COLLECTION: joinRequests
                </div>
                <h1 className="text-2xl font-light tracking-[2px] uppercase text-white">
                  SPACE JOIN REQUESTS
                </h1>
                <p className="text-[12px] text-[#888888] tracking-[0.5px]">
                  Real-time join requests saved permanently in Firestore. Click ACCEPT & OPEN CHAT to move to activeChats and start private transmission.
                </p>
              </div>

              {joinRequests.length === 0 ? (
                <div className="border border-[#222222] p-12 text-center text-[12px] font-mono text-[#888888] tracking-[1.5px] uppercase rounded-none">
                  NO PENDING JOIN REQUESTS &bull; ALL REQUESTS ACCEPTED OR WAITING FOR NEW TRANSMISSIONS
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {joinRequests.map((req) => (
                    <div
                      key={req.id}
                      className="border border-[#222222] p-5 bg-[#000000]/90 flex flex-col justify-between gap-4 rounded-none hover:border-[#444444] transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                          <span className="text-[13px] font-bold tracking-[1.5px] uppercase text-white">
                            {req.name}
                          </span>
                          <span className="text-[10px] font-mono tracking-[1px] text-[#888888] uppercase">
                            {req.date}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-[#888888] tracking-[1px] space-y-1">
                          <div>
                            COORDINATES: <span className="text-white">{req.location}</span>
                          </div>
                          {req.email && (
                            <div>
                              IDENTIFIER: <span className="text-white">{req.email}</span>
                            </div>
                          )}
                          <div className="pt-1 text-[12px] text-white/90 font-sans tracking-[0.5px]">
                            &ldquo;{req.message || 'Request to join Elon Musk Space'}&rdquo;
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#222222]">
                        <button
                          onClick={() => handleAcceptAndOpenChat(req)}
                          className="flex-1 bg-white text-black hover:bg-black hover:text-white border border-white py-2 text-[10px] font-mono font-semibold tracking-[1.5px] uppercase transition-colors cursor-pointer rounded-none text-center"
                        >
                          ACCEPT & OPEN CHAT
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-4 py-2 border border-[#333333] hover:border-white text-[#888888] hover:text-white text-[10px] font-mono tracking-[1.5px] uppercase transition-colors cursor-pointer rounded-none"
                        >
                          DECLINE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: ACTIVE CONVERSATIONS (DUAL-PANEL) */
            <div className="flex-1 flex overflow-hidden w-full relative">
              {/* Left Column: List of All Conversations with Search */}
              <aside
                className={`${
                  selectedChatId ? 'hidden md:flex' : 'flex'
                } w-full md:w-80 lg:w-96 border-r border-[#222222] bg-[#000000] flex-col overflow-hidden shrink-0`}
              >
                {/* Search Bar */}
                <div className="p-3 border-b border-[#222222] bg-[#000000]">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="SEARCH CALLSIGN OR UID..."
                      className="w-full bg-[#0d0d0d] border border-[#222222] focus:border-white pl-9 pr-3 py-2 text-[11px] font-mono text-white placeholder-neutral-600 focus:outline-none rounded-none"
                    />
                  </div>
                </div>

                {/* Subheader */}
                <div className="px-4 py-2 border-b border-[#222222] text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] flex items-center justify-between bg-[#050505]">
                  <span>NODES ({filteredConversations.length})</span>
                  <span className="text-[#00FF66] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                    LIVE SYNC
                  </span>
                </div>

                {/* List Items */}
                <div className="flex-1 divide-y divide-[#222222] overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-[11px] font-mono text-[#888888] uppercase tracking-[1px]">
                      {searchQuery ? 'NO MATCHING CONVERSATIONS' : 'NO ACTIVE CONVERSATIONS FOUND'}
                    </div>
                  ) : (
                    filteredConversations.map((chat) => {
                      const isSelected = selectedChatId === chat.id;
                      const isBlocked = chat.status === 'blocked';
                      return (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChatId(chat.id)}
                          className={`p-4 transition-colors flex flex-col gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-[#111111] border-l-2 border-white'
                              : 'hover:bg-[#0a0a0a]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold tracking-[1.5px] uppercase text-white truncate flex items-center gap-2">
                              {chat.name}
                              {isBlocked && (
                                <span className="text-[9px] font-mono text-red-400 border border-red-500/40 px-1 py-0.2">
                                  BLOCKED
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] font-mono tracking-[1px] text-[#888888]">
                              {chat.date}
                            </span>
                          </div>

                          <div className="text-[10px] font-mono tracking-[1px] uppercase text-[#888888] flex items-center justify-between">
                            <span className="truncate">LOC: {chat.location}</span>
                            {chat.unreadCount > 0 && (
                              <span className="bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                {chat.unreadCount} NEW
                              </span>
                            )}
                          </div>

                          <p className="text-[12px] text-white/80 font-light truncate tracking-[0.5px]">
                            {chat.lastMessage}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* Right Column: Active Conversation Workspace */}
              <main
                className={`${
                  selectedChatId ? 'flex' : 'hidden md:flex'
                } flex-1 flex-col bg-[#000000] overflow-hidden relative`}
              >
                {selectedChatId && currentSelectedConv ? (
                  <>
                    {/* Header */}
                    <div className="border-b border-[#222222] p-4 bg-[#000000] flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedChatId(null)}
                          className="md:hidden text-[10px] font-mono uppercase tracking-[1.5px] border border-[#333333] hover:border-white px-2.5 py-1 text-white cursor-pointer rounded-none"
                        >
                          &lt; BACK
                        </button>
                        <div className="space-y-0.5">
                          <div className="text-[14px] font-bold tracking-[1.5px] uppercase text-white flex items-center gap-2">
                            <span>{currentSelectedConv.name}</span>
                            <span className="text-[10px] font-mono text-[#00FF66] border border-[#00FF66]/40 px-1.5 py-0.2">
                              PERMANENT (FIREBASE)
                            </span>
                            {currentSelectedConv.status === 'blocked' && (
                              <span className="text-[10px] font-mono text-red-400 border border-red-500/50 bg-red-950/40 px-1.5 py-0.2">
                                BLOCKED
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono tracking-[1px] uppercase text-[#888888] flex flex-wrap items-center gap-x-3 gap-y-0.5">
                            <span>ID: {currentSelectedConv.visitorId || currentSelectedConv.id}</span>
                            {currentSelectedConv.email && (
                              <span>&bull; {currentSelectedConv.email}</span>
                            )}
                            <span>&bull; COORD: {currentSelectedConv.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleToggleBlock}
                          className={`text-[10px] font-mono tracking-[1px] uppercase border px-3 py-1.5 transition-colors cursor-pointer rounded-none ${
                            currentSelectedConv.status === 'blocked'
                              ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
                              : 'border-[#333333] hover:border-amber-400 text-[#888888] hover:text-amber-300'
                          }`}
                          title="Restrict or restore access for this visitor"
                        >
                          {currentSelectedConv.status === 'blocked' ? 'UNBLOCK VISITOR' : 'BLOCK VISITOR'}
                        </button>

                        <button
                          onClick={() => handleDeleteConversation(selectedChatId)}
                          className="text-[10px] font-mono tracking-[1px] uppercase border border-[#333333] hover:border-red-500 text-[#888888] hover:text-red-400 px-3 py-1.5 transition-colors cursor-pointer rounded-none flex items-center gap-1.5"
                          title="Delete conversation permanently"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>DELETE</span>
                        </button>
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#000000] pb-28">
                      {unifiedMessages.length === 0 ? (
                        <div className="p-12 text-center text-[11px] font-mono tracking-[1.5px] uppercase text-[#888888] border border-[#222222] rounded-none">
                          ROOM INITIALIZED WITH {currentSelectedConv.name} &bull; TRANSMIT MESSAGE BELOW
                        </div>
                      ) : (
                        unifiedMessages.map((m) => {
                          const isAdmin = m.from === 'admin';
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] mb-1 flex items-center gap-2">
                                <span className={isAdmin ? 'text-white font-semibold' : 'text-[#888888]'}>
                                  {m.senderName}
                                </span>
                                <span className="text-[#333333]">&bull;</span>
                                <span>{m.time}</span>
                                <span className="text-[#333333]">&bull;</span>
                                <span>{m.date}</span>
                                {isAdmin && (
                                  <>
                                    <span className="text-[#333333]">&bull;</span>
                                    <span title={m.deliveryStatus === 'read' ? 'Read' : 'Sent'}>
                                      {m.deliveryStatus === 'read' ? (
                                        <CheckCheck className="w-3 h-3 text-cyan-400" />
                                      ) : (
                                        <Check className="w-3 h-3 text-neutral-500" />
                                      )}
                                    </span>
                                  </>
                                )}
                              </div>

                              <div
                                className={`max-w-xl p-3.5 text-[13px] tracking-[0.5px] font-light leading-relaxed border rounded-none ${
                                  isAdmin
                                    ? 'bg-[#111111] text-white border-white'
                                    : 'bg-[#050505] text-white border-[#333333]'
                                }`}
                              >
                                {m.imageUrl && (
                                  <div className="mb-2">
                                    <img
                                      src={m.imageUrl}
                                      alt="transmission payload"
                                      className="max-w-[260px] max-h-[260px] object-cover border border-[#333333] cursor-pointer hover:opacity-90 rounded-none transition-opacity"
                                      onClick={() => setZoomedImage(m.imageUrl || null)}
                                    />
                                  </div>
                                )}
                                {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Staged Image Preview Bar */}
                    {stagedPreview && (
                      <div className="border-t border-[#222222] p-2 bg-[#000000] flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={stagedPreview}
                            alt="staged"
                            className="w-10 h-10 object-cover border border-[#333333] rounded-none"
                          />
                          <div className="text-[10px] font-mono tracking-[1px] uppercase text-[#888888]">
                            <span>IMAGE ATTACHMENT READY &bull; {stagedFile?.name}</span>
                            {uploadProgress !== null && (
                              <div className="text-emerald-400">UPLOADING: {uploadProgress}%</div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStagedFile(null);
                            setStagedPreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-[10px] font-mono tracking-[1px] uppercase border border-[#333333] hover:border-white px-2 py-1 text-[#888888] hover:text-white rounded-none cursor-pointer"
                        >
                          REMOVE
                        </button>
                      </div>
                    )}

                    {/* Bottom Compose Bar */}
                    <div className="fixed bottom-0 right-0 left-0 md:left-80 lg:left-96 bg-[#000000] border-t border-[#222222] p-3 z-30">
                      <form onSubmit={handleSendAdminReply} className="flex items-center gap-2 max-w-5xl mx-auto">
                        <label className="border border-[#333333] hover:border-white px-3 py-2.5 text-[#888888] hover:text-white text-[10px] font-mono tracking-[1.5px] uppercase cursor-pointer transition-colors shrink-0 rounded-none flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>+ IMG</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageFileChange}
                          />
                        </label>

                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendAdminReply();
                            }
                          }}
                          placeholder={`WRITE TRANSMISSION TO ${currentSelectedConv.name}...`}
                          className="flex-1 bg-[#000000] border border-[#333333] focus:border-white px-3.5 py-2.5 text-[12px] font-mono text-white placeholder-[#444444] tracking-[0.5px] focus:outline-none rounded-none"
                        />

                        {/* SEND BUTTON - ALWAYS ENABLED, WHITE BACKGROUND, BLACK TEXT */}
                        <button
                          type="button"
                          onClick={() => handleSendAdminReply()}
                          disabled={isSending}
                          className="border border-white bg-white text-black hover:bg-black hover:text-white px-6 py-2.5 text-[11px] font-mono font-semibold tracking-[2px] uppercase transition-colors cursor-pointer shrink-0 rounded-none flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSending ? 'SENDING...' : 'SEND'}</span>
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#888888] space-y-2">
                    <div className="text-[12px] font-mono tracking-[1.5px] uppercase">
                      SELECT A CONVERSATION CARD ON THE LEFT TO OPEN CHAT
                    </div>
                    <p className="text-[11px] font-mono text-[#555555]">
                      All messages persist permanently in Firestore. No auto-delete or temporary timeouts.
                    </p>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Preview Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Enlarged payload"
              className="max-w-full max-h-[85vh] object-contain border border-[#444444]"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 border border-white bg-black text-white px-3 py-1 font-mono text-xs uppercase"
            >
              CLOSE [ESC]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
