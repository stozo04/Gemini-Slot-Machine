import React, { useState } from 'react';
import { X, HelpCircle, Grid as GridIcon, Award, ShieldAlert } from 'lucide-react';
import { SYMBOL_DEFINITIONS, SYMBOL_ORDER, PAYLINES } from '../engine/probability';
import { soundManager } from '../engine/audio';

interface PaytableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaytableModal: React.FC<PaytableModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'paytable' | 'paylines' | 'rules'>('paytable');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel-glow rounded-3xl p-5 sm:p-8 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.3)] max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                Paytable & Machine Specifications
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">Neural Slot Engine Standard 2049</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 my-4 shrink-0">
          <button
            onClick={() => setTab('paytable')}
            className={`px-4 py-2 rounded-xl text-xs font-tech font-bold uppercase transition-all ${
              tab === 'paytable'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d4]'
                : 'glass-button text-gray-400 hover:text-white'
            }`}
          >
            Symbol Paytable
          </button>
          <button
            onClick={() => setTab('paylines')}
            className={`px-4 py-2 rounded-xl text-xs font-tech font-bold uppercase transition-all ${
              tab === 'paylines'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d4]'
                : 'glass-button text-gray-400 hover:text-white'
            }`}
          >
            20 Payline Patterns
          </button>
          <button
            onClick={() => setTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-tech font-bold uppercase transition-all ${
              tab === 'rules'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d4]'
                : 'glass-button text-gray-400 hover:text-white'
            }`}
          >
            Game Rules
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="overflow-y-auto pr-1 space-y-4">
          {tab === 'paytable' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-400 mb-2">
                All payouts are expressed as multiples of the bet per active payline (Total Bet ÷ 20).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SYMBOL_ORDER.filter((id) => id !== 'BLANK').map((id) => {
                  const def = SYMBOL_DEFINITIONS[id];
                  return (
                    <div
                      key={id}
                      className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-4 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gray-900 border border-white/10 p-2 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <img
                          src={def.iconUrl}
                          alt={def.name}
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-tech font-bold text-sm text-white">{def.name}</span>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                            {def.company}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-2 font-mono-num text-xs">
                          <div className="bg-white/5 p-1.5 rounded-lg text-center">
                            <span className="text-[10px] block text-gray-500">3x Match</span>
                            <span className="text-cyan-300 font-bold">{def.payouts[3]}x</span>
                          </div>
                          <div className="bg-white/5 p-1.5 rounded-lg text-center">
                            <span className="text-[10px] block text-gray-500">4x Match</span>
                            <span className="text-purple-300 font-bold">{def.payouts[4]}x</span>
                          </div>
                          <div className="bg-white/5 p-1.5 rounded-lg text-center">
                            <span className="text-[10px] block text-gray-500">5x Match</span>
                            <span className="text-amber-300 font-bold">{def.payouts[5]}x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Dark glass blank tile */}
                <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-950 border border-slate-700/50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-tech text-gray-500 font-bold uppercase">Substrate</span>
                    <span className="text-[8px] text-gray-600">VOID</span>
                  </div>
                  <div>
                    <div className="font-tech font-bold text-sm text-gray-400">Neural Substrate (Blank)</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Empty dark glass tile. Highly frequent spacer; does not award line payouts.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'paylines' && (
            <div>
              <div className="text-xs text-gray-400 mb-3">
                20 Fixed Paylines evaluated from left to right across the 5 reels and 3 rows:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {PAYLINES.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex flex-col items-center gap-1.5"
                  >
                    <span className="text-[10px] font-tech text-cyan-400 font-bold">LINE {idx + 1}</span>
                    {/* 5x3 mini grid diagram */}
                    <div className="grid grid-cols-5 gap-1 p-1 bg-gray-950 rounded border border-white/5">
                      {[0, 1, 2].map((r) =>
                        [0, 1, 2, 3, 4].map((c) => {
                          const isActive = line[c] === r;
                          return (
                            <div
                              key={`${c}-${r}`}
                              className={`w-2.5 h-2.5 rounded-sm ${
                                isActive ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' : 'bg-gray-800'
                              }`}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'rules' && (
            <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-tech font-bold text-sm text-cyan-400 mb-1">Authentic 5x3 Slot Mechanics</h4>
                <p>
                  NEURAL JACKPOT is an authentic 5-reel, 3-row video slot machine with 20 fixed paylines. All 20 paylines are active on every spin. Total wager is calculated as:
                  <span className="block my-1 font-mono text-cyan-300 font-bold bg-black/40 p-2 rounded">
                    Total Bet = Denomination × Multiplier × 20 Lines
                  </span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-tech font-bold text-sm text-purple-400 mb-1">Payline Evaluation</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li>Line wins pay for 3, 4, or 5 consecutive matching symbols from leftmost reel to right.</li>
                  <li>Only the highest win per active payline is paid out.</li>
                  <li>Wins occurring simultaneously on separate paylines are added together.</li>
                  <li>Neural Substrate (Blank) tiles never pay.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-tech font-bold text-sm text-amber-400 mb-1">Provably Fair Probability</h4>
                <p>
                  The machine operates on uniform random sampling of 100-position virtual reel strips with a certified theoretical Return to Player (RTP) of approximately 94.00%. Reel stop positions are selected independently and cannot be altered by previous results or wager size.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
