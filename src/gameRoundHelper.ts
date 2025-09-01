// gameRoundHelper.ts
// Helper to automate end round logic for the cup game
// If API play response is a win, call endRound after cup pick. If loss, do not call endRound.
//
// Win/loss is determined by the payoutMultiplier field in the API response:
//   - Win:   round.payoutMultiplier > 0 (e.g., 0.6)
//   - Loss:  round.payoutMultiplier is missing, zero, or falsy
//
// If you call endRound when the player has lost, the API will respond with:
//   {
//     "error": "ERR_VAL",
//     "message": "player has active bet"
//   }

// Use PlayResponse and EndRoundResponse from rgs-auth.ts

import type { Container, Sprite, Text } from "pixi.js";
import type { PlayResponse, EndRoundResponse } from "./rgs-auth";

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

  // Import API functions dynamically to avoid circular deps
  const { getBookResponse, endRound, endRoundResponse } = await import(
    "./rgs-auth"
  );

  let playResponse: PlayResponse | null = null;
  let activeBetError = false;
  if (!skipAnimation) {
    try {
      playResponse = await getBookResponse();
    } catch (err) {
      // If error is active bet, set flag
      type RgsError = { error: string; message: string };
      const e = err as RgsError;
      if (
        typeof err === "object" &&
        err !== null &&
        "error" in err &&
        e.error === "ERR_VAL" &&
        typeof e.message === "string" &&
        /active bet/i.test(e.message)
      ) {
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
          // Just call endRound after pick, no animation
          await endRound();
          onBalanceUpdate(endRoundResponse || { balance: { amount: 0 } });
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
            await endRound();
            onBalanceUpdate(endRoundResponse || { balance: { amount: 0 } });
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
