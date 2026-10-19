import React, { useEffect } from 'react';
import { Play, DollarSign, LogOut, Zap, AlertCircle } from 'lucide-react';
import { DENOMINATIONS, MULTIPLIERS } from '../engine/probability';
import { soundManager } from '../engine/audio';

interface BottomConsoleProps {
  balance: number;
  denomination: number;
  multiplier: number;
  isSpinning: boolean;
  lastWin: number;
  onSetDenomination: (val: number) => void;
  onSetMultiplier: (val: number) => void;
  onSpin: () => void;
  onOpenDeposit: () => void;
  onOpenCashOut: () => void;
}

export const BottomConsole: React.FC<BottomConsoleProps> = ({
  balance,
  denomination,
  multiplier,
  isSpinning,
  lastWin,
  onSetDenomination,
  onSetMultiplier,
  onSpin,
  onOpenDeposit,
  onOpenCashOut,
}) => {
  const totalBet = denomination * multiplier * 20;
  const canAfford = balance >= totalBet;
  const isSpinDisabled = isSpinning || !canAfford;

  // Keyboard Space key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isSpinning && canAfford) {
        // Prevent default spacebar scrolling
        e.preventDefault();
        onSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, canAfford, onSpin]);

  return (
    <footer className="relative w-full z-20 px-3 sm:px-6 py-3 glass-panel border-t border-white/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Cashier & Session Control */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenDeposit();
            }}
            disabled={isSpinning}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/40 text-cyan-300 font-tech font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all active:scale-95 disabled:opacity-40"
          >
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span>Deposit Credits</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCashOut();
            }}
            disabled={isSpinning || balance <= 0}
            className="px-3.5 py-2 rounded-xl glass-button text-gray-300 hover:text-white font-tech text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 disabled:opacity-30"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Cash Out</span>
          </button>

          {/* Last Win display */}
          <div className="hidden lg:flex flex-col items-center px-4 py-1.5 rounded-xl bg-black/40 border border-white/5 min-w-[110px]">
            <span className="text-[10px] uppercase font-tech text-gray-400 tracking-wider">Last Win</span>
            <span className={`text-base font-bold font-mono-num ${lastWin > 0 ? 'text-amber-300 animate-pulse' : 'text-gray-500'}`}>
              ${lastWin.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center: Wager Selectors */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          
          {/* Denomination Selector */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-tech text-gray-400 tracking-wider mb-1">
              Denomination
            </span>
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
              {DENOMINATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    soundManager.playClick(0.9 + d * 0.05);
                    onSetDenomination(d);
                  }}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 rounded-lg text-xs font-tech font-bold transition-all ${
                    denomination === d
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_10px_#06b6d4]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ${d}
                </button>
              ))}
            </div>
          </div>

          {/* Bet Multiplier Selector */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-tech text-gray-400 tracking-wider mb-1">
              Multiplier (20 Lines)
            </span>
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
              {MULTIPLIERS.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    soundManager.playClick(1.0 + m * 0.05);
                    onSetMultiplier(m);
                  }}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 rounded-lg text-xs font-tech font-bold transition-all ${
                    multiplier === m
                      ? m === 10
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_12px_#a855f7]'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_10px_#06b6d4]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {m === 10 ? 'MAX 10x' : `${m}x`}
                </button>
              ))}
            </div>
          </div>

          {/* Total Bet Display */}
          <div className="flex flex-col items-center bg-black/60 px-4 py-1.5 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <span className="text-[10px] uppercase font-tech text-cyan-400 tracking-wider">
              Total Wager
            </span>
            <span className="text-lg font-bold font-mono-num text-white">
              ${totalBet.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Side: Physically Modeled SPIN Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {!canAfford && !isSpinning && (
            <div className="flex items-center gap-1 text-xs text-amber-400 font-tech">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Insufficient balance</span>
            </div>
          )}

          <button
            onClick={() => {
              if (!isSpinDisabled) {
                onSpin();
              }
            }}
            disabled={isSpinDisabled}
            title={canAfford ? 'Press to Spin (or Spacebar)' : 'Deposit credits to spin'}
            className={`relative group px-8 sm:px-10 py-3 rounded-2xl font-tech text-base font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
              isSpinDisabled
                ? 'bg-gray-800/60 text-gray-500 border border-white/5 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white border border-cyan-300/60 shadow-[0_0_25px_rgba(6,182,212,0.6)] spin-btn-glow active:scale-95'
            }`}
          >
            {isSpinning ? (
              <>
                <Zap className="w-5 h-5 text-cyan-300 animate-spin" />
                <span>Spinning...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current text-cyan-200" />
                <span>SPIN</span>
                <span className="text-[10px] opacity-70 border border-white/30 px-1 rounded ml-1 font-mono hidden sm:inline">
                  SPACE
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </footer>
  );
};
