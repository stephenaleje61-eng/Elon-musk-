import React, { useState } from 'react';
import {
  X,
  Crown,
  Bot,
  Trash2,
  Send,
  Database,
  CheckCircle2,
  ShieldAlert,
  Settings,
  Radio,
} from 'lucide-react';
import { AdminSettings } from '../types/chat';

interface ChatAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (newSettings: AdminSettings) => void;
  onBroadcastCustomElon: (message: string) => void;
  onClearChannel: () => void;
  isFirebaseActive: boolean;
  onSaveFirebaseConfig: (apiKey: string, projectId: string) => void;
}

export const ChatAdminModal: React.FC<ChatAdminModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onUpdateAdminSettings,
  onBroadcastCustomElon,
  onClearChannel,
  isFirebaseActive,
  onSaveFirebaseConfig,
}) => {
  const [customElonMsg, setCustomElonMsg] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [projectIdInput, setProjectIdInput] = useState('');
  const [savedFirebaseStatus, setSavedFirebaseStatus] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customElonMsg.trim()) return;
    onBroadcastCustomElon(customElonMsg.trim());
    setCustomElonMsg('');
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim() && projectIdInput.trim()) {
      onSaveFirebaseConfig(apiKeyInput.trim(), projectIdInput.trim());
      setSavedFirebaseStatus(true);
      setTimeout(() => setSavedFirebaseStatus(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Crown className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Owner &amp; Admin Command Center</h2>
            <p className="text-xs text-neutral-400 font-mono">Control Elon AI replies, chat channels &amp; broadcast</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Card 1: Elon AI Toggle */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-sky-400" />
                <span>Elon AI Auto-Replies</span>
              </span>
              <button
                onClick={() =>
                  onUpdateAdminSettings({
                    ...adminSettings,
                    elonAiEnabled: !adminSettings.elonAiEnabled,
                  })
                }
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors ${
                  adminSettings.elonAiEnabled
                    ? 'bg-emerald-500 text-black'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {adminSettings.elonAiEnabled ? 'ENABLED' : 'PAUSED'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              When enabled, Elon AI automatically answers questions about Mars, Starship, Tesla, and Austin every 2nd visitor message.
            </p>
          </div>

          {/* Card 2: Owner Identity */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs font-bold text-white block mb-2">
              Owner Badge Location
            </span>
            <div className="space-y-2">
              <input
                type="text"
                value={adminSettings.ownerCity}
                onChange={(e) =>
                  onUpdateAdminSettings({
                    ...adminSettings,
                    ownerCity: e.target.value,
                  })
                }
                placeholder="e.g. Austin, TX or Starbase, TX"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-neutral-500 font-mono block">
                Your messages will show with the Gold &ldquo;ADMIN &bull; {adminSettings.ownerCity}&rdquo; badge.
              </span>
            </div>
          </div>
        </div>

        {/* Broadcast as Elon Musk */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 mb-6">
          <span className="text-xs font-bold text-white block mb-1 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-rose-500" />
            <span>Transmit Announcement as Elon Musk</span>
          </span>
          <p className="text-[11px] text-neutral-400 mb-3">
            Post an official verified message directly into the current room with the white &amp; red Tesla badge.
          </p>

          <form onSubmit={handleBroadcast} className="flex gap-2">
            <input
              type="text"
              value={customElonMsg}
              onChange={(e) => setCustomElonMsg(e.target.value)}
              placeholder="e.g. Starship Flight 12 FAA approval received! Launching in 48 hours."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
            />
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors shrink-0"
            >
              Post as Elon
            </button>
          </form>
        </div>

        {/* Firebase Config Setup matching user prompt instructions */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Firebase Firestore Configuration</span>
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isFirebaseActive
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              {isFirebaseActive ? 'Connected' : 'Local Fast Mode Active'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 mb-3">
            Add your Firebase Project ID and API Key from your Firebase console to enable cloud persistent sync across devices.
          </p>

          <form onSubmit={handleSaveFirebase} className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={projectIdInput}
                onChange={(e) => setProjectIdInput(e.target.value)}
                placeholder="Firebase Project ID"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Firebase API Key (AIzaSy...)"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-neutral-500 font-mono">
                Or configure directly in .env: VITE_FIREBASE_API_KEY
              </span>
              <button
                type="submit"
                className="py-1 px-3 bg-neutral-800 text-white rounded-lg text-xs font-medium hover:bg-neutral-700"
              >
                Save Firebase Keys
              </button>
            </div>
            {savedFirebaseStatus && (
              <p className="text-xs text-emerald-400 font-mono pt-1">
                &check; Firebase credentials saved! Refreshing connection...
              </p>
            )}
          </form>
        </div>

        {/* Emergency Channel Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs">
          <button
            onClick={() => {
              if (confirm('Clear all messages in this room?')) {
                onClearChannel();
              }
            }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-mono transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Current Channel Messages</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
