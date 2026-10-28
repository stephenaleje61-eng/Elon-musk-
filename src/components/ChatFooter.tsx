import React from 'react';

export const ChatFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#050505] border-t border-neutral-900 py-3 px-4 text-center select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 font-mono">
        <div className="flex items-center gap-2">
          <span>🇺🇸</span>
          <span className="text-neutral-300 font-medium">
            Elonverse &bull; Built in Austin, Texas &bull; Tesla &bull; SpaceX &bull; Starlink &bull; xAI
          </span>
        </div>
        <div className="text-[11px] text-neutral-500">
          Made for America, Built for Mars. &copy; {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
};
