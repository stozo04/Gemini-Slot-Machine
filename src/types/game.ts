export type SymbolId = 'BLANK' | 'GROK' | 'CHATGPT' | 'MUSE' | 'ANTHROPIC' | 'GEMINI';

export interface SymbolDef {
  id: SymbolId;
  name: string;
  company: string;
  iconUrl: string;
  color: string;
  glowColor: string;
  weight: number; // Base strip frequency
  payouts: {
    2?: number; // per line multiplier if applicable
    3: number;
    4: number;
    5: number;
  };
}

export type Grid = SymbolId[][]; // 5 columns (reels) x 3 rows

export interface PaylineWin {
  paylineIndex: number;
  symbolId: SymbolId;
  matchCount: number;
  multiplier: number;
  payout: number;
  positions: { col: number; row: number }[];
}

export interface SpinResult {
  reelStops: number[]; // Index on reel strip for reel 0..4
  grid: Grid; // [col][row]
  winningPaylines: PaylineWin[];
  totalWin: number;
  timestamp: number;
  bet: number;
  denomination: number;
  multiplier: number;
}

export type GameState = 
  | 'IDLE' 
  | 'BET_PLACED' 
  | 'SPINNING' 
  | 'EVALUATING' 
  | 'PAYOUT' 
  | 'CASHED_OUT';

export interface SessionStats {
  startingBalance: number;
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  hitCount: number;
  symbolHits: Record<SymbolId, number>;
}
