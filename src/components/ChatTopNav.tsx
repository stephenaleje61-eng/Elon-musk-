import React from 'react';
import {
  Menu,
  Users,
  Shield,
  Crown,
  Settings,
  Database,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface ChatTopNavProps {
  currentUserName: string;
  currentUserCity: string;
  isOwnerAdmin: boolean;
  isFirebaseActive: boolean;
  onToggleChannelsMobile: () => void;
  onToggleUsersMobile: () => void;
  onOpenAdmin: () => void;
  onOpenFirebaseConfig: () => void;
}

export const ChatTopNav: React.FC<ChatTopNavProps> = ({
  currentUserName,
  currentUserCity,
  isOwnerAdmin,
  isFirebaseActive,
  onToggleChannelsMobile,
  onToggleUsersMobile,
  onOpenAdmin,
  onOpenFirebaseConfig,
}) => {
  return (
    <header className="h-14 w-full bg-[#070707] border-b border-neutral-800/90 px-3 sm:px-6 flex items-center justify-between select-none z-30">
      {/* Left: Mobile Toggles & Wordmark */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          onClick={onToggleChannelsMobile}
          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white lg:hidden"
          title="Toggle Channels"
        >
          <Menu className="w-4 h-4" />
        </button>

        <a
          href="/"
          className="flex items-center gap-2 text-white font-extrabold text-sm sm:text-base tracking-[0.2em] uppercase hover:opacity-90 transition-opacity"
        >
          <span>ELONVERSE</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono tracking-normal border border-neutral-700">
            USA
          </span>
        </a>

        {/* Top Banner Tag matching specification */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-neutral-400 pl-3 border-l border-neutral-800">
          <span>🇺🇸</span>
          <span className="text-white font-medium">LIVE FROM AUSTIN, TEXAS</span>
          <span>&bull;</span>
          <span>STARBASE</span>
          <span>&bull;</span>
          <span>CAPE CANAVERAL</span>
        </div>
      </div>

      {/* Center / Right: Live Viewers Counter & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live Viewer Counter matching specification */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/40 border border-red-900/60 text-xs font-mono text-neutral-200">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold text-rose-400">2,847 from USA</span>
          <span className="hidden sm:inline text-neutral-400">&bull; Starship in T-2d</span>
        </div>

        {/* Firebase Indicator */}
        <button
          onClick={onOpenFirebaseConfig}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
            isFirebaseActive
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title={isFirebaseActive ? 'Connected to Cloud Firestore' : 'Click to configure Firebase'}
        >
          <Database className="w-3 h-3" />
          <span>{isFirebaseActive ? 'Firestore Live' : 'Firebase Sync'}</span>
        </button>

        {/* Admin Switcher / Dashboard Button */}
        <button
          onClick={onOpenAdmin}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            isOwnerAdmin
              ? 'bg-amber-400 text-black border-amber-300 shadow-sm'
              : 'bg-neutral-900 border-neutral-700 text-amber-400 hover:bg-neutral-800'
          }`}
          title="Owner Admin Dashboard"
        >
          <Crown className={`w-3.5 h-3.5 ${isOwnerAdmin ? 'fill-black' : 'fill-amber-400'}`} />
          <span>{isOwnerAdmin ? 'Admin Mode Active' : 'Admin'}</span>
        </button>

        {/* Online Users Mobile Toggle */}
        <button
          onClick={onToggleUsersMobile}
          className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white xl:hidden"
          title="Toggle Online Users"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
