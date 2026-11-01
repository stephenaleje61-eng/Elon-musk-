import React, { useState } from 'react';
import { Newspaper, MessageSquare, ThumbsUp, Send, CheckCircle, ExternalLink, Sparkles, UserCheck } from 'lucide-react';
import { TECHNOLOGY_NEWS, INITIAL_COMMUNITY_MESSAGES } from '../data/elonverseData';
import { NewsArticle, CommunityMessage } from '../types';

interface TechNewsAndCommunitySectionProps {
  onOpenMessageSupport?: (topic: string) => void;
  userName?: string;
}

export const TechNewsAndCommunitySection: React.FC<TechNewsAndCommunitySectionProps> = ({
  onOpenMessageSupport,
  userName = 'Visitor',
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>(INITIAL_COMMUNITY_MESSAGES);
  const [newPostText, setNewPostText] = useState('');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newMsg: CommunityMessage = {
      id: `msg-${Date.now()}`,
      sender: userName || 'TechEnthusiast',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`,
      text: newPostText.trim(),
      timestamp: 'Just now',
      reactions: 1,
      isVerified: false,
    };

    setMessages([newMsg, ...messages]);
    setNewPostText('');
  };

  const toggleLike = (id: string) => {
    const isLiked = !!likedMap[id];
    setLikedMap((prev) => ({ ...prev, [id]: !isLiked }));
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, reactions: m.reactions + (isLiked ? -1 : 1) } : m))
    );
  };

  return (
    <section id="community" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Press & Community Discourse
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Latest News & Community
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            Verified updates from launch pads, Gigafactories, and supercomputing centers, alongside active member discussion.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 4 Verified Technology News Articles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#00F0FF]">
            <Newspaper className="w-4 h-4" />
            <span className="uppercase tracking-wider">Verified Engineering Bulletins</span>
          </div>

          <div className="space-y-4">
            {TECHNOLOGY_NEWS.map((article) => (
              <div
                key={article.id}
                className="p-5 rounded-xl bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF]/40 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 text-xs text-[#AAB7CC] mb-2 font-mono">
                  <span className="text-[#00F0FF]">{article.category}</span>
                  <span>·</span>
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#00F0FF] transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-[#AAB7CC] leading-relaxed mb-4">
                  {article.summary}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#1A2A4A] text-xs">
                  <span className="text-[11px] text-[#AAB7CC] font-mono">Source: {article.source}</span>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#00F0FF] hover:underline font-semibold"
                  >
                    <span>Read Full Bulletin</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Community Forum & Live Discussion */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A2A4A] mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00F0FF]" />
              <h3 className="text-sm font-bold text-white">Community Dispatch</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ACTIVE MEMBERS
            </span>
          </div>

          {/* Quick Post Box */}
          <form onSubmit={handlePost} className="mb-5 pb-4 border-b border-[#1A2A4A]">
            <textarea
              rows={2}
              placeholder="Share thoughts on Starship, Tesla energy, or Optimus..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-xs text-white placeholder-[#AAB7CC]/60 focus:outline-none focus:border-[#00F0FF] resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-[#AAB7CC]">Posting as <strong className="text-white">{userName}</strong></span>
              <button
                type="submit"
                disabled={!newPostText.trim()}
                className="py-1.5 px-3 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all disabled:opacity-40 flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </div>
          </form>

          {/* Messages list */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {messages.map((item) => {
              const isLiked = !!likedMap[item.id];

              return (
                <div key={item.id} className="p-3 rounded-xl bg-[#050A14] border border-[#1A2A4A]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.avatar}
                        alt={item.sender}
                        className="w-6 h-6 rounded-full bg-[#0A152A] border border-[#1A2A4A]"
                      />
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        {item.sender}
                        {item.isVerified && (
                          <CheckCircle className="w-3 h-3 text-[#00F0FF] fill-current" />
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#AAB7CC] font-mono">{item.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#AAB7CC] leading-relaxed mb-2">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#AAB7CC] pt-2 border-t border-[#1A2A4A]/60">
                    <button
                      onClick={() => toggleLike(item.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-[#00F0FF] font-bold' : 'hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{item.reactions}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenMessageSupport) {
                          onOpenMessageSupport(`Regarding community post by ${item.sender}: "${item.text.slice(0, 40)}..."`);
                        }
                      }}
                      className="text-[10px] text-[#AAB7CC] hover:text-[#00F0FF]"
                    >
                      Reply via Support
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
