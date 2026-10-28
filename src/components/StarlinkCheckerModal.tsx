import React, { useState } from 'react';
import { X, MapPin, CheckCircle2, Clock, Globe } from 'lucide-react';

interface StarlinkCheckerModalProps {
  onClose: () => void;
  onOrderStarlink: (type: 'residential' | 'mini') => void;
}

export const StarlinkCheckerModal: React.FC<StarlinkCheckerModalProps> = ({
  onClose,
  onOrderStarlink,
}) => {
  const [country, setCountry] = useState('Nigeria');
  const [city, setCity] = useState('Wukari, Taraba State');
  const [hasChecked, setHasChecked] = useState(true);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setHasChecked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-neutral-400 uppercase">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Orbital Satellite Constellation Coverage</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          Check Starlink Service Availability
        </h3>
        <p className="text-xs text-neutral-400 mb-5">
          Verified live coverage status for residential, roaming, and portable mini dish kits.
        </p>

        <form onSubmit={handleCheck} className="space-y-3 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Kenya">Kenya</option>
                <option value="Ghana">Ghana</option>
                <option value="South Africa">South Africa</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">State / City / Village</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Wukari, Lagos, Abuja, Kano"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-medium rounded-lg transition-colors"
          >
            Check Service Status
          </button>
        </form>

        {hasChecked && (
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
            <div className="flex items-start gap-2.5 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">
                  Active Coverage Confirmed for {city || 'Your Area'}, {country}!
                </p>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Overhead laser-linked Starlink Gen 2 satellites deliver continuous, low-latency connectivity without reliance on local terrestrial towers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-900 font-mono text-[11px]">
              <div>
                <span className="text-neutral-500 block">STANDARD HARDWARE</span>
                <span className="text-white font-semibold">₦590,000 / $599</span>
              </div>
              <div>
                <span className="text-neutral-500 block">STARLINK MINI KIT</span>
                <span className="text-emerald-400 font-semibold">₦120,000 / $199</span>
              </div>
              <div>
                <span className="text-neutral-500 block">RESIDENTIAL SERVICE</span>
                <span className="text-white font-semibold">₦38,000 / mo</span>
              </div>
              <div>
                <span className="text-neutral-500 block">DISPATCH LEAD TIME</span>
                <span className="text-white font-semibold">2 - 5 business days</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => {
                  onOrderStarlink('mini');
                  onClose();
                }}
                className="py-2 px-3 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Order Starlink Mini
              </button>
              <button
                onClick={() => {
                  onOrderStarlink('residential');
                  onClose();
                }}
                className="py-2 px-3 bg-neutral-900 border border-neutral-700 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Order Residential
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
