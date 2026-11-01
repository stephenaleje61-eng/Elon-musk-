import React, { useState } from 'react';
import { Search, MessageSquare, ArrowRight, ShieldCheck, Zap, Globe, Rocket } from 'lucide-react';

interface MarketplaceHeroBannerProps {
  onSearch: (query: string) => void;
  onOpenMessageSupport: (topic?: string) => void;
  onSelectCategory: (category: string) => void;
}

export const MarketplaceHeroBanner: React.FC<MarketplaceHeroBannerProps> = ({
  onSearch,
  onOpenMessageSupport,
  onSelectCategory,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const quickCategories = [
    { label: 'Tesla Fleet', anchor: '#vehicles' },
    { label: 'Starlink Mini', anchor: '#internet' },
    { label: 'Powerwall 3', anchor: '#energy' },
    { label: 'Starship Mars', anchor: '#space' },
    { label: 'Grok 2 AI', anchor: '#ai' },
    { label: 'Optimus Robot', anchor: '#robots' },
  ];

  return (
    <div className="relative overflow-hidden bg-[#050A14] border-b border-[#1A2A4A] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      {/* Subtle atmospheric glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#00F0FF]/10 via-[#1E88E5]/5 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        {/* Subtitle / Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A152A] border border-[#1A2A4A] text-xs font-mono text-[#00F0FF] mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
          <span>INTERPLANETARY TECHNOLOGY MARKETPLACE & ECOSYSTEM HUB</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 leading-none">
          ELON MUSK SPACE
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-xl lg:text-2xl font-normal text-[#AAB7CC] max-w-3xl mx-auto mb-10 leading-relaxed">
          Explore Innovation. Discover Technology. Connect With the Future.
        </p>

        {/* Prominent Large Glow Button: MESSAGE ELON MUSK SPACE */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            onClick={() => onOpenMessageSupport('General inquiry from homepage hero')}
            className="w-full sm:w-auto py-4 px-8 rounded-xl bg-gradient-to-r from-[#00F0FF] via-[#00B4D8] to-[#1E88E5] text-[#050A14] font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 transform hover:scale-[1.02] shadow-[0_0_35px_rgba(0,240,255,0.45)] hover:shadow-[0_0_50px_rgba(0,240,255,0.7)] flex items-center justify-center gap-3"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>MESSAGE ELON MUSK SPACE</span>
          </button>

          <a
            href="#vehicles"
            className="w-full sm:w-auto py-4 px-6 rounded-xl bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF] text-white font-bold text-sm tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore Technology Catalog</span>
            <ArrowRight className="w-4 h-4 text-[#00F0FF]" />
          </a>
        </div>

        {/* Clear Platform Support Disclaimer */}
        <p className="text-[11px] text-[#AAB7CC] max-w-xl mx-auto mb-10">
          Platform Technology Support & Engineering Assistants &bull; We help coordinate vehicle delivery, Starlink kits, and mission inquiries. (Not personal responses from Elon Musk).
        </p>

        {/* Large Technology Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#AAB7CC]" />
            <input
              type="text"
              placeholder="Search vehicles, Starlink mini, Powerwall 3, Falcon 9, Grok 2, Optimus..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-[#0A152A] border border-[#1A2A4A] text-sm text-white placeholder-[#AAB7CC]/60 focus:outline-none focus:border-[#00F0FF] focus:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 py-1.5 px-4 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick Category Anchors */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#AAB7CC]">
          <span className="text-[11px] font-mono uppercase text-[#AAB7CC]/70">Popular:</span>
          {quickCategories.map((cat) => (
            <a
              key={cat.label}
              href={cat.anchor}
              className="px-3 py-1 rounded-lg bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors"
            >
              {cat.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
