export type SwapQuote = {
  route: string;
  priceImpact: string;
  minimumReceived: string;
  estimatedFee: string;
};

export async function quoteSwap(
  _chain: string,
  _fromToken: string,
  _toToken: string,
  _amount: string,
  _slippageBps?: number,
): Promise<SwapQuote> {
  // V1: Shell only. Enable after App Kit swap is verified.
  return {
    route: "unavailable",
    priceImpact: "N/A",
    minimumReceived: "N/A",
    estimatedFee: "N/A",
  };
}
