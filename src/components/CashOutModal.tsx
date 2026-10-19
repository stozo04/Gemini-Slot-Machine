import React, { useState } from 'react';
import { LogOut, CheckCircle2, Receipt, ArrowRight, Sparkles, X } from 'lucide-react';
import { soundManager } from '../engine/audio';

interface CashOutModalProps {
  isOpen: boolean;
  finalBalance: number;
  totalSpins: number;
  totalWon: number;
  netProfit: number;
  onConfirmCashOut: () => void;
  onCancel: () => void;
}

export const CashOutModal: React.FC<CashOutModalProps> = ({
  isOpen,
  finalBalance,
  totalSpins,
  totalWon,
  netProfit,
  onConfirmCashOut,
  onCancel,
}) => {
  const [transferring, setTransferring] = useState(false);
  const [transferred, setTransferred] = useState(false);

  if (!isOpen) return null;

  const handleTransfer = () => {
    soundManager.playCashOut();
    setTransferring(true);
    setTimeout(() => {
      setTransferring(false);
      setTransferred(true);
    }, 1400);
  };

  const handleFinalClose = () => {
    soundManager.playClick();
    onConfirmCashOut();
    setTransferred(false);
  };

  const receiptId = `TXN-2049-${Math.floor(Math.random() * 899999 + 100000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-lg font-bold text-white uppercase tracking-wider">
                Holographic Cash Out Settlement
              </h3>
              <p className="text-[11px] text-purple-400 font-mono">Terminal Session Closeout</p>
            </div>
          </div>
          {!transferred && !transferring && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Futuristic Receipt Body */}
        <div className="relative bg-black/60 rounded-2xl p-5 border border-white/10 font-mono-num mb-6 overflow-hidden">
          {/* Holographic shimmer banner */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />
          
          <div className="flex justify-between items-center text-xs text-gray-400 border-b border-white/5 pb-3 mb-3">
            <span>RECEIPT ID: {receiptId}</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>

          <div className="space-y-2.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Spins Settled:</span>
              <span className="font-bold text-white">{totalSpins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Payouts Won:</span>
              <span className="font-bold text-cyan-300">${totalWon.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Session Net Profit:</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
              </span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm">
              <span className="font-tech uppercase tracking-wider text-purple-300 font-bold">
                Final Virtual Balance:
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                ${finalBalance.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-white/10 text-[10px] text-gray-500 text-center font-tech uppercase">
            Simulated session archival complete • No real funds transferred
          </div>
        </div>

        {/* State Views */}
        {!transferred ? (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onCancel}
              disabled={transferring}
              className="px-5 py-2.5 rounded-xl glass-button text-xs font-tech text-gray-400 hover:text-white uppercase"
            >
              Cancel & Return
            </button>

            <button
              onClick={handleTransfer}
              disabled={transferring}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all"
            >
              {transferring ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Transferring Quantum Balance...</span>
                </>
              ) : (
                <>
                  <span>Transfer & Reset Balance</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-2 animate-in zoom-in-95">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-tech text-base font-bold text-white uppercase mb-1">
              Holographic Transfer Completed
            </h4>
            <p className="text-xs text-gray-400 mb-5">
              Virtual credits deposited into archival ledger. Available machine credits have been reset to zero.
            </p>
            <button
              onClick={handleFinalClose}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-tech font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Start Fresh Session
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
