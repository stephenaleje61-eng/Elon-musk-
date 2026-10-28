import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles, Shield, MapPin, Radio, Users } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ChatWelcomeScreenProps {
  onEnterSpace: (name: string, city: string) => void;
}

const AMERICAN_CITIES = [
  'Austin, TX',
  'Starbase, TX',
  'Cape Canaveral, FL',
  'Miami, FL',
  'Los Angeles, CA',
  'New York, NY',
  'Palo Alto, CA',
  'Seattle, WA',
];

export const ChatWelcomeScreen: React.FC<ChatWelcomeScreenProps> = ({ onEnterSpace }) => {
  const [typedTitle, setTypedTitle] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedCity, setSelectedCity] = useState('Austin, TX');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  const fullTitle = 'Welcome to Elon Musk Space 🚀';

  // Typing animation effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 75);
    return () => clearInterval(interval);
  }, []);

  // Pre-fill existing name if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('elonverse_user_name');
      if (saved && saved !== 'Guest Explorer') {
        setUserName(saved);
      }
      const savedCity = localStorage.getItem('elonverse_user_city');
      if (savedCity) {
        setSelectedCity(savedCity);
      }
    } catch (e) {}
  }, []);

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = userName.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your name to enter the Elonverse space.');
      return;
    }

    setErrorMsg('');
    setIsLaunching(true);

    // Play SpaceX launch roar + audio staging chime
    sounds.playSpaceXLaunchSound();

    try {
      localStorage.setItem('elonverse_user_name', cleanName);
      localStorage.setItem('elonverse_user_city', selectedCity);
      localStorage.setItem('elonverse_entered', 'true');
    } catch (err) {}

    setTimeout(() => {
      onEnterSpace(cleanName, selectedCity);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black overflow-hidden select-none">
      {/* Background Visual Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/elonverse_hero_space_car_1793126081951.jpg"
          alt="SpaceX Starbase Launchpad at Sunset"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-110 scale-105 transition-transform duration-1000"
        />
        {/* Dark Vignette & Aerospace Grid Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/60 to-[#0A0A0A]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* Floating Orbital Badges */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2 text-xs font-mono text-neutral-400">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="text-white font-semibold">USA BROADCAST</span>
        <span>&middot;</span>
        <span>LIVE FROM AUSTIN, TEXAS &bull; STARBASE</span>
      </div>

      <div className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-800">
        <Radio className="w-3.5 h-3.5 text-emerald-400" />
        <span>STARLINK ORBITAL DOWNLINK: 218 Mbps</span>
      </div>

      {/* Center Card: Glassmorphic, blurred, premium Tesla style */}
      <div
        className={`relative z-20 w-full max-w-xl rounded-2xl bg-neutral-950/75 border border-white/15 p-7 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] transition-all duration-700 ${
          isLaunching ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header Tag */}
        <div className="flex items-center justify-center gap-2 mb-4 text-xs font-mono tracking-widest text-neutral-400 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
          <span>ELONVERSE CHAT SPACE &bull; AMERICAN EDITION</span>
        </div>

        {/* Typed Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-center mb-3 min-h-[44px] flex items-center justify-center">
          <span>{typedTitle}</span>
          <span className="inline-block w-2.5 h-7 bg-white ml-1.5 animate-pulse" />
        </h1>

        {/* Subtext matching specification */}
        <p className="text-xs sm:text-sm text-neutral-300 text-center max-w-md mx-auto mb-7 leading-relaxed">
          The Future Is Here. Built by Elon.
          <br />
          <span className="text-neutral-400">Live from Austin, Texas to Mars. Chat with Elon + American Community.</span>
        </p>

        {/* Entry Form */}
        <form onSubmit={handleEnter} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5 text-left">
              Enter Your Name to Join the Future
            </label>
            <input
              type="text"
              autoFocus
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. David, Sarah, or Austin Engineer"
              className="w-full bg-black/60 border border-neutral-700 focus:border-white rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors font-medium shadow-inner"
              maxLength={28}
            />
            {errorMsg && (
              <p className="text-xs text-rose-400 text-left mt-1.5 font-mono">{errorMsg}</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5 text-left flex items-center justify-between">
              <span>Your Location</span>
              <span className="text-neutral-500 text-[10px]">USA Hub</span>
            </label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-black/60 border border-neutral-700 focus:border-white rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors appearance-none font-mono"
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

          {/* Big White Glowing Button with Rocket Icon */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLaunching}
              className="w-full py-3.5 px-6 rounded-xl bg-white text-black text-sm font-extrabold uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(255,255,255,0.45)] hover:shadow-[0_0_40px_rgba(255,255,255,0.65)] active:scale-[0.99] disabled:opacity-75"
            >
              {isLaunching ? (
                <>
                  <Rocket className="w-4 h-4 animate-bounce text-black" />
                  <span>Igniting Raptor Engines...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 fill-black" />
                  <span>ENTER THE FUTURE &rarr;</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Small Live Statistics line matching specification */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-neutral-400 font-mono">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>12,847 people live now &bull; From Austin to Mars</span>
        </div>

        <div className="mt-3 text-[10px] text-neutral-500 text-center font-mono flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3 text-neutral-400" />
          <span>Instant Access &bull; Verified Elon AI &bull; No Password Required</span>
        </div>
      </div>
    </div>
  );
};
