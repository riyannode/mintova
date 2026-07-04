export type MintovaToken = {
  symbol: string;
  name: string;
  decimals: number;
  /** Prefer SDK-exported addresses. Only hardcode if official config has no runtime helper. */
  address?: string;
};

export const USDC: MintovaToken = {
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
};

export const TOKENS: MintovaToken[] = [USDC];

export function getTokenBySymbol(symbol: string): MintovaToken | undefined {
  return TOKENS.find((t) => t.symbol === symbol);
}
