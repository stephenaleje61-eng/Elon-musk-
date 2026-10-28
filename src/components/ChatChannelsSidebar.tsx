import React from 'react';
import { Hash, Radio, Flame, Zap, Rocket, Cpu, MapPin, Factory } from 'lucide-react';
import { ChatChannel } from '../types/chat';

interface ChatChannelsSidebarProps {
  channels: ChatChannel[];
  activeChannel: string;
  onSelectChannel: (channelId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const CHANNELS: ChatChannel[] = [
  {
    id: 'elon-live',
    name: 'elon-live',
    description: 'Elon Musk is here live answering questions',
    isLive: true,
    unreadCount: 3,
    category: 'primary',
  },
  {
    id: 'tesla-talk',
    name: 'tesla-talk',
    description: 'Cybertruck, Model Y, FSD v13, Cybercab',
    unreadCount: 5,
    category: 'primary',
  },
  {
    id: 'spacex-mars',
    name: 'spacex-mars',
    description: 'Starship Flight 12, Mechazilla, Mars 2026',
    unreadCount: 2,
    category: 'primary',
  },
  {
    id: 'grok-ai',
    name: 'grok-ai',
    description: 'xAI Memphis Colossus, Grok 4 truth-seeking',
    category: 'engineering',
  },
  {
    id: 'starbase-texas',
    name: 'starbase-texas',
    description: 'Boca Chica orbital launch site updates',
    isLive: true,
    category: 'engineering',
  },
  {
    id: 'fremont-factory',
    name: 'fremont-factory',
    description: 'Optimus Gen 3 assembly line & cell production',
    category: 'engineering',
  },
];

export const ChatChannelsSidebar: React.FC<ChatChannelsSidebarProps> = ({
  channels,
  activeChannel,
  onSelectChannel,
  isOpenMobile,
  onCloseMobile,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'elon-live':
        return <Radio className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'tesla-talk':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'spacex-mars':
        return <Rocket className="w-4 h-4 text-sky-400" />;
      case 'grok-ai':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'starbase-texas':
        return <MapPin className="w-4 h-4 text-amber-400" />;
      case 'fremont-factory':
        return <Factory className="w-4 h-4 text-neutral-300" />;
      default:
        return <Hash className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-14 bottom-0 left-0 z-40 w-64 bg-[#0a0a0a] border-r border-neutral-800/80 flex flex-col justify-between transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto">
          {/* Header Title */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-900">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
              ELONVERSE CHANNELS
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
              USA LIVE
            </span>
          </div>

          {/* Primary Channels */}
          <div className="space-y-1 mb-6">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 mb-1">
              Main Stages
            </div>
            {channels.slice(0, 3).map((ch) => {
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectChannel(ch.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getIcon(ch.id)}
                    <span className="font-mono truncate">#{ch.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {ch.isLive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/80 font-mono">
                        LIVE
                      </span>
                    )}
                    {ch.unreadCount && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500 text-black font-mono">
                        {ch.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Engineering Channels */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 mb-1">
              Engineering Hubs
            </div>
            {channels.slice(3).map((ch) => {
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectChannel(ch.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getIcon(ch.id)}
                    <span className="font-mono truncate">#{ch.name}</span>
                  </div>

                  {ch.isLive && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/80 font-mono">
                      LIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Station Card */}
        <div className="p-3.5 m-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[11px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5 text-white font-bold mb-1">
            <Rocket className="w-3.5 h-3.5 text-sky-400" />
            <span>Starbase Flight Ops</span>
          </div>
          <p className="text-[10px] text-neutral-500 leading-tight">
            Pad 39A &amp; Starbase telemetry feeds active. 24/7 public audio space.
          </p>
        </div>
      </aside>
    </>
  );
};
