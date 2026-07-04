"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getActivities, updateActivity, type ActivityEntry } from "@/lib/activity-store";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { StatusChip } from "@/components/StatusChip";
import { formatUsdc, shortenAddress } from "@/lib/format";
import { getChainBySdkName } from "@/lib/chains";

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<ActivityEntry | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const activities = getActivities();
    const found = activities.find((a) => a.localId === params.id);
    if (found) setEntry(found);
  }, [params.id]);

  const handleRetry = async () => {
    if (!entry) return;
    setRetrying(true);

    try {
      const res = await fetch("/api/bridge/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId: entry.localId,
          sourceChain: entry.sourceChain,
          destinationChain: entry.destinationChain,
          amount: entry.amount,
          recipient: entry.recipient,
        }),
      });
      const data = await res.json();

      const updated: ActivityEntry = {
        ...entry,
        status: data.state === "success" ? "complete" : "failed",
        steps: data.steps || entry.steps,
        error: data.error,
      };
      setEntry(updated);
      updateActivity(entry.localId, updated);
    } catch (err: any) {
      console.error("Retry failed:", err);
    } finally {
      setRetrying(false);
    }
  };

  if (!entry) {
    return (
      <div className="w-full max-w-[420px] text-center py-12">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Activity not found</p>
      </div>
    );
  }

  const srcChain = getChainBySdkName(entry.sourceChain);
  const dstChain = getChainBySdkName(entry.destinationChain);

  return (
    <div className="w-full max-w-[420px]">
      <div className="glass-card p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-xs font-medium"
            style={{ color: "var(--accent)" }}
          >
            Back
          </button>
          <StatusChip status={entry.status} />
        </div>

        <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          {entry.action === "bridge" ? "Bridge" : entry.action} {formatUsdc(entry.amount)}
        </h2>

        <div className="pulse-line" />

        {/* Details */}
        <div className="space-y-2">
          {[
            ["From", srcChain?.displayName || entry.sourceChain],
            ["To", dstChain?.displayName || entry.destinationChain],
            ["Recipient", shortenAddress(entry.recipient, 6)],
            ["Amount", formatUsdc(entry.amount)],
            ["Created", new Date(entry.createdAt).toLocaleString()],
          ].map(([label, value], i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
            </div>
          ))}
        </div>

        <div className="pulse-line" />

        {/* Progress */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
            Progress
          </label>
          <ProgressTimeline steps={entry.steps} />
        </div>

        {/* Error */}
        {entry.error && (
          <div
            className="px-3 py-2 text-xs"
            style={{
              background: "rgba(255, 107, 107, 0.08)",
              border: "1px solid rgba(255, 107, 107, 0.15)",
              borderRadius: "var(--radius-sm)",
              color: "var(--danger)",
            }}
          >
            {entry.error}
          </div>
        )}

        {/* Actions */}
        {entry.status === "failed" && entry.retryable && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {retrying ? "Retrying..." : "Retry Bridge"}
          </button>
        )}

        {/* Explorer links */}
        {entry.steps.some((s) => s.explorerUrl) && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
              Explorer
            </label>
            {entry.steps
              .filter((s) => s.explorerUrl)
              .map((s, i) => (
                <a
                  key={i}
                  href={s.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs font-mono py-1.5 px-3 transition-all duration-200"
                  style={{
                    color: "var(--accent)",
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  {s.name}: {s.txHash?.slice(0, 10)}...
                </a>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
