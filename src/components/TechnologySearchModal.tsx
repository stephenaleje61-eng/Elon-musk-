import React, { useState } from 'react';
import { Search, X, ArrowRight, BatteryCharging, Rocket, Wifi, Cpu, Sun, Bot } from 'lucide-react';
import { VEHICLES, TESLA_TECH_ENERGY, SPACEX_PRODUCTS, STARLINK_PRODUCTS } from '../data/elonverseData';

interface TechnologySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (anchor: string) => void;
}

export const TechnologySearchModal: React.FC<TechnologySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  // Flattened items for search
  const allItems = [
    ...VEHICLES.map((v) => ({
      id: v.id,
      name: v.name,
      category: 'Tesla Vehicles',
      desc: v.tagline,
      anchor: '#vehicles',
      price: `$${v.price.toLocaleString()}`,
    })),
    ...TESLA_TECH_ENERGY.map((e) => ({
      id: e.id,
      name: e.name,
      category: 'Tesla Energy & Charging',
      desc: e.subtitle,
      anchor: '#energy',
      price: `$${e.priceStarting.toLocaleString()}`,
    })),
    ...SPACEX_PRODUCTS.map((s) => ({
      id: s.id,
      name: s.name,
      category: 'SpaceX Spaceflight',
      desc: s.subtitle,
      anchor: '#space',
      price: `$${(s.deposit || s.price).toLocaleString()}`,
    })),
    ...STARLINK_PRODUCTS.map((st) => ({
      id: st.id,
      name: st.name,
      category: 'Starlink Satellite Internet',
      desc: st.tagline,
      anchor: '#internet',
      price: `$${st.price.toLocaleString()}`,
    })),
    {
      id: 'grok-ai',
      name: 'xAI Grok 2 & 3',
      category: 'Artificial Intelligence',
      desc: 'Maximum truth-seeking AI with Memphis Colossus cluster',
      anchor: '#ai',
      price: '$8 - $30/mo',
    },
    {
      id: 'optimus-gen2',
      name: 'Tesla Optimus Gen 2 Humanoid',
      category: 'Autonomous Robotics',
      desc: 'Bi-pedal general purpose helper robot with 22-DoF tactile hands',
      anchor: '#robots',
      price: '$20,000 - $30,000',
    },
    {
      id: 'direct-to-cell',
      name: 'Starlink Direct to Cell',
      category: 'SatCom & Mobile',
      desc: 'Eliminating mobile dead zones worldwide with standard LTE phones',
      anchor: '#future',
      price: 'Carrier Service',
    },
    {
      id: 'neuralink-telepathy',
      name: 'Neuralink Telepathy (N1)',
      category: 'Neurotechnology & BCI',
      desc: 'Wireless brain-computer interface enabling control by thought',
      anchor: '#future',
      price: 'Clinical Trials',
    },
  ];

  const filtered = query.trim()
    ? allItems.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.desc.toLowerCase().includes(query.toLowerCase()) ||
          i.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#AAB7CC] hover:text-white rounded-lg hover:bg-[#050A14]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Input */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[#AAB7CC]" />
          <input
            type="text"
            placeholder="Type technology, model, hardware, or rocket name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#050A14] border border-[#1A2A4A] text-sm text-white placeholder-[#AAB7CC]/60 focus:outline-none focus:border-[#00F0FF]"
          />
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#AAB7CC]">
              No matching technologies found for &quot;{query}&quot;. Try searching &quot;Model Y&quot;, &quot;Starlink&quot;, or &quot;Powerwall&quot;.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectProduct(item.anchor);
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#050A14] border border-[#1A2A4A] hover:border-[#00F0FF] transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-[#00F0FF] uppercase">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#AAB7CC] truncate max-w-md">{item.desc}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-white">{item.price}</span>
                  <span className="p-1 rounded bg-[#0A152A] group-hover:bg-[#00F0FF] group-hover:text-[#050A14] text-[#AAB7CC] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
