"use client";

import type { BridgeStep } from "@/lib/activity-store";

type Props = {
  steps: BridgeStep[];
  currentStep?: string;
};

const STEP_LABELS: Record<string, string> = {
  approve: "Approve USDC",
  burn: "Burn on source",
  fetchAttestation: "Attestation",
  mint: "Mint on destination",
};

const STEP_ICONS: Record<string, string> = {
  approve: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  burn: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
  fetchAttestation: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  mint: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export function ProgressTimeline({ steps, currentStep }: Props) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const isActive = currentStep === step.name;
        const isComplete = step.state === "success";
        const isError = step.state === "error";
        const isPending = step.state === "pending";

        return (
          <div key={step.name} className="flex items-start gap-3">
            {/* Icon */}
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isComplete
                    ? "var(--mint-glow)"
                    : isError
                    ? "rgba(255, 107, 107, 0.1)"
                    : isActive
                    ? "var(--accent-glow)"
                    : "var(--surface-elevated)",
                  border: `1px solid ${
                    isComplete
                      ? "rgba(124, 255, 178, 0.3)"
                      : isError
                      ? "rgba(255, 107, 107, 0.3)"
                      : isActive
                      ? "rgba(255, 106, 85, 0.3)"
                      : "var(--border)"
                  }`,
                }}
              >
                {isComplete ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isError ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : isActive ? (
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ background: "var(--accent)" }}
                  />
                ) : (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--text-muted)" }}
                  />
                )}
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className="absolute left-4 top-8 w-px h-6"
                  style={{
                    background: isComplete ? "var(--mint)" : "var(--border)",
                  }}
                />
              )}
            </div>

            {/* Label */}
            <div className="flex-1 pt-1">
              <p
                className="text-sm font-medium"
                style={{
                  color: isComplete
                    ? "var(--mint)"
                    : isError
                    ? "var(--danger)"
                    : isActive
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                }}
              >
                {STEP_LABELS[step.name] || step.name}
              </p>
              {step.txHash && (
                <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {step.txHash.slice(0, 10)}...{step.txHash.slice(-6)}
                </p>
              )}
              {step.error && (
                <p className="text-[11px] mt-0.5" style={{ color: "var(--danger)" }}>
                  {step.error}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="pt-1">
              {isComplete && (
                <span className="text-[10px] font-medium px-1.5 py-0.5" style={{
                  color: "var(--mint)",
                  background: "var(--mint-glow)",
                  borderRadius: "var(--radius-full)",
                }}>
                  Done
                </span>
              )}
              {isActive && (
                <span className="text-[10px] font-medium px-1.5 py-0.5" style={{
                  color: "var(--accent)",
                  background: "var(--accent-glow)",
                  borderRadius: "var(--radius-full)",
                }}>
                  Active
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
