import React, { useState } from 'react';
import { FUTURE_PROJECTS } from '../data/elonverseData';
import { FutureProject } from '../types';
import { ArrowUpRight, Activity, Radio, Zap, Globe, ExternalLink, X, ShieldAlert } from 'lucide-react';

export const FutureProjectsSection: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<FutureProject | null>(null);

  return (
    <section id="future" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#1A2A4A]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00F0FF] font-semibold">
            Frontier Infrastructure & Neurotechnology
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Future Projects & Communication
          </h2>
          <p className="text-sm text-[#AAB7CC] mt-1 max-w-2xl">
            Starlink Direct to Cell satellite coverage, Neuralink brain-computer telemetry, Vegas Loop high-speed tunnels, and the X global creator economy.
          </p>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FUTURE_PROJECTS.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="group relative rounded-xl bg-[#0A152A] border border-[#1A2A4A] p-5 flex flex-col justify-between hover:border-[#00F0FF]/50 transition-all cursor-pointer duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.12)]"
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#AAB7CC]">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  {project.id === 'starlink-direct-to-cell' && <Radio className="w-3.5 h-3.5 text-[#00F0FF]" />}
                  {project.id === 'neuralink' && <Activity className="w-3.5 h-3.5 text-purple-400" />}
                  {project.id === 'boring-company' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                  {project.id === 'x-platform' && <Globe className="w-3.5 h-3.5 text-sky-400" />}
                  {project.company}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#00F0FF] transition-colors leading-snug">
                {project.name}
              </h3>

              <p className="text-xs text-[#AAB7CC] leading-relaxed line-clamp-3 mb-4">
                {project.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1A2A4A] flex items-center justify-between text-xs text-[#AAB7CC]">
              <span className="truncate max-w-[180px] text-[11px] font-mono text-[#00F0FF]">
                {project.category}
              </span>
              <span className="p-1 rounded-md bg-[#050A14] border border-[#1A2A4A] group-hover:border-[#00F0FF] group-hover:text-[#00F0FF] transition-colors shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Deep Dive Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0A152A] border border-[#1A2A4A] rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 text-[#AAB7CC] hover:text-white rounded-lg hover:bg-[#050A14] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-wider block mb-1">
              {selectedProject.company} &middot; {selectedProject.category}
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">{selectedProject.name}</h3>

            <p className="text-xs text-[#AAB7CC] leading-relaxed mb-5">
              {selectedProject.description}
            </p>

            {selectedProject.id === 'starlink-direct-to-cell' && (
              <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2A4A] text-xs text-[#AAB7CC] mb-4 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                <span>
                  <strong>Carrier Verification Note:</strong> Starlink Direct to Cell works with existing, standard 4G/LTE mobile devices via wireless carrier agreements (e.g. T-Mobile, Rogers, KDDI, Optus). Rumors of an unannounced physical "Tesla Pi Phone" are internet fabrications.
                </span>
              </div>
            )}

            <div className="space-y-3 p-4 bg-[#050A14] rounded-xl border border-[#1A2A4A] text-xs mb-6">
              <div>
                <span className="text-[#AAB7CC] block text-[10px] uppercase font-mono">Current Status</span>
                <span className="text-white font-mono">{selectedProject.status}</span>
              </div>
              <div>
                <span className="text-[#AAB7CC] block text-[10px] uppercase font-mono">Deployment Location</span>
                <span className="text-white">{selectedProject.location}</span>
              </div>
              <div>
                <span className="text-[#AAB7CC] block text-[10px] uppercase font-mono">Impact & Scalability</span>
                <span className="text-white leading-relaxed">{selectedProject.impact}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1A2A4A]">
              <span className="text-xs text-[#AAB7CC]">Verified public roadmap disclosures</span>
              <a
                href={selectedProject.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-lg bg-[#00F0FF] text-[#050A14] font-bold text-xs hover:bg-[#00F0FF]/90 transition-all flex items-center gap-1.5"
              >
                <span>Official Documentation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
