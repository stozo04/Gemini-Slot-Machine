import { SymbolDef, SymbolId, Grid, PaylineWin, SpinResult } from '../types/game';

export const SYMBOL_DEFINITIONS: Record<SymbolId, SymbolDef> = {
  BLANK: {
    id: 'BLANK',
    name: 'Neural Void',
    company: 'Quantum Substrate',
    iconUrl: '', // Dark glass tile
    color: '#64748b',
    glowColor: 'rgba(100, 116, 139, 0.3)',
    weight: 40,
    payouts: { 3: 0, 4: 0, 5: 0 },
  },
  GROK: {
    id: 'GROK',
    name: 'Grok',
    company: 'xAI',
    iconUrl: '/assets/grok-icon.webp',
    color: '#f8fafc',
    glowColor: 'rgba(255, 255, 255, 0.9)',
    weight: 25,
    payouts: { 3: 12, 4: 45, 5: 152 },
  },
  CHATGPT: {
    id: 'CHATGPT',
    name: 'ChatGPT',
    company: 'OpenAI',
    iconUrl: '/assets/chatgpt-icon.webp',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.9)',
    weight: 15,
    payouts: { 3: 35, 4: 151, 5: 605 },
  },
  MUSE: {
    id: 'MUSE',
    name: 'Muse',
    company: 'Meta AI',
    iconUrl: '/assets/meta_muse-icon.webp',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.9)',
    weight: 10,
    payouts: { 3: 90, 4: 490, 5: 2050 },
  },
  ANTHROPIC: {
    id: 'ANTHROPIC',
    name: 'Claude',
    company: 'Anthropic',
    iconUrl: '/assets/anthropic-icon.svg',
    color: '#d97706',
    glowColor: 'rgba(217, 119, 6, 0.9)',
    weight: 7,
    payouts: { 3: 240, 4: 1620, 5: 7600 },
  },
  GEMINI: {
    id: 'GEMINI',
    name: 'Gemini',
    company: 'Google DeepMind',
    iconUrl: '/assets/Google-gemini-icon.svg.webp',
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.95)',
    weight: 3,
    payouts: { 3: 1000, 4: 11000, 5: 75000 },
  },
};

export const SYMBOL_ORDER: SymbolId[] = ['BLANK', 'GROK', 'CHATGPT', 'MUSE', 'ANTHROPIC', 'GEMINI'];

// Standard 20 Paylines for 5 Reels x 3 Rows
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // 1: Center horizontal
  [0, 0, 0, 0, 0], // 2: Top horizontal
  [2, 2, 2, 2, 2], // 3: Bottom horizontal
  [0, 1, 2, 1, 0], // 4: V shape
  [2, 1, 0, 1, 2], // 5: Inverted V
  [0, 0, 1, 2, 2], // 6: Descending diagonal step
  [2, 2, 1, 0, 0], // 7: Ascending diagonal step
  [1, 2, 2, 2, 1], // 8: Low trough
  [1, 0, 0, 0, 1], // 9: High peak
  [0, 1, 0, 1, 0], // 10: Top zig-zag
  [2, 1, 2, 1, 2], // 11: Bottom zig-zag
  [1, 0, 1, 0, 1], // 12: Upper wave
  [1, 2, 1, 2, 1], // 13: Lower wave
  [0, 1, 1, 1, 0], // 14: High dome
  [2, 1, 1, 1, 2], // 15: Low bowl
  [0, 0, 1, 0, 0], // 16: Top chevron
  [2, 2, 1, 2, 2], // 17: Bottom chevron
  [1, 1, 0, 1, 1], // 18: Middle-high-middle
  [1, 1, 2, 1, 1], // 19: Middle-low-middle
  [0, 2, 0, 2, 0], // 20: Extreme alternates
];

export const DENOMINATIONS = [1, 5, 10]; // In simulated dollars
export const MULTIPLIERS = [1, 5, 10]; // 1x, 5x, MAX BET (10x)

