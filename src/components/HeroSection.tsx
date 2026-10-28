import React from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOrderNow: () => void;
  onExploreUniverse: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOrderNow,
  onExploreUniverse,
}) => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-black text-center px-4">
      {/* Background Cinematic Visual */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/elonverse_hero_space_car_1793126081951.jpg"
          alt="SpaceX Starship, Tesla vehicle, and Optimus humanoid robot at sunset launchpad"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-85 contrast-105"
        />
        {/* Cinematic Scrims for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-[#050505]/90" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-4xl mx-auto pt-16 pb-20 flex flex-col items-center">
        {/* Main Cinematic Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-4 leading-[1.08] drop-shadow-md">
          The Future Is Here.
          <br />
          <span className="font-light tracking-normal text-neutral-200">Built by Elon.</span>
        </h1>

        {/* Subtitle matching screenshot */}
        <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Cars, Rockets, Internet, AI, Robots, Energy &mdash; One Checkout, From Wukari to Mars.
        </p>

        {/* Action Buttons matching screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto mb-6">
          <button
            onClick={onOrderNow}
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-[#111111]/90 border border-neutral-700 text-white text-sm font-semibold hover:bg-white hover:text-black hover:border-white transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <span>Order Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreUniverse}
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-transparent border border-neutral-500/80 text-white text-sm font-semibold hover:bg-neutral-800/60 hover:border-white transition-all backdrop-blur-sm"
          >
            Explore Universe
          </button>
        </div>

        {/* Supporting tag matching screenshot */}
        <p className="text-xs text-neutral-400 font-mono tracking-wide">
          From $44,990 · Delivery to Nigeria via Starlink
        </p>

        {/* Scroll Down Indicator */}
        <a
          href="#vehicles"
          className="mt-14 inline-flex flex-col items-center text-neutral-400 hover:text-white transition-colors group"
        >
          <span className="text-[11px] font-mono tracking-wider uppercase mb-1">Scroll Down</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-neutral-300 group-hover:text-white" />
        </a>
      </div>

      {/* Bottom Hairline divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
    </section>
  );
};
