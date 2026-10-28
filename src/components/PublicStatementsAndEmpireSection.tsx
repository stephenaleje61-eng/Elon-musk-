import React, { useState } from 'react';
import {
  FileText,
  Search,
  ExternalLink,
  Building2,
  TrendingUp,
  Quote,
  Layers,
  Sparkles,
  CheckCircle2,
  DollarSign,
  PieChart,
} from 'lucide-react';

interface Statement {
  id: string;
  topic: string;
  company: string;
  quote: string;
  context: string;
  source: string;
  date: string;
  link?: string;
}

const STATEMENTS: Statement[] = [
  {
    id: 'stmt-1',
    topic: 'Mars & SpaceX',
    company: 'SpaceX',
    quote: 'You want to wake up in the morning and think the future is going to be great - and that’s what being a spacefaring civilization is all about. It’s about believing in the future and thinking that the future will be better than the past.',
    context: 'Keynote address at the International Astronautical Congress on Making Life Multiplanetary.',
    source: 'IAC Keynote & SpaceX Public Broadcast',
    date: 'Public Statement',
    link: 'https://www.spacex.com/mission',
  },
  {
    id: 'stmt-2',
    topic: 'AI & Grok',
    company: 'xAI',
    quote: 'The goal of xAI is to understand the true nature of the universe. To build a maximally curious, maximally truth-seeking AI that does not lie for political correctness.',
    context: 'Launch discussion of Grok and the Colossus 100k H100 Supercluster in Memphis, Tennessee.',
    source: 'X Spaces Broadcast & xAI Announcement',
    date: 'xAI Launch',
    link: 'https://x.ai',
  },
  {
    id: 'stmt-3',
    topic: 'Tesla & Clean Energy',
    company: 'Tesla',
    quote: 'The overarching purpose of Tesla is to help expedite the move from a mine-and-burn hydrocarbon economy towards a solar electric economy, which is the primary, but not exclusive, sustainable solution.',
    context: 'Master Plan Part 1, Part 2, and Part 3 documentation on planetary energy balance.',
    source: 'Tesla Master Plan',
    date: 'Tesla Corporate Statement',
    link: 'https://www.tesla.com/blog/secret-tesla-motors-master-plan-just-between-you-and-me',
  },
  {
    id: 'stmt-4',
    topic: 'Robotics & Optimus',
    company: 'Tesla',
    quote: 'Optimus will fundamentally transform the global economy. A world where labor is optional, poverty is eliminated, and anyone can have an intelligent assistant for any physical task.',
    context: 'Tesla AI Day and Investor Day Keynote on humanoid robotics architecture.',
    source: 'Tesla AI Day Presentation',
    date: 'AI Day Keynote',
    link: 'https://www.tesla.com/AI',
  },
  {
    id: 'stmt-5',
    topic: 'Neuralink & Brain-Computer Interfaces',
    company: 'Neuralink',
    quote: 'If you have a brain-computer interface where you can solve neurological conditions and allow paralyzed individuals to operate digital devices faster than someone with functional thumbs, that changes human capability forever.',
    context: 'PRIME Study Clinical Trial updates following successful Telepathy brain implant.',
    source: 'Neuralink Public Clinical Updates',
    date: 'Clinical Update',
    link: 'https://neuralink.com',
  },
  {
    id: 'stmt-6',
    topic: 'Infrastructure & Boring Co',
    company: 'The Boring Company',
    quote: 'To solve the problem of soul-destroying traffic, roads must go 3D, which means either flying cars or tunnels. Unlike flying cars, tunnels are weatherproof, out of sight, and don’t fall on your head.',
    context: 'Vegas Loop Expansion authorization and urban transit infrastructure filings.',
    source: 'The Boring Company Overview',
    date: 'Public Briefing',
    link: 'https://www.boringcompany.com',
  },
];

