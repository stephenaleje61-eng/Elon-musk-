import React, { useState } from 'react';
import { Sun, Battery, Building2, Calculator, Check, ArrowRight } from 'lucide-react';
import { ENERGY_PRODUCTS } from '../data/elonverseData';
import { EnergyProduct } from '../types';

interface TeslaEnergySectionProps {
  onAddEnergyToCart: (product: EnergyProduct) => void;
  onContactSales: () => void;
}

export const TeslaEnergySection: React.FC<TeslaEnergySectionProps> = ({
  onAddEnergyToCart,
  onContactSales,
}) => {
  // Energy Calculator State matching screenshot
  const [houseSize, setHouseSize] = useState('1,000');
  const [powerNeeded, setPowerNeeded] = useState(10);
  const [fuelSpend, setFuelSpend] = useState(50000); // ₦50k monthly
  const [calculatedSavingsNGN, setCalculatedSavingsNGN] = useState('₦50,000');
  const [calculatedSavingsUSD, setCalculatedSavingsUSD] = useState('$380');
  const [hasCalculated, setHasCalculated] = useState(true);

  const solarRoof = ENERGY_PRODUCTS[0];
  const powerwall = ENERGY_PRODUCTS[1];
  const megapack = ENERGY_PRODUCTS[2];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const sizeFactor = houseSize === '1,000' ? 1 : houseSize === '2,500' ? 2.2 : 4.5;
    const estimatedNGN = Math.round(50000 * (powerNeeded / 10) * (sizeFactor * 0.9));
    const estimatedUSD = Math.round(estimatedNGN / 130);

    setCalculatedSavingsNGN(`₦${estimatedNGN.toLocaleString()}`);
    setCalculatedSavingsUSD(`$${estimatedUSD.toLocaleString()}`);
    setHasCalculated(true);
  };

  return (
    <section id="energy" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="mb-8 text-left">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Tesla Energy <span className="text-neutral-500 font-light">&mdash; Power Your World</span>
        </h2>
        <p className="text-sm text-neutral-400 font-normal">
          Clean energy for homes, businesses and a sustainable planet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: 3 Product Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Solar Roof */}
          <div className="rounded-xl bg-[#0e0e0e] border border-neutral-800 p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <div className="h-28 rounded-lg overflow-hidden bg-neutral-950 mb-3 flex items-center justify-center">
                <div className="p-3 bg-neutral-900/60 rounded-full text-amber-400">
                  <Sun className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Solar Roof</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                Power your house in Wukari, save ₦50k fuel monthly.
              </p>
            </div>
            <div>
              <div className="text-sm font-bold font-mono text-white mb-3">
                From $15k
              </div>
              <button
                onClick={() => onAddEnergyToCart(solarRoof)}
                className="w-full py-1.5 px-3 bg-neutral-900 border border-neutral-700 text-white text-xs font-medium rounded hover:bg-neutral-800 transition-colors"
              >
                Order Solar Roof
              </button>
            </div>
          </div>

          {/* 2. Powerwall */}
          <div className="rounded-xl bg-[#0e0e0e] border border-neutral-800 p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <div className="h-28 rounded-lg overflow-hidden bg-neutral-950 mb-3 flex items-center justify-center">
                <div className="p-3 bg-neutral-900/60 rounded-full text-emerald-400">
                  <Battery className="w-8 h-8" />
                </div>
              </div>
              <div className="text-base font-bold font-mono text-white mb-0.5">$9,200</div>
              <h3 className="text-sm font-bold text-white mb-1">Powerwall 3</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                Backup for NEPA light &mdash; 13.5kWh seamless storage.
              </p>
            </div>
            <div>
              <button
                onClick={() => onAddEnergyToCart(powerwall)}
                className="w-full py-1.5 px-3 bg-white text-black text-xs font-semibold rounded hover:bg-neutral-200 transition-colors"
              >
                Order Powerwall
              </button>
            </div>
          </div>

          {/* 3. Megapack */}
          <div className="rounded-xl bg-[#0e0e0e] border border-neutral-800 p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors">
            <div>
              <div className="h-28 rounded-lg overflow-hidden bg-neutral-950 mb-3 flex items-center justify-center">
                <div className="p-3 bg-neutral-900/60 rounded-full text-sky-400">
                  <Building2 className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Megapack</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                For business, factory, estate mini-grids &amp; large scale utility.
              </p>
            </div>
            <div>
              <div className="text-xs text-neutral-500 font-mono mb-3">
                3.9 MWh Industrial Capacity
              </div>
              <button
                onClick={onContactSales}
                className="w-full py-1.5 px-3 bg-neutral-900 border border-neutral-700 text-white text-xs font-medium rounded hover:bg-neutral-800 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Right: Working Energy Savings Calculator matching screenshot */}
        <div className="lg:col-span-4 rounded-xl bg-[#0e0e0e] border border-neutral-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800 text-xs font-bold text-white uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Energy Calculator</span>
            </div>

            <form onSubmit={handleCalculate} className="space-y-3.5">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">House size (sq ft)</label>
                <select
                  value={houseSize}
                  onChange={(e) => setHouseSize(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                >
                  <option value="1,000">1,000 sq ft (Residential Flat)</option>
                  <option value="2,500">2,500 sq ft (Duplex / Townhouse)</option>
                  <option value="5,000">5,000+ sq ft (Commercial / Estate)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  Power needed (kW): <span className="font-mono text-white">{powerNeeded} kW</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={30}
                  step={1}
                  value={powerNeeded}
                  onChange={(e) => setPowerNeeded(parseInt(e.target.value, 10))}
                  className="w-full accent-white h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Estimated savings result matching screenshot */}
              <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800/80 my-3">
                <span className="text-[11px] text-neutral-400 block uppercase font-mono mb-1">
                  Estimated savings (monthly)
                </span>
                <div className="text-2xl font-extrabold font-mono text-emerald-400 tracking-tight">
                  {calculatedSavingsNGN}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Approx. {calculatedSavingsUSD} / month saved against petrol generator
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-900 border border-neutral-700 text-xs font-semibold text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Calculate
              </button>
            </form>
          </div>

          <p className="text-[10px] text-neutral-500 text-center mt-3">
            *Estimates based on typical solar irradiation and current generator fuel tariffs.
          </p>
        </div>
      </div>
    </section>
  );
};
