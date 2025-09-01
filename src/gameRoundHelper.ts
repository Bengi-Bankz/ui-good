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

export type PlayResult = "win" | "loss";

export interface PlayResponse {
  result: PlayResult;
  // ...other fields from API response
}

export interface EndRoundResponse {
  balance: {
    amount: number;
    currency?: string;
  };
  // ...add other fields from endRound API response if needed
}

export interface GameRoundOptions {
  playApiCall: () => Promise<PlayResponse>;
  endRoundApiCall: () => Promise<EndRoundResponse>;
  onCupPick: () => Promise<void>;
  onRest: () => void;
  onBalanceUpdate: (endRoundResponse: EndRoundResponse) => void;
}

export async function handleGameRound({
  playApiCall,
  endRoundApiCall,
  onCupPick,
  onRest,
  onBalanceUpdate,
}: GameRoundOptions) {
  const playResponse = await playApiCall();
  await onCupPick();
  if (playResponse.result === "win") {
    const endRoundResponse = await endRoundApiCall();
    onBalanceUpdate(endRoundResponse);
  } else {
    // Do not call endRound, just return to rest state
    onRest();
  }
}
