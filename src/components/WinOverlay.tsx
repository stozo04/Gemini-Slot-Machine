import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Zap, Award } from 'lucide-react';
import { PaylineWin } from '../types/game';
import { SYMBOL_DEFINITIONS } from '../engine/probability';
import { soundManager } from '../engine/audio';

interface WinOverlayProps {
  totalWin: number;
  bet: number;
  winningPaylines: PaylineWin[];
  isNeuralOverload: boolean;
  onDismiss: () => void;
}

export const WinOverlay: React.FC<WinOverlayProps> = ({
  totalWin,
  bet,
  winningPaylines,
  isNeuralOverload,
  onDismiss,
}) => {
  const [displayedAmount, setDisplayedAmount] = useState(0);

  const winRatio = bet > 0 ? totalWin / bet : 0;
  const isMegaWin = winRatio >= 25;
  const isBigWin = winRatio >= 8 && !isMegaWin;

  // Sound and confetti triggers
  useEffect(() => {
    if (totalWin <= 0) return;

    if (isNeuralOverload) {
      soundManager.playNeuralOverload();
      // Burst multicolor prismatic confetti
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#a855f7', '#ec4899', '#fbbf24', '#10b981'],
      });
    } else {
      soundManager.playWin(winRatio);
      if (isBigWin || isMegaWin) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#06b6d4', '#a855f7', '#f59e0b'],
        });
      }
    }
  }, [totalWin, isNeuralOverload, winRatio, isBigWin, isMegaWin]);

  // Smooth numeric count-up animation
  useEffect(() => {
    if (totalWin <= 0) {
      setDisplayedAmount(0);
      return;
    }

    let start = 0;
    const duration = isNeuralOverload ? 1800 : 900;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayedAmount(Math.round(totalWin * ease));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [totalWin, isNeuralOverload]);

  if (totalWin <= 0) return null;

  // Highlight primary winning AI company
  const primaryWin = winningPaylines[0];
  const primaryDef = primaryWin ? SYMBOL_DEFINITIONS[primaryWin.symbolId] : null;

  return (
    <div
      onClick={onDismiss}
      className={`fixed inset-0 z-40 pointer-events-auto flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
        isNeuralOverload ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-300">
        
        {/* Glow halo behind win badge */}
        <div
          className="absolute -inset-10 rounded-full blur-3xl opacity-60 pointer-events-none"
          style={{
            background: isNeuralOverload
              ? 'radial-gradient(circle, rgba(168,85,247,0.7) 0%, rgba(6,182,212,0.5) 50%, transparent 70%)'
              : `radial-gradient(circle, ${primaryDef?.glowColor || 'rgba(6,182,212,0.6)'} 0%, transparent 70%)`,
          }}
        />

        {/* Win Category Banner */}
        <div className="relative mb-2">
          {isNeuralOverload ? (
            <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white font-tech font-bold text-sm sm:text-base tracking-widest uppercase shadow-[0_0_35px_rgba(168,85,247,0.8)] animate-pulse flex items-center gap-2 border border-white/40">
              <Zap className="w-5 h-5 fill-current text-cyan-200" />
              <span>NEURAL OVERLOAD — GRAND JACKPOT</span>
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
          ) : isMegaWin ? (
            <div className="px-5 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-tech font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(236,72,153,0.6)] flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>MEGA QUANTUM PAYOUT</span>
            </div>
          ) : isBigWin ? (
            <div className="px-4 py-1 rounded-xl bg-cyan-500 text-black font-tech font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_#06b6d4]">
              BIG WIN
            </div>
          ) : (
            <div className="px-3.5 py-0.5 rounded-lg bg-black/70 border border-white/20 text-cyan-300 font-tech font-bold text-xs uppercase tracking-wider">
              {winningPaylines.length > 1 ? `${winningPaylines.length} PAYLINES HIT` : 'WINNER'}
            </div>
          )}
        </div>

        {/* Big Holographic Number */}
        <div className="relative text-center">
          <div className="text-4xl sm:text-6xl md:text-7xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
            +${displayedAmount.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm font-tech text-gray-300 mt-1 uppercase tracking-wider">
            {winRatio.toFixed(1)}x Total Bet Multiplier
          </div>
        </div>

        {/* AI Brand Reaction Note */}
        {primaryDef && primaryDef.id !== 'BLANK' && (
          <div className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: primaryDef.color }}
            />
            <span className="text-[11px] font-tech text-gray-200">
              <strong style={{ color: primaryDef.color }}>{primaryDef.company} {primaryDef.name}</strong> Neural Resonance Triggered
            </span>
          </div>
        )}

        <div className="mt-3 text-[10px] text-gray-400 uppercase font-tech tracking-widest opacity-70">
          Click anywhere or press Space to continue
        </div>

      </div>
    </div>
  );
};
