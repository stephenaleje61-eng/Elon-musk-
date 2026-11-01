import React, { useState } from 'react';
import { TrendingUp, ShieldAlert, ExternalLink, BarChart3, DollarSign, Building, FileText, CheckCircle2 } from 'lucide-react';
import { TSLA_FINANCIAL_METRICS, EXPRAL_INVESTMENT_PLANS } from '../data/elonverseData';
import { ExpralInvestmentPlan } from '../types';

interface ExpralInvestmentSectionProps {
  onSelectPlan?: (plan: ExpralInvestmentPlan, customAmount: number) => void;
  onOpenMessageSupport?: (topic: string) => void;
}

export const ExpralInvestmentSection: React.FC<ExpralInvestmentSectionProps> = ({
  onSelectPlan,
  onOpenMessageSupport,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('expral-growth-portfolio');
  const [calcAmount, setCalcAmount] = useState<number>(10000);
  const [calcMonths, setCalcMonths] = useState<number>(12);

  const currentPlan = EXPRAL_INVESTMENT_PLANS.find((p) => p.id === selectedPlanId) || EXPRAL_INVESTMENT_PLANS[1];

  const rateApy = currentPlan.targetYieldApy / 100;
  const projectedInterestUSD = Math.round(calcAmount * (rateApy * (calcMonths / 12)));
  const totalReturnUSD = calcAmount + projectedInterestUSD;

  return (
    <section id="investments" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Corporate Transparency & Capital Markets
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Investment & Financial Information
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            Verified public market disclosures for Tesla (NASDAQ: TSLA), ecosystem energy storage growth, and capital allocation principles.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <a
            href={TSLA_FINANCIAL_METRICS.secFilingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-[#0A152A] border border-[#1A2A4A] hover:border-[#00F0FF] text-[#00F0FF] text-xs font-semibold transition-colors"
          >
            <span>Tesla Investor Relations</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* TSLA Live-Style Financial Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="p-4 rounded-xl bg-[#0A152A] border border-[#1A2A4A]">
          <span className="text-[10px] text-[#AAB7CC] uppercase block">Market Cap</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{TSLA_FINANCIAL_METRICS.marketCap}</span>
          <span className="text-[10px] text-[#00F0FF]">NASDAQ: {TSLA_FINANCIAL_METRICS.symbol}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A152A] border border-[#1A2A4A]">
          <span className="text-[10px] text-[#AAB7CC] uppercase block">Annual Revenue</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{TSLA_FINANCIAL_METRICS.annualRevenue.split(' ')[0]}</span>
          <span className="text-[10px] text-[#AAB7CC]">FY 2024 Audited</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A152A] border border-[#1A2A4A]">
          <span className="text-[10px] text-[#AAB7CC] uppercase block">Vehicle Deliveries</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{TSLA_FINANCIAL_METRICS.automotiveDeliveries.split(' ')[0]}</span>
          <span className="text-[10px] text-[#00F0FF]">Global Record</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A152A] border border-[#1A2A4A]">
          <span className="text-[10px] text-[#AAB7CC] uppercase block">Energy Storage</span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{TSLA_FINANCIAL_METRICS.energyStorageDeployed.split(' ')[0]}</span>
          <span className="text-[10px] text-emerald-400">+125% YoY Growth</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A152A] border border-[#1A2A4A]">
          <span className="text-[10px] text-[#AAB7CC] uppercase block">Free Cash Flow</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{TSLA_FINANCIAL_METRICS.freeCashFlow}</span>
          <span className="text-[10px] text-[#AAB7CC]">Operating Cash</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A152A] border border-[#1A2A4A]">
          <span className="text-[10px] text-[#AAB7CC] uppercase block">Cash & Equivalents</span>
          <span className="text-lg font-bold font-mono text-white mt-0.5 block">{TSLA_FINANCIAL_METRICS.cashAndInvestments}</span>
          <span className="text-[10px] text-[#00F0FF]">Fortress Balance Sheet</span>
        </div>
      </div>

      {/* Syndicate Tech Infrastructure Plans */}
      <div className="rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 lg:p-8 mb-8">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1A2A4A]">
          <div>
            <h3 className="text-xl font-bold text-white">Technology Infrastructure Participation</h3>
            <p className="text-xs text-[#AAB7CC] mt-0.5">
              Explore how capital is deployed into physical Starlink ground nodes, commercial Megapack battery grids, and frontier compute capacity.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#00F0FF] bg-[#050A14] px-2.5 py-1 rounded border border-[#1A2A4A]">
            EDUCATIONAL & SYNDICATE MODEL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
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
                className={`p-5 rounded-xl transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#050A14] border-2 border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : 'bg-[#050A14]/60 border border-[#1A2A4A] hover:border-[#1A2A4A]/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-[#00F0FF]">{plan.tier}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A152A] border border-[#1A2A4A] text-white">
                      {plan.riskRating}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{plan.title}</h4>
                  <p className="text-xs text-[#AAB7CC] mb-3">{plan.focusAsset}</p>

                  <div className="p-3 rounded-lg bg-[#0A152A] border border-[#1A2A4A] mb-3">
                    <span className="text-[10px] text-[#AAB7CC] block uppercase">Target Annual Yield</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {plan.targetYieldApy}% <span className="text-xs font-normal text-[#AAB7CC]">APY</span>
                    </span>
                    <span className="text-[10px] text-[#AAB7CC] block mt-0.5">
                      Min Capital: ${plan.minCapital.toLocaleString()} &middot; Term: {plan.durationMonths} Months
                    </span>
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-[#AAB7CC] mt-2 mb-4">
                  {plan.highlights.slice(0, 2).map((h, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                      <span className="truncate">{h}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectPlan) {
                      onSelectPlan(plan, calcAmount);
                    } else if (onOpenMessageSupport) {
                      onOpenMessageSupport(`Inquiry regarding ${plan.title} capital deployment and yield schedule`);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all text-center"
                >
                  Consult Syndicate Director
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive Yield Calculator */}
        <div className="p-5 rounded-xl bg-[#050A14] border border-[#1A2A4A]">
          <h4 className="text-sm font-bold text-white mb-2">
            Syndicate Yield Simulator &mdash; {currentPlan.title}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-xs text-[#AAB7CC] block mb-1">
                Allocated Capital: <span className="text-white font-mono font-bold">${calcAmount.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min={currentPlan.minCapital}
                max={currentPlan.maxCapital}
                step={500}
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full accent-[#00F0FF]"
              />
            </div>

            <div className="text-center p-3 rounded-lg bg-[#0A152A] border border-[#1A2A4A]">
              <span className="text-[10px] text-[#AAB7CC] uppercase block">Projected Yield</span>
              <span className="text-xl font-bold font-mono text-[#00F0FF]">
                +${projectedInterestUSD.toLocaleString()}
              </span>
            </div>

            <div className="text-center p-3 rounded-lg bg-[#0A152A] border border-[#1A2A4A]">
              <span className="text-[10px] text-[#AAB7CC] uppercase block">Total Value at Term</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                ${totalReturnUSD.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strict Compliance & Risk Disclaimer */}
      <div className="p-4 rounded-xl bg-[#0A152A]/60 border border-[#1A2A4A] flex items-start gap-3 text-xs text-[#AAB7CC] leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Regulatory Disclosures & Disclaimers: </strong>
          {TSLA_FINANCIAL_METRICS.disclaimer} All public equity trading in TSLA occurs exclusively through licensed, registered FINRA/SIPC brokerages and global stock exchanges. Historical metrics are derived from Form 10-K and 10-Q SEC filings.
        </div>
      </div>
    </section>
  );
};
