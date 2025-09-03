import { writable, derived } from "svelte/store";

// Game state interface
export interface GameState {
  balance: number;
  betAmount: number;
  isPlaying: boolean;
  isAutoPlay: boolean;
  autoPlayRounds: number;
  currentRound: number;
  lastWin: number;
  gameState: "rest" | "playing" | "ending";
  soundEnabled: boolean;
}

// Create the main game state store
export const gameState = writable<GameState>({
  balance: 1000,
  betAmount: 1,
  isPlaying: false,
  isAutoPlay: false,
  autoPlayRounds: 0,
  currentRound: 0,
  lastWin: 0,
  gameState: "rest",
  soundEnabled: true,
});

// Auto-play control store
export const autoPlayState = writable({
  isRunning: false,
  remainingRounds: 0,
  totalRounds: 0,
  stopOnWin: false,
  stopOnLoss: false,
});

// UI visibility stores
export const uiVisible = writable({
  autoPanel: false,
  settingsPanel: false,
  infoModal: false,
});

// Derived stores for computed values
export const canPlay = derived(
  gameState,
  ($gameState) =>
    $gameState.gameState === "rest" &&
    $gameState.balance >= $gameState.betAmount,
);

export const canAutoPlay = derived(
  [gameState, autoPlayState],
  ([$gameState, $autoPlayState]) =>
    $gameState.gameState === "rest" &&
    $gameState.balance >= $gameState.betAmount &&
    !$autoPlayState.isRunning,
);
