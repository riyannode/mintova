import { isAddress } from "viem";

export function isValidEvmAddress(address: string): boolean {
  try {
    return isAddress(address, { strict: false });
  } catch {
    return false;
  }
}

/**
 * Parse a decimal USDC amount string to atomic units (bigint, 6 decimals).
 *
 * Uses exact string arithmetic — no parseFloat, no floating-point rounding.
 *
 * Rules:
 * - Must be a non-empty string of digits with optional single "."
 * - Max 6 decimal places (USDC precision)
 * - Rejects: empty, negative, scientific notation ("1e3"), commas ("1,000"),
 *   trailing text ("1abc"), leading zeros beyond "0.", zero value,
 *   amounts >= 1,000,000
 *
 * Examples:
 *   "1"        → 1000000n
 *   "1.5"      → 1500000n
 *   "0.000001" → 1n
 *   "0.0000001"→ reject (7 decimals)
 *   "1abc"     → reject
 *   "1e3"      → reject
 *   "0"        → reject
 */
export function parseUsdcAmountToAtomic(amount: string): bigint {
  if (typeof amount !== "string" || amount.length === 0) {
    throw new Error("Amount must be a non-empty string");
  }

  // Reject anything that isn't digits and at most one dot
  // This catches: "1abc", "1e3", "1,000", negative signs, etc.
  if (!/^[0-9]+(\.[0-9]+)?$/.test(amount)) {
    throw new Error(`Invalid amount format: "${amount}"`);
  }

  const [wholeRaw, fracRaw = ""] = amount.split(".");

  // Reject more than 6 decimal places
  if (fracRaw.length > 6) {
    throw new Error(`Amount has ${fracRaw.length} decimal places, max 6 for USDC`);
  }

  // Reject scientific notation explicitly (already caught by regex, but defense-in-depth)
  if (amount.includes("e") || amount.includes("E")) {
    throw new Error("Scientific notation not allowed");
  }

  // Reject commas
  if (amount.includes(",")) {
    throw new Error("Commas not allowed in amount");
  }

  // Pad fractional part to exactly 6 digits, then concatenate with whole part
  const paddedFrac = fracRaw.padEnd(6, "0");
  const atomicStr = wholeRaw + paddedFrac;

  // Reject leading zeros in the combined integer (except "0" itself for "0.xxx")
  // e.g. "01.5" → "01500000" — we want to reject "01" as whole part
  if (wholeRaw.length > 1 && wholeRaw.startsWith("0")) {
    throw new Error(`Invalid whole part: "${wholeRaw}"`);
  }

  const atomic = BigInt(atomicStr);

  // Reject zero
  if (atomic === BigInt(0)) {
    throw new Error("Amount must be greater than zero");
  }

  // Reject >= 1,000,000 USDC (1_000_000_000_000 atomic)
  if (atomic >= BigInt(1_000_000) * BigInt(1_000_000)) {
    throw new Error("Amount must be less than 1,000,000 USDC");
  }

  return atomic;
}

/**
 * Check if an amount string is a valid USDC amount.
 * Uses the exact parser — no parseFloat.
 */
export function isValidAmount(amount: string): boolean {
  try {
    parseUsdcAmountToAtomic(amount);
    return true;
  } catch {
    return false;
  }
}

export function isHighValue(amount: string, threshold = 100): boolean {
  // Use parseUsdcAmountToAtomic for consistency, compare in human-readable units
  try {
    const atomic = parseUsdcAmountToAtomic(amount);
    return atomic >= BigInt(threshold) * BigInt(1_000_000);
  } catch {
    return false;
  }
}
