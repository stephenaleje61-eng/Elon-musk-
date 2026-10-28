import React, { useState, useMemo } from 'react';
import { X, Search, ArrowRight, Tag } from 'lucide-react';
import { VEHICLES, SPACE_PRODUCTS, STARLINK_PRODUCTS, ENERGY_PRODUCTS, FUTURE_PROJECTS, EXPRAL_INVESTMENT_PLANS } from '../data/elonverseData';

interface GlobalSearchModalProps {
  onClose: () => void;
  onSelectResult: (href: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');

  const allItems = useMemo(() => {
    const list: Array<{ title: string; category: string; description: string; href: string }> = [];

    VEHICLES.forEach((v) => {
      list.push({
        title: `Tesla ${v.name}`,
        category: 'Vehicles',
        description: `${v.tagline} · From $${v.price.toLocaleString()} · ${v.range}`,
        href: '#vehicles',
      });
    });

    SPACE_PRODUCTS.forEach((s) => {
      list.push({
        title: `SpaceX ${s.name}`,
        category: 'Space',
        description: `${s.subtitle} · ${s.description}`,
        href: '#space',
      });
    });

    STARLINK_PRODUCTS.forEach((l) => {
      list.push({
        title: l.name,
        category: 'Internet',
        description: `${l.tagline} · ${l.speed}`,
        href: '#internet',
      });
    });

    ENERGY_PRODUCTS.forEach((e) => {
      list.push({
        title: `Tesla ${e.name}`,
        category: 'Energy',
        description: `${e.subtitle} · ${e.description}`,
        href: '#energy',
      });
    });

    FUTURE_PROJECTS.forEach((f) => {
      list.push({
        title: f.name,
        category: 'Future Projects',
        description: `${f.category} · ${f.description}`,
        href: '#future',
      });
    });

    EXPRAL_INVESTMENT_PLANS.forEach((i) => {
      list.push({
        title: i.title,
        category: 'Expral Investment',
        description: `${i.tier} · ${i.targetYieldApy}% APY · ${i.focusAsset}`,
        href: '#investments',
      });
    });

    return list;
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 6);
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-5 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800 mb-4">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Model Y, Starship, Starlink Mini, Expral Plan, Powerwall..."
            className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500 font-mono">
              No matching technologies or products found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectResult(item.href);
                  onClose();
                }}
                className="p-3 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-700 transition-colors cursor-pointer flex items-center justify-between text-left group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white group-hover:text-neutral-100">
                      {item.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate max-w-sm sm:max-w-md">
                    {item.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
