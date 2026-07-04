"use client";

import { useRouter } from "next/navigation";
import { StatusChip } from "./StatusChip";
import { formatUsdc, shortenAddress } from "@/lib/format";
import type { ActivityEntry } from "@/lib/activity-store";

type Props = {
  activities: ActivityEntry[];
};

export function ActivityList({ activities }: Props) {
  const router = useRouter();

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {activities.map((entry) => (
        <button
          key={entry.localId}
          onClick={() => router.push(`/activity/${entry.localId}`)}
          className="w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200"
          style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {entry.action === "bridge" ? "Bridge" : entry.action} {formatUsdc(entry.amount)}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              {entry.sourceChain} → {entry.destinationChain}
            </p>
          </div>
          <StatusChip status={entry.status} />
        </button>
      ))}
    </div>
  );
}
