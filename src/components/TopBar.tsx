import React, { useState } from 'react';
import { Volume2, VolumeX, BarChart3, HelpCircle, History, Sparkles, Sliders } from 'lucide-react';
import { soundManager } from '../engine/audio';

interface TopBarProps {
  balance: number;
  sessionProfitLoss: number;
  onOpenPaytable: () => void;
  onOpenDiagnostics: () => void;
  onOpenHistory: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  balance,
  sessionProfitLoss,
  onOpenPaytable,
  onOpenDiagnostics,
  onOpenHistory,
  reducedMotion,
  onToggleReducedMotion,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(soundManager.getVolume());

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    soundManager.playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundManager.setVolume(val);
  };

  return (
    <header className="relative w-full z-20 px-3 sm:px-6 py-2.5 glass-panel border-b border-white/10 flex items-center justify-between gap-3">
      {/* Title & Branding */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-[0_0_15px_rgba(56,189,248,0.4)]">
          <div className="w-full h-full bg-gray-950 rounded-[7px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-tech text-sm sm:text-base font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-300 to-fuchsia-400">
              NEURAL JACKPOT
            </span>
            <span className="text-[10px] uppercase font-tech px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 hidden sm:inline-block">
              2049 AI WARS
            </span>
          </div>
          <div className="text-[10px] text-gray-400 hidden sm:block">
            Simulated Gaming Substrate • 20 Paylines • 94% RTP
          </div>
        </div>
      </div>

      {/* Financial Counters Display */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Available Credits */}
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-tech">Virtual Balance</div>
          <div className="text-base sm:text-xl font-bold font-mono-num text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            ${balance.toLocaleString()}
          </div>
        </div>

        {/* Session Net Profit/Loss */}
        <div className="text-right hidden sm:block">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-tech">Session Net</div>
          <div
            className={`text-sm sm:text-base font-bold font-mono-num ${
              sessionProfitLoss > 0
                ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                : sessionProfitLoss < 0
                ? 'text-rose-400'
                : 'text-gray-400'
            }`}
          >
            {sessionProfitLoss >= 0 ? '+' : ''}${sessionProfitLoss.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Utility Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenPaytable}
          title="Paytable & Game Rules"
          className="p-2 rounded-lg glass-button text-gray-300 hover:text-white"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenDiagnostics}
          title="RTP Diagnostics & Monte Carlo Simulation"
          className="p-2 rounded-lg glass-button text-gray-300 hover:text-cyan-400"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenHistory}
          title="Spin History Ledger"
          className="p-2 rounded-lg glass-button text-gray-300 hover:text-white"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className={`p-2 rounded-lg glass-button ${isMuted ? 'text-rose-400' : 'text-cyan-400'}`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          title="Game Settings"
          className="p-2 rounded-lg glass-button text-gray-300 hover:text-white"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Flyout */}
      {showSettings && (
        <div className="absolute right-4 top-14 w-64 glass-panel-glow p-4 rounded-xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="text-xs uppercase font-tech text-cyan-400 font-bold mb-3 pb-2 border-b border-white/10 flex justify-between items-center">
            <span>Machine Parameters</span>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Audio Volume */}
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Sound Synthesizer</span>
                <span className="font-mono-num">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Reduced Motion Accessibility */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-gray-300">Reduced Motion</span>
              <button
                onClick={onToggleReducedMotion}
                className={`px-2.5 py-1 rounded text-[11px] font-tech font-bold transition-colors ${
                  reducedMotion
                    ? 'bg-cyan-500 text-black'
                    : 'bg-gray-800 text-gray-400 border border-white/10'
                }`}
              >
                {reducedMotion ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
