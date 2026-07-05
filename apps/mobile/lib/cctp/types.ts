/**
 * CCTP V2 Manual Bridge Types — UCW Contract Execution Path
 *
 * Scaffold only. Execution disabled until route contracts, fees,
 * and UCW challenge flow are validated.
 *
 * These types model the manual CCTP V2 + Forwarding Service flow:
 *   1. UCW approve(address,uint256) on USDC
 *   2. UCW depositForBurnWithHook on TokenMessengerV2
 *   3. Poll Circle transaction status for each UCW tx
 *   4. Poll Iris messages API for forwardTxHash
 *
 * No kit.bridge(). No DCW. No raw private keys.
 */

/** CCTP domain + contract addresses for a single chain. */
export type CctpDomainConfig = {
  /** Chain SDK name (e.g. "Ethereum_Sepolia") */
  chainSdkName: string;
  /** CCTP domain ID (e.g. 0 for Ethereum Sepolia) */
  cctpDomain: number;
  /** USDC contract address on this chain */
  usdcAddress: string;
  /** TokenMessengerV2 contract address */
  tokenMessengerV2Address: string;
  /** MessageTransmitterV2 contract address (for reference) */
  messageTransmitterV2Address: string;
};

/** A verified CCTP route between two chains. */
export type CctpRouteConfig = {
  source: CctpDomainConfig;
  destination: CctpDomainConfig;
  /** Whether this route has been validated end-to-end on testnet */
  verified: boolean;
  /** CCTP finality threshold: 1000 = fast, 2000 = standard */
  finalityThreshold: number;
};

/** Fee breakdown from the Iris API for a forwarding transfer. */
export type CctpFeeQuote = {
  /** Raw minimumFee from Iris (basis points as float, e.g. 0.0001 = 0.01%) */
  minimumFeeRaw: number;
  /** Protocol fee in atomic USDC units (calculated from minimumFee × transferAmount) */
  protocolFeeAtomic: string;
  /** Forwarding service fee in atomic USDC units (med level) */
  forwardFeeAtomic: string;
  /** Combined max fee = protocolFee + forwardFee */
  maxFeeAtomic: string;
  /** Amount to burn = transferAmount + maxFee */
  burnAmountAtomic: string;
  /** Finality threshold (1000 = fast, 2000 = standard) */
  finalityThreshold: number;
  /** Whether the quote was fetched from the live API */
  live: boolean;
  /** API base URL used */
  sourceApi: string;
};

/** Step state for tracking individual CCTP operations. */
export type CctpBridgeStepState =
  | "pending"
  | "challenge_created"
  | "user_approved"
  | "submitted"
  | "confirmed"
  | "failed"
  | "skipped";

/** Full plan for a manual CCTP bridge via UCW. */
export type CctpBridgePlan = {
  /** Source chain config */
  sourceChain: string;
  /** Destination chain config */
  destinationChain: string;
  /** Source CCTP domain ID */
  sourceDomain: number;
  /** Destination CCTP domain ID */
  destinationDomain: number;
  /** USDC address on source chain */
  usdcAddress: string;
  /** TokenMessengerV2 address on source chain */
  tokenMessengerV2Address: string;
  /** Recipient address (EVM hex, 0x-prefixed) */
  recipientAddress: string;
  /** Recipient as bytes32 (left-padded for depositForBurnWithHook) */
  recipientBytes32: string;
  /** User-specified transfer amount in atomic USDC units (6 decimals) */
  transferAmountAtomic: string;
  /** Combined max fee in atomic units (protocolFee + forwardFee, from Iris fee quote) */
  maxFeeAtomic: string;
  /**
   * Total burn amount = transferAmountAtomic + maxFeeAtomic.
   * This is the amount approved and burned in the CCTP contract call.
   * Forwarding Service requires the burn to cover both the transfer and fees.
   */
  burnAmountAtomic: string;
  /** CCTP finality threshold (1000 = fast) */
  minFinalityThreshold: number;
  /** Forwarding service hook data (hex) */
  hookData: string;
  /** Fee quote used for this plan */
  feeQuote: CctpFeeQuote;

  // Step tracking — all optional, populated during execution

  /** UCW challenge ID for the approve step */
  approveChallengeId?: string;
  /** Circle transaction ID for approve */
  approveTransactionId?: string;
  /** On-chain tx hash for approve */
  approveTxHash?: string;
  /** Approve step state */
  approveState: CctpBridgeStepState;

  /** UCW challenge ID for the depositForBurnWithHook step */
  burnChallengeId?: string;
  /** Circle transaction ID for burn */
  burnTransactionId?: string;
  /** On-chain tx hash for burn */
  burnTxHash?: string;
  /** Burn step state */
  burnState: CctpBridgeStepState;

  /** Iris attestation message (if fetched) */
  irisMessage?: string;
  /** Forwarding service destination tx hash */
  forwardTxHash?: string;
  /** Forwarding status */
  forwardState: CctpForwardingStatus;
};

/** Status of the Forwarding Service mint on destination chain. */
export type CctpForwardingStatus =
  | "not_started"
  | "waiting_attestation"
  | "attestation_received"
  | "forward_submitted"
  | "forward_confirmed"
  | "forward_failed";
