import React, { useState, useEffect } from 'react';
import { Rocket, Orbit, ShieldCheck, Flame, Heart, ShoppingCart, Check, Info, ExternalLink, X } from 'lucide-react';
import { SpaceProduct } from '../types';
import { SPACEX_PRODUCTS } from '../data/elonverseData';

interface SpaceXSectionProps {
  onAddSpaceToCart: (product: SpaceProduct) => void;
  onAddStarlinkToCart?: (product: any) => void;
  onToggleWishlist?: (item: { id: string; name: string; price: number; image: string; category: string }) => void;
  wishlistIds?: string[];
  onOpenMessageSupport?: (topic: string) => void;
}

export const SpaceXSection: React.FC<SpaceXSectionProps> = ({
  onAddSpaceToCart,
  onToggleWishlist,
  wishlistIds = [],
  onOpenMessageSupport,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<SpaceProduct | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Countdown timer for next orbital launch
  const [hours, setHours] = useState(14);
  const [minutes, setMinutes] = useState(38);
  const [seconds, setSeconds] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 0) {
          setMinutes((m) => {
            if (m <= 0) {
              setHours((h) => (h <= 0 ? 23 : h - 1));
              return 59;
            }
            return m - 1;
          });
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = (product: SpaceProduct) => {
    onAddSpaceToCart(product);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <section id="space" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Interplanetary Aerospace
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            SpaceX & Starship
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            Making humanity multiplanetary through full reusability, Starship orbital refueling, and high-cadence Falcon launch systems.
          </p>
        </div>

        {/* Live Launch Cadence Telemetry */}
        <div className="mt-4 md:mt-0 p-3 rounded-xl bg-[#0A152A] border border-[#1A2A4A] flex items-center gap-4">
          <div>
            <span className="text-[10px] text-[#AAB7CC] uppercase block">Next Orbital Launch</span>
            <span className="text-xs font-mono font-bold text-[#00F0FF]">
              T- {hours}h {minutes}m {seconds}s
            </span>
          </div>
          <div className="h-7 w-[1px] bg-[#1A2A4A]" />
          <div>
            <span className="text-[10px] text-[#AAB7CC] uppercase block">Launch Cadence</span>
            <span className="text-xs font-mono font-bold text-white">Every 2.5 Days</span>
          </div>
        </div>
      </div>

      {/* 4 SpaceX Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {SPACEX_PRODUCTS.map((rocket) => {
          const isWishlisted = wishlistIds.includes(rocket.id);
          const isJustAdded = !!addedIds[rocket.id];

          return (
            <div
              key={rocket.id}
              className="flex flex-col justify-between rounded-xl bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF]/50 transition-all p-5 duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#00F0FF] bg-[#050A14] px-2 py-0.5 rounded border border-[#1A2A4A]">
                    {rocket.type.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1">
                    {onToggleWishlist && (
                      <button
                        onClick={() =>
                          onToggleWishlist({
                            id: rocket.id,
                            name: rocket.name,
                            price: rocket.price,
                            image: rocket.image,
                            category: 'space',
                          })
                        }
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isWishlisted
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                            : 'bg-[#050A14] border-[#1A2A4A] text-[#AAB7CC] hover:text-white'
                        }`}
                        title="Wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedProduct(rocket)}
                      className="p-1.5 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-[#AAB7CC] hover:text-[#00F0FF] transition-colors"
                      title="View Specs"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rocket Image */}
                <div
                  onClick={() => setSelectedProduct(rocket)}
                  className="h-44 w-full rounded-lg bg-[#050A14] border border-[#1A2A4A]/60 my-4 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  <img
                    src={rocket.image}
                    alt={rocket.name}
                    referrerPolicy="no-referrer"
                    className="max-h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00F0FF] transition-colors">
                  {rocket.name}
                </h3>
                <p className="text-xs text-[#AAB7CC] line-clamp-2 mb-3">
                  {rocket.subtitle}
                </p>

                <div className="mb-4 pb-2 border-b border-[#1A2A4A]">
                  <span className="text-[10px] uppercase text-[#AAB7CC] block">
                    {rocket.deposit ? 'Deposit / Reservation' : 'Commercial Price'}
                  </span>
                  <span className="text-lg font-bold font-mono text-white">
                    ${(rocket.deposit || rocket.price).toLocaleString()}
                  </span>
                  {rocket.priceNote && (
                    <span className="text-[10px] text-[#00F0FF] block mt-0.5 font-mono">
                      {rocket.priceNote}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleAdd(rocket)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isJustAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#00F0FF] text-[#050A14] hover:bg-[#00F0FF]/90 hover:shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Mission Queue</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      <span>Reserve / Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (onOpenMessageSupport) {
                      onOpenMessageSupport(`Inquiry regarding ${rocket.name} orbital launch manifest, payload mass, and schedule`);
                    } else {
                      setSelectedProduct(rocket);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] hover:border-[#00F0FF] text-xs text-[#AAB7CC] hover:text-[#00F0FF] transition-colors"
                >
                  Commercial Payload Inquiry
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Starship Tech Spotlight */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0A152A] border border-[#1A2A4A] p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <span className="text-xs font-mono uppercase text-[#00F0FF] tracking-wider">
              Orbital Refueling & Planetary Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-3">
              Starship: Reusability Changes Everything
            </h3>
            <p className="text-xs text-[#AAB7CC] leading-relaxed mb-6">
              Unlike expendable rockets discarded into the ocean after a single flight, Starship and Super Heavy return to the launch pad within minutes to be caught by the Mechazilla launch tower chopsticks. Re-launch within hours dramatically reduces cost-per-kilogram to orbit by over 99%.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">Thrust at Liftoff</span>
                <span className="text-base font-bold font-mono text-[#00F0FF]">16.7M lbs</span>
                <span className="text-[10px] text-[#AAB7CC]">33 Raptor 3s</span>
              </div>
              <div className="p-3 rounded-xl bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">Payload to LEO</span>
                <span className="text-base font-bold font-mono text-white">150+ Tons</span>
                <span className="text-[10px] text-[#AAB7CC]">Reusable Mode</span>
              </div>
              <div className="p-3 rounded-xl bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">Turnaround Target</span>
                <span className="text-base font-bold font-mono text-emerald-400">&lt; 2 Hours</span>
                <span className="text-[10px] text-[#AAB7CC]">Rapid Refueling</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between h-full bg-[#050A14] rounded-xl border border-[#1A2A4A] p-5">
            <div>
              <span className="text-xs font-semibold text-white uppercase tracking-wider block mb-2">
                Space Exploration Manifest
              </span>
              <ul className="space-y-2 text-xs text-[#AAB7CC]">
                <li className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                  <span>Artemis III Lunar South Pole human landing mission</span>
                </li>
                <li className="flex items-center gap-2">
                  <Orbit className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                  <span>Next-Gen Starlink V3 direct-to-cell constellation deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                  <span>First uncrewed Starship Mars cargo landings</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-[#1A2A4A]">
              <button
                onClick={() => {
                  if (onOpenMessageSupport) {
                    onOpenMessageSupport('General SpaceX mission schedule & commercial astronaut consultation');
                  }
                }}
                className="w-full py-2.5 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all text-center"
              >
                Inquire With SpaceX Mission Specialist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SpaceX Specs Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB7CC] hover:text-white rounded-lg hover:bg-[#050A14] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase tracking-wider text-[#00F0FF] font-semibold">
              SpaceX Launch Vehicle
            </span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-1">{selectedProduct.name}</h3>
            <p className="text-sm text-[#AAB7CC] mb-4">{selectedProduct.subtitle}</p>

            <div className="h-52 w-full rounded-xl bg-[#050A14] border border-[#1A2A4A] mb-4 overflow-hidden flex items-center justify-center">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="max-h-full w-full object-cover"
              />
            </div>

            <p className="text-xs text-[#AAB7CC] leading-relaxed mb-4">
              {selectedProduct.description}
            </p>

            {selectedProduct.specs && (
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Flight Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedProduct.specs).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                      <span className="text-[10px] text-[#AAB7CC] uppercase block capitalize">{key}</span>
                      <span className="font-mono text-white text-xs">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-[#1A2A4A]">
              <button
                onClick={() => {
                  handleAdd(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                <span>Reserve / Add to Cart (${(selectedProduct.deposit || selectedProduct.price).toLocaleString()})</span>
              </button>
              <a
                href={selectedProduct.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#050A14] border border-[#1A2A4A] hover:border-white text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>SpaceX.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
