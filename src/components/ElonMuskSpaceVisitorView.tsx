import React, { useState, useEffect, useRef } from 'react';
import {
  submitJoinRequestToFirestore,
  subscribeToSingleActiveChat,
  sendChatMessageToFirestore,
  fileToBase64,
  JoinRequestDoc,
  ActiveChatDoc,
} from '../services/firestoreStorage';
import {
  subscribeToVisitorRequestStatus,
  subscribeToUserChat,
  sendFriendRequest,
} from '../services/firebaseChat';
import { StarfieldCanvas } from './StarfieldCanvas';

interface ElonMuskSpaceVisitorViewProps {
  visitorId: string;
  onNavigateAdmin?: () => void;
}

export const ElonMuskSpaceVisitorView: React.FC<ElonMuskSpaceVisitorViewProps> = ({
  visitorId: initialVisitorId,
  onNavigateAdmin,
}) => {
  // Support /chat?id={theirId} or search params
  const [urlVisitorId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('id');
      return param ? param.trim() : null;
    }
    return null;
  });

  const activeVisitorId = urlVisitorId || initialVisitorId;

  const [request, setRequest] = useState<JoinRequestDoc | null>(null);
  const [activeChat, setActiveChat] = useState<ActiveChatDoc | null>(null);
  const [name, setName] = useState(() => localStorage.getItem('elon_space_visitor_name') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('elon_space_visitor_email') || '');
  const [location, setLocation] = useState(() => localStorage.getItem('elon_space_visitor_location') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChannelForm, setShowChannelForm] = useState(false);

  // Chat states
  const [replyText, setReplyText] = useState('');
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Subscribe to active chat document in Firestore activeChats collection
  useEffect(() => {
    const unsubChat = subscribeToSingleActiveChat(activeVisitorId, (chat) => {
      setActiveChat(chat);
      if (chat) {
        if (chat.name) setName(chat.name);
        if (chat.location) setLocation(chat.location);
      }
    });

    return () => unsubChat();
  }, [activeVisitorId]);

  // 2. Also listen for legacy or server status
  useEffect(() => {
    const unsubStatus = subscribeToVisitorRequestStatus(activeVisitorId, (req) => {
      if (req) {
        setRequest({
          id: req.visitorId,
          name: req.name,
          location: req.location,
          status: req.status,
          date: new Date(req.timestamp).toLocaleDateString('en-US'),
          timestamp: req.timestamp,
          email: req.email,
        });
        if (req.name) setName(req.name);
        if (req.location) setLocation(req.location);
      }
    });

    return () => unsubStatus();
  }, [activeVisitorId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      localStorage.setItem('elon_space_visitor_name', name.trim());
      localStorage.setItem('elon_space_visitor_email', email.trim());
      localStorage.setItem('elon_space_visitor_location', location.trim());

      // Save directly to Firestore permanent collection "joinRequests"
      const created = await submitJoinRequestToFirestore({
        customId: activeVisitorId,
        name: name.trim(),
        email: email.trim(),
        location: location.trim() || 'EARTH',
        message: 'Request to join Elon Musk Space',
      });

      setRequest(created);
      setShowChannelForm(false);
    } catch (err) {
      console.error('Failed to submit join request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setStagedImage(base64);
    } catch (err) {
      console.error('Error reading image file:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = replyText.trim();
    if ((!cleanText && !stagedImage) || isSending) return;

    // If user has not registered callsign yet, show form with their text preserved
    if (!name.trim() && !request && !activeChat) {
      setShowChannelForm(true);
      return;
    }

    setIsSending(true);
    const textToSend = cleanText;
    const imageToSend = stagedImage;
    setReplyText('');
    setStagedImage(null);

    try {
      await sendChatMessageToFirestore({
        chatId: activeVisitorId,
        from: 'visitor',
        senderName: name.trim().toUpperCase() || 'VISITOR',
        text: textToSend,
        imageUrl: imageToSend || undefined,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const isApproved =
    Boolean(activeChat) ||
    Boolean(urlVisitorId) ||
    request?.status === 'accepted';

  const isPending = request?.status === 'pending' && !isApproved;

  // Stats calculation
  const messageCount = activeChat?.messages?.length || 0;
  const transmissionCount = 1420 + messageCount;
  const activeNodes = 42;

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Animated Starfield Background */}
      <StarfieldCanvas />

      {/* Main Container - z-10 over starfield */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* Top Header - Ultra Minimal SpaceX Bar */}
        <header className="border-b border-[#222222] px-6 py-4 flex items-center justify-between bg-[#000000]/90 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-bold tracking-[2px] uppercase text-white">
              ELON MUSK SPACE
            </span>
            <span className="hidden sm:inline text-[10px] text-[#888888] font-mono tracking-[1.5px] uppercase border-l border-[#222222] pl-4">
              SPACEX / X INTERPLANETARY NETWORK
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#00FF66] inline-block animate-pulse"></span>
              UPLINK: ONLINE
            </span>
            {onNavigateAdmin && (
              <button
                onClick={onNavigateAdmin}
                className="text-[#888888] hover:text-white transition-colors cursor-pointer border-l border-[#222222] pl-4 uppercase"
              >
                ADMIN PORTAL
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        {!isApproved ? (
          <main className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 py-12 max-w-5xl mx-auto w-full">
            {/* HERO SECTION: Big text left aligned */}
            <div className="space-y-4 mb-8">
              <div className="text-[10px] text-[#888888] tracking-[2px] uppercase font-mono">
                SECURE SATELLITE TELEMETRY &bull; NODE ID: {activeVisitorId.slice(0, 10)}
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-[2px] uppercase leading-none text-white">
                ELON MUSK SPACE
              </h1>
              <p className="text-lg sm:text-2xl font-light tracking-[2px] uppercase text-[#888888]">
                MISSION: INTERPLANETARY COMMUNICATION PROTOCOL
              </p>
            </div>

            {/* Below: Small stats with 4. PERMANENT STORAGE INDICATOR in green */}
            <div className="py-4 border-y border-[#222222] text-[10px] sm:text-[11px] font-mono tracking-[1.5px] uppercase text-[#888888] flex flex-wrap items-center gap-x-6 gap-y-2 mb-8">
              <span>
                TRANSMISSIONS: <strong className="text-white font-normal">{transmissionCount}</strong>
              </span>
              <span className="text-[#333333]">|</span>
              <span>
                ACTIVE NODES: <strong className="text-white font-normal">{activeNodes}</strong>
              </span>
              <span className="text-[#333333]">|</span>
              <span>
                UPLINK:{' '}
                <strong className="text-[#00FF66] font-bold">
                  SECURE - PERMANENT STORAGE (FIREBASE)
                </strong>
              </span>
              <span className="text-[#333333]">|</span>
              <span>
                FREQUENCY: <strong className="text-white font-normal">14.2 GHz STARLINK</strong>
              </span>
            </div>

            {/* Action / Channel Form */}
            {!showChannelForm && !isPending && (
              <div className="pt-2">
                <button
                  onClick={() => setShowChannelForm(true)}
                  className="border border-white text-white px-8 py-3.5 text-[11px] tracking-[2px] uppercase font-normal hover:bg-white hover:text-black transition-colors cursor-pointer rounded-none"
                >
                  ENTER TRANSMISSION CHANNEL
                </button>
              </div>
            )}

            {isPending && (
              <div className="border border-[#222222] p-6 bg-[#000000]/80 space-y-3 max-w-lg rounded-none">
                <div className="text-[10px] font-mono tracking-[1.5px] text-[#888888] uppercase">
                  TRANSMISSION STATUS &bull; FIRESTORE PERMANENT
                </div>
                <div className="text-[13px] text-white tracking-[1px] uppercase">
                  REQUEST SENT - WAITING FOR APPROVAL
                </div>
                <p className="text-[11px] font-mono text-[#888888] tracking-[0.5px]">
                  CALLSIGN: <span className="text-white">{request?.name}</span> &bull; LOCATION: <span className="text-white">{request?.location}</span>
                </p>
                <div className="text-[10px] font-mono text-[#888888] pt-2 border-t border-[#222222]">
                  STATION WILL AUTOMATICALLY ESTABLISH DIRECT ENCRYPTED LINK ONCE CONFIRMED BY STARBASE COMMAND.
                </div>
                <button
                  onClick={() => setShowChannelForm(true)}
                  className="mt-3 border border-[#333333] hover:border-white text-[10px] font-mono tracking-[1px] uppercase px-3 py-1.5 text-[#888888] hover:text-white transition-colors rounded-none cursor-pointer"
                >
                  MODIFY SUBMISSION
                </button>
              </div>
            )}

            {showChannelForm && !isPending && (
              <div className="border border-[#222222] p-6 bg-[#000000]/95 max-w-lg space-y-5 rounded-none">
                <div className="border-b border-[#222222] pb-3">
                  <div className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888]">
                    PROTOCOL REGISTRATION &bull; PERMANENT FIRESTORE
                  </div>
                  <h2 className="text-[14px] font-light tracking-[1.5px] uppercase text-white mt-1">
                    ESTABLISH GROUND-TO-SPACE UPLINK
                  </h2>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] block">
                      CALLSIGN / FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ENTER IDENTIFIER (E.G. RITA)"
                      className="w-full bg-[#000000] border border-[#222222] focus:border-white px-3 py-2.5 text-[12px] font-mono text-white tracking-[1px] uppercase placeholder-[#444444] focus:outline-none rounded-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] block">
                      ELECTRONIC MAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="NAME@ORGANIZATION.COM"
                      className="w-full bg-[#000000] border border-[#222222] focus:border-white px-3 py-2.5 text-[12px] font-mono text-white tracking-[1px] uppercase placeholder-[#444444] focus:outline-none rounded-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] block">
                      TERRESTRIAL COORDINATES / LOCATION
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="AUSTRALIA / STARBASE, TX"
                      className="w-full bg-[#000000] border border-[#222222] focus:border-white px-3 py-2.5 text-[12px] font-mono text-white tracking-[1px] uppercase placeholder-[#444444] focus:outline-none rounded-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !name.trim()}
                      className="border border-white text-white px-6 py-2.5 text-[11px] font-mono tracking-[2px] uppercase font-normal hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-40 rounded-none"
                    >
                      {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT REQUEST'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowChannelForm(false)}
                      className="border border-[#222222] text-[#888888] hover:text-white hover:border-[#444444] px-4 py-2.5 text-[11px] font-mono tracking-[1.5px] uppercase transition-colors rounded-none cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        ) : (
          /* ACTIVE 1-ON-1 TRANSMISSION CHANNEL - READS FROM FIRESTORE activeChats */
          <main className="flex-1 flex flex-col justify-between max-w-5xl w-full mx-auto px-4 sm:px-8 py-4">
            {/* Session Top Bar */}
            <div className="border-b border-[#222222] py-3 flex items-center justify-between text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888]">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#00FF66] inline-block"></span>
                <span className="text-white font-normal">PRIVATE TRANSMISSION CHANNEL</span>
                <span className="text-[#333333]">|</span>
                <span>CALLSIGN: {(activeChat?.name || name).toUpperCase() || 'VISITOR'}</span>
                <span className="hidden sm:inline text-[#333333]">|</span>
                <span className="hidden sm:inline">
                  LOCATION: {(activeChat?.location || location || 'EARTH').toUpperCase()}
                </span>
              </div>
              <span className="text-[#00FF66]">PERMANENT STORAGE (FIREBASE)</span>
            </div>

            {/* Transmission History Scroll Area */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6 max-h-[62vh]">
              {(!activeChat?.messages || activeChat.messages.length === 0) ? (
                <div className="py-12 text-center text-[#888888] text-[11px] tracking-[1.5px] uppercase font-mono border border-[#222222] p-8 rounded-none">
                  LINK ESTABLISHED &bull; TRANSMIT MESSAGE BELOW TO COMMUNICATE DIRECTLY WITH ELON MUSK.
                </div>
              ) : (
                activeChat.messages.map((m) => {
                  const isVisitor = m.from === 'visitor';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                    >
                      {/* Metadata Header */}
                      <div className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] mb-1 flex items-center gap-2">
                        <span>
                          {isVisitor
                            ? (m.senderName || name || 'VISITOR').toUpperCase()
                            : 'ELON MUSK [ADMIN]'}
                        </span>
                        <span className="text-[#333333]">&bull;</span>
                        <span>{m.time}</span>
                        <span className="text-[#333333]">&bull;</span>
                        <span>{m.date}</span>
                      </div>

                      {/* Content Container */}
                      <div
                        className={`max-w-xl p-3.5 text-[13px] tracking-[0.5px] font-light leading-relaxed border rounded-none ${
                          isVisitor
                            ? 'bg-[#000000] text-white border-[#333333]'
                            : 'bg-[#111111] text-white border-white'
                        }`}
                      >
                        {m.imageUrl && (
                          <div className="mb-2">
                            <img
                              src={m.imageUrl}
                              alt="payload attachment"
                              className="max-w-[240px] border border-[#333333] cursor-pointer hover:opacity-90 rounded-none"
                              onClick={() => window.open(m.imageUrl, '_blank')}
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
          </main>
        )}

        {/* Staged Image Banner */}
        {stagedImage && (
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-8">
            <div className="border border-[#222222] p-2 bg-[#000000] flex items-center justify-between mb-2 rounded-none">
              <div className="flex items-center gap-3">
                <img
                  src={stagedImage}
                  alt="staged"
                  className="w-10 h-10 object-cover border border-[#333333] rounded-none"
                />
                <span className="text-[10px] font-mono tracking-[1px] uppercase text-[#888888]">
                  IMAGE PAYLOAD READY FOR FIRESTORE UPLINK
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStagedImage(null)}
                className="text-[10px] font-mono tracking-[1px] uppercase border border-[#333333] hover:border-white px-2 py-1 text-[#888888] hover:text-white rounded-none cursor-pointer"
              >
                REMOVE
              </button>
            </div>
          </div>
        )}

        {/* Chat Input: Full width bottom, like X.com compose - minimal */}
        <div className="border-t border-[#222222] bg-[#000000] py-3 px-4 sm:px-8 sticky bottom-0 z-20">
          <form onSubmit={handleSendChatMessage} className="max-w-5xl mx-auto flex items-center gap-2">
            <label className="border border-[#222222] hover:border-white px-3 py-2.5 text-[#888888] hover:text-white text-[10px] font-mono tracking-[1.5px] uppercase cursor-pointer transition-colors shrink-0 rounded-none">
              + IMG
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </label>

            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="TRANSMIT MESSAGE TO ELON MUSK (FIRESTORE PERMANENT)..."
              className="flex-1 bg-[#000000] border border-[#222222] focus:border-white px-3.5 py-2.5 text-[12px] font-mono text-white placeholder-[#444444] tracking-[0.5px] focus:outline-none rounded-none"
            />

            <button
              type="submit"
              disabled={(!replyText.trim() && !stagedImage) || isSending}
              className="border border-white bg-white text-black hover:bg-[#000000] hover:text-white px-6 py-2.5 text-[11px] font-mono font-normal tracking-[2px] uppercase transition-colors disabled:opacity-30 cursor-pointer shrink-0 rounded-none"
            >
              {isSending ? 'SAVING...' : 'SEND'}
            </button>
          </form>
        </div>

        {/* Footer - SpaceX Telemetry Bar */}
        <footer className="border-t border-[#222222] px-6 py-3 text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#000000]/90">
          <span>ELON MUSK SPACE &bull; STARLINK PROTOCOL v5.2 &bull; ALL RIGHTS RESERVED</span>
          <span>
            LATENCY: 18ms &bull; STORAGE:{' '}
            <span className="text-[#00FF66]">FIREBASE FIRESTORE PERMANENT</span>
          </span>
        </footer>
      </div>
    </div>
  );
};
