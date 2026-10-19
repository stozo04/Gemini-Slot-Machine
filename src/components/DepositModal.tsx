import React from 'react';
import { DollarSign, ShieldCheck, X } from 'lucide-react';
import { soundManager } from '../engine/audio';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => void;
}

const DEPOSIT_AMOUNTS = [100, 500, 1000, 5000];

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onDeposit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-base font-bold text-white uppercase tracking-wider">
                Deposit Virtual Credits
              </h3>
              <p className="text-[11px] text-cyan-400 font-mono">Neural Substrate Liquidity</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clear Legal Disclaimer */}
        <div className="my-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300 leading-relaxed">
            <span className="font-bold text-cyan-300">Simulated Gaming Token Only.</span> All deposits are completely fictional in-game credits. No real money, payment method, or financial transaction is ever involved.
          </div>
        </div>

        {/* Deposit Tier Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {DEPOSIT_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                soundManager.playClick(1.2);
                onDeposit(amt);
                onClose();
              }}
              className="group p-4 rounded-xl glass-button border border-white/10 hover:border-cyan-400/60 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <span className="text-[10px] uppercase font-tech text-gray-400 group-hover:text-cyan-300">
                Grant Credit
              </span>
              <span className="text-2xl font-bold font-mono-num text-white group-hover:text-cyan-300">
                +${amt.toLocaleString()}
              </span>
              <span className="text-[9px] text-gray-500 font-tech">0.00 USD</span>
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-tech text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
