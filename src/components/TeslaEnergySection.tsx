import React, { useState } from 'react';
import { Sun, Battery, Building2, Zap, Plug, ShieldCheck, Heart, ShoppingCart, Check, Info, X } from 'lucide-react';
import { TESLA_TECH_ENERGY } from '../data/elonverseData';
import { EnergyProduct } from '../types';

interface TeslaEnergySectionProps {
  onAddEnergyToCart: (product: EnergyProduct) => void;
  onToggleWishlist?: (item: { id: string; name: string; price: number; image: string; category: string }) => void;
  wishlistIds?: string[];
  onContactSales?: (topic?: string) => void;
}

export const TeslaEnergySection: React.FC<TeslaEnergySectionProps> = ({
  onAddEnergyToCart,
  onToggleWishlist,
  wishlistIds = [],
  onContactSales,
}) => {
  const [filter, setFilter] = useState<'all' | 'charging' | 'residential' | 'commercial'>('all');
  const [selectedProduct, setSelectedProduct] = useState<EnergyProduct | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Interactive Solar & Battery ROI Calculator
  const [monthlyElectricBill, setMonthlyElectricBill] = useState(250);
  const [blackoutHoursPerMonth, setBlackoutHoursPerMonth] = useState(12);

  const estimatedYearlySavings = Math.round(monthlyElectricBill * 12 * 0.85);
  const estimated25YearSavings = Math.round(estimatedYearlySavings * 25);

  const filteredProducts = TESLA_TECH_ENERGY.filter((p) => {
    if (filter === 'charging') return p.id.includes('connector');
    if (filter === 'residential') return p.id.includes('powerwall') || p.id.includes('solar');
    if (filter === 'commercial') return p.id.includes('megapack');
    return true;
  });

  const handleAdd = (item: EnergyProduct) => {
    onAddEnergyToCart(item);
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <section id="energy" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Clean Energy Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Tesla Technology & Energy
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            From residential EV charging and whole-home Powerwall backup to architectural Solar Roofs and utility-scale Megapacks.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0A152A] rounded-lg border border-[#1A2A4A] mt-4 md:mt-0">
          {(
            [
              { key: 'all', label: 'All Products' },
              { key: 'charging', label: 'Charging Hardware' },
              { key: 'residential', label: 'Home & Solar' },
              { key: 'commercial', label: 'Megapack Grid' },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                filter === t.key
                  ? 'bg-[#00F0FF] text-[#050A14] shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-[#AAB7CC] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {filteredProducts.map((product) => {
          const isWishlisted = wishlistIds.includes(product.id);
          const isJustAdded = !!addedIds[product.id];

          return (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-xl bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF]/50 transition-all p-5 duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.12)]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#00F0FF] bg-[#050A14] px-2 py-0.5 rounded border border-[#1A2A4A]">
                    {product.capacity || 'Hardware'}
                  </span>
                  <div className="flex items-center gap-1">
                    {onToggleWishlist && (
                      <button
                        onClick={() =>
                          onToggleWishlist({
                            id: product.id,
                            name: product.name,
                            price: product.priceStarting,
                            image: product.image,
                            category: 'energy',
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
                      onClick={() => setSelectedProduct(product)}
                      className="p-1.5 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-[#AAB7CC] hover:text-[#00F0FF] transition-colors"
                      title="View Specs"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="h-36 w-full rounded-lg bg-[#050A14] border border-[#1A2A4A]/60 my-4 flex items-center justify-center overflow-hidden cursor-pointer group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="max-h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="text-base font-bold text-white mb-1 leading-snug">
                  {product.name}
                </h3>
                <p className="text-xs text-[#AAB7CC] line-clamp-2 mb-3">
                  {product.subtitle}
                </p>

                <div className="mb-4 pb-2 border-b border-[#1A2A4A]">
                  <span className="text-[10px] uppercase text-[#AAB7CC] block">Verified Price</span>
                  <span className="text-lg font-bold font-mono text-white">
                    ${product.priceStarting.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleAdd(product)}
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
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (onContactSales) {
                      onContactSales(`Inquiry about ${product.name} specs, availability & installation`);
                    } else {
                      setSelectedProduct(product);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] hover:border-[#00F0FF] text-xs text-[#AAB7CC] hover:text-[#00F0FF] transition-colors"
                >
                  Technical Inquiry
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Energy & Solar ROI Calculator Banner */}
      <div className="rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6">
            <span className="text-xs font-mono uppercase text-[#00F0FF] tracking-wider">
              Autonomous Power Independence
            </span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-2">
              Calculate Solar & Powerwall 3 Value
            </h3>
            <p className="text-xs text-[#AAB7CC] mb-6 leading-relaxed">
              Estimate electricity offset, blackout resilience hours, and long-term utility bill reductions by combining rooftop solar generation with 13.5 kWh Powerwall storage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#AAB7CC] block mb-1.5 font-medium">
                  Average Monthly Electric Bill: <span className="text-white font-mono font-bold">${monthlyElectricBill}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={monthlyElectricBill}
                  onChange={(e) => setMonthlyElectricBill(Number(e.target.value))}
                  className="w-full accent-[#00F0FF]"
                />
              </div>

              <div>
                <label className="text-xs text-[#AAB7CC] block mb-1.5 font-medium">
                  Blackout Vulnerability: <span className="text-white font-mono font-bold">{blackoutHoursPerMonth} hrs/mo</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="72"
                  step="2"
                  value={blackoutHoursPerMonth}
                  onChange={(e) => setBlackoutHoursPerMonth(Number(e.target.value))}
                  className="w-full accent-[#00F0FF]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#050A14] rounded-xl border border-[#1A2A4A] p-6 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div className="p-3 rounded-lg bg-[#0A152A] border border-[#1A2A4A]">
                <span className="text-[11px] text-[#AAB7CC] block uppercase">Est. Annual Savings</span>
                <span className="text-2xl font-extrabold font-mono text-[#00F0FF]">
                  ${estimatedYearlySavings.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0A152A] border border-[#1A2A4A]">
                <span className="text-[11px] text-[#AAB7CC] block uppercase">25-Year Value</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  ${estimated25YearSavings.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#AAB7CC] pt-2 border-t border-[#1A2A4A]">
              <span>Backup Resilience: 100% Critical Loads Protected</span>
              <button
                onClick={() => {
                  if (onContactSales) {
                    onContactSales(`Request official Tesla Energy & Powerwall consultation for estimated $${monthlyElectricBill}/mo bill`);
                  }
                }}
                className="py-1.5 px-3 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold hover:bg-[#00F0FF]/90 transition-all text-xs"
              >
                Request Custom Design
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Specs Modal */}
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
              Tesla Energy Hardware
            </span>
            <h3 className="text-2xl font-bold text-white mt-1 mb-1">{selectedProduct.name}</h3>
            <p className="text-sm text-[#AAB7CC] mb-4">{selectedProduct.subtitle}</p>

            <div className="h-48 w-full rounded-xl bg-[#050A14] border border-[#1A2A4A] mb-4 overflow-hidden flex items-center justify-center">
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
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Specifications</h4>
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
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart (${selectedProduct.priceStarting.toLocaleString()})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
