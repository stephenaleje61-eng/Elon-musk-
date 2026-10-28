import React, { useState } from 'react';
import { MessageSquare, ExternalLink, ShieldCheck, Users, X, Send } from 'lucide-react';
import { CommunityChatModal } from './CommunityChatModal';

export const MessageElonBanner: React.FC<{ userName: string }> = ({ userName }) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [communityModalOpen, setCommunityModalOpen] = useState(false);

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Banner Container matching bottom of screenshot */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-[#080808] grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left Side: Photo & Quote */}
        <div className="lg:col-span-8 relative min-h-[220px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
          {/* Background Photo */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
              alt="Elon Musk in aerospace hangar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top filter brightness-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-400 uppercase tracking-widest">
              <span className="font-bold text-white tracking-widest">TESLA · SPACEX · xAI</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Welcome to Elon Musk, Tesla Space, ELX
            </h3>
            <p className="text-xs text-neutral-300 font-medium mb-3">
              The future is not dream. It's a plan.
            </p>
            <p className="text-xs text-neutral-400 italic font-mono">
              &ldquo;Together we can build a better future.&rdquo; &mdash; Elon Musk
            </p>
          </div>

          <div className="relative z-10 pt-4 text-[11px] text-neutral-400 font-mono">
            Independent Information &amp; Technology Discovery Platform
          </div>
        </div>

        {/* Right Side: Message Elon Musk Panel matching screenshot */}
        <div className="lg:col-span-4 bg-neutral-950/95 border-t lg:border-t-0 lg:border-l border-neutral-800 p-6 flex flex-col justify-between text-left">
          <div>
            <h4 className="text-base font-bold text-white mb-1">
              Message Elon Musk
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Tap below to explore public communication channels, official company addresses, and verified profiles.
            </p>

            <button
              onClick={() => setContactModalOpen(true)}
              className="w-full py-2.5 px-4 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-md mb-4"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Tap Here</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-neutral-900">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-neutral-800 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white">
                  EM
                </div>
                <div className="w-7 h-7 rounded-full bg-neutral-700 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white">
                  X
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online now</span>
              </div>
            </div>

            <button
              onClick={() => setCommunityModalOpen(true)}
              className="text-xs text-neutral-400 hover:text-white underline underline-offset-4"
            >
              Community Chat
            </button>
          </div>
        </div>
      </div>

      {/* Verified Contact Directory Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              Verified Public Contact Channels
            </h3>
            <p className="text-xs text-neutral-400 mb-5">
              To ensure transparency, here are the official verified routes to reach Elon Musk and executive corporate offices.
            </p>

            <div className="space-y-3 mb-6">
              <a
                href="https://x.com/elonmusk"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <span className="font-bold text-white block">Official Profile on X (@elonmusk)</span>
                  <span className="text-[11px] text-neutral-400">Direct mentions, public replies, and verified broadcasts</span>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              </a>

              <a
                href="https://ir.tesla.com"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <span className="font-bold text-white block">Tesla Investor Relations &amp; Press</span>
                  <span className="text-[11px] text-neutral-400">Shareholder queries, corporate proposals, and product feedback</span>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              </a>

              <a
                href="https://www.spacex.com/contact"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <span className="font-bold text-white block">SpaceX Starbase Operations &amp; Media</span>
                  <span className="text-[11px] text-neutral-400">Starship launch inquiries, rideshare payloads, Starlink enterprise</span>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white" />
              </a>
            </div>

            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                ELONVERSE is an independent platform and does not guarantee personal responses or claim private endorsement.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setContactModalOpen(false);
                  setCommunityModalOpen(true);
                }}
                className="flex-1 py-2 bg-neutral-900 border border-neutral-700 text-xs text-white font-medium rounded-lg hover:bg-neutral-800"
              >
                Open Community Board
              </button>
              <button
                onClick={() => setContactModalOpen(false)}
                className="flex-1 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Chat Modal */}
      {communityModalOpen && (
        <CommunityChatModal
          userName={userName}
          onClose={() => setCommunityModalOpen(false)}
        />
      )}
    </section>
  );
};
