import type { Application } from "pixi.js";
import { mount } from "svelte";
import SvelteOverlay from "./components/SvelteOverlay.svelte";
import type { GameState } from "./stores/gameStore";
import { gameState } from "./stores/gameStore";

export interface AutoPlayConfig {
  rounds: number;
  stopOnWin: boolean;
  stopOnLoss: boolean;
}

export interface SveltePixiBridge {
  updateBalance: (balance: number) => void;
  updateBetAmount: (amount: number) => void;
  updateGameState: (state: "rest" | "playing" | "ending") => void;
  updateLastWin: (win: number) => void;
  updateAutoPlayProgress: (remainingRounds: number) => void;
  stopAutoPlay: () => void;
  destroy: () => void;
}

/**
 * Creates a bridge between Svelte UI components and PixiJS application
 */
export function createSveltePixiBridge(
  pixiApp: Application,
  container: HTMLElement,
  callbacks: {
    onAutoPlay: (config: AutoPlayConfig) => void;
    onStopAutoPlay: () => void;
    onSoundToggle: (enabled: boolean) => void;
  },
): SveltePixiBridge {
  // Create a container div for Svelte components
  const svelteContainer = document.createElement("div");
  svelteContainer.style.position = "fixed";
  svelteContainer.style.top = "0";
  svelteContainer.style.left = "0";
  svelteContainer.style.width = "100%";
  svelteContainer.style.height = "100%";
  svelteContainer.style.pointerEvents = "none";
  svelteContainer.style.zIndex = "1000";

  container.appendChild(svelteContainer);

  // Initialize Svelte overlay
  let svelteOverlay: unknown;

  try {
    svelteOverlay = mount(SvelteOverlay, {
      target: svelteContainer,
      props: {
        pixiApp,
        onAutoPlay: callbacks.onAutoPlay,
        onStopAutoPlay: callbacks.onStopAutoPlay,
        onSoundToggle: callbacks.onSoundToggle,
        onUpdateGameState: (updates: Partial<GameState>) => {
          // Handle any additional state updates needed
          console.log("Game state updated:", updates);
        },
      },
    });
  } catch (error) {
    console.error("Failed to initialize Svelte overlay:", error);
    throw error;
  }

  // Create the bridge interface
  const bridge: SveltePixiBridge = {
    updateBalance: (balance: number) => {
      gameState.update((state) => ({ ...state, balance }));
    },

    updateBetAmount: (amount: number) => {
      gameState.update((state) => ({ ...state, betAmount: amount }));
    },

    updateGameState: (state: "rest" | "playing" | "ending") => {
      gameState.update((gameState) => ({ ...gameState, gameState: state }));
    },

    updateLastWin: (win: number) => {
      gameState.update((state) => ({ ...state, lastWin: win }));
    },

    updateAutoPlayProgress: (remainingRounds: number) => {
      // This will be handled by the auto-play manager through the store
      console.log("Auto-play progress:", remainingRounds);
    },

    stopAutoPlay: () => {
      // This will be handled by the auto-play manager through the store
      console.log("Stopping auto-play from bridge");
    },

    destroy: () => {
      if (
        svelteOverlay &&
        typeof svelteOverlay === "object" &&
        "unmount" in svelteOverlay
      ) {
        (svelteOverlay as { unmount: () => void }).unmount();
      }
      if (svelteContainer.parentNode) {
        svelteContainer.parentNode.removeChild(svelteContainer);
      }
    },
  };

  return bridge;
}

/**
 * Event bus for communication between Svelte and PixiJS
 */
export class SveltePixiEventBus extends EventTarget {
  emit(eventName: string, data?: unknown) {
    this.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }

  on(eventName: string, callback: (event: CustomEvent) => void) {
    this.addEventListener(eventName, callback as EventListener);
  }

  off(eventName: string, callback: (event: CustomEvent) => void) {
    this.removeEventListener(eventName, callback as EventListener);
  }
}

export const eventBus = new SveltePixiEventBus();
