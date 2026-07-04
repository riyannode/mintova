/**
 * CCTP V2 UCW Contract Execution Builders
 *
 * Scaffold only. Execution disabled until route contracts, fees,
 * and UCW challenge flow are validated.
 *
 * These functions build ABI parameter objects for use with
 * circleClient.createContractExecutionTransaction().
 *
 * They do NOT submit transactions. They do NOT create challenges.
 * They do NOT access private keys or entity secrets.
 *
 * Reference ABI signatures:
 *   approve(address,uint256)
 *   depositForBurnWithHook(uint256,uint32,bytes32,address,bytes32,uint256,uint32,bytes)
 */

import { FORWARDING_SERVICE_HOOK_DATA, buildRecipientBytes32 } from "./forwarding";
import type { CctpBridgePlan } from "./types";

/** Result: ABI payload ready for UCW createContractExecutionTransaction */
export type UcwContractExecutionPayload = {
  contractAddress: string;
  abiFunctionSignature: string;
  abiParameters: string[];
};

/**
 * Build the USDC approve() call for TokenMessengerV2.
 *
 * The user must approve the TokenMessengerV2 contract to spend USDC
 * before depositForBurnWithHook can be called.
 *
 * IMPORTANT: The approved amount is burnAmountAtomic (transfer + fees),
 * not just the transfer amount, because the Forwarding Service requires
 * the burn to cover both protocol and forwarding fees.
 *
 * @param plan - Bridge plan with USDC address, TokenMessengerV2 address, burnAmountAtomic
 * @returns Payload for UCW contract execution
 */
export function buildApproveExecution(
  plan: Pick<CctpBridgePlan, "usdcAddress" | "tokenMessengerV2Address" | "burnAmountAtomic">,
): UcwContractExecutionPayload {
  return {
    contractAddress: plan.usdcAddress,
    abiFunctionSignature: "approve(address,uint256)",
    abiParameters: [
      plan.tokenMessengerV2Address,
      plan.burnAmountAtomic,
    ],
  };
}

/**
 * Build the depositForBurnWithHook() call for TokenMessengerV2.
 *
 * This burns USDC on the source chain and includes the Forwarding Service
 * hook data so Circle handles attestation + destination mint.
 *
 * IMPORTANT: For Forwarding Service, the burn amount must be
 * burnAmountAtomic (transfer + fees), and maxFee must cover both
 * protocol fee and forwarding fee.
 *
 * Full ABI: depositForBurnWithHook(
 *   uint256 amount,              ← burnAmountAtomic
 *   uint32  destinationDomain,
 *   bytes32 mintRecipient,
 *   address burnToken,
 *   bytes32 destinationCaller,
 *   uint256 maxFee,              ← maxFeeAtomic (protocol + forwarding)
 *   uint32  minFinalityThreshold,
 *   bytes   hookData
 * )
 *
 * @param plan - Full bridge plan
 * @returns Payload for UCW contract execution
 */
export function buildDepositForBurnWithHookExecution(
  plan: Pick<
    CctpBridgePlan,
    | "tokenMessengerV2Address"
    | "burnAmountAtomic"
    | "destinationDomain"
    | "recipientAddress"
    | "usdcAddress"
    | "maxFeeAtomic"
    | "minFinalityThreshold"
    | "hookData"
  >,
): UcwContractExecutionPayload {
  const recipientBytes32 = buildRecipientBytes32(plan.recipientAddress);
  // destinationCaller = bytes32(0) means anyone can call receiveMessage
  const destinationCaller =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  return {
    contractAddress: plan.tokenMessengerV2Address,
    abiFunctionSignature:
      "depositForBurnWithHook(uint256,uint32,bytes32,address,bytes32,uint256,uint32,bytes)",
    abiParameters: [
      plan.burnAmountAtomic,                // amount (transfer + fees)
      plan.destinationDomain.toString(),    // destinationDomain
      recipientBytes32,                     // mintRecipient
      plan.usdcAddress,                     // burnToken (USDC)
      destinationCaller,                    // destinationCaller (bytes32(0))
      plan.maxFeeAtomic,                    // maxFee (protocol + forwarding)
      plan.minFinalityThreshold.toString(), // minFinalityThreshold
      plan.hookData,                        // hookData (forwarding hook)
    ],
  };
}
