import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  Image as ImageIcon,
  Mic,
  Rocket,
  CheckCircle2,
  Crown,
  Volume2,
  Trash2,
  X,
  Sparkles,
  Radio,
} from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { sounds } from '../utils/audio';
import { VerifiedBadge } from './VerifiedBadge';

interface ChatRoomCenterProps {
  channelName: string;
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  currentUserCity: string;
  isOwnerAdmin: boolean;
  elonIsTyping: boolean;
  onSendMessage: (text: string, imageUrl?: string, voiceDuration?: number) => void;
  onReactMessage: (msgId: string, emoji: string) => void;
}

const EMOJI_LIST = ['🚀', '🇺🇸', '⚡', '🤖', '🛰️', '🔥', '🌕', '🦾', '🚘', '💡', '💎', '🐂', '😎', '❤️'];

export const ChatRoomCenter: React.FC<ChatRoomCenterProps> = ({
  channelName,
  messages,
  currentUserId,
  currentUserName,
  currentUserCity,
  isOwnerAdmin,
  elonIsTyping,
  onSendMessage,
  onReactMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom on message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, elonIsTyping]);

  // Voice note recording timer
  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      setRecordSeconds(0);
      timer = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    sounds.playSentSound();
    onSendMessage(inputText.trim(), attachedImage || undefined);
    setInputText('');
    setAttachedImage(null);
    setShowEmojiPicker(false);
  };

  const handleFinishVoiceNote = () => {
    setIsRecordingVoice(false);
    sounds.playSentSound();
    onSendMessage('🎙️ Voice Note from Starbase', undefined, recordSeconds || 4);
    setRecordSeconds(0);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Text to speech for Elon's messages
  const speakElonMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-[#070707] relative overflow-hidden">
      {/* Top Status Bar matching specification */}
      <div className="h-11 px-4 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2 truncate">
          <span className="font-mono text-xs font-bold text-white">#{channelName}</span>
          <span className="text-neutral-600">&bull;</span>
          <span className="text-[11px] text-neutral-400 font-mono truncate hidden sm:inline">
            Live Stream &bull; Low Earth Orbit Laser Constellation
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold hidden md:inline">STARLINK TELEMETRY OK</span>
          </div>
          <span className="text-neutral-500">|</span>
          <span className="text-white font-bold">Austin &rarr; Mars</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          // 1. System Landing Announcement
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-300 font-mono flex items-center gap-1.5 shadow-sm">
                  <Rocket className="w-3.5 h-3.5 text-sky-400" />
                  <span>{msg.message}</span>
                </div>
              </div>
            );
          }

          // 2. Elon Musk Message (White bubble with red border + American flag small 🇺🇸)
          if (msg.isElon) {
            return (
              <div key={msg.id} className="flex flex-col items-start max-w-2xl my-2 animate-fade-in">
                {/* Header Author Info */}
                <div className="flex items-center gap-2 mb-1 px-1">
                  <img
                    src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
                    alt="Elon Musk"
                    className="w-5 h-5 rounded-full object-cover border border-white"
                  />
                  <span className="text-xs font-extrabold text-white">Elon Musk</span>
                  <VerifiedBadge type="elon" size="sm" />
                  <span className="text-[10px]">🇺🇸</span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {msg.city || 'Boca Chica, Texas'} &bull; {msg.timeString}
                  </span>
                </div>

                {/* Bubble: White with Red Border */}
                <div className="relative group rounded-2xl rounded-tl-sm px-4 py-3 bg-white text-black border-2 border-red-600 shadow-xl text-xs sm:text-sm font-medium leading-relaxed">
                  <p className="whitespace-pre-wrap">{msg.message}</p>

                  {/* Audio Listen Button */}
                  <button
                    onClick={() => speakElonMessage(msg.message)}
                    className="absolute -right-7 top-2 p-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Listen to Elon audio voice"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Reaction Bar */}
                  <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-neutral-200 text-[10px] font-mono text-neutral-600">
                    <button
                      onClick={() => onReactMessage(msg.id, '🚀')}
                      className="hover:scale-110 transition-transform"
                    >
                      🚀 {(msg.reactions?.['🚀'] || 12)}
                    </button>
                    <button
                      onClick={() => onReactMessage(msg.id, '🔥')}
                      className="hover:scale-110 transition-transform"
                    >
                      🔥 {(msg.reactions?.['🔥'] || 8)}
                    </button>
                    <button
                      onClick={() => onReactMessage(msg.id, '❤️')}
                      className="hover:scale-110 transition-transform"
                    >
                      ❤️ {(msg.reactions?.['❤️'] || 24)}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // 3. Admin / Owner Message (Gold badge "ADMIN • Starbase, TX" #FFD700)
          if (msg.isAdmin) {
            return (
              <div key={msg.id} className="flex flex-col items-start max-w-xl my-2">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-amber-300">{msg.name} 👑</span>
                  <VerifiedBadge type="owner" size="md" />
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                    ADMIN &bull; Starbase, TX
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">{msg.timeString}</span>
                </div>

                <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#E6C200] text-black font-semibold text-xs sm:text-sm shadow-lg border border-amber-300">
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            );
          }

          // 4. Visitor / Other Users Messages
          const isMe = msg.userId === currentUserId || msg.name === currentUserName;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-lg ${
                isMe ? 'ml-auto' : 'mr-auto'
              } my-1.5`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono text-neutral-400">
                <span className="text-white font-medium">{isMe ? 'You' : msg.name}</span>
                <span>&bull;</span>
                <span className="text-neutral-500">{msg.city}</span>
                <span>&bull;</span>
                <span className="text-neutral-500">{msg.timeString}</span>
              </div>

              {/* Message Bubble: User Blue #1D9BF0 */}
              <div
                className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium leading-relaxed ${
                  isMe
                    ? 'bg-[#1D9BF0] text-white rounded-tr-sm shadow-md'
                    : 'bg-neutral-800 text-neutral-100 rounded-tl-sm border border-neutral-700'
                }`}
              >
                {msg.image && (
                  <div className="mb-2 max-w-xs rounded-lg overflow-hidden border border-black/20">
                    <img src={msg.image} alt="Uploaded attachment" className="w-full object-cover max-h-48" />
                  </div>
                )}

                {msg.voiceDuration ? (
                  <div className="flex items-center gap-2 py-0.5">
                    <Mic className="w-4 h-4 text-white animate-pulse" />
                    <span className="font-mono text-xs">Voice Transmission ({msg.voiceDuration}s)</span>
                    <div className="flex items-center gap-0.5 ml-2">
                      <span className="w-1 h-3 bg-white/70 rounded-full animate-bounce" />
                      <span className="w-1 h-5 bg-white rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-2 bg-white/60 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                )}

                {/* Reaction Counter */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex items-center gap-1 mt-1 pt-1 border-t border-white/20 text-[10px] font-mono">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <span key={emoji} className="bg-black/20 px-1 py-0.2 rounded">
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator: "Elon is typing from Starbase..." */}
        {elonIsTyping && (
          <div className="flex items-center gap-2 text-xs font-mono text-sky-400 py-1 px-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Elon is typing from Starbase, Texas...</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce delay-150" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Area */}
      <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800/80 z-20">
        {/* Attached image preview */}
        {attachedImage && (
          <div className="relative inline-block mb-2 rounded-lg overflow-hidden border border-neutral-700">
            <img src={attachedImage} alt="Attachment" className="h-16 w-16 object-cover" />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 p-3 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl flex flex-wrap gap-2 max-w-xs z-30">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-lg hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Voice Note Recording Overlay */}
        {isRecordingVoice ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/40 border border-red-800 text-xs text-white">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-bold">RECORDING AUDIO FOR STARBASE: {recordSeconds}s</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsRecordingVoice(false)}
                className="px-3 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinishVoiceNote}
                className="px-3 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-500"
              >
                Send Audio
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-neutral-700/80 rounded-2xl px-3.5 py-2 focus-within:border-white transition-colors">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-neutral-400 hover:text-white transition-colors"
                title="Insert Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-neutral-400 hover:text-white transition-colors"
                title="Attach Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isOwnerAdmin
                    ? 'Posting as Starbase Admin (Gold Badge)...'
                    : 'Message Elonverse... (Ask Elon about Mars, Tesla, Cybertruck)'
                }
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="text-neutral-400 hover:text-rose-400 transition-colors"
                title="Hold for Voice Transmission"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Send Rocket Button */}
            <button
              type="submit"
              disabled={!inputText.trim() && !attachedImage}
              className="p-3 rounded-2xl bg-white text-black hover:bg-neutral-200 disabled:opacity-40 transition-all shrink-0 shadow-lg hover:scale-105 active:scale-95"
              aria-label="Send message"
            >
              <Rocket className="w-4 h-4 fill-black" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
