import React, { useState } from 'react';
import { Rocket, Sparkles, MapPin, ShieldCheck, ArrowDown, ChevronRight, Activity } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { sounds } from '../utils/audio';

interface ElonSpaceXHeroSectionProps {
  onChatNow: (userName?: string, city?: string) => void;
  onExploreScroll: () => void;
  savedName: string;
}

const AMERICAN_CITIES = [
  'Austin, TX',
  'Starbase, TX',
  'Cape Canaveral, FL',
  'Houston, TX',
  'Miami, FL',
  'Los Angeles, CA',
  'New York, NY',
  'Palo Alto, CA',
];

export const ElonSpaceXHeroSection: React.FC<ElonSpaceXHeroSectionProps> = ({
  onChatNow,
  onExploreScroll,
  savedName,
}) => {
  const [name, setName] = useState(savedName || '');
  const [city, setCity] = useState('Austin, TX');
  const [showQuickNameModal, setShowQuickNameModal] = useState(false);

  const handleButtonClick = () => {
    sounds.playSpaceXLaunchSound();
    if (name.trim()) {
      onChatNow(name.trim(), city);
    } else {
      setShowQuickNameModal(true);
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Explorer';
    sounds.playSpaceXLaunchSound();
    onChatNow(finalName, city);
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between items-center bg-[#020408] text-white overflow-hidden px-4 py-8 border-b border-neutral-900 select-none">
      {/* 1. Dynamic Starfield Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Nebulous glow gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(29,155,240,0.18)_0%,rgba(0,82,136,0.08)_50%,transparent_75%)] blur-3xl pointer-events-none" />
        
        {/* SpaceX Cape Canaveral / Starbase launch backdrop with dark overlay */}
        <img
          src="/src/assets/images/spacex_starship_launch_1793126082661.jpg"
          alt="SpaceX Starbase Launchpad"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.22] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020408]/85 via-[#020408]/60 to-[#020408]" />

        {/* CSS Twinkling Stars Layer */}
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1D9BF0_1.5px,transparent_1.5px)] [background-size:54px_54px]" />
      </div>

      {/* 2. Top Status Bar */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950/80 border border-neutral-800 backdrop-blur-md">
          <span>🇺🇸</span>
          <span className="text-neutral-300 font-semibold tracking-wider">
            STARBASE &bull; AUSTIN, TEXAS &bull; CAPE CANAVERAL
          </span>
          <span className="text-neutral-500 hidden md:inline">&rarr; MARS</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-950/80 border border-neutral-800 text-emerald-400 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-medium">Elon Musk 👑</span>
            <VerifiedBadge type="owner" size="sm" />
            <span className="text-neutral-400 text-[11px]">&bull; Admin Online</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-950/80 border border-neutral-800 text-neutral-400">
            <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>12,847 Live in Orbit</span>
          </div>
        </div>
      </div>

      {/* 3. Centerpiece Hero Section */}
      <div className="relative z-10 max-w-4xl mx-auto text-center my-auto py-12 flex flex-col items-center">
        {/* Verified Circular Elon Portrait */}
        <div className="relative mb-6 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#1D9BF0] via-white to-sky-400 shadow-[0_0_35px_rgba(29,155,240,0.6)]">
            <img
              src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
              alt="Elon Musk"
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <VerifiedBadge type="elon" size="md" />
          </div>
        </div>

        {/* Big Text Center matching prompt: "Welcome to ELON SPACE X" */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-3 uppercase leading-[1.05] drop-shadow-2xl">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-[#1D9BF0]">ELON SPACE X</span>
        </h1>

        {/* Subtext matching prompt: "Chat with Elon AI - Inspired by Elon Musk" */}
        <p className="text-base sm:text-xl md:text-2xl text-neutral-300 font-light max-w-2xl mx-auto mb-8 tracking-wide">
          Chat with Elon AI &mdash; <span className="text-white font-medium">Inspired by Elon Musk</span>
        </p>

        {/* Big Glowing Button: [ 🚀 Chat Elon Musk Now ] - color: SpaceX blue */}
        <div className="flex flex-col items-center w-full max-w-md mx-auto mb-4">
          <button
            onClick={handleButtonClick}
            className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-[#1D9BF0] via-[#0072bb] to-[#1D9BF0] text-white text-lg sm:text-xl font-extrabold uppercase tracking-wider transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_35px_rgba(29,155,240,0.75)] hover:shadow-[0_0_55px_rgba(29,155,240,0.95)] flex items-center justify-center gap-3.5 border border-sky-300/40"
          >
            <span className="text-2xl animate-bounce">🚀</span>
            <span className="tracking-wide">Chat Elon Musk Now</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>


        {/* Supporting pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-neutral-300 font-mono">
          <span className="px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800">
            ⚡ Real-Time SSE Sync
          </span>
          <span className="px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 flex items-center gap-1.5">
            <span>Direct 1-on-1 to Owner</span>
            <VerifiedBadge type="owner" size="sm" showTooltip={false} />
          </span>
          <span className="px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800">
            🤖 Gemini Powered Elon AI
          </span>
        </div>
      </div>

      {/* 4. Bottom Scroll Cue to Explore Entire Empire Below */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center pb-2">
        <button
          onClick={onExploreScroll}
          className="group inline-flex flex-col items-center text-neutral-400 hover:text-white transition-colors"
        >
          <span className="text-xs font-mono tracking-widest uppercase mb-1">
            Explore Business Empire, Products &amp; Investments
          </span>
          <ArrowDown className="w-4 h-4 animate-bounce text-sky-400 group-hover:text-white" />
        </button>
      </div>

      {/* Quick Enter Modal if visitor hasn't typed name yet */}
      {showQuickNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-neutral-950 border border-neutral-700 p-6 sm:p-8 shadow-2xl text-left">
            <div className="flex items-center gap-2 text-xs font-mono text-[#1D9BF0] uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Direct Space Entry</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              Join Elon Musk Space 🚀
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Enter your name to connect directly with Elon AI and the verified Owner in the live chat space.
            </p>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#1D9BF0] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  maxLength={25}
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-neutral-400 block mb-1">
                  Location
                </label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#1D9BF0] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none appearance-none font-mono"
                  >
                    {AMERICAN_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-neutral-900 text-white">
                        {c} (USA)
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickNameModal(false)}
                  className="w-1/3 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(29,155,240,0.6)] flex items-center justify-center gap-2"
                >
                  <span>Launch Chat &rarr;</span>
                  <Rocket className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
