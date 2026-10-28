import React, { useState, useEffect } from 'react';
import { Rocket, Wifi, Globe2, Radio, Check, ExternalLink } from 'lucide-react';
import { SpaceProduct, StarlinkProduct } from '../types';
import { SPACE_PRODUCTS, STARLINK_PRODUCTS } from '../data/elonverseData';
import { SpeedTestModal } from './SpeedTestModal';
import { StarlinkCheckerModal } from './StarlinkCheckerModal';

interface SpaceXSectionProps {
  onAddSpaceToCart: (product: SpaceProduct) => void;
  onAddStarlinkToCart: (product: StarlinkProduct) => void;
}

export const SpaceXSection: React.FC<SpaceXSectionProps> = ({
  onAddSpaceToCart,
  onAddStarlinkToCart,
}) => {
  const [speedTestOpen, setSpeedTestOpen] = useState(false);
  const [coverageCheckerOpen, setCoverageCheckerOpen] = useState(false);
  const [marsBooked, setMarsBooked] = useState(false);

  // Live Launch Countdown (T - 2 days, 14 hours, 28 mins, seconds)
  const [seconds, setSeconds] = useState(42);
  const [minutes, setMinutes] = useState(28);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 0) {
          setMinutes((m) => (m <= 0 ? 59 : m - 1));
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const starship = SPACE_PRODUCTS[0];
  const starlinkRes = STARLINK_PRODUCTS[0];
  const starlinkMini = STARLINK_PRODUCTS[1];

  const handleBookMars = () => {
    onAddSpaceToCart(starship);
    setMarsBooked(true);
    setTimeout(() => setMarsBooked(false), 3000);
  };

  return (
    <section id="space" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header matching screenshot */}
      <div className="mb-8 text-left">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          SpaceX <span className="text-neutral-500 font-light">&mdash; Making Life Multiplanetary</span>
        </h2>
      </div>

      {/* Main Composite Section */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950/80 p-6 sm:p-8">
        {/* Background Image Scrim */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/src/assets/images/spacex_starship_launch_1793126082661.jpg"
            alt="SpaceX Starship orbital launch background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-[#080808]/90" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Starship Mars Flight */}
          <div className="lg:col-span-4 rounded-xl bg-[#0e0e0e]/90 border border-neutral-800 p-5 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-400">
                <Rocket className="w-4 h-4 text-white" />
                <span>Starship Mars Flight</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Trip to Mars 2029</h3>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                $500k deposit · 100 seats expedition
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                Direct orbital refueling and 150 metric ton cargo transport. Experience the first human multiplanetary journey.
              </p>
            </div>

            <div>
              <button
                onClick={handleBookMars}
                className="w-full py-2.5 px-4 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors mb-3 flex items-center justify-center gap-2 shadow-sm"
              >
                {marsBooked ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Reservation Added to Cart</span>
                  </>
                ) : (
                  <span>Book Now</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-2 border-t border-neutral-800">
                <span>Next Orbital Flight:</span>
                <span className="text-emerald-400 font-bold">
                  T - 2d 14h {minutes}m {seconds}s
                </span>
              </div>
            </div>
          </div>

          {/* Center Column: Starlink Internet */}
          <div id="internet" className="lg:col-span-4 rounded-xl bg-[#0e0e0e]/90 border border-neutral-800 p-5 backdrop-blur-md flex flex-col justify-between scroll-mt-20">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-400">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>Starlink Internet</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">High-Speed Anywhere</h3>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                From $120/mo · 200Mbps even in Wukari
              </p>
              <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                Laser-linked low Earth orbit satellites providing ultra-fast broadband connectivity to homes, businesses, and remote outposts.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onAddStarlinkToCart(starlinkRes)}
                className="w-full py-2.5 px-4 bg-neutral-900 border border-neutral-700 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Order Starlink
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSpeedTestOpen(true)}
                  className="py-1.5 px-2 bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 rounded hover:text-white hover:border-neutral-700"
                >
                  Speed Test Demo
                </button>
                <button
                  onClick={() => setCoverageCheckerOpen(true)}
                  className="py-1.5 px-2 bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 rounded hover:text-white hover:border-neutral-700"
                >
                  Check Coverage
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Starlink Mini for Nigeria + Stats */}
          <div className="lg:col-span-4 space-y-4">
            {/* Starlink Mini Card */}
            <div className="rounded-xl bg-[#0e0e0e]/90 border border-neutral-800 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-emerald-400">STARLINK MINI FOR NIGERIA</span>
                <span className="text-xs font-bold text-white">₦120,000 / $199</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">Portable · Carry for Village</h4>
              <p className="text-xs text-neutral-400 mb-4">
                Fits inside a backpack. Runs off DC power bank or 100W solar panel. 150Mbps in Taraba, Lagos, Kaduna, and remote villages.
              </p>
              <button
                onClick={() => onAddStarlinkToCart(starlinkMini)}
                className="w-full py-2 px-3 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Order Mini
              </button>
            </div>

            {/* Constellation Live Stats matching screenshot */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/60 border border-neutral-800/80 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  6,000+
                </div>
                <div className="text-[11px] text-neutral-400 uppercase font-mono tracking-wider">
                  Active Satellites
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  4M+
                </div>
                <div className="text-[11px] text-neutral-400 uppercase font-mono tracking-wider">
                  Global Subscribers
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {speedTestOpen && <SpeedTestModal onClose={() => setSpeedTestOpen(false)} />}
      {coverageCheckerOpen && (
        <StarlinkCheckerModal
          onClose={() => setCoverageCheckerOpen(false)}
          onOrderStarlink={(type) => {
            if (type === 'mini') onAddStarlinkToCart(starlinkMini);
            else onAddStarlinkToCart(starlinkRes);
          }}
        />
      )}
    </section>
  );
};
