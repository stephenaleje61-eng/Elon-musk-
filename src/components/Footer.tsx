import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#030303] border-t border-neutral-900 py-12 px-4 sm:px-6 text-neutral-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-900">
        {/* Wordmark and Tagline */}
        <div className="text-center md:text-left">
          <div className="text-lg font-extrabold tracking-[0.25em] uppercase text-white mb-1">
            ELONVERSE
          </div>
          <p className="text-xs text-neutral-500 font-mono">
            Everything Elon Musk Sells, Does, and Invests
          </p>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-medium">
          <a href="#vehicles" className="hover:text-white transition-colors">Vehicles</a>
          <a href="#space" className="hover:text-white transition-colors">SpaceX</a>
          <a href="#internet" className="hover:text-white transition-colors">Starlink</a>
          <a href="#ai" className="hover:text-white transition-colors">xAI Grok</a>
          <a href="#energy" className="hover:text-white transition-colors">Energy</a>
          <a href="#robots" className="hover:text-white transition-colors">Optimus</a>
          <a href="#investments" className="hover:text-white transition-colors">Expral Plans</a>
          <a
            href="https://x.com/elonmusk"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>@elonmusk on X</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </a>
        </div>
      </div>

      {/* Unobtrusive Independent Platform Statement & Copyright */}
      <div className="max-w-7xl mx-auto pt-6 text-center text-[11px] text-neutral-500 leading-relaxed space-y-2">
        <p>
          ELONVERSE is an independent informational and product discovery platform. It is not affiliated with, endorsed by, or operated by Elon Musk, Tesla Inc., SpaceX, xAI, X Corp., The Boring Company, or Neuralink. All trademarks and registered marks belong to their respective corporate entities.
        </p>
        <p className="font-mono text-[10px] text-neutral-600">
          &copy; {new Date().getFullYear()} ELONVERSE. Built for explorers from Wukari to Mars.
        </p>
      </div>
    </footer>
  );
};
