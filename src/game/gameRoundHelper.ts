// gameRoundHelper.ts
// Helper to automate end round logic for the cup game
// Handles game round flow including RGS integration and cup selection logic
//
// Win/loss is determined by the payoutMultiplier field in the API response:
//   - Win:   round.payoutMultiplier > 0 (e.g., 0.6)
//   - Loss:  round.payoutMultiplier is missing, zero, or falsy
//
// TODO: Refactor to use more generic game round abstraction
// TODO: Add support for different bet amounts
// TODO: Improve error handling and user feedback

import type { Container, Sprite, Text } from "pixi.js";
import type { PlayResponse, EndRoundResponse } from "../rgs";

export interface GameRoundOptions {
  ForegroundAnimationGroup: Container & {
    cupSprites: Sprite[];
    setChildIndex: (child: Sprite, index: number) => void;
    getChildIndex: (child: Sprite) => number;
    layout?: () => void;
  };
  diamondSprite: Sprite;
  liftCup: (
    cup: Sprite,
    liftHeight?: number,
    duration?: number,
  ) => Promise<void>;
  lowerCup: (
    cup: Sprite,
    liftHeight?: number,
    duration?: number,
  ) => Promise<void>;
  onRest: () => void;
  onBalanceUpdate: (endRoundResponse: EndRoundResponse) => void;
  balanceText: Text;
}

export async function handleGameRound(
  opts: GameRoundOptions & { skipAnimation?: boolean; forceEndRound?: boolean },
) {
  // Destructure options for clarity
  const {
    ForegroundAnimationGroup,
    diamondSprite,
    liftCup,
    lowerCup,
    onRest,
    onBalanceUpdate,
    skipAnimation = false,
    forceEndRound = false,
  } = opts;

  // Import RGS functions from new centralized module
  const {
    executeGameRound,
    finalizeRound,
    getLastEndRoundResponse,
    isActiveBetError,
  } = await import("../rgs");

  let playResponse: PlayResponse | null = null;
  let activeBetError = false;

  if (!skipAnimation) {
    try {
      playResponse = await executeGameRound(1); // TODO: Make bet amount configurable
    } catch (err) {
      // Check if error is active bet error using centralized utility
      if (isActiveBetError(err)) {
        activeBetError = true;
      } else {
        throw err;
      }
    }
  }

  // Step 2: Enable cup click and wait for user pick
  const cupSprites: Sprite[] = ForegroundAnimationGroup.cupSprites;
  let chosenIdx: number | null = null;
  await new Promise<void>((resolve) => {
    cupSprites.forEach((cup: Sprite, idx: number) => {
      cup.eventMode = "static";
      cup.cursor = "pointer";
      cup.interactive = true;
      cup.removeAllListeners();
      cup.on("pointertap", async () => {
        if (chosenIdx !== null) return; // Only allow one pick
        chosenIdx = idx;
        // Disable all cups
        cupSprites.forEach((c: Sprite) => {
          c.interactive = false;
          c.cursor = "default";
        });
        if (activeBetError || forceEndRound) {
          // Just call finalizeRound after pick, no animation
          await finalizeRound();
          onBalanceUpdate(
            getLastEndRoundResponse() || { balance: { amount: 0 } },
          );
        } else {
          // Animate chosen cup lift
          await liftCup(cup);
          if (
            playResponse &&
            playResponse.round &&
            playResponse.round.payoutMultiplier > 0
          ) {
            // WIN: reveal diamond under chosen cup
            diamondSprite.visible = true;
            diamondSprite.x = cup.x;
            diamondSprite.y = cup.y - cup.height * cup.scale.y;
            diamondSprite.zIndex = 5;
            ForegroundAnimationGroup.setChildIndex(
              diamondSprite,
              ForegroundAnimationGroup.getChildIndex(cup),
            );
            await new Promise((r) => setTimeout(r, 800));
            await lowerCup(cup);
            diamondSprite.visible = false;
            // End round and update balance
            await finalizeRound();
            onBalanceUpdate(
              getLastEndRoundResponse() || { balance: { amount: 0 } },
            );
          } else {
            // LOSS: reveal empty cup, then reveal diamond under random other cup
            await new Promise((r) => setTimeout(r, 600));
            await lowerCup(cup);
            // Pick a random other cup
            let otherIdx = Math.floor(Math.random() * 3);
            while (otherIdx === idx) otherIdx = Math.floor(Math.random() * 3);
            const otherCup = cupSprites[otherIdx];
            await liftCup(otherCup);
            diamondSprite.visible = true;
            diamondSprite.x = otherCup.x;
            diamondSprite.y = otherCup.y - otherCup.height * otherCup.scale.y;
            diamondSprite.zIndex = 5;
            ForegroundAnimationGroup.setChildIndex(
              diamondSprite,
              ForegroundAnimationGroup.getChildIndex(otherCup),
            );
            await new Promise((r) => setTimeout(r, 800));
            await lowerCup(otherCup);
            diamondSprite.visible = false;
            // Note: For losses, we don't call finalizeRound to avoid "active bet" error
          }
        }
        // Reset state for next round
        if (typeof ForegroundAnimationGroup.layout === "function")
          ForegroundAnimationGroup.layout();
        resolve();
      });
    });
  });
  onRest();
}
