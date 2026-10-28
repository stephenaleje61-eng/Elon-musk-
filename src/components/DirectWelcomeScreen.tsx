import React, { useState } from 'react';
import { Rocket, Sparkles, MapPin, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';
import { VerifiedBadge } from './VerifiedBadge';

interface DirectWelcomeScreenProps {
  onEnter: (name: string, city: string) => void;
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
  'Chicago, IL',
];

export const DirectWelcomeScreen: React.FC<DirectWelcomeScreenProps> = ({ onEnter }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Austin, TX');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter your name to connect directly.');
      return;
    }
    setError('');

    // Play SpaceX launch roar
    sounds.playSpaceXLaunchSound();

    onEnter(cleanName, city);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black overflow-hidden select-none">
      {/* Background SpaceX Visual */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/elonverse_hero_space_car_1793126081951.jpg"
          alt="SpaceX Cape Canaveral Launchpad"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/60 to-[#0A0A0A]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      {/* Top Banner Tag */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2 text-xs font-mono text-neutral-300">
        <span>🇺🇸</span>
        <span className="font-bold text-white tracking-wider">LIVE FROM STARBASE &bull; AUSTIN, TEXAS</span>
      </div>

      <div className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-neutral-900/90 px-3.5 py-1.5 rounded-full border border-neutral-800 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white font-medium">Owner Online</span>
        <VerifiedBadge type="owner" size="sm" />
      </div>

      {/* Main Glassmorphic Welcome Card */}
      <div className="relative z-20 w-full max-w-lg rounded-2xl bg-neutral-950/85 border border-white/20 p-7 sm:p-9 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.95)] text-center">
        {/* Large Circular Elon Photo with Verified Badge */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-4">
          <img
            src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
            alt="Elon Musk"
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-full object-cover border-2 border-white shadow-[0_0_25px_rgba(255,255,255,0.35)]"
          />
          <div className="absolute -bottom-1 -right-1">
            <VerifiedBadge type="elon" size="md" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">
          Welcome to Elon Musk Space 🚀
        </h1>
        <p className="text-xs text-neutral-300 mb-6 leading-relaxed">
          The Future Is Here. Built by Elon.
          <br />
          <span className="text-neutral-400 font-mono">Chat Live with Elon AI + Direct 1-on-1 Line to Owner</span>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your name to connect..."
              className="w-full bg-neutral-900/90 border border-neutral-700 focus:border-white rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors font-medium shadow-inner"
              maxLength={26}
            />
            {error && <p className="text-xs text-rose-400 font-mono mt-1">{error}</p>}
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Your American City
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-neutral-900/90 border border-neutral-700 focus:border-white rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors appearance-none font-mono"
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

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-white text-black text-sm font-extrabold uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.45)] hover:shadow-[0_0_40px_rgba(255,255,255,0.7)] active:scale-[0.99]"
            >
              <span>ENTER ELON&apos;S SPACE &rarr;</span>
              <Rocket className="w-4 h-4 fill-black" />
            </button>
          </div>
        </form>

        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Direct 1-on-1 Owner Messaging</span>
          <span>&bull;</span>
          <span className="flex items-center gap-1 text-white font-medium">
            <span>Verified Owner</span>
            <VerifiedBadge type="owner" size="sm" showTooltip={false} />
          </span>
        </div>
      </div>
    </div>
  );
};
