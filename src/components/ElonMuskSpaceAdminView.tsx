import React, { useState, useEffect, useRef } from 'react';
import {
  subscribeToJoinRequests,
  subscribeToActiveChats,
  subscribeToSingleActiveChat,
  acceptAndOpenChatInFirestore,
  declineJoinRequestInFirestore,
  sendChatMessageToFirestore,
  deleteActiveChatInFirestore,
  fileToBase64,
  JoinRequestDoc,
  ActiveChatDoc,
  ChatMessageItem,
} from '../services/firestoreStorage';
import { logoutAdmin, AUTHORIZED_ADMIN_EMAIL } from '../services/firebaseAuth';
import { StarfieldCanvas } from './StarfieldCanvas';

interface ElonMuskSpaceAdminViewProps {
  onBackToVisitor: () => void;
  onLogout: () => void;
}

export const ElonMuskSpaceAdminView: React.FC<ElonMuskSpaceAdminViewProps> = ({
  onBackToVisitor,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'conversations'>('requests');
  const [joinRequests, setJoinRequests] = useState<JoinRequestDoc[]>([]);
  const [activeChats, setActiveChats] = useState<ActiveChatDoc[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeChatDoc, setActiveChatDoc] = useState<ActiveChatDoc | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // 1. Subscribe to permanent Firestore collection "joinRequests" in real time (onSnapshot)
  useEffect(() => {
    const unsub = subscribeToJoinRequests((list) => {
      setJoinRequests(list);
    });
    return () => unsub();
  }, []);

  // 2. Subscribe to permanent Firestore collection "activeChats" in real time (onSnapshot)
  useEffect(() => {
    const unsub = subscribeToActiveChats((list) => {
      setActiveChats(list);
    });
    return () => unsub();
  }, []);

  // 3. Subscribe to currently selected active chat document in real time (onSnapshot)
  useEffect(() => {
    if (!selectedChatId) {
      setActiveChatDoc(null);
      return;
    }
    const unsub = subscribeToSingleActiveChat(selectedChatId, (chat) => {
      setActiveChatDoc(chat);
    });
    return () => unsub();
  }, [selectedChatId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatDoc?.messages]);

  // ACCEPT FLOW:
  // ACCEPT & OPEN CHAT button -> moves document from joinRequests to activeChats collection
  // and deletes from joinRequests. Then automatically switch to ACTIVE CONVERSATIONS tab and open that chat.
  const handleAcceptAndOpenChat = async (req: JoinRequestDoc) => {
    try {
      const createdChat = await acceptAndOpenChatInFirestore(req);
      setActiveTab('conversations');
      setSelectedChatId(createdChat.id);
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  // DECLINE button -> deletes from joinRequests
  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineJoinRequestInFirestore(requestId);
    } catch (err) {
      console.error('Failed to decline request:', err);
    }
  };

  // Handle + IMG file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChatId || isSending) return;

    try {
      const base64 = await fileToBase64(file);
      setStagedImage(base64);
    } catch (err) {
      console.error('Failed to read image:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle send reply in active chat
  const handleSendAdminReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = replyText.trim();
    if ((!cleanText && !stagedImage) || !selectedChatId || isSending) return;

    setIsSending(true);
    const textToSend = cleanText;
    const imageToSend = stagedImage;
    setReplyText('');
    setStagedImage(null);

    try {
      await sendChatMessageToFirestore({
        chatId: selectedChatId,
        from: 'admin',
        senderName: 'Elon Musk (Admin)',
        text: textToSend,
        imageUrl: imageToSend || undefined,
      });
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Delete chat manually
  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm('Permanently delete this private chat from Firestore?')) return;
    try {
      await deleteActiveChatInFirestore(chatId);
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  // Calculate live stats
  const totalMessagesCount = activeChats.reduce((acc, c) => acc + (c.messages?.length || 0), 0);
  const totalTransmissions = 1420 + totalMessagesCount;
  // NO AUTO-DELETE: Show all users even if offline, no limit to 1 active node
  const activeNodesCount = Math.max(activeChats.length + joinRequests.length, 2);

  const selectedName = activeChatDoc?.name || 'VISITOR';
  const selectedLocation = activeChatDoc?.location || 'EARTH';

  return (
    <div className="relative min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex flex-col selection:bg-white selection:text-black">
      {/* Animated Starfield Background */}
      <StarfieldCanvas />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header: Left = ELON MUSK SPACE (bold), Right = elonmuskspace241@gmail.com | VISITOR VIEW | LOGOUT */}
        <header className="border-b border-[#222222] px-6 py-4 bg-[#000000]/90 backdrop-blur-sm flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold tracking-[2px] uppercase text-white">
              ELON MUSK SPACE
            </span>
            <span className="hidden sm:inline text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] border-l border-[#222222] pl-3">
              ADMIN CONTROL TERMINAL
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888]">
            <span className="select-all">{AUTHORIZED_ADMIN_EMAIL}</span>
            <span className="text-[#333333]">|</span>
            <button
              onClick={onBackToVisitor}
              className="text-[#888888] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-[10px] font-mono tracking-[1.5px] uppercase"
            >
              VISITOR VIEW
            </button>
            <span className="text-[#333333]">|</span>
            <button
              onClick={async () => {
                await logoutAdmin();
                onLogout();
              }}
              className="text-[#888888] hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-[10px] font-mono tracking-[1.5px] uppercase"
            >
              LOGOUT
            </button>
          </div>
        </header>

        {/* 4. PERMANENT STORAGE INDICATOR: Change UPLINK text to "SECURE - PERMANENT STORAGE (FIREBASE)" in green */}
        <div className="border-b border-[#222222] px-6 py-2.5 bg-[#000000]/80 text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] flex flex-wrap items-center gap-x-6 gap-y-1">
          <span>
            TRANSMISSIONS: <strong className="text-white font-normal">{totalTransmissions}</strong>
          </span>
          <span className="text-[#333333]">|</span>
          <span>
            ACTIVE NODES: <strong className="text-white font-normal">{activeNodesCount}</strong>
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
            STATION TIME: <strong className="text-white font-normal">{texasTime} CST</strong>
          </span>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="border-b border-[#222222] px-6 py-2 flex items-center gap-6 bg-[#000000]/90 text-[11px] font-mono tracking-[1.5px] uppercase">
          <button
            onClick={() => {
              setActiveTab('requests');
              setSelectedChatId(null);
            }}
            className={`pb-1 transition-colors cursor-pointer rounded-none border-b-2 ${
              activeTab === 'requests' && !selectedChatId
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            SPACE JOIN REQUESTS ({joinRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('conversations')}
            className={`pb-1 transition-colors cursor-pointer rounded-none border-b-2 ${
              activeTab === 'conversations' || selectedChatId
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            ACTIVE CONVERSATIONS ({activeChats.length})
          </button>
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'requests' && !selectedChatId ? (
            /* TAB 1: SPACE JOIN REQUESTS - Cards with [ACCEPT & OPEN CHAT] and [DECLINE] */
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

                      {/* 2. ACCEPT FLOW: Two working buttons [ACCEPT & OPEN CHAT] and [DECLINE] */}
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
            /* TAB 2: ACTIVE CONVERSATIONS - Real-time from activeChats collection */
            <div className="flex-1 flex overflow-hidden w-full relative">
              {/* Left Column: Cards List of Active Conversations */}
              <aside
                className={`${
                  selectedChatId ? 'hidden lg:flex' : 'flex'
                } w-full lg:w-96 border-r border-[#222222] bg-[#000000] flex-col overflow-y-auto shrink-0`}
              >
                <div className="p-4 border-b border-[#222222] text-[11px] font-mono tracking-[1.5px] uppercase text-[#888888] flex items-center justify-between">
                  <span>ACTIVE CONVERSATIONS ({activeChats.length})</span>
                  <span className="text-[#00FF66]">FIRESTORE</span>
                </div>

                <div className="flex-1 divide-y divide-[#222222] overflow-y-auto">
                  {activeChats.length === 0 ? (
                    <div className="p-8 text-center text-[11px] font-mono text-[#888888] uppercase tracking-[1px]">
                      NO ACTIVE CHATS &bull; ACCEPT A REQUEST FROM JOIN REQUESTS TAB
                    </div>
                  ) : (
                    activeChats.map((chat) => {
                      const isSelected = selectedChatId === chat.id;
                      const msgCount = chat.messages?.length || 0;
                      return (
                        <div
                          key={chat.id}
                          className={`p-4 transition-colors flex flex-col gap-2.5 ${
                            isSelected ? 'bg-[#111111] border-l-2 border-white' : 'hover:bg-[#0a0a0a]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold tracking-[1.5px] uppercase text-white truncate">
                              {chat.name}
                            </span>
                            <span className="text-[10px] font-mono tracking-[1px] text-[#888888]">
                              {chat.date}
                            </span>
                          </div>

                          <div className="text-[10px] font-mono tracking-[1px] uppercase text-[#888888]">
                            LOCATION: <span className="text-white">{chat.location}</span>
                            <span className="text-[#333333] mx-2">|</span>
                            <span>{msgCount} TRANSMISSIONS</span>
                          </div>

                          <p className="text-[12px] text-white/80 font-light truncate tracking-[0.5px]">
                            {chat.lastMessage || 'Channel active'}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                setSelectedChatId(chat.id);
                                setActiveTab('conversations');
                              }}
                              className="flex-1 border border-white hover:bg-white hover:text-black text-white text-[10px] font-mono tracking-[1.5px] uppercase py-1.5 transition-colors cursor-pointer rounded-none text-center"
                            >
                              OPEN CHAT
                            </button>
                            <button
                              onClick={() => handleDeleteChat(chat.id)}
                              className="border border-[#222222] hover:border-red-500 text-[#666666] hover:text-red-400 text-[10px] font-mono tracking-[1px] uppercase px-2.5 py-1.5 transition-colors cursor-pointer rounded-none"
                              title="Delete conversation permanently"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </aside>

              {/* Right Column: Private Session Chat Window */}
              <main
                className={`${
                  selectedChatId ? 'flex' : 'hidden lg:flex'
                } flex-1 flex-col bg-[#000000] overflow-hidden relative`}
              >
                {selectedChatId && activeChatDoc ? (
                  <>
                    {/* Private Session Chat Header */}
                    <div className="border-b border-[#222222] p-4 bg-[#000000] flex items-center justify-between sticky top-0 z-20">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedChatId(null)}
                          className="lg:hidden text-[10px] font-mono uppercase tracking-[1.5px] border border-[#333333] hover:border-white px-2.5 py-1 text-white cursor-pointer rounded-none"
                        >
                          &lt; BACK
                        </button>
                        <div className="space-y-0.5">
                          <div className="text-[13px] font-bold tracking-[1.5px] uppercase text-white flex items-center gap-2">
                            <span>{selectedName}</span>
                            <span className="text-[10px] font-mono text-[#00FF66] border border-[#00FF66]/40 px-1.5 py-0.2">
                              PERMANENT (FIREBASE)
                            </span>
                          </div>
                          <div className="text-[10px] font-mono tracking-[1px] uppercase text-[#888888]">
                            COORDINATES: {selectedLocation} &bull; STATION TIME: {texasTime} CST
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteChat(selectedChatId)}
                        className="text-[10px] font-mono tracking-[1px] uppercase border border-[#333333] hover:border-red-500 text-[#888888] hover:text-red-400 px-3 py-1.5 transition-colors cursor-pointer rounded-none"
                      >
                        DELETE CHAT
                      </button>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#000000] pb-24">
                      {activeChatDoc.messages?.length === 0 ? (
                        <div className="p-8 text-center text-[11px] font-mono tracking-[1.5px] uppercase text-[#888888] border border-[#222222] rounded-none">
                          ROOM INITIALIZED &bull; TRANSMIT FIRST MESSAGE BELOW
                        </div>
                      ) : (
                        activeChatDoc.messages.map((m) => {
                          const isAdmin = m.from === 'admin';
                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="text-[10px] font-mono tracking-[1.5px] uppercase text-[#888888] mb-1 flex items-center gap-2">
                                <span>{isAdmin ? 'ELON MUSK [ADMIN]' : (m.senderName || selectedName)}</span>
                                <span className="text-[#333333]">&bull;</span>
                                <span>{m.time}</span>
                                <span className="text-[#333333]">&bull;</span>
                                <span>{m.date}</span>
                              </div>

                              <div
                                className={`max-w-xl p-3.5 text-[13px] tracking-[0.5px] font-light leading-relaxed border rounded-none ${
                                  isAdmin
                                    ? 'bg-[#111111] text-white border-white'
                                    : 'bg-[#000000] text-white border-[#333333]'
                                }`}
                              >
                                {m.imageUrl && (
                                  <div className="mb-2">
                                    <img
                                      src={m.imageUrl}
                                      alt="transmission payload"
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

                    {/* Staged Image Banner */}
                    {stagedImage && (
                      <div className="border-t border-[#222222] p-2 bg-[#000000] flex items-center justify-between px-4">
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
                    )}

                    {/* Fixed / Sticky Bottom Chat Compose Bar with + IMG and SEND */}
                    <div className="fixed bottom-0 right-0 left-0 lg:left-96 bg-[#000000] border-t border-[#222222] p-3 z-30">
                      <form onSubmit={handleSendAdminReply} className="flex items-center gap-2 max-w-5xl mx-auto">
                        <label className="border border-[#333333] hover:border-white px-3 py-2.5 text-[#888888] hover:text-white text-[10px] font-mono tracking-[1.5px] uppercase cursor-pointer transition-colors shrink-0 rounded-none">
                          + IMG
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>

                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`WRITE TRANSMISSION TO ${selectedName}...`}
                          className="flex-1 bg-[#000000] border border-[#333333] focus:border-white px-3.5 py-2.5 text-[12px] font-mono text-white placeholder-[#444444] tracking-[0.5px] focus:outline-none rounded-none"
                        />

                        <button
                          type="submit"
                          disabled={(!replyText.trim() && !stagedImage) || isSending}
                          className="border border-white bg-white text-black hover:bg-black hover:text-white px-6 py-2.5 text-[11px] font-mono font-semibold tracking-[2px] uppercase transition-colors disabled:opacity-30 cursor-pointer shrink-0 rounded-none"
                        >
                          {isSending ? 'SAVING...' : 'SEND'}
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
    </div>
  );
};