// Deterministic PRNG for building balanced 100-item strips per reel
function createReelStrip(seed: number): SymbolId[] {
  const items: SymbolId[] = [];
  (Object.keys(SYMBOL_DEFINITIONS) as SymbolId[]).forEach((id) => {
    const count = SYMBOL_DEFINITIONS[id].weight;
    for (let i = 0; i < count; i++) {
      items.push(id);
    }
  });

  // Linear congruential generator for reproducible strip shuffle
  let s = seed;
  const nextRng = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  // Fisher-Yates shuffle
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(nextRng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

// 5 explicit reel strips, each 100 positions long
export const REEL_STRIPS: SymbolId[][] = [
  createReelStrip(1013),
  createReelStrip(2027),
  createReelStrip(3041),
  createReelStrip(4057),
  createReelStrip(5077),
];

// Theoretical Return To Player Calculation
export function calculateTheoreticalRTP(): {
  totalRTP: number;
  symbolBreakdown: Record<SymbolId, { rtp: number; hitProb: number }>;
  hitFrequency: number;
} {
  let totalRTP = 0;
  let totalHitProb = 0;
  const total = 100;
  const symbolBreakdown = {} as Record<SymbolId, { rtp: number; hitProb: number }>;

  (Object.keys(SYMBOL_DEFINITIONS) as SymbolId[]).forEach((symId) => {
    const def = SYMBOL_DEFINITIONS[symId];
    if (symId === 'BLANK') {
      symbolBreakdown[symId] = { rtp: 0, hitProb: 0 };
      return;
    }

    const p = def.weight / total;
    const p3 = Math.pow(p, 3) * (1 - p);
    const p4 = Math.pow(p, 4) * (1 - p);
    const p5 = Math.pow(p, 5);

    const rtpContribution = (p3 * def.payouts[3] + p4 * def.payouts[4] + p5 * def.payouts[5]) * 100;
    const symHitProb = (p3 + p4 + p5) * 100;

    totalRTP += rtpContribution;
    totalHitProb += symHitProb;

    symbolBreakdown[symId] = {
      rtp: rtpContribution,
      hitProb: symHitProb,
    };
  });

  return {
    totalRTP,
    symbolBreakdown,
    hitFrequency: totalHitProb,
  };
}

// Uniform random sampler using crypto.getRandomValues
export function getRandomInt(max: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export function sampleReelStops(): number[] {
  return [
    getRandomInt(REEL_STRIPS[0].length),
    getRandomInt(REEL_STRIPS[1].length),
    getRandomInt(REEL_STRIPS[2].length),
    getRandomInt(REEL_STRIPS[3].length),
    getRandomInt(REEL_STRIPS[4].length),
  ];
}

// Extract 5x3 visible grid given reel stop indices
export function getGridFromStops(stops: number[]): Grid {
  const grid: Grid = [];
  for (let col = 0; col < 5; col++) {
    const strip = REEL_STRIPS[col];
    const len = strip.length;
    const stop = stops[col];
    grid.push([
      strip[(stop) % len],
      strip[(stop + 1) % len],
      strip[(stop + 2) % len],
    ]);
  }
  return grid;
}

// Evaluate paylines left to right for 3, 4, 5 of a kind
export function evaluatePaylines(grid: Grid, betPerLine: number): PaylineWin[] {
  const wins: PaylineWin[] = [];

  PAYLINES.forEach((payline, paylineIndex) => {
    // Get symbols across the 5 reels according to this payline pattern
    const symbolsOnLine: SymbolId[] = [];
    const positions: { col: number; row: number }[] = [];

    for (let col = 0; col < 5; col++) {
      const row = payline[col];
      symbolsOnLine.push(grid[col][row]);
      positions.push({ col, row });
    }

    const firstSymbol = symbolsOnLine[0];
    if (firstSymbol === 'BLANK') {
      return; // Blanks never pay
    }

    let matchCount = 1;
    for (let i = 1; i < 5; i++) {
      if (symbolsOnLine[i] === firstSymbol) {
        matchCount++;
      } else {
        break; // Left to right contiguous match required
      }
    }

    if (matchCount >= 3) {
      const def = SYMBOL_DEFINITIONS[firstSymbol];
      const multiplier = def.payouts[matchCount as 3 | 4 | 5] || 0;
      if (multiplier > 0) {
        wins.push({
          paylineIndex,
          symbolId: firstSymbol,
          matchCount,
          multiplier,
          payout: multiplier * betPerLine,
          positions: positions.slice(0, matchCount),
        });
      }
    }
  });

  return wins;
}

// Full spin execution helper
export function executeSpin(denomination: number, multiplier: number): SpinResult {
  const betPerLine = denomination * multiplier;
  const totalBet = betPerLine * 20;
  const reelStops = sampleReelStops();
  const grid = getGridFromStops(reelStops);
  const winningPaylines = evaluatePaylines(grid, betPerLine);
  const totalWin = winningPaylines.reduce((sum, win) => sum + win.payout, 0);

  return {
    reelStops,
    grid,
    winningPaylines,
    totalWin,
    timestamp: Date.now(),
    bet: totalBet,
    denomination,
    multiplier,
  };
}

// High-speed Monte Carlo simulation harness (1,000,000 spins capability)
export interface SimulationResult {
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  empiricalRTP: number;
  theoreticalRTP: number;
  hitFrequency: number;
  hitCount: number;
  maxPayout: number;
  standardError: number;
  winDistribution: {
    zero: number;
    small: number; // 0 < win <= 2x bet
    medium: number; // 2x < win <= 10x bet
    large: number; // 10x < win <= 50x bet
    mega: number; // > 50x bet
  };
  symbolWins: Record<SymbolId, number>;
}

export function runSimulationBatch(
  iterations: number,
  betPerLine: number = 1
): SimulationResult {
  const totalBetPerSpin = betPerLine * 20;
  let totalWon = 0;
  let hitCount = 0;
  let maxPayout = 0;
  let sumSqReturns = 0;

  const winDistribution = {
    zero: 0,
    small: 0,
    medium: 0,
    large: 0,
    mega: 0,
  };

  const symbolWins: Record<SymbolId, number> = {
    BLANK: 0,
    GROK: 0,
    CHATGPT: 0,
    MUSE: 0,
    ANTHROPIC: 0,
    GEMINI: 0,
  };

  const stripLens = REEL_STRIPS.map((s) => s.length);

  for (let s = 0; s < iterations; s++) {
    // Fast inline stop sampling
    const s0 = Math.floor(Math.random() * stripLens[0]);
    const s1 = Math.floor(Math.random() * stripLens[1]);
    const s2 = Math.floor(Math.random() * stripLens[2]);
    const s3 = Math.floor(Math.random() * stripLens[3]);
    const s4 = Math.floor(Math.random() * stripLens[4]);

    const str0 = REEL_STRIPS[0];
    const str1 = REEL_STRIPS[1];
    const str2 = REEL_STRIPS[2];
    const str3 = REEL_STRIPS[3];
    const str4 = REEL_STRIPS[4];

    // Build grid inline for maximum speed
    const g00 = str0[s0], g01 = str0[(s0 + 1) % 100], g02 = str0[(s0 + 2) % 100];
    const g10 = str1[s1], g11 = str1[(s1 + 1) % 100], g12 = str1[(s1 + 2) % 100];
    const g20 = str2[s2], g21 = str2[(s2 + 1) % 100], g22 = str2[(s2 + 2) % 100];
    const g30 = str3[s3], g31 = str3[(s3 + 1) % 100], g32 = str3[(s3 + 2) % 100];
    const g40 = str4[s4], g41 = str4[(s4 + 1) % 100], g42 = str4[(s4 + 2) % 100];

    const grid = [
      [g00, g01, g02],
      [g10, g11, g12],
      [g20, g21, g22],
      [g30, g31, g32],
      [g40, g41, g42],
    ];

    let spinWin = 0;

    for (let p = 0; p < 20; p++) {
      const pl = PAYLINES[p];
      const sym0 = grid[0][pl[0]];
      if (sym0 === 'BLANK') continue;

      let matches = 1;
      if (grid[1][pl[1]] === sym0) {
        matches = 2;
        if (grid[2][pl[2]] === sym0) {
          matches = 3;
          if (grid[3][pl[3]] === sym0) {
            matches = 4;
            if (grid[4][pl[4]] === sym0) {
              matches = 5;
            }
          }
        }
      }

      if (matches >= 3) {
        const def = SYMBOL_DEFINITIONS[sym0];
        const mult = def.payouts[matches as 3 | 4 | 5] || 0;
        const lineWin = mult * betPerLine;
        spinWin += lineWin;
        symbolWins[sym0] += lineWin;
      }
    }

    totalWon += spinWin;
    const spinReturn = spinWin / totalBetPerSpin;
    sumSqReturns += spinReturn * spinReturn;

    if (spinWin > maxPayout) {
      maxPayout = spinWin;
    }

    if (spinWin === 0) {
      winDistribution.zero++;
    } else {
      hitCount++;
      const ratio = spinWin / totalBetPerSpin;
      if (ratio <= 2) winDistribution.small++;
      else if (ratio <= 10) winDistribution.medium++;
      else if (ratio <= 50) winDistribution.large++;
      else winDistribution.mega++;
    }
  }

  const totalWagered = iterations * totalBetPerSpin;
  const empiricalRTP = (totalWon / totalWagered) * 100;
  const meanReturn = totalWon / totalWagered;
  const variance = Math.max(0, (sumSqReturns / iterations) - (meanReturn * meanReturn));
  const standardError = (Math.sqrt(variance / iterations)) * 100;
  const theoretical = calculateTheoreticalRTP();

  return {
    totalSpins: iterations,
    totalWagered,
    totalWon,
    empiricalRTP,
    theoreticalRTP: theoretical.totalRTP,
    hitFrequency: (hitCount / iterations) * 100,
    hitCount,
    maxPayout,
    standardError,
    winDistribution,
    symbolWins,
  };
}
