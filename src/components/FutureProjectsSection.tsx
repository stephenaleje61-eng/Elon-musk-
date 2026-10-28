import React, { useState } from 'react';
import { FUTURE_PROJECTS } from '../data/elonverseData';
import { FutureProject } from '../types';
import { ArrowUpRight, Play, X, ExternalLink, Activity, Network, Zap } from 'lucide-react';

export const FutureProjectsSection: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<FutureProject | null>(null);

  return (
    <section id="future" className="py-16 px-4 max-w-7xl mx-auto scroll-mt-20">
      <div className="mb-8 text-left">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
          Future Projects
        </h2>
        <p className="text-sm text-neutral-400 font-normal">
          Revolutionizing tunneling infrastructure, bio-cybernetics, and planet-scale supercomputing.
        </p>
      </div>

      {/* 3 Project Cards matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FUTURE_PROJECTS.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="group relative rounded-xl bg-[#0e0e0e] border border-neutral-800 p-5 flex flex-col justify-between hover:border-neutral-600 transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-mono text-neutral-400">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  {project.id === 'neuralink' && <Activity className="w-3.5 h-3.5 text-purple-400" />}
                  {project.id === 'boring-company' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                  {project.id === 'xai-supercluster' && <Network className="w-3.5 h-3.5 text-sky-400" />}
                  {project.company}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{project.category}</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neutral-100 transition-colors">
                {project.name}
              </h3>

              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                {project.description}
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-900 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="truncate max-w-[200px]">{project.status}</span>
              <span className="p-1.5 rounded-full bg-neutral-900 group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Deep Dive Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block mb-1">
              {selectedProject.company} &middot; {selectedProject.category}
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">{selectedProject.name}</h3>

            <p className="text-xs text-neutral-300 leading-relaxed mb-5">
              {selectedProject.description}
            </p>

            <div className="space-y-3 p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs mb-6">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Current Status</span>
                <span className="text-emerald-400 font-semibold">{selectedProject.status}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Location &amp; Footprint</span>
                <span className="text-white">{selectedProject.location}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-mono">Real-World Impact</span>
                <span className="text-neutral-300">{selectedProject.impact}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800">
              <a
                href={selectedProject.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
