import React, { useState } from 'react';
import { X, Send, Heart, Users, Shield } from 'lucide-react';
import { INITIAL_COMMUNITY_MESSAGES } from '../data/elonverseData';
import { CommunityMessage } from '../types';

interface CommunityChatModalProps {
  userName: string;
  onClose: () => void;
}

export const CommunityChatModal: React.FC<CommunityChatModalProps> = ({
  userName,
  onClose,
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>(INITIAL_COMMUNITY_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: CommunityMessage = {
      id: `msg-${Date.now()}`,
      sender: userName || 'Guest Explorer',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName || 'guest')}`,
      text: inputMsg.trim(),
      timestamp: 'Just now',
      reactions: 1,
      isVerified: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  const handleLikeMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, reactions: m.reactions + 1 } : m))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0d0d0d] border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[560px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-sm font-bold text-white">ELONVERSE Community Hub</h3>
              <p className="text-[11px] text-neutral-400">Public ideas, Starlink field reports &amp; discussions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guest Mode Indicator */}
        <div className="py-2 px-3 my-2 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Posting as: <strong className="text-white">{userName}</strong> (No login required)</span>
          </div>
          <span className="text-emerald-400 font-mono">&#9679; Live Feed</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 my-2">
          {messages.map((m) => (
            <div key={m.id} className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <img
                    src={m.avatar}
                    alt={m.sender}
                    className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700"
                  />
                  <span className="text-xs font-bold text-white">{m.sender}</span>
                  {m.isVerified && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-sky-950 text-sky-400 font-mono">
                      Verified
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">{m.timestamp}</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed mb-2">{m.text}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => handleLikeMessage(m.id)}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-400 transition-colors"
                >
                  <Heart className="w-3 h-3" />
                  <span className="font-mono">{m.reactions}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Input Field */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-neutral-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Share Starlink speed, Tesla thoughts, or future questions..."
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors shrink-0"
            aria-label="Send community post"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
