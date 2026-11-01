import React, { useState } from 'react';
import { VEHICLES } from '../data/elonverseData';
import { Vehicle } from '../types';
import { Gauge, BatteryCharging, Zap, Info, Heart, ShoppingCart, Check, ExternalLink, Calendar, X } from 'lucide-react';

interface TeslaVehiclesSectionProps {
  onAddToCart: (vehicle: Vehicle) => void;
  onOrderNowDirect?: (vehicle: Vehicle) => void;
  onToggleWishlist?: (vehicle: Vehicle) => void;
  wishlistIds?: string[];
  onOpenMessageSupport?: (topic: string) => void;
}

export const TeslaVehiclesSection: React.FC<TeslaVehiclesSectionProps> = ({
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onOpenMessageSupport,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [demoDriveVehicle, setDemoDriveVehicle] = useState<Vehicle | null>(null);
  const [demoBookingSuccess, setDemoBookingSuccess] = useState<string | null>(null);
  const [demoLocation, setDemoLocation] = useState('Austin, TX (Gigafactory Experience Center)');
  const [demoDate, setDemoDate] = useState('Tomorrow 11:00 AM');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleBookDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoDriveVehicle) {
      setDemoBookingSuccess(`TSLA-DEMO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    }
  };

  const handleAdd = (car: Vehicle) => {
    onAddToCart(car);
    setAddedIds((prev) => ({ ...prev, [car.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [car.id]: false }));
    }, 2000);
  };

  return (
    <section id="vehicles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Zero-Emission Fleet
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Tesla Vehicles
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            Highest safety ratings, relentless performance, industry-leading range, and next-generation Full Self-Driving hardware.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 text-xs text-[#AAB7CC]">
          <span>6 Models Available</span>
          <span>·</span>
          <span className="text-[#00F0FF]">Global Delivery & Inquiries</span>
        </div>
      </div>

      {/* Responsive Grid of 6 Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VEHICLES.map((car) => {
          const isWishlisted = wishlistIds.includes(car.id);
          const isJustAdded = !!addedIds[car.id];

          return (
            <div
              key={car.id}
              className="group flex flex-col justify-between rounded-xl bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF]/50 transition-all duration-300 p-5 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]"
            >
              <div>
                {/* Header Row: Title & Action icons */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-[#00F0FF] transition-colors">
                      {car.name}
                    </h3>
                    <p className="text-xs text-[#AAB7CC] mt-0.5">{car.tagline}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onToggleWishlist && (
                      <button
                        onClick={() => onToggleWishlist(car)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isWishlisted
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                            : 'bg-[#050A14] border-[#1A2A4A] text-[#AAB7CC] hover:text-white'
                        }`}
                        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        aria-label="Wishlist"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedVehicle(car)}
                      className="p-1.5 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-[#AAB7CC] hover:text-[#00F0FF] transition-colors"
                      title="View Detailed Specifications"
                      aria-label="Specs"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vehicle Image */}
                <div
                  onClick={() => setSelectedVehicle(car)}
                  className="relative h-44 w-full flex items-center justify-center cursor-pointer overflow-hidden rounded-lg bg-[#050A14] border border-[#1A2A4A]/60 my-4"
                >
                  <img
                    src={car.image}
                    alt={car.name}
                    style={{ width: '100%' }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800';
                    }}
                    className="max-h-full w-full object-contain filter contrast-105 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-[#AAB7CC] border border-[#1A2A4A]">
                    {car.category}
                  </div>
                </div>

                {/* Price Box */}
                <div className="mb-4 pb-3 border-b border-[#1A2A4A]">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-[#AAB7CC] uppercase tracking-wider block">Estimated Price</span>
                      <span className="text-xl font-bold font-mono text-white tracking-tight">
                        ${car.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#AAB7CC] uppercase tracking-wider block">Lease Option</span>
                      <span className="text-xs font-mono text-[#00F0FF]">
                        Est. ${car.monthlyEstimate}/mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core Specs */}
                <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs text-[#AAB7CC] bg-[#050A14] rounded-lg border border-[#1A2A4A] mb-4">
                  <div className="p-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-[#00F0FF] mx-auto mb-1" />
                    <span className="font-mono text-[11px] block truncate text-white">{car.range.split(' ')[0]}</span>
                    <span className="text-[10px] text-[#AAB7CC]">Range</span>
                  </div>
                  <div className="p-1 border-x border-[#1A2A4A]">
                    <Gauge className="w-3.5 h-3.5 text-[#00F0FF] mx-auto mb-1" />
                    <span className="font-mono text-[11px] block truncate text-white">{car.acceleration.split(' ')[0]}</span>
                    <span className="text-[10px] text-[#AAB7CC]">0-60</span>
                  </div>
                  <div className="p-1">
                    <Zap className="w-3.5 h-3.5 text-[#00F0FF] mx-auto mb-1" />
                    <span className="font-mono text-[11px] block truncate text-white">{car.specs.topSpeed.split(' ')[0]}</span>
                    <span className="text-[10px] text-[#AAB7CC]">Top Speed</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-2">
                <button
                  onClick={() => handleAdd(car)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isJustAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#00F0FF] text-[#050A14] hover:bg-[#00F0FF]/90 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
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
                      <span>Add to Cart (${car.price.toLocaleString()})</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDemoDriveVehicle(car)}
                    className="py-2 px-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] hover:border-[#AAB7CC] text-white text-xs font-medium text-center transition-colors"
                  >
                    Demo Drive
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenMessageSupport) {
                        onOpenMessageSupport(`Tesla ${car.name} ordering and custom configuration inquiry`);
                      } else {
                        setSelectedVehicle(car);
                      }
                    }}
                    className="py-2 px-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] hover:border-[#00F0FF] text-[#00F0FF] text-xs font-medium text-center transition-colors truncate"
                  >
                    Ask Support
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicle Specs Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB7CC] hover:text-white rounded-lg hover:bg-[#050A14] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#00F0FF] font-semibold">
                  {selectedVehicle.category}
                </span>
                <h3 className="text-2xl font-bold text-white mt-0.5">{selectedVehicle.name}</h3>
                <p className="text-sm text-[#AAB7CC]">{selectedVehicle.tagline}</p>
              </div>
            </div>

            <div className="relative h-56 w-full flex items-center justify-center rounded-xl bg-[#050A14] border border-[#1A2A4A] mb-6 overflow-hidden">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                referrerPolicy="no-referrer"
                className="max-h-full w-full object-contain filter contrast-105"
              />
            </div>

            <p className="text-sm text-[#AAB7CC] mb-6 leading-relaxed">
              {selectedVehicle.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">Starting Price</span>
                <span className="text-base font-bold font-mono text-white">
                  ${selectedVehicle.price.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">Range</span>
                <span className="text-base font-bold font-mono text-white">{selectedVehicle.range}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">0-60 mph</span>
                <span className="text-base font-bold font-mono text-white">{selectedVehicle.acceleration}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">Top Speed</span>
                <span className="text-base font-bold font-mono text-white">{selectedVehicle.specs.topSpeed}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">Seating</span>
                <span className="text-base font-bold text-white">{selectedVehicle.specs.seating}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                <span className="text-[10px] text-[#AAB7CC] block uppercase">Cargo Capacity</span>
                <span className="text-base font-bold text-white">{selectedVehicle.specs.cargo}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#1A2A4A]">
              <button
                onClick={() => {
                  handleAdd(selectedVehicle);
                  setSelectedVehicle(null);
                }}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-[#00F0FF] text-[#050A14] font-bold text-sm hover:bg-[#00F0FF]/90 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart (${selectedVehicle.price.toLocaleString()})</span>
              </button>
              <a
                href={selectedVehicle.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#050A14] border border-[#1A2A4A] hover:border-white text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Official Tesla Configurator</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Demo Drive Booking Modal */}
      {demoDriveVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 shadow-2xl">
            <button
              onClick={() => {
                setDemoDriveVehicle(null);
                setDemoBookingSuccess(null);
              }}
              className="absolute top-4 right-4 p-2 text-[#AAB7CC] hover:text-white rounded-lg hover:bg-[#050A14] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {demoBookingSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Demo Drive Scheduled</h3>
                <p className="text-xs text-[#AAB7CC] mb-4">
                  Reservation confirmed for <strong className="text-white">{demoDriveVehicle.name}</strong>.
                </p>
                <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-xs font-mono text-[#00F0FF] mb-6">
                  CONFIRMATION ID: {demoBookingSuccess}
                </div>
                <button
                  onClick={() => {
                    setDemoDriveVehicle(null);
                    setDemoBookingSuccess(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#00F0FF] text-[#050A14] font-semibold text-xs hover:bg-[#00F0FF]/90 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookDemo}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#00F0FF]" />
                  <h3 className="text-lg font-bold text-white">Book Demo Drive</h3>
                </div>
                <p className="text-xs text-[#AAB7CC] mb-4">
                  Experience full acceleration, acoustic cabin tranquility, and autonomous steering in the {demoDriveVehicle.name}.
                </p>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-[11px] font-semibold text-[#AAB7CC] block mb-1">
                      Experience Location / Delivery
                    </label>
                    <input
                      type="text"
                      value={demoLocation}
                      onChange={(e) => setDemoLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#AAB7CC] block mb-1">
                      Preferred Date & Time Window
                    </label>
                    <input
                      type="text"
                      value={demoDate}
                      onChange={(e) => setDemoDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-white text-xs focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  Confirm Free Demo Drive
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
