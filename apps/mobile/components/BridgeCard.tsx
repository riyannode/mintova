"use client";

import { useState, useCallback } from "react";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";
import { ConfirmationSheet } from "./ConfirmationSheet";
import { ProgressTimeline } from "./ProgressTimeline";
import { quoteBridge, executeBridge, buildBridgeConfirmation, type BridgeParams } from "@/lib/bridge";
import { validateBridgeParams } from "@/lib/bridge";
import { isHighValue } from "@/lib/validation";
import { saveActivity, updateActivity, generateLocalId, type ActivityEntry, type BridgeStep } from "@/lib/activity-store";

type View = "form" | "confirming" | "executing" | "success" | "error";

export function BridgeCard() {
  const [fromChain, setFromChain] = useState("Ethereum_Sepolia");
  const [toChain, setToChain] = useState("Base_Sepolia");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [view, setView] = useState<View>("form");
  const [confirmation, setConfirmation] = useState<{ title: string; rows: [string, string][] } | null>(null);
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

    // Get quote and build confirmation
    const quote = await quoteBridge(params);
    const conf = buildBridgeConfirmation(params, quote);
    setConfirmation(conf);
    setView("confirming");
  }, [fromChain, toChain, amount, recipient]);

  const handleConfirm = useCallback(async () => {
    setView("executing");
    setError(null);

    const params: BridgeParams = {
      sourceChain: fromChain,
      destinationChain: toChain,
      amount,
      recipient,
    };

    // Save activity entry
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
      status: "pending",
      steps: [
        { name: "approve", state: "pending" },
        { name: "burn", state: "pending" },
        { name: "fetchAttestation", state: "pending" },
        { name: "mint", state: "pending" },
      ],
      explorerLinks: [],
      retryable: false,
    };
    saveActivity(entry);
    setSteps(entry.steps);

    // Execute bridge
    const result = await executeBridge(params);

    if (result.success) {
      setSteps(result.steps);
      updateActivity(localId, {
        status: "complete",
        steps: result.steps,
      });
      setView("success");
    } else {
      setSteps(result.steps);
      setError(result.error || "Bridge failed");
      updateActivity(localId, {
        status: "failed",
        steps: result.steps,
        error: result.error,
        retryable: true,
      });
      setView("error");
    }
  }, [fromChain, toChain, amount, recipient]);

  const handleRetry = useCallback(async () => {
    if (!activityId) return;
    setView("executing");
    setError(null);

    const res = await fetch("/api/bridge/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId }),
    });
    const result = await res.json();

    if (result.state === "success") {
      setSteps(result.steps);
      updateActivity(activityId, { status: "complete", steps: result.steps });
      setView("success");
    } else {
      setSteps(result.steps);
      setError(result.error);
      updateActivity(activityId, { status: "failed", steps: result.steps, error: result.error });
      setView("error");
    }
  }, [activityId]);

  const reset = () => {
    setView("form");
    setConfirmation(null);
    setSteps([]);
    setError(null);
    setActivityId(null);
  };

  // Executing view
  if (view === "executing") {
    return (
      <div className="w-full max-w-[420px]">
        <div className="glass-card p-5 space-y-5">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            Bridging {amount} USDC
          </h2>
          <ProgressTimeline steps={steps} currentStep={steps.find(s => s.state === "pending")?.name} />
        </div>
      </div>
    );
  }

  // Success view
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
            <h3 className="text-lg font-semibold" style={{ color: "var(--mint)" }}>Bridge Complete</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {amount} USDC bridged successfully
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

  // Error view
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
            <h3 className="text-lg font-semibold" style={{ color: "var(--danger)" }}>Bridge Failed</h3>
            <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
              {error}
            </p>
          </div>

          <ProgressTimeline steps={steps} />

          <div className="flex gap-2.5">
            <button
              onClick={reset}
              className="flex-1 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "var(--surface-elevated)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
              style={{
                background: "var(--accent)",
                color: "var(--bg)",
                borderRadius: "var(--radius-sm)",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="w-full max-w-[420px]">
      <div className="glass-card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Bridge</h2>
          <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
            CCTP V2
          </span>
        </div>

        <div className="pulse-line" />

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
      </div>

      {/* Confirmation Sheet */}
      {view === "confirming" && confirmation && (
        <ConfirmationSheet
          title={confirmation.title}
          rows={confirmation.rows}
          onConfirm={handleConfirm}
          onCancel={() => setView("form")}
        />
      )}
    </div>
  );
}
