import React, { useState, useEffect, useRef } from 'react';
import {
  subscribeToFriendRequests,
  updateFriendRequestStatus,
  subscribeToAllConversations,
  subscribeToUserChat,
  sendChatMessage,
  fileToBase64,
} from '../services/firebaseChat';
import { FriendRequest, VisitorConversation, ChatMessage } from '../types/chat';

interface ElonMuskSpaceAdminViewProps {
  onBackToVisitor: () => void;
}

export const ElonMuskSpaceAdminView: React.FC<ElonMuskSpaceAdminViewProps> = ({ onBackToVisitor }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'conversations'>('requests');
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<VisitorConversation[]>([]);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to real friend requests
  useEffect(() => {
    const unsubReqs = subscribeToFriendRequests((list) => {
      setRequests(list);
    });
    return () => {
      unsubReqs();
    };
  }, []);

  // 2. Subscribe to all active visitor conversations
  useEffect(() => {
    const unsubConvs = subscribeToAllConversations((list) => {
      setConversations(list);
    });
    return () => {
      unsubConvs();
    };
  }, []);

  // 3. Subscribe to selected visitor's private chat:
  // privateChats/{userId}/messages with onSnapshot
  useEffect(() => {
    if (!selectedVisitorId) {
      setChatMessages([]);
      return;
    }

    const unsubChat = subscribeToUserChat(selectedVisitorId, (msgs) => {
      setChatMessages(msgs);
    });

    return () => {
      unsubChat();
    };
  }, [selectedVisitorId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAcceptRequest = async (req: FriendRequest) => {
    await updateFriendRequestStatus(req.visitorId, 'accepted');
    setSelectedVisitorId(req.visitorId);
    setActiveTab('conversations');
  };

  const handleDeclineRequest = async (req: FriendRequest) => {
    await updateFriendRequestStatus(req.visitorId, 'declined');
  };

  // Picture Sending via Base64 to Firestore and Server
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedVisitorId || isSending) return;

    try {
      setIsSending(true);
      const url = await fileToBase64(file);
      await sendChatMessage({
        visitorId: selectedVisitorId,
        userId: selectedVisitorId,
        name: 'Elon musk',
        senderName: 'Elon musk',
        city: 'Texas',
        message: replyText.trim() || '',
        imageUrl: url,
        sender: 'owner',
        isAdmin: true,
        isElon: false,
      });
      setReplyText('');
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setIsSending(false);
      e.target.value = '';
    }
  };

  const handleSendAdminReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = replyText.trim();
    if (!clean || !selectedVisitorId || isSending) return;

    setIsSending(true);
    setReplyText('');

    try {
      await sendChatMessage({
        visitorId: selectedVisitorId,
        userId: selectedVisitorId,
        name: 'Elon musk',
        senderName: 'Elon musk',
        city: 'Texas',
        message: clean,
        sender: 'owner',
        isAdmin: true,
        isElon: false,
      });
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeConversation = conversations.find((c) => c.userId === selectedVisitorId);
  const activeRequest = requests.find((r) => r.visitorId === selectedVisitorId);

  const selectedName = activeConversation?.userName || activeRequest?.name || 'Visitor';
  const selectedLocation = activeConversation?.userCity || activeRequest?.location || 'Texas';

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex flex-col selection:bg-white selection:text-black">
      {/* Top Header - Pure Black and White Only */}
      <header className="border-b border-white px-4 py-3 bg-[#000000] flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold tracking-wider uppercase text-white">
            ELON MUSK SPACE - Admin Control
          </span>
          <span className="text-[12px] text-white/70 border-l border-white/40 pl-2">
            Direct Access
          </span>
        </div>

        <button
          onClick={onBackToVisitor}
          className="text-[12px] text-white border border-white px-2.5 py-1 bg-[#000000] hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          Visitor View
        </button>
      </header>

      {/* Tabs Bar */}
      <div className="border-b border-white px-4 py-2 bg-[#000000] flex items-center gap-2">
        <button
          onClick={() => {
            setActiveTab('requests');
          }}
          className={`text-[12px] uppercase tracking-wider px-3 py-1.5 border border-white transition-colors cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-white text-black font-semibold'
              : 'bg-[#000000] text-white hover:bg-white hover:text-black'
          }`}
        >
          Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('conversations')}
          className={`text-[12px] uppercase tracking-wider px-3 py-1.5 border border-white transition-colors cursor-pointer ${
            activeTab === 'conversations'
              ? 'bg-white text-black font-semibold'
              : 'bg-[#000000] text-white hover:bg-white hover:text-black'
          }`}
        >
          Conversations ({conversations.length})
        </button>
      </div>

      {/* Admin Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'requests' ? (
          /* Requests Tab: List of real friend requests */
          <div className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full overflow-y-auto">
            <div className="border border-white p-4 mb-4">
              <h2 className="text-[14px] font-semibold uppercase tracking-wider text-white">
                Space Join Requests
              </h2>
              <p className="text-[12px] text-white/70 mt-0.5">
                Review applicants who submitted requests to join Elon Musk Space. Real-time updates without page refresh.
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="border border-dashed border-white/40 p-8 text-center text-[12px] text-white/60">
                No join requests submitted yet. Use the visitor view to submit a request.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="border border-white p-4 bg-[#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-white">{req.name}</span>
                        <span className="text-[12px] border border-white/60 px-1.5 py-0.2 uppercase text-white/80">
                          {req.status}
                        </span>
                      </div>
                      <div className="text-[12px] text-white/70 font-mono">
                        <span>Email: {req.email || 'N/A'}</span> &bull; <span>Location: {req.location || 'Earth'}</span>
                      </div>
                      <span className="text-[12px] text-white/40">
                        Submitted: {new Date(req.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            className="px-3 py-1.5 bg-white text-black border border-white text-[12px] font-semibold uppercase hover:bg-black hover:text-white transition-colors cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req)}
                            className="px-3 py-1.5 bg-[#000000] text-white border border-white text-[12px] font-semibold uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedVisitorId(req.visitorId);
                            setActiveTab('conversations');
                          }}
                          className="px-3 py-1.5 bg-[#000000] text-white border border-white text-[12px] uppercase hover:bg-white hover:text-black transition-colors cursor-pointer"
                        >
                          Open Chat
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Conversations Tab: 2-Panel Inbox and Private Chat */
          <div className="flex-1 flex overflow-hidden w-full relative">
            {/* Left: Conversations List (Hidden on mobile when chat is selected) */}
            <aside
              className={`${
                selectedVisitorId ? 'hidden md:flex' : 'flex'
              } w-full md:w-80 border-r border-white bg-[#000000] flex-col overflow-y-auto shrink-0`}
            >
              <div className="p-3 border-b border-white text-[12px] font-semibold uppercase tracking-wider text-white flex items-center justify-between">
                <span>Conversations ({conversations.length})</span>
              </div>

              <div className="flex-1 divide-y divide-white/20 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-[12px] text-white/50 text-center">
                    No active conversations. Accept a request to start private chat.
                  </div>
                ) : (
                  conversations.map((c) => {
                    const isSelected = selectedVisitorId === c.userId;
                    return (
                      <button
                        key={c.userId}
                        onClick={() => setSelectedVisitorId(c.userId)}
                        className={`w-full p-3 text-left transition-colors flex flex-col gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black'
                            : 'bg-[#000000] text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[14px] font-semibold truncate ${
                              isSelected ? 'text-black' : 'text-white'
                            }`}
                          >
                            {c.userName || c.name}
                          </span>
                          <span
                            className={`text-[12px] font-mono ${
                              isSelected ? 'text-black/70' : 'text-white/60'
                            }`}
                          >
                            {new Date(c.lastTimestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span
                          className={`text-[12px] font-mono truncate ${
                            isSelected ? 'text-black/80' : 'text-white/70'
                          }`}
                        >
                          {c.userCity || c.location || 'Earth'}
                        </span>
                        <p
                          className={`text-[12px] truncate mt-0.5 ${
                            isSelected ? 'text-black/90' : 'text-white/80'
                          }`}
                        >
                          {c.lastMessage}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Right: Active Chat Area */}
            <main
              className={`${
                selectedVisitorId ? 'flex' : 'hidden md:flex'
              } flex-1 flex-col bg-[#000000] overflow-hidden relative`}
            >
              {selectedVisitorId ? (
                <>
                  {/* TOP HEADER: Elon musk - Texas - 04:54 PM + < Back */}
                  <div className="border-b border-white p-3 bg-[#000000] flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedVisitorId(null)}
                        className="text-[12px] text-white border border-white px-2 py-1 bg-[#000000] hover:bg-white hover:text-black transition-colors cursor-pointer"
                      >
                        &lt; Back
                      </button>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-white">
                          Elon musk - Texas - {texasTime}
                        </span>
                        <span className="text-[12px] text-white/60 font-mono">
                          Chatting with: {selectedName} ({selectedLocation})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area - with bottom padding for fixed input */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#000000] pb-[85px]">
                    {chatMessages.length === 0 ? (
                      <div className="p-6 text-center text-[12px] text-white/60 border border-dashed border-white/40">
                        No messages in this private room yet. Send a message below to start conversation.
                      </div>
                    ) : (
                      chatMessages.map((m) => {
                        const isAdmin = m.isAdmin || m.sender === 'owner' || m.sender === 'admin';
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[12px] text-white/60 mb-1">
                              {isAdmin ? 'Elon musk (Admin)' : m.name} &bull; {m.timeString}
                            </span>
                            <div
                              className={`max-w-md p-3 text-[14px] leading-relaxed ${
                                isAdmin
                                  ? 'bg-white text-black font-medium border border-white'
                                  : 'bg-[#000000] text-white border border-white'
                              }`}
                            >
                              {m.imageUrl && (
                                <div className="mb-2">
                                  <img
                                    src={m.imageUrl}
                                    alt="chat attachment"
                                    className="max-w-[200px] border border-white cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(m.imageUrl, '_blank')}
                                  />
                                </div>
                              )}
                              {m.message || m.text ? (
                                <p className="whitespace-pre-wrap">{m.message || m.text}</p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* BOTTOM FIXED (always visible):
                      <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-black border-t border-white flex items-center px-2 gap-2">
                  */}
                  <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-black border-t border-white flex items-center px-2 sm:px-4 gap-2 z-30">
                    <label className="border border-white px-3 py-2 text-white text-sm cursor-pointer hover:bg-white hover:text-black transition-colors shrink-0">
                      + Img
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>

                    <input
                      className="flex-1 bg-black border border-white text-white text-sm p-2 focus:outline-none"
                      placeholder="Write message..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendAdminReply();
                        }
                      }}
                    />

                    <button
                      onClick={handleSendAdminReply}
                      disabled={!replyText.trim() || isSending}
                      className="border border-white px-4 py-2 bg-white text-black text-sm font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                    >
                      {isSending ? 'Sending' : 'Send'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-[12px] text-white/60 text-center">
                  Select a visitor conversation on the left or approve a request from the Requests tab to open private chat.
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
