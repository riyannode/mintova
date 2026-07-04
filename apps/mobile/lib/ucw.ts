/**
 * Circle User-Controlled Wallet service.
 * Handles login, wallet creation/restoration, and session management.
 *
 * Frontend SDK: @circle-fin/w3s-pw-web-sdk
 * Backend SDK: @circle-fin/user-controlled-wallets
 */

export type UcwSession = {
  userToken: string;
  encryptionKey: string;
  walletAddress?: string;
  userId?: string;
};

// TODO: Implement after Circle Console setup
// - getDeviceId()
// - setAuthentication({ userToken, encryptionKey })
// - execute(challengeId, callback)
// - createWallet / restoreWallet
