import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050A14] border-t border-[#1A2A4A] py-12 px-4 sm:px-6 lg:px-8 text-[#AAB7CC]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#1A2A4A]">
        {/* Brand and Tagline */}
        <div className="text-center md:text-left">
          <div className="text-xl font-extrabold tracking-[0.2em] uppercase text-white mb-1">
            ELON MUSK SPACE
          </div>
          <p className="text-xs text-[#00F0FF] font-medium">
            Explore Innovation. Discover Technology. Connect With the Future.
          </p>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#AAB7CC] font-semibold">
          <a href="#vehicles" className="hover:text-[#00F0FF] transition-colors">Vehicles</a>
          <a href="#energy" className="hover:text-[#00F0FF] transition-colors">Energy & Charging</a>
          <a href="#space" className="hover:text-[#00F0FF] transition-colors">SpaceX</a>
          <a href="#internet" className="hover:text-[#00F0FF] transition-colors">Starlink</a>
          <a href="#ai" className="hover:text-[#00F0FF] transition-colors">xAI Grok</a>
          <a href="#robots" className="hover:text-[#00F0FF] transition-colors">Optimus</a>
          <a href="#future" className="hover:text-[#00F0FF] transition-colors">Future Tech</a>
          <a href="#investments" className="hover:text-[#00F0FF] transition-colors">Investments</a>
          <a href="#chat" className="hover:text-[#00F0FF] transition-colors">Support Chat</a>
        </div>
      </div>

      {/* Disclaimers & Copyright */}
      <div className="max-w-7xl mx-auto pt-6 text-center text-[11px] text-[#AAB7CC]/70 leading-relaxed space-y-2">
        <p className="max-w-4xl mx-auto">
          ELON MUSK SPACE is an independent technology marketplace, educational directory, and communication protocol platform. This platform is not operated by, directly affiliated with, or personally responded to by Elon Musk. All vehicle marks, rocket trademarks, and product names (Tesla, Model S/3/X/Y, Cybertruck, Powerwall, SpaceX, Starlink, Falcon 9, Starship, xAI, Grok, Neuralink, Boring Company) are property of their respective trademark owners.
        </p>
        <p className="font-mono text-[10px] text-[#AAB7CC]/50">
          &copy; {new Date().getFullYear()} ELON MUSK SPACE &bull; Interplanetary Technology Marketplace &bull; All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
