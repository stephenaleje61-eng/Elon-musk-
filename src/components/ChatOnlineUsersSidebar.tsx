import React from 'react';
import { Crown, CheckCircle2, Shield, Radio, Sparkles } from 'lucide-react';
import { OnlineUser } from '../types/chat';
import { VerifiedBadge } from './VerifiedBadge';

interface ChatOnlineUsersSidebarProps {
  currentUserName: string;
  currentUserCity: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  elonIsTyping: boolean;
}

export const ChatOnlineUsersSidebar: React.FC<ChatOnlineUsersSidebarProps> = ({
  currentUserName,
  currentUserCity,
  isOpenMobile,
  onCloseMobile,
  elonIsTyping,
}) => {
  const simulatedVips: OnlineUser[] = [
    {
      id: 'gwynne',
      name: 'Gwynne Shotwell',
      role: 'vip',
      city: 'Starbase, TX',
      status: 'online',
      badge: 'President & COO SpaceX',
    },
    {
      id: 'franz',
      name: 'Franz von Holzhausen',
      role: 'vip',
      city: 'Hawthorne, CA',
      status: 'online',
      badge: 'Chief Designer Tesla',
    },
    {
      id: 'rogan',
      name: 'Joe Rogan',
      role: 'vip',
      city: 'Austin, TX',
      status: 'online',
      badge: 'Host JRE',
    },
    {
      id: 'engineer-1',
      name: 'Starbase Raptor Lead',
      role: 'user',
      city: 'Boca Chica, TX',
      status: 'in starship',
      badge: 'Propulsion Team',
    },
    {
      id: 'driver-1',
      name: 'Cybertruck Fleet 007',
      role: 'user',
      city: 'Miami, FL',
      status: 'online',
      badge: 'FSD Supervised v13',
    },
    {
      id: 'pilot-1',
      name: 'Austin Giga Operator',
      role: 'user',
      city: 'Austin, TX',
      status: 'online',
      badge: 'Battery Cell Giga 5',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 xl:hidden"
        />
      )}

      <aside
        className={`fixed xl:static top-14 bottom-0 right-0 z-40 w-64 bg-[#0a0a0a] border-l border-neutral-800/80 flex flex-col justify-between transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-900">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              ONLINE USERS
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>2,847 LIVE</span>
            </div>
          </div>

          {/* Section 1: Elon Musk Featured Leader matching specification */}
          <div className="mb-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-1 mb-1.5">
              Host &amp; Visionary
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-900/90 border border-red-900/40 relative overflow-hidden group">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
                    alt="Elon Musk"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-white">ELON MUSK</span>
                    <VerifiedBadge type="elon" size="sm" />
                    <span className="text-[10px]">🇺🇸</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">
                    CEO @ Austin, TX
                  </p>
                  {elonIsTyping ? (
                    <span className="text-[10px] text-sky-400 font-mono animate-pulse">
                      typing from Starbase...
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-400 font-mono">
                      Active &bull; Boca Chica, TX
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: YOU [Owner / Founder] matching specification */}
          <div className="mb-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-1 mb-1.5">
              Space Creator &amp; Founder
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/40">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-black font-extrabold text-xs shadow-md">
                    {currentUserName.charAt(0).toUpperCase()}
                  </div>
                  <Crown className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 fill-amber-400" />
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-200 truncate">
                      {currentUserName} 👑
                    </span>
                    <VerifiedBadge type="owner" size="md" />
                  </div>
                  <p className="text-[10px] text-amber-300/80 font-mono truncate">
                    Founder @ Starbase &bull; {currentUserCity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: VIP Guests & Engineers */}
          <div className="space-y-1 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-1 mb-1.5">
              Verified Engineers &amp; Crew
            </div>

            {simulatedVips.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-900/60 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-300">
                      {user.name.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black" />
                  </div>

                  <div className="truncate">
                    <span className="text-xs text-neutral-200 block truncate font-medium">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono block truncate">
                      {user.city}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 shrink-0">
                  {user.badge?.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Audio Room Tag */}
        <div className="p-3 m-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[10px] font-mono text-neutral-400 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-0.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>X Space Audio Bridged</span>
          </div>
          <span>Starlink Giga Austin &bull; Low Latency</span>
        </div>
      </aside>
    </>
  );
};
