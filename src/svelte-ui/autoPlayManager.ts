import type { AutoPlayConfig, SveltePixiBridge } from "./sveltePixiBridge";
import { handleGameRound } from "../gameRoundHelper";
import type { GameRoundOptions } from "../gameRoundHelper";

export class AutoPlayManager {
  private isRunning = false;
  private config: AutoPlayConfig | null = null;
  private currentRound = 0;
  private bridge: SveltePixiBridge;
  private gameRoundOptions: GameRoundOptions;
  private stopRequested = false;

  constructor(bridge: SveltePixiBridge, gameRoundOptions: GameRoundOptions) {
    this.bridge = bridge;
    this.gameRoundOptions = gameRoundOptions;
  }

  async start(config: AutoPlayConfig): Promise<void> {
    if (this.isRunning) {
      console.warn("Auto-play is already running");
      return;
    }

    this.isRunning = true;
    this.config = config;
    this.currentRound = 0;
    this.stopRequested = false;

    console.log("Starting auto-play with config:", config);

    try {
      await this.runAutoPlayLoop();
    } catch (error) {
      console.error("Auto-play error:", error);
      this.stop();
    }
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log("Stopping auto-play");
    this.isRunning = false;
    this.stopRequested = true;
    this.config = null;
    this.currentRound = 0;
    this.bridge.stopAutoPlay();
  }

  private async runAutoPlayLoop(): Promise<void> {
    if (!this.config) return;

    while (
      this.isRunning &&
      !this.stopRequested &&
      this.currentRound < this.config.rounds
    ) {
      try {
        // Update remaining rounds
        const remainingRounds = this.config.rounds - this.currentRound;
        this.bridge.updateAutoPlayProgress(remainingRounds);

        // Update game state to playing
        this.bridge.updateGameState("playing");

        // Execute a game round
        const roundResult = await this.executeGameRound();

        // Update game state back to rest
        this.bridge.updateGameState("rest");

        // Check stop conditions
        if (this.shouldStopAutoPlay(roundResult)) {
          console.log("Auto-play stopped due to condition:", {
            isWin: roundResult.isWin,
            stopOnWin: this.config.stopOnWin,
            stopOnLoss: this.config.stopOnLoss,
          });
          break;
        }

        this.currentRound++;

        // Add a small delay between rounds
        await this.delay(500);
      } catch (error) {
        console.error("Error during auto-play round:", error);
        break;
      }
    }

    // Auto-play completed or stopped
    this.stop();
  }

  private async executeGameRound(): Promise<{
    isWin: boolean;
    winAmount: number;
  }> {
    return new Promise((resolve, reject) => {
      // Create a modified version of game round options for auto-play
      const autoGameRoundOptions = {
        ...this.gameRoundOptions,
        skipAnimation: false, // Keep animations for auto-play
        forceEndRound: false,
        betAmount: this.gameRoundOptions.betAmount || 1,
        onBalanceUpdate: (endRoundResponse: {
          balance: { amount: number };
        }) => {
          // Update balance in the bridge
          if (endRoundResponse?.balance?.amount) {
            this.bridge.updateBalance(
              endRoundResponse.balance.amount / 1000000,
            ); // Assuming API_MULTIPLIER
          }

          // Call original callback if exists
          if (this.gameRoundOptions.onBalanceUpdate) {
            this.gameRoundOptions.onBalanceUpdate(endRoundResponse);
          }
        },
      };

      // Execute game round
      handleGameRound(autoGameRoundOptions)
        .then(() => {
          // Determine if this was a win (simplified - you may need to adapt this)
          const lastWin = 0; // You'll need to get this from the actual game state
          const isWin = lastWin > 0;
          const winAmount = isWin
            ? lastWin * (autoGameRoundOptions.betAmount || 1)
            : 0;

          if (isWin) {
            this.bridge.updateLastWin(lastWin);
          }

          resolve({ isWin, winAmount });
        })
        .catch(reject);
    });
  }

  private shouldStopAutoPlay(roundResult: {
    isWin: boolean;
    winAmount: number;
  }): boolean {
    if (!this.config) return true;

    if (this.config.stopOnWin && roundResult.isWin) {
      return true;
    }

    if (this.config.stopOnLoss && !roundResult.isWin) {
      return true;
    }

    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  get isAutoPlayRunning(): boolean {
    return this.isRunning;
  }

  get currentRoundNumber(): number {
    return this.currentRound;
  }

  get remainingRounds(): number {
    return this.config ? this.config.rounds - this.currentRound : 0;
  }
}
