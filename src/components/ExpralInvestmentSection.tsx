import React, { useState } from 'react';
import { EXPRAL_INVESTMENT_PLANS } from '../data/elonverseData';
import { ExpralInvestmentPlan } from '../types';
import { TrendingUp, ShieldAlert, ArrowRight, CheckCircle2, Sliders, PieChart, Info, DollarSign } from 'lucide-react';

interface ExpralInvestmentSectionProps {
  onSelectPlan: (plan: ExpralInvestmentPlan, customAmount: number) => void;
}

export const ExpralInvestmentSection: React.FC<ExpralInvestmentSectionProps> = ({ onSelectPlan }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('expral-growth-portfolio');
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  const [calcMonths, setCalcMonths] = useState<number>(12);
  const [currencyMode, setCurrencyMode] = useState<'USD' | 'NGN'>('USD');
  const [showDisclaimerDetails, setShowDisclaimerDetails] = useState<boolean>(false);

  const currentPlan = EXPRAL_INVESTMENT_PLANS.find((p) => p.id === selectedPlanId) || EXPRAL_INVESTMENT_PLANS[1];

  // Calculations
  const rateApy = currentPlan.targetYieldApy / 100;
  const projectedInterestUSD = Math.round(calcAmount * (rateApy * (calcMonths / 12)));
  const totalReturnUSD = calcAmount + projectedInterestUSD;
  const monthlyYieldUSD = Math.round(projectedInterestUSD / calcMonths);

  // Exchange rate approximation for Nigerian Naira display (₦1,500 / $)
  const NGN_RATE = 1500;
  const formatMoney = (usdVal: number) => {
    if (currencyMode === 'NGN') {
      return `₦${(usdVal * NGN_RATE).toLocaleString()}`;
    }
    return `$${usdVal.toLocaleString()}`;
  };

  return (
    <section id="investments" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="mb-10 text-left">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
          <TrendingUp className="w-4 h-4" />
          <span>Ecosystem Technology Syndicates</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Expral Investment Plans
        </h2>
        <p className="text-sm text-neutral-400 font-normal max-w-3xl">
          Direct syndicated participation in physical infrastructure across Starlink ground nodes, Tesla commercial Megapack energy arbitrage, and xAI frontier supercomputing. No email or password login required.
        </p>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {EXPRAL_INVESTMENT_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => {
                setSelectedPlanId(plan.id);
                setCalcAmount(plan.minCapital * 2);
                setCalcMonths(plan.durationMonths);
              }}
              className={`relative rounded-2xl p-6 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-900 border-2 border-white shadow-2xl text-white'
                  : 'bg-[#0d0d0d] border border-neutral-800 hover:border-neutral-700 text-neutral-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                    {plan.tier}
                  </span>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    plan.riskRating === 'Moderate'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                      : plan.riskRating === 'High Growth'
                      ? 'bg-sky-950 text-sky-400 border border-sky-800/80'
                      : 'bg-purple-950 text-purple-400 border border-purple-800/80'
                  }`}>
                    {plan.riskRating}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{plan.title}</h3>
                <p className="text-xs text-neutral-400 mb-4">{plan.focusAsset}</p>

                {/* Target APY Badge */}
                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 mb-4">
                  <div className="text-xs text-neutral-400 font-mono">TARGET YIELD (ANNUALIZED)</div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400">
                    {plan.targetYieldApy}% <span className="text-xs font-normal text-neutral-400">APY</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    Term: {plan.durationMonths} Months &middot; {plan.payoutFrequency}
                  </div>
                </div>

                <div className="text-xs text-neutral-300 mb-4 leading-relaxed">
                  {plan.description}
                </div>

                <div className="space-y-2 mb-6">
                  {plan.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-mono text-neutral-400 mb-3 pt-3 border-t border-neutral-800/80 flex justify-between">
                  <span>Entry Range:</span>
                  <span className="text-white font-bold">
                    ${plan.minCapital.toLocaleString()} - ${plan.maxCapital.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(plan, plan.minCapital);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isSelected
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                >
                  <span>Allocate to Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Yield Calculator */}
      <div className="rounded-2xl bg-[#090909] border border-neutral-800 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-neutral-800 gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <span>Interactive Expral Yield Simulator &mdash; {currentPlan.title}</span>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-3 py-1 rounded font-mono font-medium transition-colors ${
                currencyMode === 'USD' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrencyMode('NGN')}
              className={`px-3 py-1 rounded font-mono font-medium transition-colors ${
                currencyMode === 'NGN' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              NGN (₦)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 font-mono mb-2">
                <span>INVESTMENT CAPITAL:</span>
                <span className="text-white text-sm font-bold">{formatMoney(calcAmount)}</span>
              </div>
              <input
                type="range"
                min={currentPlan.minCapital}
                max={currentPlan.maxCapital}
                step={currentPlan.minCapital >= 50000 ? 5000 : 500}
                value={calcAmount}
                onChange={(e) => setCalcAmount(parseInt(e.target.value, 10))}
                className="w-full accent-white h-2 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                <span>Min: {formatMoney(currentPlan.minCapital)}</span>
                <span>Max: {formatMoney(currentPlan.maxCapital)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 font-mono mb-2">
                <span>CONTRACT DURATION:</span>
                <span className="text-white text-sm font-bold">{calcMonths} Months</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[6, 12, 24].map((m) => (
                  <button
                    key={m}
                    onClick={() => setCalcMonths(m)}
                    className={`py-2 text-xs font-mono rounded-lg border transition-colors ${
                      calcMonths === m
                        ? 'bg-neutral-800 border-white text-white font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {m} Months
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Allocation Breakdown */}
            <div>
              <div className="text-xs font-mono text-neutral-400 mb-2 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" />
                <span>SYNDICATED ASSET ALLOCATION</span>
              </div>
              <div className="space-y-1.5">
                {currentPlan.allocationBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-neutral-300 font-mono">
                    <span className="text-neutral-400 truncate">{item.asset}</span>
                    <span className="text-white font-semibold ml-2">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 rounded-xl bg-neutral-950 border border-neutral-800 p-6 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                Projected Return Summary
              </div>
              <div className="text-xs text-neutral-500 font-mono mb-4">
                At {currentPlan.targetYieldApy}% Annualized Yield
              </div>

              <div className="space-y-3.5 pb-4 border-b border-neutral-900 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Allocated Capital:</span>
                  <span className="text-white font-bold">{formatMoney(calcAmount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Est. Monthly Distribution:</span>
                  <span className="text-emerald-400 font-bold">{formatMoney(monthlyYieldUSD)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Net Estimated Profit:</span>
                  <span className="text-emerald-400 font-bold">+{formatMoney(projectedInterestUSD)}</span>
                </div>
              </div>

              <div className="pt-4 mb-6">
                <span className="text-xs text-neutral-400 block font-mono">TOTAL ESTIMATED MATURITY:</span>
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {formatMoney(totalReturnUSD)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan(currentPlan, calcAmount)}
              className="w-full py-3 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span>Add Allocation to Cart &mdash; {formatMoney(calcAmount)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory & Risk Disclosure matching guidelines */}
      <div className="mt-6 p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 text-left">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-neutral-400 leading-relaxed">
            <strong className="text-neutral-200">Legal &amp; Regulatory Disclaimer:</strong> ELONVERSE provides informational and simulated technology syndicate modeling for exploratory purposes only. It is not an investment adviser, broker-dealer, or affiliated financial institution of Elon Musk, Tesla Inc., SpaceX, or xAI. Technology infrastructure operations and private offerings involve market risks, including the possible loss of principal capital. Always review verified regulatory prospectuses before deploying actual capital.
          </div>
        </div>
      </div>
    </section>
  );
};
