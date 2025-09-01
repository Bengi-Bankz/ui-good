// RGS API client for handling Remote Game Server communication
// Centralized API client with error handling and configuration

import type {
  AuthenticateResponse,
  EndRoundResponse,
  PlayResponse,
  RgsConfig,
  RgsError,
} from "./types";

const API_MULTIPLIER = 1000000;

// Get URL parameter helper
function getParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

// Create RGS configuration from URL parameters
export function createRgsConfig(): RgsConfig {
  return {
    apiMultiplier: API_MULTIPLIER,
    rgsUrl: getParam("rgs_url"),
    sessionID: getParam("sessionID"),
    language: getParam("language") || "en",
    currency: getParam("currency"),
    mode: getParam("mode") ?? "BASE",
  };
}

// Generic RGS API request handler
export async function getRGSResponse<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const config = createRgsConfig();
  if (!config.rgsUrl) throw new Error("Missing rgs_url parameter");

  const res = await fetch(`https://${config.rgsUrl}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  // Handle RGS errors
  if (!res.ok || data.error) {
    throw data as RgsError;
  }

  return data;
}

// Authenticate with RGS
export async function authenticate(): Promise<AuthenticateResponse> {
  const config = createRgsConfig();
  return getRGSResponse<AuthenticateResponse>("/wallet/authenticate", {
    sessionID: config.sessionID,
    language: config.language,
  });
}

// End current round with RGS
export async function endRound(): Promise<EndRoundResponse> {
  const config = createRgsConfig();
  return getRGSResponse<EndRoundResponse>("/wallet/end-round", {
    sessionID: config.sessionID,
  });
}

// Play a round with RGS
export async function playRound(betAmount: number = 1): Promise<PlayResponse> {
  const config = createRgsConfig();
  return getRGSResponse<PlayResponse>("/wallet/play", {
    mode: config.mode,
    currency: config.currency,
    sessionID: config.sessionID,
    amount: betAmount * config.apiMultiplier,
  });
}

// Check if error is "active bet" error
export function isActiveBetError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;

  const rgsError = err as RgsError;
  return (
    "error" in rgsError &&
    rgsError.error === "ERR_VAL" &&
    typeof rgsError.message === "string" &&
    /active bet/i.test(rgsError.message)
  );
}
