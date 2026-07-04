export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatUsdc(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 USDC";
  return `${num.toLocaleString("en-US", { maximumFractionDigits: 6 })} USDC`;
}

export function formatChainName(sdkName: string): string {
  return sdkName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
