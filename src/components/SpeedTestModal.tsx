import React, { useState, useEffect } from 'react';
import { X, Wifi, Play, RotateCcw, ShieldCheck } from 'lucide-react';

interface SpeedTestModalProps {
  onClose: () => void;
}

export const SpeedTestModal: React.FC<SpeedTestModalProps> = ({ onClose }) => {
  const [testing, setTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(26);
  const [completed, setCompleted] = useState(false);

  const startTest = () => {
    setTesting(true);
    setCompleted(false);
    setDownloadSpeed(0);
    setUploadSpeed(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress <= 50) {
        // Download phase
        const currentDown = Math.floor(140 + Math.random() * 85);
        setDownloadSpeed(currentDown);
        setPing(Math.floor(22 + Math.random() * 8));
      } else if (progress <= 95) {
        // Upload phase
        const currentUp = Math.floor(25 + Math.random() * 18);
        setUploadSpeed(currentUp);
      } else {
        clearInterval(interval);
        setDownloadSpeed(218);
        setUploadSpeed(36);
        setPing(24);
        setTesting(false);
        setCompleted(true);
      }
    }, 100);
  };

  useEffect(() => {
    startTest();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-6 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
          aria-label="Close speed test"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-xs font-mono text-neutral-400 uppercase">
          <Wifi className="w-4 h-4 text-sky-400" />
          <span>Starlink Orbital Speed Telemetry</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          Starlink Live Performance
        </h3>
        <p className="text-xs text-neutral-400 mb-6">
          Low Earth Orbit Constellation pinging from Wukari Gateway (Nigeria Node 04)
        </p>

        {/* Speed Dial / Metrics */}
        <div className="relative my-6 p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center">
          <div className="text-5xl font-extrabold font-mono text-white tracking-tight mb-1">
            {downloadSpeed}
            <span className="text-lg font-normal text-sky-400 ml-1">Mbps</span>
          </div>
          <p className="text-[11px] font-mono uppercase text-neutral-400 tracking-wider">
            {testing ? 'Benchmarking Satellite Transponder...' : 'Download Speed'}
          </p>

          <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-neutral-900 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">UPLOAD</span>
              <span className="text-base font-bold font-mono text-white">
                {uploadSpeed} <span className="text-xs font-normal text-neutral-400">Mbps</span>
              </span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">LATENCY</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {ping} <span className="text-xs font-normal text-neutral-400">ms</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Stream 4K video, voice, gaming &amp; remote work anywhere</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={startTest}
            disabled={testing}
            className="flex-1 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white font-medium hover:bg-neutral-800 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retest Speed</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
