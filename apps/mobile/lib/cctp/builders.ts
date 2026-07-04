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
 * @param plan - Bridge plan with USDC address, TokenMessengerV2 address, amount
 * @returns Payload for UCW contract execution
 */
export function buildApproveExecution(
  plan: Pick<CctpBridgePlan, "usdcAddress" | "tokenMessengerV2Address" | "amountAtomic">,
): UcwContractExecutionPayload {
  return {
    contractAddress: plan.usdcAddress,
    abiFunctionSignature: "approve(address,uint256)",
    abiParameters: [
      plan.tokenMessengerV2Address,
      plan.amountAtomic,
    ],
  };
}

/**
 * Build the depositForBurnWithHook() call for TokenMessengerV2.
 *
 * This burns USDC on the source chain and includes the Forwarding Service
 * hook data so Circle handles attestation + destination mint.
 *
 * Full ABI: depositForBurnWithHook(
 *   uint256 amount,
 *   uint32  destinationDomain,
 *   bytes32 mintRecipient,
 *   address burnToken,
 *   bytes32 destinationCaller,
 *   uint256 maxFee,
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
    | "amountAtomic"
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
      plan.amountAtomic,                    // amount
      plan.destinationDomain.toString(),    // destinationDomain
      recipientBytes32,                     // mintRecipient
      plan.usdcAddress,                     // burnToken (USDC)
      destinationCaller,                    // destinationCaller (bytes32(0))
      plan.maxFeeAtomic,                    // maxFee
      plan.minFinalityThreshold.toString(), // minFinalityThreshold
      plan.hookData,                        // hookData (forwarding hook)
    ],
  };
}