const EMPIRE_HOLDINGS = [
  {
    company: 'Tesla, Inc. (NASDAQ: TSLA)',
    stake: '~13% Common Equity (+ Options)',
    valuation: 'Market Cap: ~$750B - $850B',
    role: 'Technoking & Chief Executive Officer',
    focus: 'Electric Vehicles, Energy Storage, Autonomous Full Self-Driving, Optimus Humanoid Robots',
  },
  {
    company: 'SpaceX (Space Exploration Technologies Corp.)',
    stake: '~42% Equity (~79% Voting Control)',
    valuation: 'Private Valuation: ~$210B - $250B',
    role: 'Founder, CEO & Chief Designer',
    focus: 'Starship Multiplanetary Transport, Falcon 9 Reusability, Starlink Constellation',
  },
  {
    company: 'xAI (Frontier Artificial Intelligence)',
    stake: '~50%+ Founder Equity',
    valuation: 'Series B/C Valuation: ~$45B - $50B',
    role: 'Founder & Lead Architect',
    focus: 'Grok Multimodal Models, Colossus 100k-1M GPU Supercluster, Truth-Seeking AI',
  },
  {
    company: 'X Corp. (Formerly Twitter)',
    stake: '~74% Ownership Stake',
    valuation: 'Private Entity (~$19B-$24B implied)',
    role: 'Chief Technology Officer & Executive Chairman',
    focus: 'Town Square, Creator Economy, Everything App, X Money & Tipping Protocol',
  },
  {
    company: 'Neuralink Corp.',
    stake: 'Majority Founder Controlling Stake',
    valuation: 'Private Valuation: ~$7B - $9B',
    role: 'Co-Founder & Chief Direction',
    focus: 'Implantable Brain-Computer Interfaces, Motor Cortex Restoration, Vision Restoration',
  },
  {
    company: 'The Boring Company',
    stake: 'Majority Founder Controlling Stake',
    valuation: 'Private Valuation: ~$7B',
    role: 'Founder',
    focus: 'High-Speed Underground Electric Tunnel Transit, Prufrock Next-Gen Boring Machines',
  },
];

export const PublicStatementsAndEmpireSection: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const topics = ['All', 'Mars & SpaceX', 'AI & Grok', 'Tesla & Clean Energy', 'Robotics & Optimus', 'Neuralink & Brain-Computer Interfaces', 'Infrastructure & Boring Co'];

  const filteredStatements = STATEMENTS.filter((s) => {
    const matchesTopic = selectedTopic === 'All' || s.topic === selectedTopic;
    const matchesSearch =
      s.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.context.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  return (
    <section id="statements" className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="mb-12 text-left">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[#1D9BF0] uppercase tracking-widest">
          <Building2 className="w-4 h-4" />
          <span>Research Platform &bull; Empire &amp; Disclosures</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Business Empire, Shareholdings &amp; Statements
        </h2>
        <p className="text-sm text-neutral-400 font-normal max-w-3xl">
          Explore publicly documented records, disclosed equity shareholdings, executive leadership roles, corporate mission charters, and pivotal public statements shaping tomorrow.
        </p>
      </div>

      {/* Disclosed Business Empire Holdings Grid */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider font-mono">
            <PieChart className="w-4 h-4 text-[#1D9BF0]" />
            <span>Disclosed Corporate Holdings &amp; Capital Structure</span>
          </div>
          <span className="text-xs text-neutral-500 font-mono">Documented SEC &amp; Public Filings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {EMPIRE_HOLDINGS.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800/90 hover:border-neutral-700 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-mono text-[#1D9BF0] font-semibold mb-1">
                  {item.role}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-sky-300 transition-colors">
                  {item.company}
                </h3>

                <div className="space-y-2 mb-4 text-xs font-mono">
                  <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-900 pb-1.5">
                    <span>Equity Stake:</span>
                    <span className="text-white font-semibold">{item.stake}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-900 pb-1.5">
                    <span>Valuation:</span>
                    <span className="text-emerald-400 font-semibold">{item.valuation}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  {item.focus}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-900 flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1D9BF0]" />
                <span>Verified Documentation</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Public Statements & Key Interviews Tracker */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider font-mono">
            <Quote className="w-4 h-4 text-[#1D9BF0]" />
            <span>Public Statements, Vision &amp; Interviews Tracker</span>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search statements or topics..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 pl-9 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1D9BF0] transition-colors"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedTopic === t
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Statements Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredStatements.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition-all text-left"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1D9BF0]/15 text-[#1D9BF0] border border-[#1D9BF0]/30">
                    {item.company}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500">{item.topic}</span>
                </div>

                <div className="relative pl-4 mb-4 border-l-2 border-[#1D9BF0]/60">
                  <p className="text-sm sm:text-base text-neutral-200 font-medium italic leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {item.context}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>{item.source}</span>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#1D9BF0] hover:underline"
                  >
                    <span>Read More</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
