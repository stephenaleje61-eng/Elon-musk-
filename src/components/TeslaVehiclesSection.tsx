import React, { useState } from 'react';
import { VEHICLES } from '../data/elonverseData';
import { Vehicle } from '../types';
import { Gauge, BatteryCharging, Zap, Info, ExternalLink, X, Calendar, CheckCircle } from 'lucide-react';

interface TeslaVehiclesSectionProps {
  onAddToCart: (vehicle: Vehicle) => void;
  onOrderNowDirect?: (vehicle: Vehicle) => void;
}

export const TeslaVehiclesSection: React.FC<TeslaVehiclesSectionProps> = ({
  onAddToCart,
  onOrderNowDirect,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [demoDriveVehicle, setDemoDriveVehicle] = useState<Vehicle | null>(null);
  const [demoBookingSuccess, setDemoBookingSuccess] = useState<string | null>(null);
  const [demoLocation, setDemoLocation] = useState('Lagos, Nigeria (Virtual Experience Hub)');
  const [demoDate, setDemoDate] = useState('Tomorrow 11:00 AM');

  const handleBookDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoDriveVehicle) {
      setDemoBookingSuccess(`DEMO-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
    }
  };

  return (
    <section id="vehicles" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="mb-10 text-left">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Tesla Vehicles
        </h2>
        <p className="text-sm text-neutral-400 font-normal">
          Clean energy. Better performance. A sustainable future.
        </p>
      </div>

      {/* 5-Card Responsive Grid matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {VEHICLES.map((car) => (
          <div
            key={car.id}
            className="group relative flex flex-col justify-between rounded-xl bg-[#0e0e0e] border border-neutral-800/90 hover:border-neutral-600 transition-all p-4 duration-300"
          >
            {/* Top Details */}
            <div>
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-lg font-bold text-white tracking-tight">{car.name}</h3>
                <button
                  onClick={() => setSelectedVehicle(car)}
                  className="p-1 text-neutral-500 hover:text-white transition-colors"
                  title="View Specs & Details"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-neutral-400 mb-3">{car.tagline}</p>

              {/* Vehicle Image */}
              <div
                onClick={() => setSelectedVehicle(car)}
                className="relative h-32 w-full flex items-center justify-center cursor-pointer overflow-hidden rounded-lg bg-neutral-950/60 my-2"
              >
                <img
                  src={car.image}
                  alt={car.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full w-full object-contain filter contrast-105 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Pricing */}
              <div className="my-3 pb-3 border-b border-neutral-800">
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-xs text-neutral-400">From</span>
                  <span className="text-base font-bold font-mono">
                    ${car.price.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  Est. ${car.monthlyEstimate}/mo
                </div>
              </div>

              {/* Specifications List */}
              <div className="space-y-1.5 text-xs text-neutral-300 my-3">
                <div className="flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="font-mono">{car.range}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="font-mono">{car.acceleration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{car.drivetrain}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => {
                    if (onOrderNowDirect) {
                      onOrderNowDirect(car);
                    } else {
                      onAddToCart(car);
                    }
                  }}
                  className="py-1.5 px-2 bg-white text-black text-xs font-bold rounded hover:bg-neutral-200 transition-colors shadow-sm flex items-center justify-center gap-1 group"
                  title="Order Now — Direct Private Chat with Elon Musk (Owner 👑)"
                >
                  <span>Order Now</span>
                  <span className="text-[10px] text-neutral-500 group-hover:text-black">💬</span>
                </button>
                <button
                  onClick={() => {
                    setDemoDriveVehicle(car);
                    setDemoBookingSuccess(null);
                  }}
                  className="py-1.5 px-2 bg-neutral-900 border border-neutral-700 text-white text-xs font-medium rounded hover:bg-neutral-800 transition-colors"
                >
                  Demo Drive
                </button>
              </div>

              <div className="text-[11px] text-center text-neutral-500 font-mono">
                Delivery: {car.deliveryEstimate}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicle Technical Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0d0d0d] border border-neutral-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-bold text-white">{selectedVehicle.name}</h3>
              <span className="text-xs text-neutral-400">{selectedVehicle.category}</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">{selectedVehicle.description}</p>

            <div className="h-48 w-full bg-neutral-950 rounded-xl overflow-hidden mb-6 flex items-center justify-center p-4">
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px]">BASE PRICE</span>
                <span className="font-mono font-bold text-white">${selectedVehicle.price.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">RANGE (EPA EST.)</span>
                <span className="font-mono font-bold text-white">{selectedVehicle.range}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">ACCELERATION</span>
                <span className="font-mono font-bold text-white">{selectedVehicle.acceleration}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">TOP SPEED</span>
                <span className="font-mono text-white">{selectedVehicle.specs.topSpeed}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">SEATING</span>
                <span className="font-mono text-white">{selectedVehicle.specs.seating}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">CARGO ROOM</span>
                <span className="font-mono text-white">{selectedVehicle.specs.cargo}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800">
              <a
                href={selectedVehicle.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <span>Visit Official Tesla Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="px-3 py-2 rounded-lg border border-neutral-700 text-xs text-neutral-300 hover:bg-neutral-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onAddToCart(selectedVehicle);
                    setSelectedVehicle(null);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-800"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (onOrderNowDirect) {
                      onOrderNowDirect(selectedVehicle);
                    } else {
                      onAddToCart(selectedVehicle);
                    }
                    setSelectedVehicle(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200 shadow-md flex items-center gap-1.5"
                >
                  <span>Order Now &bull; Private Chat 👑</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Drive Reservation Modal */}
      {demoDriveVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setDemoDriveVehicle(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>

            {demoBookingSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Demo Drive Scheduled!</h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Your reservation for the <strong className="text-white">{demoDriveVehicle.name}</strong> is confirmed.
                </p>
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-300 mb-6">
                  Confirmation Code: <span className="text-white font-bold">{demoBookingSuccess}</span>
                  <br />
                  Location: {demoLocation}
                  <br />
                  Time: {demoDate}
                </div>
                <button
                  onClick={() => setDemoDriveVehicle(null)}
                  className="w-full py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-400 uppercase">
                  <Calendar className="w-4 h-4" />
                  <span>Complimentary Experience</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Schedule Demo Drive &mdash; {demoDriveVehicle.name}
                </h3>
                <p className="text-xs text-neutral-400 mb-5">
                  Experience instantaneous electric torque and Full Self-Driving hardware firsthand.
                </p>

                <form onSubmit={handleBookDemo} className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Preferred Location</label>
                    <select
                      value={demoLocation}
                      onChange={(e) => setDemoLocation(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                    >
                      <option value="Lagos, Nigeria (Virtual Experience Hub)">Lagos, Nigeria (Virtual Experience Hub)</option>
                      <option value="Abuja, Nigeria (Central Tech Showcase)">Abuja, Nigeria (Central Tech Showcase)</option>
                      <option value="London, UK (Westfield Centre)">London, UK (Westfield Centre)</option>
                      <option value="Austin, Texas (Gigafactory Texas)">Austin, Texas (Gigafactory Texas)</option>
                      <option value="Fremont, California Delivery Center">Fremont, California Delivery Center</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Date &amp; Time Slot</label>
                    <input
                      type="text"
                      value={demoDate}
                      onChange={(e) => setDemoDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                      placeholder="e.g. Saturday 2:00 PM"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors shadow-md"
                    >
                      Confirm Free Demo Drive
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
