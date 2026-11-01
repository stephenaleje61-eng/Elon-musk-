import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  ShieldCheck,
  Check,
  CheckCheck,
  Clock,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
  Paperclip,
} from 'lucide-react';
import {
  ensureVisitorAuth,
  getOrCreateVisitorConversation,
  subscribeToConversation,
  subscribeToMessages,
  sendChatMessage,
  uploadChatImage,
  markConversationRead,
  ConversationDoc,
  MessageDoc,
} from '../services/firebaseChatSystem';

interface DedicatedChatSectionProps {
  visitorId: string;
  initialTopic?: string;
  userName: string;
  userEmail: string;
}

export const DedicatedChatSection: React.FC<DedicatedChatSectionProps> = ({
  visitorId,
  initialTopic,
  userName,
  userEmail,
}) => {
  const [conversation, setConversation] = useState<ConversationDoc | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [authUid, setAuthUid] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [inputText, setInputText] = useState(
    initialTopic ? `Hello, I would like to inquire about: ${initialTopic}` : ''
  );
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreview, setStagedPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initialize anonymous authenticated identity & load/create private conversation
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    async function initChat() {
      try {
        const user = await ensureVisitorAuth();
        if (!isMounted) return;
        setAuthUid(user.uid);

        const conv = await getOrCreateVisitorConversation(userName, userEmail);
        if (!isMounted) return;
        setConversation(conv);
      } catch (err: any) {
        console.error('Failed to initialize visitor conversation:', err);
        if (isMounted) setErrorMsg('Could not establish secure uplink. Retrying...');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initChat();
    return () => {
      isMounted = false;
    };
  }, [userName, userEmail]);

  // 2. Subscribe to real-time conversation metadata
  useEffect(() => {
    if (!conversation?.conversationId) return;
    const unsub = subscribeToConversation(conversation.conversationId, (updated) => {
      if (updated) {
        setConversation(updated);
        // Mark as read for visitor if unread messages existed
        if (updated.unreadForVisitor > 0) {
          markConversationRead(conversation.conversationId, 'visitor');
        }
      }
    });
    return () => unsub();
  }, [conversation?.conversationId]);

  // 3. Subscribe to real-time messages in this visitor's private conversation
  useEffect(() => {
    if (!conversation?.conversationId) return;
    const unsub = subscribeToMessages(conversation.conversationId, (list) => {
      setMessages(list);
    });
    return () => unsub();
  }, [conversation?.conversationId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, stagedPreview]);

  // Handle image selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    setStagedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setStagedPreview(objectUrl);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelAttachment = () => {
    setStagedFile(null);
    if (stagedPreview) URL.revokeObjectURL(stagedPreview);
    setStagedPreview(null);
    setUploadProgress(null);
  };

  // Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanText = inputText.trim();

    if ((!cleanText && !stagedFile) || isSending) return;

    let activeConv = conversation;
    if (!activeConv) {
      try {
        activeConv = await getOrCreateVisitorConversation(userName, userEmail);
        setConversation(activeConv);
      } catch (e: any) {
        setErrorMsg('Establishing connection to transmission channel, please retry in a second...');
        return;
      }
    }

    if (activeConv.status === 'blocked') {
      alert('This conversation has been restricted by platform administration.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    // Instant optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: MessageDoc = {
      messageId: tempId,
      conversationId: activeConv.conversationId,
      senderId: authUid || 'visitor_me',
      senderRole: 'visitor',
      text: cleanText,
      imageUrl: stagedPreview || undefined,
      createdAt: { seconds: Math.floor(Date.now() / 1000) },
      deliveryStatus: 'sent',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');

    try {
      let uploadedImageUrl: string | undefined = undefined;

      if (stagedFile) {
        setUploadProgress(10);
        uploadedImageUrl = await uploadChatImage(
          stagedFile,
          activeConv.conversationId,
          (prog) => setUploadProgress(prog)
        );
      }

      await sendChatMessage({
        conversationId: activeConv.conversationId,
        text: cleanText,
        imageUrl: uploadedImageUrl,
        senderRole: 'visitor',
        senderName: userName || 'Visitor',
      });

      handleCancelAttachment();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      // Remove optimistic message if write failed
      setMessages((prev) => prev.filter((m) => m.messageId !== tempId));
      setErrorMsg(err.message || 'Transmission failed. Click retry.');
    } finally {
      setIsSending(false);
      setUploadProgress(null);
    }
  };

  const formatMessageTime = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (typeof createdAt === 'number') {
      return new Date(createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return 'Just now';
  };

  return (
    <section id="chat" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Direct Technology Communications
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Message ELON MUSK SPACE
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            Real-time private 1-to-1 conversation with our technology support staff. Inquire regarding Tesla vehicle orders, Starlink kits, or SpaceX mission logistics.
          </p>
        </div>

        {/* Permanent Storage Indicator */}
        <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold uppercase tracking-wider">
            SECURE - PERMANENT STORAGE (FIREBASE)
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0A152A] border border-[#1A2A4A] overflow-hidden shadow-2xl">
        {/* Chat Header Bar */}
        <div className="p-4 bg-[#050A14] border-b border-[#1A2A4A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A152A] border border-[#00F0FF] flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">ELON MUSK SPACE Support Desk</span>
                <span className="text-[10px] font-mono text-[#00F0FF] bg-[#0A152A] px-2 py-0.5 rounded border border-[#1A2A4A]">
                  PRIVATE 1-TO-1
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#AAB7CC] mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Support Online
                </span>
                <span>&bull;</span>
                <span className="font-mono text-xs text-white">
                  {conversation?.conversationId || 'Connecting...'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-[#AAB7CC]">
            <span className="block font-mono text-[10px] text-[#AAB7CC]/80">
              Auth UID: {authUid ? authUid.slice(0, 14) + '...' : 'Authenticating...'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              REAL-TIME SYNC ACTIVE
            </span>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-2.5 bg-[#050A14]/70 border-b border-[#1A2A4A] text-center text-xs text-[#AAB7CC] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00F0FF] shrink-0" />
          <span>
            You are speaking in a private thread with platform support staff and assistants. (Not personal responses from Elon Musk).
          </span>
        </div>

        {/* Messages Stream */}
        <div className="p-4 sm:p-6 h-[440px] overflow-y-auto space-y-4 bg-[#0A152A] scrollbar-thin">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-xs text-[#AAB7CC] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#00F0FF]" />
              <span>Authenticating secure visitor transmission channel...</span>
            </div>
          ) : (
            <>
              {/* System Welcome Dispatch */}
              <div className="p-4 rounded-xl bg-[#050A14] border border-[#1A2A4A] max-w-lg mr-auto text-xs leading-relaxed shadow-sm">
                <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-[#00F0FF]">
                  <span className="font-bold">ELON MUSK SPACE &bull; SUPPORT DESK</span>
                  <span className="text-[#AAB7CC]">UPLINK VERIFIED</span>
                </div>
                <p className="text-white">
                  Welcome, <strong className="text-[#00F0FF]">{userName}</strong>! Your private channel is now connected to our support desk. Feel free to send inquiries regarding Tesla vehicle deliveries, Starlink residential or mini setups, Powerwall installations, or SpaceX commercial payload slots.
                </p>
              </div>

              {/* Message List */}
              {messages.map((m) => {
                const isAdmin = m.senderRole === 'admin';

                return (
                  <div
                    key={m.messageId}
                    className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                      isAdmin ? 'mr-auto items-start' : 'ml-auto items-end'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-[#AAB7CC]">
                      <span className={isAdmin ? 'text-[#00F0FF] font-bold' : 'text-white font-bold'}>
                        {isAdmin ? 'ELON MUSK [ADMIN]' : userName || 'YOU'}
                      </span>
                      <span>&bull;</span>
                      <span>{formatMessageTime(m.createdAt)}</span>
                      {!isAdmin && (
                        <span
                          className="inline-flex items-center text-[#00F0FF]"
                          title={
                            m.deliveryStatus === 'read'
                              ? 'Read'
                              : m.deliveryStatus === 'delivered'
                              ? 'Delivered'
                              : 'Sent'
                          }
                        >
                          {m.deliveryStatus === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          ) : m.deliveryStatus === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isAdmin
                          ? 'bg-[#050A14] border border-[#00F0FF]/40 text-white shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                          : 'bg-gradient-to-r from-[#00F0FF] to-[#1E88E5] text-[#050A14] font-medium'
                      }`}
                    >
                      {m.imageUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-black/20 bg-black/40">
                          <img
                            src={m.imageUrl}
                            alt="Attachment"
                            className="max-w-xs max-h-56 object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(m.imageUrl, '_blank')}
                          />
                        </div>
                      )}
                      {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress !== null && (
          <div className="bg-[#050A14] px-4 py-1.5 border-t border-[#1A2A4A] flex items-center justify-between text-[11px] text-[#00F0FF]">
            <span>Uploading image attachment... {uploadProgress}%</span>
            <div className="w-32 bg-[#0A152A] rounded-full h-1.5 border border-[#1A2A4A] overflow-hidden">
              <div
                className="bg-[#00F0FF] h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Staged Image Preview */}
        {stagedPreview && (
          <div className="p-3 bg-[#050A14] border-t border-[#1A2A4A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={stagedPreview}
                alt="Preview"
                className="w-14 h-14 object-cover rounded-lg border border-[#00F0FF] shadow-sm"
              />
              <div>
                <span className="text-xs text-white font-medium block truncate max-w-xs">
                  {stagedFile?.name}
                </span>
                <span className="text-[10px] text-[#AAB7CC] block">
                  {stagedFile ? `${(stagedFile.size / 1024).toFixed(1)} KB` : ''} &bull; Ready to transmit
                </span>
              </div>
            </div>
            <button
              onClick={handleCancelAttachment}
              className="p-1.5 rounded-lg text-[#AAB7CC] hover:text-white hover:bg-[#0A152A]"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error notification bar if failed */}
        {errorMsg && (
          <div className="px-4 py-2 bg-rose-500/20 border-t border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-[#050A14] border-t border-[#1A2A4A] flex items-center gap-2"
        >
          {/* File Picker */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF] text-[#AAB7CC] hover:text-[#00F0FF] transition-colors shrink-0"
            title="Attach Image (Max 5MB)"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder="Type your transmission to the technology support team (Enter to send)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0A152A] border border-[#1A2A4A] text-xs text-white placeholder-[#AAB7CC]/60 focus:outline-none focus:border-[#00F0FF]"
          />

          <button
            type="submit"
            disabled={isSending || (!inputText.trim() && !stagedFile)}
            className="py-2.5 px-5 rounded-xl bg-[#00F0FF] text-[#050A14] font-extrabold text-xs hover:bg-[#00F0FF]/90 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.35)] shrink-0 disabled:opacity-40"
          >
            {isSending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isSending ? 'Sending...' : 'SEND'}</span>
          </button>
        </form>
      </div>
    </section>
  );
};
