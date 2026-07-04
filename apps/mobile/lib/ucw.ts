/**
 * Circle User-Controlled Wallet service.
 * Handles social login (Google/Email), wallet creation/restoration, and session management.
 *
 * Frontend SDK: @circle-fin/w3s-pw-web-sdk (dynamic import to avoid SSR issues)
 * Backend SDK: @circle-fin/user-controlled-wallets
 *
 * Key pitfalls avoided:
 * - Dynamic import W3SSdk (Pitfall 4: SSR import)
 * - Always call getDeviceId() after init (Pitfall 5)
 * - Use cookies for social login persistence
 * - redirectUri = full route path, not bare origin (Pitfall 6)
 */

export type UcwSession = {
  deviceId: string;
  deviceToken: string;
  deviceEncryptionKey: string;
  userToken: string;
  encryptionKey: string;
  walletAddress?: string;
  walletId?: string;
  userId?: string;
};

export type UcwWallet = {
  id: string;
  address: string;
  blockchain: string;
  accountType: string;
  state: string;
};

export type UcwBalance = {
  token: {
    symbol: string;
    name: string;
    decimals: number;
  };
  amount: string;
  blockchain: string;
};

export type UcwLoginState =
  | "idle"
  | "initializing"
  | "ready"
  | "logging_in"
  | "creating_wallet"
  | "connected"
  | "error";

/**
 * Get the redirect URI for OAuth callbacks.
 * Must be the full route path, not bare origin (Pitfall 6).
 */
export function getUcwRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/wallet`;
}

/**
 * Check if the current URL contains OAuth callback hash material.
 */
export function hasOAuthHash(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash;
  return hash.includes("access_token") || hash.includes("id_token") || hash.includes("error");
}

/**
 * Clean OAuth hash from URL after processing.
 */
export function cleanOAuthHash(): void {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", window.location.pathname);
}
