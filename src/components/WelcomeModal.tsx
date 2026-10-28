import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, Rocket, ShieldCheck } from 'lucide-react';

interface WelcomeModalProps {
  onEnter: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onEnter }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show only on first visit or if user wants to see it
    const hasSeen = localStorage.getItem('elonverse_intro_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('elonverse_intro_seen', 'true');
    setIsOpen(false);
    onEnter();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#090909] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 rounded-full p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
          aria-label="Close welcome modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 blur-3xl pointer-events-none rounded-full" />

        <div className="relative grid grid-cols-1 md:grid-cols-2">
          {/* Visual Column */}
          <div className="relative h-64 md:h-auto min-h-[300px] overflow-hidden bg-black">
            <img
              src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
              alt="Elon Musk portrait at aerospace development facility"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#090909]" />
            <div className="absolute bottom-4 left-4 right-4 text-xs text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span>Independent Technology &amp; Future Platform</span>
            </div>
          </div>

          {/* Content Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs tracking-widest text-neutral-400 font-mono uppercase">
                <Rocket className="w-3.5 h-3.5" />
                <span>Next-Gen Multiplanetary Hub</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">
                WELCOME TO <span className="tracking-widest">ELONVERSE</span>
              </h2>

              <p className="text-sm font-medium text-neutral-300 mb-3">
                Explore the Products, Companies, and Ideas Shaping Tomorrow.
              </p>

              <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                From electric mobility and reusable orbital rockets to high-speed satellite internet, artificial general intelligence, clean microgrid energy, and humanoid robotics.
              </p>

              <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
                <span>
                  No email or password login required. Enjoy immediate guest browsing, live product discovery, interactive calculators, and the new Expral Investment Plans.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
              <button
                onClick={handleClose}
                className="text-xs text-neutral-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Skip Intro
              </button>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg"
              >
                <span>ENTER ELONVERSE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
