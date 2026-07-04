/**
 * CCTP V2 Forwarding Fee Quote Fetcher
 *
 * Scaffold only. Execution disabled until route contracts, fees,
 * and UCW challenge flow are validated.
 *
 * Fetches live fee data from the Iris API. Does NOT fabricate or
 * estimate fees. If the API fails, returns quoteUnavailable.
 */

import { buildFeeQueryUrl } from "./forwarding";
import type { CctpFeeQuote } from "./types";

type FeeApiResponse = Array<{
  finalityThreshold: number;
  minimumFee: number;
  forwardFee: {
    low: number;
    med: number;
    high: number;
  };
}>;

export type FeeQuoteResult =
  | { ok: true; quote: CctpFeeQuote }
  | { ok: false; error: string; code: "quoteUnavailable" | "invalidResponse" | "networkError" };

/**
 * Fetch a live CCTP forwarding fee quote from the Iris API.
 *
 * @param sourceDomain - CCTP source domain ID
 * @param destinationDomain - CCTP destination domain ID
 * @param environment - "testnet" or "mainnet"
 * @returns FeeQuoteResult with live quote or error
 */
export async function getCctpForwardingFeeQuote(
  sourceDomain: number,
  destinationDomain: number,
  environment: "testnet" | "mainnet",
): Promise<FeeQuoteResult> {
  const url = buildFeeQueryUrl(sourceDomain, destinationDomain, environment);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Iris fee API returned ${response.status}`,
        code: "quoteUnavailable",
      };
    }

    const data: FeeApiResponse = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return {
        ok: false,
        error: "Empty fee response from Iris API",
        code: "invalidResponse",
      };
    }

    // Prefer fast transfer (finalityThreshold 1000), fall back to first entry
    const fastEntry = data.find((e) => e.finalityThreshold === 1000) ?? data[0];

    if (!fastEntry?.forwardFee?.med) {
      return {
        ok: false,
        error: "Missing forwardFee.med in Iris response",
        code: "invalidResponse",
      };
    }

    // Convert forwardFee from USDC human-readable to atomic (6 decimals)
    // The API returns values like 207543 which is 0.207543 USDC
    const forwardFeeAtomic = BigInt(Math.round(fastEntry.forwardFee.med)).toString();

    return {
      ok: true,
      quote: {
        minimumFeeBps: fastEntry.minimumFee,
        forwardFeeAtomic,
        finalityThreshold: fastEntry.finalityThreshold,
        live: true,
        sourceApi: environment === "testnet" ? "iris-api-sandbox.circle.com" : "iris-api.circle.com",
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown network error",
      code: "networkError",
    };
  }
}
