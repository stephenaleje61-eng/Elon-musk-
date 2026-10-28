import React, { useState } from 'react';
import { OPTIMUS_DATA } from '../data/elonverseData';
import { Play, Check, Heart, Repeat2, MessageCircle, Share, DollarSign, ExternalLink, X } from 'lucide-react';

interface OptimusAndXSectionProps {
  onJoinWaitlist: () => void;
  onSubscribeX: () => void;
}

export const OptimusAndXSection: React.FC<OptimusAndXSectionProps> = ({
  onJoinWaitlist,
  onSubscribeX,
}) => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(OPTIMUS_DATA.waitlistCount);

  // X Tweet interactive state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(195000);
  const [tippedOneDollar, setTippedOneDollar] = useState(false);

  const handleWaitlistClick = () => {
    if (!waitlistJoined) {
      setWaitlistJoined(true);
      setWaitlistCount((prev) => prev + 1);
      onJoinWaitlist();
    }
  };

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleTip = () => {
    setTippedOneDollar(true);
    setTimeout(() => setTippedOneDollar(false), 3000);
  };

  const currentDemo = OPTIMUS_DATA.videoDemos[activeDemo];

  return (
    <section id="robots" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Optimus Robot Section matching screenshot */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0a0a0a] border border-neutral-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Optimus <span className="text-sm font-normal text-neutral-400">&mdash; Your Personal Helper Robot</span>
                </h3>
                <div className="text-xs font-mono text-emerald-400 mt-0.5">
                  Gen 3 &mdash; $20k - $30k
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-400 mb-4">
              Can walk, carry 20kg, work 8 hours continuous, cook and handle precision tools.
            </p>

            {/* Media Gallery Grid matching screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {/* Main Preview with Play Button */}
              <div
                onClick={() => setIsPlayingVideo(true)}
                className="sm:col-span-2 relative h-56 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 cursor-pointer group flex items-center justify-center"
              >
                <img
                  src="/src/assets/images/optimus_humanoid_robot_1793126083833.jpg"
                  alt="Tesla Optimus humanoid robot"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-0.5 fill-black" />
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 text-left">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-300 block">
                    CURRENT DEMO
                  </span>
                  <span className="text-xs font-bold text-white drop-shadow">
                    {currentDemo.title}
                  </span>
                </div>
              </div>

              {/* Thumbnails Column matching screenshot */}
              <div className="grid grid-cols-3 sm:grid-cols-1 gap-2">
                {OPTIMUS_DATA.videoDemos.slice(0, 3).map((demo, idx) => (
                  <button
                    key={demo.id}
                    onClick={() => setActiveDemo(idx)}
                    className={`relative rounded-lg overflow-hidden border p-2 text-left transition-all ${
                      activeDemo === idx
                        ? 'border-white bg-neutral-900'
                        : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white block truncate">
                      {demo.title.split('&')[0]}
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      Autonomous execution
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Specifications Badges matching screenshot */}
            <div className="grid grid-cols-4 gap-2 text-center mb-5 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
              <div>
                <span className="text-xs font-bold font-mono text-white block">1.73m</span>
                <span className="text-[10px] text-neutral-500">Tall</span>
              </div>
              <div>
                <span className="text-xs font-bold font-mono text-white block">57kg</span>
                <span className="text-[10px] text-neutral-500">Weight</span>
              </div>
              <div>
                <span className="text-xs font-bold font-mono text-white block">2.3kWh</span>
                <span className="text-[10px] text-neutral-500">Battery</span>
              </div>
              <div>
                <span className="text-xs font-bold font-mono text-white block">Tesla AI</span>
                <span className="text-[10px] text-neutral-500">Brain</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-neutral-400 mb-3 flex items-center gap-1.5">
              <span className="text-white font-bold">{waitlistCount.toLocaleString()}+</span>
              <span>on priority global reservation waitlist</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWaitlistClick}
                className="py-2.5 px-4 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
              >
                {waitlistJoined ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Waitlist Confirmed!</span>
                  </>
                ) : (
                  <span>Join Waitlist</span>
                )}
              </button>

              <button
                onClick={() => setIsPlayingVideo(true)}
                className="py-2.5 px-4 bg-neutral-900 border border-neutral-700 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: X - Everything App & Elon Musk Tweet matching screenshot */}
        <div id="social" className="lg:col-span-5 rounded-2xl bg-[#0a0a0a] border border-neutral-800 p-6 flex flex-col justify-between scroll-mt-20">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white">X</span>
                <span className="text-xs text-neutral-400">&mdash; Everything App + $1 Tipping</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">X Premium ($8/mo):</strong> Verified blue checkmark, creator monetization, Grok 4 built directly inside the feed.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Hold Like to tip $1:</strong> X Money peer-to-peer micropayments active in the United States and expanding globally.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Long posts &amp; 4K video:</strong> Unfiltered town square for global discussions and uncensored science.
                </div>
              </div>
            </div>

            {/* Embedded Verified Tweet Card matching screenshot */}
            <div className="rounded-xl bg-neutral-950 border border-neutral-800/90 p-4 mb-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src="/src/assets/images/elon_musk_portrait_tech_1793126106617.jpg"
                    alt="Elon Musk avatar"
                    className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">Elon Musk</span>
                      <svg className="w-3.5 h-3.5 text-sky-400 fill-current" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono">@elonmusk · 2h</span>
                  </div>
                </div>
                <a
                  href="https://x.com/elonmusk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-500 hover:text-white"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-sm text-neutral-100 my-2 font-medium">
                I'm trying.
              </p>

              {/* Tweet Engagement Bar matching screenshot */}
              <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-neutral-900 mt-3">
                <button
                  onClick={() => alert('View comments on official X profile!')}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-mono">47K</span>
                </button>
                <button
                  onClick={() => alert('Retweet on official X profile!')}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span className="font-mono">32K</span>
                </button>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 transition-colors ${
                    liked ? 'text-rose-500' : 'hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                  <span className="font-mono">{(likeCount / 1000).toFixed(0)}K</span>
                </button>
                <button
                  onClick={handleTip}
                  className="flex items-center gap-1 hover:text-amber-400 text-amber-500/90 transition-colors font-mono text-[11px]"
                  title="Tip $1 with X Money test"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Tip $1</span>
                </button>
              </div>

              {tippedOneDollar && (
                <div className="mt-2 text-[11px] text-amber-400 font-mono text-center">
                  &check; Sent $1 tip demonstration to @elonmusk via X Money!
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Join X</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Optimus Video Demo Player Modal */}
      {isPlayingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsPlayingVideo(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              Optimus Gen 3 Demo &mdash; {currentDemo.title}
            </h3>
            <p className="text-xs text-neutral-400 mb-4">{currentDemo.description}</p>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border border-neutral-800 mb-5">
              <img
                src="/src/assets/images/optimus_humanoid_robot_1793126083833.jpg"
                alt="Optimus demonstration"
                className="w-full h-full object-cover filter brightness-90 animate-subtle"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-xs font-mono text-neutral-300">
                  <span className="text-emerald-400 mr-2">&#9679; AUTONOMOUS FSD NETWORK ENGAGED</span>
                  <span>Frame rate: 60fps · Zero human teleoperation</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-mono">
                Model: Optimus Gen 3 (Austin Giga 2026 Batch)
              </span>
              <button
                onClick={() => setIsPlayingVideo(false)}
                className="py-2 px-5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
