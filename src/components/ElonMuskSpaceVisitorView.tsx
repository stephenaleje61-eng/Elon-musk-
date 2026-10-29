import React, { useState, useEffect, useRef } from 'react';
import {
  sendFriendRequest,
  subscribeToVisitorRequestStatus,
  subscribeToUserChat,
  sendChatMessage,
  fileToBase64,
} from '../services/firebaseChat';
import { ChatMessage, FriendRequest } from '../types/chat';

interface ElonMuskSpaceVisitorViewProps {
  visitorId: string;
  onNavigateAdmin: () => void;
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

  const [request, setRequest] = useState<FriendRequest | null>(null);
  const [name, setName] = useState(() => localStorage.getItem('elon_space_visitor_name') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('elon_space_visitor_email') || '');
  const [location, setLocation] = useState(() => localStorage.getItem('elon_space_visitor_location') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat states (active once approved or if chat messages exist or if urlVisitorId provided)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to live request status
  useEffect(() => {
    const unsubStatus = subscribeToVisitorRequestStatus(activeVisitorId, (req) => {
      setRequest(req);
      if (req) {
        if (req.name) setName(req.name);
        if (req.email) setEmail(req.email);
        if (req.location) setLocation(req.location);
      }
    });

    return () => {
      unsubStatus();
    };
  }, [activeVisitorId]);

  // Subscribe to live private messages for this visitorId:
  // privateChats/{userId}/messages with onSnapshot
  useEffect(() => {
    const unsubChat = subscribeToUserChat(activeVisitorId, (msgs) => {
      setMessages(msgs);
    });

    return () => {
      unsubChat();
    };
  }, [activeVisitorId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      localStorage.setItem('elon_space_visitor_name', name.trim());
      localStorage.setItem('elon_space_visitor_email', email.trim());
      localStorage.setItem('elon_space_visitor_location', location.trim());

      const created = await sendFriendRequest({
        visitorId: activeVisitorId,
        name: name.trim(),
        email: email.trim(),
        location: location.trim() || 'Earth',
      });
      setRequest(created);
    } catch (err) {
      console.error('Failed to send request:', err);
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

    setIsSending(true);
    const textToSend = cleanText;
    const imageToSend = stagedImage;
    setReplyText('');
    setStagedImage(null);

    try {
      await sendChatMessage({
        visitorId: activeVisitorId,
        userId: activeVisitorId,
        name: name.trim() || 'Visitor',
        senderName: name.trim() || 'Visitor',
        city: location.trim() || 'Earth',
        message: textToSend,
        imageUrl: imageToSend || undefined,
        sender: 'visitor',
        isElon: false,
        isAdmin: false,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const isApproved = Boolean(urlVisitorId) || request?.status === 'accepted' || messages.length > 0;
  const isPending = request?.status === 'pending' && !isApproved;

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header - Pure Black and White Only */}
      <header className="border-b border-white px-4 py-3 bg-[#000000] flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block animate-pulse" />
              <span className="text-[14px] font-semibold tracking-wider text-white">
                Chat with Admin - ELON MUSK SPACE
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold tracking-wider uppercase text-white">
                ELON MUSK SPACE
              </span>
              <span className="text-[12px] text-white/70 border-l border-white/40 pl-2">
                Private Channel
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateAdmin}
            className="text-[12px] text-white border border-white px-2.5 py-1 bg-[#000000] hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            Admin View
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {!isApproved ? (
          <div className="flex flex-col gap-6">
            {/* Authenticity Notice - Black & White with 1px border */}
            <div className="border border-white p-3.5 text-[12px] leading-relaxed text-white bg-[#000000]">
              <strong className="block uppercase tracking-wider text-[12px] mb-1">
                Authenticity Notice
              </strong>
              This is the official Elon Musk Space direct transmission channel. Transmissions are private and encrypted between visitor and verified administration.
            </div>

            {/* Request Form or Pending Status */}
            <div className="border border-white p-5 bg-[#000000] flex flex-col gap-4">
              <div className="border-b border-white pb-3">
                <h1 className="text-[14px] font-semibold uppercase tracking-wider text-white">
                  {isPending ? 'Request Status' : 'Request to Join Space'}
                </h1>
                <p className="text-[12px] text-white/70 mt-1">
                  {isPending
                    ? 'Your submission is queued for administration review.'
                    : 'Submit your contact information to connect directly with space administration.'}
                </p>
              </div>

              {isPending ? (
                <div className="py-6 text-center flex flex-col items-center gap-3">
                  <div className="border border-white px-4 py-3 text-[14px] font-medium bg-[#000000] text-white w-full">
                    Request Sent - Waiting for approval
                  </div>
                  <p className="text-[12px] text-white/70">
                    Applicant: <strong className="text-white">{request?.name}</strong> ({request?.location})
                  </p>
                  <p className="text-[12px] text-white/50">
                    Submitted: {new Date(request?.timestamp || Date.now()).toLocaleTimeString()} &bull; Once accepted, your private chat will open here instantly.
                  </p>
                  <button
                    onClick={() => setRequest(null)}
                    className="mt-2 text-[12px] text-white border border-white px-3 py-1.5 bg-[#000000] hover:bg-white hover:text-black transition-colors cursor-pointer"
                  >
                    Edit Submission
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] uppercase tracking-wider text-white">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-[#000000] border border-white px-3 py-2 text-[14px] text-white placeholder-white/40 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] uppercase tracking-wider text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-[#000000] border border-white px-3 py-2 text-[14px] text-white placeholder-white/40 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] uppercase tracking-wider text-white">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Austin, TX or London, UK"
                      className="w-full bg-[#000000] border border-white px-3 py-2 text-[14px] text-white placeholder-white/40 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="mt-2 w-full py-2.5 px-4 bg-[#000000] border border-white text-white text-[14px] font-semibold uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {isSubmitting ? 'Sending Request...' : 'Send Request to Join Space'}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Approved Active Private 1-on-1 Chat */
          <div className="flex flex-col h-[75vh] border border-white bg-[#000000]">
            {/* Chat Sub-header */}
            <div className="border-b border-white px-4 py-2.5 bg-[#000000] flex items-center justify-between">
              <div>
                <span className="text-[14px] font-semibold text-white block">
                  Private Session
                </span>
                <span className="text-[12px] text-white/70 font-mono">
                  Participant: {name || 'Visitor'} ({location || 'Earth'})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] border border-white px-2 py-0.5 text-white">
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                Live 2-Way
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#000000]">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-white/70 border border-dashed border-white/40">
                  Space transmission active. Send your first message or picture below to converse with Admin.
                </div>
              ) : (
                messages.map((m) => {
                  const isVisitor = !m.isAdmin && m.sender !== 'owner' && m.sender !== 'admin';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[12px] text-white/60 mb-1">
                        {isVisitor ? 'You' : 'Admin'} &bull; {m.timeString}
                      </span>
                      <div
                        className={`max-w-md p-3 text-[14px] leading-relaxed ${
                          isVisitor
                            ? 'bg-[#000000] text-white border border-white'
                            : 'bg-white text-black font-medium border border-white'
                        }`}
                      >
                        {m.imageUrl && (
                          <div className="mb-2">
                            <img
                              src={m.imageUrl}
                              alt="attachment"
                              className="max-w-[200px] border border-white cursor-pointer hover:opacity-90"
                              onClick={() => window.open(m.imageUrl, '_blank')}
                            />
                          </div>
                        )}
                        {m.text || m.message ? (
                          <p className="whitespace-pre-wrap">{m.text || m.message}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Staged Image Preview if file chosen */}
            {stagedImage && (
              <div className="border-t border-white/40 px-3 py-2 bg-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={stagedImage}
                    alt="preview"
                    className="w-12 h-12 object-cover border border-white"
                  />
                  <span className="text-[12px] text-white/80">Picture attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedImage(null)}
                  className="text-[12px] border border-white px-2 py-1 text-white hover:bg-white hover:text-black cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Chat Input Bar with Image & Send */}
            <div className="border-t border-white p-3 bg-[#000000]">
              <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                <label className="border border-white px-3 py-2.5 text-white text-[14px] cursor-pointer hover:bg-white hover:text-black transition-colors shrink-0">
                  + Img
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
                  placeholder="Write message to Admin..."
                  className="flex-1 bg-[#000000] border border-white px-3 py-2.5 text-[14px] text-white placeholder-white/40 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={(!replyText.trim() && !stagedImage) || isSending}
                  className="px-5 py-2.5 bg-white text-black border border-white text-[14px] font-semibold uppercase hover:bg-black hover:text-white transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                  {isSending ? 'Sending' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Pure Black and White Only */}
      <footer className="border-t border-white px-4 py-2.5 text-center text-[12px] text-white/60 bg-[#000000]">
        ELON MUSK SPACE &bull; Private &amp; Direct Transmissions &bull; Black &amp; White Edition
      </footer>
    </div>
  );
};
