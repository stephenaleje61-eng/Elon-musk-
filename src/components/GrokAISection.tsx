import React, { useState } from 'react';
import { Send, Cpu, Bot, Check, Sparkles, Terminal } from 'lucide-react';
import { GROK_TIERS } from '../data/elonverseData';
import { GrokTier } from '../types';

interface GrokAISectionProps {
  onSubscribeTier: (tier: GrokTier) => void;
}

interface ChatMessage {
  sender: 'user' | 'grok';
  text: string;
}

export const GrokAISection: React.FC<GrokAISectionProps> = ({ onSubscribeTier }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'user',
      text: 'How does the Memphis Colossus cluster train Grok?',
    },
    {
      sender: 'grok',
      text: 'Memphis Colossus harnesses 100,000 liquid-cooled Nvidia H100/H200 GPUs interconnected with RDMA over converged Ethernet. This allows us to train frontier multimodal models with massive context windows and real-time truth-seeking reasoning.',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscribedTierId, setSubscribedTierId] = useState<string | null>(null);

  const presetQuestions = [
    'How does the Memphis Colossus cluster train Grok?',
    'Explain the physics of Starship orbital propellant transfer',
    'What are the mechanical DOFs of the Optimus Gen 2 hands?',
    'How does Starlink Direct to Cell eliminate dead zones?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      const replyText = data.reply || 'Grok is synthesizing multiplanetary telemetry right now. Please try again in a moment.';
      setMessages((prev) => [...prev, { sender: 'grok', text: replyText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'grok',
          text: 'Grok 2 is calibrated for maximal truth-seeking and minimal bias. First principles engineering is the ultimate north star.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (tier: GrokTier) => {
    onSubscribeTier(tier);
    setSubscribedTierId(tier.id);
    setTimeout(() => setSubscribedTierId(null), 3000);
  };

  return (
    <section id="ai" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Frontier Artificial Intelligence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            xAI &mdash; Grok Intelligence
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            Maximum truth-seeking AI built by xAI. Powered by the world’s largest GPU supercomputer cluster in Memphis, Tennessee.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 text-xs text-[#AAB7CC]">
          <span>100k H100 Supercluster</span>
          <span>·</span>
          <span className="text-[#00F0FF]">Uncensored Truth-Seeking</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Grok Terminal */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A2A4A] mb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#00F0FF]" />
              <span className="text-sm font-bold text-white">Grok 2 Live Neural Interface</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              COLOSSUS CLUSTER: ONLINE
            </span>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[#050A14] text-[#AAB7CC] hover:text-[#00F0FF] border border-[#1A2A4A] hover:border-[#00F0FF]/40 transition-colors truncate max-w-full text-left"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${
                  m.sender === 'user'
                    ? 'ml-auto bg-[#00F0FF]/15 text-white border border-[#00F0FF]/30'
                    : 'mr-auto bg-[#050A14] text-[#AAB7CC] border border-[#1A2A4A]'
                }`}
              >
                <span className="text-[10px] font-mono block mb-1 font-semibold text-[#00F0FF]">
                  {m.sender === 'user' ? 'YOU' : 'GROK (xAI)'}
                </span>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-xl bg-[#050A14] border border-[#1A2A4A] text-xs text-[#00F0FF] animate-pulse">
                Grok is reasoning through 100k GPU nodes...
              </div>
            )}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 pt-3 border-t border-[#1A2A4A] mt-2"
          >
            <input
              type="text"
              placeholder="Ask Grok about physics, rockets, code, or reality..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-xs text-white placeholder-[#AAB7CC]/60 focus:outline-none focus:border-[#00F0FF]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="py-2 px-4 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Tiers & Subscriptions */}
        <div className="lg:col-span-5 space-y-4">
          {GROK_TIERS.map((tier) => {
            const isSubscribed = subscribedTierId === tier.id;

            return (
              <div
                key={tier.id}
                className={`p-5 rounded-2xl bg-[#0A152A] border transition-all ${
                  tier.isPopular
                    ? 'border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                    : 'border-[#1A2A4A] hover:border-[#1A2A4A]/80'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-base font-bold text-white">{tier.name}</h4>
                    <p className="text-xs text-[#AAB7CC] mt-0.5">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-white">
                      ${tier.priceMonthly}
                    </span>
                    <span className="text-[10px] text-[#AAB7CC] block">/ month</span>
                  </div>
                </div>

                <ul className="space-y-1.5 my-4 text-xs text-[#AAB7CC]">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(tier)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                    isSubscribed
                      ? 'bg-emerald-500 text-white'
                      : tier.isPopular
                      ? 'bg-[#00F0FF] text-[#050A14] hover:bg-[#00F0FF]/90 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : 'bg-[#050A14] border border-[#1A2A4A] text-white hover:border-[#00F0FF]'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Subscribed to {tier.name}</span>
                    </>
                  ) : (
                    <span>
                      {tier.priceMonthly === 0 ? 'Start Free Access' : `Subscribe (${tier.priceMonthly}/mo)`}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
