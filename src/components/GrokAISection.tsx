import React, { useState } from 'react';
import { Send, Sparkles, AlertTriangle, Cpu, Radio, Eye, Bot, ExternalLink, Check } from 'lucide-react';
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
      text: 'Explain investment like Wukari man',
    },
    {
      sender: 'grok',
      text: 'Investing na like planting yam o, you no just drop am and expect fruit next day. You buy good stock (e.g. Tesla, land, or farmland), give am time, make e grow. No be 2 days, na long game. But if you choose the right thing, e go pay you well! — Grok 😎',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('x-premium');

  const presetQuestions = [
    'Explain investment like Wukari man',
    'How does Starship heat shield survive reentry?',
    'When will Tesla Optimus start mass assembly in Austin?',
    'What is the Expral Investment Plan return breakdown?',
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
      const replyText = data.reply || 'Grok is processing multiplanetary equations right now. Please try again.';
      setMessages((prev) => [...prev, { sender: 'grok', text: replyText }]);
    } catch (err) {
      // Graceful fallback
      setMessages((prev) => [
        ...prev,
        {
          sender: 'grok',
          text: 'Investing and technology are long-term games. Keep patience and focus on core infrastructure! — Grok',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="mb-8 text-left">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          xAI &mdash; Grok 4 <span className="text-neutral-500 font-light">&mdash; Most Powerful, Most Funny AI</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Grok Chatbox */}
        <div className="lg:col-span-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800 p-5 shadow-2xl flex flex-col h-[520px]">
          {/* Grok Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs">
                xI
              </div>
              <span className="text-white font-semibold tracking-wide">Grok 4.0 Omni</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Memphis Colossus Online</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 text-[11px] no-scrollbar">
            {presetQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 my-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-neutral-800 text-white rounded-br-sm'
                      : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 py-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Grok is synthesizing answer...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="pt-3 border-t border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Grok anything..."
              className="flex-1 bg-neutral-900/80 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-40 transition-colors shrink-0"
              aria-label="Send message to Grok"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Capabilities & Tiers matching screenshot */}
        <div className="lg:col-span-6 space-y-4">
          {/* 3 High-Tech Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800 flex items-start gap-3">
              <Eye className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">Grok Voice + Vision</h4>
                <p className="text-[11px] text-neutral-400">See, hear, and interact with the physical world in real-time.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0e0e0e] border border-neutral-800 flex items-start gap-3">
              <Cpu className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white mb-0.5">$40B in Compute</h4>
                <p className="text-[11px] text-neutral-400">Scaling Memphis cluster to 1M H100/H200 and Blackwell GPUs.</p>
              </div>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#0e0e0e] border border-neutral-800 flex items-center gap-3">
              <Radio className="w-4 h-4 text-sky-400 shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-white mr-2">Real-time X Data:</span>
                <span className="text-[11px] text-neutral-400">Live news, global trends, breaking geopolitical sentiment without latency.</span>
              </div>
            </div>
          </div>

          {/* Pricing Tiers matching screenshot */}
          <div className="grid grid-cols-3 gap-3">
            {GROK_TIERS.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left flex flex-col justify-between ${
                  selectedTier === tier.id
                    ? 'bg-neutral-900 border-white text-white shadow-lg'
                    : 'bg-[#0c0c0c] border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold mb-0.5">{tier.name}</h4>
                  <p className="text-[10px] text-neutral-400 mb-2 truncate">{tier.description}</p>
                </div>
                <div>
                  <div className="text-base font-bold font-mono">
                    ${tier.priceMonthly}
                    <span className="text-[10px] font-normal text-neutral-400">/mo</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const target = GROK_TIERS.find((t) => t.id === selectedTier) || GROK_TIERS[1];
                onSubscribeTier(target);
              }}
              className="py-2.5 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-sm text-center"
            >
              Try Grok Now
            </button>
            <a
              href="https://x.ai/api"
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>API Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>
          </div>

          {/* Warning Banner matching screenshot */}
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-2.5 text-left">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-300 leading-snug">
              <strong className="text-white">Grok Prediction:</strong> 200+ neoclouds will see guppy-level death &mdash; SpaceX is insulated due to Starlink recurring orbital revenue.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
