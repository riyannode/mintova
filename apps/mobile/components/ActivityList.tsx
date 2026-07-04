"use client";

import { StatusChip } from "./StatusChip";
import { formatUsdc, shortenAddress } from "@/lib/format";
import type { ActivityEntry } from "@/lib/activity-store";

type Props = {
  activities: ActivityEntry[];
  onSelect?: (entry: ActivityEntry) => void;
};

export function ActivityList({ activities, onSelect }: Props) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#8E929C]">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((entry) => (
        <button
          key={entry.localId}
          onClick={() => onSelect?.(entry)}
          className="w-full bg-[#181B22] rounded-xl border border-[#2A2E38] p-4 flex items-center justify-between hover:border-[#8EA7FF] transition text-left"
        >
          <div>
            <p className="text-sm font-medium text-[#F7F2E8]">
              {entry.action === "bridge" ? "Bridge" : entry.action} {formatUsdc(entry.amount)}
            </p>
            <p className="text-xs text-[#8E929C]">
              {entry.sourceChain} → {entry.destinationChain}
            </p>
            <p className="text-xs text-[#8E929C]">
              {shortenAddress(entry.recipient)}
            </p>
          </div>
          <StatusChip status={entry.status} />
        </button>
      ))}
    </div>
  );
}
