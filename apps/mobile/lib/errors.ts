export type MintovaErrorCode =
  | "UNSUPPORTED_ROUTE"
  | "INVALID_ADDRESS"
  | "INSUFFICIENT_BALANCE"
  | "WALLET_REJECTED"
  | "ROUTE_UNAVAILABLE"
  | "RETRY_REQUIRED"
  | "UNKNOWN";

export class MintovaError extends Error {
  code: MintovaErrorCode;
  constructor(code: MintovaErrorCode, message: string) {
    super(message);
    this.name = "MintovaError";
    this.code = code;
  }
}

export function getErrorMessage(code: MintovaErrorCode): string {
  const messages: Record<MintovaErrorCode, string> = {
    UNSUPPORTED_ROUTE: "Unsupported route",
    INVALID_ADDRESS: "Invalid address",
    INSUFFICIENT_BALANCE: "Insufficient balance",
    WALLET_REJECTED: "Wallet rejected",
    ROUTE_UNAVAILABLE: "Route unavailable",
    RETRY_REQUIRED: "Retry required",
    UNKNOWN: "Something went wrong",
  };
  return messages[code] ?? messages.UNKNOWN;
}
