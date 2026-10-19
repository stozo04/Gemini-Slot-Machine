import React, { useState, useEffect, useCallback } from 'react';
import { SlotCanvas } from './components/SlotCanvas';
import { TopBar } from './components/TopBar';
import { BottomConsole } from './components/BottomConsole';
import { DepositModal } from './components/DepositModal';
import { CashOutModal } from './components/CashOutModal';
import { PaytableModal } from './components/PaytableModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { SpinHistoryModal } from './components/SpinHistoryModal';
import { WinOverlay } from './components/WinOverlay';
import {
  Grid,
  GameState,
  SpinResult,
  PaylineWin,
  SymbolId,
} from './types/game';
import { executeSpin } from './engine/probability';
import { soundManager } from './engine/audio';

// Default initial visible grid (high tech display before first spin)
const INITIAL_GRID: Grid = [
  ['BLANK', 'GROK', 'BLANK'],
  ['CHATGPT', 'GEMINI', 'CHATGPT'],
  ['BLANK', 'ANTHROPIC', 'BLANK'],
  ['MUSE', 'GROK', 'MUSE'],
  ['BLANK', 'GEMINI', 'BLANK'],
];

export function App() {
  // Wallet & betting state
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('neural_jackpot_balance');
    return saved !== null ? parseInt(saved, 10) : 1000; // Provide initial $1000 complimentary credits
  });

  const [denomination, setDenomination] = useState<number>(1);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [gameState, setGameState] = useState<GameState>('IDLE');

  // Display grid & active spin state
  const [displayGrid, setDisplayGrid] = useState<Grid>(INITIAL_GRID);
  const [activeSpinResult, setActiveSpinResult] = useState<SpinResult | null>(null);
  const [winningPaylines, setWinningPaylines] = useState<PaylineWin[]>([]);
  const [lastWin, setLastWin] = useState<number>(0);
  const [showWinOverlay, setShowWinOverlay] = useState<boolean>(false);
  const [isNeuralOverload, setIsNeuralOverload] = useState<boolean>(false);

  // Session stats & ledger
  const [sessionWagered, setSessionWagered] = useState<number>(() => {
    const s = localStorage.getItem('neural_jackpot_wagered');
    return s ? parseInt(s, 10) : 0;
  });
  const [sessionWon, setSessionWon] = useState<number>(() => {
    const s = localStorage.getItem('neural_jackpot_won');
    return s ? parseInt(s, 10) : 0;
  });
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>(() => {
    try {
      const s = localStorage.getItem('neural_jackpot_history');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [isPaytableOpen, setIsPaytableOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('neural_jackpot_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('neural_jackpot_wagered', sessionWagered.toString());
  }, [sessionWagered]);

  useEffect(() => {
    localStorage.setItem('neural_jackpot_won', sessionWon.toString());
  }, [sessionWon]);

  useEffect(() => {
    localStorage.setItem('neural_jackpot_history', JSON.stringify(spinHistory.slice(0, 50)));
  }, [spinHistory]);

  const totalBet = denomination * multiplier * 20;
  const isSpinning = gameState === 'SPINNING';

  // Handle Spin Action
  const handleSpin = useCallback(() => {
    if (isSpinning || balance < totalBet) {
      if (balance < totalBet) {
        setIsDepositOpen(true);
      }
      return;
    }

    soundManager.enableAudio();

    // 1. Deduct wager atomically
    setBalance((prev) => prev - totalBet);
    setSessionWagered((prev) => prev + totalBet);
    setShowWinOverlay(false);
    setIsNeuralOverload(false);
    setWinningPaylines([]);

    // 2. Compute mathematical outcome ahead of animation
    const result = executeSpin(denomination, multiplier);
    setActiveSpinResult(result);
    setGameState('SPINNING');
  }, [isSpinning, balance, totalBet, denomination, multiplier]);

  // Reel stopping settling callback
  const handleSpinComplete = useCallback(() => {
    if (!activeSpinResult) return;

    // Settle grid and evaluate outcomes
    setDisplayGrid(activeSpinResult.grid);
    setWinningPaylines(activeSpinResult.winningPaylines);
    setLastWin(activeSpinResult.totalWin);
    setGameState('EVALUATING');

    if (activeSpinResult.totalWin > 0) {
      // Credit payouts
      setBalance((prev) => prev + activeSpinResult.totalWin);
      setSessionWon((prev) => prev + activeSpinResult.totalWin);

      // Check for Grand Win "Neural Overload" (>= 50x bet or hit top Gemini)
      const hasGeminiWin = activeSpinResult.winningPaylines.some((w) => w.symbolId === 'GEMINI');
      const winRatio = activeSpinResult.totalWin / activeSpinResult.bet;
      const isOverload = winRatio >= 50 || hasGeminiWin;

      setIsNeuralOverload(isOverload);
      setShowWinOverlay(true);
      setGameState('PAYOUT');
    } else {
      setGameState('IDLE');
    }

    // Save to spin ledger
    setSpinHistory((prev) => [activeSpinResult, ...prev]);
  }, [activeSpinResult]);

  // Dismiss win overlay
  const handleDismissWin = () => {
    setShowWinOverlay(false);
    setIsNeuralOverload(false);
    setGameState('IDLE');
  };

  // Deposit virtual credits
  const handleDeposit = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  // Confirm cash out
  const handleConfirmCashOut = () => {
    setBalance(0);
    setIsCashOutOpen(false);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between bg-gray-950 overflow-hidden font-sans">
      
      {/* Top Status & Controls Bar */}
      <TopBar
        balance={balance}
        sessionProfitLoss={sessionWon - sessionWagered}
        onOpenPaytable={() => setIsPaytableOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
      />

      {/* Main 3D Stage */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <SlotCanvas
          isSpinning={isSpinning}
          reelStops={activeSpinResult ? activeSpinResult.reelStops : null}
          displayGrid={displayGrid}
          winningPaylines={winningPaylines}
          isNeuralOverload={isNeuralOverload}
          onSpinComplete={handleSpinComplete}
          reducedMotion={reducedMotion}
        />

        {/* Win Presentation Overlay */}
        {showWinOverlay && activeSpinResult && activeSpinResult.totalWin > 0 && (
          <WinOverlay
            totalWin={activeSpinResult.totalWin}
            bet={activeSpinResult.bet}
            winningPaylines={winningPaylines}
            isNeuralOverload={isNeuralOverload}
            onDismiss={handleDismissWin}
          />
        )}
      </main>

      {/* Bottom Physical Console */}
      <BottomConsole
        balance={balance}
        denomination={denomination}
        multiplier={multiplier}
        isSpinning={isSpinning}
        lastWin={lastWin}
        onSetDenomination={setDenomination}
        onSetMultiplier={setMultiplier}
        onSpin={handleSpin}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenCashOut={() => setIsCashOutOpen(true)}
      />

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDeposit}
      />

      <CashOutModal
        isOpen={isCashOutOpen}
        finalBalance={balance}
        totalSpins={spinHistory.length}
        totalWon={sessionWon}
        netProfit={sessionWon - sessionWagered}
        onConfirmCashOut={handleConfirmCashOut}
        onCancel={() => setIsCashOutOpen(false)}
      />

      <PaytableModal
        isOpen={isPaytableOpen}
        onClose={() => setIsPaytableOpen(false)}
      />

      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        sessionSpins={spinHistory.length}
        sessionWagered={sessionWagered}
        sessionWon={sessionWon}
      />

      <SpinHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={spinHistory}
      />

    </div>
  );
}
export default App;
