import React, { useState } from 'react';
import { OPTIMUS_DATA } from '../data/elonverseData';
import { Play, Check, Heart, Shield, Cpu, Bot, ShoppingCart, Info, X } from 'lucide-react';

interface OptimusAndXSectionProps {
  onJoinWaitlist: () => void;
  onAddToCart?: (item: { id: string; title: string; price: number; image: string; category: string }) => void;
  onSubscribeX?: () => void;
}

export const OptimusAndXSection: React.FC<OptimusAndXSectionProps> = ({
  onJoinWaitlist,
  onAddToCart,
}) => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(OPTIMUS_DATA.waitlistCount);
  const [selectedDemoModal, setSelectedDemoModal] = useState<(typeof OPTIMUS_DATA.videoDemos)[0] | null>(null);

  const handleWaitlistClick = () => {
    if (!waitlistJoined) {
      setWaitlistJoined(true);
      setWaitlistCount((prev) => prev + 1);
      onJoinWaitlist();
    }
  };

  const currentDemo = OPTIMUS_DATA.videoDemos[activeDemo];

  return (
    <section id="robots" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Autonomous Humanoid Robotics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Tesla Optimus Gen 2
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            General purpose, bi-pedal humanoid robot capable of performing tasks that are unsafe, repetitive, or tedious.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 text-xs text-[#AAB7CC]">
          <span>Tesla Vision HW4 End-to-End Neural Net</span>
          <span>·</span>
          <span className="text-[#00F0FF]">Austin Gigafactory Production</span>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Robot Visual & Video Demos */}
          <div className="lg:col-span-6">
            <div className="relative h-80 rounded-xl overflow-hidden bg-[#050A14] border border-[#1A2A4A] group flex items-center justify-center mb-4">
              <img
                src={currentDemo.thumbnail}
                alt={currentDemo.title}
                referrerPolicy="no-referrer"
                className="max-h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={() => setSelectedDemoModal(currentDemo)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 border border-[#00F0FF] text-[#00F0FF] flex items-center justify-center hover:scale-110 hover:bg-[#00F0FF] hover:text-[#050A14] transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <Play className="w-6 h-6 ml-1 fill-current" />
              </button>
              <div className="absolute bottom-3 left-3 right-3 p-2 rounded-lg bg-black/75 backdrop-blur-sm border border-[#1A2A4A] text-xs">
                <span className="text-white font-bold block">{currentDemo.title}</span>
                <span className="text-[#AAB7CC] text-[11px] truncate block">{currentDemo.description}</span>
              </div>
            </div>

            {/* Demos selector */}
            <div className="grid grid-cols-3 gap-2">
              {OPTIMUS_DATA.videoDemos.map((demo, idx) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(idx)}
                  className={`p-2 rounded-lg text-left text-xs transition-all border ${
                    activeDemo === idx
                      ? 'bg-[#050A14] border-[#00F0FF] text-white'
                      : 'bg-[#050A14]/60 border-[#1A2A4A] text-[#AAB7CC] hover:border-[#AAB7CC]'
                  }`}
                >
                  <span className="block truncate font-semibold">{demo.title.split(' ')[0]}</span>
                  <span className="text-[10px] text-[#AAB7CC] block truncate">Demo 0{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Specifications & Waitlist Queue */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs uppercase font-mono text-[#00F0FF]">
                  {OPTIMUS_DATA.generation}
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {OPTIMUS_DATA.priceRange}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Dexterous Manipulation & Spatial Vision
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                  <span className="text-[10px] text-[#AAB7CC] block uppercase">Height</span>
                  <span className="text-white font-mono font-bold">{OPTIMUS_DATA.height.split(' ')[0]}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                  <span className="text-[10px] text-[#AAB7CC] block uppercase">Weight</span>
                  <span className="text-white font-mono font-bold">{OPTIMUS_DATA.weight.split(' ')[0]}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                  <span className="text-[10px] text-[#AAB7CC] block uppercase">Battery</span>
                  <span className="text-white font-mono font-bold">2.3 kWh</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#050A14] border border-[#1A2A4A]">
                  <span className="text-[10px] text-[#AAB7CC] block uppercase">Hands</span>
                  <span className="text-[#00F0FF] font-mono font-bold">22 DoF</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-[#AAB7CC] mb-6">
                {OPTIMUS_DATA.capabilities.map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#050A14] border border-[#1A2A4A]">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-[#AAB7CC]">Global Priority Waitlist</span>
                <span className="text-white font-mono font-bold">
                  {waitlistCount.toLocaleString()} Enthusiasts
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleWaitlistClick}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    waitlistJoined
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#00F0FF] text-[#050A14] hover:bg-[#00F0FF]/90 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  }`}
                >
                  {waitlistJoined ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Position #{waitlistCount} Confirmed</span>
                    </>
                  ) : (
                    <span>Join Free Production Waitlist</span>
                  )}
                </button>

                {onAddToCart && (
                  <button
                    onClick={() =>
                      onAddToCart({
                        id: 'optimus-deposit',
                        title: 'Tesla Optimus Gen 2 Reservation Deposit',
                        price: 1000,
                        image: '/src/assets/images/optimus_humanoid_robot_1793126083833.jpg',
                        category: 'robots',
                      })
                    }
                    className="py-3 px-4 rounded-xl bg-[#0A152A] border border-[#1A2A4A] hover:border-white text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>$1,000 Deposit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Video Modal */}
      {selectedDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0A152A] border border-[#1A2A4A] p-6 shadow-2xl">
            <button
              onClick={() => setSelectedDemoModal(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB7CC] hover:text-white rounded-lg hover:bg-[#050A14] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase font-mono text-[#00F0FF] block mb-1">
              Optimus Gen 2 Kinematic Telemetry
            </span>
            <h3 className="text-xl font-bold text-white mb-2">{selectedDemoModal.title}</h3>
            <p className="text-xs text-[#AAB7CC] mb-4">{selectedDemoModal.description}</p>

            <div className="h-64 rounded-xl bg-[#050A14] border border-[#1A2A4A] flex items-center justify-center overflow-hidden mb-4">
              <img
                src={selectedDemoModal.thumbnail}
                alt={selectedDemoModal.title}
                className="max-h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#AAB7CC]">
              <span>Hardware: 22-DoF tactile biological-grade actuators</span>
              <button
                onClick={() => setSelectedDemoModal(null)}
                className="py-1.5 px-3 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs"
              >
                Close Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
