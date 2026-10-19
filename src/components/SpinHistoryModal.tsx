import React from 'react';
import { X, History, TrendingUp, TrendingDown } from 'lucide-react';
import { SpinResult } from '../types/game';
import { soundManager } from '../engine/audio';

interface SpinHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SpinResult[];
}

export const SpinHistoryModal: React.FC<SpinHistoryModalProps> = ({ isOpen, onClose, history }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-glow rounded-3xl p-5 sm:p-7 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-base font-bold text-white uppercase tracking-wider">
                Spin History Ledger
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">Recent Neural Executions</p>
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

        {/* Ledger List */}
        <div className="overflow-y-auto pr-1 my-3 space-y-2">
          {history.length === 0 ? (
            <div className="py-12 text-center text-gray-500 font-tech text-xs uppercase">
              No spin activity recorded in current session.
            </div>
          ) : (
            history.map((spin, idx) => {
              const net = spin.totalWin - spin.bet;
              const isProfit = net > 0;
              const isZero = net === 0;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between font-mono-num text-xs hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 font-tech text-[10px]">
                      #{history.length - idx}
                    </div>
                    <div>
                      <div className="text-gray-300 font-bold">
                        Bet: ${spin.bet.toLocaleString()}
                        <span className="text-[10px] text-gray-500 ml-1.5 font-normal">
                          (${spin.denomination} × {spin.multiplier}x × 20)
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(spin.timestamp).toLocaleTimeString()} •{' '}
                        {spin.winningPaylines.length > 0
                          ? `${spin.winningPaylines.length} payline(s) hit`
                          : 'No match'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold text-sm ${spin.totalWin > 0 ? 'text-amber-300' : 'text-gray-500'}`}>
                      ${spin.totalWin.toLocaleString()}
                    </div>
                    <div
                      className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                        isProfit ? 'text-emerald-400' : isZero ? 'text-gray-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? <TrendingUp className="w-3 h-3" /> : !isZero ? <TrendingDown className="w-3 h-3" /> : null}
                      <span>{net >= 0 ? '+' : ''}${net.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
