import React, { useState } from 'react';
import { Wifi, Globe2, Radio, Check, ShoppingCart, Heart, Info, ArrowUpRight, ShieldCheck, MapPin } from 'lucide-react';
import { STARLINK_PRODUCTS } from '../data/elonverseData';
import { StarlinkProduct } from '../types';

interface StarlinkSectionProps {
  onAddStarlinkToCart: (product: StarlinkProduct) => void;
  onToggleWishlist?: (item: { id: string; name: string; price: number; image: string; category: string }) => void;
  wishlistIds?: string[];
  onOpenMessageSupport?: (topic: string) => void;
}

export const StarlinkSection: React.FC<StarlinkSectionProps> = ({
  onAddStarlinkToCart,
  onToggleWishlist,
  wishlistIds = [],
  onOpenMessageSupport,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<StarlinkProduct | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Interactive Live Coverage & Address Checker
  const [testAddress, setTestAddress] = useState('');
  const [checkingCoverage, setCheckingCoverage] = useState(false);
  const [coverageResult, setCoverageResult] = useState<{
    status: 'ready' | 'pending' | null;
    speedEstimate: string;
    latencyEstimate: string;
  } | null>(null);

  const handleCheckCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testAddress.trim()) return;
    setCheckingCoverage(true);
    setTimeout(() => {
      setCheckingCoverage(false);
      setCoverageResult({
        status: 'ready',
        speedEstimate: '180 - 240 Mbps',
        latencyEstimate: '26 - 34 ms',
      });
    }, 1200);
  };

  const handleAdd = (item: StarlinkProduct) => {
    onAddStarlinkToCart(item);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <section id="internet" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Global LEO Satellite Constellation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Starlink Satellite Internet
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            High-speed, low-latency broadband internet engineered for remote homes, mobile nomads, maritime vessels, and commercial transport.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 text-xs text-[#AAB7CC]">
          <span>6,000+ Active Satellites</span>
          <span>·</span>
          <span className="text-[#00F0FF]">100% Global Sky Visibility</span>
        </div>
      </div>

      {/* 3 Hardware Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {STARLINK_PRODUCTS.map((kit) => {
          const isWishlisted = wishlistIds.includes(kit.id);
          const isJustAdded = !!addedIds[kit.id];

          return (
            <div
              key={kit.id}
              className="flex flex-col justify-between rounded-xl bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF]/50 transition-all p-5 duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.12)] group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#00F0FF] bg-[#050A14] px-2 py-0.5 rounded border border-[#1A2A4A]">
                    {kit.speed}
                  </span>
                  <div className="flex items-center gap-1">
                    {onToggleWishlist && (
                      <button
                        onClick={() =>
                          onToggleWishlist({
                            id: kit.id,
                            name: kit.name,
                            price: kit.price,
                            image: kit.image,
                            category: 'internet',
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
                      onClick={() => setSelectedProduct(kit)}
                      className="p-1.5 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-[#AAB7CC] hover:text-[#00F0FF] transition-colors"
                      title="View Details"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Kit Image */}
                <div
                  onClick={() => setSelectedProduct(kit)}
                  className="h-44 w-full rounded-lg bg-[#050A14] border border-[#1A2A4A]/60 my-4 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  <img
                    src={kit.image}
                    alt={kit.name}
                    referrerPolicy="no-referrer"
                    className="max-h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00F0FF] transition-colors">
                  {kit.name}
                </h3>
                <p className="text-xs text-[#AAB7CC] line-clamp-2 mb-3">
                  {kit.tagline}
                </p>

                <div className="mb-4 pb-2 border-b border-[#1A2A4A]">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-[#AAB7CC] block">Hardware Kit</span>
                      <span className="text-xl font-bold font-mono text-white">
                        ${kit.price.toLocaleString()}
                      </span>
                    </div>
                    {kit.monthlyFee && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#AAB7CC] block">Service Plan</span>
                        <span className="text-xs font-mono text-[#00F0FF]">
                          ${kit.monthlyFee}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-[#AAB7CC] mb-4">
                  {kit.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleAdd(kit)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isJustAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#00F0FF] text-[#050A14] hover:bg-[#00F0FF]/90 hover:shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Order Kit (${kit.price.toLocaleString()})</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (onOpenMessageSupport) {
                      onOpenMessageSupport(`Inquiry regarding ${kit.name} delivery, setup & international service compatibility`);
                    } else {
                      setSelectedProduct(kit);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] hover:border-[#00F0FF] text-xs text-[#AAB7CC] hover:text-[#00F0FF] transition-colors"
                >
                  Check Service In My Region
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coverage Checker Banner */}
      <div className="rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6">
            <span className="text-xs font-mono uppercase text-[#00F0FF] tracking-wider">
              Real-Time Global Constellation Check
            </span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-2">
              Verify Starlink Coverage at Your Address
            </h3>
            <p className="text-xs text-[#AAB7CC] mb-4 leading-relaxed">
              Enter your town, region, or coordinates to verify current satellite beam capacity, estimated throughput, and hardware delivery windows.
            </p>

            <form onSubmit={handleCheckCoverage} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#AAB7CC]" />
                <input
                  type="text"
                  placeholder="e.g. Austin, Texas or London, UK"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
              <button
                type="submit"
                disabled={checkingCoverage}
                className="py-2 px-4 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all disabled:opacity-50 shrink-0"
              >
                {checkingCoverage ? 'Querying...' : 'Check Coverage'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-[#050A14] rounded-xl border border-[#1A2A4A] p-6">
            {coverageResult ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    High-Capacity Coverage Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center mb-3">
                  <div className="p-2.5 rounded-lg bg-[#0A152A] border border-[#1A2A4A]">
                    <span className="text-[10px] text-[#AAB7CC] uppercase block">Est. Download</span>
                    <span className="text-base font-bold font-mono text-[#00F0FF]">{coverageResult.speedEstimate}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0A152A] border border-[#1A2A4A]">
                    <span className="text-[10px] text-[#AAB7CC] uppercase block">Low Latency</span>
                    <span className="text-base font-bold font-mono text-emerald-400">{coverageResult.latencyEstimate}</span>
                  </div>
                </div>
                <span className="text-[11px] text-[#AAB7CC] block text-center">
                  Hardware dispatch within 1–2 business days via insured express freight.
                </span>
              </div>
            ) : (
              <div className="text-center py-4">
                <Globe2 className="w-8 h-8 text-[#00F0FF] mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-semibold text-white mb-1">Global Coverage Map Ready</h4>
                <p className="text-xs text-[#AAB7CC]">
                  Continuous low-Earth orbit coverage active across over 70 countries and all ocean corridors.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
