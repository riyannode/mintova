import { isAddress } from "viem";

export function isValidEvmAddress(address: string): boolean {
  try {
    return isAddress(address, { strict: false });
  } catch {
    return false;
  }
}

export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num < 1_000_000;
}

export function isHighValue(amount: string, threshold = 100): boolean {
  return parseFloat(amount) >= threshold;
}
