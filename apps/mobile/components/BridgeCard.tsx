"use client";

import { useState, useCallback } from "react";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";
import { ConfirmationSheet } from "./ConfirmationSheet";
import { ProgressTimeline } from "./ProgressTimeline";
import {
  prepareBridge,
  formatAtomicUsdc,
  validateBridgeParams,
  type BridgeParams,
} from "@/lib/bridge";
import { isHighValue } from "@/lib/validation";
import { getEnabledBridgeChains, getChainBySdkName, isPilotCctpRoute } from "@/lib/chains";
import {
  saveActivity,
  updateActivity,
  generateLocalId,
  type ActivityEntry,
  type BridgeStep,
} from "@/lib/activity-store";
import { useUcwWallet } from "@/lib/useUcwWallet";

type View = "form" | "confirming" | "executing" | "success" | "error";

/** Pilot-only confirmation info built from prepare response */
type ApproveConfirmation = {
  title: string;
  rows: [string, string][];
};

export function BridgeCard() {
  const ucw = useUcwWallet();

  const [fromChain, setFromChain] = useState("Ethereum_Sepolia");
  const [toChain, setToChain] = useState("Base_Sepolia");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [view, setView] = useState<View>("form");
  const [confirmation, setConfirmation] = useState<ApproveConfirmation | null>(null);
  const [steps, setSteps] = useState<BridgeStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);

  const handleBridge = useCallback(async () => {
    const params: BridgeParams = {
      sourceChain: fromChain,
      destinationChain: toChain,
      amount,
      recipient,
    };

    try {
      validateBridgeParams(params);
    } catch (err: any) {
      setError(err.message);
      return;
    }

    // Pilot route gating on frontend
    if (!isPilotCctpRoute(fromChain, toChain)) {
      setError("Only Ethereum Sepolia → Base Sepolia is available in pilot");
      return;
    }

    // Build pilot-route confirmation (no live quote yet)
    const srcChain = getChainBySdkName(fromChain);
    const dstChain = getChainBySdkName(toChain);

    const rows: [string, string][] = [
      ["Amount", `${amount} USDC`],
      ["Est. max fee", "Fetching..."],
      ["Total approval", "Fetching..."],
      ["Route", `${srcChain?.displayName || fromChain} → ${dstChain?.displayName || toChain}`],
      ["Status", "Pilot route"],
    ];

    setConfirmation({ title: `Approve ${amount} USDC`, rows });
    setView("confirming");
  }, [fromChain, toChain, amount, recipient]);

  const handleConfirm = useCallback(async () => {
    // Validate UCW session
    if (!ucw.isConnected) {
      setError("Connect your UCW wallet first");
      return;
    }

    setView("executing");
    setError(null);

    const params: BridgeParams = {
      sourceChain: fromChain,
      destinationChain: toChain,
      amount,
      recipient,
    };

    // Save activity entry with approve-pending state
    const localId = generateLocalId();
    setActivityId(localId);

    const entry: ActivityEntry = {
      localId,
      createdAt: new Date().toISOString(),
      action: "bridge",
      sourceChain: fromChain,
      destinationChain: toChain,
      amount,
      recipient,
      status: "approve_pending",
      steps: [{ name: "approve", state: "pending" }],
      explorerLinks: [],
      retryable: false,
    };
    saveActivity(entry);
    setSteps(entry.steps);

    // ── Step 1: Call /api/bridge/prepare ──────────────────────────────
    const prepareResult = await prepareBridge({
      ...params,
      userToken: ucw.userToken || "",
      walletId: ucw.wallet?.id || "",
    });

    if (!prepareResult.ok) {
      const errorMsg = prepareResult.error;
      const isUnsupportedRoute = prepareResult.code === "unsupported_route";

      updateActivity(localId, {
        status: "failed",
        error: errorMsg,
        errorCode: prepareResult.code,
        retryable: !isUnsupportedRoute,
      });
      setSteps([{ name: "approve", state: "error", error: errorMsg }]);
      setError(errorMsg);
      setView("error");
      return;
    }

    const prepareData = prepareResult.data;

    // Update activity with plan + challenge IDs (NOT the userToken/encryptionKey)
    updateActivity(localId, {
      planId: prepareData.planId,
      approveChallengeId: prepareData.challengeId,
    });

    // Update confirmation with live fee data
    const transferAmount = formatAtomicUsdc(prepareData.transferAmountAtomic);
    const maxFee = formatAtomicUsdc(prepareData.maxFeeAtomic);
    const burnAmount = formatAtomicUsdc(prepareData.burnAmountAtomic);
    const srcChain = getChainBySdkName(prepareData.sourceChain);
    const dstChain = getChainBySdkName(prepareData.destinationChain);

    setConfirmation({
      title: `Approve ${transferAmount} USDC`,
      rows: [
        ["Amount", `${transferAmount} USDC`],
        ["Est. max fee", `${maxFee} USDC`],
        ["Total approval", `${burnAmount} USDC`],
        ["Route", `${srcChain?.displayName || prepareData.sourceChain} → ${dstChain?.displayName || prepareData.destinationChain}`],
        ["Status", "Pilot route"],
        ["Warning", prepareData.warning],
      ],
    });

    // ── Step 2: Execute approve challenge via UCW SDK ─────────────────
    updateActivity(localId, { status: "approve_submitted" });
    setSteps([{ name: "approve", state: "pending" }]);

    const { error: sdkError, result: sdkResult } = await ucw.executeChallenge(
      prepareData.challengeId,
    );

    // Inspect SDK result shape (do not guess — report exact fields)
    const challengeResult = sdkResult as
      | { type?: string; status?: string; data?: { txHash?: string; signature?: string } }
      | undefined;

    if (sdkError || !challengeResult) {
      // User rejected or SDK error
      const errorMsg = sdkError
        ? (sdkError as { message?: string }).message || "Wallet rejected"
        : "Wallet rejected";

      updateActivity(localId, {
        status: "failed",
        error: errorMsg,
        retryable: false,
      });
      setSteps([{ name: "approve", state: "error", error: errorMsg }]);
      setError(errorMsg);
      setView("error");
      return;
    }

    // SDK result shape (contract execution):
    //   type: ChallengeType (e.g. "CREATE_TRANSACTION")
    //   status: ChallengeStatus (e.g. "COMPLETE", "FAILED")
    //   data: { txHash?, signature?, signedTransaction? } (optional, for SIGN_TRANSACTION)
    //
    // For contract execution challenges, data fields may not be present.
    // We store what exists; do not fabricate txHash.

    const approveTxHash = challengeResult.data?.txHash || undefined;

    updateActivity(localId, {
      status: "approve_confirmed",
      approveTransactionId: challengeResult.type || undefined,
      approveTxHash,
    });
    setSteps([
      {
        name: "approve",
        state: "success",
        txHash: approveTxHash,
      },
    ]);
    setView("success");
  }, [fromChain, toChain, amount, recipient, ucw]);

  const reset = () => {
    setView("form");
    setConfirmation(null);
    setSteps([]);
    setError(null);
    setActivityId(null);
  };

  // ── Executing view ──────────────────────────────────────────────────
  if (view === "executing") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="glass-card p-5 space-y-5">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Approving {amount} USDC
          </h2>
          <ProgressTimeline steps={steps} currentStep="approve" />
        </div>
      </div>
    );
  }

  // ── Success view (approve only) ─────────────────────────────────────
  if (view === "success") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="glass-card p-5 space-y-5">
          <div className="flex flex-col items-center gap-3 py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--mint-glow)", border: "1px solid rgba(124, 255, 178, 0.3)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--mint)" }}>
              Approval Submitted
            </h3>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              USDC approval confirmed
            </p>
          </div>

          <ProgressTimeline steps={steps} />

          <button
            onClick={reset}
            className="w-full py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "var(--mint)",
              color: "#09090E",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Error view ──────────────────────────────────────────────────────
  if (view === "error") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="glass-card p-5 space-y-5">
          <div className="flex flex-col items-center gap-3 py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255, 107, 107, 0.1)", border: "1px solid rgba(255, 107, 107, 0.3)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--danger)" }}>
              {error === "Wallet rejected" ? "Wallet Rejected" : "Approval Failed"}
            </h3>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              {error}
            </p>
          </div>

          <ProgressTimeline steps={steps} />

          <div className="flex gap-2.5">
            <button
              onClick={reset}
              className="w-full py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "var(--surface-elevated)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────
  const bridgeRoutesAvailable = getEnabledBridgeChains().length > 0;

  return (
    <div className="w-full max-w-[420px]">
      <div className="glass-card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Bridge</h2>
          <span
            className="text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(255, 193, 7, 0.1)",
              color: "var(--warning)",
              border: "1px solid rgba(255, 193, 7, 0.2)",
            }}
          >
            Pilot — approve only
          </span>
        </div>

        <div className="pulse-line" />

        {!bridgeRoutesAvailable ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255, 193, 7, 0.1)", border: "1px solid rgba(255, 193, 7, 0.2)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              Bridge execution is disabled until UCW user-signing and route verification are complete.
            </p>
          </div>
        ) : (
        <>
        {/* From */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>From</label>
          <ChainSelector selected={fromChain} onSelect={setFromChain} filter={(c) => c.bridgeEnabled} />
        </div>

        {/* Swap chains */}
        <div className="flex justify-center">
          <button
            onClick={() => { const t = fromChain; setFromChain(toChain); setToChain(t); }}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>To</label>
          <ChainSelector selected={toChain} onSelect={setToChain} filter={(c) => c.bridgeEnabled && c.sdkName !== fromChain} />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Amount</label>
          <AmountInput value={amount} onChange={setAmount} />
          {isHighValue(amount) && (
            <p className="text-[11px]" style={{ color: "var(--warning)" }}>
              High value transfer. Please verify details.
            </p>
          )}
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>Recipient</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full text-sm px-4 py-3 outline-none transition-all duration-200"
            style={{
              background: "var(--surface-elevated)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
            }}
          />
        </div>

        {/* Error */}
        {error && view === "form" && (
          <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleBridge}
          disabled={!amount || !recipient || fromChain === toChain}
          className="w-full py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: "var(--mint)",
            color: "#09090E",
            borderRadius: "var(--radius-sm)",
            boxShadow: amount && recipient ? "0 0 30px var(--mint-glow)" : "none",
          }}
        >
          Bridge USDC
        </button>
        </>
        )}
      </div>

      {/* Confirmation Sheet */}
      {view === "confirming" && confirmation && (
        <ConfirmationSheet
          title={confirmation.title}
          rows={confirmation.rows}
          onConfirm={handleConfirm}
          onCancel={() => setView("form")}
          confirmText="Approve USDC"
        />
      )}
    </div>
  );
}
